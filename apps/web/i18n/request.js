import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Per-request i18n config.
 *
 * Messages are merged English-under-Arabic rather than loaded alone. While the
 * Arabic catalogue is incomplete, a missing key falls back to the English
 * string instead of rendering the raw key path — an untranslated label is a
 * gap, but `nav.browse` shown to a buyer is a broken site. Remove the merge
 * once ar.json is complete, so gaps become loud again.
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
      : { ...en, ...(await import(`../messages/${locale}.json`)).default };

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
