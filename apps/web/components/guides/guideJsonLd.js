import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { guidePath, guidesInOrder } from "@/data/guides";

/**
 * `Article` JSON-LD for a guide.
 *
 * Held to the same two rules as lib/seo.js: never emit a null, never invent a
 * fact. Every field below is built from a value the guide record actually
 * carries, so there is nothing to compact away — but note what is *absent* and
 * why, because the absences are the honest part:
 *
 * - **No `image`.** Google's article rich result wants one. We do not have
 *   photography for these guides yet, and pointing `image` at the site's Open
 *   Graph card would be claiming an illustration that is not of the subject.
 * - **No `author` Person.** These are written and maintained by the site, not by
 *   a named journalist. A fabricated byline on a page whose entire argument is
 *   "check who is telling you this" would be self-defeating, so the author is
 *   the organisation, which is true.
 * - **No `FAQPage`.** Google removed the FAQ rich result on 2026-05-07, so that
 *   markup now buys no appearance in Search at all — it would be pure weight on
 *   a metered connection. Do not add it back on the strength of an older guide.
 * - **No `speakable`, `wordCount`, `reviewedBy`.** Nothing we cannot stand up.
 *
 * `dateModified` and `datePublished` come from data/guides/index.js and are
 * hand-maintained. They are the same dates rendered visibly on the page, which
 * is the point: the structured data and the copy must not be able to disagree.
 */
export function guideArticleJsonLd(guide) {
  const url = absoluteUrl(guidePath(guide.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    // schema.org allows up to 110 characters here; every h1 in the set is inside
    // that, and the check is worth keeping if the set grows.
    headline: guide.h1.slice(0, 110),
    description: guide.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    inLanguage: "en-OM",
    isAccessibleForFree: true,
    author: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
    },
  };
}

/**
 * `ItemList` for the guides index — the machine-readable version of the list a
 * reader sees, in the same order.
 *
 * `CollectionPage` is deliberately not wrapped around it: it adds a type and no
 * information. `ItemList` with real names and URLs is the part a consumer can
 * use.
 */
export function guidesItemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl("/guides")}#guides`,
    name: `Guides — ${SITE_NAME}`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: guidesInOrder.length,
    itemListElement: guidesInOrder.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: guide.h1,
      url: absoluteUrl(guidePath(guide.slug)),
    })),
  };
}
