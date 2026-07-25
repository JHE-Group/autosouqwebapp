import CarBrands2 from "@/components/common/CarBrands2";
import Cta from "@/components/common/Cta";
import Trending from "@/components/common/Trending";
import Header1 from "@/components/headers/Header1";
import CarReview from "@/components/common/CarReview";

import CarBrands from "@/components/homes/home-7/CarBrands";
import Cars from "@/components/homes/home-7/Cars";
import Cars2 from "@/components/homes/home-7/Cars2";
import Filter from "@/components/homes/home-7/Filter";
import Hero from "@/components/homes/home-7/Hero";
import React from "react";
import Testimonials from "@/components/homes/home-7/Testimonials";
import Blogs from "@/components/common/Blogs";
import DownloadApp from "@/components/common/DownloadApp";
import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Banner2 from "@/components/homes/home-6/Banner2";

export const metadata = {
  title: "Home 07 | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function page() {
  return (
    <>
      <div className="header-fixed">
        <Header1 />
      </div>
      <Hero />
      <Filter />
      <CarBrands />
      <Cars />
      <Cars2 />
      <Trending />
      <Cta />
      <Banner2 />
      <CarBrands2 />
      <CarReview />
      <div className="mt-5 pt-5"></div>
      <Testimonials />
      <Blogs />
      <DownloadApp />
      <div className="mt-5 pt-5"></div>
      <Brands />
      <Footer1 />
    </>
  );
}
