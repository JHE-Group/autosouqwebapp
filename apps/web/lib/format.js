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
 * Just the currency word, for the places that need it apart from a number.
 *
 * The sell form's price label is "Asking price (OMR)" / «السعر المطلوب (ر.ع)»,
 * so it interpolates the unit on its own rather than formatting an amount. It
 * was passing the raw ISO code from lib/priceBand, which put "(OMR)" inside an
 * Arabic label on the field where a seller types the number this whole site is
 * organised around.
 */
export function currencyLabel(currency = DEFAULT_CURRENCY, locale = "en") {
  return CURRENCY_LABEL[currency]?.[locale === "ar" ? "ar" : "en"] ?? currency;
}

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

/**
 * A mileage, with the unit written in the reader's language.
 *
 * "كم" in Arabic, "km" in English — the same split formatPrice already makes
 * for the rial, and for the same reason. Eight components each carried their
 * own `${n.toLocaleString("en-US")} km`, so every listing card, filter chip,
 * range caption and slider announcement on the Arabic site rendered the one
 * Latin word on an otherwise entirely Arabic line — while the car's own detail
 * page, which goes through lib/seo.js, correctly said "310,000 كم".
 *
 * The digits stay Western in both languages, which is the site-wide decision:
 * Omani sellers and buyers read prices and odometers in Western numerals.
 */
export function formatKm(value, locale = "en") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("en-US")} ${locale === "ar" ? "كم" : "km"}`;
}

/**
 * Arabic-Indic (٠-٩) and Extended Arabic-Indic / Persian (۰-۹) digits folded to
 * ASCII.
 *
 * JavaScript's `\d` is `[0-9]` and nothing else, so `replace(/\D/g, "")` — the
 * standard way to clean a phone number — deletes an Arabic seller's digits
 * entirely rather than keeping them. And the HTML value-sanitisation algorithm
 * for `<input type="number">` rejects them outright: the character never
 * reaches React, the box stays empty, and nothing is shown to explain why.
 *
 * On a site whose default locale is Arabic and whose stated primary device is a
 * budget Android phone, that is the seller typing ٢٧٠٠ into the price and the
 * form neither accepting it nor complaining.
 *
 * Kept here rather than inside any one caller because it has to be applied in
 * three places that do not import each other: the form inputs, the WhatsApp
 * normaliser, and the server-side parse. Any one of them missing it is a
 * silent failure.
 */
export function foldDigits(value) {
  return String(value ?? "")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
