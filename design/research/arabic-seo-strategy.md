# Arabic / bilingual SEO strategy — Autosouq.om

**Author:** Arabic/bilingual SEO research pass
**Date:** 2026-07-25
**Status:** Advisory. No application code was changed by this document.
**Governing rule:** NICHE.md — *"Languages: Arabic first, English equal second. Everything the customer sees exists in both."*

---

## How to read this document

Every factual claim is tagged:

- **[VERIFIED]** — I fetched the primary source or ran the code during this research pass. Source linked, date noted.
- **[OBSERVED]** — I saw the live artefact (a URL, a SERP title) but could not fetch the page itself. Real data, narrower than a full page inspection.
- **[INFERRED]** — Reasoned conclusion from verified inputs. My judgement, not a citable fact.
- **[UNVERIFIED]** — I could not confirm this. Flagged so a later agent re-checks rather than trusting it.

> ### Before running any keyword harvest, read this
>
> **[VERIFIED 2026-08-04] `suggestqueries.google.com/complete/search?client=firefox`
> silently ignores `gl=`.** It answers from the egress IP instead, and returns a
> byte-identical array whatever country you ask for. A later research pass
> harvested the whole English keyword set through it, tagged 363 findings
> `(gl=OM)`, and was in fact reading **Irish** autocomplete — every result led
> with Dublin and Northern Ireland. The parameter was accepted and discarded.
>
> `client=chrome` honours it. Same seed, same second:
>
> | endpoint | `gl=om` | `gl=us` |
> |---|---|---|
> | `client=firefox` | used cars in **ireland** / **dublin** | used cars in **ireland** / **dublin** |
> | `client=chrome` | used cars in **oman** / **muscat** | used cars **indianapolis** / **indiana** |
>
> Two consequences worth keeping in mind. A wrong-geography harvest is not
> obviously wrong — the terms still look like plausible car queries, which is
> why it survived a full pass. And `gl=om` is a *geotargeting parameter, not an
> Omani IP*: even the correct endpoint is a proxy for Omani search, not the
> thing itself. Treat absence of a completion as weak evidence and presence as
> moderate evidence, never either as a volume.

**What I could not verify, and why:**

| Thing | Why not |
|---|---|
| OpenSooq / Hatla2ee / YallaMotor / Dubizzle Oman page HTML (`hreflang`, `canonical`, `dir`) | All four return HTTP 403/429 to non-browser clients (bot protection). Their **URL structures below are [OBSERVED]** from live search-result URLs, which is direct evidence of the URLs but not of their tag markup. |
| Google Fonts CDN payload sizes | `fonts.googleapis.com/css2` returned HTTP 400 through this sandbox. I measured the **same binaries** via the `@fontsource` npm packages instead — those ship the Google Fonts WOFF2 files unmodified. Byte counts below are real, measured locally. |
| Search volumes for any Arabic keyword | **No volume data was available to me and none is invented here.** See §5 for how to get real numbers. |
| WhatsApp's on-device rendering of long percent-encoded URLs | Not tested on a handset. The character-count argument in §3 is measured; the rendering claim is [INFERRED]. |
| Whether Omani users *prefer* Arabic-Indic digits | No survey data. §4 argues from what the market leader ships, not from user research. |

---

## 0. Ground truth about the current codebase

Measured on 2026-07-25. These numbers size the work.

| Fact | Value | Source |
|---|---|---|
| Root layout language | `<html lang="en">`, no `dir` | `apps/web/app/layout.js:65` |
| Locale routing | None. Flat `app/` tree. | `apps/web/app/` |
| Routes (`page.jsx`) | 35 | `find app -name page.jsx` |
| Components (`.jsx`) | 118 | `find components -name '*.jsx'` |
| CMS locale model | Paired fields (`title`/`titleAr`), **not** the Strapi i18n plugin | `apps/cms/src/api/listing/content-types/listing/schema.json` |
| CMS slug field | **One** `uid` field, `targetField: "title"` (English) | same, lines 21–24 |
| Physical-direction CSS declarations in theme SCSS | **~687** | see §6 breakdown |
| Logical CSS properties already in use | **0** | `grep -E '(margin\|padding\|border\|inset)-(inline\|block)'` |
| Directional icon classes in JSX | **3 distinct**, 51 call sites | §6 |
| Font Awesome already shipped | 141 KB + 174 KB + 190 KB WOFF2 (3 weights) | `public/assets/fonts/` |
| Third-party font request | Google Fonts `@import` inside SCSS (render-blocking) | `public/assets/scss/style.scss:15` |

The mixed-language bug that produced `DEFAULT_LOCALE` (`lib/strapi.js:48`) was diagnosed correctly. §8 explains why the fix is right but incomplete.

---

## 1. URL strategy

### What Google actually says

[VERIFIED] Google's *Managing Multi-Regional and Multilingual Sites* (last updated **2025-12-10**) lists four structures and explicitly rejects only one:

| Structure | Google's note |
|---|---|
| ccTLD (`example.om`) | "Clear geotargeting", "Server location irrelevant" |
| Subdomain (`ar.example.com`) | "Easy to set up", allows different server locations |
| Subdirectory (`example.com/ar/`) | "Easy to set up", "Low maintenance (same host)" |
| URL parameter (`example.com?loc=ar`) | **"Not recommended"** — "URL-based segmentation difficult" |

Google does **not** name a single winner among the first three. The widely-repeated "Google recommends subdirectories" line is not in the documentation — it is an SEO-community inference from authority consolidation. Treat it as [INFERRED], not policy.

[VERIFIED] Same page: *"Use language-specific URLs"* and *"Avoid automatically redirecting users from one language version of a site to a different language version"* — the latter *"could prevent users (and search engines) from viewing all the versions of your site."*

[VERIFIED] Google's *International Targeting* report in Search Console was deprecated in **September 2022** and removed. Google's statement at the time: *"We continue to support hreflang and our recommendations for managing multilingual and multiregional sites still stand."* Practical consequence: **Search Console will not tell you when your hreflang is broken.** You must validate it yourself (§2, §9).

### The parameter option is dead on arrival

`autosouq.om/?lang=ar` is the one option Google names as not recommended. It also cannot be cached per-locale cleanly, cannot be linked distinctly from WhatsApp, and gives Arabic no distinct URL to rank. **Rejected.**

### Subdomain vs subdirectory on a `.om` ccTLD

The `.om` ccTLD is already doing the entire geotargeting job. It says "Oman" more strongly than any subdomain or path segment could. So the only question left is **language separation**, and for that a subdomain buys nothing:

- `ar.autosouq.om` requires a second Search Console property, splits internal-link equity across hosts, and needs DNS/TLS/CDN config per host.
- `autosouq.om/ar/` is one host, one property, one deploy, one certificate.

[INFERRED] For a single-country, two-language, pre-launch site with zero existing authority, subdirectory is strictly better. There is no scenario in this business where you need Arabic served from different infrastructure.

**Decision: subdirectory on `autosouq.om`.**

### What competitors on this exact market do

[OBSERVED] All four live URL patterns, from real search results:

| Site | Structure | Arabic path | English path |
|---|---|---|---|
| OpenSooq | country subdomain + language path | `om.opensooq.com/ar/حراج-السيارات/سيارات-للبيع/تويوتا/كورولا` | `om.opensooq.com/en/cars/cars-for-sale/toyota/corolla` |
| Hatla2ee | country subdomain + language path | `oman.hatla2ee.com/ar/car/toyota/corolla` | `oman.hatla2ee.com/en/car/city/muscat` |
| YallaMotor | country subdomain, **no `/en/` prefix** | — | `oman.yallamotor.com/used-cars/muscat/toyota/corolla` |
| **Dubizzle Oman** | **real `.om` ccTLD**, English prefixed, **Arabic at root** | `www.dubizzle.com.om/vehicles/cars-for-sale/` | `www.dubizzle.com.om/en/vehicles/cars-for-sale/` |

Dubizzle Oman is the closest structural comparable — a `.om` ccTLD marketplace — and it puts **Arabic on the bare path with English at `/en/`**. That is precisely the "Arabic first" reading of NICHE.md.

[UNVERIFIED] YallaMotor is a cautionary case: the **same URL** `oman.yallamotor.com/used-cars/muscat/toyota/corolla` surfaced in my Arabic search with an Arabic `<title>` ("تويوتا كورولا للبيع في مسقط | 49 سيارة مستعملة وجديدة للبيع") and in my English search with an English `<title>`. One URL apparently serving two languages is the classic locale-adaptive failure mode Google warns about. I could not fetch the page to confirm. **Do not copy this pattern.**

### Should Arabic be the root?

This is the one genuinely contested call. Both options are defensible; here is the honest trade-off.

**Option A — Arabic at root.** `/` = Arabic, `/en/` = English. Matches Dubizzle Oman.

- **For:** Shortest Arabic URLs (matters for WhatsApp, §3). The strongest possible "this is an Arabic site" signal. Literal reading of NICHE.md.
- **Against:** Permanently asymmetric. `/listing/x` (Arabic) vs `/en/listing/x` (English) means every route helper, every `hreflang` builder, every sitemap entry has a special case for the unprefixed locale. Adding any third locale later — and note NICHE.md counts **1.4 million expat workers** from Indian, Bangladeshi, Pakistani and Filipino communities — forces you to either bolt a third prefix onto an asymmetric tree or re-prefix Arabic, which is a full-site 301.
- **Against:** Right now the site's English URLs already sit at the root (`/listing-grid`, `/listing-detail-v1/[id]`). Option A means the English pages move to `/en/…` **and** Arabic takes over their old paths. Every legacy URL must 301 to a *different-language* page, which is a redirect Google is documented as disliking.

**Option B — both locales prefixed.** `/ar/…` and `/en/…`, with `/` redirecting.

- **For:** Perfectly symmetric. One code path, one URL builder, one `hreflang` helper. Third locale is a config line.
- **For:** "Arabic first" is expressed where it is actually observable by a user — `/` lands on Arabic, the language switcher defaults to Arabic, Arabic is `x-default` — rather than by which locale owns the bare path, which no user ever perceives.
- **Against:** Arabic URLs are 4 characters longer than Option A.
- **Against:** `/` must resolve. See below.

**Recommendation: Option B.** The symmetry is worth four characters, and the expat-audience case for a possible third locale is not hypothetical — it is a third of NICHE.md's customer description.

### Handling the bare root under Option B

Google's "avoid automatic redirection between language versions" warning is aimed at `Accept-Language` sniffing applied to *every* URL, which traps users and crawlers in one locale. A single unconditional redirect on the bare root only is a different thing and is standard practice.

```
/                    → 307 → /ar/          (unconditional; NO Accept-Language sniffing)
/ar/…                → Arabic, dir="rtl", lang="ar"
/en/…                → English, dir="ltr", lang="en"
/listing-grid        → 301 → /en/listing-grid   (legacy pre-launch English paths)
```

**Never** sniff `Accept-Language` on deep URLs. If a user opens `/en/listing/toyota-corolla-2015` from a WhatsApp message, they get English, full stop — regardless of their browser locale. Offer the other language via a visible, always-present switcher that preserves the current path.

⚠️ Note the tension: the Next.js internationalization guide's own example [VERIFIED, docs last updated 2025-12-09] shows `Accept-Language`-based redirection in `proxy.js`. **Do not copy that example verbatim.** It conflicts with Google's guidance. Use the same file for the bare-root redirect only.

### Migration cost of getting this wrong

This is the part to take seriously.

- **Today (pre-launch): the cost of changing your mind is zero.** No indexed URLs, no backlinks, no WhatsApp messages in circulation carrying old links.
- **After launch:** changing locale URL structure means 301-ing every URL on the site. Redirected URLs are re-crawled and re-evaluated over weeks to months; ranking recovery is not guaranteed and is never instant. On top of that, **every listing URL already shared into WhatsApp becomes a redirect hop** — and WhatsApp link previews are generated once and cached, so previously-shared links show stale cards.
- The listing-detail URL is the single most-shared asset this business has. It is the last URL you ever want to move.

**Therefore: fix the URL structure before the first public listing goes live, not after.** This is the highest-leverage decision in this document and it has a hard deadline.

### Recommended final structure

```
https://autosouq.om/ar/                                  Arabic home
https://autosouq.om/ar/used-cars                         Arabic browse
https://autosouq.om/ar/used-cars/muscat                  Arabic city facet
https://autosouq.om/ar/used-cars/toyota-corolla          Arabic make/model facet
https://autosouq.om/ar/listing/toyota-corolla-2015-xli   Arabic listing detail
https://autosouq.om/en/…                                 identical tree, English
```

Slugs are Latin in **both** trees — see §3. The path *shape* is identical across locales, which makes `hreflang` generation a pure string substitution and makes it impossible to emit a broken pair.

---

## 2. hreflang

### The exact tag set

**Use three values: `ar`, `en`, `x-default`. Do not use `ar-OM` or `en-OM`.**

Reasoning:

1. [VERIFIED] Google's *Localized Versions* doc (last updated **2025-12-22**) explicitly permits language-only codes: *"To simplify your labeling, you can specify a language code by itself. For example: `de`: German language content, independent of region."*
2. [INFERRED] The region subtag in `hreflang` targets the **user's location**, not the site's. `ar-OM` would mean "Arabic content for users in Oman." That deliberately excludes Omanis travelling, Gulf-wide Arabic speakers browsing Omani inventory, and — critically for this business — the large expatriate population whose Google location signal may not be clean. Those users would all fall through to `x-default`. There is no upside: the `.om` ccTLD is already the geotargeting signal (§1), so the region subtag is redundant at best.
3. [INFERRED] Emitting `ar` **and** `ar-OM` both pointing at the same URL is a duplicate-annotation error class. Don't.

**`x-default` → the Arabic URL.** [VERIFIED] Google: *"The reserved `x-default` value is used when no other language/region matches the user's browser setting."* Pointing it at Arabic is the machine-readable statement of "Arabic first."

⚠️ Do **not** point `x-default` at the bare `/`, because under Option B `/` is a redirect. `hreflang` targets should be final, indexable, 200-status URLs.

### Markup that must appear on `/ar/listing/toyota-corolla-2015-xli`

```html
<link rel="canonical" href="https://autosouq.om/ar/listing/toyota-corolla-2015-xli" />
<link rel="alternate" hreflang="ar" href="https://autosouq.om/ar/listing/toyota-corolla-2015-xli" />
<link rel="alternate" hreflang="en" href="https://autosouq.om/en/listing/toyota-corolla-2015-xli" />
<link rel="alternate" hreflang="x-default" href="https://autosouq.om/ar/listing/toyota-corolla-2015-xli" />
```

The English page at `/en/listing/toyota-corolla-2015-xli` emits the **identical three `alternate` tags**, and a canonical pointing at *itself*.

Note the two separate rules:
- **`canonical` is always self-referencing per locale.** The Arabic page never canonicalises to the English one. Cross-locale canonicals are the single most common way to delete your Arabic site from the index.
- **`hreflang` is the same on both**, including the self-reference.

### The return-tag requirement

[VERIFIED] Google: *"If two pages don't both point to each other, the tags will be ignored."* And: *"Each language version must list itself as well as all other language versions."*

Failure here is silent and total — Google ignores the whole cluster, not just the broken edge. And since the Search Console International Targeting report is gone (§1), nothing will warn you.

**Structural defence:** generate the whole set from one function that takes only the locale-agnostic path. If the path shape is identical across locales (§1), you cannot produce a one-way pair.

### Next.js 16 App Router implementation

[VERIFIED] `metadata.alternates.languages` maps a locale key to a URL, resolved against `metadataBase`. `x-default` is accepted as a key.

Create `apps/web/lib/i18n.js`:

```js
// apps/web/lib/i18n.js
export const LOCALES = /** @type {const} */ (["ar", "en"]);
export const DEFAULT_LOCALE = "ar";          // Arabic first (NICHE.md)
export const DIR = { ar: "rtl", en: "ltr" };

/** True for a locale we actually serve. Anything else must 404, not fall back. */
export function isLocale(v) {
  return LOCALES.includes(v);
}

/**
 * The complete hreflang set for one locale-agnostic path.
 *
 * `path` is the shared shape WITHOUT the locale segment:
 *   "/"  |  "/used-cars"  |  "/listing/toyota-corolla-2015-xli"
 *
 * Every locale is emitted every time, including the current one — Google
 * ignores an entire hreflang cluster if any page fails to name itself or
 * fails to point back (developers.google.com/search/docs/specialty/
 * international/localized-versions — checked 2026-07-25). Building the set
 * from one path means a one-way pair is not expressible.
 */
export function alternates(path = "/") {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `/${l}${clean}`]));
  // x-default points at Arabic, not at "/", because "/" is a 307 and an
  // hreflang target must be a final 200 URL.
  languages["x-default"] = `/${DEFAULT_LOCALE}${clean}`;
  return languages;
}
```

Extend `pageMetadata()` in `apps/web/lib/seo.js` — it already centralises canonical + OG, so this is the natural seam:

```js
// apps/web/lib/seo.js  (extension of the existing pageMetadata)
import { alternates, DIR } from "@/lib/i18n";

export function pageMetadata({
  title, description, path, locale,
  canonical = path, type = "website", titleAbsolute = false,
}) {
  const localised = `/${locale}${path === "/" ? "" : path}`;
  const canonicalUrl = `/${locale}${canonical === "/" ? "" : canonical}`;
  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: canonicalUrl,          // ALWAYS self, never cross-locale
      languages: alternates(path),      // ar + en + x-default, on every page
    },
    openGraph: {
      type, url: localised, title, description,
      siteName: SITE_NAME,
      locale: locale === "ar" ? "ar_OM" : "en_OM",
      alternateLocale: locale === "ar" ? "en_OM" : "ar_OM",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
```

And the root layout moves to `apps/web/app/[locale]/layout.js`:

```jsx
// apps/web/app/[locale]/layout.js
import { notFound } from "next/navigation";
import { LOCALES, DIR, isLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();   // /fr/ must 404, not silently serve English
  return (
    <html lang={locale} dir={DIR[locale]}>
      <body className="body">…</body>
    </html>
  );
}
```

[VERIFIED] `params` is a Promise in Next.js 16 App Router and must be awaited. [VERIFIED] The App Router has **no** built-in `i18n` config key — the Pages Router `i18n` option does not exist here. Locale handling is the `[locale]` segment plus `proxy.js`.

⚠️ [VERIFIED] **Next.js 16 renamed `middleware.ts`/`middleware.js` to `proxy.ts`/`proxy.js`**, with the exported function renamed `middleware` → `proxy`. `middleware.js` still works but is deprecated. Codemod: `npx @next/codemod@canary middleware-to-proxy .`. Any older tutorial a later agent finds will use the old name.

`apps/web/proxy.js` — bare-root redirect **only**:

```js
// apps/web/proxy.js
import { NextResponse } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * One job: send the bare root to the default locale.
 *
 * Deliberately does NOT sniff Accept-Language. Google: "Avoid automatically
 * redirecting users from one language version of a site to a different
 * language version" (developers.google.com/search/docs/specialty/international/
 * managing-multi-regional-sites — checked 2026-07-25). The Next.js i18n guide's
 * own example does sniff; we don't follow it. A user opening /en/listing/x from
 * WhatsApp gets English, whatever their browser says.
 */
export function proxy(request) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url), 307);
  }
}

export const config = { matcher: "/" };
```

### Failure modes — the checklist

| # | Failure | Consequence | Guard |
|---|---|---|---|
| 1 | Missing self-reference | Entire cluster ignored | `alternates()` always emits all locales |
| 2 | Missing return tag | Entire cluster ignored | Identical path shape across locales |
| 3 | Cross-locale canonical (`/ar/x` → `/en/x`) | Arabic site deindexed | `canonical` is built from `locale` in `pageMetadata` |
| 4 | `hreflang` → a redirecting URL | Annotation dropped | `x-default` → `/ar/…`, never `/` |
| 5 | `hreflang` → a `noindex` page | Annotation dropped | Never emit `alternates.languages` on the theme's duplicate layouts (`listing-detail-v2`…`v5`, `home02`–`home10`, alternate browse views). Those already carry a cross-*layout* canonical per `lib/seo.js:32–42` — leave them out of the hreflang graph entirely. |
| 6 | `hreflang` → a locale where the page 404s | Annotation dropped | Only emit pairs for pages that exist in both. See §8 — this is why the Arabic shell must be complete before `/ar/` is announced. |
| 7 | Relative URLs without `metadataBase` | Malformed tags | `metadataBase` is already set in `app/layout.js:17` — keep it when moving to `[locale]` |
| 8 | `hreflang="ar-om"` (lowercase region) or `en-UK` | Invalid code, ignored | [VERIFIED] Google requires ISO 639-1 lowercase language + ISO 3166-1 Alpha-2 uppercase region, and lists "UK", "EU", "UN" as invalid. Avoided entirely by using language-only codes. |
| 9 | Sitemap and HTML `hreflang` disagree | Ambiguity | [VERIFIED] Google treats the three methods (HTML, HTTP header, sitemap) as *equivalent* — pick **one**. Recommendation: HTML tags only, since `metadata.alternates` gives them for free. Do **not** also add `<xhtml:link>` to `app/sitemap.js`. |

### Sitemap consequence

`apps/web/app/sitemap.js` currently emits one entry per canonical path. Under two locales it must emit **both** `/ar/…` and `/en/…` for every route it lists — otherwise half the site is absent from the sitemap. Keep its existing exclusion discipline (dashboard, `home02`–`home10`, `listing-detail-v2`–`v5`, alternate browse views); just double each surviving entry.

---

## 3. Arabic URL slugs

### What Google says

[VERIFIED] Google's *URL structure best practices* (last updated **2025-12-10**) is unusually specific here:

- *"Use words in your audience's language in the URL (and, if applicable, transliterated words)."*
- *"Characters in the non-ASCII range should be percent encoded."*
- Its own table marks percent-encoded Arabic (`%D9%86%D8%B9%D9%86%D8%A7%D8%B9`) as **recommended** and raw non-ASCII (`نعناع`) as **discouraged**.

So Google endorses Arabic-language slugs, provided they are percent-encoded in `href`. Crawlability is a solved problem — that is not the reason to avoid them.

### What the market actually does

[OBSERVED]

- **OpenSooq** — full Arabic, percent-encoded, mirrored segment-for-segment against the English tree:
  `om.opensooq.com/ar/مسقط/حراج-السيارات/سيارات-للبيع/تويوتا/كورولا`
  vs `om.opensooq.com/en/muscat/cars/cars-for-sale/toyota/corolla`
- **Hatla2ee** — Latin slugs on **both** locales: `oman.hatla2ee.com/ar/car/toyota/corolla`
- **YallaMotor** — Latin slugs: `oman.yallamotor.com/used-cars/muscat/toyota/corolla`
- **Dubizzle Oman** — Latin slugs on the ccTLD: `www.dubizzle.com.om/en/vehicles/cars-for-sale/toyota/muscat/q-corolla/`

Three of the four biggest players in this exact market use Latin slugs for Arabic content. OpenSooq is the outlier, and OpenSooq is also a pan-Arab platform with a decade of accumulated authority — it can afford a cost that a pre-launch site cannot.

### The measured cost

I built the real URLs and counted characters:

| Approach | Length | URL |
|---|---:|---|
| English slug | **59** | `https://autosouq.om/ar/used-cars/muscat/toyota-corolla-2015` |
| Raw Arabic (as displayed) | 61 | `https://autosouq.om/ar/سيارات-مستعملة/مسقط/تويوتا-كورولا-2015` |
| Transliterated | 67 | `https://autosouq.om/ar/sayarat-mustamala/masqat/toyota-corolla-2015` |
| **Percent-encoded Arabic (as transmitted, copied, and pasted)** | **206** | `https://autosouq.om/ar/%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA-%D9%85%D8%B3%D8%AA%D8%B9%D9%85%D9%84%D8%A9/%D9%85%D8%B3%D9%82%D8%B7/…` |

Arabic is a 3-byte-per-character UTF-8 script, so each Arabic letter becomes **9 ASCII characters** when percent-encoded. A listing detail URL goes from 58 to **138 characters**.

### Why this decides it: WhatsApp

NICHE.md makes WhatsApp the growth channel ("contacting a seller is one WhatsApp tap"; expat buyers "living on WhatsApp"). The unit of growth is a person pasting a car link into a chat.

[INFERRED] Three problems with percent-encoded Arabic in that context:

1. **A 138-character opaque hex string wraps to three or four lines in a chat bubble on a budget Android phone.** The message stops looking like a car and starts looking like spam. This site's entire differentiator is trust (NICHE.md) — an unreadable link is the wrong first impression, and no amount of ranking makes up for it.
2. **The decoded form only appears in the address bar.** The moment the URL is copied, shared, quoted, or logged, it is hex. Users copy from the share sheet, not from the address bar.
3. **Raw (unencoded) Arabic is worse, not better.** A URL whose path contains an RTL run inside an LTR context is subject to Unicode bidi reordering: the visual order of segments in a message bubble does not match the logical order. In an RTL chat bubble, trailing path segments can appear to the left of the domain. Users cannot verify what they are about to tap — and "can I trust this link" is exactly the question this brand needs answered *yes*.

[INFERRED] What is *not* at risk: linkification. Percent-encoded URLs are pure ASCII, so WhatsApp will auto-link them and generate a preview normally. And the preview card is driven by `og:title` / `og:description` / `og:image`, **not** by the slug — which means the Arabic keyword payload of a shared link lives in your Open Graph tags, where you keep 100% of it for free. This is the crux: **you lose almost nothing by giving up Arabic slugs, because the shared artefact users actually read is the OG card.**

### Recommendation

**Latin/English slugs in both locale trees. One shared slug per entity.**

```
/ar/used-cars/muscat/toyota-corolla-2015     ← Arabic page, Latin slug
/en/used-cars/muscat/toyota-corolla-2015     ← English page, same slug
```

Secondary benefits that are worth naming:

- **No CMS change.** `apps/cms/.../listing/schema.json:21` has exactly one `uid` slug field targeting the English `title`. Arabic slugs would need a second `slugAr` field, its own uniqueness constraint, its own collision handling for the many listings that will share `تويوتا كورولا 2015`, and an editorial process for filling it. Latin-only avoids all of it.
- **`hreflang` becomes a pure prefix swap** (§2), which structurally prevents failure modes 1, 2 and 6.
- **Car makes and models are already Latin in Omani usage.** "Toyota", "Corolla", "Nissan Sunny", "Prado" are written in Latin script in Arabic listings constantly. `toyota-corolla` is not foreign to an Arabic reader in this category.

**Reject transliteration** (`sayarat-mustamala`). It is longer than English, meaningless to English readers, unreadable to Arabic readers (nobody writes Arabic in Latin letters for search), and has no standard scheme — you would be inventing a romanisation nobody queries.

**One place to revisit later:** if Arabic-slug facet pages ever look worth testing, do it at the **facet level only** (`/ar/سيارات-مستعملة/مسقط`), never on listing detail. Facet URLs are shared far less often and are the pages where a keyword-in-URL SERP display could conceivably help. That is an experiment for month 6+, not a launch decision, and it would need its own `slugAr` on the taxonomy content-types only.

---

## 4. Numerals

### The `Intl.NumberFormat` behaviour, verified

I ran this on Node v26.5.0 with full ICU on 2026-07-25. Results are exact:

| Locale string | `format(2700)` | Resolved numbering system |
|---|---|---|
| `ar-OM` | `"٢٬٧٠٠"` | `arab` |
| `ar-SA`, `ar-EG` | `"٢٬٧٠٠"` | `arab` |
| **`ar-OM-u-nu-latn`** | **`"2,700"`** | **`latn`** |
| `ar` (bare) | `"2,700"` | `latn` |
| `en-OM` | `"2,700"` | `latn` |

[VERIFIED] Both prior claims hold: `ar-OM` defaults to Arabic-Indic digits, and `ar-OM-u-nu-latn` forces Latin.

⚠️ Note the bare-`ar` row. Bare `ar` resolves to `latn` in this ICU build — but that is a CLDR default that has changed historically and could change again. **Never rely on it.** Always write the extension explicitly.

**Exact locale string to use: `"ar-OM-u-nu-latn"`.**

Note also that `٬` (U+066C, Arabic thousands separator) and `٫` (U+066B, Arabic decimal separator) are *different codepoints* from `,` and `.`. Any string-matching, price-parsing or filter code that assumes ASCII punctuation breaks silently on `ar-OM` output.

### The OMR currency trap — verified, and it will bite

OMR has **three** ISO 4217 minor units. `Intl.NumberFormat` honours that:

```js
new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR" }).format(2700)
// → "OMR 2,700.000"      ← three decimal places
new Intl.NumberFormat("ar-OM", { style: "currency", currency: "OMR" }).format(2700)
// → "‏٢٬٧٠٠٫٠٠٠ ر.ع.‏"   ← Arabic-Indic + 3 decimals + two U+200F RLM marks
```

`"2,700.000 OMR"` on a used-car listing reads like a bank statement, not a price. You must set `maximumFractionDigits: 0`:

```js
new Intl.NumberFormat("ar-OM-u-nu-latn", {
  style: "currency", currency: "OMR", maximumFractionDigits: 0,
}).format(2700)
// → "‏2,700 ر.ع.‏"
```

That output still carries **two invisible RIGHT-TO-LEFT MARK characters (U+200F)**, one at each end. They are correct and necessary for display but must be stripped before the string goes anywhere a machine reads it — JSON-LD, `og:title`, analytics events, a `<title>` where they can bleed into surrounding text.

[INFERRED] Given that, and given `lib/format.js` already hand-builds the string, the cleanest path is to keep hand-building it rather than adopting `style: "currency"`:

```js
// apps/web/lib/format.js — locale-aware replacement
export const DEFAULT_CURRENCY = "OMR";

/**
 * Money as the marketplace shows it.
 *   en → "2,700 OMR"
 *   ar → "2,700 ر.ع."
 *
 * Latin digits in BOTH locales — see design/research/arabic-seo-strategy.md §4.
 * `ar-OM` would give ٢٬٧٠٠ with U+066C as the group separator; the explicit
 * `-u-nu-latn` extension forces `latn` (verified on ICU, 2026-07-25). Bare "ar"
 * happens to resolve to latn today but that is a CLDR default, not a promise.
 *
 * Deliberately NOT style:"currency" — OMR has 3 ISO-4217 minor units, so that
 * path yields "2,700.000" and wraps the result in U+200F marks that leak into
 * JSON-LD and og:title.
 */
const NUMBER_LOCALE = { ar: "ar-OM-u-nu-latn", en: "en-OM" };
const CURRENCY_LABEL = { ar: { OMR: "ر.ع." }, en: { OMR: "OMR" } };

export function formatNumber(value, locale = "en") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(NUMBER_LOCALE[locale] ?? NUMBER_LOCALE.en).format(n);
}

export function formatPrice(value, currency = DEFAULT_CURRENCY, locale = "en") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const label = CURRENCY_LABEL[locale]?.[currency] ?? currency;
  return `${formatNumber(n, locale)} ${label}`;
}

/** Years never take a thousands separator. 2015, never 2,015. */
export function formatYear(value, locale = "en") {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(NUMBER_LOCALE[locale] ?? NUMBER_LOCALE.en, {
    useGrouping: false,
  }).format(n);
}
```

⚠️ `formatPrice` is currently called with a 2-arg signature across the app. Adding `locale` as a third parameter keeps every existing call site working (defaults to `"en"`) but means **every call site must be revisited** or Arabic pages silently render English formatting. Grep for `formatPrice(` as part of the §9 Phase 3 work.

⚠️ Year is the trap people miss: `formatNumber(2015)` → `"2,015"`. Use `formatYear`.

### Latin or Arabic-Indic? — Latin, everywhere

**In `<title>` and meta: Latin. This is settled by evidence, not preference.**

[OBSERVED] Live SERP titles from OpenSooq's Arabic pages, verbatim:

- `1,236 سيارات تويوتا كورولا مستعملة للبيع في عُمان : السعر ابتداءً من 3,891 ريال عماني`
- `208 سيارات تويوتا كورولا مستعملة للبيع في مسقط : السعر ابتداءً من 3,455 ريال عماني`
- `45 سيارات تويوتا كورولا 2022 مستعملة للبيع في عُمان : السعر ابتداءً من 4,800 ريال عماني`

Every count, every price, every model year: **Latin digits with an ASCII comma**, inside a fully Arabic title. The regional market leader, on its highest-value templated pages, in the exact vertical. Their URL year segments are Latin too (`/كورولا/2025`).

[OBSERVED] Hatla2ee's Arabic title — `سيارات مستعملة للبيع في عمان (سوق السيارات)` — and Dubizzle's — `7070 سيارات للبيع في عُمان` — same pattern.

**In body copy: Latin.** [INFERRED] Consistency with the title matters more than either choice on its own. A price rendered ٢٬٧٠٠ in the body and 2,700 in the `<title>` is two different-looking prices for the same car — on a site whose promise is *"the price you see is the real price."* That is a trust cost, not a typography preference. It also breaks Ctrl-F: a user who searches the page for "2700" finds nothing.

**In structured data: Latin, mandatory.** Schema.org numeric properties (`price`, `mileageFromOdometer.value`, `engineDisplacement.value`) are **numbers**, not display strings. `lib/seo.js:288` already emits `price` as a JS number, which serialises to `2700` — correct and locale-independent. Do not change it. Do not pass a formatted string. Do not let the Arabic formatter anywhere near JSON-LD.

Also: `vehicleModelDate` and `productionDate` are emitted as `String(car.year)` (`lib/seo.js:257–258`). `String(2015)` is `"2015"` — Latin. Correct. If anyone "helpfully" routes those through the locale formatter, `"٢٠١٥"` is not a valid schema.org date and the property becomes garbage.

**What Google indexes:** [UNVERIFIED] I found no Google documentation stating a position on Arabic-Indic numerals in indexed text. Do not let anyone claim otherwise without a citation. The argument for Latin here rests on (a) OpenSooq's observed behaviour, (b) title/body consistency, and (c) structured-data correctness — not on a Google statement.

**What Omani users expect:** [INFERRED] Arabic-Indic digits are read fluently by Omani Arabic readers — this is not a comprehension question. But Gulf digital contexts (prices, phone numbers, plate numbers, banking apps, classifieds) are overwhelmingly Latin-digit, and the market leaders in this exact vertical ship Latin. I have **no survey data** and none is invented. If this matters enough to test, it is a cheap A/B on the price component post-launch.

### Bidi hygiene in Arabic titles

An Arabic string containing Latin runs (digits, "Toyota", "OMR") is a bidirectional string. `<title>` cannot carry markup, so you cannot use `<bdi>` there.

Practical rules:

1. **Never begin or end an Arabic title with a Latin run.** A trailing `2,700 OMR` will visually jump to the left-hand edge. `تويوتا كورولا 2015 للبيع في مسقط — 2,700 ر.ع.` ends with the Arabic `ر.ع.`, which anchors it correctly.
2. **Put Arabic words between Latin runs.** `2015 تويوتا كورولا` is fine; `Toyota Corolla 2015 2,700` is not.
3. **In HTML body copy, wrap Latin runs**: `<bdi>` for isolation, or `<span lang="en" dir="ltr">` when the run is genuinely English words (see §8 — this doubles as a language-annotation win).
4. **Strip U+200F / U+200E before JSON-LD, `og:title`, and analytics.** Add a `stripBidi()` helper next to `compact()` in `lib/seo.js` and run every string field through it.

---

## 5. Arabic keyword research for this niche

### Method and its limits

I ran live Arabic queries and read the returned URLs and `<title>` tags. That gives me **the exact phrasing incumbents optimise for**, which is a stronger signal than a keyword tool for a market this small — these are terms competitors have already validated with their own traffic.

**It gives me no volumes.** No number in this section is a search volume, because I have none. Anyone who hands you Omani-Arabic search volumes for these terms without showing their tool export is guessing.

To get real numbers: Google Keyword Planner with location = Oman and language = Arabic (needs a live Ads account for un-bucketed data), cross-checked against Google Trends Oman, then replaced entirely by Search Console query data within ~8 weeks of `/ar/` being indexed. Search Console will be the only trustworthy source, and it costs nothing.

### The term that matters most, and that you would probably have missed

**حراج (ḥarāj)** — the Gulf word for a classifieds market / auction souq.

[OBSERVED] It is the **top-level Arabic category segment in OpenSooq's own URL tree**: `om.opensooq.com/ar/حراج-السيارات/سيارات-للبيع/…`, mirroring `…/en/cars/cars-for-sale/…`. Their English tree says `cars`; their Arabic tree says `حراج السيارات` — a *car souq*, not a *cars section*.

[INFERRED] This is the single strongest keyword finding in this research. It is the native, non-translated, market-specific term, and it is also exactly the brand's positioning — NICHE.md asks for *"a knowledgeable, honest friend at the car souq."* The Arabic site's own name for its browse page should probably be **حراج السيارات في عُمان**, not the dictionary translation.

> **[OBSERVED 2026-08-04 — do not act on the paragraph above.]** The inference
> was tested against Google autocomplete on `client=chrome&hl=ar&gl=om` and does
> not survive. حراج is a real, heavily-searched term; its demand is **Saudi and
> Emirati**, not Omani:
>
> | Query | Completions | What they are |
> |---|---|---|
> | `حراج السيارات` | 15 | الشارقة, السعودية, الرياض, الدمام — every one Saudi or UAE |
> | `حراج` | 15 | حراج السعودية, حراج الامارات, حراج عمان (and عمان here is ambiguous — see the Amman warning below) |
> | `حراج السيارات عمان` | 3 | one of which is explicitly `حراج السيارات عمان الاردن` |
>
> Against `سيارات مستعملة` → 15 completions led by `…للبيع في عمان`,
> `…للبيع في مسقط`, `…للبيع في صلالة`.
>
> What the [OBSERVED] paragraph above records is still true: حراج *is* the
> segment in OpenSooq's Arabic URL tree. But that is OpenSooq's information
> architecture, not Omani search demand, and the two were conflated here. This
> is the same error NICHE.md logged on 28 Jul — reading a competitor's
> navigation as evidence of what people type. **Do not rename the browse page.**
> `سيارات مستعملة` / `سيارات للبيع` carry the Omani demand.

### Observed term inventory

Every Arabic string below appeared in a live SERP title or URL during this research. Nothing here is from memory.

**Head terms — category**

| Arabic | Gloss | Where observed |
|---|---|---|
| سيارات مستعملة للبيع | used cars for sale | Hatla2ee Oman title |
| سيارات للبيع | cars for sale | OpenSooq URL segment `/سيارات-للبيع/`; Dubizzle title |
| حراج السيارات | car classifieds/souq | OpenSooq URL segment |
| سوق السيارات | the car market | Hatla2ee title `(سوق السيارات)` |
| سيارات مستعملة | used cars | OpenSooq title |
| سيارات رخيصة | cheap cars | Omanista title |

**رخيصة ("cheap") is now usable in copy.** *Superseded 28 Jul 2026 — this paragraph
previously read "a keyword you must not use in copy" and instructed readers not to break
that rule for traffic. The rule was lifted deliberately, not quietly; see NICHE.md.*

Users search it and incumbents rank for it, and later autocomplete work (gl=OM) found it is
the phrasing Omani buyers actually use — while `أقل من X`, the shape this document elsewhere
treats as the price-query pattern, returns **no Oman completions** and resolves to
UAE/Egypt. Competitor IA had been read as demand evidence; it is not the same thing.

Use it where it matches the query — titles, meta, headings. Keep **بأسعار مناسبة** /
**في المتناول** for how the brand describes itself. The constraint that remains is on the
claim, not the adjective: the price must be real and the listing checked.

**Geography — and a genuine trap**

| Arabic | Gloss | Note |
|---|---|---|
| عُمان | Oman (with damma on the ʿayn) | [OBSERVED] Used in OpenSooq's **titles** |
| عمان | Oman **or Amman, Jordan** — ambiguous | [OBSERVED] Used in OpenSooq's **URLs**, and by Hatla2ee/Yallamotor |
| سلطنة عمان | Sultanate of Oman — unambiguous | [OBSERVED] OpenSooq tag: `سيارات-تكملة-اقساط-في-سلطنة-عمان` |
| مسقط | Muscat | [OBSERVED] OpenSooq path segment `/ar/مسقط/` |

⚠️ **عمان without diacritics is orthographically identical to عمّان (Amman, Jordan)** — the only difference is a shadda that nobody types. This is a real, structural Arabic-SEO hazard for an Omani site, and it is the kind of thing a non-Arabic-reading team ships without noticing.

[INFERRED] Mitigation, and note the incumbents already do exactly this: use **عُمان** (with the damma) in `<title>` and `<h1>`, add **سلطنة عمان** in the H1 or opening sentence of every geo page, and always pair with a city (مسقط، صلالة، صحار، نزوى، صور، البريمي). The city term is unambiguous and carries the local intent anyway.

**Body types** — [OBSERVED] an Arabic-language result explicitly listed body styles as *"صالون/سيدان وهاتشباك وكوبيه وSUV"*:

| Arabic | Gloss |
|---|---|
| صالون / سيدان | saloon / sedan (both forms in live use, same page) |
| هاتشباك | hatchback |
| كوبيه | coupé |
| SUV | left in Latin |

⚠️ [UNVERIFIED] **دبل / دبل غمارة** (double-cab pickup) was in the brief but **did not appear in any result I retrieved.** It is a well-attested Gulf classifieds term, but I did not confirm it in Omani car-listing context in this pass, and it is also less relevant to a OMR 1,500–6,000 passenger-car band. A native Omani speaker should confirm before it goes into a taxonomy. Do not ship it on my say-so.

**Spec / origin — already correct in the codebase**

`apps/web/lib/listingLabels.js:8–13` already ships خليجي / وارد أمريكي / وارد اليابان. [OBSERVED] Arabic search results in this pass independently used **خليجية** and **أمريكية المواصفات** for the same distinction, and recommended *"التركيز على السيارات الخليجية (GCC spec)"* for heat tolerance. That file's terms are the right ones — treat it as the canonical glossary and extend it, don't re-derive.

Additional observed terms in this cluster: **وكالة** (agency — dealer-supplied/serviced, a positive trust signal in Gulf listings), **مستورد / استيراد** (imported/import), **جمرك / التخليص الجمركي** (customs / customs clearance) [OBSERVED on customs.gov.om and importer sites].

[INFERRED] **وكالة deserves its own filter facet.** In Gulf usage it means the car came through the official local agency rather than a grey import — which is exactly the honest-disclosure axis NICHE.md is built on, sitting right next to خليجي / وارد أمريكي. It is a trust term, not a spec term, and this site's whole thesis is trust.

**Adjacent cluster to decide about**

[OBSERVED] OpenSooq maintains a dedicated tag page: `سيارات تكملة اقساط في سلطنة عمان` (*cars with instalments to complete* — taking over someone's remaining finance payments). NICHE.md describes cash buyers, so this is arguably out of scope. But it is a **real, high-intent, budget-band Omani query cluster with a competitor page built for it**, and it overlaps heavily with the OMR 1,500–6,000 audience. Flagging it as a deliberate decision rather than an oversight.

⚠️ Note the spelling in that URL: **اقساط**, not أقساط — **no hamza on the alif**. This is direct evidence of how users type (see below).

### Dialect vs MSA, and what it means for typed queries

[VERIFIED] Gulf Arabic (Khaleeji) is the spoken register across Oman, Saudi, UAE, Qatar, Kuwait and Bahrain — *"the language of everyday communication"* — while MSA is *"used in formal contexts such as education, official documents, and news media"*. Gulf Arabic *"retains some classical Arabic features that other dialects have dropped."*

[INFERRED] The consequence for this site:

1. **Typed queries in this vertical skew MSA.** Every incumbent title and URL I observed — سيارات مستعملة للبيع، حراج السيارات، سيارات للبيع — is MSA. Gulf speakers do not type their spoken register into a search box for a commercial query; they type the written register they read on classifieds sites. **Write the site in MSA.**
2. **Except where a Gulf term has no MSA equivalent in this domain.** حراج is Gulf, not MSA, and it is the term OpenSooq builds its Arabic URL tree around. Same for خليجي and وكالة. The rule is: *MSA grammar and syntax, Gulf domain vocabulary.*
3. **Voice search is where dialect shows up.** [INFERRED] NICHE.md's audience is on budget Android phones, where voice input is common and typing Arabic on a small keyboard is slow. Voice queries transcribe closer to speech. This is an argument for FAQ-style content answering conversational questions (`كم سعر تويوتا كورولا مستعملة في مسقط؟`) rather than for changing your keyword targets. `data/faqs.js` already exists as the vehicle for it.

### Orthographic variation — plan for it, don't fight it

[VERIFIED] Arabic search normalisation across systems standardly collapses: hamza variants (أ إ آ ئ ؤ) to bare forms; alif maqsura ى to ya ي; teh marbuta ة to ha ه; and strips diacritics entirely, *"which are generally omitted in most contemporary writing, leading to high lexical ambiguity."*

[OBSERVED] OpenSooq's own live URL spells it **اقساط** (no hamza) — a market leader encoding the un-hamza'd form users actually type.

[INFERRED] What to do:

- **Do not chase spelling variants with separate pages.** Google normalises Arabic; you would be building duplicate content to catch a variant Google already handles.
- **Do normalise in your own site search and filters.** Any internal search that requires an exact match on أقساط will silently fail for a user who typed اقساط. Normalise both the index and the query: strip diacritics (U+064B–U+0652), map أإآ→ا, ى→ي, ة→ه.
- **Write content in the standard hamza'd spelling.** That is what a human editor expects; the normaliser handles the rest.
- ⚠️ **Do not normalise عُمان.** The damma is the one diacritic doing real disambiguating work on this site (Oman vs Amman). Keep it in titles and headings.

---

## 6. RTL implementation

### `dir` placement

[VERIFIED] Bootstrap 5.3's official RTL guidance requires exactly two things: `dir="rtl"` on `<html>`, and an appropriate `lang` attribute such as `lang="ar"` on `<html>`.

```jsx
<html lang="ar" dir="rtl">
```

Both come from the `[locale]` segment (code in §2). Not from a client-side effect, not from `useEffect` — the attribute must be in the server-rendered HTML or the first paint is LTR and the page visibly reflows. On a slow Android connection that reflow is very visible.

Never set `dir` on `<body>` or a wrapper: `dir` on `<html>` is what makes `position: fixed` elements, the scrollbar side, and native form controls flip.

### The `rtlcss` claim — verified, with a correction

I tested this directly on 2026-07-25 with `rtlcss@4.3.0` against `bootstrap@5.3.3`:

```
rtlcss.process(bootstrap.css)  vs  bootstrap.rtl.css
byte-identical:  false
generated:       280,256 bytes
official:        280,259 bytes
diff:            1 line
```

The **only** difference is the trailing sourcemap comment (`/*# sourceMappingURL=bootstrap.css.map */` vs `…bootstrap.rtl.css.map`). Every CSS declaration in the file is identical.

**Correction for the record:** "byte-for-byte" is technically false; **"declaration-for-declaration identical, differing only in the sourcemap comment"** is true. The practical conclusion the prior research drew is correct and now confirmed: `rtlcss` reproduces Bootstrap's official RTL build exactly, so running it over the *whole* compiled bundle handles Bootstrap and the custom theme in one pass, with no risk of the two drifting apart.

[VERIFIED] Bootstrap ships `bootstrap.rtl.css` in `dist/css/` already (present in `node_modules`). But the theme does **not** consume Bootstrap from `node_modules` — `public/assets/scss/style.scss:15` `@import`s a *vendored* copy at `public/assets/css/bootstrap.css` (293,102 bytes vs the 276 KB npm original — 17 KB of theme modifications). So swapping in the official `bootstrap.rtl.css` would **lose the vendored edits**. Run `rtlcss` over your own compiled output instead.

### The actual scale of the RTL job

Measured across `public/assets/scss/**/*.scss` (17 files, 352 KB) on 2026-07-25:

| Pattern | Count | rtlcss handles it? |
|---|---:|---|
| `margin-left` / `margin-right` | 321 | ✅ automatic |
| `left:` / `right:` (positioning) | 225 | ✅ automatic |
| `padding-left` / `padding-right` | 101 | ✅ automatic |
| `border-left*` / `border-right*` | 21 | ✅ automatic |
| `text-align: left/right` | 13 | ✅ automatic |
| `float: left/right` | 6 | ✅ automatic |
| `translateX(…)` / `translate(x, y)` | 33 | ⚠️ **partial** — rtlcss flips `translateX` but cannot know whether a `translate(-50%, -50%)` centring transform should flip |
| `box-shadow` with non-zero x-offset | 68 | ⚠️ **partial** — flips the sign, which is usually right but visually wrong for shadows meant to read as a fixed light source |
| **Total physical-direction declarations** | **~687** | |
| **Logical properties already used** | **0** | |

[INFERRED] `rtlcss` mechanically resolves roughly 85–90% of this. The residual is ~100 declarations concentrated in transforms and shadows, each needing a human eye. That is the real RTL budget — not the Bootstrap grid, which is free.

### The pipeline

**Do not use rtlcss's single-file `.ltr`/`.rtl` scoping mode.** [VERIFIED] Bootstrap's own docs warn that loading both directions is *"a performance bottleneck"*, and that the PostCSS RTLCSS plugin approach produces a *"20%-30% larger stylesheet bundle."* On a ~490 KB CSS payload served to budget Android phones on metered data, 20–30% is 100–150 KB of pure waste for every user — half of whom will never see the other direction.

**Emit two files; ship one per request.**

```
app.css       ← existing compiled output (LTR)
app.rtl.css   ← rtlcss(app.css), generated at build time
```

Wire it as a build step in `apps/web/package.json`:

```json
"scripts": {
  "css:rtl": "rtlcss public/assets/css/app.css public/assets/css/app.rtl.css",
  "build": "npm run css:rtl && next build"
}
```

Then load conditionally from `app/[locale]/layout.js` based on the locale param. One `<link>`, chosen server-side, no flash, no double download.

⚠️ Because `style.scss` imports Bootstrap and five other vendor CSS files inline, the compiled bundle is a single file and rtlcss processes it whole — which is what you want. But it also means **the vendor CSS gets flipped too**: `swiper-bundle.min.css`, `nice-select.css`, `magnific-popup.css`, `jquery.fancybox.min.css`, `animate.css`. Verify each visually. `animate.css` in particular contains directional keyframes (`fadeInLeft`, `slideInRight`) that rtlcss will flip, which for a `wow.js`-driven entrance animation is probably correct but should be eyeballed. Note `ClientShell.jsx` initialises `wow.js` on every route change.

### Logical properties

New code — new components, and anything you touch during this migration — should use logical properties directly:

| Physical | Logical |
|---|---|
| `margin-left` | `margin-inline-start` |
| `padding-right` | `padding-inline-end` |
| `left: 0` | `inset-inline-start: 0` |
| `text-align: left` | `text-align: start` |
| `border-left` | `border-inline-start` |

Logical properties need no rtlcss pass at all, so every one you write shrinks the flippable surface. [INFERRED] But do **not** do a big-bang rewrite of the 687 existing declarations — rtlcss already handles them correctly, and a mass find-and-replace across 17 SCSS files is a large regression surface for zero user-visible gain. Convert opportunistically.

Bootstrap 5's utility classes already use logical naming (`.ms-3`/`.me-3` for start/end) — [VERIFIED] this is a documented deliberate decision. ⚠️ Audit the theme's JSX for any surviving Bootstrap **4** directional classes (`.ml-3`, `.pr-2`, `.text-left`, `.float-right`). Those are physical, are not in Bootstrap 5, and will not flip.

### Icon and chevron mirroring

Good news, measured: the theme uses **only 3 distinct directional icon classes**, from its own icon font:

| Class | Call sites |
|---|---:|
| `icon-autodeal-btn-right` | 31 |
| `icon-autodeal-next` | 18 |
| `icon-autodeal-right2` | 2 |

51 call sites, one CSS rule:

```css
/* Directional glyphs mirror; everything else must not.
   A flipped user/phone/heart/star icon looks broken, not localised. */
[dir="rtl"] .icon-autodeal-btn-right,
[dir="rtl"] .icon-autodeal-next,
[dir="rtl"] .icon-autodeal-right2 { transform: scaleX(-1); }
```

⚠️ Put this in a hand-written RTL overrides file **after** the rtlcss output, not in the source SCSS — otherwise rtlcss will flip the `scaleX(-1)` back to `scaleX(1)` and cancel your fix. This is the classic rtlcss own-goal.

**What must NOT mirror**, even though it is tempting to bulk-flip: brand logos, the WhatsApp glyph, phone/user/heart/star/gear icons, photographs, and car images. Also: **media playback controls stay LTR** — play/pause/seek are a universal convention, not a reading-direction one.

### What specifically breaks in a Bootstrap theme under RTL

[VERIFIED] from Bootstrap's own RTL docs:

- The feature is **still labelled experimental**: *"Bootstrap's RTL feature is still experimental and will evolve based on user feedback."*
- The `form-validation-state()` mixin *"doesn't work as intended"* with nested styles and needs manual tweaking (upstream issue #31223). Relevant: `add-listing` and `contact` both have forms.
- `$breadcrumb-divider-flipped` is the one case Bootstrap needed a brand-new variable for. Breadcrumbs are on every listing page and carry `BreadcrumbList` JSON-LD (`lib/seo.js:178`).

[INFERRED] from the audit, in likely-severity order:

1. **Swiper carousels — 35 files use Swiper.** Swiper needs `dir="rtl"` on its container *and* re-initialisation when direction changes; it computes slide offsets in JS, so CSS flipping alone leaves the track sliding the wrong way. Highest-risk item in the whole migration, and it is on the homepage hero, the listing gallery, and the brand strip. Budget real time here.
2. **`rc-slider` price range** (`components/common/Pricing.jsx`) — needs its `reverse` prop under RTL, otherwise the min and max handles swap meaning. On a price-band marketplace, a price filter that runs backwards is a critical bug, not a cosmetic one.
3. **PhotoSwipe gallery** — swipe direction and the next/prev buttons.
4. **68 `box-shadow` declarations with x-offsets** — rtlcss flips the sign; verify the ones meant as a consistent light source.
5. **33 `translate` transforms** — centring transforms must not flip; slide-in transforms must.
6. **The sticky header** (`ClientShell.jsx` measures `.header-lower` and injects a spacer) — verify it under RTL; it manipulates layout imperatively.
7. **Google Maps** (`@react-google-maps/api`, on the two `*-map` browse routes) — the map canvas stays LTR by design; only the surrounding chrome flips.
8. **`::before` / `::after` arrow glyphs** used as CSS content — these are text, so bidi affects them; rtlcss will not know a `content: "→"` needs to become `"←"`.
9. **`text-transform: uppercase`** (2 occurrences) — a harmless no-op on Arabic, but check it is not applied to a mixed-script string where it would uppercase only the Latin half.
10. **`letter-spacing`** — measured **0 non-zero occurrences** in the theme SCSS, so you are safe today. ⚠️ But make it a review rule: **`letter-spacing` on Arabic text breaks cursive letter joining**, splitting connected glyphs into disconnected stumps. It renders Arabic as visibly broken. Never add it to a selector that can receive Arabic.

### Fonts — measured, and the conclusion is not what you expect

The brief flagged "a 400 KB Arabic font is a real decision." **Measured, that number is off by an order of magnitude.** All figures below are real bytes from the `@fontsource` packages (the unmodified Google Fonts WOFF2 binaries), arabic subset, measured 2026-07-25:

| Font | 400 wt | 500 wt | 700 wt | Total (400+700) | Glyphs | Arabic codepoints |
|---|---:|---:|---:|---:|---:|---:|
| **Tajawal** | 8,932 | 8,940 | 9,024 | **17.9 KB** | 190 | 183 |
| **Cairo** | 13,292 | 13,892 | 13,952 | **27.2 KB** | 393 | 297 |
| **Almarai** | 31,672 | — | 32,912 | **64.6 KB** | 290 | 254 |
| **IBM Plex Sans Arabic** | 42,848 | 45,296 | 44,280 | **87.1 KB** | 1,304 | 636 |
| **Noto Kufi Arabic** | 43,940 | 47,396 | 43,872 | **87.8 KB** | 1,336 | 1,076 |
| **Noto Sans Arabic** | 48,840 | 53,120 | 50,228 | **99.1 KB** | 1,400+ | — |
| *Inter (latin, for scale)* | *23,664* | *24,272* | *24,356* | *48.0 KB* | — | — |

All six contain the Arabic-Indic digits ٠–٩ (U+0660–0669); all but Tajawal also carry the extended Persian forms ۰۱ (U+06F0+).

**Put this in the context of what the site already ships:** `public/assets/fonts/` contains Font Awesome at **190 KB + 174 KB + 141 KB WOFF2** across three weights — **505 KB of icon font**. An Arabic text font at 27 KB is **5% of the icon font already on the wire.**

[INFERRED] **The font-budget conversation on this site is not about Arabic. It is about Font Awesome.** Subsetting FA to the icons actually used, or replacing it with inline SVG, would free 400+ KB — more than fifteen times what the Arabic font costs. If metered data is a real constraint (NICHE.md says it is), that is the ticket to write, and the Arabic font should not be blocked behind it.

**Recommendation: Cairo 400/700, self-hosted, 27.2 KB total.**

- Sized right (27 KB), Latin-sans-compatible proportions, 297 Arabic codepoints is comfortably enough for MSA Omani copy.
- ⚠️ Its 393 total glyphs is a genuinely small glyph repertoire — thin on contextual ligature alternates. For UI text at 14–18px this is fine; if you later want display typography with rich Arabic ligatures, revisit.

**Alternative: IBM Plex Sans Arabic 400/700, 87 KB.** Triple the glyph coverage (1,304), noticeably better typographic quality, still trivially small next to Font Awesome. [INFERRED] If Font Awesome gets subsetted first, take Plex — you will be net hundreds of KB ahead and the Arabic will look better. **Note Plex Arabic is designed to pair with IBM Plex Sans, not with Inter** — pairing it with Inter is defensible but is a design call, not a technical one. Coordinate with whoever owns `design/tokens.md`.

**Reject Noto Kufi Arabic** for body text. Kufi is a geometric display style; 1,076 Arabic codepoints is coverage you do not need, and Kufi at small sizes on a low-DPI Android screen is harder to read than a Naskh-derived face.

**Loading rules:**

1. **Self-host via `next/font/local`.** ⚠️ `public/assets/scss/style.scss:15` currently `@import url("https://fonts.googleapis.com/css2?…")` **inside the stylesheet**. That is a render-blocking third-party request chained behind the CSS download — the worst possible position on a slow connection. Fixing that will do more for Omani mobile performance than any font choice. Move Inter, Outfit **and** the Arabic face to `next/font`, which self-hosts and inlines the `@font-face` rules with zero extra round trips.
2. `font-display: swap` — [INFERRED] on a metered 3G connection, the alternative is invisible text.
3. Load the Arabic face **only on `/ar/`**. `next/font` in `app/[locale]/layout.js` keyed on the locale param.
4. `unicode-range` on the Arabic face so a stray Latin character in Arabic copy falls through to Inter rather than rendering in the Arabic font's 5-glyph Latin stub.
5. **`line-height: 1.7`–`1.8` for Arabic body text** vs the Latin 1.5. Arabic has taller ascenders, deeper descenders, and dot/diacritic marks that collide at Latin leading. This is the single most-missed Arabic typography detail and it makes the difference between "translated" and "designed in Arabic."

---

## 7. Structured data in Arabic

### The rule

**One JSON-LD graph per page, entirely in that page's language. Never both languages on one page.**

[INFERRED, community consensus not Google doc] Emitting an Arabic and an English `Car` node on the same URL gives a parser two competing names for one entity. The multilingual-schema consensus is: identical JSON-LD *structure*, localised *text*, per-locale URLs.

[VERIFIED] Google's General Structured Data Guidelines require that structured data describe the content of *that* page and that it not markup information not visible to the user. An Arabic page carrying an English `name` violates the spirit of that directly.

### `inLanguage` — where it goes and where it does not

⚠️ **`inLanguage` is not a valid property on `Car`.** In schema.org its domain is `CreativeWork` (and `Event`, `LinkRole`). `Car` is a `Product`/`Vehicle`, not a `CreativeWork`. Putting `inLanguage` on the `Car` node in `vehicleJsonLd()` would be invalid and is dropped by parsers.

Correct placement:

| Node | `inLanguage` | Value |
|---|---|---|
| `WebSite` | ✅ | The site's languages |
| `WebPage` | ✅ | **This page's single language** |
| `Organization` | ❌ | Not a `CreativeWork` |
| `Car` / `Vehicle` | ❌ | Not a `CreativeWork` |
| `Offer` | ❌ | Not a `CreativeWork` |
| `BreadcrumbList` | ❌ | Not a `CreativeWork` (localise the `name` values instead) |

### Concrete changes to `apps/web/lib/seo.js`

**`webSiteJsonLd()` — line 166** currently has `inLanguage: ["en-OM", "ar-OM"]`.

[INFERRED] Keep the array on the `WebSite` node — it is a true statement about the site as a whole and `WebSite` is a `CreativeWork`, so the property is valid. ⚠️ But make the codes consistent with your `hreflang` (§2, which uses language-only `ar`/`en`). Mixed signals across `hreflang` and schema is the exact inconsistency the multilingual-schema guidance warns about. Change to `["ar", "en"]`, Arabic first.

**Add a `WebPage` node** — this is where the per-page language declaration belongs, and it does not exist yet:

```js
/**
 * WebPage — the per-page language declaration.
 *
 * `inLanguage` goes HERE, not on Car/Offer/Organization: schema.org scopes
 * inLanguage to CreativeWork, and Car is a Product subtype (schema.org/Car,
 * schema.org/inLanguage — checked 2026-07-25). Single-valued: this URL is one
 * language. The bilingual statement lives on the WebSite node.
 *
 * Codes match the hreflang set exactly ("ar"/"en", not "ar-OM"), because a
 * schema language that disagrees with the hreflang annotation is a
 * contradiction a parser has to resolve for us.
 */
export function webPageJsonLd({ path, locale, title, description }) {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: title,
    description,
    inLanguage: locale,                                  // "ar" | "en"
    isPartOf: { "@id": absoluteUrl("/") + "#website" },
    about: { "@id": absoluteUrl("/") + "#organization" },
  });
}
```

**`vehicleJsonLd()` — `name`, `description`, and every taxonomy label** must come from the page's locale. Today `toCar()` already does this via the `locale` param (`lib/strapi.js:67`), so the fix is to make sure the *page* passes the right locale down and that `specLabel()` (`lib/seo.js:211`) stops hard-coding `.en`:

```js
// lib/seo.js:210-213 — currently returns IMPORT_ORIGIN[origin].en unconditionally
function specLabel(origin, locale = "en") {
  return origin && IMPORT_ORIGIN[origin] ? IMPORT_ORIGIN[origin][locale] : null;
}
```

On an Arabic page, `vehicleConfiguration` should read `خليجي`, not `"GCC spec"` — otherwise the JSON-LD contradicts the visible page, which is precisely what Google's guidelines prohibit.

**Numbers stay Latin.** `price: 2700` (a JS number), `mileageFromOdometer.value: 185000`, `String(car.year)` → `"2015"`. Never route these through the Arabic formatter. `"٢٠١٥"` is not a valid date value. (§4)

**Strip bidi marks.** Any string field entering JSON-LD must be free of U+200F/U+200E. Add `stripBidi()` alongside `compact()` and call it on every string.

**`Organization` @id stays stable.** `absoluteUrl("/") + "#organization"` in *both* locales — it is one company, not two. Localise its `description` per page; leave `name` ("Autosouq.om"), `url` and `logo` identical. [INFERRED] Low risk: Google merges by `@id` and takes the page-language rendering. Do **not** mint `/ar/#organization` and `/en/#organization` — that asserts two separate companies.

**`BreadcrumbList`** — localise the `name` values (`الرئيسية / سيارات مستعملة / تويوتا كورولا`), and note the `item` URLs must carry the `/ar/` prefix. `breadcrumbJsonLd()` builds these from `absoluteUrl(crumb.path)` (`lib/seo.js:188`), so the paths passed in must already be locale-prefixed.

### On the vehicle rich result

`lib/seo.js:216–232` already documents that Google removed the vehicle-listing rich result on 2025-09-09 and that this block buys no Google rich result today. That analysis is unaffected by locale and I have nothing to add — except that it strengthens the case for keeping the JSON-LD *small* on Arabic pages too, since the payload cost is real on metered data and the rich-result payoff is currently zero.

---

## 8. Sequencing

### The question, answered directly

**Is "Arabic UI shell + English listing content" acceptable?**

**Not as an indexed, publicly-launched state. Yes as a private beta.** But the framing hides the more important point, so let me reframe it.

### The reframe: you will never have 100% Arabic listing bodies

Seller-supplied free text will always be a mix of Arabic, English, and both-in-one-paragraph. `descriptionAr` will be empty on a large fraction of listings forever. Any plan that says "wait until listings are bilingual" waits forever.

So "wait for full Arabic" is not a real option, and the real question becomes: **which parts of an Arabic listing page do you control absolutely?**

Answer: everything except the seller's free-text description.

- `<title>`, `<h1>`, meta description — you generate these from **structured fields** (make, model, year, price, mileage, city, transmission, spec origin). Every one of those is a taxonomy relation with a `nameAr` column, or a number.
- All UI chrome, filters, labels, trust badges, breadcrumbs, FAQ.
- `lib/listingLabels.js` — already fully bilingual.

**Therefore: an Arabic listing page can have genuinely Arabic primary content on 100% of listings from day one, regardless of what sellers type.** Build `listingTitle()` and `listingDescription()` (`lib/seo.js:306`, `:317`) as locale-aware generators over structured fields and the SEO problem is solved independently of seller behaviour.

Example, entirely from structured data on a listing with no `descriptionAr`:

```
<title>  تويوتا كورولا 2015 للبيع في مسقط — 2,700 ر.ع. | Autosouq.om
<h1>     تويوتا كورولا 2015
<meta>   تويوتا كورولا 2015 في مسقط: 2,700 ر.ع.، 185,000 كم، أوتوماتيك، خليجي.
         إعلان موثّق. راسل البائع على واتساب.
```

That is a real Arabic page. Only the seller's paragraph is missing.

### What to do with the seller's English paragraph on an Arabic page

Three options, ranked:

1. **Best — mark it honestly.** Render it wrapped and labelled:
   ```html
   <p class="listing-note">هذا الوصف كتبه البائع بالإنجليزية:</p>
   <div lang="en" dir="ltr">Clean car, single owner, service history available…</div>
   ```
   The `lang="en" dir="ltr"` is not decoration: it fixes bidi rendering, it tells screen readers to switch voice, and it tells Google this run is a foreign-language quotation rather than evidence that your "Arabic" page is English. **And it is on-brand** — NICHE.md's differentiator is honesty, and "the seller wrote this in English" is a true, useful statement.
2. **Acceptable — omit it** and show only structured facts, with a "contact the seller for details" CTA.
3. **Never — silently render English text as if it were the Arabic page's content.** This is exactly the bug that produced `DEFAULT_LOCALE`, just at field granularity instead of page granularity.

### The `DEFAULT_LOCALE` fix is right but stops one level short

`lib/strapi.js:48` correctly identified the disease. But `pick()` (`lib/strapi.js:52–54`) still returns a bare string, so a caller cannot tell whether it got Arabic or a fallback:

```js
function pick(locale, ar, en) {
  return (locale === "ar" ? ar || en : en || ar) || null;
}
```

[INFERRED] Return the language alongside the value so the UI can annotate it:

```js
/**
 * Prefer the requested language; fall back so a listing with only an English
 * title still renders. Returns the language that was ACTUALLY used, because a
 * fallback value must be marked `lang`/`dir` in the DOM, not passed off as the
 * page language — that silent substitution is the mixed-language bug this
 * module already carries a comment about, one level further down.
 */
function pick(locale, ar, en) {
  const wanted = locale === "ar" ? ar : en;
  if (wanted) return { value: wanted, lang: locale };
  const fallback = locale === "ar" ? en : ar;
  if (fallback) return { value: fallback, lang: locale === "ar" ? "en" : "ar" };
  return null;
}
```

⚠️ This changes the shape of every field `toCar()` produces and touches all its consumers. Do it **once**, early — during the `[locale]` migration when those files are open anyway — not as a later refactor.

⚠️ Also change `DEFAULT_LOCALE` from `"en"` to `"ar"` at the moment `/ar/` is the default route (§1). `"en"` is correct *today* because the shell is English; it becomes wrong the moment the shell is bilingual, and a stale `"en"` default is silent, not loud.

### The rule that decides launch

> **Do not put a URL into `hreflang` or the sitemap until it is fully Arabic.**

Everything else is negotiable. This is not, for two reasons:

1. **Half-Arabic indexed pages are hard to undo.** Once `/ar/` is in the index with English chrome, you are competing against your own bad pages, and reindexing after a fix takes weeks. Withholding the announcement costs nothing; retracting it costs months.
2. **The `hreflang` cluster is all-or-nothing.** [VERIFIED] If any page fails to point back, Google ignores the annotations — and Search Console will not tell you (§1). A partially-built Arabic tree produces exactly this: some paths exist in both locales, some 404 in one.

You can build `/ar/` behind `noindex` for as long as you like. Flip to `index` + `hreflang` + sitemap in **one deploy**, when the checklist in §10 is fully green.

### On machine translation

[VERIFIED] Google removed its guidance recommending that auto-translated pages be blocked via robots.txt (announced **2025-06-11**). Its current position is that how content is created matters less than whether it is helpful; the scaled-content-abuse policy still applies to bulk unoriginal output.

[INFERRED] So machine translation is **not** a penalty risk for a ~400-string UI. What it *is* is a trust risk. This site sells trust to Arabic-speaking Omanis. Machine-translated Arabic reads as machine-translated to a native speaker — stilted MSA, wrong domain vocabulary, translationese. It would say "we didn't think you were worth a human" to precisely the audience NICHE.md puts first, on a product whose only differentiator is that it treats people straight.

**Recommendation:** MT-assisted first pass is fine and fast. **A native Omani/Gulf Arabic speaker must review 100% of it before launch.** Budget 2–3 elapsed days for that review; it is not developer time and can run in parallel with engineering. Non-negotiable for: the trust copy (`SOLD_AS_IS_DETAIL` in `lib/listingLabels.js:41` is already good, human-quality Arabic — that is the bar), the sold-as-is disclosure, the spec-origin labels, the FAQ, and every `<title>` template.

---

## 9. Phased implementation plan

Estimates are developer-days for one engineer familiar with this codebase. They exclude the human Arabic review (2–3 elapsed days, parallelisable, not dev time).

### Phase 0 — Decide and freeze the URL contract · **0.5 d** · ⚠️ HARD DEADLINE: before first public listing

- [ ] Ratify Option B (`/ar/` + `/en/`, `/` → 307 → `/ar/`). §1
- [ ] Ratify Latin slugs in both trees. §3 — this is also a **CMS decision**: it means *no* `slugAr` field, ever.
- [ ] Ratify the `hreflang` set: `ar`, `en`, `x-default`→`/ar/`. §2
- [ ] Write the decision into `README.md` or `design/tokens.md` so the eight parallel agents build against it.

Nothing else in this plan can start until these four are settled, and **every day this slips after launch multiplies its cost**.

### Phase 1 — Locale routing skeleton · **2 d**

- [ ] Create `apps/web/lib/i18n.js` (§2).
- [ ] Move `app/layout.js` → `app/[locale]/layout.js`; `<html lang dir>` from params; `generateStaticParams`.
- [ ] Move all 35 `page.jsx` routes under `[locale]/`; preserve the existing `(homes)`/`(car-listings)`/`(other-pages)`/`(dashboard)` groups.
- [ ] `apps/web/proxy.js` — bare-root redirect only, no `Accept-Language` sniffing (§2).
- [ ] `isLocale()` guard → `notFound()` on unknown locales.
- [ ] Update `app/sitemap.js` and `app/robots.js` for locale prefixes; keep the existing exclusions.
- [ ] Update `app/manifest.js` (`start_url`, `scope`, `name`) — currently hard-codes `/`.
- [ ] **Ship `/ar/` under `noindex` from this point.** Not in `hreflang`, not in the sitemap.

⚠️ Riskiest single step in the plan: 35 routes moving at once, in a repo with eight other agents active. Do it in one atomic commit and communicate the freeze window.

### Phase 2 — Localisation infrastructure · **1 d**

- [ ] `app/[locale]/dictionaries/{ar,en}.json` + server-only `getDictionary()` (per the Next.js guide).
- [ ] Rewrite `lib/format.js` locale-aware: `formatNumber`, `formatPrice`, `formatYear`; `ar-OM-u-nu-latn`; `maximumFractionDigits: 0` (§4).
- [ ] Extend `pageMetadata()` in `lib/seo.js` with `locale` + `alternates.languages` (§2) — **but keep `/ar/` out of the emitted set until Phase 6.**
- [ ] Change `pick()` in `lib/strapi.js` to return `{ value, lang }`; update `toCar()` consumers (§8).
- [ ] Add `stripBidi()` next to `compact()` in `lib/seo.js` (§4).

### Phase 3 — String extraction · **3.5–4.5 d** ⚠️ the biggest and most-underestimated line

- [ ] Extract user-facing strings from **118 components** and **35 routes** into the dictionaries.
- [ ] Extract from `data/`: `menu.js`, `footerLinks.js`, `faqs.js`, `categories.js`, `filterOptions.js`, `heroSlides.js`, `brands.js`. (`data/cars.js` is demo data — check whether it survives to production before translating 553 strings.)
- [ ] Thread `locale` through every `formatPrice`/`formatNumber` call site.
- [ ] Locale-aware `listingTitle()` / `listingDescription()` generated from **structured fields only** (§8) — the key deliverable of this phase.
- [ ] `specLabel(origin, locale)` fix in `lib/seo.js:211`.

[INFERRED] The prior 11–14 day estimate most likely under-counted here. My rough grep found ~158 multi-word literals in JSX plus the `data/` files, but grep misses strings in props, `aria-label`s, `alt` text, placeholders, `title` attributes, and template literals. **~400 strings is plausible as a total; the effort is in finding them across 118 files, not in translating them.** Expect a long tail of missed strings surfacing in QA — budget for it rather than treating each as a surprise.

### Phase 4 — RTL · **3–4 d**

- [ ] Add `rtlcss` as a devDependency; add the `css:rtl` build script; wire the conditional `<link>` in `[locale]/layout.js` (§6).
- [ ] Hand-written `rtl-overrides.css`, loaded **after** the rtlcss output — icon mirroring (3 classes, 51 sites) plus fixes.
- [ ] Fix the ~100 residual declarations rtlcss can't resolve: 33 transforms, 68 shadows.
- [ ] **Swiper RTL across 35 files** — the single largest sub-task. Budget ~1 d alone.
- [ ] `rc-slider` `reverse` prop on the price filter (`components/common/Pricing.jsx`) — **functional bug, not cosmetic**.
- [ ] PhotoSwipe gallery direction.
- [ ] Sticky-header measurement in `ClientShell.jsx` under RTL.
- [ ] Audit for surviving Bootstrap 4 directional classes (`.ml-*`, `.pr-*`, `.text-left`, `.float-right`).
- [ ] Verify the five flipped vendor stylesheets, `animate.css` keyframes especially.

### Phase 5 — Typography and performance · **1 d**

- [ ] Move Inter + Outfit from the SCSS `@import` (`style.scss:15`) to `next/font` — **do this even if nothing else in this phase ships**; it removes a render-blocking third-party request on every page.
- [ ] Add Cairo 400/700 (27 KB) via `next/font`, loaded only on `/ar/`, with `unicode-range` and `display: swap`.
- [ ] Arabic `line-height: 1.7–1.8`; review-rule: never `letter-spacing` on Arabic.
- [ ] Localise `app/opengraph-image.png` / `twitter-image.png` for `/ar/` — the WhatsApp preview card is the shared artefact (§3), so an English OG image on an Arabic listing is a visible miss.
- [ ] **Separately ticketed, not blocking:** subset Font Awesome. 505 KB currently on the wire; the largest single performance win available on this site.

### Phase 6 — Structured data, metadata, indexing · **1 d**

- [ ] `webPageJsonLd()` with per-page `inLanguage` (§7).
- [ ] `webSiteJsonLd()` → `inLanguage: ["ar", "en"]`.
- [ ] Localise `BreadcrumbList` names and prefix the `item` paths.
- [ ] `og:locale` / `og:alternateLocale` per locale.
- [ ] Verify no `hreflang` on the duplicate theme layouts (`listing-detail-v2`–`v5`, `home02`–`home10`, alternate browse views).
- [ ] Verify all JSON-LD numbers are Latin and all strings are bidi-stripped.

### Phase 7 — CMS content · **1–1.5 d** (dev) + editorial

- [ ] Fill `nameAr` on **every** row of every taxonomy: make, model, body-type, condition, transmission, fuel-type, car-color, city, feature. **Blocking** — this is what makes structured-field Arabic titles possible (§8).
- [ ] Publishing rule for `titleAr`, or a generator from structured fields.
- [ ] Editorial policy for `descriptionAr` (optional; English fallback is marked `lang="en" dir="ltr"`, never silent).
- [ ] Decide whether to migrate from paired fields to Strapi's i18n plugin. [INFERRED] **Not now.** Paired fields work, the mapper handles them, and a CMS migration mid-launch is unforced risk. Revisit only if a third locale appears.

### Phase 8 — QA and go-live · **1 d**

- [ ] Test on a **real budget Android device on a throttled connection** — not a desktop emulator. This is the actual target device per NICHE.md.
- [ ] Crawl both trees (Screaming Frog / Sitebulb) and validate `hreflang` reciprocity — **Search Console will not do this for you** (§1).
- [ ] Verify no `/ar/` URL canonicalises to `/en/` or vice versa.
- [ ] Rich Results Test + Schema.org validator on one Arabic and one English listing.
- [ ] Paste a real `/ar/listing/…` URL into WhatsApp on a handset; check the preview card, the Arabic OG title, and that the link is legible in the bubble.
- [ ] Native-speaker sign-off on 100% of Arabic strings.
- [ ] **Then, in one deploy:** remove `noindex` from `/ar/`, add `/ar/` to `hreflang`, add `/ar/` to the sitemap, submit.

### Total

| Phase | Days |
|---|---:|
| 0 — URL contract | 0.5 |
| 1 — Locale routing | 2 |
| 2 — i18n infrastructure | 1 |
| 3 — String extraction | 3.5–4.5 |
| 4 — RTL | 3–4 |
| 5 — Typography | 1 |
| 6 — Structured data | 1 |
| 7 — CMS | 1–1.5 |
| 8 — QA | 1 |
| **Total** | **14–16.5 developer-days** |

[INFERRED] The earlier 11–14 day estimate is the right order of magnitude and slightly optimistic. The gap is Phase 3 (finding strings across 118 components is a search problem, not a translation problem) and the Swiper portion of Phase 4 (35 files, JS-computed offsets that CSS flipping does not fix). The ~400-string figure looks about right.

**Critical path:** Phase 0 → 1 → 2 → 3, with 4 and 5 parallelisable against 3 if two engineers are available. Phase 7's taxonomy `nameAr` fill is editorial work that should start on **day one** — it is cheap, needs no code, and blocks Phase 3's title generators.

---

## 10. What must be true before Arabic goes live

Hard gate. Every line must be green **in the same deploy** that adds `/ar/` to `hreflang` and the sitemap.

**Structural**

1. `/ar/` and `/en/` trees have **identical path shapes**. Every indexable URL exists in both, at 200.
2. `<html lang="ar" dir="rtl">` is in the **server-rendered** HTML on every `/ar/` page. No client-side flip.
3. Every page's `canonical` is **self-referencing within its own locale**. Zero cross-locale canonicals anywhere.
4. `hreflang` is complete and reciprocal on every page: `ar`, `en`, `x-default`→`/ar/`. Verified by an external crawl, not by inspection.
5. No `hreflang` on the theme's duplicate layouts.
6. `/` returns 307 → `/ar/`. No `Accept-Language` sniffing on any other URL.
7. A visible language switcher on every page that preserves the current path.

**Content**

8. **100%** of UI chrome is Arabic on `/ar/`. Zero English strings in nav, filters, buttons, forms, errors, empty states, or `aria-label`s.
9. **100%** of taxonomy rows have `nameAr` — every make, model, body type, condition, transmission, fuel type, colour, city, feature.
10. Every `/ar/` listing page has an Arabic `<title>`, `<h1>` and meta description **generated from structured fields**, independent of whether the seller wrote Arabic.
11. Any surviving English seller text on an Arabic page is wrapped in `lang="en" dir="ltr"` **and visibly labelled**. Never silent.
12. A **native Omani/Gulf Arabic speaker has reviewed 100%** of the Arabic and signed off. Machine output alone does not pass this gate.

**Formatting**

13. All numerals are Latin, in body copy, `<title>`, meta, and JSON-LD.
14. Prices show **no** trailing `.000` (the OMR 3-decimal trap).
15. Years render `2015`, never `2,015`.
16. No U+200F/U+200E marks in any JSON-LD value, `og:` tag, or analytics payload.

**Presentation**

17. RTL verified on a **real budget Android device**: header, filters, listing cards, gallery, WhatsApp CTA, forms.
18. The price-range slider works correctly under RTL — min is min, max is max.
19. All Swiper carousels slide in the correct direction and land on the correct slide.
20. Directional icons mirror; brand/WhatsApp/user/heart/star icons do not.
21. Arabic body text at `line-height ≥ 1.7`. No `letter-spacing` on any Arabic run.

**Machine-readable**

22. One JSON-LD graph per page, entirely in that page's language.
23. `inLanguage` on `WebPage` (single-valued) and `WebSite` (`["ar","en"]`). Not on `Car`, `Offer`, or `Organization`.
24. `Organization` `@id` is identical across locales.
25. Rich Results Test and the Schema.org validator pass clean on one Arabic and one English listing.

**Shareability**

26. A real `/ar/listing/…` URL pasted into WhatsApp on a handset renders a preview card with an Arabic title, an Arabic-appropriate OG image, and a link that fits legibly in the bubble.

---

## Sources

**Google Search Central (primary, fetched 2026-07-25)**
- [Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) — page last updated 2025-12-10
- [Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions) — page last updated 2025-12-22
- [URL structure best practices](https://developers.google.com/search/docs/crawling-indexing/url-structure) — page last updated 2025-12-10
- [General Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [The International Targeting report is deprecated](https://support.google.com/webmasters/answer/12474899) — deprecated Sept 2022
- [Google Search Central on X, Aug 2022 — hreflang still supported](https://x.com/googlesearchc/status/1562369672430997504)
- [Sitelinks search box retired, 2024-11-21](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)

**Framework and library documentation (fetched 2026-07-25)**
- [Next.js — Internationalization guide](https://nextjs.org/docs/app/guides/internationalization) — docs version 16.2.11, last updated 2025-12-09
- [Next.js — generateMetadata / alternates](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js — Renaming Middleware to Proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Next.js — proxy.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Next.js 16 release notes](https://nextjs.org/blog/next-16)
- [Bootstrap 5.3 — RTL](https://getbootstrap.com/docs/5.3/getting-started/rtl/)
- [RTLCSS](https://rtlcss.com/)
- [Vercel discussion #76729 — x-default in metadata.alternates](https://github.com/vercel/next.js/discussions/76729)

**Machine translation policy**
- [Google softens automated-translation stance, June 2025 — Search Engine Roundtable](https://www.seroundtable.com/google-softens-automated-translation-stance-39579.html)
- [Google flips stance on automatic AI translations — Slator](https://slator.com/google-flips-stance-on-automatic-ai-translations-requires-content-creators-to-opt-out/)
- [Google comments on Reddit's AI translations — Search Engine Land](https://searchengineland.com/google-comments-on-reddits-use-of-ai-to-translate-its-pages-456908)

**Arabic slugs, encoding, RTL practice**
- [Yoast — Bad slug for Arabic URLs](https://yoast.com/video/ask-yoast-slug-for-arabic-urls/)
- [IstiZada — Arabic URL/URI structure and encoding](https://istizada.com/understanding-arabic-url-uri-structure-encoding-for-arabic-sites/)
- [Percent-encoding — Wikipedia](https://en.wikipedia.org/wiki/Percent-encoding)
- [Share Preview — How to control WhatsApp link previews](https://share-preview.com/blog/whatsapp-link-preview)

**Arabic language and normalisation**
- [Discourse Meta — Arabic search normalization: hamza variants, ya/kaf forms, orthographic equivalence](https://meta.discourse.org/t/arabic-search-normalization-missing-support-for-hamza-variants-ya-kaf-forms-and-orthographic-equivalence/384253)
- [AraToken: Optimizing Arabic Tokenization with a Normalization Pipeline (arXiv 2512.18399)](https://arxiv.org/html/2512.18399v1)
- [Study Arabic Online — Gulf Arabic (Khaliji)](https://studyarabiconline.org/gulf-arabic-khaliji/)

**Structured data, multilingual**
- [Linguise — Schema markup for multilingual websites](https://www.linguise.com/blog/guide/using-schema-markup-and-structured-data-for-multilingual-websites-seo/)
- [better-i18n — Multilingual schema markup](https://better-i18n.com/en/blog/multilingual-schema-markup/)
- [schema.org/Car](https://schema.org/Car) · [schema.org/inLanguage](https://schema.org/inLanguage)

**Competitor URLs [OBSERVED] — live search results, 2026-07-25** (pages themselves return 403/429 to non-browser clients)
- `om.opensooq.com/ar/حراج-السيارات/سيارات-للبيع/تويوتا/كورولا` and `om.opensooq.com/en/cars/cars-for-sale/toyota/corolla`
- `om.opensooq.com/ar/مسقط/حراج-السيارات/…` and `om.opensooq.com/en/muscat/cars/cars-for-sale`
- `om.opensooq.com/ar/tags/سيارات-تكملة-اقساط-في-سلطنة-عمان`
- `oman.hatla2ee.com/ar/car/toyota/corolla` and `oman.hatla2ee.com/en/car/city/muscat`
- `oman.yallamotor.com/used-cars/muscat/toyota/corolla`
- `www.dubizzle.com.om/vehicles/cars-for-sale/` and `www.dubizzle.com.om/en/vehicles/cars-for-sale/toyota/muscat/q-corolla/`

**Measured locally, 2026-07-25** — not citable to a source, reproducible from this repo
- `Intl.NumberFormat` locale behaviour: Node v26.5.0, full ICU
- `rtlcss@4.3.0` vs `bootstrap@5.3.3` `bootstrap.rtl.css`: 1-line diff (sourcemap comment only), 280,256 vs 280,259 bytes
- Arabic WOFF2 byte counts: `@fontsource/*` packages, arabic subset
- Theme SCSS direction-declaration counts: `public/assets/scss/**/*.scss`
