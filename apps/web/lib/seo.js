/**
 * Shared SEO helpers: canonical URLs and JSON-LD generators.
 *
 * Two rules govern everything in here.
 *
 * 1. **Never emit a null.** A structured-data block with `price: undefined` or
 *    `"model": null` is worse than no block at all — it tells a parser the field
 *    is empty rather than absent. Every generator runs its output through
 *    `compact()`, and any field that would be null is dropped instead.
 * 2. **Never invent a fact.** No seller names, no review counts, no ratings, no
 *    social profiles we do not actually have. The site's whole promise is that
 *    what you see is real (NICHE.md); structured data is machine-readable copy
 *    and is held to the same standard.
 *
 * Verified against the specs on 2026-07-25 — see the notes on
 * `vehicleJsonLd()` and `webSiteJsonLd()` for what changed at Google's end.
 */

import { DEFAULT_CURRENCY, formatPrice } from "@/lib/format";
import { IMPORT_ORIGIN } from "@/lib/listingLabels";
import { DEFAULT_LOCALE, INDEXABLE_LOCALES } from "@/i18n/routing";

// Must match app/layout.js, which sets `metadataBase` from the same variable.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.autosouq.om";
export const SITE_NAME = "Autosouq.om";

/**
 * Canonical listing URL prefix.
 *
 * Keyword form from design/seo-research.md §8.3:
 * `/car/{id}-{make}-{model}-{year}-{city}`. The legacy theme path
 * `/listing-detail-v1/[id]` redirects here.
 */
export const CANONICAL_LISTING_PREFIX = "car";

/** @deprecated Use CANONICAL_LISTING_PREFIX — kept for any lingering imports. */
export const CANONICAL_LISTING_LAYOUT = "listing-detail-v1";

/**
 * Likewise for browsing: the theme has five views of the identical result set
 * (grid, grid-2, list, and two map variants). The indexable browse surface is
 * `/used-cars` (plus gated `/used-cars/{facet}` landers). Theme layout URLs
 * canonicalise here so they do not compete.
 */
export const CANONICAL_LISTINGS_PATH = "/used-cars";

/** Normalise to a rooted, trailing-slash-free path: "faq" -> "/faq". */
export function canonicalPath(path = "/") {
  if (!path || path === "/") return "/";
  const rooted = path.startsWith("/") ? path : `/${path}`;
  return rooted.length > 1 ? rooted.replace(/\/+$/, "") : rooted;
}

/** Absolute URL for JSON-LD and the sitemap, which cannot use relative paths. */
export function absoluteUrl(path = "/") {
  return new URL(canonicalPath(path), SITE_URL).toString();
}

/** ASCII kebab segment for listing URL slugs. */
function slugPart(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/**
 * Keyword slug: `{id}-{make}-{model}-{year}-{city}`.
 *
 * Demo cars use a numeric `id`, so the full keyword form is built. CMS cars
 * set `id` to the listing slug (already `make-model-year…`) — only the city
 * is appended, so we never emit `suzuki-swift-…-suzuki-swift-…-muscat`.
 */
export function listingSlug(car) {
  if (car == null) return "";
  if (typeof car !== "object") return slugPart(car);
  const idStr = car.id === undefined || car.id === null ? "" : String(car.id).trim();
  if (!idStr) return "";

  // Locale-independent city key. `car.location` is the *display* label and is
  // Arabic on /ar, which would give the same car two different URLs — see the
  // note on `citySlug` in lib/strapi.js. Demo cars (data/cars.js) carry no
  // taxonomy relation, so their English `location` is the stable value.
  const cityKey = car.citySlug || car.location;

  if (/^\d+$/.test(idStr)) {
    return [idStr, car.make, car.model, car.year, cityKey]
      .filter(
        (part) =>
          part !== undefined && part !== null && String(part).trim() !== "",
      )
      .map(slugPart)
      .join("-");
  }

  const base = slugPart(idStr);
  const city = cityKey ? slugPart(cityKey) : "";
  if (city && base !== city && !base.endsWith(`-${city}`)) {
    return `${base}-${city}`;
  }
  return base;
}

/**
 * Pull a lookup key off a `/car/{slug}` segment.
 *
 * Numeric demo URLs keep the leading id. CMS URLs keep the full segment —
 * callers must resolve via `resolveListing()` (slug ± trailing city), not by
 * truncating at the first hyphen.
 */
export function listingIdFromSlug(slug) {
  const raw = String(slug ?? "").trim();
  if (!raw) return "";
  const numeric = raw.match(/^(\d+)(?:-|$)/);
  if (numeric) return numeric[1];
  return raw;
}

/**
 * Canonical detail URL.
 * Pass a listing object for the full keyword slug, or a bare id for `/car/{id}`.
 */
export function listingPath(carOrId, locale) {
  const slug =
    carOrId && typeof carOrId === "object"
      ? listingSlug(carOrId)
      : slugPart(carOrId);
  const base = `/${CANONICAL_LISTING_PREFIX}/${encodeURIComponent(slug)}`;
  return locale ? `/${locale}${base}` : base;
}

/**
 * Prefix a site path with a locale segment when localePrefix is "always".
 * Paths that already start with /ar or /en are left alone.
 */
export function localizedPath(path = "/", locale) {
  const rooted = canonicalPath(path);
  if (!locale) return rooted;
  if (rooted === `/${locale}` || rooted.startsWith(`/${locale}/`)) return rooted;
  return rooted === "/" ? `/${locale}` : `/${locale}${rooted}`;
}

/**
 * Build a page's `metadata` object with the canonical and the Open Graph /
 * Twitter mirror filled in from one title+description pair, so a route can
 * never drift into having an OG title that differs from its <title>.
 *
 * `canonical` defaults to the page's own path; pass a different one to point a
 * duplicate layout at the original.
 *
 * Pass `locale` so canonicals match real URLs (`/ar/...`, `/en/...`).
 *
 * `titleAbsolute` opts out of the root "%s | Autosouq.om" template, for the few
 * titles that already carry the brand and would otherwise read
 * "Autosouq.om — … | Autosouq.om".
 */
export function pageMetadata({
  title,
  description,
  path,
  canonical = path,
  locale,
  type = "website",
  titleAbsolute = false,
  robots,
}) {
  const canonicalPathForPage = localizedPath(canonical, locale);
  const url = absoluteUrl(canonicalPathForPage);
  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: {
      // Language-SPECIFIC, always: /ar/faq self-canonicalises to /ar/faq and
      // never to /en/faq. A cross-locale canonical would de-index the whole
      // Arabic tree in one line (strategy doc §10, gate 3).
      canonical: canonicalPathForPage,
      languages: languageAlternates(canonical),
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: locale === "ar" ? "ar_OM" : "en_OM",
    },
    twitter: { card: "summary_large_image", title, description },
    ...(robots ? { robots } : {}),
  };
}

/**
 * The `hreflang` set for one unprefixed path.
 *
 * Emitted only while every locale in `INDEXABLE_LOCALES` is genuinely indexable,
 * because hreflang is a reciprocal, all-or-nothing contract: if any page in the
 * cluster fails to point back, Google drops the annotations for the whole set —
 * and Search Console stopped reporting hreflang errors in 2022, so nothing
 * warns you (design/research/arabic-seo-strategy.md §2).
 *
 * Two consequences worth stating, because both are easy to get wrong later:
 *
 * - **Every page lists every language including itself.** Self-reference is
 *   part of the contract, not an optimisation. Generating the whole map from
 *   one path is what makes that automatic and un-forgettable.
 * - **`x-default` points at Arabic**, which is the default locale and what the
 *   bare root redirects to. It is the version served to a visitor whose
 *   language we cannot infer.
 *
 * Bare `ar`/`en` rather than `ar-OM`/`en-OM`: the region subtag targets the
 * *viewer's* location, and the .om ccTLD already carries the geotargeting
 * (i18n/routing.js).
 */
export function languageAlternates(path = "/") {
  if (INDEXABLE_LOCALES.length < 2) return undefined;
  const map = Object.fromEntries(
    INDEXABLE_LOCALES.map((l) => [l, localizedPath(path, l)]),
  );
  map["x-default"] = localizedPath(path, DEFAULT_LOCALE);
  return map;
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

/** Drop null/undefined/""/[]/{} recursively so no empty field is ever emitted. */
function compact(value) {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = compact(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    // "@type" alone is not content — an object with only a type is noise.
    return Object.keys(out).filter((k) => !k.startsWith("@")).length ? out : undefined;
  }
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  if (typeof value === "number" && !Number.isFinite(value)) return undefined;
  return value;
}

/**
 * Props for a JSON-LD <script>. Usage:
 *   <script type="application/ld+json" {...jsonLdScript(vehicleJsonLd(car))} />
 *
 * `</script>` inside a string value would close the tag early, so escape it —
 * a listing description is seller-supplied text and must be treated as hostile.
 */
export function jsonLdScript(data) {
  return {
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  };
}

/**
 * Organization. Deliberately thin: no `telephone`, no `address`, no `sameAs`,
 * because we do not yet have a published support number, a registered trading
 * address, or social profiles. Adding placeholders would be the exact kind of
 * unverifiable claim the brand exists to avoid.
 */
export function organizationJsonLd() {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/assets/images/brand/pwa-icon-512.png"),
    /**
     * Both halves of this sentence used to be false, on every page of the site.
     *
     * It read "between OMR 1,500 and 6,000, with real prices and verified
     * listings". Measured against live inventory: two of ten listings sit below
     * 1,500 (OMR 1,175 and 1,250), so on those pages this claimed a floor that
     * the `Offer` in the *same HTML document* contradicted. And three of ten
     * render "not checked yet", so "verified listings" asserted as an
     * organisation-level fact was contradicted by the badge on the card.
     *
     * The band is 1,000–6,000 (NICHE.md), and the honest verification claim is
     * about the *process*, not a completed state of the catalogue: every
     * listing says whether it has been checked, including when it has not.
     * That is the stronger claim anyway — it is the one competitors cannot
     * make — and unlike the old wording it stays true as inventory grows.
     */
    description:
      "Oman's marketplace for affordable used cars from OMR 1,000 to 6,000. Real asking prices, and every listing states whether it has been checked.",
    areaServed: { "@type": "Country", name: "Oman" },
  });
}

/**
 * WebSite. No `potentialAction`/SearchAction: Google retired the sitelinks
 * search box on 2024-11-21 (developers.google.com/search/blog/2024/10/
 * sitelinks-search-box — checked 2026-07-25). The WebSite type itself is still
 * used for the site-name feature, so the block stays; only the dead
 * SearchAction payload is left off, which matters on metered mobile data.
 */
export function webSiteJsonLd() {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    alternateName: "Autosouq",
    url: absoluteUrl("/"),
    inLanguage: ["en-OM", "ar-OM"],
    publisher: { "@type": "Organization", "@id": absoluteUrl("/#organization") },
  });
}

/**
 * BreadcrumbList from `[{ name, path }]`, outermost first.
 *
 * `item` is omitted on the last crumb — Google treats the containing page's URL
 * as the target there (developers.google.com/search/docs/appearance/
 * structured-data/breadcrumb — checked 2026-07-25).
 */
export function breadcrumbJsonLd(crumbs = []) {
  const items = crumbs.filter((c) => c && c.name);
  if (!items.length) return undefined;
  return compact({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: i === items.length - 1 ? undefined : absoluteUrl(crumb.path),
    })),
  });
}

// Strapi stores the drive type pre-formatted ("4WD"); schema.org wants the
// DriveWheelConfigurationValue enum. Anything unmapped is dropped, not guessed.
const DRIVE_WHEEL = {
  FWD: "https://schema.org/FrontWheelDriveConfiguration",
  RWD: "https://schema.org/RearWheelDriveConfiguration",
  AWD: "https://schema.org/AllWheelDriveConfiguration",
  "4WD": "https://schema.org/FourWheelDriveConfiguration",
};

// listingStatus -> schema.org ItemAvailability. A sold car is still a real page;
// it just must not claim to be purchasable.
const AVAILABILITY = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

/** Spec label ("GCC spec" / "خليجي") for a Strapi importOrigin, per language. */
function specLabel(origin, locale = "en") {
  if (!origin || !IMPORT_ORIGIN[origin]) return null;
  return IMPORT_ORIGIN[origin][locale === "ar" ? "ar" : "en"] ?? null;
}

/**
 * `Car` (a subtype of `Vehicle`) plus its `Offer`, for a listing detail page.
 *
 * Status check, 2026-07-25: Google removed the *vehicle listing* rich-result
 * documentation on 2025-09-09 — that appearance is gone from Search, and
 * dealer inventory now goes through the vehicle-listings feed portal instead
 * (developers.google.com/search/docs/appearance/structured-data/vehicle-listing,
 * which now only carries the removal changelog entry). schema.org `Car` and
 * `Vehicle` are unaffected and still current
 * (schema.org/Car, schema.org/Vehicle).
 *
 * So this block buys us no Google rich result today. It is still worth shipping:
 * it is the machine-readable statement of price, mileage and condition for Bing,
 * for AI/LLM crawlers, and for the moment the feed does get built — and unlike
 * a rich-result gamble it costs one small inline script.
 *
 * Emits nothing at all for a car with no title. Emits no `offers` for a car
 * with no usable price rather than an `Offer` claiming OMR 0.
 */
export function vehicleJsonLd(car, { path, locale = "en" } = {}) {
  if (!car || !car.title) return undefined;

  const url = absoluteUrl(path || listingPath(car));
  const price = Number(car.price);
  const hasPrice = Number.isFinite(price) && price > 0;
  const km = Number(car.km);
  const engineLitres = Number(car.engineSize);

  return compact({
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.title,
    description: car.description || undefined,
    url,
    // Absolute URLs only — a relative "/assets/…" is unusable to a consumer.
    // `.filter(Boolean)` on the src first: `absoluteUrl(undefined)` defaults to
    // "/" and would resolve to the site root, so a single gallery entry with a
    // missing url would have claimed the homepage as a photograph of this car.
    // Not reachable today — Strapi always returns a url — but it is a
    // false-image claim waiting on one malformed media record.
    image: (car.images ?? [])
      .map((img) => img?.src)
      .filter(Boolean)
      .map((src) => (src.startsWith("http") ? src : absoluteUrl(src)))
      .slice(0, 6),
    // Every car on this site is used, by definition of the price band.
    itemCondition: "https://schema.org/UsedCondition",
    brand: car.make ? { "@type": "Brand", name: car.make } : undefined,
    model: car.model || undefined,
    vehicleModelDate: car.year ? String(car.year) : undefined,
    productionDate: car.year ? String(car.year) : undefined,
    bodyType: car.body || car.type || undefined,
    color: car.color || undefined,
    fuelType: car.fuelType || undefined,
    vehicleTransmission: car.transmission || undefined,
    // Oman reads odometers in kilometres; KMT is the UN/CEFACT code for km.
    mileageFromOdometer:
      Number.isFinite(km) && km > 0
        ? { "@type": "QuantitativeValue", value: km, unitCode: "KMT" }
        : undefined,
    vehicleEngine:
      Number.isFinite(engineLitres) && engineLitres > 0
        ? {
            "@type": "EngineSpecification",
            engineDisplacement: {
              "@type": "QuantitativeValue",
              value: engineLitres,
              unitCode: "LTR",
            },
          }
        : undefined,
    numberOfDoors: Number(car.door) > 0 ? Number(car.door) : undefined,
    vehicleSeatingCapacity: Number(car.seats) > 0 ? Number(car.seats) : undefined,
    driveWheelConfiguration: DRIVE_WHEEL[car.driveType] || undefined,
    // GCC-spec vs import is one of the four trust promises — state it where a
    // machine can read it, and say nothing when the seller has not declared it.
    vehicleConfiguration: specLabel(car.importOrigin, locale) || undefined,
    offers: hasPrice
      ? {
          "@type": "Offer",
          url,
          price,
          priceCurrency: car.currency || DEFAULT_CURRENCY,
          itemCondition: "https://schema.org/UsedCondition",
          // Fails closed. This used to default to `available`, so a status the map
      // does not know — a `pending` or `draft` added in Strapi later — would
      // have silently asserted InStock on a car nobody can buy. An unknown
      // status means we do not know it is purchasable, and `compact()` drops
      // the key rather than guessing.
      availability: AVAILABILITY[car.listingStatus],
          areaServed: { "@type": "Country", name: "Oman" },
          // No seller entity: the content model has no seller records and
          // inventing one on a marketplace that sells verification is off-limits.
        }
      : undefined,
  });
}

/* ------------------------------------------------------------------ */
/* Listing copy                                                        */
/* ------------------------------------------------------------------ */

/**
 * Wording for the generated listing title and description, per language.
 *
 * These are built from **structured fields only** — year, make, model, city,
 * price, mileage — and never from the seller's own paragraph. That is the
 * requirement in design/research/arabic-seo-strategy.md §8: an Arabic listing
 * page must have an Arabic `<title>` and meta description whether or not the
 * seller wrote a word of Arabic, because most of them will not. Generating
 * from fields is what makes that possible without inventing anything.
 *
 * They live here rather than in messages/*.json because lib/seo.js is imported
 * by app/sitemap.js and by `generateMetadata`, neither of which has a
 * next-intl request scope to read messages from.
 */
const LISTING_COPY = {
  en: {
    fallback: "Used car for sale in Oman",
    forSaleIn: (city) => ` for sale in ${city}`,
    forSaleOman: " for sale in Oman",
    km: (n) => `${n.toLocaleString("en-US")} km`,
    separator: ", ",
    asIs: " Sold as-is. Message the seller on WhatsApp.",
    verified: " Verified listing. Message the seller on WhatsApp.",
  },
  ar: {
    fallback: "سيارة مستعملة للبيع في عُمان",
    forSaleIn: (city) => ` للبيع في ${city}`,
    forSaleOman: " للبيع في عُمان",
    // Latin digits, per §4 — the price beside it is Latin too.
    km: (n) => `${n.toLocaleString("en-US")} كم`,
    separator: "، ",
    asIs: " تُباع كما هي. راسل البائع على واتساب.",
    verified: " إعلان محقَّق منه. راسل البائع على واتساب.",
  },
};

const copyFor = (locale) => (locale === "ar" ? LISTING_COPY.ar : LISTING_COPY.en);

/**
 * SERP title: "{year make model} for sale in {city} — {price}".
 * Falls back cleanly when city/price are missing.
 */
export function listingTitle(car, locale = "en") {
  const c = copyFor(locale);
  if (!car?.title) return c.fallback;
  const place = car.location ? c.forSaleIn(car.location) : c.forSaleOman;
  const price = Number(car.price);
  const head = `${car.title}${place}`;
  return price > 0
    ? `${head} — ${formatPrice(price, car.currency, locale)}`
    : head;
}

/**
 * A meta description built only from facts the listing actually carries, joined
 * until it fills the ~155-character window. Nothing is padded or invented; a
 * sparse listing simply gets a shorter description.
 */
export function listingDescription(car, locale = "en") {
  if (!car?.title) return null;
  const c = copyFor(locale);
  const price = Number(car.price);
  const km = Number(car.km);

  const facts = [
    price > 0 ? formatPrice(price, car.currency, locale) : null,
    Number.isFinite(km) && km > 0 ? c.km(km) : null,
    car.transmission || null,
    specLabel(car.importOrigin, locale),
    car.location || null,
  ].filter(Boolean);

  const head = facts.length
    ? `${car.title}: ${facts.join(c.separator)}.`
    : `${car.title}.`;
  return `${head}${car.soldAsIs ? c.asIs : c.verified}`;
}

/* ------------------------------------------------------------------ */
/* hreflang — SPEC ONLY, deliberately not implemented yet              */
/* ------------------------------------------------------------------ */

/**
 * NICHE.md requires Arabic first and English an equal second, so hreflang is
 * coming. It is **premature today** and must not be added before the routing
 * lands, because hreflang is a reciprocal contract: an `ar-OM` annotation that
 * points at a URL which serves English is not a partial win, it is a wrong
 * signal that Google will drop the whole cluster over. Right now the app is a
 * single `<html lang="en">` shell (app/layout.js) with no `[locale]` segment,
 * and `lib/strapi.js` defaults to `DEFAULT_LOCALE = "en"` — there is no Arabic
 * URL to point at.
 *
 * What the i18n work has to deliver, in order:
 *
 * 1. **Real, distinct URLs per language.** Sub-path routing: `/ar/...` and
 *    `/en/...`, with `/` either redirecting or serving a language-independent
 *    x-default. Not a cookie, not Accept-Language content negotiation on one
 *    URL — Googlebot crawls from the US with no cookie and would only ever see
 *    one language.
 *
 * 2. **`<html lang>` and `dir` follow the segment.** `lang="ar" dir="rtl"` for
 *    the Arabic tree, `lang="en" dir="ltr"` for English. This is one change in
 *    app/layout.js once the segment exists.
 *
 * 3. **`DEFAULT_LOCALE` stops being a constant.** Every `getListing(id)` /
 *    `getListings()` call passes the route's locale, so `pick()` in
 *    lib/strapi.js resolves Arabic fields on Arabic pages. Today's mixed-language
 *    output (Arabic makes inside English furniture) is exactly what the comment
 *    in lib/strapi.js warns about, and hreflang would advertise it.
 *
 * 4. **`alternates.languages` in Next metadata.** Next emits one
 *    `<link rel="alternate" hreflang="…">` per key, resolved against
 *    `metadataBase`. It sits alongside `canonical` in the same `alternates`
 *    object, so `pageMetadata()` grows one branch:
 *
 *      alternates: {
 *        canonical: url,                       // stays language-SPECIFIC:
 *                                              // /ar/faq self-canonicalises to
 *                                              // /ar/faq, never to /en/faq.
 *        languages: {
 *          "ar-OM":     `/ar${url}`,
 *          "en-OM":     `/en${url}`,
 *          "x-default": `/en${url}`,
 *        },
 *      }
 *
 *    Codes: `ar-OM` and `en-OM` — region-qualified, because the audience is
 *    Oman specifically and NICHE.md's expat readership (Indian, Bangladeshi,
 *    Pakistani, Filipino) searches in English from inside Oman. Add bare `ar`
 *    and `en` as additional keys only if the site ever targets the wider Gulf.
 *    `x-default` points at English as the wider-reach fallback for a visitor
 *    whose language we cannot serve.
 *
 * 5. **Reciprocity and self-reference.** Every page in the set must list *every*
 *    language including itself. `pageMetadata()` generating the whole map from
 *    one path is what makes that automatic and un-forgettable.
 *
 * 6. **Both trees in the sitemap**, each entry carrying the same `alternates`
 *    (Next's sitemap type supports `alternates.languages` per entry). The
 *    duplicate-layout exclusions in app/sitemap.js apply per language, so the
 *    URL count doubles, not decuples.
 *
 * 7. **Structured data follows.** `webSiteJsonLd()` already declares
 *    `inLanguage: ["en-OM", "ar-OM"]`; per-page JSON-LD should then carry the
 *    single `inLanguage` of the page it is on, and `vehicleJsonLd()` should be
 *    fed the locale-resolved car so `name`/`description` match the visible text.
 */
