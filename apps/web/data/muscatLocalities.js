/**
 * Muscat Governorate places for SEO and listing geography.
 *
 * Sourced from Muscat wilayat geography + high-intent used-car search
 * localities (research pass 2026-07-26). Sub-locality *indexable pages* stay
 * gated — design/seo-research.md §8.4 / §3.4: only `/used-cars/muscat` at
 * launch; neighbourhood URLs unlock when inventory clears the facet gate.
 *
 * Spelling aliases redirect conceptually to the canonical slug (no dual pages).
 */

/** Official wilayats of Muscat Governorate. */
export const MUSCAT_WILAYATS = [
  { slug: "muscat", en: "Muscat", ar: "مسقط" },
  { slug: "muttrah", en: "Muttrah", ar: "مطرح" },
  { slug: "bawshar", en: "Bawshar", ar: "بوشر" },
  { slug: "seeb", en: "Seeb", ar: "السيب" },
  { slug: "al-amarat", en: "Al Amarat", ar: "العامرات" },
  { slug: "quriyat", en: "Quriyat", ar: "قريات" },
];

/**
 * High-intent localities for “cars for sale in …” queries.
 * `priority`: high = first to unlock as facet pages; medium = later.
 */
export const MUSCAT_LOCALITIES = [
  { slug: "muscat", en: "Muscat", ar: "مسقط", priority: "high", parent: "muscat" },
  { slug: "seeb", en: "Seeb", ar: "السيب", priority: "high", parent: "seeb" },
  { slug: "al-mawaleh", en: "Al Mawaleh", ar: "الموالح", priority: "high", parent: "seeb" },
  { slug: "al-khoud", en: "Al Khoud", ar: "الخوض", priority: "high", parent: "seeb" },
  { slug: "al-maabilah", en: "Al Maabilah", ar: "المعبيلة", priority: "high", parent: "seeb" },
  { slug: "al-khuwair", en: "Al Khuwair", ar: "الخوير", priority: "high", parent: "bawshar" },
  { slug: "bawshar", en: "Bawshar", ar: "بوشر", priority: "high", parent: "bawshar" },
  { slug: "al-ghubrah", en: "Al Ghubrah", ar: "الغبرة", priority: "high", parent: "bawshar" },
  { slug: "azaiba", en: "Azaiba", ar: "العذيبة", priority: "high", parent: "bawshar" },
  { slug: "ruwi", en: "Ruwi", ar: "روي", priority: "high", parent: "muttrah" },
  { slug: "qurum", en: "Qurum", ar: "القرم", priority: "high", parent: "muttrah" },
  { slug: "al-amarat", en: "Al Amarat", ar: "العامرات", priority: "high", parent: "al-amarat" },
  { slug: "muttrah", en: "Muttrah", ar: "مطرح", priority: "medium", parent: "muttrah" },
  { slug: "al-hail", en: "Al Hail", ar: "الحيل", priority: "medium", parent: "seeb" },
  {
    slug: "al-wadi-al-kabir",
    en: "Al Wadi Al Kabir",
    ar: "الوادي الكبير",
    priority: "medium",
    parent: "muttrah",
  },
  { slug: "quriyat", en: "Quriyat", ar: "قريات", priority: "medium", parent: "quriyat" },
];

/** Alias slug → canonical slug. Never ship a second indexable URL for these. */
export const MUSCAT_SLUG_ALIASES = {
  "al-seeb": "seeb",
  "as-seeb": "seeb",
  bausher: "bawshar",
  boushar: "bawshar",
  "al-amerat": "al-amarat",
  ghubra: "al-ghubrah",
  mabela: "al-maabilah",
  "al-mabela": "al-maabilah",
};

/**
 * Listing `location` values that belong on the Muscat governorate lander.
 * Matches the seller city dropdown today (Muscat + Seeb) and wilayat names
 * once inventory starts using them.
 */
export const MUSCAT_LISTING_LOCATIONS = [
  "Muscat",
  "Seeb",
  "Muttrah",
  "Bawshar",
  "Al Amarat",
  "Quriyat",
  "Al Khuwair",
  "Al Ghubrah",
  "Azaiba",
  "Ruwi",
  "Qurum",
  "Al Mawaleh",
  "Al Khoud",
  "Al Maabilah",
  "Al Hail",
  "Al Wadi Al Kabir",
];

export function isMuscatListingLocation(location) {
  if (!location) return false;
  return MUSCAT_LISTING_LOCATIONS.some(
    (name) => name.toLowerCase() === String(location).toLowerCase(),
  );
}

/** High-priority names for on-page “areas we cover” copy (not a link farm). */
export const MUSCAT_AREAS_FOR_COPY = MUSCAT_LOCALITIES.filter(
  (place) => place.priority === "high" && place.slug !== "muscat",
);
