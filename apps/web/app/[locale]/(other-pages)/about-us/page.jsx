import Footer1 from "@/components/footers/Footer1";
import RecomandedCars from "@/components/common/RecomandedCars";
import Header2 from "@/components/headers/Header2";
import Features from "@/components/homes/home-3/Features";
import Banner from "@/components/otherPages/about/Banner";

import React from "react";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Autosouq — affordable used cars in Oman",
  description:
    "Why we list only used cars between OMR 1,500 and 6,000, how we verify a listing, and why GCC-spec or US-import is shown on every car instead of hidden.",
  path: "/about-us",
});
export default function page() {
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Banner />
      <div className="mt-5 pt-5"></div>
      <Features />
      <RecomandedCars />
      <Footer1 />
    </>
  );
}
