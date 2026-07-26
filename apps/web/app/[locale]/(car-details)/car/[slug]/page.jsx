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
import { getTranslations } from "next-intl/server";

/**
 * Canonical listing detail — keyword URL:
 * `/car/{id}-{make}-{model}-{year}-{city}` (design/seo-research.md §8.3).
 */

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const car = await resolveListing(slug, locale);
  if (!car) {
    const tMeta = await getTranslations({ locale, namespace: "meta" });
    return {
      title: tMeta("listingNotFound"),
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata({
    title: listingTitle(car, locale),
    description: listingDescription(car, locale),
    path: listingPath(car),
    locale,
    type: "article",
    // A demo car is a stand-in, not a car anyone can buy (data/cars.js). It
    // renders — the UI needs something to show against an empty CMS — but it
    // must never be indexed as inventory. `follow` so the links out of it still
    // carry. Inert once Strapi has listings; see lib/resolveListing.js.
    ...(car.isDemoListing ? { robots: { index: false, follow: true } } : {}),
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

  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });
  const listings = await getListings(locale);
  const recommended = (listings.length ? listings : allCars)
    .filter((elm) => elm.id !== carItem.id)
    .slice(0, 4);
  const path = listingPath(carItem, locale);
  // No `Car`/`Offer` block for a stand-in. The page is already noindex, but
  // structured data is a machine-readable price claim and a fetch still
  // happens — lib/seo.js's second rule is that we never state a fact we do
  // not have, and there is no car behind this one.
  const vehicle = carItem.isDemoListing
    ? undefined
    : vehicleJsonLd(carItem, { path, locale });
  const breadcrumb = breadcrumbJsonLd([
    { name: crumb("home"), path: `/${locale}` },
    {
      name: crumb("usedCars"),
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
                    {crumb("home")}
                  </Link>
                  <Link className="fw-6 text-color-3" href={CANONICAL_LISTINGS_PATH}>
                    {crumb("usedCars")}
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
