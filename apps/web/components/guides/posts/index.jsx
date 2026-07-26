import React from "react";
import CheckFinesBeforeBuyingOman from "@/components/guides/posts/CheckFinesBeforeBuyingOman";
import FirstCarOmanExpat from "@/components/guides/posts/FirstCarOmanExpat";
import GccSpecVsAmericanImport from "@/components/guides/posts/GccSpecVsAmericanImport";
import TransferCarOwnershipOman from "@/components/guides/posts/TransferCarOwnershipOman";
import UsedCarScamsOman from "@/components/guides/posts/UsedCarScamsOman";
import CheckFinesBeforeBuyingOmanAr from "@/components/guides/posts/ar/CheckFinesBeforeBuyingOman";
import FirstCarOmanExpatAr from "@/components/guides/posts/ar/FirstCarOmanExpat";
import GccSpecVsAmericanImportAr from "@/components/guides/posts/ar/GccSpecVsAmericanImport";
import TransferCarOwnershipOmanAr from "@/components/guides/posts/ar/TransferCarOwnershipOman";
import UsedCarScamsOmanAr from "@/components/guides/posts/ar/UsedCarScamsOman";

/**
 * slug -> body, joined here rather than in data/guides/index.js so the registry
 * stays pure data: app/sitemap.js reads it to build URLs and has no business
 * pulling a React tree in to do that.
 *
 * This is a switch rather than a `{slug: Component}` lookup on purpose. Looking
 * a component type out of an object during render trips
 * `react-hooks/static-components` — React treats the result as a component
 * created during render, which resets state on every render. A switch returning
 * elements is the same dispatch with none of that.
 *
 * Each guide has an English body and an Arabic one under ./ar. Both must exist
 * for a slug: a guide that renders in English and 404s in Arabic breaks the
 * identical-path-shape requirement hreflang depends on (design/research/
 * arabic-seo-strategy.md §10, gate 1).
 */
export function GuideBody({ slug, locale = "en" }) {
  const ar = locale === "ar";
  switch (slug) {
    case "gcc-spec-vs-american-import":
      return ar ? <GccSpecVsAmericanImportAr /> : <GccSpecVsAmericanImport />;
    case "transfer-car-ownership-oman":
      return ar ? <TransferCarOwnershipOmanAr /> : <TransferCarOwnershipOman />;
    case "used-car-scams-oman":
      return ar ? <UsedCarScamsOmanAr /> : <UsedCarScamsOman />;
    case "check-fines-before-buying-oman":
      return ar ? <CheckFinesBeforeBuyingOmanAr /> : <CheckFinesBeforeBuyingOman />;
    case "first-car-oman-expat":
      return ar ? <FirstCarOmanExpatAr /> : <FirstCarOmanExpat />;
    default:
      return null;
  }
}

/**
 * Every slug that has a body. The route checks this against data/guides before
 * rendering: a registry entry with no body would produce a headline over an
 * empty page, which is the one failure mode worth a 404.
 */
export const GUIDE_BODY_SLUGS = [
  "gcc-spec-vs-american-import",
  "transfer-car-ownership-oman",
  "used-car-scams-oman",
  "check-fines-before-buying-oman",
  "first-car-oman-expat",
];

export function hasGuideBody(slug) {
  return GUIDE_BODY_SLUGS.includes(slug);
}
