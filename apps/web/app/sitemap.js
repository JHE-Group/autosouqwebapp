import { getListings } from "@/lib/strapi";
import { absoluteUrl, CANONICAL_LISTINGS_PATH, listingPath } from "@/lib/seo";
import { guidePath, guidesInOrder } from "@/data/guides";
import { DEFAULT_LOCALE } from "@/i18n/routing";

/**
 * Which locale trees we are willing to have indexed.
 *
 * `/ar` exists and renders, but its content is still English behind an Arabic
 * URL and an `<html lang="ar">`. Nominating those URLs — or emitting an
 * hreflang="ar" that points at them — tells Google something untrue, which is
 * worse than being absent. Add "ar" here in the same deploy that completes
 * messages/ar.json and the Arabic listing copy, not before.
 *
 * See design/research/arabic-seo-strategy.md §9: hreflang is a reciprocal
 * contract, and Search Console stopped reporting hreflang errors in 2022, so
 * nothing will warn you if this is wrong.
 */
const INDEXABLE_LOCALES = ["en"];

/** Prefix a path with a locale segment: "/faq" -> "/en/faq". */
function localised(path, locale) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * XML sitemap, served at /sitemap.xml by Next's file convention.
 *
 * What is deliberately NOT in here:
 *
 * - **Dashboard routes** (`/dashboard`, `/my-*`, `/add-listing`,
 *   `/change-password`, `/message`). Private, logged-in, nothing to index.
 *   robots.js disallows them as well.
 * - **`/home02`–`/home10`.** Nine theme layout variants of the same homepage
 *   content at nine URLs. They canonicalise to `/`; a sitemap that also
 *   nominated them would contradict that.
 * - **`/listing-detail-v2/[id]`–`v5`.** Same listing, five layouts. Only the
 *   canonical layout (v1) is listed, one URL per car.
 * - **`/listing-grid2`, `/listing-list`, `/listing-grid-map`,
 *   `/listing-list-map`.** Four more views of the identical result set; they
 *   canonicalise to `/listing-grid`.
 *
 * A sitemap is a statement of which URLs we want indexed. Listing every
 * near-duplicate would ask Google to choose between them for us — which is the
 * problem, not the fix.
 */
export default async function sitemap() {
  // getListings() swallows its own errors and returns [] when Strapi is down,
  // so a CMS outage costs us the listing URLs, never the build. The static
  // block below is computed independently and always ships.
  const listings = await getListings();

  const lastModified = new Date();

  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    // The browse page — the most valuable non-home URL on the site, because it
    // is what "used cars for sale in Oman" should land on.
    { path: CANONICAL_LISTINGS_PATH, changeFrequency: "daily", priority: 0.9 },
    { path: "/about-us", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  ].map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Guides. Unlike the static routes above, these carry a real `lastModified`:
  // data/guides/index.js holds a hand-maintained `dateModified` per guide, which
  // is the same date rendered on the page and in its Article JSON-LD. A lastmod
  // Google can check against the visible page is one it can trust; a build-time
  // `new Date()` on every guide would be a freshness claim we could not defend.
  const guideRoutes = [
    {
      url: absoluteUrl("/guides"),
      lastModified: guidesInOrder.reduce(
        (latest, guide) => (guide.dateModified > latest ? guide.dateModified : latest),
        guidesInOrder[0].dateModified
      ),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...guidesInOrder.map((guide) => ({
      url: absoluteUrl(guidePath(guide.slug)),
      lastModified: guide.dateModified,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];

  const listingRoutes = listings
    .filter((car) => car?.id)
    // A sold car keeps its page (the URL stays valid, and the price history is
    // honest) but stops being something we ask Google to prioritise crawling.
    .map((car) => ({
      url: absoluteUrl(listingPath(car.id)),
      // No lastModified: toCar() in lib/strapi.js does not carry the CMS
      // `updatedAt` through, and a fabricated "modified today" on every listing
      // is worse than none — Google discounts lastmod it finds unreliable.
      // Two-line fix in lib/strapi.js, then set it here.
      changeFrequency: "weekly",
      priority: car.listingStatus === "sold" ? 0.4 : 0.8,
    }));

  const entries = [...staticRoutes, ...guideRoutes, ...listingRoutes];

  // One entry per indexable locale. While that is a single locale this is a
  // straight rewrite; when "ar" joins, each URL also gains its `alternates`
  // languages map, which is how Google is told the two are translations.
  return INDEXABLE_LOCALES.flatMap((locale) =>
    entries.map((entry) => ({
      ...entry,
      url: absoluteUrl(localised(new URL(entry.url).pathname, locale)),
      ...(INDEXABLE_LOCALES.length > 1
        ? {
            alternates: {
              languages: Object.fromEntries(
                INDEXABLE_LOCALES.map((l) => [
                  l,
                  absoluteUrl(localised(new URL(entry.url).pathname, l)),
                ])
              ),
            },
          }
        : {}),
    }))
  );
}
