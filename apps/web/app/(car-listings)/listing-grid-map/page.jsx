import { getListings } from "@/lib/strapi";
import Cars4 from "@/components/carsListings/Cars4";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";

export const metadata = {
  title: "Car Listing Grid Map | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default async function page() {
  const listings = await getListings();
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Cars4 listings={listings} />
      <Footer1 />
    </>
  );
}
