import createNextIntlPlugin from "next-intl/plugin";

// Points next-intl at i18n/request.js (the default location is ./i18n/request.ts).
const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/**
 * Derive an `images.remotePatterns` entry from NEXT_PUBLIC_STRAPI_URL.
 *
 * lib/strapi.js turns every CMS media path into an absolute URL on the Strapi
 * origin, and next/image validates those hostnames: an origin not listed here
 * fails with `400 Invalid src prop … hostname is not configured`. Now that the
 * optimiser is on, this is load-bearing rather than precautionary — and it is
 * scoped to `/uploads/**` so /_next/image cannot be used as an open proxy for
 * arbitrary paths on that host.
 *
 * A deploy that changes the Strapi origin must redeploy the web app, since this
 * is read at build time.
 *
 * **Local development gotcha.** With Strapi on localhost, `/_next/image` will
 * still refuse CMS photos with `400` and log `resolved to private ip`. That is
 * Next 16's SSRF guard, not this pattern failing — an unmatched host is
 * rejected *before* any fetch and logs nothing, so the presence of that log
 * line is how you tell the two apart. It disappears in production, where the
 * Strapi origin is a public hostname. Do not "fix" it by widening the pattern.
 */
function strapiRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  try {
    const { protocol, hostname, port } = new URL(raw);
    return [
      {
        protocol: protocol.replace(":", ""),
        hostname,
        ...(port ? { port } : {}),
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
}

/**
 * Content-Security-Policy, assembled from what the app actually loads.
 *
 * Every source below traces to a real call site, and the list is deliberately
 * short — a CSP copied from a blog post that allows half the internet protects
 * nothing. Where a directive is loose, the reason is stated, because the whole
 * value of this header is that a future reviewer can tell a considered
 * exception from an accident.
 */
function contentSecurityPolicy() {
  const strapi = process.env.NEXT_PUBLIC_STRAPI_URL || "";
  return [
    "default-src 'self'",
    /*
     * `'unsafe-inline'` is load-bearing twice over and cannot simply be
     * dropped: Next.js inlines its own bootstrap/flight payload scripts, and
     * lib/seo.js emits JSON-LD as inline <script type="application/ld+json">.
     * Tightening this means threading a per-request nonce through the document
     * — worth doing, but it is a change to how every page renders, not a
     * config edit, so it is not smuggled in here.
     */
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    /*
     * `${strapi}` is here for one real call site: the gallery lightbox links
     * straight at the CMS media URL (carDetails/sliders/Slider1.jsx), so the
     * browser fetches that origin directly. Everything else goes through
     * /_next/image and is same-origin. `data:` is for the photo previews the
     * sell form builds before upload (AddListing.jsx readAsDataURL).
     *
     * No `blob:` — nothing calls createObjectURL. No Google hosts: the only
     * consumer of the Maps SDK is ListingMap, reachable solely from
     * /listing-grid-map and /listing-list-map, and both are 308-redirected in
     * `redirects()` below. Re-enabling a map means re-adding script-src,
     * img-src and font/style entries for it, deliberately.
     */
    ["img-src 'self' data:", strapi].filter(Boolean).join(" "),
    /*
     * `data:` is required — Swiper's core stylesheet embeds its `swiper-icons`
     * font as a base64 WOFF in an `@font-face` rule, and that sheet is now
     * imported by both carousel components.
     *
     * This was briefly dropped on the grounds that nothing used it, which was
     * true of the *previous* build and stopped being true in the same change
     * that imported `swiper/css`. The sell-flow smoke test caught it as a
     * console CSP violation on every page carrying a carousel. Checked before
     * restoring: this is the only `data:` font in the built CSS — next/font
     * self-hosts Inter, Outfit and Cairo under /_next/static.
     */
    "font-src 'self' data:",
    /*
     * EmailJS only. Not `${strapi}`: every CMS call is server-side, and a grep
     * for `fetch(` across components/ and app/ returns nothing — the browser
     * never talks to the CMS. Not `https://*.googleapis.com` either, which was
     * the worst line in this policy: that wildcard includes
     * storage.googleapis.com, so any public GCS bucket would have been a valid
     * exfiltration endpoint for injected script — exactly what `default-src
     * 'self'` is here to prevent.
     */
    "connect-src 'self' https://api.emailjs.com",
    // The primary CTA on every listing is a WhatsApp handoff. Without this a
    // hostile page can frame a listing invisibly and harvest that tap — on a
    // site whose entire proposition is that you are not being scammed.
    "frame-ancestors 'none'",
    /**
     * The Google Maps *embed*, which is not the Maps SDK.
     *
     * This policy previously declared no `frame-src`, so framing fell back to
     * `default-src 'self'` and the location map on every listing detail page
     * was blocked outright — a 360px blank box under the "الموقع" heading.
     * The omission was reasoned about correctly for `ListingMap` (the SDK,
     * genuinely unreachable behind the redirects below) and missed
     * `CarDetails1.jsx`, a separate Google consumer on a different page.
     *
     * It stayed invisible because `data/cars.js` carries no coordinates, so
     * only a real CMS listing with lat/lng renders the iframe.
     *
     * Both hosts: the `output=embed` URL can redirect to `maps.google.com`,
     * and `frame-src` is enforced against redirect targets too.
     */
    "frame-src https://www.google.com https://maps.google.com",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework and its version to anyone scanning for
  // known advisories. Next sends `X-Powered-By: Next.js` unless told not to.
  poweredByHeader: false,
  /*
   * Security response headers. There were none before this: no CSP, no
   * framing protection, no MIME-sniff protection, no HSTS.
   *
   * These are set here rather than in the middleware because the middleware
   * matcher deliberately excludes static assets and file-convention routes,
   * and headers that only cover *some* responses are the kind of control that
   * reads as present and is not.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          // Redundant with frame-ancestors for modern browsers; kept for the
          // older Android WebViews that are a real share of this audience.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  /*
   * Canonical redirects.
   *
   * `NEXT_PUBLIC_SITE_URL` is `https://www.autosouq.om`, and every canonical,
   * hreflang URL, sitemap entry and Open Graph URL is derived from that host.
   * Production also aliases the apex domain, so enforce the same host at the
   * application edge instead of relying on an external proxy rule that the
   * repository cannot prove exists.
   *
   * Legacy theme browse URLs → canonical `/used-cars`. Page-level `redirect()`
   * alone is not enough: these routes were being statically prerendered as 200s,
   * so crawlers and clients stayed on the old path. Config redirects run before
   * that.
   */
  async redirects() {
    const apexToWww = {
      source: "/:path*",
      has: [{ type: "host", value: "autosouq.om" }],
      destination: "https://www.autosouq.om/:path*",
      permanent: true,
    };

    const legacyBrowse = [
      "listing-grid",
      "listing-grid2",
      "listing-list",
      "listing-list-map",
      "listing-grid-map",
    ];
    return [
      apexToWww,
      ...legacyBrowse.flatMap((path) => [
        {
          source: `/${path}`,
          destination: "/used-cars",
          permanent: true,
        },
        {
          source: `/:locale(ar|en)/${path}`,
          destination: "/:locale/used-cars",
          permanent: true,
        },
      ]),
    ];
  },
  images: {
    /*
     * Image optimisation is ON. `unoptimized: true` used to sit here.
     *
     * The comment it carried described a migration whose targets no longer
     * existed: it named 14 `<Image>` call sites pointing at .svg, listing
     * Header1/2/3/4, DashBoard and ListingsTable. Header3.jsx has since been
     * deleted, the four headers were consolidated into SiteHeader, and
     * DashBoard now inlines its SVGs. The real count was five, all of them the
     * logo, and each now carries `unoptimized` at the call site:
     *
     *   components/headers/SiteHeader.jsx (x3, incl. the mobile-nav lockup)
     *   components/footers/Footer1.jsx
     *   components/dashboard/Sidebar.jsx
     *
     * `dangerouslyAllowSVG` remains the wrong shortcut and is deliberately not
     * set: Strapi accepts SVG uploads, so it would turn /_next/image into a
     * stored-XSS vector the first time a seller uploads one. Per-call-site
     * opt-out keeps the optimiser off SVG without opening that door.
     *
     * What this buys: the homepage LCP is a 2560x1280 JPEG (237 KB) that was
     * being served whole to a 360px phone. It is now emitted as AVIF/WebP at
     * the device bucket. Listing photos (73-91 KB each, 900x672, twelve to a
     * browse page) fall by a similar proportion.
     */

    /* All of this is live now that the optimiser is on. */
    formats: ["image/avif", "image/webp"],
    // Next's defaults start at 640. 360 and 412 are the real CSS widths of the
    // budget Android phones this site is built for; without them a DPR-1 device
    // downloads the 640 bucket.
    deviceSizes: [360, 412, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: strapiRemotePattern(),
  },
};

export default withNextIntl(nextConfig);
