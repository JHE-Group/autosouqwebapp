import "../../public/assets/scss/app.scss";
/*
 * Swiper, PhotoSwipe and rc-slider stylesheets used to be imported here, so
 * every route paid for them: the homepage, all the blog posts and guides,
 * /privacy, /terms, /how-it-works, /faq and /contact render no carousel, no
 * lightbox and no range slider, and still loaded ~35 KB of CSS for them. Each
 * now sits in the component that owns it, so Next attaches it to that route's
 * chunk instead.
 *
 * `swiper/css/grid` went with them and did not come back: the Grid module is
 * not registered by either Swiper call site, so it styled nothing.
 */
import { Cairo, Inter, Outfit } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { pickMessages } from "@/i18n/clientMessages";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { dirFor, isIndexableLocale, routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import ClientShell from "./ClientShell";
import {
  SOCIAL_IMAGE,
  jsonLdScript,
  organizationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// Must be absolute for og:image / canonical to resolve. Falls back to the
// production origin so a build without the env var still emits real URLs.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.autosouq.om";

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
 * Arabic face. Inter and Outfit are `subsets: ["latin"]` and carry no Arabic
 * glyphs at all, so every Arabic string was falling through to whatever the
 * device happened to have — on a budget Android that is usually Noto Naskh at
 * Latin leading, which is what "machine-translated" looks like before anyone
 * reads a word.
 *
 * Cairo 400/700 is 27.2 KB for the Arabic subset (measured in
 * design/research/arabic-seo-strategy.md §6) — 5% of the Font Awesome payload
 * this theme already ships, so it is not the weight worth arguing about.
 *
 * `preload: false` because only the Arabic tree renders it: the class below is
 * applied on /ar and nowhere else, and an /en visitor should not fetch, or
 * preload-hint, a face with no glyph they will ever see.
 */
const cairo = Cairo({
  subsets: ["arabic"],
  /*
   * No `weight` array — Cairo is a variable font, so this loads the wght axis.
   *
   * Pinning it to ["400", "700"] meant the 137 weight declarations in the
   * stylesheets that ask for anything else had nothing to resolve to. CSS font
   * matching sends 500 down to 400 and 600 up to 700, so on /ar — the DEFAULT
   * locale — every `$fw-medium` heading, label and card title rendered at
   * exactly body weight, and the typographic hierarchy the English pages get
   * simply did not exist. 80 declarations use 500 and 52 use 600.
   *
   * Latin has never had this problem: Inter and Outfit are loaded with the
   * weights the theme actually uses.
   */
  display: "swap",
  variable: "--font-cairo",
  preload: false,
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

// Fallbacks only. `generateMetadata` overrides both from the `meta.home`
// namespace so the default title and description follow the route's language —
// these were the last two English strings served on every /ar page.
const title = "Autosouq.om — Affordable used cars in Oman";
const description =
  "Oman's marketplace for affordable used cars, OMR 1,000–6,000. Real prices, verified listings, GCC spec or import stated, one WhatsApp tap to the seller.";

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
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    ...metadata,
    title: { default: t("title"), template: "%s | Autosouq.om" },
    description: t("description"),
    openGraph: {
      ...metadata.openGraph,
      title: t("title"),
      description: t("description"),
      locale: locale === "ar" ? "ar_OM" : "en_OM",
    },
    twitter: {
      ...metadata.twitter,
      title: t("title"),
      description: t("description"),
    },
    // A locale that is not indexable stays crawlable: `noindex` only works if
    // the crawler can fetch the page to read it, and blocking it in robots.txt
    // instead would leave the URLs indexable-by-reference with no way to see
    // the directive. `INDEXABLE_LOCALES` is the single switch — see i18n/routing.js.
    robots: isIndexableLocale(locale)
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
  /**
   * `images` is stated, not inherited.
   *
   * The comment that stood here said Next injects og:image/twitter:image from
   * app/opengraph-image.png and app/twitter-image.png, and that restating them
   * would make them double up. Both halves were wrong: declaring an
   * `openGraph` object in this segment *replaces* the parent's, file-convention
   * images and all — so the live site emitted none, on any page, while still
   * declaring `twitter:card: summary_large_image`. See lib/seo.js SOCIAL_IMAGE.
   */
  openGraph: {
    type: "website",
    siteName: "Autosouq.om",
    title,
    description,
    images: SOCIAL_IMAGE.openGraph,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: SOCIAL_IMAGE.twitter,
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
      className={
        locale === "ar"
          ? `${inter.variable} ${outfit.variable} ${cairo.variable}`
          : `${inter.variable} ${outfit.variable}`
      }
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
            i18n/clientMessages.js for why this is not the default.

            `errorPage` is the exception that has to live here. error.jsx sits
            at this level, and an error boundary replaces the segment *below*
            its own layout — so when it renders, no route-group layout has run
            and no group provider exists. This provider is the only one it ever
            sees. Without the namespace, next-intl falls back to printing the
            key path: the page read "errorPage.title" over a button labelled
            "errorPage.retry", in both languages. */}
        <NextIntlClientProvider messages={await pickMessages("errorPage")}>
          <ClientShell>{children}</ClientShell>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
