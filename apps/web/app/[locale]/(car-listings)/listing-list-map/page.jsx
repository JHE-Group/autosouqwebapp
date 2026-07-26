import { getListings } from "@/lib/strapi";
import Cars5 from "@/components/carsListings/Cars5";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { CANONICAL_LISTINGS_PATH, pageMetadata } from "@/lib/seo";

// Same listings as /listing-grid, beside a map — canonical points there.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
  title: "Used cars near you in Oman — map and list",
  description:
    "Affordable used cars from OMR 1,500 to 6,000 on a map of Oman, listed row by row with price and mileage. Verified listings, GCC-spec or import always stated.",
  path: "/listing-list-map",
  canonical: CANONICAL_LISTINGS_PATH,
  locale,
  });
}
export default async function page({ params }) {
  const { locale } = await params;
  const listings = await getListings(locale);
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Cars5 listings={listings} />
      <SiteFooter locale={locale} />
    </>
  );
}
