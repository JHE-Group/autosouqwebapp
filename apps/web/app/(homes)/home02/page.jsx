import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Banner from "@/components/homes/home-2/Banner";
import CarBrands from "@/components/homes/home-2/CarBrands";
import Cars from "@/components/homes/home-2/Cars";
import Cars2 from "@/components/common/Cars2";
import CarSlider from "@/components/common/CarSlider";
import Categories from "@/components/common/Categories2";
import Features from "@/components/homes/home-2/Features";
import Hero from "@/components/homes/home-2/Hero";
import React from "react";

export const metadata = {
  title: "Home 02 | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function page() {
  return (
    <>
      <div className="header-fixed">
        <Header1 />
      </div>
      <Hero />
      <Categories />
      <CarSlider />
      <Cars />
      <Features />
      <Banner />
      <CarBrands />
      <Cars2 />
      <Brands />
      <Footer1 />
    </>
  );
}
