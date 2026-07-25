import { getListings } from "@/lib/strapi";
import Cars5 from "@/components/carsListings/Cars5";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";

export const metadata = {
  title: "Car Listing List Map | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default async function page() {
  const listings = await getListings();
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <Cars5 listings={listings} />
      <Footer1 />
    </>
  );
}
