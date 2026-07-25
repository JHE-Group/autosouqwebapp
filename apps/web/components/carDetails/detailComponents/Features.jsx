import { useTranslations } from "next-intl";
import React from "react";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Features the seller actually declared.
 *
 * The theme hardcoded 14 features onto every listing — claiming airbags, a
 * touchscreen and climate control for cars that may have none of them — and
 * then rendered FAQ lorem ipsum underneath in an accordion labelled as
 * features. Both are claims about someone else's car that we cannot support,
 * so this now renders the CMS list, or says plainly that the seller declared
 * none — "not listed" is a fact about the listing, not a claim about the car.
 */

export default function Features({ carItem, locale = DEFAULT_LOCALE }) {
  const t = useTranslations("listing.empty");
  const features = Array.isArray(carItem?.features) ? carItem.features : [];

  if (!features.length) {
    return (
      // Same note treatment as the empty description, so "the seller listed
      // none" reads consistently across the page as an absence rather than as
      // content. #696665 on #F8F8F9 is 5.36:1.
      <div className="features-inner tf-collapse-content">
        <p
          className="mb-0"
          style={{
            color: "#696665",
            background: "#F8F8F9",
            border: "1px solid #EDEDED",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {t("features")}
        </p>
      </div>
    );
  }

  return (
    <div className="features-inner tf-collapse-content">
      <div className="inner">
        {features.map((feature, i) => (
          <div className="listing-feature-wrap flex" key={i}>
            <i className="icon-autodeal-check" aria-hidden="true" />
            <p>{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
