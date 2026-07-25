/**
 * The guides registry — one record per published guide.
 *
 * This file is deliberately *pure data*: no JSX, no imports. Three consumers
 * read it and none of them should have to pull a React tree in to do their job:
 *
 *   - app/(guides)/guides/page.jsx        the index
 *   - app/(guides)/guides/[slug]/page.jsx the route, its metadata and its JSON-LD
 *   - app/sitemap.js                      the XML sitemap
 *
 * The bodies live in components/guides/posts and are joined to these records by
 * slug in components/guides/posts/index.js.
 *
 * Dates
 * -----
 * `datePublished` and `dateModified` are ISO-8601 dates (YYYY-MM-DD). They are
 * hand-maintained, and that is on purpose: a build-time `new Date()` would stamp
 * every guide as modified on every deploy, which is a freshness claim we would
 * not be able to defend. **Bump `dateModified` when you change the words, not
 * when you change the CSS.**
 *
 * `verifiedOn` is a *different and stronger* claim than `dateModified`: it is
 * the day someone last re-read the cited ROP / official pages and confirmed the
 * procedure on this guide still matches them. Guides that make no procedural
 * claim have no `verifiedOn`. Both are rendered visibly on the page — a reader
 * making a decision about OMR 3,000 is entitled to know how old our information
 * is, and a guide to a process the ROP changed in 2023 and may change again is
 * exactly the kind of page that rots quietly.
 *
 * Ordering
 * --------
 * `order` is the research priority from design/research/blog-keyword-briefs.md
 * §6, not publication date. The index renders in this order.
 */

/** ISO date the whole current set was last checked against its sources. */
export const GUIDES_VERIFIED_ON = "2026-07-25";

export const guides = [
  {
    order: 1,
    slug: "gcc-spec-vs-american-import",
    // Metadata title. The root layout appends " | Autosouq.om" — never repeat it.
    title: "GCC spec or American import? How to tell, in Oman",
    h1: "GCC spec or American import? How to tell, in Oman",
    description:
      "A checklist you can run in the car park before you pay: what the door-jamb label proves, what the chassis number does and does not tell you, and why “the VIN starts with W” is wrong.",
    summary:
      "The checks that actually prove where a car was built to be sold — and the popular VIN rule that proves nothing at all.",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
  },
  {
    order: 2,
    slug: "transfer-car-ownership-oman",
    title: "How to transfer a car into your name in Oman",
    h1: "How to transfer a car into your name in Oman",
    description:
      "The ROP mulkiya transfer in plain language: the conditions that must be true first, the 24-hour signing window, and the three situations that stop a transfer dead after you have paid.",
    summary:
      "What the ROP’s own page tells you, plus the parts it leaves out: the 24-hour window, unpaid fines, older cars and mortgaged cars.",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
    verifiedOn: "2026-07-25",
  },
  {
    order: 3,
    slug: "used-car-scams-oman",
    title: "Used-car scams in Oman: the patterns and how to shut each one down",
    h1: "Used-car scams in Oman: the patterns, and how to shut each one down",
    description:
      "The scam patterns that run on car listings in Oman, what each one sounds like, and the sentence to send back — including the phishing case Oman Observer documented in October 2025.",
    summary:
      "One rule defeats most of them. Here is the rule, the patterns it defeats, and what to reply when you meet one.",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
  },
  {
    order: 4,
    slug: "check-fines-before-buying-oman",
    title: "Check the car, not just the seller: fines, restrictions and loans",
    h1: "Check the car, not just the seller: fines, restrictions and loans in Oman",
    description:
      "Fines and restrictions follow the vehicle, not the person, and they will block your transfer after you have paid. How to check all three with the seller standing next to you.",
    summary:
      "Three things can block your transfer after the money has moved. All three are checkable in about ten minutes, before it does.",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
    verifiedOn: "2026-07-25",
  },
  {
    order: 5,
    slug: "first-car-oman-expat",
    title: "Your first car in Oman: the complete expat walkthrough",
    h1: "Your first car in Oman: the complete expat walkthrough",
    description:
      "Buying your first car in Oman on a resident visa: what to sort before you start, where people actually buy, what to inspect, and the paperwork order that trips up first-time buyers.",
    summary:
      "Start to finish for a first car in the OMR 1,500–6,000 band, written for someone who has not done this in Oman before.",
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
  },
];

/** Index order for the hub and the sitemap. */
export const guidesInOrder = [...guides].sort((a, b) => a.order - b.order);

/** One guide by slug, or undefined — the route turns that into a 404. */
export function getGuide(slug) {
  return guides.find((guide) => guide.slug === slug);
}

/** "/guides/gcc-spec-vs-american-import" */
export function guidePath(slug) {
  return `/guides/${slug}`;
}

/** "25 July 2026" — the form used in the page furniture. */
export function formatGuideDate(iso) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
