import { getListings } from "@/lib/strapi";
import Cars2 from "@/components/carsListings/Cars2";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { pageMetadata } from "@/lib/seo";

// The canonical browse page. `/listing-grid2`, `/listing-list`,
// `/listing-grid-map` and `/listing-list-map` are alternate presentations of
// this exact result set and canonicalise here — see lib/seo.js.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
    title: "Used cars for sale in Oman — OMR 1,500–6,000",
    description:
      "Browse affordable used cars across Oman, OMR 1,500 to 6,000. Real prices, verified listings, GCC-spec or import stated, and one WhatsApp tap to the seller.",
    path: "/listing-grid",
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
      <section className="tf-banner style-2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="content relative z-2">
                <div className="heading">
                  {/* Lead-in copy, not the page's subject — the h1 is the
                      "Browse cars" heading over the results below. */}
                  <p className="text-color-1 fs-30 fw-6 lh-38">
                    Every car between OMR 1,500 and 6,000
                  </p>
                  <p className="text-color-1 fs-18 fw-4 lh-22 font">
                    Real listed prices, GCC-spec or import stated, and one
                    WhatsApp tap to the seller.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Cars2 listings={listings} />
      <Footer1 />
    </>
  );
}
