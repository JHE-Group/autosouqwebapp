import BrowsePage from "@/components/carsListings/BrowsePage";
import { getBrowseListings } from "@/lib/listingSource";
import { pageMetadata } from "@/lib/seo";

/**
 * The money browse URL. H1 owns the “under OMR 6,000” price-band query so we
 * do not need a duplicate `/used-cars/under-6000-omr` page
 * (design/seo-research.md §8.3).
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    title: "Used cars in Oman under OMR 6,000",
    description:
      "Browse affordable used cars across Oman, OMR 1,500 to 6,000. Real prices, verified listings, GCC-spec or import stated, and one WhatsApp tap to the seller.",
    path: "/used-cars",
    locale,
  });
}

export default async function UsedCarsPage({ params }) {
  const { locale } = await params;
  const listings = await getBrowseListings(locale);
  const isAr = locale === "ar";

  return (
    <BrowsePage
      locale={locale}
      listings={listings}
      title={
        isAr
          ? "سيارات مستعملة في عُمان بأقل من 6,000 ر.ع"
          : "Used cars in Oman under OMR 6,000"
      }
      lead={
        isAr
          ? "أوتوسوق — سيارات مستعملة بأسعار في المتناول من 1,500 إلى 6,000 ر.ع. أسعار حقيقية، وتوضيح خليجي أو مستورد، وتواصل واتساب مع البائع."
          : "Autosouq — affordable used cars from OMR 1,500 to 6,000. Real listed prices, GCC-spec or import stated, and one WhatsApp tap to the seller."
      }
      resultsHeading={isAr ? "تصفّح السيارات" : "Browse cars"}    />
  );
}
