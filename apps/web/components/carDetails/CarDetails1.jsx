import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import StickyContactBar from "./StickyContactBar";
import MapFacade from "./MapFacade";
import Slider1 from "./sliders/Slider1";
import Description from "./detailComponents/Description";
import Overview from "./detailComponents/Overview";
import TrustBlock from "./detailComponents/TrustBlock";
import Recommended from "./detailComponents/Recommended";
import ReportListing from "./detailComponents/ReportListing";
import Features from "./detailComponents/Features";

/**
 * The one listing-detail layout.
 *
 * v2–v5 are gone, so this is the only place the decision "do I trust this
 * listing enough to message a stranger about a used car" gets made.
 *
 * ## The 360px problem this rebuild exists to fix
 *
 * The theme put the title, the price, the verification state, the spec-origin
 * disclosure and the WhatsApp button inside `.listing-sidebar`. Below 992px
 * that class is an off-canvas drawer (responsive.scss): fixed, `left: -100%`,
 * opened by `SidebarToggleButton` — an unlabelled floating icon in the corner.
 * So on the device this audience actually uses, every single thing NICHE.md
 * calls the proposition was hidden behind an icon with no name, and the page
 * opened on a gallery followed immediately by a spec grid.
 *
 * The fix is ordering, not a drawer. The page is four grid children instead of
 * two columns:
 *
 *     gallery (8) | trust (4)
 *     sections(8) | more  (4)
 *
 * Flex wrapping puts those pairs on two rows, so **desktop is unchanged** —
 * gallery top-left, trust block top-right, detail below-left, related
 * below-right — while a phone gets them in priority order with no drawer at
 * all: gallery, then title, price, verification, spec origin and the WhatsApp
 * tap, then the specs, then everything else. `SidebarToggleButton` and the
 * `.listing-sidebar` / `.overlay-siderbar-mobie` markup are deleted rather than
 * restyled; a control whose only job was to hide the price is not worth
 * keeping.
 *
 * Section order follows the AutoTrader research: **overview before
 * description**. At OMR 1,500–6,000 with no history data the buyer's first
 * questions — km, year, spec — are all structured, and the seller's prose is
 * valuable but slower to read; leading with it made the buyer scroll past it to
 * qualify the car.
 *
 * The Arabic route is the default locale, and every string on this page was
 * hard-coded English because nothing threaded `locale` down from the route. It
 * is read from the request here and passed to every child.
 */


export default async function CarDetails1({ carItem, recommended = [] }) {
  if (!carItem) return null;

  const locale = await getLocale();
  const t = await getTranslations("listing.section");

  const hasCoords =
    Number.isFinite(carItem?.latitude) && Number.isFinite(carItem?.longitude);
  const hasRecommended = Array.isArray(recommended) && recommended.length > 0;

  const sections = [
    { id: "scrollspyHeading1", label: t("overview") },
    { id: "scrollspyHeading2", label: t("description") },
    { id: "scrollspyHeading3", label: t("features") },
    { id: "scrollspyHeading4", label: t("location") },
  ];

  return (
    <>
      <section className="tf-section3 listing-detail style-1">
        <div className="container">
          <div className="row">
            {/* 1 — the photos. */}
            <div className="col-lg-8">
              <Slider1 carItem={carItem} locale={locale} />
            </div>

            {/* 2 — the trust block. Second on a phone, top of the rail on a
                   desktop. Title lives here because the price, the check and
                   the spec origin are the sentence the title starts. */}
            <div className="col-lg-4">
              <div className="widget-listing mb-40">
                <div className="heading-widget">
                  {/* The car is what this page is about, so it is the h1. It
                      was an h2, which left the canonical listing page with no
                      h1 at all. */}
                  <h1 className="title">{carItem.title}</h1>
                  <TrustBlock carItem={carItem} locale={locale} />
                </div>
              </div>
            </div>

            {/* 3 — everything the seller told us. */}
            <div className="col-lg-8">
              <nav id="navbar-example2" className="navbar tab-listing-scroll">
                <ul className="nav nav-pills">
                  {sections.map((section) => (
                    <li className="nav-item" key={section.id}>
                      <a className="nav-link" href={`#${section.id}`}>
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div
                data-bs-spy="scroll"
                data-bs-target="#navbar-example2"
                data-bs-offset={0}
                className="scrollspy-example"
                tabIndex={0}
              >
                <div
                  className="listing-description footer-col-block mb-40"
                  id="scrollspyHeading1"
                >
                  <div className="footer-heading-desktop">
                    <h2>{t("overview")}</h2>
                  </div>
                  <div className="footer-heading-mobie listing-details-mobie">
                    <h2>{t("overview")}</h2>
                  </div>
                  <Overview carItem={carItem} locale={locale} />
                </div>

                <div className="listing-description mb-40" id="scrollspyHeading2">
                  <div className="tfcl-listing-header">
                    <h2>{t("description")}</h2>
                  </div>
                  <Description carItem={carItem} locale={locale} />
                </div>

                <div className="listing-line" />

                <div
                  className="listing-features footer-col-block"
                  id="scrollspyHeading3"
                >
                  <div className="footer-heading-desktop mb-30">
                    <h2>{t("features")}</h2>
                  </div>
                  <div className="footer-heading-mobie listing-details-mobie mb-30">
                    <h2>{t("features")}</h2>
                  </div>
                  <Features carItem={carItem} locale={locale} />
                </div>

                {/* The theme's "Auto Loan Calculator" was a heading and a
                    promise with no calculator under it — and our buyers pay
                    cash. Removed rather than faked. */}
                <div className="listing-line" />

                <div className="listing-location" id="scrollspyHeading4">
                  <div className="box-title">
                    <h2 className="title-ct">{t("location")}</h2>
                    <div className="list-icon-pf gap-8 flex-three">
                      {/* Inline, not `far fa-map`: font-awesome.css is never
                          imported, so that class drew a blank box beside the
                          address. */}
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        focusable="false"
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          d="M8 14.5s5-4.2 5-7.8a5 5 0 0 0-10 0c0 3.6 5 7.8 5 7.8Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="8"
                          cy="6.6"
                          r="1.9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <p className="font-1 mb-0">
                        {carItem?.address ?? t("locationUnknown")}
                      </p>
                    </div>
                  </div>
                  {/* One map on the page. The seller panel used to embed a
                      second Google Maps iframe of the same coordinates a
                      screen further up — two map bundles on a metered budget
                      Android connection, for one location. */}
                  {/*
                    A facade, not the embed. `loading="lazy"` did not defer it:
                    measured 469 KB of Google against 172 KB for the whole rest
                    of the site, with zero scroll. See MapFacade.
                  */}
                  {hasCoords && (
                    <MapFacade
                      latitude={carItem.latitude}
                      longitude={carItem.longitude}
                      address={carItem.address}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 4 — after the decision, not before it. Both children return
                   null when there is nothing real to show, so the bordered
                   card is only mounted when it will have contents; an empty
                   30px-padded box reads as a failed fetch. */}
            <div className="col-lg-4">
              <ReportListing carItem={carItem} locale={locale} />
              {hasRecommended && (
                <div className="widget-listing">
                  <Recommended cars={recommended} locale={locale} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <StickyContactBar car={carItem} locale={locale} />
    </>
  );
}
