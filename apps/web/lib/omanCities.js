/**
 * The places a seller can choose, in the order the dropdown shows them.
 *
 * Every one of these now has its own CMS city row. That was not true until
 * 2026-08-04: the form offered 24 places, apps/cms seeded six, and the other 18
 * resolved to nothing — resolveRelations logged a warning and filed the listing
 * anyway by design, so the seller's answer was dropped between the form and the
 * database without anything failing.
 *
 * An earlier version of this file mapped the Muscat-area places onto "Muscat"
 * at write time, to keep them inside the facet. That was the wrong branch of a
 * decision the codebase had already made. data/muscatLocalities.js aggregates
 * them at READ time — `isMuscatListing` matches a listing's citySlug against
 * the sixteen Muscat-area locations and rolls all of them onto
 * /used-cars/muscat — so the facet gate counts a Ruwi car exactly as it counts
 * a Muscat car, and the listing still says Ruwi. Flattening on write passed the
 * same gate and lost the locality permanently, which forecloses the
 * neighbourhood facet pages that file plans for.
 *
 * So: no mapping here. One row per place, and the aggregation stays where it
 * was designed to be. scripts/check-cities.mjs holds the three lists together.
 */

export const OMAN_CITIES = [
  // Muscat Governorate first — highest listing volume (seo-research §3.5).
  { en: "Muscat", ar: "مسقط" },
  { en: "Seeb", ar: "السيب" },
  { en: "Bawshar", ar: "بوشر" },
  { en: "Muttrah", ar: "مطرح" },
  { en: "Al Amarat", ar: "العامرات" },
  { en: "Al Khuwair", ar: "الخوير" },
  { en: "Al Ghubrah", ar: "الغبرة" },
  { en: "Azaiba", ar: "العذيبة" },
  { en: "Ruwi", ar: "روي" },
  { en: "Qurum", ar: "القرم" },
  { en: "Al Mawaleh", ar: "الموالح" },
  { en: "Al Khoud", ar: "الخوض" },
  { en: "Al Maabilah", ar: "المعبيلة" },
  { en: "Quriyat", ar: "قريات" },
  // Rest of Oman
  { en: "Sohar", ar: "صحار" },
  { en: "Barka", ar: "بركاء" },
  { en: "Salalah", ar: "صلالة" },
  { en: "Nizwa", ar: "نزوى" },
  { en: "Sur", ar: "صور" },
  { en: "Ibri", ar: "عبري" },
  { en: "Rustaq", ar: "الرستاق" },
  { en: "Ibra", ar: "إبراء" },
  { en: "Buraimi", ar: "البريمي" },
  { en: "Khasab", ar: "خصب" },
];

