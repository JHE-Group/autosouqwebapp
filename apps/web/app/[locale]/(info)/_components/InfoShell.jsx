import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import { Link } from "@/i18n/navigation";
import React from "react";

/**
 * Shared page furniture for the text-only information pages.
 *
 * Same header / breadcrumb / footer composition as app/(other-pages)/faq and
 * /contact, so these pages sit in the site rather than beside it. Deliberately
 * no hero image and no carousel: NICHE.md puts this audience on budget Android
 * handsets over metered data, and these are pages of prose.
 *
 * The content column is col-lg-8 — long legal paragraphs at full container
 * width are unreadable on a laptop.
 */
export default function InfoShell({ breadcrumb, children }) {
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
                  <span>{breadcrumb}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="tf-section3">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">{children}</div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
