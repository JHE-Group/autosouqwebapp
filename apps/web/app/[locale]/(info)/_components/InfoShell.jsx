import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations } from "next-intl/server";

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
 *
 * `breadcrumb` is a key in the `breadcrumb` namespace ("terms", "privacy", …),
 * not a display string: the crumb has to change language with the route, and a
 * caller passing literal text is exactly how English leaks into /ar.
 */
export default async function InfoShell({ breadcrumb, children, locale }) {
  const t = await getTranslations({ locale, namespace: "breadcrumb" });
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
                    {t("home")}
                  </Link>
                  <span>{t(breadcrumb)}</span>
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
      <SiteFooter locale={locale} />
    </>
  );
}
