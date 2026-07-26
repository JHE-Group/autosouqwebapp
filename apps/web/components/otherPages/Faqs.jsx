import {
  feeItems,
  localiseFaqs,
  supportItems,
  toggleItems,
} from "@/data/faqs";
import React from "react";
import Accordion from "../common/Accordions";
import { getLocale, getTranslations } from "next-intl/server";

export default async function Faqs() {
  const locale = await getLocale();
  const t = await getTranslations("faqPage");

  return (
    <section className="tf-section3 flat-property">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="inner-heading flex-two flex-wrap gap-20">
              <h1 className="heading-listing">{t("h1")}</h1>
            </div>
          </div>
          <div className="col-lg-12 mb-50">
            <h2 className="mb-40">{t("overview")}</h2>
            <div className="flat-accordion">
              <Accordion faqData={localiseFaqs(toggleItems, locale)} />
            </div>
          </div>
          <div className="col-lg-12 mb-50">
            <h2 className="mb-40">{t("costs")}</h2>
            <div className="flat-accordion">
              <Accordion faqData={localiseFaqs(feeItems, locale)} />
            </div>
          </div>
          <div className="col-lg-12">
            <h2 className="mb-40">{t("safety")}</h2>
            <div className="flat-accordion">
              <Accordion faqData={localiseFaqs(supportItems, locale)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
