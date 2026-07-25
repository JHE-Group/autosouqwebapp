import React from "react";
import CheckFinesBeforeBuyingOman from "@/components/guides/posts/CheckFinesBeforeBuyingOman";
import FirstCarOmanExpat from "@/components/guides/posts/FirstCarOmanExpat";
import GccSpecVsAmericanImport from "@/components/guides/posts/GccSpecVsAmericanImport";
import TransferCarOwnershipOman from "@/components/guides/posts/TransferCarOwnershipOman";
import UsedCarScamsOman from "@/components/guides/posts/UsedCarScamsOman";

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
 */
export function GuideBody({ slug }) {
  switch (slug) {
    case "gcc-spec-vs-american-import":
      return <GccSpecVsAmericanImport />;
    case "transfer-car-ownership-oman":
      return <TransferCarOwnershipOman />;
    case "used-car-scams-oman":
      return <UsedCarScamsOman />;
    case "check-fines-before-buying-oman":
      return <CheckFinesBeforeBuyingOman />;
    case "first-car-oman-expat":
      return <FirstCarOmanExpat />;
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
