import { notFound } from "next/navigation";
import BrowsePage from "@/components/carsListings/BrowsePage";
import {
  USED_CARS_FACETS,
  facetClearsGate,
  getFacet,
  matchFacetListings,
} from "@/data/usedCarsFacets";
import { getBrowseListings } from "@/lib/listingSource";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return USED_CARS_FACETS.map((facet) => ({ facet: facet.slug }));
}

export async function generateMetadata({ params }) {
  const { locale, facet: slug } = await params;
  const facet = getFacet(slug);
  if (!facet) return {};

  const listings = await getBrowseListings(locale);
  if (!facetClearsGate(listings, facet)) {
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

  const listings = await getBrowseListings(locale);
  if (!facetClearsGate(listings, facet)) notFound();

  const matched = matchFacetListings(listings, facet);
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
