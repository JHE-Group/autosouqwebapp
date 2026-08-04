import { NextResponse } from "next/server";
import { foldDigits } from "@/lib/format";
import { slugifyTitle } from "@/lib/slugifyTitle";
import { getSession, getToken } from "@/lib/auth";

/**
 * Create a listing on behalf of the signed-in seller.
 *
 * The browser cannot post to the CMS — `connect-src 'self'` — and should not be
 * trusted to anyway, so this is the only door. It reads the session cookie,
 * trades it for an access token, maps the form to the Listing content type and
 * forwards it.
 *
 * It sets no ownership, no publish state and no `verified` flag. All three are
 * decided in the CMS by src/api/listing/controllers/listing.ts, which stamps
 * the seller from the token, forces the draft state and strips the editorial
 * fields. Anything this handler asserted about them would either be ignored or,
 * worse, be the only thing enforcing them.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 15000;
// Ten phone photos over Omani mobile data is a different order of wait from a
// JSON post, and timing out mid-upload would tell a seller their listing failed
// after they had already sent the expensive part.
const UPLOAD_TIMEOUT_MS = 60000;

/** The enum the CMS accepts. Anything else is dropped rather than guessed at. */
const IMPORT_ORIGINS = new Set(["gcc", "us-import", "japan-import", "other"]);

/**
 * Attach make, model and city as real taxonomy relations.
 *
 * ## Why this is not optional
 *
 * A listing's public URL is built from its RELATIONS, not from its `slug`
 * column: lib/seo.js `listingSlug` composes `{id}-{make}-{model}-{year}-{city}`,
 * and lib/resolveListing.js only ever matches on that or on a bare id — it never
 * looks at the CMS `slug` field.
 *
 * So a submission without relations produced a listing that browse linked to and
 * that 404'd on arrival. Every one of them. A seller filed a car, a moderator
 * published it, it appeared in the listings, and the link was dead. Verified
 * across six seller-created listings before this existed.
 *
 * Relations also decide facet membership, so an unrelated listing never counts
 * towards /used-cars/muscat and never appears in a filtered view. It is present
 * in the catalogue and absent from every route into it.
 *
 * ## Matching, and what happens when it fails
 *
 * By slug, then by English name, then by Arabic name — each after
 * normalisation. A miss leaves the field unset rather than failing the
 * submission: a seller whose make is not yet in our list should still be able to
 * file the car, and the moderator who reviews every draft can attach it.
 * Blocking them would trade a broken URL for a lost listing.
 */

/**
 * Fold the spellings of one word together so two people typing the same car
 * match the same row.
 *
 * Arabic has several ways to write characters that a reader treats as
 * identical, and a phone keyboard picks whichever the seller's habit produces:
 *
 *   أ إ آ ٱ   all alef, all typed for the same sound
 *   ة / ه     ta marbuta, routinely written as plain ha
 *   ى / ي     alef maqsura, routinely written as plain ya
 *   ً ٌ ٍ َ ...  diacritics, usually absent but sometimes not
 *   ـ         tatweel, a decorative stretch with no meaning
 *   ٠-٩       Arabic-Indic digits, the same numbers as 0-9
 *
 * Without folding, تويوتا and طويوطا are different strings and one of them
 * silently loses its make. `NFKC` first so a composed character and its
 * decomposed twin agree before any of the rest applies.
 */
function normalizeForMatch(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "") // diacritics + tatweel
    .replace(/[أإآٱ]/g, "ا") // alef forms -> ا
    .replace(/ة/g, "ه") // ة -> ه
    .replace(/ى/g, "ي") // ى -> ي
    .replace(/[٠-٩]/g, (d) =>
      String(d.charCodeAt(0) - 0x0660),
    ) // ٠-٩ -> 0-9
    .replace(/[۰-۹]/g, (d) =>
      String(d.charCodeAt(0) - 0x06f0),
    ) // Persian digits, which some keyboards emit
    .replace(/[\s‏‎_-]+/g, " ") // collapse space, RTL/LTR marks, separators
    .trim();
}

function pickTaxonomy(rows, value) {
  const wanted = normalizeForMatch(value);
  if (!wanted) return null;
  /*
   * `nameAr` is matched too, and that is the point of this function.
   *
   * It used to compare against `slug` and `name` only — both Latin — on a site
   * whose DEFAULT locale is Arabic and whose stated audience includes
   * Arabic-speaking first-time buyers. A seller who typed تويوتا matched
   * nothing, so `make` was dropped, so the listing composed no URL and 404'd on
   * arrival: exactly the failure this whole file was written to fix, still open
   * for the readers the site is mainly for. The Arabic names were already in
   * the CMS and nothing had ever compared against them.
   */
  const candidates = [
    (r) => r.slug,
    (r) => r.name,
    (r) => r.nameAr,
  ];
  for (const field of candidates) {
    const hit = rows.find((r) => normalizeForMatch(field(r)) === wanted);
    // The whole row, not just the documentId: the caller needs `slug` too, and
    // taxonomy slugs are Latin whatever language the seller typed.
    if (hit) return hit ?? null;
  }
  return null;
}

async function resolveRelations(form) {
  /*
   * Four of these were missing, and they are the four the buyer filters on.
   *
   * The route resolved make, model and city and sent nothing else, so every
   * seller listing reached the CMS with no bodyType, transmission, fuelType or
   * colour — columns that exist, that toCar() maps, and that
   * components/carsListings builds its filter options from. A seller answered
   * "Automatic" and "Petrol" and their car then matched neither the Automatic
   * filter nor the Petrol one, and its card showed no transmission at all.
   *
   * The seven reads cost more than three. The note below on `no-store` already
   * settles that trade: this runs on the rare occasion someone files a car.
   */
  const wanted = [
    ["make", "makes", form.make],
    ["model", "models", form.model],
    ["city", "cities", form.city],
    ["bodyType", "body-types", form.body],
    ["transmission", "transmissions", form.transmission],
    ["fuelType", "fuel-types", form.fuelType],
    ["color", "car-colors", form.color],
    ["condition", "conditions", form.condition],
  ].filter(([, , value]) => String(value ?? "").trim());

  if (!wanted.length) return {};

  const relations = {};
  // Latin slugs for the matched rows, used to compose the public URL.
  const slugs = {};

  for (const [field, collection, value] of wanted) {
    try {
      const res = await fetch(
        `${STRAPI_URL}/api/${collection}?pagination%5BpageSize%5D=100`,
        {
          /*
           * `no-store`, not a revalidate window.
           *
           * The first version cached these for 300s and folded every failure
           * into an empty array, so one flaky lookup silently dropped one
           * relation while its siblings succeeded — observed exactly once, and
           * it produced a listing with a make and a model and no city, which is
           * a URL missing a segment and a facet the car never joins.
           *
           * Three small reads on the rare occasion someone files a car is not a
           * cost worth trading correctness for.
           */
          cache: "no-store",
          signal: AbortSignal.timeout(TIMEOUT_MS),
        },
      );

      if (!res.ok) {
        console.warn(`listing submit: ${collection} lookup failed (${res.status})`);
        continue;
      }

      const rows = (await res.json())?.data ?? [];
      const hit = pickTaxonomy(rows, value);

      if (hit) {
        relations[field] = hit.documentId ?? null;
        if (hit.slug) slugs[field] = String(hit.slug);
      } else {
        // Not an error: a seller may name a make we do not carry yet. Worth a
        // line, because a run of these is the signal to widen the vocabulary.
        console.warn(
          `listing submit: no ${field} matching ${JSON.stringify(String(value))}`,
        );
      }
    } catch (err) {
      // A lookup failing must never cost the seller their submission — the
      // listing lands unrelated and a human attaches it in review. But it is
      // logged, because silently is how the original bug survived.
      console.warn(`listing submit: ${collection} lookup threw — ${err}`);
    }
  }

  return { relations, slugs };
}

/**
 * A chassis number the `vin` column can actually hold, or null.
 *
 * Seventeen characters since the early 1980s, and I, O and Q are never among
 * them — they are excluded precisely because they read as 1 and 0, which is
 * also why a seller copying one off a dusty dashboard plate mistypes them.
 * Folded rather than rejected: this is the same substitution the buyer would
 * make by eye.
 *
 * Anything that is not a well-formed VIN returns null and stays in the
 * description instead. The column is varchar(17); sending 20 characters would
 * fail the create and lose a whole listing over an optional field.
 */
function normalizedVin(value) {
  const raw = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/[IOQ]/g, (c) => (c === "O" || c === "Q" ? "0" : "1"));
  return raw.length === 17 ? raw : null;
}

/** Present only when there is a value — Strapi rejects null on some columns. */
function optional(key, value) {
  return value === null || value === undefined || value === "" ? {} : { [key]: value };
}

/** The form stores the label; the CMS column is an enumeration of short codes. */
const DRIVE_ENUM = {
  "Front-wheel drive (FWD)": "fwd",
  "Rear-wheel drive (RWD)": "rwd",
  "All-wheel drive (AWD)": "awd",
  "Four-wheel drive (4WD)": "four_wd",
};

function toNumber(value) {
  const n = Number(foldDigits(value));
  return Number.isFinite(n) ? n : null;
}

function toInt(value) {
  // Fold first. A client that skipped the form — or an older cached bundle —
  // can still send ٢٧٠٠, and Number("٢٧٠٠") is NaN, which would reject a
  // perfectly good listing at the last step with a message about the price
  // being missing.
  const n = Number(foldDigits(value));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}


/** A short, non-guessable suffix for the collision retry. */
function slugSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Ceilings on what one submission may attach.
 *
 * The form already caps at 10 photos and downscales each to a 1600px edge, so
 * these are not the primary limit — they are what stops a caller who is not
 * using the form. `/api/listings` accepts multipart from a session cookie, and
 * a seller with an account is not the same thing as a seller using our UI.
 *
 * 6 MB per file sits under the CMS's own 12 MB `sizeLimit` (config/plugins.ts)
 * so ours is the error that fires, in our wording. Note nginx in front of
 * Strapi has its own `client_max_body_size` and the smaller always wins — see
 * DEPLOYMENT.md.
 */
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

/**
 * Push the photos to the CMS and return their ids.
 *
 * Uploaded before the listing exists rather than after, on purpose. Media
 * attached afterwards means a second write that can fail on its own, leaving a
 * listing whose gallery is silently empty and a seller who was told it worked.
 * Uploading first inverts the failure: if it breaks, no listing is created and
 * the seller is told to try again, with nothing half-made behind them.
 *
 * The cost is orphaned files if the listing create then fails. That is a
 * housekeeping problem in the media library, not a lie told to a seller.
 */
async function uploadPhotos(files, token) {
  if (!files.length) return { ok: true, ids: [] };

  const body = new FormData();
  for (const file of files) body.append("files", file, file.name);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    // No Content-Type: fetch sets the multipart boundary itself.
    headers: { Authorization: `Bearer ${token}` },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    return {
      ok: false,
      error: payload?.error?.message ?? "Your photos could not be uploaded.",
    };
  }

  const uploaded = await res.json().catch(() => null);
  const ids = Array.isArray(uploaded) ? uploaded.map((f) => f?.id).filter(Boolean) : [];
  return { ok: true, ids };
}

/**
 * Everything the seller said that the Listing type has no column for.
 *
 * `mulkiyaExpiry`, `underLien` and `area` are asked for in the form and do not
 * exist on the content type. Dropping them silently would lose the two facts an
 * Omani buyer asks first — how long the registration has left, and whether the
 * bank still has a claim on the car — so they go into the description, where
 * the human reviewing the draft will see them.
 *
 * English field: the seller is typing free text and we cannot know which
 * language it is in. `descriptionAr` stays empty rather than be filled with
 * possibly-English prose, which is the mistake the original seed made and
 * REPAIR_LISTING_LANGUAGE exists to undo.
 */
function buildDescription(form) {
  const lines = [
    /*
     * Only when it will not fit the column.
     *
     * `vin` got its own column in the 2026-08-04 CMS deploy, and a structured
     * field is what a moderator can search and a buyer can be shown
     * deliberately. But the column is varchar(17) and a seller can type
     * anything — so a value that does not fit still goes into the prose rather
     * than being dropped, or worse, rejecting the whole submission at the last
     * step over a field nobody was required to fill in.
     */
    form.vin && !normalizedVin(form.vin)
      ? `Chassis / VIN (as entered): ${String(form.vin).trim()}`
      : null,
    form.condition ? `Condition: ${form.condition}` : null,
    form.mulkiyaExpiry ? `Mulkiya valid until: ${form.mulkiyaExpiry}` : null,
    form.underLien ? `Under lien: ${form.underLien}` : null,
    [form.city, form.area].filter(Boolean).length
      ? `Location: ${[form.city, form.area].filter(Boolean).join(" — ")}`
      : null,
    form.noKnownFaults
      ? "Known faults: none stated by the seller."
      : form.knownFaults
        ? `Known faults: ${form.knownFaults}`
        : null,
    form.recentWork ? `Recent work: ${form.recentWork}` : null,
    form.reasonForSelling ? `Reason for selling: ${form.reasonForSelling}` : null,
    "",
    "— Submitted by the seller through the website. Not yet verified.",
  ].filter((l) => l !== null);

  return lines.join("\n");
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to list a car." },
      { status: 401 },
    );
  }

  /**
   * Multipart, because the photos travel with it.
   *
   * The fields arrive as one JSON blob under `payload` rather than as
   * individual parts: the form has three dozen of them, and reconstructing
   * their types out of multipart strings — numbers, booleans, empties — is a
   * conversion layer that exists only to be got subtly wrong.
   */
  let form;
  let photos = [];
  try {
    const data = await request.formData();
    form = JSON.parse(data.get("payload") ?? "{}");
    photos = data.getAll("photos").filter((f) => typeof f?.arrayBuffer === "function");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (photos.length > MAX_PHOTOS) {
    return NextResponse.json(
      { ok: false, error: `Please attach no more than ${MAX_PHOTOS} photos.` },
      { status: 400 },
    );
  }

  for (const photo of photos) {
    if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
      // Named rather than generic: a seller who just tried to attach a PDF of
      // the mulkiya needs to know it is the file type, not the file.
      return NextResponse.json(
        { ok: false, error: "Photos must be images — JPEG, PNG, WebP or HEIC." },
        { status: 400 },
      );
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { ok: false, error: "One of your photos is too large. Please use photos under 6 MB." },
        { status: 400 },
      );
    }
  }

  const title =
    (form.title ?? "").toString().trim() ||
    // Make, model, year — matching the catalogue and, more importantly, keeping
    // the derived slug from starting with digits, which resolveListing reads as
    // a numeric id. See the note in AddListing.jsx.
    [form.make, form.model, form.year].filter(Boolean).join(" ").trim();

  const price = toInt(form.price);
  const year = toInt(form.year);
  const mileage = toInt(form.km);
  const whatsapp = (form.whatsapp ?? "").toString().replace(/\D/g, "");

  // The CMS enforces all of this too — the band in lifecycles.ts, the rest in
  // the schema. Checking here as well turns a 400 full of Strapi's phrasing
  // into a sentence the seller can act on, without either side trusting the
  // other to have done it.
  if (!title) {
    return NextResponse.json(
      { ok: false, error: "Add the make, model and year of the car." },
      { status: 400 },
    );
  }
  if (price === null || year === null || mileage === null || !whatsapp) {
    return NextResponse.json(
      { ok: false, error: "Price, year, kilometres and a WhatsApp number are all required." },
      { status: 400 },
    );
  }

  // Resolved before the create, because the relations decide both the public
  // URL and facet membership — see resolveRelations.
  const { relations, slugs } = await resolveRelations(form);

  /*
   * Eleven fields the seller answered used to reach neither a column nor the
   * description. The CMS had somewhere to put every one of them.
   *
   * `driveType` is the odd one: the Select stores what its comment calls "the
   * CMS vocabulary", and for the relation fields that is true — "Automatic"
   * matches the transmission row by name. But driveType is an *enumeration*
   * whose members are fwd / rwd / awd / four_wd, so the stored
   * "Front-wheel drive (FWD)" would be rejected outright. Mapped here rather
   * than changing what the form stores, because the stored string is what the
   * seller sees in their own draft.
   */
  const payload = {
    title,
    price,
    year,
    mileage,
    whatsapp,
    currency: "OMR",
    listingStatus: "available",
    description: buildDescription(form),
    ...relations,
    ...(IMPORT_ORIGINS.has(form.importSpec) ? { importOrigin: form.importSpec } : {}),
    ...optional("doors", toInt(form.doors)),
    ...optional("cylinders", toInt(form.cylinders)),
    ...optional("seats", toInt(form.seats)),
    ...optional("engineSize", toNumber(form.engineSize)),
    ...optional("driveType", DRIVE_ENUM[form.driveType]),
    ...optional("phone", String(form.phone ?? "").trim() || null),
    ...optional("videoUrl", String(form.videoUrl ?? "").trim() || null),
    ...optional("vin", normalizedVin(form.vin)),
  };

  const token = await getToken();
  if (!token) {
    // The cookie exists — getSession passed — but the refresh exchange failed,
    // which means the session was revoked between the two calls or the CMS went
    // down in between. Either way, do not report success.
    return NextResponse.json(
      { ok: false, error: "Your session has expired. Please sign in again." },
      { status: 401 },
    );
  }

  // Photos first: see uploadPhotos for why the failure order matters.
  const uploaded = await uploadPhotos(photos, token);
  if (!uploaded.ok) {
    return NextResponse.json({ ok: false, error: uploaded.error }, { status: 400 });
  }

  const post = (slug) =>
    fetch(`${STRAPI_URL}/api/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          ...payload,
          slug,
          ...(uploaded.ids.length ? { gallery: uploaded.ids } : {}),
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  try {
    /**
     * Always suffixed, because nothing else guarantees a distinct URL.
     *
     * The obvious design is to send the clean slug and suffix only on a
     * collision. That was written, and it does not work: `slug` is a `uid`,
     * which reads as unique, but Strapi does not enforce it on a content-API
     * create. Submitting the same car twice produced two rows both slugged
     * `2018-nissan-sunny` and two `200 OK`s — there is no error to retry on.
     *
     * Titles here are derived from year, make and model, so a duplicate is not
     * an edge case on this site, it is the expected case: "2015 Toyota
     * Corolla" is the most ordinary car in the band. Two of them sharing a slug
     * means `/car/2015-toyota-corolla` resolves to one and the other is simply
     * unreachable.
     *
     * Four characters of noise on a draft URL is the cheaper problem, and a
     * reviewer can shorten it in the admin before publishing — they are opening
     * every draft anyway.
     */
    /*
     * Prefer the resolved taxonomy over the typed title. Both are correct for a
     * seller filing in English; only this one is correct for a seller filing in
     * Arabic, whose title contains no Latin characters at all. It also gives
     * both languages the same URL for the same car, which is what hreflang
     * wants.
     */
    const fromTaxonomy =
      slugs.make && slugs.model
        ? [slugs.make, slugs.model, year].filter(Boolean).join("-")
        : null;
    const slug = `${fromTaxonomy ?? slugifyTitle(title)}-${slugSuffix()}`;
    let res = await post(slug);

    /**
     * Retry without relations if the CMS will not accept them.
     *
     * The relation lookup uses the PUBLIC taxonomy API, so it succeeds against
     * any CMS. Writing the relation needs the Authenticated role to hold
     * `find` on those content types — Strapi's input sanitiser strips relations
     * pointing at a type the caller cannot read, and answers `400 Invalid key
     * make`. That grant ships in the same commit as this file but lands in a
     * different deploy, on a different machine, at a different time.
     *
     * Without this retry, a web deploy that arrives before the CMS deploy
     * breaks submission outright: every seller sees "Invalid key make" and
     * nobody can file a car. Verified by revoking the grant locally and
     * submitting — that is exactly what happens.
     *
     * So: try with relations, fall back to without. The fallback produces the
     * listing this code produced before today — unrelated, and needing a human
     * to attach the taxonomy in review — which is worse than the happy path and
     * far better than a dead form. Logged, because a run of these means the CMS
     * deploy has not landed yet.
     */
    if (res.status === 400 && Object.keys(relations).length) {
      const peek = await res.clone().json().catch(() => null);
      if (/invalid key (make|model|city)/i.test(peek?.error?.message ?? "")) {
        console.warn(
          "listing submit: CMS rejected taxonomy relations — retrying without them. " +
            "The CMS is likely running a build older than the permission grant.",
        );
        for (const key of Object.keys(relations)) delete payload[key];
        res = await post(slug);
      }
    }

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      /**
       * Pass the CMS's message through.
       *
       * The one that matters is the price band: lifecycles.ts rejects anything
       * over OMR 6,000 with a sentence naming the limit, and that is exactly
       * what the seller needs to read. Replacing it with "something went wrong"
       * would leave them retrying a car this site does not list.
       */
      return NextResponse.json(
        { ok: false, error: body?.error?.message ?? "Could not save your listing." },
        { status: res.status === 401 ? 401 : 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      // No documentId: the draft is not viewable by the seller yet, so an id
      // would only invite a link to a page that 404s until a human publishes it.
      status: "pending-review",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not reach the server. Please try again in a moment." },
      { status: 503 },
    );
  }
}
