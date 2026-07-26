import { Link } from "@/i18n/navigation";
import React from "react";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { guidesItemListJsonLd } from "@/components/guides/guideJsonLd";
import { P } from "@/components/guides/Prose";
import {
  formatGuideDate,
  guidePath,
  guidesInOrder,
  guideText,
  GUIDES_VERIFIED_ON,
} from "@/data/guides";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guides" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/guides",
    locale,
  });
}

/**
 * The guides hub at /guides.
 *
 * Same furniture as the information pages and no hero image — this is a list of
 * links and it should weigh what a list of links weighs.
 *
 * Ordering is the research priority from
 * design/research/blog-keyword-briefs.md §6, not publication date. Five of the
 * eighteen briefed guides exist; the rest are unwritten, and this page says so
 * rather than implying a fuller library than there is.
 */
export default async function GuidesIndexPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guidesPage" });
  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScript(guidesItemListJsonLd(locale))}
      />
      <script
        type="application/ld+json"
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: crumb("home"), path: `/${locale}` },
            { name: crumb("guides"), path: `/${locale}/guides` },
          ])
        )}
      />
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
                  <span>{crumb("guides")}</span>
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
              <h1 className="mb-20">{t("h1")}</h1>
              <P>{t("lede")}</P>
              <P className="mb-40">{t("rules")}</P>

              {guidesInOrder.map((guide) => (
                <div key={guide.slug} className="mb-40">
                  <h2 className="fs-20 mb-2">
                    <Link href={guidePath(guide.slug)}>
                      {guideText(guide, "h1", locale)}
                    </Link>
                  </h2>
                  <P className="mb-2">{guideText(guide, "summary", locale)}</P>
                  <p className="font-2 fs-14 lh-24 mb-0">
                    {t("updated")}{" "}
                    <time dateTime={guide.dateModified}>
                      {formatGuideDate(guide.dateModified, locale)}
                    </time>
                    {guide.verifiedOn ? ` · ${t("ropChecked")}` : null}
                  </p>
                </div>
              ))}

              <h2 className="mb-20">{t("notHereTitle")}</h2>
              <P>{t("notHereBody")}</P>
              <P className="mb-40">
                {t("sourcesCheckedLead")}{" "}
                <time dateTime={GUIDES_VERIFIED_ON}>
                  {formatGuideDate(GUIDES_VERIFIED_ON, locale)}
                </time>
                {t("sourcesCheckedMid")}{" "}
                <Link className="fw-6" href="/contact">
                  {t("tellUs")}
                </Link>{" "}
                {t("sourcesCheckedTail")}
              </P>

              <P className="mb-0">
                <Link className="fw-6" href="/used-cars">
                  {t("linkBrowse")}
                </Link>{" "}
                ·{" "}
                <Link className="fw-6" href="/how-it-works">
                  {t("linkHowItWorks")}
                </Link>{" "}
                ·{" "}
                <Link className="fw-6" href="/faq">
                  {t("linkFaq")}
                </Link>
              </P>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
