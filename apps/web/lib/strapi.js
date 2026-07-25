const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

// Shown when a listing has no gallery images yet.
const PLACEHOLDER_IMAGE = "/assets/images/car-list/car1.jpg";

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

// Taxonomy relations are `{ name, nameAr, slug }`. Arabic wins when present,
// since the theme renders these straight into the card.
function label(relation) {
  if (!relation) return null;
  return relation.nameAr || relation.name || null;
}

/**
 * Map a Strapi listing onto the shape the AutoDeal components expect
 * (see `data/cars.js`). Fields the CMS has no column for are left null so
 * the components fall through to their own empty states.
 */
export function toCar(listing) {
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

    title: listing.titleAr || listing.title,
    description: listing.descriptionAr || listing.description || "",
    price: Number(listing.price) || 0,
    currency: listing.currency || "OMR",
    year: listing.year,
    km: listing.mileage,

    make: label(listing.make),
    model: label(listing.model),
    body: label(listing.bodyType),
    type: label(listing.bodyType),
    conditionType: label(listing.condition),
    transmission: label(listing.transmission),
    fuelType: label(listing.fuelType),
    color: label(listing.color),
    location: label(listing.city),
    features: (listing.features ?? []).map(label).filter(Boolean),

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

    // Not in the content model — the theme reads them, so keep the keys.
    cylinder: null,
    door: null,
    authorName: null,
    authorImage: null,

    imgSrc: images[0]?.src ?? PLACEHOLDER_IMAGE,
    imageAlt: images[0]?.alt ?? listing.title,
    images,
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
export async function getListings() {
  try {
    const json = await strapiFetch(
      `/api/listings?${LISTING_POPULATE}&sort=createdAt:desc&pagination[pageSize]=100`,
    );
    return (json.data ?? []).map(toCar);
  } catch (err) {
    console.warn(`[strapi] listings unavailable — using demo data. ${err.message}`);
    return [];
  }
}

/**
 * One listing by slug, falling back to numeric id so the theme's demo links
 * (`/listing-detail-v1/3`) keep resolving. Returns null when not found.
 */
export async function getListing(idOrSlug) {
  const filter = /^\d+$/.test(String(idOrSlug))
    ? `filters[id][$eq]=${idOrSlug}`
    : `filters[slug][$eq]=${encodeURIComponent(idOrSlug)}`;
  try {
    const json = await strapiFetch(
      `/api/listings?${LISTING_POPULATE}&${filter}&pagination[pageSize]=1`,
    );
    const listing = json.data?.[0];
    return listing ? toCar(listing) : null;
  } catch (err) {
    console.warn(`[strapi] listing "${idOrSlug}" unavailable. ${err.message}`);
    return null;
  }
}

export { STRAPI_URL };
