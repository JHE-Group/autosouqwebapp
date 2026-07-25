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
 * public, and several of those routes are one click from a form.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/my-profile",
          "/my-listing",
          "/my-favorite",
          "/my-review",
          "/add-listing",
          "/change-password",
          "/message",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
