import { NextResponse } from "next/server";
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

/** The enum the CMS accepts. Anything else is dropped rather than guessed at. */
const IMPORT_ORIGINS = new Set(["gcc", "us-import", "japan-import", "other"]);

function toInt(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/**
 * Mint the slug ourselves, because Strapi will not.
 *
 * `slug` is a `uid` with `targetField: "title"`, which reads as "Strapi fills
 * this in". It does — in the **admin panel**, where the generation is a
 * client-side convenience. Over the content API the field simply arrives null,
 * `required: true` notwithstanding: verified by submitting a listing and
 * reading the row back, which came out `slug=<NULL>` with a perfectly good
 * title beside it.
 *
 * That is a silent break rather than a loud one. The listing saves, the seller
 * is told it worked, and the damage only appears when a human publishes it and
 * the car's page is at `/car/` with nothing after the slash.
 *
 * Non-Latin titles collapse to empty here — a seller may well type an Arabic
 * make — so there is a fallback rather than an empty string, which would fail
 * the same way.
 */
function slugify(title) {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || "listing";
}

/** A short, non-guessable suffix for the collision retry. */
function slugSuffix() {
  return Math.random().toString(36).slice(2, 6);
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

  let form;
  try {
    form = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const title =
    (form.title ?? "").toString().trim() ||
    [form.year, form.make, form.model].filter(Boolean).join(" ").trim();

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

  const payload = {
    title,
    price,
    year,
    mileage,
    whatsapp,
    currency: "OMR",
    listingStatus: "available",
    description: buildDescription(form),
    ...(IMPORT_ORIGINS.has(form.importSpec) ? { importOrigin: form.importSpec } : {}),
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

  const post = (slug) =>
    fetch(`${STRAPI_URL}/api/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { ...payload, slug } }),
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
    const res = await post(`${slugify(title)}-${slugSuffix()}`);

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
