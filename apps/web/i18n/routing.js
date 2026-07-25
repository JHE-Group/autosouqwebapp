import { defineRouting } from "next-intl/routing";

/**
 * Locale routing for Autosouq.om.
 *
 * Decisions here follow design/research/arabic-seo-strategy.md, which checked
 * them against Google's *Managing Multi-Regional and Multilingual Sites*:
 *
 * - **Subdirectory, not subdomain or parameter.** Google explicitly marks the
 *   URL-parameter form "not recommended"; it names no winner among ccTLD,
 *   subdomain and subdirectory, so subdirectory wins on being the cheapest to
 *   run on one host.
 *
 * - **Both locales prefixed** (`localePrefix: "always"`). Serving one language
 *   from the bare path quietly encodes it as the default and makes the pair
 *   asymmetric — and un-picking that later costs a full-site 301 plus every
 *   already-shared WhatsApp preview card. With both prefixed, changing which
 *   language the root redirects to is a one-line change that moves no URL.
 *
 * - **Arabic is the default.** NICHE.md: "Arabic first, English equal second."
 *
 * - **`ar` and `en`, not `ar-OM`/`en-OM`.** The region subtag targets the
 *   *user's* location, and the .om ccTLD already carries the geotargeting.
 *
 * Note Google also says to avoid auto-redirecting between language versions.
 * The middleware only redirects the bare root, and does no Accept-Language
 * sniffing — a visitor who asks for /en/faq is never bounced to /ar/faq.
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Don't set a locale cookie from a redirect; it makes the language a user
  // chose invisible to caches and hard to reason about in a CDN.
  localeDetection: false,
});

export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

/** Text direction for a locale — drives <html dir> and the RTL stylesheet. */
export function dirFor(locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value) {
  return LOCALES.includes(value);
}
