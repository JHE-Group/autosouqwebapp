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
 * - **Default locale.** NICHE.md wants Arabic first, and as of the full Arabic
 *   translation that is what the bare root serves. Both trees are indexable,
 *   both are in the sitemap, and hreflang is reciprocal across them — see
 *   `INDEXABLE_LOCALES` below, which is the one switch that governs all three.
 *
 * - **`ar` and `en`, not `ar-OM`/`en-OM`.** The region subtag targets the
 *   *viewer's* location, and the .om ccTLD already carries the geotargeting.
 *
 * Note Google also says to avoid auto-redirecting between language versions.
 * The middleware only redirects the bare root, and does no Accept-Language
 * sniffing — a visitor who asks for /en/faq is never bounced to /ar/faq.
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  // NICHE.md: Arabic first. The bare root 307s here and x-default points at it.
  defaultLocale: "ar",
  localePrefix: "always",
  // Don't sniff Accept-Language. This governs *detection* only.
  localeDetection: false,
  /**
   * Don't set a locale cookie at all — it makes the language a user chose
   * invisible to caches and hard to reason about in a CDN.
   *
   * `localeDetection: false` alone does NOT do this, which is what the code
   * here assumed: next-intl still wrote `Set-Cookie: NEXT_LOCALE=…` on every
   * response, so every page — including the statically prerendered ones —
   * came back uncacheable by any shared cache. `localeCookie: false` is the
   * switch that actually stops it. Verified with `curl -sI /ar`.
   *
   * Nothing depends on the cookie: both locales are prefixed, so the locale is
   * always recoverable from the URL, and the root redirect is unconditional.
   */
  localeCookie: false,
  /**
   * hreflang is emitted by lib/seo.js in the document head, not by the
   * middleware.
   *
   * Leaving this on gave every response a *second*, conflicting set of
   * annotations in a `Link:` header, and the two disagreed: the middleware's
   * `x-default` pointed at the unprefixed path (`/used-cars`), which 307s,
   * while the head correctly points at `/ar/used-cars`. hreflang pointing at a
   * redirect is ignored, and a page advertising two different x-defaults is
   * exactly the "wrong signal" INDEXABLE_LOCALES exists to prevent.
   *
   * The middleware also emitted them for URLs that do not exist, because it
   * runs before the route does — so 404s advertised alternates too.
   */
  alternateLinks: false,
});

export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

/**
 * Which locale trees we are willing to have indexed. **One switch, three
 * consumers**, and they must never disagree:
 *
 *   - app/[locale]/layout.js — `robots: index/noindex` per tree
 *   - app/sitemap.js         — which trees are nominated
 *   - lib/seo.js             — which `hreflang` annotations are emitted
 *
 * That is why it lives here rather than being declared separately in each. An
 * indexed tree missing from the sitemap, or a sitemap entry that serves
 * `noindex`, or an hreflang pointing at a `noindex` URL, are all wrong signals
 * — and the third one silently invalidates the annotations for *both*
 * languages, because hreflang is reciprocal and all-or-nothing
 * (design/research/arabic-seo-strategy.md §2).
 *
 * To take a locale back out of the index, remove it here and redeploy. Nothing
 * else needs to change, and hreflang switches itself off below two entries.
 */
export const INDEXABLE_LOCALES = ["ar", "en"];

export function isIndexableLocale(locale) {
  return INDEXABLE_LOCALES.includes(locale);
}

/** Text direction for a locale — drives <html dir> and the RTL stylesheet. */
export function dirFor(locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value) {
  return LOCALES.includes(value);
}
