import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Locale routing.
 *
 * Both locales are prefixed, so this only ever redirects the bare root
 * (`/` → `/en` while English is the sole indexable locale; see
 * i18n/routing.js). It does no Accept-Language sniffing: Google's multilingual
 * guidance warns that auto-redirecting between language versions "could
 * prevent users (and search engines) from viewing all the versions of your
 * site", and a visitor who explicitly asked for /en/faq should get English.
 */
export default createMiddleware(routing);

export const config = {
  // Run on pages only. Excluding these matters for more than speed: matching
  // /sitemap.xml, /robots.txt, /icon.svg or /opengraph-image.png would rewrite
  // them to /ar/... and break every one of Next's file-convention routes.
  matcher: [
    "/((?!api|_next|_vercel|assets|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|favicon\\.ico|icon\\.svg|icon\\.png|apple-icon\\.png|opengraph-image\\.png|twitter-image\\.png|.*\\..*).*)",
  ],
};
