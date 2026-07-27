import BrowsePage from "@/components/carsListings/BrowsePage";
import { getBrowseData, getBrowseListings } from "@/lib/listingSource";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

/**
 * The money browse URL. H1 owns the “under OMR 6,000” price-band query so we
 * do not need a duplicate `/used-cars/under-6000-omr` page
 * (design/seo-research.md §8.3).
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.usedCars" });
  const { isDemo } = await getBrowseData(locale);
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/used-cars",
    locale,
    /**
     * The hub still renders on an empty CMS — unlike a facet, "used cars in
     * Oman" is a real page whether or not we have stock today, and a 404 here
     * would drop the site's main commercial URL out of the index on any CMS
     * blip. But it must not *claim* to be a catalogue while every car on it is
     * a stand-in from data/cars.js. `follow` so the links out still carry.
     * Inert the moment Strapi has one listing. See lib/listingSource.js.
     */
    ...(isDemo ? { robots: { index: false, follow: true } } : {}),
  });
}

export default async function UsedCarsPage({ params }) {
  const { locale } = await params;
  const listings = await getBrowseListings(locale);
  const t = await getTranslations({ locale, namespace: "browse.hub" });

  return (
    <BrowsePage
      locale={locale}
      listings={listings}
      title={t("title")}
      lead={t("lead")}
      resultsHeading={t("resultsHeading")}
    />
  );
}
