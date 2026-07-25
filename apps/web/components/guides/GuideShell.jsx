import { Link } from "@/i18n/navigation";
import React from "react";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import { formatGuideDate } from "@/data/guides";
import { P } from "@/components/guides/Prose";

/**
 * Page furniture for a single guide.
 *
 * Same header / breadcrumb / footer composition as the information pages, so a
 * guide reads as part of the site. No hero image, no carousel, no client-side
 * JavaScript beyond what the shell already loads — NICHE.md puts this reader on
 * a budget Android handset over metered data, and every one of these pages is
 * prose that has to be readable in a car park.
 *
 * Content column is col-lg-8: 2,000 words at full container width is unreadable
 * on a laptop.
 *
 * The single `<h1>` for every guide page is rendered here, from the guide
 * record. Body components start at `<h2>` and must never introduce another h1.
 */
export default function GuideShell({ guide, children }) {
  const published = formatGuideDate(guide.datePublished);
  const modified = formatGuideDate(guide.dateModified);
  const verified = formatGuideDate(guide.verifiedOn);

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
                  <Link className="home fw-6 text-color-3" href="/">
                    Home
                  </Link>
                  <Link className="home fw-6 text-color-3" href="/guides">
                    Guides
                  </Link>
                  <span>{guide.h1}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="tf-section3">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <article>
                <h1 className="mb-20">{guide.h1}</h1>

                {/* Dates are rendered because a reader deciding about OMR 3,000
                    is entitled to know how old our information is. `time` gives
                    the machine-readable form; the JSON-LD carries the same two
                    dates from the same record, so they cannot disagree. */}
                <p className="font-2 fs-14 lh-24 mb-40">
                  Published{" "}
                  <time dateTime={guide.datePublished}>{published}</time>
                  {modified && modified !== published ? (
                    <>
                      {" · Last updated "}
                      <time dateTime={guide.dateModified}>{modified}</time>
                    </>
                  ) : null}
                  {verified ? (
                    <>
                      {" · Procedure checked against the ROP’s own pages on "}
                      <time dateTime={guide.verifiedOn}>{verified}</time>
                    </>
                  ) : null}
                </p>

                {children}

                <div className="mt-40 pt-4 border-top">
                  <P className="mb-20">
                    This is a guide, not legal advice, and Autosouq is not a
                    government body. Where a rule, a fee or a procedure matters
                    to your money, the{" "}
                    <a
                      className="fw-6"
                      href="https://www.rop.gov.om/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Royal Oman Police
                    </a>{" "}
                    is the authority, not us. Tell us if anything here is out of
                    date and we will fix it and re-date the page —{" "}
                    <Link className="fw-6" href="/contact">
                      contact us
                    </Link>
                    .
                  </P>
                  <P className="mb-0">
                    <Link className="fw-6" href="/guides">
                      All Autosouq guides
                    </Link>{" "}
                    ·{" "}
                    <Link className="fw-6" href="/listing-grid">
                      Browse used cars in Oman
                    </Link>
                  </P>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
