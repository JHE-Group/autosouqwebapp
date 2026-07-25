import Agents from "@/components/common/Agents";
import Blogs from "@/components/common/Blogs";
import Brands from "@/components/common/Brands";

import Footer1 from "@/components/footers/Footer1";
import Header3 from "@/components/headers/Header3";
import CarCompare from "@/components/homes/home-4/CarCompare";
import Categories from "@/components/common/Categories";
import Cta from "@/components/common/Cta";
import Features from "@/components/homes/home-4/Features";
import Filter from "@/components/homes/home-4/Filter";
import Hero from "@/components/homes/home-4/Hero";
import RecomandedCars from "@/components/common/RecomandedCars";
import Testimonials from "@/components/homes/home-4/Testimonials";
import React from "react";
import Cars3 from "@/components/common/Cars3";

export const metadata = {
  title: "Home 04 | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function page() {
  return (
    <>
      <div className="header-fixed">
        <Header3 />
      </div>
      <Hero />
      <Filter />
      <Categories />
      <Features />
      <div className="mt-5"></div>
      <Brands />
      <Cars3 />
      <Cta />
      <CarCompare />
      <RecomandedCars />
      <Testimonials />
      <Agents />
      <Blogs parentClass="section-blog tf-section bg-1" />
      <Footer1 />
    </>
  );
}
