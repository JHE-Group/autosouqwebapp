import { Link } from "@/i18n/navigation";
import React from "react";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { formatGuideDate, guideText } from "@/data/guides";
import { P } from "@/components/guides/Prose";
import { getTranslations } from "next-intl/server";

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
export default async function GuideShell({ guide, children, locale }) {
  const t = await getTranslations({ locale, namespace: "guidePage" });
  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });
  const h1 = guideText(guide, "h1", locale);
  const published = formatGuideDate(guide.datePublished, locale);
  const modified = formatGuideDate(guide.dateModified, locale);
  const verified = formatGuideDate(guide.verifiedOn, locale);

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
                    {crumb("home")}
                  </Link>
                  <Link className="home fw-6 text-color-3" href="/guides">
                    {crumb("guides")}
                  </Link>
                  <span>{h1}</span>
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
                <h1 className="mb-20">{h1}</h1>

                {/* Dates are rendered because a reader deciding about OMR 3,000
                    is entitled to know how old our information is. `time` gives
                    the machine-readable form; the JSON-LD carries the same two
                    dates from the same record, so they cannot disagree. */}
                <p className="font-2 fs-14 lh-24 mb-40">
                  {t("published")}{" "}
                  <time dateTime={guide.datePublished}>{published}</time>
                  {modified && modified !== published ? (
                    <>
                      {` · ${t("lastUpdated")} `}
                      <time dateTime={guide.dateModified}>{modified}</time>
                    </>
                  ) : null}
                  {verified ? (
                    <>
                      {` · ${t("procedureChecked")} `}
                      <time dateTime={guide.verifiedOn}>{verified}</time>
                    </>
                  ) : null}
                </p>

                {children}

                <div className="mt-40 pt-4 border-top">
                  <P className="mb-20">
                    {t("disclaimerLead")}{" "}
                    <a
                      className="fw-6"
                      href="https://www.rop.gov.om/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("rop")}
                    </a>{" "}
                    {t("disclaimerMid")}{" "}
                    <Link className="fw-6" href="/contact">
                      {t("contactUs")}
                    </Link>
                    .
                  </P>
                  <P className="mb-0">
                    <Link className="fw-6" href="/guides">
                      {t("allGuides")}
                    </Link>{" "}
                    ·{" "}
                    <Link className="fw-6" href="/used-cars">
                      {t("browseCars")}
                    </Link>
                  </P>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
