import { LOCALES } from "@/i18n/routing";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

/**
 * Served at /robots.txt by Next's file convention.
 *
 * Note what is *not* disallowed: the duplicate homepage variants
 * (`/home02`–`/home10`), the duplicate detail layouts (`/listing-detail-v2`…`v5`)
 * and the alternate browse views. Those are handled with `alternates.canonical`,
 * and a canonical only works if the crawler is allowed to fetch the page and
 * read it. Blocking them here would strand the duplicates as unresolved URLs.
 *
 * Disallowed instead: everything behind the account area. The public
 * `/add-listing` form is intentionally not listed here: it serves `noindex,
 * follow`, and crawlers must be allowed to fetch the page to see that directive.
 * Paths are listed per locale because `localePrefix: "always"` means bare
 * `/dashboard` is not the live URL.
 * Disallowed instead: everything behind the account area. Nothing there is
 * public, and several of those routes are one click from a form. Paths are
 * listed per locale because `localePrefix: "always"` means bare `/dashboard`
 * is not the live URL.
 *
 * **`/add-listing` is deliberately NOT in this list**, though it used to be.
 * It is not an account page — it is the public sell form, linked from the
 * homepage hero CTA, the homepage empty state and four blog posts in both
 * locales. Disallowing a URL we link to sitewide is how a page ends up
 * "Indexed, though blocked by robots.txt": the crawler is told to follow the
 * link but forbidden from fetching the page, so it can never read the
 * `noindex` that would have kept it out, and lists the bare URL with no
 * snippet instead.
 *
 * The `noindex, follow` on app/[locale]/(sell)/layout.jsx is the instrument
 * that keeps it out of the index — and a `noindex` only works if the crawler
 * is allowed to fetch the page and read it. Same reasoning as the canonical
 * note above; robots.txt controls crawling, not indexing.
 */
const ACCOUNT_PATHS = [
  "/dashboard",
  "/my-profile",
  "/my-listing",
  "/my-favorite",
  "/my-review",
  "/change-password",
  "/message",
];

export default function robots() {
  const disallow = LOCALES.flatMap((locale) =>
    ACCOUNT_PATHS.map((path) => `/${locale}${path}`),
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    // `Host` is a Yandex-only directive and expects a bare hostname, not a URL.
    // Google ignores it either way, but `Host: https://autosouq.om` is simply
    // malformed. Derived rather than hardcoded so it cannot drift from SITE_URL.
    host: (() => {
      try {
        return new URL(SITE_URL).host;
      } catch {
        return undefined;
      }
    })(),
  };
}
