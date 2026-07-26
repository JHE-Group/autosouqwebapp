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
  { textKey: "link.usedCarsOman", href: "/used-cars" },
  { textKey: "link.usedCarsMap", href: "/listing-grid-map" },
];

const SELL_ITEMS = [
  { textKey: "link.sellYourCar", href: "/sell-your-car" },
  { textKey: "link.addListing", href: "/add-listing" },
];

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
