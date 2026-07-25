import { useTranslations } from "next-intl";
import React from "react";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Listing description.
 *
 * The theme hardcoded two paragraphs of lorem ipsum here and never looked at
 * the listing, plus a "Download brochure" link to nowhere — private sellers
 * don't have brochures. Sellers write real copy in the CMS ("صبغ وكالة",
 * "شرط الفحص"); show that, or say plainly that there isn't any — every layout
 * prints a "Description" heading above this, so returning nothing at all left
 * an orphan heading that reads like the page failed to load.
 */

export default function Description({ carItem, locale = DEFAULT_LOCALE }) {
  const t = useTranslations("listing.empty");
  const text = carItem?.description?.trim();

  if (!text) {
    return (
      // Set as a note, not as body copy. It was rendered in full-strength ink
      // at body size, which made "there is no description" look like the
      // description — the reader's eye cannot tell an absence from a sentence
      // when the two are typeset identically. #696665 on #F8F8F9 is 5.36:1.
      <div className="tfcl-listing-info mt-30">
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
          {t("description")}
        </p>
      </div>
    );
  }

  return (
    <div className="tfcl-listing-info mt-30">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}
