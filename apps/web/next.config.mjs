import createNextIntlPlugin from "next-intl/plugin";

// Points next-intl at i18n/request.js (the default location is ./i18n/request.ts).
const withNextIntl = createNextIntlPlugin("./i18n/request.js");

/**
 * Derive an `images.remotePatterns` entry from NEXT_PUBLIC_STRAPI_URL.
 *
 * lib/strapi.js:30 turns every CMS media path into an absolute URL on the
 * Strapi origin. The moment `unoptimized` is removed below, next/image starts
 * validating those hostnames and any origin not listed here fails the request
 * with `400 Invalid src prop … hostname is not configured`. Today that is
 * invisible, because Strapi has no gallery images yet and lib/strapi.js:13
 * falls back to local placeholders — so the breakage would first appear in
 * production, on the day a seller uploads a real photo.
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
    "script-src 'self' 'unsafe-inline' https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline'",
    // Strapi media (lib/strapi.js absoluteUrl), Maps tiles, and the data: URIs
    // the sell form builds for local photo previews before upload.
    ["img-src 'self' data: blob:", strapi, "https://*.googleapis.com", "https://*.gstatic.com"]
      .filter(Boolean)
      .join(" "),
    "font-src 'self' data:",
    ["connect-src 'self'", strapi, "https://api.emailjs.com", "https://*.googleapis.com"]
      .filter(Boolean)
      .join(" "),
    // The primary CTA on every listing is a WhatsApp handoff. Without this a
    // hostile page can frame a listing invisibly and harvest that tap — on a
    // site whose entire proposition is that you are not being scammed.
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
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
   * Legacy theme browse URLs → canonical `/used-cars`.
   * Page-level `redirect()` alone is not enough: these routes were being
   * statically prerendered as 200s, so crawlers and clients stayed on the
   * old path. Config redirects run before that.
   */
  async redirects() {
    const legacyBrowse = [
      "listing-grid",
      "listing-grid2",
      "listing-list",
      "listing-list-map",
      "listing-grid-map",
    ];
    return legacyBrowse.flatMap((path) => [
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
    ]);
  },
  images: {
    /*
     * `unoptimized: true` is DELIBERATELY still here. Removing it is worth
     * 426–596 KB on the homepage (see design/research/performance-audit.md §8)
     * but it cannot be flipped on its own, because next/image refuses SVG
     * unless `dangerouslyAllowSVG` is set — and there are 14 `<Image>` call
     * sites pointing at .svg files, including the site logo in every header and
     * footer:
     *
     *   components/headers/Header1.jsx:26,34,194
     *   components/headers/Header2.jsx:26,186
     *   components/headers/Header3.jsx:130,290
     *   components/headers/Header4.jsx:23,410
     *   components/footers/Footer1.jsx:397
     *   components/dashboard/Sidebar.jsx:50
     *   components/dashboard/ListingsTable.jsx:166,184
     *   components/dashboard/DashBoard.jsx:41,47,53
     *
     * Flipping this without touching those turns the logo into a broken image
     * on every page of the site.
     *
     * Do NOT reach for `dangerouslyAllowSVG` as the shortcut. Strapi accepts
     * SVG uploads, so that flag turns /_next/image into a stored-XSS vector the
     * first time a seller uploads one.
     *
     * The change that IS safe, as one commit:
     *   1. add `unoptimized` to each of the 14 SVG call sites above (or drop
     *      next/image for them entirely — a logo is a plain <img>);
     *   2. delete the `unoptimized: true` line below;
     *   3. verify against a real Strapi origin, not the local placeholders,
     *      that listing photos still resolve.
     *
     * Deferred here rather than half-done: the SVG call sites are outside this
     * change's ownership, and a config flip that renders every page logo-less
     * is a worse outcome than the bytes it saves.
     */
    unoptimized: true,

    /*
     * Everything below is inert while `unoptimized` is set, and correct the
     * moment it is removed. It lives here now so that step 2 above cannot be
     * done without the Strapi hostnames already in place.
     */
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
