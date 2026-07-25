/**
 * Footer information architecture.
 *
 * Rebuilt from the template's 21-link farm (14 of which pointed at /about-us,
 * with duplicated Terms / Privacy entries and seven brand links that all
 * resolved to the same unfiltered /listing-grid). Optimised for short links:
 * ten links, every one to a real page, with anchor text that says what is on
 * the other side.
 *
 * Removed outright rather than re-pointed, because Autosouq does not have the
 * surface they describe: Careers With Us (pre-launch, no roles), Investors,
 * Corporate Policies, Copyrights, Help center (that is /faq + /contact),
 * Car sales trends (no editorial), Personal loan (we do not offer finance).
 * The "Popular used car" brand column is gone until /listing-grid accepts a
 * make filter — seven links to one identical unfiltered page help nobody.
 *
 * Every href here must resolve to a page under app/. Adding a link without
 * the page is the exact bug this file used to have.
 *
 * The labels are message *keys*, not English strings. They used to be literals,
 * which meant /ar rendered an English footer under a translated header — the
 * one part of the chrome that stayed in the wrong language. Resolve them
 * against the `footer` namespace in messages/{en,ar}.json; adding an entry here
 * without adding both translations will surface as the raw key, which is the
 * intended loud failure.
 */
export const footerData = [
  {
    id: "buy",
    headingKey: "col.buy",
    menuItems: [
      { textKey: "link.usedCarsOman", href: "/listing-grid" },
      { textKey: "link.usedCarsMap", href: "/listing-grid-map" },
      { textKey: "link.howItWorks", href: "/how-it-works" },
    ],
  },
  {
    id: "sell",
    headingKey: "col.sell",
    menuItems: [
      { textKey: "link.sellYourCar", href: "/sell-your-car" },
      { textKey: "link.addListing", href: "/add-listing" },
    ],
  },
  {
    id: "brand",
    headingKey: "col.brand",
    menuItems: [
      { textKey: "link.about", href: "/about-us" },
      { textKey: "link.faq", href: "/faq" },
      { textKey: "link.guides", href: "/guides" },
      { textKey: "link.contact", href: "/contact" },
      { textKey: "link.terms", href: "/terms" },
      { textKey: "link.privacy", href: "/privacy" },
    ],
  },
];
