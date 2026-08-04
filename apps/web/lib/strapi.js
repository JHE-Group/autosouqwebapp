import { DEFAULT_LOCALE, pickLocale, pickLocaleWithLang } from "./locale";
import { composeTitle } from "./listingTitle";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/**
 * Placeholder imagery for listings whose gallery is still empty.
 *
 * These are AI-GENERATED stand-ins, not photographs of real cars — see
 * public/assets/images/listings/README.md. A real gallery uploaded in Strapi
 * always wins, so these disappear listing by listing as photos arrive.
 */
const PLACEHOLDER_DIR = "/assets/images/listings";
// Was `/assets/images/car-list/car1.jpg` — one of the theme's *unfilled*
// placeholders, every pixel #D2D6E2. A 9 KB request to paint a grey box is
// worse than the CSS no-photo state, which costs nothing and says the same
// thing honestly. A listing with no slug now simply has no photo.
const PLACEHOLDER_FALLBACK = null;

/**
 * Whether a listing with no photos may borrow a generated stand-in.
 *
 * **Off in production.** This is the one switch standing between the folder of
 * AI-generated cars and a real seller's listing, and the collision is not
 * hypothetical — it is the likely case. The stand-ins are named by slug, and
 * the ten slugs they carry are the ten most ordinary cars in the band:
 * `toyota-corolla-2015-xli`, `nissan-sunny-2019`, `honda-civic-2013` and so
 * on. Strapi mints a listing's slug from its title automatically, and the
 * gallery is optional. So a real seller who lists a Toyota Corolla 2015 XLI
 * and skips the photos would have been handed a generated photograph of a
 * silver Corolla that does not exist — specific colour, specific wheels,
 * specific body condition — on a car a buyer can go and inspect.
 *
 * public/assets/images/listings/README.md states the rule in three words:
 * "Never let these reach real buyers." The default path broke it.
 *
 * Left on outside production so the site still demos with plausible cards, and
 * openable in production only by someone who sets the variable deliberately —
 * the same shape as `demoSeedingEnabled()` in apps/cms/src/index.ts, and for
 * the same reason.
 */
function placeholdersAllowed() {
  if (process.env.NEXT_PUBLIC_ALLOW_PLACEHOLDER_PHOTOS === "true") return true;
  return process.env.NODE_ENV !== "production";
}

function placeholderFor(slug) {
  if (!placeholdersAllowed()) return null;
  return slug ? `${PLACEHOLDER_DIR}/${slug}.jpg` : PLACEHOLDER_FALLBACK;
}

const LISTING_POPULATE = [
  "populate[gallery]=true",
  "populate[make]=true",
  "populate[model]=true",
  "populate[bodyType]=true",
  "populate[condition]=true",
  "populate[transmission]=true",
  "populate[fuelType]=true",
  "populate[color]=true",
  "populate[city]=true",
  "populate[features]=true",
  // The business, not the account. `seller` is private and stays that way;
  // the showroom record exists so a badge can be shown without it.
  "populate[showroom]=true",
].join("&");

function absoluteUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

/**
 * Which language CMS content renders in.
 *
 * NICHE.md wants Arabic first and English an equal second. This mapper used to
 * implement that as `nameAr || name` on every field — but the app still ships a
 * single English shell (`<html lang="en">` in app/layout.js), so the result was
 * Arabic makes, models and cities set inside English page furniture. That is not
 * Arabic-first; it is mixed-language, and it reads as broken to Arabic and
 * English speakers alike.
 *
 * So: follow the document language. When the `[locale]` routing lands, pass
 * "ar" down from the route segment and the whole page flips together.
 */
export { DEFAULT_LOCALE } from "./locale";
const pick = pickLocale;
const pickWithLang = pickLocaleWithLang;

// Taxonomy relations are `{ name, nameAr, slug }`.
function label(relation, locale = DEFAULT_LOCALE) {
  if (!relation) return null;
  return pick(locale, relation.nameAr, relation.name);
}

/**
 * Build a listing title from structured fields, in the page's own language.
 *
 * A listing title is **derived, never typed**: components/dashboard/AddListing.jsx
 * composes it as `[year, make, model]` and shows the seller the result rather
 * than asking for one. So there is no reason for `titleAr` to be hand-written,
 * and no reason for an Arabic page to fall back to the English title when the
 * make and the model already carry `nameAr`.
 *
 * That fallback was not cosmetic. `car.title` is the `<h1>` on the detail page
 * (components/carDetails/CarDetails1.jsx) and the last breadcrumb, so an empty
 * `titleAr` put an English `<h1>` on an indexed Arabic URL. Generating instead
 * is gate #10 of design/research/arabic-seo-strategy.md §10: every /ar listing
 * gets an Arabic title, h1 and meta description *generated from structured
 * fields*, independent of whether anyone wrote Arabic prose for it.
 *
 * Word order follows the language rather than mirroring the English join:
 * English classifieds lead with the year ("2015 Toyota Corolla"), Gulf Arabic
 * ones lead with the make and put the year last ("تويوتا كورولا 2015").
 *
 * Returns null when there is nothing to build from, so the caller can fall
 * through to the stored title rather than render a stray year on its own.
 */
/**
 * The title stored for *this* language, with no cross-language fallback.
 *
 * Deliberately not `pick()`: that helper falls back in both directions, so
 * `pick("en", titleAr, null)` returns the Arabic title. Here the whole point is
 * to find out whether this language has its own stored title, so that the
 * caller can generate one when it does not.
 */
function storedTitle(listing, locale = DEFAULT_LOCALE) {
  const value = locale === "ar" ? listing.titleAr : listing.title;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Alt text for the nth gallery photo, in the page's own language.
 *
 * Alt text is content, not chrome: it is what a blind buyer hears and what a
 * crawler reads, so an English string inside an Arabic document is the same
 * defect as an English `<h1>` would be.
 */
function galleryAlt(title, n, locale = DEFAULT_LOCALE) {
  const subject = typeof title === "string" && title.trim() ? title.trim() : null;
  if (locale === "ar") {
    return subject ? `${subject} — صورة ${n}` : `صورة السيارة ${n}`;
  }
  return subject ? `${subject} — image ${n}` : `Car photo ${n}`;
}

// Composition — including the make-doubling rule — lives in lib/listingTitle.js
// so scripts/check-title-dedup.mjs can exercise it against the real CMS
// taxonomy without a Next runtime. See that file for why the rule exists.
function derivedTitle(listing, locale = DEFAULT_LOCALE) {
  return composeTitle(
    label(listing.make, locale),
    label(listing.model, locale),
    listing.year,
    locale,
  );
}

/**
 * Map a Strapi listing onto the shape the AutoDeal components expect
 * (see `data/cars.js`). Fields the CMS has no column for are left null so
 * the components fall through to their own empty states.
 */
export function toCar(listing, locale = DEFAULT_LOCALE) {
  /**
   * Resolve the title once, up front, because the gallery needs it too.
   *
   * The alt text below used to interpolate `listing.title` — the *stored
   * English* column — directly. Two bugs fell out of that. On /ar every photo
   * of every car was described to a screen reader in English, on a page whose
   * whole premise is that it is an Arabic page. And when no English title was
   * stored (normal: titles are derived, not typed — see `derivedTitle`), the
   * template stringified `undefined` and shipped `alt="undefined — image 1"`.
   */
  const title =
    storedTitle(listing, locale) ||
    derivedTitle(listing, locale) ||
    pick(locale, listing.titleAr, listing.title);

  const gallery = Array.isArray(listing.gallery) ? listing.gallery : [];
  const images = gallery.map((img, i) => ({
    src: absoluteUrl(img.url),
    // Fall back to the generic noun rather than an empty subject, so a listing
    // with no title anywhere still gets a usable description instead of "— 1".
    alt: img.alternativeText || galleryAlt(title, i + 1, locale),
    width: img.width ?? 615,
    height: img.height ?? 462,
  }));

  return {
    // The theme routes on `id`; the slug is the stable, readable key.
    id: listing.slug,
    documentId: listing.documentId,

    /**
     * Stored title first, generated second, other language last.
     *
     * The order matters. An editor who *has* written a title for this language
     * — usually to add a trim the taxonomy has no column for ("… XLI", "… VX")
     * — should keep it. Everyone else gets a correct title in the right
     * language instead of the other language's, which is what the bare
     * `pick(locale, titleAr, title)` used to do.
     *
     * The final fallback is still cross-language: a listing with no make and
     * no model relation has nothing to generate from, and one real title in
     * the wrong language beats an empty <h1>.
     */
    title,
    /**
     * The seller's own prose, plus which language it turned out to be in.
     *
     * This is the one field that cannot be generated (unlike `title` above) and
     * must not be machine-translated (the site's whole argument is that what you
     * read is what the seller wrote). So when a seller has written only English
     * and the reader is on /ar, the honest move is to show it and say so —
     * `descriptionLang` is what lets components/carDetails/detailComponents/
     * Description.jsx set `lang`/`dir` on the block and label it.
     *
     * `descriptionIsFallback` rather than comparing `descriptionLang` to the
     * page locale at the call site: the comparison is the same every time, and
     * a component that forgets it fails silently, which is the exact failure
     * this field exists to end.
     */
    ...(() => {
      const d = pickWithLang(locale, listing.descriptionAr, listing.description);
      return {
        description: d.value || "",
        descriptionLang: d.lang,
        descriptionIsFallback: d.isFallback,
      };
    })(),
    price: Number(listing.price) || 0,
    currency: listing.currency || "OMR",
    year: listing.year,
    km: listing.mileage,

    make: label(listing.make, locale),
    model: label(listing.model, locale),
    body: label(listing.bodyType, locale),
    type: label(listing.bodyType, locale),
    conditionType: label(listing.condition, locale),
    transmission: label(listing.transmission, locale),
    fuelType: label(listing.fuelType, locale),
    color: label(listing.color, locale),
    location: label(listing.city, locale),
    /**
     * The city's taxonomy slug — locale-independent, always Latin.
     *
     * `location` above is the *display* label and changes with the locale
     * ("Muscat" / "مسقط"). Two things must never change with the locale, and
     * both were reading `location` before this field existed:
     *
     *  - **The listing URL.** design/research/arabic-seo-strategy.md §3 ratifies
     *    Latin slugs in both trees, and §10 gate 1 requires every indexable URL
     *    to exist in both at 200. A city-localised slug gave /ar and /en
     *    different URLs for the same car, so the Arabic tree 308'd on its own
     *    canonical and the hreflang pair pointed at nothing.
     *  - **Facet matching.** `/used-cars/muscat` matched on the English label,
     *    so the Arabic facet found zero cars, failed its inventory gate and
     *    served noindex — one locale indexable, the other not, for the same page.
     */
    citySlug: listing.city?.slug ?? null,
    features: (listing.features ?? [])
      .map((f) => label(f, locale))
      .filter(Boolean),

    featured: Boolean(listing.featured),
    verified: Boolean(listing.verified),
    soldAsIs: Boolean(listing.soldAsIs),
    listingStatus: listing.listingStatus || "available",

    // GCC spec vs US import is one of the four trust promises in NICHE.md.
    // null means the seller has not stated it — which we surface, not hide.
    importOrigin: listing.importOrigin || null,

    whatsapp: listing.whatsapp || null,
    phone: listing.phone || null,
    address: listing.address || null,
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,

    // The theme uses singular keys for these two.
    cylinder: listing.cylinders ?? null,
    door: listing.doors ?? null,
    seats: listing.seats ?? null,
    engineSize: listing.engineSize ?? null,
    /*
     * The chassis number, which the CMS gained a column for on 2026-08-04.
     *
     * Before that it was appended to the description, so it reached the page as
     * prose. Moving it to a column made it structured and invisible in the same
     * commit — stored, never mapped, never rendered — while
     * addListing.review.vinHint still told the seller that adding it "lets a
     * buyer run their own history check". Caught by filing a listing end to end
     * and looking for it on the page.
     */
    vin: listing.vin ?? null,

    /*
     * The showroom that filed this car, or null for a private seller.
     *
     * Attached in the CMS from the seller's own approved record and stripped
     * from anything a seller sends, so its presence here is a fact rather than
     * a claim. Null is the honest default: a pending or declined application
     * reads as a private sale.
     *
     * Only the public fields travel — the relation's owner, CR number and
     * review note are `private` in the schema and never arrive.
     */
    showroom: listing.showroom
      ? {
          name: pick(locale, listing.showroom.nameAr, listing.showroom.name),
          slug: listing.showroom.slug ?? null,
          area: listing.showroom.area ?? null,
        }
      : null,
    driveType: listing.driveType
      ? { fwd: "FWD", rwd: "RWD", awd: "AWD", four_wd: "4WD" }[listing.driveType]
      : null,

    // No seller records in the content model yet — never invent one.
    authorName: null,
    authorImage: null,

    /**
     * `null` rather than a stand-in when placeholders are off. Every card and
     * the gallery already have a no-photo branch — ListingCard renders
     * `.asq-card__img--none`, which costs no request — and "no photo yet" is
     * both true and less misleading than the wrong photo. `hasPlaceholderImage`
     * below still fires, so the buyer is told why the frame is empty.
     */
    imgSrc: images[0]?.src ?? placeholderFor(listing.slug),
    // Same rule as the gallery: the resolved, locale-correct title — not the
    // raw English column, which is what a card on /ar was announcing before.
    imageAlt: images[0]?.alt ?? galleryAlt(title, 1, locale),
    images,
    // True only while the listing is running on generated placeholder imagery.
    hasPlaceholderImage: images.length === 0,
  };
}

/**
 * How long we are willing to wait for the CMS before giving up on it.
 *
 * Every caller below already treats "no answer" as "fall back to demo data",
 * but without a deadline that fallback could never run: `fetch` has no default
 * timeout, so a Strapi that accepts the connection and then stalls holds the
 * request open until the platform kills it. A CMS that is merely *slow* would
 * take the whole storefront down with it, which is the one failure the
 * try/catch here was written to prevent.
 *
 * 5s is well past a healthy Strapi (tens of ms) and well inside the point at
 * which a buyer on a phone has already left.
 */
const STRAPI_TIMEOUT_MS = 5000;

/** Rows per CMS request, and the most pages `getListings` will walk. */
const LISTINGS_PAGE_SIZE = 100;
const MAX_LISTING_PAGES = 20; // 2,000 listings — far beyond launch inventory.

async function strapiFetch(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(STRAPI_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Strapi ${res.status} on ${path}`);
  return res.json();
}

/**
 * Published listings, newest first. Returns `[]` (never throws) when the CMS
 * is unreachable, so pages can fall back to the demo data in `data/cars.js`.
 */
/**
 * Published listings **plus whether the CMS actually answered**.
 *
 * These are not the same question, and collapsing them was a real defect: the
 * old signature returned `[]` for both "the catalogue is empty" and "Strapi is
 * down", so a thirty-second restart was indistinguishable from having no
 * inventory. Everything downstream then acted on the wrong one — /used-cars
 * flipped to `noindex`, every facet 404'd, and each listing URL 404'd — and
 * because those routes are ISR, the wrong answer was written into the cache
 * and served to whoever asked next, including Googlebot.
 *
 * `ok: false` means "we do not know", which is a different thing from "there
 * is nothing". Callers that publish a claim about inventory must check it.
 */
export async function getListingsResult(locale = DEFAULT_LOCALE) {
  try {
    const first = await strapiFetch(
      `/api/listings?${LISTING_POPULATE}&sort=createdAt:desc&pagination[pageSize]=${LISTINGS_PAGE_SIZE}&pagination[page]=1`,
    );
    const rows = [...(first.data ?? [])];

    /**
     * Walk the remaining pages.
     *
     * This used to be a single `pageSize=100` request, which is not a page
     * size so much as a silent cap: Strapi returns the first 100 rows and the
     * 101st listing simply does not exist as far as the site is concerned. It
     * would never 404 or error — the car is absent from /used-cars, absent
     * from every facet, missing from the sitemap, and `/car/{slug}` falls
     * through to the per-slug lookup. On a marketplace whose whole job is to
     * show inventory, "we stopped counting at 100" is a data-loss bug that
     * only appears once the CMS is doing well.
     *
     * `pageCount` comes from Strapi's own meta, and MAX_LISTING_PAGES is a
     * backstop so a malformed meta block cannot spin this loop forever.
     */
    const pageCount = Number(first.meta?.pagination?.pageCount) || 1;
    const lastPage = Math.min(pageCount, MAX_LISTING_PAGES);
    if (pageCount > MAX_LISTING_PAGES) {
      console.warn(
        `[strapi] ${pageCount} pages of listings; reading the first ${MAX_LISTING_PAGES}. Raise MAX_LISTING_PAGES or paginate the browse pages.`,
      );
    }

    if (lastPage > 1) {
      const rest = await Promise.all(
        Array.from({ length: lastPage - 1 }, (_, i) =>
          strapiFetch(
            `/api/listings?${LISTING_POPULATE}&sort=createdAt:desc&pagination[pageSize]=${LISTINGS_PAGE_SIZE}&pagination[page]=${i + 2}`,
          ),
        ),
      );
      rest.forEach((json) => rows.push(...(json.data ?? [])));
    }

    return { listings: rows.map((l) => toCar(l, locale)), ok: true };
  } catch (err) {
    console.warn(`[strapi] listings unavailable — using demo data. ${err.message}`);
    return { listings: [], ok: false };
  }
}

/**
 * Published listings, or `[]` when the CMS cannot be reached.
 *
 * Kept for callers that genuinely cannot act on the difference. **If you are
 * about to decide whether a URL is indexable, or whether to 404, use
 * `getListingsResult` instead** — see the note there.
 */
export async function getListings(locale = DEFAULT_LOCALE) {
  const { listings } = await getListingsResult(locale);
  return listings;
}

/**
 * One listing by slug, falling back to numeric id so the theme's demo links
 * (`/listing-detail-v1/3`) keep resolving. Returns null when not found.
 */
export async function getListing(idOrSlug, locale = DEFAULT_LOCALE) {
  const filter = /^\d+$/.test(String(idOrSlug))
    ? `filters[id][$eq]=${idOrSlug}`
    : `filters[slug][$eq]=${encodeURIComponent(idOrSlug)}`;
  try {
    const json = await strapiFetch(
      `/api/listings?${LISTING_POPULATE}&${filter}&pagination[pageSize]=1`,
    );
    const listing = json.data?.[0];
    return listing ? toCar(listing, locale) : null;
  } catch (err) {
    console.warn(`[strapi] listing "${idOrSlug}" unavailable. ${err.message}`);
    return null;
  }
}

/**
 * One approved showroom by slug, with the cars it has listed.
 *
 * Read through the LIST endpoint with a slug filter rather than
 * `/api/showrooms/{slug}`, because Strapi 5's findOne resolves a documentId and
 * nothing else — a slug there returns null whatever the record's state, which
 * is a 404 for the wrong reason.
 *
 * The list endpoint is the safer of the two anyway. Its controller CLAMPS
 * `filters[state]` to `approved` rather than defaulting it, so a pending or
 * declined application cannot be reached from here even by naming its slug
 * exactly — and pending applications are a record of who applied and was turned
 * down, which is not ours to publish.
 *
 * `null` for both "no such showroom" and "the CMS did not answer". The page
 * turns that into a 404, which is honest in the first case and wrong in the
 * second — but the alternative is rendering a showroom page with no showroom on
 * it, and a transient 404 is the lesser of those on a page nothing links to
 * except a badge that came from the same CMS.
 */
export async function getShowroom(slug, locale = DEFAULT_LOCALE) {
  if (!slug) return null;
  try {
    const json = await strapiFetch(
      `/api/showrooms?filters[slug][$eq]=${encodeURIComponent(slug)}` +
        `&populate[logo]=true&populate[city]=true&pagination[pageSize]=1`,
    );
    const row = json.data?.[0];
    if (!row) return null;

    return {
      // Same locale rule as every other CMS string — see pick() above.
      name: pick(locale, row.nameAr, row.name),
      // The Latin name too: an Arabic page still wants it for the document
      // title and for a buyer searching the business by its registered name.
      nameLatin: row.name ?? null,
      slug: row.slug ?? null,
      about: row.about ?? null,
      area: row.area ?? null,
      city: row.city ? pick(locale, row.city.nameAr, row.city.name) : null,
      citySlug: row.city?.slug ?? null,
      whatsapp: row.whatsapp ?? null,
      logo: absoluteUrl(row.logo?.url) ?? null,
      // Not `createdAt` — that is when the application was made. `publishedAt`
      // is the closest thing the record has to "since when has this been a
      // showroom on the site", and it is the only one worth showing a buyer.
      since: row.publishedAt ?? null,
    };
  } catch (err) {
    console.warn(`[strapi] showroom "${slug}" unavailable. ${err.message}`);
    return null;
  }
}

/**
 * The cars a showroom currently has live.
 *
 * Filtered on the relation's slug, so it asks the same question the URL does.
 * The listings endpoint only ever returns published rows to an anonymous
 * caller, so a draft awaiting moderation does not appear here — which is the
 * behaviour a showroom would want anyway.
 *
 * `[]` on failure, like every other listing read: a showroom page with an empty
 * car list still tells a buyer who the business is and how to reach them.
 */
export async function getShowroomListings(slug, locale = DEFAULT_LOCALE) {
  if (!slug) return [];
  try {
    const json = await strapiFetch(
      `/api/listings?${LISTING_POPULATE}` +
        `&filters[showroom][slug][$eq]=${encodeURIComponent(slug)}` +
        `&sort=createdAt:desc&pagination[pageSize]=${LISTINGS_PAGE_SIZE}`,
    );
    return (json.data ?? []).map((row) => toCar(row, locale));
  } catch (err) {
    console.warn(
      `[strapi] listings for showroom "${slug}" unavailable. ${err.message}`,
    );
    return [];
  }
}

/**
 * The make/model vocabulary, for the sell form's suggestions.
 *
 * Ordered by `id`, which is CREATION order — not the band-prevalence order the
 * seed array is written in.
 *
 * Those differ, and it is worth being exact about why. apps/cms/src/index.ts
 * lists makes by observed prevalence in the OMR 1,000-6,000 band, so Nissan is
 * first. But `findOrCreate` returns early for a row that already exists, and
 * Toyota, Nissan, Honda, Hyundai, Kia, Mitsubishi and Suzuki were created long
 * before that reordering, in the theme demo's order with Toyota first. Their ids
 * are historical and reordering the array does not renumber them. So Toyota
 * leads this list and Nissan follows.
 *
 * Alphabetical would be worse — it opens on BMW — and hardcoding the order here
 * would be the seed's decision copied into a second place to drift from it.
 * Making it genuinely band-ordered needs a `rank` integer on the make content
 * type plus an update path for the rows that already exist, since findOrCreate
 * will not backfill them. Worth doing when the field becomes a real dropdown;
 * not worth a schema migration for the order of a suggestion list.
 *
 * Each make carries its own models, so the form can narrow the model list to
 * the make already chosen without a second request.
 *
 * `nameAr` travels with every row. The sell form runs in Arabic by default, and
 * apps/web/app/api/listings/route.js matches the seller's typed value against
 * slug, name AND nameAr — so offering the Arabic label is what makes the
 * suggestion round-trip into a real relation.
 *
 * Failure returns `[]` rather than throwing. The fields stay free text, which
 * is what they were before this existed: a seller must be able to file a car
 * when the CMS is having a bad minute, and a datalist is a convenience, not a
 * gate.
 */
export async function getMakeVocabulary() {
  try {
    const json = await strapiFetch(
      "/api/makes?populate=models&pagination[pageSize]=100&sort=id:asc",
    );
    return (json.data ?? []).map((make) => ({
      name: make.name ?? "",
      nameAr: make.nameAr ?? "",
      slug: make.slug ?? "",
      models: (make.models ?? [])
        .map((model) => ({
          name: model.name ?? "",
          nameAr: model.nameAr ?? "",
          slug: model.slug ?? "",
        }))
        .filter((model) => model.name),
    })).filter((make) => make.name);
  } catch (err) {
    console.warn(`[strapi] make vocabulary unavailable. ${err.message}`);
    return [];
  }
}

export { STRAPI_URL };
