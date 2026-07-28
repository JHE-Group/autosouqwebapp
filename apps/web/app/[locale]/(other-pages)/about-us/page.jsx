import SiteFooter from "@/components/footers/SiteFooter";
import RecomandedCars from "@/components/common/RecomandedCars";
import Header2 from "@/components/headers/Header2";
import Features from "@/components/homes/home-3/Features";
import Banner from "@/components/otherPages/about/Banner";

import React from "react";

import { pageMetadata } from "@/lib/seo";
import { getBrowseData } from "@/lib/listingSource";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/about-us",
    locale,
  });
}
export default async function page({ params }) {
  const { locale } = await params;
  /**
   * Real listings, through the same gate as every other page.
   *
   * `RecomandedCars` took no props and mapped `data/cars.js` directly, so this
   * page shipped eight fabricated cars — with prices, spec pills and
   * `/car/{slug}` links — whether or not the CMS had any inventory. It is
   * `index, follow` and sitemap-nominated, and its entire subject is that the
   * listings on this site are real ones that were checked. It was the single
   * surface bypassing the demo gate that every other page respects.
   */
  const { listings } = await getBrowseData(locale);
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Banner />
      <div className="mt-5 pt-5"></div>
      <Features />
      <RecomandedCars listings={listings} locale={locale} />
      <SiteFooter locale={locale} />
    </>
  );
}
