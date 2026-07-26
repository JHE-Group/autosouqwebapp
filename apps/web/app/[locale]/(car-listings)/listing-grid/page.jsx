import { redirect } from "next/navigation";
import { CANONICAL_LISTINGS_PATH, pageMetadata } from "@/lib/seo";

// Legacy theme path. The indexable browse URL is `/used-cars`.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    title: "Used cars in Oman under OMR 6,000",
    description:
      "Browse affordable used cars across Oman, OMR 1,500 to 6,000. Real prices, verified listings, GCC-spec or import stated, and one WhatsApp tap to the seller.",
    path: "/used-cars",
    canonical: CANONICAL_LISTINGS_PATH,
    locale,
  });
}

export default async function page({ params }) {
  const { locale } = await params;
  redirect(`/${locale}${CANONICAL_LISTINGS_PATH}`);
}
