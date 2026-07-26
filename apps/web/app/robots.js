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
 * Disallowed instead: everything behind the account area. Nothing there is
 * public, and several of those routes are one click from a form. Paths are
 * listed per locale because `localePrefix: "always"` means bare `/dashboard`
 * is not the live URL.
 */
const ACCOUNT_PATHS = [
  "/dashboard",
  "/my-profile",
  "/my-listing",
  "/my-favorite",
  "/my-review",
  "/add-listing",
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
    host: SITE_URL,
  };
}
