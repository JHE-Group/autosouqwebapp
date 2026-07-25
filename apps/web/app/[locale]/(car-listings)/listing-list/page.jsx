import { getListings } from "@/lib/strapi";
import Cars1 from "@/components/carsListings/Cars1";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { Link } from "@/i18n/navigation";
import { CANONICAL_LISTINGS_PATH, pageMetadata } from "@/lib/seo";

// Same listings as /listing-grid, rendered as rows — canonical points there.
export const metadata = pageMetadata({
  title: "Affordable used cars in Oman — list view",
  description:
    "Every used car on Autosouq between OMR 1,500 and 6,000, shown as a list with price, year and mileage side by side. Verified listings, WhatsApp the seller.",
  path: "/listing-list",
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
      <section className="flat-title">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner style">
                <div className="title-group fs-12">
                  <Link className="home fw-6 text-color-3" href={`/`}>
                    Home
                  </Link>
                  <span>Used cars for sale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Cars1 listings={listings} />
      <Footer1 />
    </>
  );
}
