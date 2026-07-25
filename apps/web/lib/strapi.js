import { DEFAULT_LOCALE, pickLocale } from "./locale";

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

// Taxonomy relations are `{ name, nameAr, slug }`.
function label(relation, locale = DEFAULT_LOCALE) {
  if (!relation) return null;
  return pick(locale, relation.nameAr, relation.name);
}

/**
 * Map a Strapi listing onto the shape the AutoDeal components expect
 * (see `data/cars.js`). Fields the CMS has no column for are left null so
 * the components fall through to their own empty states.
 */
export function toCar(listing, locale = DEFAULT_LOCALE) {
  const gallery = Array.isArray(listing.gallery) ? listing.gallery : [];
  const images = gallery.map((img, i) => ({
    src: absoluteUrl(img.url),
    alt: img.alternativeText || `${listing.title} — image ${i + 1}`,
    width: img.width ?? 615,
    height: img.height ?? 462,
  }));

  return {
    // The theme routes on `id`; the slug is the stable, readable key.
    id: listing.slug,
    documentId: listing.documentId,

    title: pick(locale, listing.titleAr, listing.title),
    description: pick(locale, listing.descriptionAr, listing.description) || "",
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
    imageAlt: images[0]?.alt ?? listing.title,
    images,
    // True only while the listing is running on generated placeholder imagery.
    hasPlaceholderImage: images.length === 0,
  };
}

async function strapiFetch(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 30 },
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
    const json = await strapiFetch(
      `/api/listings?${LISTING_POPULATE}&sort=createdAt:desc&pagination[pageSize]=100`,
    );
    return (json.data ?? []).map((l) => toCar(l, locale));
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
