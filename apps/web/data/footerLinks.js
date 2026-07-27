/**
 * Footer information architecture.
 *
 * Short links mean few, descriptive, real destinations — not a city/make farm
 * (design/seo-research.md §9). Every href must resolve under app/.
 *
 * Buy facet links are inventory-gated via `buildFooterData(listings)` so the
 * footer never advertises a `/used-cars/{facet}` URL that would 404.
 *
 * Labels are message keys under the `footer` namespace in messages/{en,ar}.json.
 */

import { footerFacetLinks } from "./usedCarsFacets.js";

/** Static Buy links that always exist. */
const BUY_CORE = [
  // `/listing-grid-map` ("Map view") was here too. It is one of the retired
  // theme layouts and next.config.mjs 308s it to /used-cars, so the footer —
  // which renders on every page, in both locales — was linking sitewide into a
  // permanent redirect that lands on the entry directly above it.
  { textKey: "link.usedCarsOman", href: "/used-cars" },
];

/**
 * One Sell link, pointing at the public page.
 *
 * A second entry, "Add listing", pointed at `/add-listing` — which
 * app/robots.js Disallows and (dashboard)/layout.jsx serves `noindex,
 * nofollow`. A sitewide *followed* link into a robots-blocked URL is how a
 * page ends up "Indexed, though blocked by robots.txt": the crawler is told to
 * follow the link but forbidden from fetching the page, so it never reads the
 * `noindex` and lists the bare URL with no snippet. It was a dead end for
 * buyers too — the dashboard is unwired and persists nothing, so the seller
 * journey that actually works is /sell-your-car, which is already here.
 */
const SELL_ITEMS = [{ textKey: "link.sellYourCar", href: "/sell-your-car" }];

const GUIDE_ITEMS = [
  {
    textKey: "link.guideTransfer",
    href: "/guides/transfer-car-ownership-oman",
  },
  {
    textKey: "link.guideGcc",
    href: "/guides/gcc-spec-vs-american-import",
  },
  { textKey: "link.guides", href: "/guides" },
];

const BRAND_ITEMS = [
  { textKey: "link.about", href: "/about-us" },
  { textKey: "link.blog", href: "/blog" },
  { textKey: "link.faq", href: "/faq" },
  { textKey: "link.howItWorks", href: "/how-it-works" },
  { textKey: "link.contact", href: "/contact" },
  { textKey: "link.terms", href: "/terms" },
  { textKey: "link.privacy", href: "/privacy" },
];

/** Static shape used when inventory is unknown (tests / storybook). */
export const footerData = [
  {
    id: "buy",
    headingKey: "col.buy",
    menuItems: BUY_CORE,
  },
  { id: "sell", headingKey: "col.sell", menuItems: SELL_ITEMS },
  { id: "guides", headingKey: "col.guides", menuItems: GUIDE_ITEMS },
  { id: "brand", headingKey: "col.brand", menuItems: BRAND_ITEMS },
];

/** Full footer columns with gated Buy facet short-links. */
export function buildFooterData(listings) {
  return [
    {
      id: "buy",
      headingKey: "col.buy",
      menuItems: [...BUY_CORE, ...footerFacetLinks(listings)],
    },
    { id: "sell", headingKey: "col.sell", menuItems: SELL_ITEMS },
    { id: "guides", headingKey: "col.guides", menuItems: GUIDE_ITEMS },
    { id: "brand", headingKey: "col.brand", menuItems: BRAND_ITEMS },
  ];
}
