import Banner from "@/components/common/Banner";
import Brands from "@/components/common/Brands";
import CarBrands from "@/components/common/CarBrands";
import Cars from "@/components/common/Cars";
import CarSlider from "@/components/common/CarSlider";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import CarBrands2 from "@/components/common/CarBrands2";
import Filter from "@/components/homes/home-6/Filter";
import Hero from "@/components/homes/home-6/Hero";
import LoanCalculaator from "@/components/homes/home-6/Banner2";
import React from "react";

export const metadata = {
  title: "Home 06 | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function page() {
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Hero />
      <Filter />
      <CarBrands />
      <Cars parentClass="tf-section3" />
      <LoanCalculaator />
      <CarBrands2 />
      <Banner />
      <CarSlider />
      <Brands />
      <Footer1 />
    </>
  );
}
