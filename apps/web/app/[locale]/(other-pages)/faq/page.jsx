import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import Faqs from "@/components/otherPages/Faqs";
import React from "react";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
  title: "Buying a used car in Oman — questions answered",
  description:
    "How Autosouq verifies listings, what GCC-spec and US-import mean for you, what sold as-is means under OMR 1,500, and how to reach a seller on WhatsApp.",
  path: "/faq",
  locale,
  });
}
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
