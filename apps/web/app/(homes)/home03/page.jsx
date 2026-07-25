import Brands from "@/components/common/Brands";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Topbar from "@/components/headers/Topbar";
import Cars from "@/components/homes/home-3/Cars";
import Categories from "@/components/homes/home-3/Categories";
import DownloadApp from "@/components/common/DownloadApp";
import Features from "@/components/homes/home-3/Features";
import Filtering from "@/components/homes/home-3/Filtering";
import Hero from "@/components/homes/home-3/Hero";
import Testimonials from "@/components/homes/home-3/Testimonials";
import React from "react";

export const metadata = {
  title: "Home 03 | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function page() {
  return (
    <>
      <Topbar />
      <div className="header-fixed">
        <Header2 />
      </div>
      <Hero />
      <Filtering />
      <Categories />
      <Cars />
      <Features />
      <DownloadApp />
      <Testimonials />
      <Brands />
      <Footer1 />
    </>
  );
}
