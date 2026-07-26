/**
 * The header's view of data/menu.js.
 *
 * menu.js is the site-wide navigation source and is owned elsewhere; this file
 * only decides how the header renders it, and is shared by the desktop Nav and
 * the mobile offcanvas so the two can never drift apart again (they were two
 * hand-maintained copies of the same tree, and had already diverged).
 *
 * Two decisions live here:
 *
 * 1. **"Browse" is a real link, not a dead `href="#"` toggle.** It points at
 *    /used-cars — the canonical browse page — and the dropdown offers the
 *    alternate presentations of that same result set. A parent that goes
 *    nowhere is unusable by keyboard and by touch, where there is no hover.
 *
 * 2. **"How it works" sits inside Browse.** The agreed top level is
 *    Browse / Sell your car / Guides / About / FAQs / Contact — six items. It
 *    is still a top-level link in the footer.
 */

import { listingPages, otherPages } from "@/data/menu";

/** href → key in the `nav` message namespace. */
const LABEL_KEYS = {
  "/used-cars": "allUsedCars",
  "/listing-list": "listView",
  "/listing-grid-map": "mapView",
  "/how-it-works": "howItWorks",
  "/sell-your-car": "sellYourCar",
  "/guides": "guides",
  "/about-us": "about",
  "/faq": "faq",
  "/contact": "contact",
};

/** Pulled out of the flat list and shown under Browse instead. */
const NESTED_UNDER_BROWSE = ["/how-it-works"];

const BROWSE_HREF = "/used-cars";

/**
 * Build the header tree.
 *
 * @param {(key: string) => string} translate `useTranslations("nav")`.
 * @returns {Array<{href: string, labelKey: string, label: string,
 *                  children?: Array<{href: string, label: string}>}>}
 */
export function buildNavTree(translate) {
  const label = (item) => {
    const key = LABEL_KEYS[item.href];
    // menu.js's own English text is the fallback, so adding a page there
    // without a translation renders the page rather than a missing-key crash.
    return key ? translate(key) : item.text;
  };

  const browseGroup = listingPages[0];
  const browseChildren = [
    ...(browseGroup?.links ?? []).map((link) => ({
      href: link.href,
      label: label(link),
    })),
    ...otherPages
      .filter((item) => NESTED_UNDER_BROWSE.includes(item.href))
      .map((item) => ({ href: item.href, label: label(item) })),
  ];

  const topLevel = otherPages
    .filter((item) => !NESTED_UNDER_BROWSE.includes(item.href))
    .map((item) => ({ href: item.href, label: label(item) }));

  return [
    {
      href: BROWSE_HREF,
      label: translate("browse"),
      children: browseChildren,
    },
    ...topLevel,
  ];
}

/**
 * Whether `href` is the page currently being viewed, or an ancestor of it.
 *
 * Compared on the first path segment only, because /guides/used-car-scams-oman
 * should still light up "Guides". `pathname` here is next-intl's, so the
 * locale prefix is already stripped.
 */
export function isCurrent(href, pathname) {
  const segment = (value) => value.split("/")[1] ?? "";
  return segment(href) !== "" && segment(href) === segment(pathname);
}

/** True when the item or any of its children is the current page. */
export function isBranchCurrent(item, pathname) {
  if (isCurrent(item.href, pathname)) return true;
  return (item.children ?? []).some((child) => isCurrent(child.href, pathname));
}
