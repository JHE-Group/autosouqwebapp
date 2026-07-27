import { allCars } from "@/data/cars";
import { getListingsResult } from "@/lib/strapi";

/**
 * Two questions, deliberately kept apart: *what do we render*, and *what do we
 * claim is true*.
 *
 * They are not the same source, and conflating them is how a launch with an
 * empty — or briefly unreachable — CMS puts invented inventory into Google.
 *
 * `data/cars.js` is a stand-in catalogue of cars that do not exist. Rendering
 * it is intentional: a browse page with nothing on it is a worse first
 * impression than a populated one, and lib/resolveListing.js already tags the
 * *detail* pages `isDemoListing` so they serve `noindex`.
 *
 * But the browse and facet routes were gating **indexability** on that same
 * fallback. With Strapi empty, `/ar/used-cars/gcc-spec` answered `200`,
 * `robots: index, follow`, self-canonical, with a full hreflang set —
 * advertising cars nobody can buy — while app/sitemap.js, which reads the CMS
 * directly, nominated zero facets. Verified against the built app with Strapi
 * stopped. Two of our own systems disagreeing about whether a URL is real is
 * the wrong-signal class i18n/routing.js's INDEXABLE_LOCALES note is about,
 * and here it lands on the highest-intent commercial URLs on the site.
 *
 * So: render from `listings`, decide indexability from `cms`.
 */
export async function getBrowseData(locale) {
  // Next memoizes the underlying fetch per request, so asking twice in one
  // render (generateMetadata *and* the page) costs one round trip.
  const { listings: cms, ok } = await getListingsResult(locale);
  return {
    /** What the page shows — CMS when it has anything, demo cars otherwise. */
    listings: cms?.length ? cms : allCars,
    /** Real inventory only, never demo data. Gate indexability on this. */
    cms: cms ?? [],
    /** True while the visible catalogue is stand-ins rather than real cars. */
    isDemo: !cms?.length,
    /**
     * The CMS did not answer, so we do not know what the inventory is.
     *
     * Distinct from `isDemo`, and the distinction is the whole point: an empty
     * answer is a fact about the catalogue, a failed one is a fact about the
     * network. Treating them alike meant a thirty-second Strapi restart could
     * publish `noindex` on /used-cars and 404 every facet — and, because these
     * routes are ISR, persist that wrong answer into the cache.
     */
    cmsUnavailable: !ok,
  };
}

/**
 * Refuse to render rather than cache a wrong answer.
 *
 * When the CMS is unreachable at *runtime*, throwing is the useful thing to do:
 * Next keeps serving the last good ISR page instead of replacing it with one
 * built on no data. Silence would be worse than an error here — the page would
 * look fine and quietly say the wrong thing about our inventory.
 *
 * During `next build` there is no previous page to keep, so we degrade instead
 * and let the build finish; the routes come back on their first revalidation
 * once the CMS is up.
 */
export function assertCmsAvailable({ cmsUnavailable }, where) {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (cmsUnavailable && !isBuild) {
    throw new Error(
      `[${where}] CMS unreachable — refusing to render an inventory claim from ` +
        "no data. The last good page stays served until the CMS answers again.",
    );
  }
}

/**
 * CMS listings when Strapi has any; otherwise the local demo catalogue.
 * Facet gates and browse pages must use the same source Cars2 falls back to.
 *
 * Rendering only. If you are about to decide whether a URL is indexable, use
 * `getBrowseData` and read `cms`.
 */
export async function getBrowseListings(locale) {
  const { listings } = await getBrowseData(locale);
  return listings;
}
