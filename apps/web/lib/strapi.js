import { DEFAULT_LOCALE, pickLocale, pickLocaleWithLang } from "./locale";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/**
 * Placeholder imagery for listings whose gallery is still empty.
 *
 * These are AI-GENERATED stand-ins, not photographs of real cars — see
 * public/assets/images/listings/README.md. A real gallery uploaded in Strapi
 * always wins, so these disappear listing by listing as photos arrive.
 */
const PLACEHOLDER_DIR = "/assets/images/listings";
const PLACEHOLDER_FALLBACK = "/assets/images/car-list/car1.jpg";

function placeholderFor(slug) {
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

function derivedTitle(listing, locale = DEFAULT_LOCALE) {
  const make = label(listing.make, locale);
  const model = label(listing.model, locale);
  if (!make && !model) return null;
  const year = listing.year ? String(listing.year) : null;
  const parts =
    locale === "ar" ? [make, model, year] : [year, make, model];
  return parts.filter(Boolean).join(" ") || null;
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
    driveType: listing.driveType
      ? { fwd: "FWD", rwd: "RWD", awd: "AWD", four_wd: "4WD" }[listing.driveType]
      : null,

    // No seller records in the content model yet — never invent one.
    authorName: null,
    authorImage: null,

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
export async function getListings(locale = DEFAULT_LOCALE) {
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

    return rows.map((l) => toCar(l, locale));
  } catch (err) {
    console.warn(`[strapi] listings unavailable — using demo data. ${err.message}`);
    return [];
  }
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

export { STRAPI_URL };
