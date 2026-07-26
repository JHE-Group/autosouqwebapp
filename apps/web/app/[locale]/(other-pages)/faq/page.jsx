import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import Faqs from "@/components/otherPages/Faqs";
import React from "react";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.faq" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/faq",
    locale,
  });
}
export default async function page({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "breadcrumb" });
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
                    {t("home")}
                  </Link>
                  <span>{t("faq")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Faqs />
      <SiteFooter locale={locale} />
    </>
  );
}
