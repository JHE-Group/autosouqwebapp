import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Faqs from "@/components/otherPages/Faqs";
import React from "react";
import Link from "next/link";
export const metadata = {
  title: "Faqs | Autosouq.om",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};
export default function page() {
  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title">
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
      <Faqs />
      <Footer1 />
    </>
  );
}
