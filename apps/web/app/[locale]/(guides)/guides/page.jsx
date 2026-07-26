import { Link } from "@/i18n/navigation";
import React from "react";
import Footer1 from "@/components/footers/Footer1";
import Header2 from "@/components/headers/Header2";
import { guidesItemListJsonLd } from "@/components/guides/guideJsonLd";
import { P } from "@/components/guides/Prose";
import {
  formatGuideDate,
  guidePath,
  guidesInOrder,
  GUIDES_VERIFIED_ON,
} from "@/data/guides";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return pageMetadata({
  title: "Guides to buying a used car in Oman",
  description:
    "Plain, checkable guides to buying an affordable used car in Oman: GCC spec or import, the ROP mulkiya transfer, fines and restrictions, scam patterns, and a first-car walkthrough for expats.",
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
export default function GuidesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScript(guidesItemListJsonLd())}
      />
      <script
        type="application/ld+json"
        {...jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
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
                    Home
                  </Link>
                  <span>Guides</span>
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
              <h1 className="mb-20">Guides to buying a used car in Oman</h1>
              <P>
                Written for people buying an affordable used car here — the OMR
                1,500–6,000 band this site covers. Plain, specific, and honest
                about what we could and could not confirm.
              </P>
              <P className="mb-40">
                Two rules apply to every page below. Where a guide states
                something about ROP procedure, the official page it came from is
                linked so you can check us. Where we could not confirm a fee, a
                premium or a rule against a primary source, we leave the number
                out and say where to get it — a wrong number in your budget is
                worse than a gap.
              </P>

              {guidesInOrder.map((guide) => (
                <div key={guide.slug} className="mb-40">
                  <h2 className="fs-20 mb-2">
                    <Link href={guidePath(guide.slug)}>{guide.h1}</Link>
                  </h2>
                  <P className="mb-2">{guide.summary}</P>
                  <p className="font-2 fs-14 lh-24 mb-0">
                    Updated{" "}
                    <time dateTime={guide.dateModified}>
                      {formatGuideDate(guide.dateModified)}
                    </time>
                    {guide.verifiedOn
                      ? " · procedure checked against the ROP’s own pages"
                      : null}
                  </p>
                </div>
              ))}

              <h2 className="mb-20">What is not here yet</h2>
              <P>
                These five are the start of a longer list. Guides on flood and
                salvage cars, chassis-number checks, air-conditioning before an
                Omani summer, high-mileage buying, running costs, insurance and
                selling your own car are researched and not yet written. We would
                rather publish five pages that are right than eighteen that are
                filled in.
              </P>
              <P className="mb-40">
                Sources were last checked on{" "}
                <time dateTime={GUIDES_VERIFIED_ON}>
                  {formatGuideDate(GUIDES_VERIFIED_ON)}
                </time>
                . If something here is out of date,{" "}
                <Link className="fw-6" href="/contact">
                  tell us
                </Link>{" "}
                and we will fix it and re-date the page.
              </P>

              <P className="mb-0">
                <Link className="fw-6" href="/listing-grid">
                  Browse used cars in Oman
                </Link>{" "}
                ·{" "}
                <Link className="fw-6" href="/how-it-works">
                  How Autosouq works
                </Link>{" "}
                ·{" "}
                <Link className="fw-6" href="/faq">
                  FAQs
                </Link>
              </P>
            </div>
          </div>
        </div>
      </section>
      <Footer1 />
    </>
  );
}
