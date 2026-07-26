import "rc-slider/assets/index.css";
import "../../public/assets/scss/app.scss";
import "swiper/css/effect-fade";
import "swiper/css/grid";
import "photoswipe/style.css";
import { Inter, Outfit } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { pickMessages } from "@/i18n/clientMessages";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { dirFor, routing } from "@/i18n/routing";
import ClientShell from "./ClientShell";
import {
  jsonLdScript,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Must be absolute for og:image / canonical to resolve. Falls back to the
// production origin so a build without the env var still emits real URLs.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://autosouq.om";

// The theme declared `font-family: Inter` in 45 places and loaded it with an
// @import sitting *after* seven other @imports in style.scss — invalid CSS, so
// the build dropped it and every visitor got the system sans-serif instead.
// next/font self-hosts these: no third-party request on a metered connection,
// no render-blocking round trip, and no layout shift when they arrive.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

/**
 * Pre-render both locale trees rather than resolving them per request. Without
 * this, every page under [locale] opts into dynamic rendering the moment it
 * reads the locale, which throws away the static generation the listing pages
 * rely on.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const title = "Autosouq.om — Affordable used cars in Oman";
// 156 chars. Google truncates around 160, so keep it under that: the previous
// version ran to 167 and lost "to reach the seller" in the SERP.
const description =
  "Oman's marketplace for affordable used cars, OMR 1,500–6,000. Real prices, verified listings, GCC spec or import stated, one WhatsApp tap to the seller.";

/**
 * Root metadata, per locale.
 *
 * `/ar` is served `noindex` while its content is still English behind an
 * Arabic URL. It stays crawlable — a `noindex` only works if the crawler can
 * fetch the page to read it, and blocking in robots.txt instead would leave
 * the URLs indexable-by-reference with no way to see the directive.
 *
 * Remove the `INDEXABLE_LOCALES` guard in the same deploy that finishes
 * messages/ar.json and the Arabic listing copy, alongside the matching change
 * in app/sitemap.js. The two must move together: an indexed Arabic tree with
 * no sitemap entry, or a sitemap entry that is noindex, are both wrong signals.
 */
const INDEXABLE_LOCALES = ["en"];

/**
 * Locale-level metadata only: robots + shared defaults.
 *
 * Do **not** set `alternates.canonical` or `openGraph.url` here. Next merges
 * layout metadata into every child; a homepage canonical on the layout made
 * every page that skipped `pageMetadata` (info drafts, dashboard) claim `/en`
 * or `/ar` as its canonical. Each route must set its own via `pageMetadata`.
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const indexable = INDEXABLE_LOCALES.includes(locale);
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, locale },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Autosouq.om",
  title: {
    default: title,
    template: "%s | Autosouq.om",
  },
  description,
  // og:image / twitter:image are injected by Next from app/opengraph-image.png
  // and app/twitter-image.png — don't restate them here or they double up.
  openGraph: {
    type: "website",
    siteName: "Autosouq.om",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-bottom) to resolve under the sticky
  // mobile contact bar on notched devices.
  viewportFit: "cover",
  themeColor: [
    // Light: matches the page background ($color-1) so the Android address bar
    // doesn't show a seam. Dark: brand indigo.
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#262262" },
  ],
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  // An unknown segment must 404 rather than silently rendering the default
  // locale — otherwise /fr/faq and /xyz/faq become indexable duplicates of the
  // Arabic tree, which is the same unbounded-duplicate-URL problem the listing
  // detail pages had.
  if (!hasLocale(routing.locales, locale)) notFound();
  // Opts this subtree back into static rendering (see generateStaticParams).
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body className="body" style={{ transition: "0s" }}>
        {/* Site-wide structured data. Organization and WebSite belong on every
            page; per-page types (Car, BreadcrumbList) are emitted by the route
            that owns them. See lib/seo.js for what each block does and does not
            claim — neither carries a phone, address or social profile, because
            we do not have verified ones. */}
        <script
          type="application/ld+json"
          {...jsonLdScript(organizationJsonLd())}
        />
        <script type="application/ld+json" {...jsonLdScript(webSiteJsonLd())} />
        {/* Chrome namespaces only. Route groups add their own — see
            i18n/clientMessages.js for why this is not the default. */}
        <NextIntlClientProvider messages={await pickMessages()}>
          <ClientShell>{children}</ClientShell>
        </NextIntlClientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
