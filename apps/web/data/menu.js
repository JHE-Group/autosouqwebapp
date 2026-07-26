/**
 * Public navigation.
 *
 * The template shipped its own demo index here: "Home Page 01" through "10",
 * "Listing grid V1/V2", "Listing map V1/V2" and "Listing detail V1"–"V5", all
 * pointing at near-identical copies of the same content. On a site whose entire
 * proposition is that it is trustworthy, a menu that reads like an unfinished
 * theme demo undermines the pitch before a buyer sees a single car — and it
 * split every listing across five competing URLs.
 *
 * The demo routes are gone; this is now the navigation of an actual service:
 * browse, sell, learn, get help.
 */

// Kept as an empty export: several header components map over it. An empty
// array renders no dropdown, which is what we want now there is one home page.
export const homepages = [];

export const listingPages = [
  {
    className: "dropdown2",
    title: "Browse",
    links: [
      { href: "/used-cars", text: "All used cars" },
      { href: "/listing-list", text: "List view" },
      { href: "/listing-grid-map", text: "Map view" },
    ],
  },
];

export const otherPages = [
  { href: "/how-it-works", text: "How it works" },
  { href: "/sell-your-car", text: "Sell your car" },
  { href: "/guides", text: "Guides" },
  { href: "/about-us", text: "About us" },
  { href: "/faq", text: "FAQs" },
  { href: "/contact", text: "Contact" },
];

export const blogPages = [];
