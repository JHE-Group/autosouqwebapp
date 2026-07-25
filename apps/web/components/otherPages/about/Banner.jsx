import React from "react";
import { Link } from "@/i18n/navigation";

export default function Banner() {
  return (
    <section className="tf-banner style-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="content relative z-2">
              <div className="heading">
                <h1 className="text-color-1">
                  Affordable used cars in Oman, <br />
                  honestly listed
                </h1>
                <p className="text-color-1 fs-18 fw-4 lh-22 font">
                  Autosouq lists used cars from OMR 1,500 to 6,000 and nothing above
                  that. Every listing is checked, the price shown is the price the
                  seller is asking, GCC spec or import is always stated, and the
                  seller is one WhatsApp tap away.
                </p>
                <Link href="/listing-grid" className="sc-button btn-svg">
                  <span>Browse cars</span>
                  <i className="icon-autodeal-next" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
