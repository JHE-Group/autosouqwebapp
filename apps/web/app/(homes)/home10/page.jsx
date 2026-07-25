import Categories2 from "@/components/common/Categories2";
import Header1 from "@/components/headers/Header1";
import Cars from "@/components/homes/home-10/Cars";
import Filter from "@/components/homes/home-10/Filter";
import Hero from "@/components/homes/home-10/Hero";
import RecomandedCars from "@/components/common/RecomandedCars";
import React from "react";
import Cars2 from "@/components/homes/home-10/Cars2";
import Agents from "@/components/common/Agents";
import DownloadApp from "@/components/common/DownloadApp";
import Features from "@/components/homes/home-10/Features";
import Brands from "@/components/common/Brands";
import Testimonials from "@/components/homes/home-10/Testimonials";
import Blogs from "@/components/common/Blogs3";
import Footer1 from "@/components/footers/Footer1";

export const metadata = {
  title: "Home 10 | Autosouq.om",
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
      <Categories2 />
      <div className="mt-5 pt-5"></div>
      <Cars />
      <RecomandedCars />
      <Cars2 />
      <Agents />
      <DownloadApp />
      <div className="mt-5 pt-5"></div>
      <Features />
      <div className="mt-5 pt-5"></div>
      <Brands />
      <Testimonials />
      <Blogs parentClass="section-blog tf-section3" />
      <Footer1 />
    </>
  );
}
