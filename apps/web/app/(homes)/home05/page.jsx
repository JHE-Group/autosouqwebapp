import Cars3 from "@/components/common/Cars3";

import Header1 from "@/components/headers/Header1";
import CarBrands from "@/components/common/CarBrands";
import Cars from "@/components/homes/home-5/Cars";
import Category from "@/components/homes/home-5/Category";
import Features from "@/components/homes/home-5/Features";
import Filter from "@/components/homes/home-5/Filter";
import Hero from "@/components/homes/home-5/Hero";
import React from "react";
import Banner from "@/components/common/Banner";
import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Home 05 | Autosouq.om",
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
      <div className="mt-5 pt-5"></div>

      <Cars3 />
      <Category />
      <Features />
      <Cars />
      <CarBrands />
      <Banner />
      <Brands />
      <Footer1 />
    </>
  );
}
