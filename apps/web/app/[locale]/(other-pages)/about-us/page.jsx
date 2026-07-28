import SiteFooter from "@/components/footers/SiteFooter";
import RecomandedCars from "@/components/common/RecomandedCars";
import Header2 from "@/components/headers/Header2";
import Features from "@/components/homes/home-3/Features";
import Banner from "@/components/otherPages/about/Banner";

import React from "react";

import { pageMetadata } from "@/lib/seo";
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
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Banner />
      <div className="mt-5 pt-5"></div>
      <Features />
      <RecomandedCars />
      <SiteFooter locale={locale} />
    </>
  );
}
