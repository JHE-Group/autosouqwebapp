import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Banner from "@/components/common/Banner";
import Blogs from "@/components/common/Blogs";
import Brands from "@/components/common/Brands";
import CarBrands from "@/components/homes/home-1/CarBrands";
import CarReview from "@/components/common/CarReview";
import Cars from "@/components/common/Cars";
import Cars2 from "@/components/homes/home-1/Cars2";
import Categories from "@/components/homes/home-1/Categories";
import Filter from "@/components/homes/home-1/Filter";
import Hero from "@/components/homes/home-1/Hero";
import Process from "@/components/homes/home-1/Process";

export const metadata = {
  title: "Autosouq.om | Used cars for sale in Oman",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function Home() {
  return (
    <>
      <div className="header-fixed">
        <Header1 />
      </div>
      <Hero />
      <Filter />
      <Cars />
      <Categories />
      <Process />
      <Cars2 />
      <Banner />
      <CarBrands />
      <CarReview />
      <Blogs />
      <Brands />
      <Footer1 />
    </>
  );
}
