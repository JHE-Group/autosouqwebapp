import { notFound } from "next/navigation";
import BrowsePage from "@/components/carsListings/BrowsePage";
import {
  USED_CARS_FACETS,
  facetClearsGate,
  getFacet,
  matchFacetListings,
} from "@/data/usedCarsFacets";
import { assertCmsAvailable, getBrowseData } from "@/lib/listingSource";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return USED_CARS_FACETS.map((facet) => ({ facet: facet.slug }));
}

/**
 * The facet vocabulary is closed — `USED_CARS_FACETS` is the whole of it, and
 * `generateStaticParams` above enumerates it. Anything else must 404 at the
 * routing layer, before this module runs.
 *
 * With the default (`true`), Next renders unknown params on demand, and the
 * `notFound()` calls below then produced a **soft 404**: verified against the
 * built app, `/ar/used-cars/nonsense-facet` answered `200 OK` with the
 * not-found body, while `/ar/does-not-exist` correctly answered `404`. A 200
 * on an infinite URL space is how a small site burns its crawl budget and gets
 * an unbounded set of near-duplicate thin pages considered for the index — and
 * `noindex` does not undo it, because the crawler has to fetch each one to
 * find that out.
 *
 * Known facets are unaffected: they are in the list, so they still render, and
 * the inventory gate below still decides whether they are worth indexing.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { locale, facet: slug } = await params;
  const facet = getFacet(slug);
  if (!facet) return {};

  // Gate on `cms` — real inventory — not on what the page will render. The
  // demo catalogue clears every one of these gates on its own, so gating on it
  // meant an empty CMS still published four indexable facet pages full of cars
  // that do not exist. See lib/listingSource.js.
  const data = await getBrowseData(locale);
  assertCmsAvailable(data, "used-cars/[facet] metadata");
  if (!facetClearsGate(data.cms, facet)) {
    return { robots: { index: false, follow: true } };
  }

  const lang = locale === "ar" ? "ar" : "en";
  return pageMetadata({
    title: facet.title[lang],
    description: facet.description[lang],
    path: `/used-cars/${facet.slug}`,
    locale,
  });
}

export default async function UsedCarsFacetPage({ params }) {
  const { locale, facet: slug } = await params;
  const facet = getFacet(slug);
  if (!facet) notFound();

  /**
   * Render the demo catalogue, gate on the real one.
   *
   * `notFound()` here still keys off `cms`, so a facet page with no real
   * inventory behind it 404s rather than showing stand-ins — matching what
   * generateMetadata just decided and what app/sitemap.js nominates. The
   * demo fallback exists for `/used-cars`, which is a hub and always exists;
   * a *facet* asserts "there are cars matching this", so it must be true.
   */
  const data = await getBrowseData(locale);
  // A 404 here is a durable claim that this facet has no cars. Never make it
  // on the strength of a failed request.
  assertCmsAvailable(data, "used-cars/[facet]");
  if (!facetClearsGate(data.cms, facet)) notFound();

  const matched = matchFacetListings(data.cms, facet);
  const lang = locale === "ar" ? "ar" : "en";

  return (
    <BrowsePage
      locale={locale}
      listings={matched}
      title={facet.h1[lang]}
      lead={facet.lead[lang]}
      showMuscatAreas={facet.slug === "muscat"}
      resultsHeading={lang === "ar" ? "النتائج" : "Matching cars"}
    />
  );
}
