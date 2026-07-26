import BrowsePage from "@/components/carsListings/BrowsePage";
import { getBrowseListings } from "@/lib/listingSource";
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
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/used-cars",
    locale,
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
