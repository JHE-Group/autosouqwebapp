import CarDetails1 from "@/components/carDetails/CarDetails1";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { Link } from "@/i18n/navigation";
import { allCars } from "@/data/cars";
import { getListing, getListings } from "@/lib/strapi";
import {
  breadcrumbJsonLd,
  jsonLdScript,
  listingDescription,
  listingPath,
  listingTitle,
  pageMetadata,
  vehicleJsonLd,
} from "@/lib/seo";
import { notFound } from "next/navigation";

/**
 * The canonical listing-detail layout.
 *
 * v2–v5 render this same car from the same data at four other URLs and
 * canonicalise back here; only this path is in the sitemap. See lib/seo.js.
 */

// Resolve exactly the way the page does, so the <title> can never describe a
// different car from the one on screen.
//
// Strapi first, then the theme demo data so the site still works with the CMS
// down. Returns null when neither has this id — the caller renders a 404 rather
// than falling through to allCars[0], which used to make every unknown id an
// indexable duplicate of the first car.
async function resolveCar(id, locale) {
  return (await getListing(id, locale)) ?? allCars.find((elm) => elm.id == id) ?? null;
}

export async function generateMetadata({ params }) {
  const { id, locale } = await params;
  const car = await resolveCar(id, locale);
  if (!car) {
    return { title: "Listing not found", robots: { index: false, follow: false } };
  }
  return pageMetadata({
    title: listingTitle(car),
    description: listingDescription(car),
    path: listingPath(id),
    type: "article",
  });
}

export default async function page({ params }) {
  const { id, locale } = await params;
  // Strapi first; fall back to the theme demo data when the CMS has no match.
  const carItem = await resolveCar(id, locale);
  if (!carItem) notFound();
  // The sidebar's "other cars" block used to render four hardcoded demo cars.
  // Same Strapi-first, demo-fallback rule as the listing itself.
  const listings = await getListings(locale);
  const recommended = (listings.length ? listings : allCars)
    .filter((elm) => elm.id !== carItem.id)
    .slice(0, 4);
  const path = listingPath(id);
  // Both generators return undefined rather than a half-empty object when the
  // listing lacks the fields to fill them, so nothing ships with a null price.
  const vehicle = vehicleJsonLd(carItem, { path });
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Used cars for sale", path: "/listing-grid" },
    { name: carItem?.title, path },
  ]);

  return (
    <>
      {vehicle ? (
        <script type="application/ld+json" {...jsonLdScript(vehicle)} />
      ) : null}
      {breadcrumb ? (
        <script type="application/ld+json" {...jsonLdScript(breadcrumb)} />
      ) : null}
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title mb-40">
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
      <CarDetails1 carItem={carItem} recommended={recommended} />
      <Footer1 />
    </>
  );
}
