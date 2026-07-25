import CarDetails2 from "@/components/carDetails/CarDetails2";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import React from "react";
import Link from "next/link";
import { allCars } from "@/data/cars";
import { getListing } from "@/lib/strapi";
export const metadata = {
  title: "Car Details 02 | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default async function page({ params }) {
  const { id } = await params;
  // Strapi first; fall back to the theme demo data when the CMS has no match.
  const carItem =
    (await getListing(id)) ??
    allCars.filter((elm) => elm.id == id)[0] ??
    allCars[0];
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title mb-40">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner style">
                <div className="title-group fs-12">
                  <Link className="home fw-6 text-color-3" href={`/`}>
                    Home
                  </Link>
                  <span>Used cars for sale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CarDetails2 carItem={carItem} />
      <Footer1 />
    </>
  );
}
