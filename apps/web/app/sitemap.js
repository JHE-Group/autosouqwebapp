import {
  absoluteUrl,
  CANONICAL_LISTINGS_PATH,
  listingPath,
  localizedPath,
} from "@/lib/seo";
import { blogPath, liveBlogCategories, postsInOrder } from "@/data/blog";
import { blogCategoryPath } from "@/data/blog/categories";
import { guidePath, guidesInOrder } from "@/data/guides";
import { DEFAULT_LOCALE, INDEXABLE_LOCALES } from "@/i18n/routing";
import {
  USED_CARS_FACETS,
  facetClearsGate,
  facetPath,
} from "@/data/usedCarsFacets";
import { getListings } from "@/lib/strapi";

/**
 * XML sitemap, served at /sitemap.xml by Next's file convention.
 *
 * What is deliberately NOT in here:
 *
 * - **Dashboard routes** (`/dashboard`, `/my-*`, `/change-password`,
 *   `/message`). Private; robots.js disallows *and* the layout sets noindex.
 * - **`/add-listing`** — the public sell form. Excluded for a different reason
 *   and by a different mechanism, and the distinction matters:
 *     · Excluded here because it has nothing to rank for. `/sell-your-car`
 *       is the page that explains selling and *is* in the sitemap.
 *     · Kept out of the index by `noindex, follow` on
 *       app/[locale]/(sell)/layout.jsx — **not** by robots.js, which
 *       deliberately no longer disallows it. It is linked from the homepage
 *       hero, the homepage empty state and four blog posts, and blocking a
 *       URL you link to sitewide produces "Indexed, though blocked by
 *       robots.txt" rather than exclusion: the crawler cannot fetch the page,
 *       so it never reads the noindex.
 *   Absence from a sitemap is not an exclusion signal on its own; the meta
 *   directive is what does the work, and it needs the page to be fetchable.
 * - **Theme browse duplicates** (`/listing-grid*`, `/listing-list*`) — they
 *   canonicalise to `/used-cars` and are not nominated.
 * - **Demo catalogue URLs.** Sitemap uses CMS listings only. Empty Strapi ⇒
 *   static + guide URLs only — never `data/cars.js`.
 *
 * A sitemap is a statement of which URLs we want indexed. Listing every
 * near-duplicate would ask Google to choose between them for us — which is the
 * problem, not the fix.
 */
/**
 * Generated per request, because this file makes claims about other URLs.
 *
 * Every other inventory-dependent surface self-heals: the browse pages and the
 * facets revalidate within about a minute, and the facets 404 as soon as they
 * drop below MIN_LISTINGS_FOR_FACET. The sitemap was the one place that could
 * keep nominating a URL after the site had decided it should not exist, and the
 * one place that would not nominate a car a moderator had just published.
 *
 * `export const revalidate` does NOT fix that here, which is worth recording
 * because it looks like it should. A metadata route is emitted as a fully
 * static asset — `next build` still reports it as `○ /sitemap.xml` with the
 * export present, not `●` like the pages beside it — and on Vercel it is served
 * with `x-vercel-cache: HIT` and no `x-nextjs-stale-time` header at all. It was
 * measured stale at age 399s against a 300s window, while /en/used-cars in the
 * same minute carried `x-nextjs-stale-time: 300` and revalidated correctly.
 * Both observations were made against production on 2026-08-04, after a
 * published listing failed to appear here for six minutes.
 *
 * So: dynamic. The cost is one Strapi call per request for a document only
 * crawlers ask for, which at this catalogue's size is a single paginated fetch.
 * The alternative is a sitemap that is only ever correct immediately after a
 * deploy.
 */
export const dynamic = "force-dynamic";

export default async function sitemap() {
  // CMS only. Demo fallback is for the UI; nominating fake cars in the sitemap
  // would ask Google to index inventory that does not exist.
  const listings = await getListings(DEFAULT_LOCALE);

  const lastModified = new Date();

  const facetRoutes = USED_CARS_FACETS.filter((facet) =>
    facetClearsGate(listings, facet),
  ).map((facet) => ({
    path: facetPath(facet.slug),
    changeFrequency: "daily",
    priority: 0.85,
    lastModified,
  }));

  const staticRoutes = [
    { path: "/", changeFrequency: "daily", priority: 1, lastModified },
    {
      path: CANONICAL_LISTINGS_PATH,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified,
    },
    ...facetRoutes,
    { path: "/about-us", changeFrequency: "monthly", priority: 0.5, lastModified },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5, lastModified },
    { path: "/faq", changeFrequency: "monthly", priority: 0.5, lastModified },
    {
      path: "/sell-your-car",
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified,
    },
    {
      path: "/how-it-works",
      changeFrequency: "monthly",
      priority: 0.5,
      lastModified,
    },
  ];

  const guideRoutes = [
    {
      path: "/guides",
      lastModified: guidesInOrder.reduce(
        (latest, guide) =>
          guide.dateModified > latest ? guide.dateModified : latest,
        guidesInOrder[0].dateModified,
      ),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...guidesInOrder.map((guide) => ({
      path: guidePath(guide.slug),
      lastModified: guide.dateModified,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];

  const blogLatest = postsInOrder.reduce(
    (latest, post) =>
      post.dateModified > latest ? post.dateModified : latest,
    postsInOrder[0]?.dateModified ?? lastModified,
  );

  const blogRoutes = [
    {
      path: "/blog",
      lastModified: blogLatest,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // Categories with no posts are left out — see `categoryHasPosts()`.
    ...liveBlogCategories.map((category) => ({
      path: blogCategoryPath(category.slug),
      lastModified: blogLatest,
      changeFrequency: "weekly",
      priority: 0.5,
    })),
    ...postsInOrder.map((post) => ({
      path: blogPath(post.slug),
      lastModified: post.dateModified,
      changeFrequency: "monthly",
      priority: 0.65,
    })),
  ];

  const listingRoutes = listings
    .filter((car) => car?.id)
    .map((car) => ({
      path: listingPath(car),
      changeFrequency: "weekly",
      priority: car.listingStatus === "sold" ? 0.4 : 0.8,
      lastModified,
    }));

  /**
   * Showroom pages, but only for showrooms that currently have a car live.
   *
   * Derived from the listings already fetched above rather than from a second
   * request to /api/showrooms, which makes the gate automatic: a showroom is in
   * the sitemap exactly when it has stock a buyer can look at. An approved
   * showroom with nothing listed is a page with a name, a badge and an empty
   * grid — thin content we would be asking Google to index, and the same
   * judgement `facetClearsGate` makes for the facet pages.
   *
   * It also means a showroom drops out on its own when its last car sells or is
   * taken down, with no separate bookkeeping to forget.
   */
  const showroomRoutes = [
    ...new Set(
      listings
        .map((car) => car?.showroom?.slug)
        .filter((slug) => typeof slug === "string" && slug.length > 0),
    ),
  ].map((slug) => ({
    path: `/showrooms/${slug}`,
    changeFrequency: "weekly",
    // Below a listing (0.8) and above the static pages. A dealer's page is a
    // real destination, but the cars are what a buyer came for.
    priority: 0.6,
    lastModified,
  }));

  const entries = [
    ...staticRoutes,
    ...guideRoutes,
    ...blogRoutes,
    ...listingRoutes,
    ...showroomRoutes,
  ];

  /**
   * Both trees, each entry carrying the same `alternates.languages` map that
   * `pageMetadata()` puts in the <head>. The two have to agree: a sitemap that
   * nominates a URL whose page does not point back at it is exactly the
   * asymmetry that makes Google drop the whole hreflang cluster.
   *
   * Only the URL count doubles, not the maintenance — the duplicate-layout
   * exclusions above apply per language because they are expressed as paths.
   */
  return INDEXABLE_LOCALES.flatMap((locale) =>
    entries.map((entry) => ({
      url: absoluteUrl(localizedPath(entry.path, locale)),
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      ...(INDEXABLE_LOCALES.length > 1
        ? {
            alternates: {
              languages: {
                ...Object.fromEntries(
                  INDEXABLE_LOCALES.map((l) => [
                    l,
                    absoluteUrl(localizedPath(entry.path, l)),
                  ]),
                ),
                "x-default": absoluteUrl(
                  localizedPath(entry.path, DEFAULT_LOCALE),
                ),
              },
            },
          }
        : {}),
    })),
  );
}
