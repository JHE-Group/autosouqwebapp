export const DEFAULT_CURRENCY = "OMR";

/**
 * How each currency is written, per language.
 *
 * "ر.ع" is how Omanis write the rial in Arabic; "OMR" is the ISO code and is
 * what the English side shows. A price reading "1,250 OMR" in the middle of an
 * Arabic sentence is the single most visible untranslated string on the site,
 * because it sits on every card.
 */
const CURRENCY_LABEL = {
  OMR: { en: "OMR", ar: "ر.ع" },
};

/**
 * Money as the marketplace shows it: "6,250 OMR" / "6,250 ر.ع".
 *
 * The theme hardcodes a `$` in front of every price, which is wrong for Omani
 * listings — route all price rendering through here instead.
 *
 * Two rules from design/research/arabic-seo-strategy.md §4, and both are load
 * bearing:
 *
 * 1. **Latin digits in both languages.** `toLocaleString("en-US")` rather than
 *    an Arabic locale, because `ar-OM` would render Arabic-Indic numerals
 *    (١,٢٥٠). Omani buyers read prices in Latin digits, and a price that
 *    disagrees with the year or the mileage next to it reads as broken.
 * 2. **No decimals.** The rial subdivides into 1000 baisa, so a naive
 *    currency formatter emits "OMR 1,250.000" — three zeros that look like a
 *    factor-of-1000 error on a price where that matters.
 */
export function formatPrice(value, currency = DEFAULT_CURRENCY, locale = "en") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  const label =
    CURRENCY_LABEL[currency]?.[locale === "ar" ? "ar" : "en"] ?? currency;
  return `${amount.toLocaleString("en-US")} ${label}`;
}
