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

/**
 * Language fallback
 * -----------------
 * The description is the one field on a listing that is unbounded seller prose:
 * it cannot be generated from structured fields the way the title now is, and
 * machine-translating it would break the site's central claim that what you
 * read is what the seller wrote. So a seller who wrote only English leaves an
 * Arabic page with an English paragraph on it.
 *
 * That is allowed. Showing it *silently* is not — gate 11 in
 * design/research/arabic-seo-strategy.md §10. When `descriptionIsFallback` is
 * set we do three things, each for a different reason:
 *
 *   - `lang` on the block, so a screen reader switches voice instead of reading
 *     English through Arabic phonemes;
 *   - `dir`, so an LTR sentence is not laid out inside an RTL column;
 *   - a visible note, so a sighted reader knows this is the seller's own words
 *     in another language rather than something we failed to translate.
 */
export default function Description({ carItem, locale = DEFAULT_LOCALE }) {
  const t = useTranslations("listing.empty");
  const tf = useTranslations("listing.fallback");
  const text = carItem?.description?.trim();
  // Demo listings (data/cars.js) carry no provenance; absence means "same
  // language as the page", not "unknown".
  const isFallback = Boolean(carItem?.descriptionIsFallback);
  const textLang = carItem?.descriptionLang ?? locale;

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
      {isFallback ? (
        // Same note treatment as the empty state above: quiet, not alarming.
        // The seller has done nothing wrong by writing in one language.
        <p
          className="mb-2"
          style={{
            color: "#696665",
            background: "#F8F8F9",
            border: "1px solid #EDEDED",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {tf(textLang === "en" ? "sellerWroteEnglish" : "sellerWroteArabic")}
        </p>
      ) : null}
      <div
        lang={isFallback ? textLang : undefined}
        dir={isFallback ? (textLang === "ar" ? "rtl" : "ltr") : undefined}
      >
        {text.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
