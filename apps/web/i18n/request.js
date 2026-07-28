import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Merge the fallback catalogue *under* the active one, key by key.
 *
 * This has to recurse. The previous implementation was a shallow spread,
 * `{ ...en, ...ar }`, under a comment promising that "a missing key falls back
 * to the English string". It did not: every top-level key in these catalogues
 * is an object, so the spread replaced each namespace **wholesale**. Fallback
 * granularity was the namespace, not the key — meaning the moment anyone added
 * one English key to a namespace Arabic already had, the safety net was gone
 * for that key and a buyer on /ar would see the raw path `browse.card.foo`
 * rendered as text. next-intl does not throw for a missing key in production;
 * it prints it.
 *
 * Today the catalogues are at parity (531 keys each, verified), so this
 * changes no rendered output. It changes what happens on the first day they
 * are not — which is the only day a fallback matters.
 */
function deepMerge(fallback, primary) {
  const out = { ...fallback };
  for (const [key, value] of Object.entries(primary)) {
    const base = out[key];
    const bothPlainObjects =
      base && typeof base === "object" && !Array.isArray(base) &&
      value && typeof value === "object" && !Array.isArray(value);
    // An empty string is a real translation decision ("render nothing here"),
    // so only `undefined` defers to the fallback.
    out[key] = bothPlainObjects
      ? deepMerge(base, value)
      : value === undefined
        ? base
        : value;
  }
  return out;
}

/**
 * Per-request i18n config.
 *
 * Messages are merged English-under-Arabic rather than loaded alone: an
 * untranslated label is a gap, but `nav.browse` shown to a buyer is a broken
 * site. Drop the merge once a CI check enforces key-tree parity, so that gaps
 * become loud at build time rather than quiet at render time.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const en = (await import("../messages/en.json")).default;
  const messages =
    locale === "en"
      ? en
      : deepMerge(en, (await import(`../messages/${locale}.json`)).default);

  return {
    locale,
    messages,
    // Latin numerals in both languages, and no minor units on OMR.
    // OMR carries three ISO-4217 decimal places, so the default would render
    // "2,700.000"; and ar-OM defaults to Arabic-Indic digits (٢٬٧٠٠), which
    // OpenSooq's own Arabic <title> tags do not use.
    formats: {
      number: {
        price: {
          style: "currency",
          currency: "OMR",
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        },
      },
    },
  };
});
