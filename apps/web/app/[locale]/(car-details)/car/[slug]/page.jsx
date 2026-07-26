import CarDetails1 from "@/components/carDetails/CarDetails1";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import React from "react";
import { Link } from "@/i18n/navigation";
import { allCars } from "@/data/cars";
import { getListings } from "@/lib/strapi";
import { resolveListing } from "@/lib/resolveListing";
import {
  CANONICAL_LISTINGS_PATH,
  breadcrumbJsonLd,
  jsonLdScript,
  listingDescription,
  listingPath,
  listingSlug,
  listingTitle,
  pageMetadata,
  vehicleJsonLd,
} from "@/lib/seo";
import { notFound, permanentRedirect } from "next/navigation";

/**
 * Canonical listing detail — keyword URL:
 * `/car/{id}-{make}-{model}-{year}-{city}` (design/seo-research.md §8.3).
 */

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const car = await resolveListing(slug, locale);
  if (!car) {
    return { title: "Listing not found", robots: { index: false, follow: false } };
  }
  return pageMetadata({
    title: listingTitle(car),
    description: listingDescription(car),
    path: listingPath(car),
    locale,
    type: "article",
  });
}

export default async function page({ params }) {
  const { slug, locale } = await params;
  const carItem = await resolveListing(slug, locale);
  if (!carItem) notFound();

  // Keep one URL per car: soft mismatches (missing city in slug, renamed model)
  // 301 to the current canonical slug.
  const canonicalSlug = listingSlug(carItem);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${locale}/car/${encodeURIComponent(canonicalSlug)}`);
  }

  const listings = await getListings(locale);
  const recommended = (listings.length ? listings : allCars)
    .filter((elm) => elm.id !== carItem.id)
    .slice(0, 4);
  const path = listingPath(carItem, locale);
  const vehicle = vehicleJsonLd(carItem, { path });
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `/${locale}` },
    {
      name: "Used cars for sale",
      path: `/${locale}${CANONICAL_LISTINGS_PATH}`,
    },
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
                  <Link className="home fw-6 text-color-3" href="/">
                    Home
                  </Link>
                  <Link className="fw-6 text-color-3" href={CANONICAL_LISTINGS_PATH}>
                    Used cars for sale
                  </Link>
                  <span>{carItem.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CarDetails1 carItem={carItem} recommended={recommended} />
      <SiteFooter locale={locale} />
    </>
  );
}
