/**
 * Indexable `/used-cars/{facet}` landing pages.
 *
 * Rules (design/seo-research.md §8.2–§8.4, §9):
 * - A facet URL only exists when matched inventory clears the gate.
 * - Do not ship synonym duplicates (cheap-cars-muscat ≈ muscat lander;
 *   under-6000-omr ≈ the /used-cars hub H1).
 * - Make pages (toyota/nissan) stay gated until inventory earns them.
 * - Footer links only destinations that are always real pages, plus facets
 *   that pass the gate at build/request time.
 */

import { isMuscatListing } from "./muscatLocalities.js";

/** Minimum matched listings before a facet URL is allowed to exist. */
export const MIN_LISTINGS_FOR_FACET = 5;

/**
 * @typedef {object} UsedCarsFacet
 * @property {string} slug
 * @property {{ en: string, ar: string }} title   <title> / OG (no brand suffix)
 * @property {{ en: string, ar: string }} h1
 * @property {{ en: string, ar: string }} description
 * @property {{ en: string, ar: string }} lead
 * @property {(car: object) => boolean} match
 * @property {boolean} [footer] include in the Buy footer column when gated
 * @property {string} [footerKey] messages key under footer.link.*
 */

/** @type {UsedCarsFacet[]} */
export const USED_CARS_FACETS = [
  {
    slug: "muscat",
    footer: true,
    footerKey: "usedCarsMuscat",
    title: {
      en: "Used cars for sale in Muscat — OMR 1,500–6,000",
      ar: "سيارات مستعملة للبيع في مسقط — 1,500–6,000 ر.ع",
    },
    h1: {
      en: "Used cars for sale in Muscat",
      ar: "سيارات مستعملة للبيع في مسقط",
    },
    description: {
      en: "Browse affordable used cars in Muscat and Seeb, OMR 1,500 to 6,000. Real prices, GCC-spec or import stated, one WhatsApp tap to the seller.",
      ar: "تصفّح سيارات مستعملة بأسعار في المتناول في مسقط والسيب، من 1,500 إلى 6,000 ر.ع. أسعار حقيقية، وتوضيح خليجي أو مستورد، وتواصل واتساب مباشر مع البائع.",
    },
    lead: {
      en: "Cars listed across Muscat Governorate — Muscat, Seeb, Bawshar, Muttrah and nearby areas — in the Autosouq price band.",
      ar: "سيارات معروضة في محافظة مسقط — مسقط والسيب وبوشر ومطرح والمناطق القريبة — ضمن نطاق أسعار أوتوسوق.",
    },
    match: (car) => isMuscatListing(car),
  },
  {
    slug: "under-2000-omr",
    footer: true,
    footerKey: "usedCarsUnder2000",
    title: {
      en: "Used cars under OMR 2,000 in Oman",
      ar: "سيارات مستعملة بأقل من 2,000 ر.ع في عُمان",
    },
    h1: {
      en: "Used cars under OMR 2,000",
      ar: "سيارات مستعملة بأقل من 2,000 ر.ع",
    },
    description: {
      en: "The most affordable used cars on Autosouq — under OMR 2,000, within the site band. Real asking prices and WhatsApp to the seller.",
      ar: "أكثر السيارات المستعملة بأسعار في المتناول على أوتوسوق — أقل من 2,000 ر.ع ضمن نطاق الموقع. أسعار مطلوبة حقيقية وتواصل واتساب مع البائع.",
    },
    lead: {
      en: "Every car here is listed under OMR 2,000. Cars from OMR 1,000–1,499 publish as sold as-is.",
      ar: "كل سيارة هنا معروضة بأقل من 2,000 ر.ع. السيارات من 1,000–1,499 ر.ع تُنشر كـ«تُباع بحالتها».",
    },
    match: (car) => Number(car.price) > 0 && Number(car.price) < 2000,
  },
  {
    slug: "under-3000-omr",
    footer: true,
    footerKey: "usedCarsUnder3000",
    title: {
      en: "Used cars under OMR 3,000 in Oman",
      ar: "سيارات مستعملة بأقل من 3,000 ر.ع في عُمان",
    },
    h1: {
      en: "Used cars under OMR 3,000",
      ar: "سيارات مستعملة بأقل من 3,000 ر.ع",
    },
    description: {
      en: "Affordable used cars in Oman priced under OMR 3,000 (and within the Autosouq band from OMR 1,000). Real asking prices and WhatsApp to the seller.",
      ar: "سيارات مستعملة في عُمان بسعر أقل من 3,000 ر.ع (وضمن نطاق أوتوسوق من 1,000 ر.ع). أسعار مطلوبة حقيقية وتواصل واتساب مع البائع.",
    },
    lead: {
      en: "Every car here is listed under OMR 3,000. Cars from OMR 1,000–1,499 publish as sold as-is.",
      ar: "كل سيارة هنا معروضة بأقل من 3,000 ر.ع. السيارات من 1,000–1,499 ر.ع تُنشر كـ«تُباع بحالتها».",
    },
    match: (car) => Number(car.price) > 0 && Number(car.price) < 3000,
  },
  {
    slug: "gcc-spec",
    footer: true,
    footerKey: "gccSpecCars",
    title: {
      en: "GCC-spec used cars in Oman — OMR 1,500–6,000",
      ar: "سيارات خليجية مستعملة في عُمان — 1,500–6,000 ر.ع",
    },
    h1: {
      en: "GCC-spec used cars",
      ar: "سيارات خليجية مستعملة",
    },
    description: {
      en: "Used cars in Oman stated as GCC spec, in the OMR 1,500–6,000 band. Real prices and one WhatsApp tap to the seller.",
      ar: "سيارات مستعملة في عُمان موضّحة كمواصفات خليجية، ضمن نطاق 1,500–6,000 ر.ع. أسعار حقيقية وتواصل واتساب مع البائع.",
    },
    lead: {
      en: "Only listings where the seller stated GCC spec. Import origin is shown on every Autosouq card.",
      ar: "فقط الإعلانات التي أوضح فيها البائع أنها خليجية. أصل الاستيراد يظهر على كل بطاقة في أوتوسوق.",
    },
    match: (car) => car.importOrigin === "gcc",
  },
];

export function getFacet(slug) {
  return USED_CARS_FACETS.find((facet) => facet.slug === slug);
}

export function facetPath(slug) {
  return slug ? `/used-cars/${slug}` : "/used-cars";
}

export function matchFacetListings(listings, facet) {
  if (!facet) return listings;
  return (listings ?? []).filter((car) => facet.match(car));
}

export function facetClearsGate(listings, facet, min = MIN_LISTINGS_FOR_FACET) {
  return matchFacetListings(listings, facet).length >= min;
}

/** Footer Buy links for facets that currently clear the inventory gate. */
export function footerFacetLinks(listings) {
  return USED_CARS_FACETS.filter(
    (facet) => facet.footer && facetClearsGate(listings, facet),
  ).map((facet) => ({
    textKey: `link.${facet.footerKey}`,
    href: facetPath(facet.slug),
  }));
}
