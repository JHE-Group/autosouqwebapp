import { getListings } from "@/lib/strapi";
import Cars4 from "@/components/carsListings/Cars4";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { CANONICAL_LISTINGS_PATH, pageMetadata } from "@/lib/seo";

// Same listings as /listing-grid, beside a map — canonical points there.
export const metadata = pageMetadata({
  title: "Used cars near you in Oman — map and grid",
  description:
    "Find affordable used cars from OMR 1,500 to 6,000 on a map of Oman, from Muscat to Salalah. Real prices, verified listings, one WhatsApp tap to the seller.",
  path: "/listing-grid-map",
  canonical: CANONICAL_LISTINGS_PATH,
});
export default async function page({ params }) {
  const { locale } = await params;
  const listings = await getListings(locale);
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Cars4 listings={listings} />
      <Footer1 />
    </>
  );
}
