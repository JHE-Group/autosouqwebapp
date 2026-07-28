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
 *   `/message`). Private; robots.js disallows + layout noindex.
 * - **The public add-listing form** (`/add-listing`). It is noindex/follow and
 *   crawlable so search engines can read that directive.
 * - **Theme browse duplicates** (`/listing-grid*`, `/listing-list*`) — they
 *   canonicalise to `/used-cars` and are not nominated.
 * - **Demo catalogue URLs.** Sitemap uses CMS listings only. Empty Strapi ⇒
 *   static + guide URLs only — never `data/cars.js`.
 *
 * A sitemap is a statement of which URLs we want indexed. Listing every
 * near-duplicate would ask Google to choose between them for us — which is the
 * problem, not the fix.
 */
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

  const entries = [
    ...staticRoutes,
    ...guideRoutes,
    ...blogRoutes,
    ...listingRoutes,
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
