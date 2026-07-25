# Autosouq.om — Core Web Vitals & real-world speed audit

**Date:** 2026-07-25
**Scope:** `apps/web` (Next.js 16.2.11 App Router, React 19.2.4, Bootstrap 5.3.8 + SCSS, AutoDeal ThemeForest theme)
**Auditor brief:** Oman, budget Android phones, metered mobile data. Every kilobyte is a real cost.
**Rule observed:** no application code was changed. Every finding below is an instruction for an implementing agent.

---

## 0. How these numbers were obtained

Everything in this report is **measured**, not estimated, unless explicitly labelled `(estimate)`.

| Method | What it produced |
|---|---|
| `next build` output that existed on disk at `.next/` (BUILD_ID `kV8FHLW-Hz4uqxBtmnqQz`, built 15:41) | Real production per-route first-load JS and CSS, raw + gzip, parsed from the 28 prerendered `.next/server/app/*.html` files |
| Headless Chrome (`puppeteer-core` → `/Applications/Google Chrome.app`), Moto G-class UA, 412×915 DPR 2, cache disabled, CDP `Network` domain | Real request waterfall, transfer sizes, CSS/JS coverage, LCP element, CLS, long tasks |
| `sharp` 0.34.5 (already in the repo) | Real image dimensions and real WebP/AVIF re-encode sizes at real responsive widths |
| `stat` / `gzip -c9 \| wc -c` | Raw and gzipped bytes of every asset and every vendor `dist` bundle |
| `curl` read-only against `localhost:3001` | Served HTML |

**I did not run `next build`.** The `.next/` directory I measured was a pre-existing production build. Part-way through the audit another agent restarted the dev server, which replaced `.next/` with a dev build — the production numbers below were captured before that and are recorded verbatim. I only ever issued read-only `GET`s; I did not stop or start any server.

**Not measured, and therefore not claimed:** Lighthouse scores, real-world RUM, real Omani network throughput. Where a time is given it is derived from measured bytes against the **Lighthouse "Slow 4G" emulation profile (1,638.4 kbps, 150 ms RTT)** — a stated modelling assumption, not a measurement of Omani networks.

---

## 1. Executive summary

The site currently ships **~1.61 MB to a first-time visitor on the homepage**. Of that:

- **526 KB (33%) is icon fonts** — three Font Awesome weights plus a theme icon font — rendering **about ten distinct glyphs**. This is the single largest line item on the page, larger than all the photography combined, and larger than all the JavaScript.
- **688 KB (43%) is images**, shipped at authored resolution with `images: { unoptimized: true }`, no `sizes`, and `loading="lazy"` on the LCP hero.
- **262 KB (16%) is JavaScript**, of which ~32 KB is provably dead on mobile.
- **102 KB (6%) is CSS**, of which **6.6% is used** on the homepage (measured coverage: 50,712 of 770,859 bytes).

**The single highest-impact change is to delete Font Awesome and the `autodeal` icon font and inline the ~10 glyphs actually used as SVG. That is a measured 526 KB saved on every single page view, for roughly a day of work, with zero feature loss.**

Three findings are severe enough to call out separately:

1. **A 103 MB `video.mp4` sits in `public/`** (`apps/web/public/assets/images/section/video.mp4`), referenced by `<video autoPlay muted loop>` with no `preload` and no `poster`. It is 98% of the repository's asset weight and it will be deployed.
2. **The LCP element on the homepage is `loading="lazy"`.** Measured: LCP = the hero `<img>`, no `priority`, no `fetchpriority="high"`, no preload.
3. **The intended webfonts never load.** The Google Fonts `@import` in `style.scss:16` is silently dropped by the build; there is no `@font-face` for Inter or Outfit anywhere in the compiled CSS. The site is rendering in the system sans-serif today. This is a design bug, but it is also a budget you have not yet spent — and the Arabic font is still to come.

---

## 2. JavaScript weight

### 2.1 Measured production first-load JS, per route

Parsed from the prerendered HTML of the production build. Gzip computed at level 9. The polyfill chunk `0cz1d0mv5g_q7.js` (110 KB raw / 38 KB gz) carries `noModule`, so a modern mobile browser **skips it** — the "real" column excludes it.

| Route | # scripts | raw | gzip (all) | **gzip (real, modern browser)** |
|---|---:|---:|---:|---:|
| `/` (homepage) | 15 | 1,046 KB | 300 KB | **262 KB** |
| `/listing-grid-map` | 15 | 1,019 KB | 287 KB | **249 KB** |
| `/home06` | 14 | 963 KB | 279 KB | 241 KB |
| `/home09` | 14 | 996 KB | 279 KB | 241 KB |
| `/home05` | 14 | 983 KB | 279 KB | 241 KB |
| `/dashboard` | 11 | 880 KB | 264 KB | 226 KB |
| `/listing-list-map` | 14 | 932 KB | 261 KB | 223 KB |
| `/about-us` | 13 | 844 KB | 244 KB | 206 KB |
| `/contact` | 12 | 811 KB | 239 KB | 201 KB |
| `/listing-grid` | 13 | 788 KB | 231 KB | **193 KB** |
| `/listing-list`, `/listing-grid2` | 13 | 791 KB | 231 KB | 193 KB |
| `/faq` | 11 | 714 KB | 210 KB | 172 KB |
| `/my-profile`, `/my-listing`, … | 10 | ~706 KB | 204 KB | 166 KB |
| `/_not-found` | 9 | 654 KB | 193 KB | 155 KB |

`/listing-detail-v1/[id]` is **not in this table because it is not prerendered** — see §5. From the closest measured route plus the PhotoSwipe and Swiper chunks it pulls, its first-load JS is **~200–215 KB gz (estimate)**.

Homepage chunk breakdown (measured, gzip):

| Chunk | raw | gzip | Identified as |
|---|---:|---:|---|
| `0fgoazm0ikrol.js` | 222 KB | **69 KB** | React + react-dom (root main) |
| `3-nxx91_qlebi.js` | 153 KB | **43 KB** | Swiper |
| `0oep8ryrq87tl.js` | 134 KB | 36 KB | Next client runtime |
| `2_p2dxe88m7cw.js` | 89 KB | 26 KB | Swiper-signature chunk |
| `30jon1s9m-yj5.js` | 53 KB | 13 KB | app / shared |
| `04pegx5oexrh8.js` | 38 KB | **12 KB** | **`@emailjs/browser`** |
| `1b9d-q677tzp3.js` | 56 KB | 12 KB | Next shared |
| `0t98rno08lvsq.js` | 41 KB | **11 KB** | **`wowjs`** |
| `407fza773ot4s.js` | 24 KB | **9 KB** | **`rc-slider`** |
| `1bhykw0_5q153.js` | 42 KB | 9 KB | app / shared |
| `33g4liflmuhxa.js` | 46 KB | 8 KB | Swiper-signature chunk |
| `37k5sshn-tcq7.js` | 24 KB | 7 KB | Next shared |
| `turbopack-…` | 10 KB | 4 KB | Turbopack runtime |
| `28citszg826nz.js` | 3 KB | 1 KB | — |
| *(`0cz1d0mv5g_q7.js`)* | *110 KB* | *38 KB* | *core-js polyfills, `noModule` — skipped* |

Chunk→library attribution is by minified string signature (`grep` for `swiper`, `photoswipe`, `rc-slider`, `WOW.prototype`, `Chart.register`, `maps.googleapis.com`, `emailjs`). Where a chunk matched no signature it is left as "app / shared" rather than guessed.

### 2.2 Per-dependency verdict

Vendor `dist` sizes measured directly from `node_modules`, minified where a minified build ships.

#### `chart.js` — **DEAD. Remove.** — severity: **serious**

- **In the build:** chunk `3g4_zg3-ffrnr.js`, **175 KB raw / 59 KB gz**, referenced by `.next/server/app/dashboard.html` and `dashboard.rsc` in the 15:41 build.
- **In the source:** `grep -rn "chart"` across `app/ components/ lib/ data/ reducer/` finds exactly **one** hit — a code comment at `apps/web/components/dashboard/DashBoard.jsx:12` explaining that the fabricated "Page Insights" chart was deleted.
- **Conclusion:** the chart component was removed after that build. `chart.js` is now a fully orphaned dependency: 6.2 MB in `node_modules`, still in `apps/web/package.json:12`, and one careless import away from putting 59 KB gz back on the dashboard.
- **Action:** `pnpm --filter @autosouq/web remove chart.js`.
- **Saving:** 59 KB gz on `/dashboard` (already realised by the deletion; this locks it in) + 6.2 MB install/CI time. **Effort: 5 minutes. Risk: none.**

#### `@react-google-maps/api` + Google Maps JS — **the most expensive feature on the site** — severity: **blocker (for the map routes)**

Measured on `/listing-grid-map`, cold cache, mobile viewport:

| | requests | transferred |
|---|---:|---:|
| Google Maps JS (`maps-api-v3/api/js/65/10a/…`: `main.js` 83.2 KB, `util.js` 70.2 KB, `common.js` 37.3 KB, `controls.js` 25.8 KB, `map.js` 25.3 KB, `log.js` 10.1 KB, `onion.js` 9.2 KB, loader 3.0 KB) | 10 | **266 KB** |
| Map raster tiles (`maps/vt?pb=…`) | 10 | **217 KB** |
| Google Fonts pulled in *by the map* (`fonts.googleapis.com` CSS 3.9 KB + two 36.7 KB Roboto woff2 from `fonts.gstatic.com`) | 8 | **80 KB** |
| Other Google (`$rpc` XHR, `maps.gstatic.com` logo) | 4 | 6 KB |
| `@react-google-maps/api` wrapper, local chunk `29gg5amzqt1mp.js` | 1 | **142 KB raw / 29 KB gz** |
| **Total map cost** | **33** | **~598 KB** |

Direct A/B: `/listing-grid` measured **2,105 KB** total; `/listing-grid-map` measured **2,578 KB** — a **473 KB delta over the wire**, plus the 29 KB gz local wrapper.

It also opens **four third-party origins** (`maps.googleapis.com`, `maps.gstatic.com`, `fonts.googleapis.com`, `fonts.gstatic.com`) and downloads an **85,129-byte Google Sans Text stylesheet of which 0 bytes are used** (measured CSS coverage: 0.0%). Under a strict CSP this is four `connect-src`/`img-src`/`font-src`/`script-src` exceptions you would rather not write.

**Recommendation — remove Google Maps from the browse routes.** Concretely:

- `apps/web/components/carsListings/ListingMap.jsx:198-201` calls `useLoadScript(...)` **unconditionally at component mount**. Same at `apps/web/components/dashboard/Map.jsx:192`. Nothing gates it behind user intent.
- `ListingMap` is used only by `apps/web/components/carsListings/Cars4.jsx:369` and `Cars5.jsx:395`, i.e. `/listing-grid-map` and `/listing-list-map` — two of five near-duplicate browse layouts that already canonicalise to `/listing-grid` (`lib/seo.js`, and `app/sitemap.js:17-19` deliberately excludes them from the sitemap).
- **You are paying 598 KB to render a feature on two URLs you have told Google not to index.**
- For a car listing, a map is not the decision-making surface. NICHE.md's promise is "contacting a seller is one WhatsApp tap"; the buyer needs the **city name** ("Sohar", "Nizwa") and then a WhatsApp message. A slippy map of Oman at zoom 4 with 20 pins adds nothing to a OMR 2,700 Corolla decision.

**Options, cheapest first:**

| Option | Saving | Cost |
|---|---:|---|
| **A. Delete `/listing-grid-map` and `/listing-list-map`, drop `@react-google-maps/api`** | **598 KB on those routes; 408 KB `node_modules`; 4 third-party origins** | ~2 h. Loses the map view entirely (already non-canonical, non-indexed) |
| B. Keep the routes, but render a static placeholder and load the map only on an explicit "Show map" tap | 598 KB deferred off the critical path; ~0 KB for users who never tap | ~4 h |
| C. Keep the map but swap for MapLibre GL + a self-hosted or OSM tile source | ~200–250 KB *(estimate)*, and zero Google origins | ~1–2 days |
| D. On the detail page, replace any map with a `geo:`/`https://maps.google.com/?q=lat,lng` **link** | ~598 KB → ~0 KB | ~1 h |

**Recommended: A now, D on the detail page.** If a map view is a product requirement later, do B.

**Trade-off, stated honestly:** removing the map removes a feature. Two of five browse layouts lose their distinguishing element and should be deleted rather than left as a degraded duplicate. If the business wants "browse on a map", B is the compromise — but it must be tap-to-load, never on mount.

#### `wowjs` — **earns nothing on the target device. Remove.** — severity: **serious**

- **Cost:** built chunk `0t98rno08lvsq.js`, **41 KB raw / 11 KB gz, on every route** (it is initialised in `app/ClientShell.jsx:64-69`, which wraps the root layout). Plus `public/assets/css/animate.css`, **37,250 bytes** of source CSS compiled into the global bundle.
- **What it does on a budget Android phone: nothing.** `ClientShell.jsx:66` passes `mobile: false`. In `wowjs/dist/wow.js:505-507`:
  ```js
  WOW.prototype.disabled = function() {
    return !this.config.mobile && this.util().isMobile(navigator.userAgent);
  };
  ```
  With `mobile: false` and a mobile UA, `disabled()` is `true`, so `init()` takes the `resetStyle()` branch (`wow.js:223-224`) and no animation ever runs. **The entire library is downloaded, parsed and executed to do nothing, for exactly the audience this site is built for.**
- 91 elements in the codebase carry `wow fadeInUpSmall` / `wow fadeInUp` / `wow fadeInRight` classes. All inert on mobile.
- **Bonus bug:** `ClientShell.jsx:62-70` constructs `new WOW(...)` on **every `pathname` change** with no `wow.stop()`. On desktop, where `disabled()` is false, `wow.js:236` installs `setInterval(this.scrollCallback, 50)` — so every client-side navigation leaks another 20 Hz interval and another scroll+resize listener pair. After five navigations, five interval timers.
- **Action:** delete the `wowjs` import and `useEffect` from `ClientShell.jsx:62-70`, drop `wowjs` from `package.json`, remove `@import "../css/animate.css"` from `style.scss:10`, and strip the `wow …` classes (or leave them as inert no-op classes and let the CSS purge in §3 delete the matching rules).
- **Saving: 11 KB gz JS on every route + ~37 KB raw CSS + a desktop timer leak.** **Effort: 2 h. Risk: desktop loses scroll-in fades. If they are wanted, `@media (prefers-reduced-motion: no-preference)` + a 6-line IntersectionObserver replaces the whole library.**

#### `@emailjs/browser` — **12 KB gz on every page for a footer newsletter box** — severity: **serious**

- `apps/web/components/footers/Footer1.jsx:4` imports `emailjs` **statically**, and `Footer1.jsx:1` is `"use client"`. `Footer1` is rendered by every page (`app/page.jsx:28`, `app/(car-listings)/listing-grid/page.jsx:46`, `app/(car-details)/listing-detail-v1/[id]/page.jsx:92`, and so on).
- Measured: chunk `04pegx5oexrh8.js`, **38 KB raw / 12 KB gz, present in the script list of `index.html` and `listing-grid.html`** — i.e. every route.
- The same static import exists at `apps/web/components/otherPages/Contact.jsx:4`, which is at least a page whose purpose is a form.
- **Action:** `const emailjs = (await import("@emailjs/browser")).default;` inside `sendMail` (`Footer1.jsx:19-42`) and inside the `Contact.jsx` submit handler. The SDK then loads on first submit, not on first paint.
- **Saving: 12 KB gz × every route.** **Effort: 20 minutes. Risk: none.**

#### `rc-slider` — **9 KB gz on the homepage for a control the homepage does not show** — severity: **minor**

- Imported by `apps/web/components/common/Pricing.jsx:3`, which is pulled in by `FilterSidebar.jsx:4` — a Bootstrap **offcanvas** panel that is hidden until the user taps "Filters".
- Measured chunk `407fza773ot4s.js`, **24 KB raw / 9 KB gz, in `index.html` and `listing-grid.html`**.
- Its CSS (`app/layout.js:1`, `rc-slider/assets/index.css`) is in the **global** bundle on every route.
- **Action:** `next/dynamic` the `FilterSidebar` (or just `Pricing`) with `{ ssr: false }` so the slider loads when the offcanvas opens. Move the rc-slider CSS import out of `app/layout.js:1` into the dynamic component.
- **Saving: 9 KB gz JS + ~4 KB gz CSS on every route.** **Effort: 1 h. Risk: a brief spinner on first filter open.**

#### `photoswipe` — **already well-behaved. Leave it.** — severity: **minor**

- `Slider1.jsx:5` / `Slider2.jsx:2` / `Slider3.jsx:6` / `Slider4.jsx:2` import only `photoswipe/lightbox` (**14,338 raw / 4,499 gz** minified), and defer the heavy core via `pswpModule: () => import("photoswipe")` (**54,270 raw / 16,413 gz**) which only loads when a user actually opens a photo. That is the correct pattern.
- One thing to fix: `app/layout.js:5` imports `photoswipe/style.css` **globally**, so every route — homepage, FAQ, dashboard — carries the lightbox CSS. Move it into the slider components.
- **Saving: small (~2 KB gz) but free.** **Effort: 10 minutes.**

#### `swiper` — **the biggest single third-party cost after fonts** — severity: **serious**

- **43 KB gz** on the homepage (chunk `3-nxx91_qlebi.js`; full `swiper-bundle.min.js` is 154,597 raw / 42,997 gz for comparison), plus a second Swiper-signature chunk at 26 KB gz.
- **35 components import `swiper/react`.** The homepage alone renders **7 Swiper instances** wrapping **45 slides** (counted from the served HTML: 7 × `swiper-wrapper`, 45 × `swiper-slide`).
- Five of eight homepage sections are `"use client"` **solely because they use Swiper**: `homes/home-1/Hero.jsx`, `homes/home-1/Categories.jsx` (5 refs), `homes/home-1/Process.jsx` (11 refs), `homes/home-1/Cars2.jsx` (5 refs), `homes/home-1/CarBrands.jsx` (35 refs). Remove Swiper and they become server components (see §5.3).
- The modules actually used across the whole app are only `Pagination`, `Navigation`, `Autoplay`, `EffectFade`, `Grid`.
- **What to do:**
  - **Hero (`homes/home-1/Hero.jsx`)**: `data/heroSlides.js:4` already declares **one slide, deliberately**. A one-slide carousel is not a carousel. Replace the `<Swiper>` wrapper with a plain `<div>`. This alone takes Swiper off the homepage's critical path and lets the hero be a server component.
  - **Below-fold carousels** (`Process`, `CarBrands`, `Categories`, `Cars2`): a horizontally scroll-snapping `<ul>` (`overflow-x:auto; scroll-snap-type:x mandatory`) is ~15 lines of CSS, works without JS, is natively touch-smooth on Android, and is *better* than Swiper on a low-end device. Replacing the four homepage carousels removes Swiper from `/` entirely.
  - **Keep Swiper only for the listing-detail gallery** (`carDetails/sliders/Slider1.jsx`), where it pairs with PhotoSwipe, and load it with `next/dynamic`.
- **Saving: up to 43–69 KB gz on the homepage; Swiper off ~30 routes.** **Effort: 1–2 days (it touches 35 files). Risk: medium — visual regression on each carousel; do it section by section.**

#### `bootstrap` (JS) — **28.5 KB gz, and it is loaded correctly but too eagerly** — severity: **minor**

- `app/ClientShell.jsx:12-18` dynamically imports `bootstrap/dist/js/bootstrap.esm` inside a mount `useEffect` — good, it is not in the initial parse. Measured `bootstrap.esm.js` = 135,902 raw / 28,529 gz; the minified `bootstrap.esm.min.js` = 73,811 raw.
- But it imports the **whole** bundle. The `data-bs-*` attributes actually used across the app are: `offcanvas` (23 + 4 targets), `modal` (12 + dismiss), `dropdown` (1), `scroll`/scrollspy (5). **`tooltip`, `popover`, `toast` are used zero times** and their CSS is 1,623 + 942 + 1,050 bytes of dead rules (see §3).
- **Action:** import only what is used — `import { Offcanvas, Modal, Dropdown, Collapse } from "bootstrap"` — or better, replace the four with ~60 lines of your own, since offcanvas/modal are `<dialog>` and `inert` these days.
- **Saving: ~10–15 KB gz *(estimate — depends on tree-shaking of the ESM entry)*.** **Effort: 3 h.**

### 2.3 JavaScript summary

| Dependency | gz cost | Routes affected | Verdict |
|---|---:|---|---|
| Google Maps (JS + tiles + fonts) | **598 KB** | 2 | **Remove** |
| React + Next runtime | ~124 KB | all | Irreducible |
| Swiper | 43–69 KB | ~30 | Reduce to 1 route |
| `chart.js` | 59 KB | 0 (orphan) | **Remove from `package.json`** |
| Bootstrap JS | 28.5 KB | all | Subset |
| `@emailjs/browser` | 12 KB | **all** | **Lazy-load** |
| `wowjs` | 11 KB | **all** | **Remove** |
| `rc-slider` | 9 KB | all | Lazy-load |
| PhotoSwipe | 4.5 KB + 16.4 KB deferred | 5 | Keep |

---

## 3. CSS

### 3.1 Measured

| | bytes |
|---|---:|
| Compiled bundle (dev, single file `_1qbt020._.css`) | **770,859 raw** |
| gzip -9 | 108,816 |
| brotli -q11 | 84,390 |
| Production build, 5 stylesheets, **all five loaded on every route** | **638,267 raw / ~102 KB gz** |

Production split (every route links all five — confirmed in the `<head>` of every prerendered HTML):

| File | raw | gz | rule blocks | Contents |
|---|---:|---:|---:|---|
| `17199--8j1ro2.css` | 251,707 | 40,537 | 2,989 | Theme (`style.scss` + `component/*` + `responsive.scss`) |
| `3wi2x3p0l_7dr.css` | 231,221 | 30,647 | 2,655 | **Bootstrap 5, complete** |
| `3jm2272edx6y-.css` | 124,273 | 25,102 | 3,036 | rc-slider + Font Awesome + fancybox + nice-select |
| `1ehf1vz94bjll.css` | 26,184 | 6,838 | 272 | Magnific Popup |
| `11tt7xpoxi-6z.css` | 4,882 | 1,504 | 59 | Swiper effect-fade + grid |

### 3.2 How much is actually used — measured coverage

Chrome DevTools CSS coverage, cold load, mobile viewport:

| Route | used | of | **% used** |
|---|---:|---:|---:|
| `/` | 50,712 | 770,859 | **6.6%** |
| `/listing-grid-map` | 46,887 | 770,859 | **6.1%** |
| `/listing-grid` | 40,205 | 770,859 | **5.2%** |
| `/listing-detail-v1/1` | 37,442 | 770,859 | **4.9%** |

A cross-route union measurement was attempted but the dev server was restarted mid-run by another agent. A **static** substitute analysis — parse every rule block in the compiled CSS, extract its class tokens, and mark a rule dead if **none** of its classes appears as any identifier anywhere in `app/`, `components/`, `lib/`, `data/`, `reducer/` — gives:

> **387,387 of 770,859 bytes (50.3%) sit in rules whose class names never appear anywhere in the source.**

That 50.3% is a deliberate **floor**, not a ceiling: it counts a rule as "used" if its class name matches any identifier in any JS file, which massively over-counts. The browser says 4.9–6.6% per page. The truth for a full-site union is somewhere around **12–18% (~100–140 KB raw)** *(estimate)*.

Largest provably-dead selectors, by bytes: `.popover` (1,623 B), `.toast` (1,050 B), `.list-group` (1,025 B), `.tooltip` (942 B), `.form-select` (864 B), `.was-validated .form-select:invalid…` (745 B), and eight `.list-group-item-*` colour variants at ~660 B each. All Bootstrap components the app never renders.

### 3.3 Is Bootstrap fully imported? Yes.

`apps/web/public/assets/scss/style.scss:17` — `@import "../css/bootstrap.css"` — pulls in the **complete 293,102-byte** distribution. The app uses roughly **37 distinct Bootstrap class families** (grid `col-*`/`row`/`container`, a handful of `d-*` utilities, `offcanvas`, `modal`). It does not use popovers, toasts, tooltips, list-groups, form-select validation states, badges, spinners, or progress bars.

The vendor CSS chain at `style.scss:9-17` is the whole problem in nine lines:

```scss
@import "../css/font-awesome.css";        // 112,840 B
@import "../css/animate.css";             //  37,250 B  ← dead on mobile (§2.2 wowjs)
@import "../css/jquery.fancybox.min.css"; //  13,735 B  ← jQuery Fancybox. jQuery is not installed.
@import "../css/magnific-popup.css";      //  10,298 B  ← Magnific Popup. Not installed either.
@import "../css/swiper-bundle.min.css";   //  13,973 B  ← duplicates the `swiper/css/*` imports in layout.js
@import "../css/nice-select.css";         //   5,469 B  ← jQuery Nice Select. Not installed.
@import "../../assets/fonts/style.css";   //   4,337 B
@import url("https://fonts.googleapis…"); //  ← silently dropped by the build; see §4
@import "../css/bootstrap.css";           // 293,102 B
```

**Three of these are stylesheets for jQuery plugins that are not in `package.json` and are never loaded** — Fancybox, Magnific Popup, Nice Select. That is **29,502 bytes of source CSS (~7.5 KB gz) for functionality that cannot exist.** Deleting those three `@import` lines is a zero-risk, five-minute win. `swiper-bundle.min.css` duplicates what `app/layout.js:3-4` already imports from the `swiper` package.

### 3.4 Is purging viable? Yes — the dynamic class names are tractable.

The "theme has dynamic class names so you can't purge" objection does not survive measurement:

- **745 distinct class names** appear in `className="…"` literals across the whole app.
- **72** `className={\`…\`}` template literals exist, and the interpolated parts are all simple ternaries producing a fixed set of tokens (`active`/`""`, `open`/`""`, `status-${statusClass(...)}`).
- Classes toggled from JS via `classList.add/remove/toggle` are exactly **ten**: `active`, `open`, `opened`, `show`, `is-fixed`, `is-small`, `mobile-menu-visible`, `header-lower-after-div`, `sidebar-dashboard`, `dashboard-overlay`.

That is a completely ordinary safelist. **Recommendation:**

1. Add `@fullhuman/postcss-purgecss` (or Tailwind-free `purgecss` in the build), content globs `app/**/*.{js,jsx}` + `components/**/*.{js,jsx}`, safelist the ten JS-toggled classes above plus `/^swiper-/`, `/^pswp/`, `/^rc-slider/`, `/^offcanvas/`, `/^modal/`, `/^fade/`, `/^show$/`, and the `status-*` pattern.
2. Delete `style.scss:11`, `:12`, `:14` (Fancybox, Magnific, Nice Select) first — free, and it removes 29.5 KB of source before purge even runs.
3. Delete `style.scss:10` (animate.css) once `wowjs` goes.
4. Replace `@import "../css/bootstrap.css"` with a Sass `@use` of only the Bootstrap partials in use (`functions`, `variables`, `maps`, `mixins`, `root`, `reboot`, `grid`, `containers`, `utilities/api`, `modal`, `offcanvas`, `dropdown`, `forms`). Bootstrap 5 supports this; it is the documented path.

**Severity: blocker.** Not because CSS is the biggest byte count, but because **all five stylesheets are render-blocking** — nothing paints until 102 KB gz / 638 KB decompressed of CSS has been fetched, decompressed and parsed, and CSS parsing is CPU work on a budget Android SoC.

**Saving: 102 KB gz → ~12–18 KB gz (estimate, based on the measured 4.9–6.6% per-page coverage and a generous union allowance). Effort: 1–2 days including regression sweep. Risk: medium — purge false-negatives cause missing styles; mitigate with the safelist above and a visual diff across all routes.**

---

## 4. Fonts

### 4.1 What is actually loaded — measured over the wire on the homepage

| Font | transferred | Why |
|---|---:|---|
| `/assets/fonts/fa-light-300.woff2` | **186.3 KB** | Font Awesome 5 Pro Light |
| `/assets/fonts/fa-regular-400.woff2` | **170.6 KB** | Font Awesome 5 Pro Regular |
| `/assets/fonts/fa-solid-900.woff2` | **138.6 KB** | Font Awesome 5 Pro Solid |
| `/_next/static/media/autodeal.…woff` | **30.2 KB** | Theme icon font — **WOFF only, no WOFF2** |
| **Total** | **525.7 KB** | |

Same four on `/listing-grid` (526 KB) and `/listing-detail-v1/1` (553 KB, the extra 27.9 KB being `__nextjs_font/geist-latin.woff2`, a **dev-overlay-only** font that will not ship).

**Not loaded: any text font at all.** There is no `@font-face` for Inter or Outfit anywhere in the compiled CSS. Measured: `@font-face` count in the built stylesheet = **5** — three Font Awesome, one base64 `swiper-icons`, one `autodeal`. Zero text faces.

### 4.2 The Inter/Outfit `@import` is silently dropped

`apps/web/public/assets/scss/style.scss:16`:

```scss
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@100..900&display=swap");
```

It sits at line 16, **after seven local `@import` statements that Sass inlines**. Once those are inlined, this plain-CSS `@import` is no longer the first at-rule in the sheet, which makes it invalid CSS, and the build drops it. Verified three ways: `grep googleapis` finds nothing in the compiled production CSS, nothing in any prerendered HTML, and the dev-served 770,859-byte stylesheet contains zero occurrences of `googleapis`. The only `googleapis` strings anywhere in `.next` are inside the Google Maps chunk.

Meanwhile `abstracts/_variables.scss:2-3` sets `$font-1: 'Outfit', sans-serif; $font-2: 'Inter', sans-serif;` and 45 rules reference Inter, 17 reference Outfit. **Every one of them is falling through to the platform's `sans-serif`** — Roboto on Android, San Francisco on iOS.

This is a **design correctness bug**. It is reported here because it is also a **budget trap**: the naive fix — move the `@import` to line 1 — would restore it as an external, render-blocking, chained request for the **full variable axes of Inter roman *and* italic (`opsz 14..32`, `wght 100..900`) plus Outfit `wght 100..900`**. That is the single most expensive way to load two fonts.

**Correct fix:** use `next/font/google` (or self-host the woff2 files, which someone has already staged in the scratchpad — `inter-latin-var.woff2` measures **48,432 bytes**, `cairo-latin-var.woff2` **33,644 bytes**). `next/font` self-hosts, subsets, emits `font-display: swap`, preloads, and generates a size-adjusted fallback that removes font-swap CLS. Budget: **~48 KB for a Latin variable Inter; ~30 KB for a Latin variable Outfit** — and drop the italic axis unless something is actually italic.

### 4.3 `font-display` — measured

| Face | `font-display` | Consequence |
|---|---|---|
| `Font Awesome 5 Pro` 300 / 400 / 900 (`public/assets/css/font-awesome.css:9429`, `:9442`, `:9455`) | **`block`** | Up to 3 s of **invisible icons**, then swap |
| `autodeal` (`public/assets/fonts/style.css:6`) | **`block`** | Same — and this font carries the *primary UI icons* |
| Inter / Outfit | n/a — never loaded | Text renders in the system font, so at least there is no FOIT on text |

`font-display: block` on the icon font that draws your search, filter, WhatsApp and navigation glyphs means that on a slow connection the user sees a functional-looking page with **holes where the icons should be** for up to three seconds. That is precisely the "does not read as trustworthy" failure mode NICHE.md warns about.

### 4.4 The 526 KB is buying about ten glyphs

Every Font Awesome class used anywhere in the codebase:

| Class | Weight → face | Occurrences | Where |
|---|---|---:|---|
| `far fa-angle-left` / `far fa-angle-right` | 400 → **fa-regular-400 (170.6 KB)** | 4 | `common/Pagination.jsx:27,57`, `Pagination2.jsx:23,53` |
| `far fa-search` | 400 | 4 | `FlatFilter.jsx:156`, `FlatFilter2.jsx:157`, `FlatFilter3.jsx:117`, `home-2/Hero.jsx:88` |
| `far fa-map` | 400 | 5 | `CarDetails2–5`, `ProfileInfo.jsx:74` |
| `far fa-flag` | 400 | 4 | `CarDetails2.jsx:203`, `3:202`, `4:198`, `5:144` |
| `fa fa-fw fa-eye` | **900 → fa-solid-900 (138.6 KB)** | 2 | `modals/SignUp.jsx:104,134` |
| `fal fa-angle-down` | **300 → fa-light-300 (186.3 KB)** | **1** | `headers/Header4.jsx:57` — **a header variant no live route uses** |

Plus, in `style.scss`, 22 pseudo-element rules that set `font-family: "Font Awesome 5 Pro"`. Their weights, extracted from the compiled CSS:

- weight **900**: `.main-header .main-menu .navigation > li.dropdown2 > a:after`, `.dashboard .avatars-box .title-avatar a:after` → pulls **fa-solid-900**
- weight **100** (resolves to the 300 face): `.close-btn:before`, `.flat-blog .sub-box .title-2:before` → pulls **fa-light-300**
- weight **300**: `.widget-menu .recent-news li .content .days:before`
- weights 400/500/600/normal: chevrons, phone, email, map, check marks

`.close-btn` is rendered inside `components/modals/Login.jsx` and `SignUp.jsx`, which `ClientShell.jsx:83-84` mounts on **every single page**. **A 186.3 KB webfont downloads on every page of this site to draw a close button.**

### 4.5 Recommendation — and the Arabic budget

**Delete Font Awesome and the `autodeal` icon font. Inline the glyphs as SVG.**

- The distinct icon vocabulary is ~10 Font Awesome glyphs plus 29 `icon-autodeal-*` glyphs = ~39 icons. At a typical 300–500 bytes of inlined path data each, that is **~15 KB of markup, gzipped with the HTML**, versus **525.7 KB of webfonts**.
- The codebase already proves the pattern works: `components/common/WhatsAppButton.jsx:12-20` inlines the WhatsApp mark as SVG, and `components/homes/home-1/Hero.jsx:53-108` inlines three 26×26 feature icons. Do the same for the rest.
- Inline SVG also fixes the FOIT: an SVG paints with the first paint. There is no `font-display` question.
- It also fixes an accessibility problem — icon-font glyphs are private-use-area codepoints that screen readers announce as garbage.
- **Interim (30 minutes, if the full swap has to wait):** delete `Header4.jsx` (unused), replace `fa fa-fw fa-eye` in `SignUp.jsx` with an inline SVG, and change `.close-btn:before`'s `font-weight: 100` to `400`. That alone drops **fa-light-300 (186.3 KB) and fa-solid-900 (138.6 KB) = 324.9 KB** and leaves only `fa-regular-400`.

**The Arabic budget makes this urgent.** NICHE.md requires Arabic-first with English an equal second. A subsetted Arabic variable face costs **~30–34 KB** (measured on the candidates already staged: `cairo-arabic-var.woff2` = 30,712 B, `plexar-arabic-w400.woff2` = 33,512 B; the un-subsetted `noto-arabic-var.woff2` is 166,152 B and should be avoided). A full bilingual font stack is therefore:

| | bytes |
|---|---:|
| Latin variable text face (Inter) | ~48 KB |
| Latin variable display face (Outfit) | ~30 KB |
| Arabic variable face (Cairo/IBM Plex Sans Arabic, subsetted) | ~31 KB |
| **Total real font budget** | **~109 KB** |
| Currently spent on icon fonts alone | **526 KB** |

**You are currently spending 4.8× your entire bilingual typography budget on icons.** Killing Font Awesome does not just save bytes — it is what makes room for Arabic without the page getting heavier than it is today.

**Severity: blocker. Saving: 526 KB on every page view. Effort: ~1 day for the full SVG sweep; 30 minutes for the 325 KB interim. Risk: low — mechanical, and visually verifiable icon by icon.**

---

## 5. Rendering strategy

### 5.1 Measured route classification

From `.next/prerender-manifest.json` and `.next/app-path-routes-manifest.json` of the production build:

| Strategy | Routes |
|---|---|
| **Static (SSG, no revalidate)** | `/`, `/home02`–`/home10`, `/about-us`, `/contact`, `/faq`, `/dashboard`, `/add-listing`, `/change-password`, `/message`, `/my-favorite`, `/my-listing`, `/my-profile`, `/my-review`, plus the icon/manifest routes |
| **ISR, `initialRevalidateSeconds: 30`** | `/listing-grid`, `/listing-grid2`, `/listing-list`, `/listing-grid-map`, `/listing-list-map` |
| **Dynamic (SSR per request)** | `/listing-detail-v1/[id]` … `/listing-detail-v5/[id]` — **no entry in `dynamicRoutes`, and `grep -rn "generateStaticParams"` across `app/` and `lib/` returns nothing** |

### 5.2 Is the split right? Mostly — with one real hole.

**The hole: listing detail pages are fully dynamic.** — severity: **serious**

`apps/web/app/(car-details)/listing-detail-v1/[id]/page.jsx:44-53` runs on every request:

```js
const carItem = await resolveCar(id);   // → getListing()  → one Strapi fetch
const listings = await getListings();   // → a SECOND Strapi fetch
const recommended = (listings.length ? listings : allCars)
  .filter((elm) => elm.id !== carItem.id)
  .slice(0, 4);
```

Two problems:

1. **No `generateStaticParams`.** Listing pages are the most-linked, most-shared, most-Google-landed URLs on a classifieds site, and every one of them is rendered on demand. `lib/strapi.js:137-144` sets `next: { revalidate: 30 }` on the *fetch*, so the data is cached — but the render is not, and a cold path still pays a full Strapi round trip inside TTFB.
2. **`getListings()` is a sledgehammer for four cards.** `lib/strapi.js:150-160` requests `pagination[pageSize]=100` with **ten `populate[…]` relations** (`gallery`, `make`, `model`, `bodyType`, `condition`, `transmission`, `fuelType`, `color`, `city`, `features`) — the entire catalogue with every relation hydrated — and then `page.jsx:53` takes `.slice(0, 4)`. The same call is repeated identically in `listing-detail-v2` through `v5`.

**Fix:**

```js
export async function generateStaticParams() {
  const listings = await getListings();
  return listings.map((c) => ({ id: c.id }));
}
export const revalidate = 30;          // ISR, matching lib/strapi.js
export const dynamicParams = true;     // new listings still render on demand
```

and add a `getRecommended(excludeId, limit = 4)` to `lib/strapi.js` that requests `pagination[pageSize]=5` with only the fields a card needs (`title`, `price`, `year`, `mileage`, `slug`, `gallery`).

**Saving: removes a full Strapi round trip from TTFB on the highest-value pages; cuts the recommended-cars query from ~100 fully-populated records to 5 partial ones. Effort: 2–3 h. Risk: low.**

**Everything else is correctly classified.** ISR at 30 s on the browse pages is right for a marketplace. The dashboard routes being static is fine only because auth is not wired yet — flag this: **the moment real seller data appears, `/dashboard`, `/my-listing`, `/my-profile`, `/my-favorite`, `/message` must become dynamic**, or one seller's data will be baked into a page served to another. `app/robots.js` already disallows them and `app/sitemap.js:9-11` excludes them, which is the right groundwork.

**Nine homepage variants and five detail-page variants are being prerendered and shipped.** `/home02`–`/home10` are nine full builds of the same content, and `home-2/Hero.jsx:10` embeds a **103 MB video**. They canonicalise to `/` and are excluded from the sitemap (`app/sitemap.js:12-14`), so they are dead weight in the build, the deploy, and the CI cache. **Delete them.** Same for `listing-detail-v2`–`v5` and the four non-canonical browse layouts once a layout is chosen.

### 5.3 `"use client"` — 78 files, and most of them do not need it

| | count |
|---|---:|
| Files with `"use client"` | **78** |
| Files without | 84 |

Of the 78, **26 contain no React hook and no event handler at all** — they are pure static markup marked as client components. Of those 26, **11 are client only because they import Swiper**; the rest have no excuse:

| File | lines | Why it is client | Verdict |
|---|---:|---|---|
| `components/common/WhatsAppButton.jsx:1` | 76 | **Nothing.** No hooks, no handlers — it renders an `<a href>` and an inline SVG | **Delete `"use client"`.** It is rendered inside every listing card on every browse page |
| `components/carDetails/StickyContactBar.jsx:1` | 58 | Nothing | Delete `"use client"` |
| `components/homes/home-1/Process.jsx:1` | 366 | Swiper only | Swiper → CSS scroll-snap, then server |
| `components/homes/home-1/CarBrands.jsx:1` | 506 | Swiper only | Same |
| `components/homes/home-1/Cars2.jsx:1` | 359 | Swiper only | Same |
| `components/homes/home-1/Categories.jsx:1` | 97 | Swiper only | Same |
| `components/common/Features.jsx:1` | 370 | Swiper only | Same |
| `components/common/Trending.jsx`, `RecomandedCars.jsx`, `CarBrands.jsx`, `CarBrands2.jsx`, `Categories.jsx`, `Categories2.jsx` | — | Swiper only | Same |

A further **10 files** (`headers/Header1–4.jsx`, `modals/Login.jsx`, `SignUp.jsx`, `FilterSidebar.jsx`, `ListGridToggler.jsx`, `Pricing.jsx`, `Pagination.jsx`) have **no hooks** and are client purely because of inline `onClick` handlers that call `document.querySelector(...).classList.toggle(...)`. Example, `components/headers/Header1.jsx:55-60`:

```jsx
<a onClick={() => {
  document.querySelector(".header-search-icon").classList.toggle("opened");
  …
}}>
```

Header1 is **254 lines** and it hydrates on every page to toggle two CSS classes. Extract the ~15 interactive lines into a small `<SearchToggle>` client component and let the other 240 lines be server-rendered.

#### `components/footers/Footer1.jsx` — the worst offender — severity: **serious**

434 lines of entirely static footer markup — link columns, contact block, logo, social icons — plus a copyright line, marked `"use client"` at line 1 for exactly two reasons:

1. `emailjs` (line 4) for the newsletter form (`sendMail`, lines 19-42) — see §2.2, this should be a dynamic import anyway;
2. a `useEffect` (lines 43-71) that wires `click` listeners onto `.footer-heading-mobie` to accordion the footer columns on mobile, by directly mutating `style.height` and `style.padding`.

Both are removable:

- The **accordion** is `<details>`/`<summary>` with CSS. Zero JavaScript, native on every Android browser, keyboard-accessible for free.
- The **form** becomes a 20-line `<NewsletterForm />` client island, or better a **server action**, which removes `@emailjs/browser` from the browser entirely.

`Footer1` then becomes a server component: **~414 of its 434 lines stop being shipped as JavaScript to every route on the site.**

**Saving across §5.3: measured, the homepage's own component chunks are 598 KB + 388 KB + 126 KB + 145 KB of dev-mode source (98%+ of it executed, so it is not dead code — it is genuinely hydrating). Converting the static majority to server components removes it from the client bundle entirely. Realistic saving: 40–70 KB gz on the homepage *(estimate)* plus a large cut in hydration work — which is the INP lever, see §6. Effort: 2–3 days. Risk: medium; do it file by file.**

### 5.4 Two bugs in `app/ClientShell.jsx`

**a) A DOM node is appended on every navigation and never removed.** `ClientShell.jsx:20-30`, in a `useEffect` keyed on `[pathname]`:

```js
const injectSpace = document.createElement("div");
injectSpace.style.height = `${headerHeight}px`;
injectSpace.classList.add("header-lower-after-div");
nav.after(injectSpace);
```

The cleanup at lines 74-77 removes only the scroll listener. Every client-side navigation inserts another spacer `<div>` after `.header-lower`. Ten navigations, ten spacers. Because they are `display:none` this is invisible until a code path un-hides them — at which point the header gains N × `headerHeight` of blank space. **Add `injectSpace.remove()` to the cleanup, or query-and-reuse an existing one.** Severity: **minor** (correctness), 10 minutes.

**b) `new WOW()` per navigation with no `stop()`** — covered in §2.2. On desktop this leaks a 20 Hz `setInterval` per navigation.

---

## 6. Core Web Vitals

Measured with Chrome `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`, `longtask`, `paint`), mobile viewport 412×915 DPR 2, cache disabled. **These are localhost dev-server numbers — the absolute values are not predictive of Oman; the *identified elements and culprits* are.**

| Route | FCP | LCP | LCP element | CLS | long tasks |
|---|---:|---:|---|---:|---:|
| `/` | 1,412 ms | **1,436 ms** | `IMG.img-item lazyload` → `/assets/images/slider/hero-muscat-street.jpg` (373,272 px²) | **0.0000** | 2 (484 ms total) |
| `/listing-detail-v1/1` | 1,632 ms | **1,664 ms** | `IMG.lazyload` → `/assets/images/listings/toyota-corolla-2015-xli.jpg` | **0.0000** | 2 (286 ms) |
| `/listing-grid` | 3,704 ms | **3,728 ms** | **`SECTION.tf-banner style-2`** → CSS background `/assets/images/section/bg-13.jpg` | **0.0000** | 3 (426 ms) |
| `/listing-grid-map` | 1,080 ms | 1,096 ms | `IMG.lazyload` → `suzuki-swift-dzire-2016.jpg` | **0.0000** | 4 (511 ms) |

### 6.1 LCP

**Homepage — the LCP image is lazy-loaded.** — severity: **blocker**

`apps/web/components/homes/home-1/Hero.jsx:34-40`:

```jsx
<Image
  className="img-item lazyload"
  alt=""
  src={elm.imgSrc}
  width={3840}
  height={1920}
/>
```

Measured consequences in the served homepage HTML:

- `loading="lazy"` on **37 of 37** `<img>` tags — **including the LCP hero**.
- `fetchpriority="high"` on **0** of them.
- No `<link rel="preload" as="image">` for the hero. The only preload in the entire `<head>` is `<link rel="preload" as="script" fetchPriority="low">` for a Next chunk.

A lazy image is not requested until the browser has built enough layout to know it is in the viewport — which means, in order: HTML → **5 render-blocking stylesheets (102 KB gz / 638 KB decompressed)** → layout → *then* a 237 KB image request. On the Slow-4G model that is roughly **0.83 s for HTML+CSS, then ~1.19 s for the image, on top of latency and parse** — and it is entirely serialised. Chrome's own guidance is unambiguous: never lazy-load the LCP element.

Three further LCP problems on the hero:

- `alt=""` on the largest, most meaningful element on the page. It is a decorative-image signal; for the hero of a car marketplace it should describe the scene.
- `width={3840} height={1920}` but the file measures **2560×1280**. The 2:1 aspect ratio is right so CLS is unaffected, but with image optimisation enabled Next would request a 3840-wide variant that the source cannot supply.
- It is wrapped in a `<Swiper>` for a **single slide** (`data/heroSlides.js:4` — "Single slide, deliberately"), so the LCP element cannot paint until Swiper has hydrated and laid out.

**Fix (30 minutes, largest single LCP win on the site):**

```jsx
<Image
  src={elm.imgSrc}
  alt="A street in Muscat with used cars for sale"
  width={2560} height={1280}
  priority                                    // → fetchpriority=high + preload, disables lazy
  sizes="100vw"
  quality={70}
/>
```
…and drop the `<Swiper>` wrapper for the one-slide hero.

**`/listing-grid` — the LCP element is a CSS background image.** — severity: **serious**

Measured LCP element: `SECTION.tf-banner style-2`, painting `/assets/images/section/bg-13.jpg`. A CSS background cannot carry `priority`, cannot be preloaded without a hand-written `<link rel="preload">`, and is **not discovered until the CSS has been downloaded and parsed** — so it is structurally the slowest possible LCP candidate. It also measures **2880×861 at 21,776 bytes**, which for a near-flat gradient is 5× more than it needs (re-encoded: WebP q80 = 4.4 KB, AVIF q50 = **0.4 KB**).

**Fix:** either replace the background image with a CSS gradient (it is essentially a gradient already — the AVIF collapses to 0.4 KB, which tells you there is almost no detail in it), or promote it to a real `<Image priority>` behind the text. Also note the banner copy at `app/(car-listings)/listing-grid/page.jsx:31-38` is untouched template lorem ("Leading online car buying and selling platform") — flagging it here only because it is inside the LCP element.

### 6.2 CLS — measured 0.0000 on all four routes

Genuinely good, and it is not an accident:

- `next/image` emits `width`/`height` on all 37 homepage images — measured: **0 images without both dimensions**.
- The hero's declared 3840×1920 preserves the true 2:1 ratio, so the aspect-ratio box is correct even though the numbers are wrong.
- No webfonts load at all today (§4.2), so there is no font-swap reflow.
- `app/ClientShell.jsx:20-30` reserves the sticky-header height with a spacer div rather than letting the header pop out of flow.

**Three latent CLS risks to guard before they land:**

1. **Adding Inter/Outfit will introduce font-swap CLS** unless loaded via `next/font`, which generates a size-adjusted local fallback. Do not hand-roll the `@font-face`.
2. **The Arabic face will be worse**, because Arabic and Latin fallbacks have very different metrics. Use `next/font` with an explicit `adjustFontFallback`, and set `size-adjust`/`ascent-override` if self-hosting.
3. **`components/footers/Footer1.jsx:43-71`** mutates `content.style.height` and `content.style.padding` directly on click. That is not a layout *shift* today because it is user-initiated (`hadRecentInput`), but the `<details>` rewrite in §5.3 removes the risk entirely.

Also: `apps/web/components/common/Banner.jsx:11-18` and `:37-44` carry leftover lazy-loading-library attributes (`className="ls-is-cached lazyloaded"`, `data-src="…"`) alongside the real `src`. Harmless, but it is dead theme cruft duplicating every URL in the HTML — worth sweeping across the codebase (`data-src` appears in every header and footer logo too, e.g. `headers/Header1.jsx:22`, `:30`, `:190`).

### 6.3 INP

Measured **2–4 long tasks per page load, 286–511 ms of blocking time total** — on a desktop-class CPU with no throttling. A budget Android SoC is commonly 4–6× slower on main-thread JavaScript, which puts the same work in the **1.2–3.0 s** range *(estimate, standard CPU-throttling multiplier)*.

Identified culprits, most to least severe:

1. **Hydrating a page that is 90% static.** The homepage renders 8 sections, 7 of which are `"use client"` (§5.3), 5 of them solely because of Swiper. Every one of those trees is serialised into the RSC payload, shipped, and re-executed in the browser. `Footer1` alone is 434 lines hydrated on every route.
2. **Seven Swiper instances initialising on the homepage** (measured: 7 × `swiper-wrapper`, 45 × `swiper-slide` in the served HTML). Each does DOM measurement, touch-handler installation and transform setup on mount. This is the largest identifiable chunk of the 484 ms.
3. **`wowjs` scanning 91 `.wow` elements on mount and on every route change** (`ClientShell.jsx:62-70`) — and, on mobile, throwing the result away (§2.2).
4. **The filter reducer recomputes the whole result set on every keystroke/toggle.** `components/carsListings/Cars2.jsx:20` uses `useReducer` over the full listing array; `reducer/carFilterReducer.js` (112 lines) re-filters and re-sorts on every dispatch, and `Cars2.jsx:43-73` **reconstructs the entire `allProps` object literal on every render**, so all ~15 setter closures are new identities every time and every child re-renders. With 100 listings from `getListings()` this is fine; at 1,000 it will make the filter panel feel broken. **Fix:** memoise `allProps` with `useMemo`, wrap the filter/sort in `useMemo` keyed on the actual filter values, and move the price-slider updates behind `useDeferredValue` or a debounce.
5. **`components/carsListings/FilterSidebar.jsx:10`** runs `buildFilterOptions(allCars)` at **module scope** — it executes on import, during hydration, on any route that pulls the sidebar in, even if the user never opens the filter panel.
6. **Bootstrap's full ESM bundle** parsing on mount (`ClientShell.jsx:12-18`) — 135,902 bytes unminified to provide offcanvas, modal and dropdown (§2.2).

**Priority INP fixes:** (1) cut Swiper instances from 7 to 0 on the homepage, (2) make `Footer1` and the static sections server components, (3) delete `wowjs`, (4) memoise `allProps` in `Cars2.jsx`.

---

## 7. Network waterfall

Measured on the homepage, cold cache, mobile:

| Type | requests | transferred |
|---|---:|---:|
| Document | 1 | 68.6 KB |
| **Stylesheet** | 1 dev / **5 prod** | **108.6 KB** |
| Script | 28 dev / **14 prod** | 1,067 KB dev / **262 KB prod** |
| **Font** | **4** | **538.2 KB** |
| Image | 9 | 687.7 KB |
| Manifest + icon | 3 | 9.6 KB |

### 7.1 Render-blocking resources — severity: **blocker**

The `<head>` of every prerendered page contains **five render-blocking `<link rel="stylesheet">`**, in this order:

```html
<link rel="stylesheet" href="/_next/static/chunks/3jm2272edx6y-.css" data-precedence="next"/>  <!-- 124 KB -->
<link rel="stylesheet" href="/_next/static/chunks/1ehf1vz94bjll.css" data-precedence="next"/>  <!--  26 KB -->
<link rel="stylesheet" href="/_next/static/chunks/3wi2x3p0l_7dr.css" data-precedence="next"/>  <!-- 231 KB Bootstrap -->
<link rel="stylesheet" href="/_next/static/chunks/17199--8j1ro2.css" data-precedence="next"/>  <!-- 252 KB theme -->
<link rel="stylesheet" href="/_next/static/chunks/11tt7xpoxi-6z.css" data-precedence="next"/>  <!--   5 KB -->
```

**638 KB decompressed / 102 KB gz must arrive and parse before a single pixel paints**, and 93–95% of it is unused on the page being painted (§3.2). Every one of these traces back to `app/layout.js:1-5` and `public/assets/scss/style.scss:9-17`.

All 14 production scripts carry `async`, so JavaScript is **not** render-blocking. That part is fine.

### 7.2 Preconnect and third parties

- **`<link rel="preconnect" href="/" crossorigin>`** appears in every prerendered `<head>`. It preconnects to the **origin the document was just served from** — a no-op that costs a parser entry. Harmless; note it and move on. Severity: **minor**.
- **Third-party requests on `/` and `/listing-grid`: zero.** Everything is same-origin. This is genuinely good and worth protecting.
- **Third-party requests on `/listing-grid-map`: 30, totalling 567 KB**, across four Google origins (§2.2). Under a strict CSP this means `script-src https://maps.googleapis.com`, `img-src https://maps.googleapis.com https://maps.gstatic.com`, `style-src https://fonts.googleapis.com`, `font-src https://fonts.gstatic.com` — plus `connect-src` for the `$rpc` XHR. Removing the map removes all five exceptions.
- **The Google Fonts `@import` at `style.scss:16` is currently inert** (§4.2) and therefore, right now, the site makes no font request to Google. When Inter/Outfit are restored, **do not** restore them as an external `@import`. `next/font` self-hosts them onto your own origin, which keeps the CSP tight, removes a DNS+TLS+HTTP chain from the critical path, and is measurably faster from Oman than a Google Fonts round trip.

### 7.3 Assets that are shipped but should not be

| Asset | size | Referenced by | Verdict |
|---|---:|---|---|
| `public/assets/images/section/video.mp4` | **103,230,582 B (103 MB)** | `components/homes/home-2/Hero.jsx:10-12`, inside `<video autoPlay muted loop>` with **no `preload`, no `poster`** | **Delete.** It is 98% of the 105 MB `public/` directory. `/home02` is not in the sitemap and canonicalises to `/`, but the file is still deployed, still in the CDN, still in every CI artifact — and any visitor who does reach `/home02` starts streaming it immediately |
| `public/assets/images/slider/slide1–10.jpg` | 51 KB × 9 | theme demo data (`heroSlides.js` variants) | Delete with the `/home02`–`/home10` routes |
| `public/assets/fonts/fa-*.woff` (non-woff2) | 252,876 + 231,248 + 188,716 = **673 KB** | fallback `src` in `font-awesome.css:9430-9457` | Delete with Font Awesome |
| `public/assets/css/jquery.fancybox.min.css`, `magnific-popup.css`, `nice-select.css` | 29,502 B | `style.scss:11,12,14` | **Delete** — the jQuery plugins they style are not installed |
| `public/assets/images/car-list/car4.jpg` | 8,905 B, 450×338 | rendered on the homepage | Near-blank: re-encodes to **0.4 KB** as WebP. Something is rendering a placeholder that should not exist |

`du -sh public` = **105 MB**. After deleting the video and the unused theme demo imagery it should be well under 3 MB.

---

## 8. Images

### 8.1 `images: { unoptimized: true }` — confirmed, and quantified

`apps/web/next.config.mjs:2-5`:

```js
const nextConfig = {
  images: {
    unoptimized: true,
  },
};
```

Consequences, all measured:

- **No format negotiation.** Every image ships as the JPEG/PNG it was authored as. No WebP, no AVIF, regardless of `Accept`.
- **No resizing.** The `width`/`height` props become layout hints only; the browser downloads the full source file.
- **`sizes` is inert** — and, measured, **there are zero `sizes=` props anywhere in `app/` or `components/`** anyway.
- **`priority` is inert for preloading**, and, measured, **there are zero `priority` props anywhere**.
- **Everything gets `loading="lazy"`** by Next's default, including the LCP hero (§6.1).

### 8.2 Every image shipped on the homepage — measured

Extracted from the served HTML; sizes from disk. Multiplicities are Swiper loop duplicates, which share one HTTP request.

| Image | on-disk | dimensions | ×refs |
|---|---:|---|---:|
| `slider/hero-muscat-street.jpg` | **237.1 KB** | **2560×1280** | 1 |
| `listings/kia-picanto-2016.jpg` | 89.0 KB | 900×672 | 1 |
| `listings/hyundai-tucson-2018.jpg` | 88.4 KB | 900×672 | 1 |
| `listings/toyota-yaris-2016.jpg` | 85.2 KB | 900×672 | 3 |
| `listings/toyota-camry-2013-gl.jpg` | 84.7 KB | 900×672 | 3 |
| `listings/toyota-prado-2008-vx.jpg` | 83.6 KB | 900×672 | 3 |
| `listings/mitsubishi-pajero-2014.jpg` | 77.8 KB | 900×672 | 3 |
| `listings/nissan-sunny-2019.jpg` | 71.6 KB | 900×672 | 1 |
| `section/register.jpg` | 9.6 KB | — | 1 |
| `section/login.jpg` | 9.2 KB | — | 1 |
| `car-list/car4.jpg` | 8.9 KB | 450×338 | 1 |
| `brand/logo-horizontal-om-*.svg` × 2 | 7.8 KB each on disk / **2.9 KB each over the wire** (gzip) | — | 2 each |
| `partner/partner1–6.png` | 7.8 + 0.8 + 1.3 + 1.1 + 1.9 + 2.4 KB | — | 2 each |
| `img-box/find-car-1/2.png` | 2.1 KB each | — | 1 each |
| **Total unique image bytes on the homepage** | **880 KB** | | **21 files** |
| **Actually transferred on first paint (measured)** | **687.7 KB** | | 9 files |

Listing detail (`/listing-detail-v1/1`): **7 images, 420 KB**. Browse (`/listing-grid`): **8 images, 528 KB**.

### 8.3 What the missing optimisation costs — measured re-encodes

Re-encoded with `sharp` at realistic responsive widths for a 412 CSS px phone (DPR 2 → ~824 device px):

**Hero (2560×1280, 237.1 KB JPEG):**

| Encoding | size | saving vs today |
|---|---:|---:|
| Today | 237.1 KB | — |
| mozjpeg q72, same size | 236.8 KB | 0.3 KB — *already well compressed as a JPEG* |
| **WebP q80 @ 828w** | **37.2 KB** | **−199.9 KB (−84%)** |
| **AVIF q50 @ 828w** | **20.6 KB** | **−216.5 KB (−91%)** |
| WebP q80 @ 640w | 24.0 KB | −213.1 KB |
| AVIF q50 @ 640w | 13.8 KB | −223.3 KB |
| WebP q80 @ 1080w (tablet) | 59.4 KB | −177.7 KB |
| AVIF q50 @ 1080w | 33.3 KB | −203.8 KB |

Note the mozjpeg row: **the hero cannot be made meaningfully smaller as a JPEG.** The entire saving is in (a) format and (b) not sending 2560 px to a 412 px screen. That is exactly what `unoptimized: true` disables.

**Listing card (900×672, 71.6–89.0 KB JPEG), rendered into a `width={450}` slot (`components/common/Cars.jsx:140-146`, `components/carsListings/Cars2.jsx:295-301`):**

| Image | today | WebP q80 @640 | AVIF q50 @640 | saving (AVIF) |
|---|---:|---:|---:|---:|
| `kia-picanto-2016` | 89.0 KB | 48.2 KB | **26.8 KB** | −62.2 KB (−70%) |
| `toyota-prado-2008-vx` | 83.6 KB | 44.6 KB | **26.5 KB** | −57.1 KB (−68%) |
| `nissan-sunny-2019` | 71.6 KB | 37.7 KB | **20.9 KB** | −50.7 KB (−71%) |

**`section/bg-13.jpg`** — the `/listing-grid` LCP element: 2880×861, 21.8 KB → WebP native **4.4 KB**, AVIF native **0.4 KB**.

**`car-list/car4.jpg`** — 450×338, 8.9 KB → WebP **0.4 KB**. It is a near-blank placeholder.

**Rolled up for the homepage's first-paint image set** (hero + 5 listing cards + 2 logo SVGs, measured at 687.7 KB today):

| Strategy | image bytes | saving |
|---|---:|---:|
| Today (`unoptimized: true`) | 687.7 KB | — |
| WebP q80 at correct responsive widths | ~262 KB | **−426 KB (−62%)** |
| **AVIF q50 with WebP fallback, correct widths** | **~152 KB** | **−536 KB (−78%)** |
| …plus a genuine below-fold lazy boundary (only 2 cards above the fold) | **~92 KB** | **−596 KB (−87%)** |

### 8.4 Should `unoptimized` be turned off? Yes — but two things break

**Breakage 1: SVG.** Next's image optimiser refuses SVG unless `dangerouslyAllowSVG: true`. Measured usage — **only four distinct SVG files** are passed to `next/image`:

| File | referenced |
|---|---:|
| `brand/logo-horizontal-om-primary.svg` | **14×** |
| `brand/logo-horizontal-om-cream-terracotta.svg` | 5× |
| `dashboard/pen.svg`, `dashboard/hide.svg`, `dashboard/overview1/3/4.svg` | 1× each |

(e.g. `headers/Header1.jsx:20-35`, `headers/Header2.jsx:22-26`, `footers/Footer1.jsx:393-397`, `dashboard/Sidebar.jsx:50`, `dashboard/ListingsTable.jsx:166,184`.)

Three ways to unblock, in order of preference:

- **(A) Recommended — do not optimise SVG at all.** Flip the global flag off and add `unoptimized` to the ~7 SVG call sites: `<Image unoptimized src="…svg" … />`. SVG is already the optimal format; running it through a raster optimiser is pointless. **Zero new risk.**
- **(B) Better still — stop using `next/image` for SVG.** A logo is `<img src="/assets/images/brand/logo-horizontal-om-primary.svg" width={275} height={95} alt="Autosouq.om" />`. `next/image` adds nothing for a vector.
- **(C) `dangerouslyAllowSVG: true`** with `contentDispositionType: "attachment"` and `contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"`. Safe *today*, because every SVG is first-party. **But** Strapi accepts SVG uploads, and the moment a seller can upload one, this flag turns the image endpoint into a stored-XSS vector. **Do not take this option.**

**Breakage 2 — and this one is not in the brief, so flag it loudly: remote images from Strapi will 400.**

`lib/strapi.js:30-33`:
```js
function absoluteUrl(url) {
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}
```
Every CMS-hosted gallery image resolves to an absolute URL on the Strapi origin (`http://localhost:1337` in dev, per `lib/strapi.js:1`). With `unoptimized: true` Next passes those straight through. **Turn optimisation on without configuring `remotePatterns` and every real listing photo breaks with `400 Invalid src prop … hostname not configured`.** Today this is masked because Strapi has no gallery images and `placeholderFor()` (`lib/strapi.js:13-15`) falls back to local `/assets/images/listings/*.jpg` — so the bug will not surface in dev, only in production the day a seller uploads a photo.

**Required config:**

```js
// apps/web/next.config.mjs
const nextConfig = {
  images: {
    // unoptimized removed
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 412, 640, 828, 1080, 1200, 1920],   // 360/412 added: real Android widths
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "cms.autosouq.om", pathname: "/uploads/**" },
      // dev only:
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
    ],
  },
};
```

`deviceSizes` matters: Next's default set starts at 640, so a 412 px Android phone at DPR 2 requests the 828 bucket. Adding 360 and 412 gives DPR-1 devices — very common in this segment — a properly small variant.

### 8.5 Responsive `sizes` strategy — currently absent everywhere

Measured: **zero `sizes` props in the codebase.** Without `sizes`, `next/image` assumes `100vw` and picks the largest bucket. Required additions:

| Element | file:line | `sizes` |
|---|---|---|
| Hero | `homes/home-1/Hero.jsx:34-40` | `sizes="100vw"` + `priority` |
| Listing card, grid (1 col mobile / 2 tablet / 3 desktop) | `carsListings/Cars2.jsx:295-301` | `sizes="(max-width: 575px) 92vw, (max-width: 991px) 46vw, 31vw"` |
| Listing card, homepage rail | `common/Cars.jsx:140-146` | same |
| Detail gallery main image | `carDetails/sliders/Slider1.jsx` | `sizes="(max-width: 991px) 100vw, 66vw"` |
| Recommended-cars thumbnails | `detailComponents/Recommended.jsx` | `sizes="(max-width: 991px) 33vw, 200px"` |
| Author / avatar | `common/Cars.jsx:178-184` (57×57), `Cars2.jsx:337-343` (120×120) | `sizes="120px"` |
| Brand logos | `headers/Header1.jsx:20-35` etc. | plain `<img>`, no `sizes` needed |

### 8.6 Runtime optimisation vs build-time pre-optimisation

| | Next runtime optimiser | Pre-optimise at build with `sharp` |
|---|---|---|
| Effort | ~2 h (config + `sizes` + `priority`) | ~1 day (a script + a `<picture>` component) |
| Handles CMS uploads | **Yes** — the decisive factor | No — needs a Strapi-side pipeline |
| Cost | CPU on first request per variant, then cached | Zero at runtime |
| Static export compatible | No | Yes |

**Recommendation: use the Next runtime optimiser.** Listing photos come from Strapi and are unknown at build time, which rules out a pure build-time pipeline for the images that matter most. Additionally, ask Strapi to generate `large`/`medium`/`small` formats on upload and have `toCar()` (`lib/strapi.js:67-74`) prefer the appropriate one — belt and braces.

Separately, **do pre-optimise the static theme imagery once** (`public/assets/images/**`) with `sharp` and commit the results: the ten listing placeholders at 71.6–91.2 KB drop to ~27 KB each as AVIF (measured), and the hero drops from 237.1 KB to 20.6 KB at 828w. That is a one-off ~600 KB reduction in the repo and the deploy.

**Severity: blocker. Saving: 426–596 KB on the homepage, 250–350 KB on a listing page. Effort: 2–4 h for config + props; +1 day for the static pre-optimisation pass. Risk: medium — must ship `remotePatterns` and the SVG handling in the same change or images break.**

---

## 9. Total page weight and what it costs on a metered Omani plan

### 9.1 Measured totals, first-time visitor, cold cache, production

Composed from the measured dev waterfall with the dev JS bundle replaced by the measured **production** first-load JS, and the dev-only `geist-latin.woff2` and Next devtools chunks removed.

**Homepage `/`:**

| Resource | bytes | share |
|---|---:|---:|
| HTML document (gz) | 63 KB | 4% |
| **CSS — 5 files, render-blocking (gz)** | **102 KB** | **6%** |
| JS — 14 chunks (gz, polyfill excluded) | 262 KB | 16% |
| **Icon fonts — 3× Font Awesome + autodeal** | **526 KB** | **32%** |
| Images — hero + 5 cards + 2 logos + PWA icon | 688 KB | 42% |
| Manifest + icon.svg | 3 KB | <1% |
| **Total, first paint through settle** | **≈ 1,644 KB (1.61 MB)** | |
| …scrolling to the footer adds the rest of the 880 KB unique image set | **≈ 1.83 MB** | |

**Listing detail `/listing-detail-v1/[id]`:**

| Resource | bytes |
|---|---:|
| HTML document (gz) | 48 KB |
| CSS (gz) | 102 KB |
| JS (gz) *(estimate — route is not prerendered, see §5.1)* | ~205 KB |
| Icon fonts | 526 KB |
| Images — gallery + recommended | 420 KB |
| **Total** | **≈ 1,301 KB (1.27 MB)** |

**Browse `/listing-grid`: ≈ 1.42 MB. Map browse `/listing-grid-map`: ≈ 2.0 MB** (measured 2,578 KB in dev; the 473 KB third-party map delta is production-accurate).

A realistic first session — homepage, browse, three listings, warm cache for CSS/JS/fonts after page 1 — is **≈ 2.9 MB**.

### 9.2 What that costs, using real published tariffs

**Source: [Ooredoo Oman — Hala Prepaid internet add-ons](https://www.ooredoo.om/en/personal/mobile/hala-prepaid/hala-add-ons/internet/)** (retrieved 2026-07-25, prices stated inclusive of 5% VAT):

| Bundle | Price | Validity | Effective |
|---|---:|---|---:|
| 50 MB | OMR 0.040 | Daily | OMR 0.80/GB |
| **200 MB** | **OMR 0.100** | Daily | OMR 0.50/GB |
| 250 MB | OMR 0.500 | Daily | OMR 2.00/GB |
| **1 GB** | **OMR 1.000** | Daily | **OMR 1.00/GB** |
| 2 GB | OMR 1.500 | Daily | OMR 0.75/GB |
| 2 GB | OMR 2.000 | Weekly | OMR 1.00/GB |
| **3 GB** | **OMR 3.000** | 4 weeks | **OMR 1.00/GB** |
| 6 GB | OMR 5.000 | 4 weeks | OMR 0.83/GB |
| 15 GB | OMR 10.000 | 4 weeks | OMR 0.67/GB |

Omantel's Hayyak prepaid sits in the same band (widely reported at OMR 2 for a 1 GB add-on, but I could not retrieve a first-party Omantel tariff page, so **only the Ooredoo figures above are cited as fact**).

**The realistic rate for this audience is OMR 1.00 per GB** — the 1 GB daily add-on and the 3 GB / 4-week bundle both land exactly there, and those are the bundles someone on OMR 325–600 a month actually buys.

At OMR 1.00/GB:

| | data | cost | share of a **200 MB** add-on (OMR 0.100) | share of a **3 GB / 4-week** bundle (OMR 3) |
|---|---:|---:|---:|---:|
| Homepage, first visit | 1.61 MB | OMR 0.0016 (1.6 baisa) | **0.80%** | 0.052% |
| Listing detail | 1.27 MB | OMR 0.0013 | 0.64% | 0.041% |
| Map browse page | 2.00 MB | OMR 0.0020 | 1.00% | 0.065% |
| **Realistic 5-page session** | **2.9 MB** | **OMR 0.0029** | **1.45%** | 0.094% |
| **After the fixes in §10** | **~0.9 MB** | OMR 0.0009 | 0.45% | 0.029% |

**Read honestly:** in cash, this is fractions of a baisa. Nobody abandons a car search over 1.6 baisa. **The money is not the argument.** Two things are:

1. **Share of the cheapest realistic top-up.** The **200 MB daily add-on at OMR 0.100** is the bundle someone buys when they are short. **One homepage load consumes 0.80% of it. A 5-page browse consumes 1.45%.** Shopping for a car properly — 30 or 40 listings over a week — costs **8–12% of a 3 GB monthly bundle** on today's build, versus **3–4%** after the fixes. For a buyer on OMR 325 a month, a bundle that runs out three days early is a real event.

2. **Time, which is where the sale is actually lost.** Against the standard Lighthouse Slow-4G model (1,638.4 kbps, 150 ms RTT), transfer time alone:

| | bytes | pure transfer | plus 5 stylesheets blocking, lazy hero, and 300–500 ms of measured main-thread work on a 4× slower CPU |
|---|---:|---:|---|
| Homepage today | 1.61 MB | **8.2 s** | comfortably past the 12 s the brief describes |
| Homepage after §10 | ~0.42 MB | **2.1 s** | LCP within reach of the 2.5 s "good" threshold |

**A 526 KB icon-font download that renders ten glyphs is 2.6 s of a 12 s page on this model.** That is the number that loses the sale, and it is the number that makes a marketplace whose entire proposition is trust read as untrustworthy.

---

## 10. Prioritised fix list

Ranked by **(bytes or milliseconds saved ÷ effort)**. "Saving" is per page view unless stated.

### Tier 1 — do these first (highest ratio, low risk)

| # | Fix | file:line | Saving | Effort | Severity |
|---|---|---|---:|---:|---|
| **1** | **Delete Font Awesome + `autodeal`; inline ~39 glyphs as SVG.** Interim (30 min): delete `Header4.jsx`, replace `fa fa-fw fa-eye` in `SignUp.jsx:104,134`, change `.close-btn:before` `font-weight:100`→`400` — that alone drops fa-light + fa-solid | `public/assets/scss/style.scss:9,15`; `public/assets/css/font-awesome.css:9425-9465`; `public/assets/fonts/style.css:1-7` | **526 KB** (interim: **325 KB**) | 1 d (interim 30 min) | **blocker** |
| **2** | **Turn off `unoptimized`**; add `formats:["image/avif","image/webp"]`, `deviceSizes` incl. 360/412, and **`remotePatterns` for Strapi**; add `unoptimized` to the 7 SVG `<Image>` call sites (or convert them to plain `<img>`) | `next.config.mjs:2-5`; `headers/Header1.jsx:20-35`, `Header2.jsx:22-26`, `footers/Footer1.jsx:393-397`, `dashboard/Sidebar.jsx:50`, `dashboard/ListingsTable.jsx:166,184` | **426–596 KB** homepage | 3 h | **blocker** |
| **3** | **`priority` + real dimensions + `sizes` + a descriptive `alt` on the hero; drop the one-slide `<Swiper>`** | `homes/home-1/Hero.jsx:25-40`; `data/heroSlides.js:4` | **LCP: removes a full serialised round trip.** Model: ~1.2 s | 30 min | **blocker** |
| **4** | **Delete `public/assets/images/section/video.mp4`** and the `<video>` in `home-2/Hero.jsx`; delete `/home02`–`/home10` | `homes/home-2/Hero.jsx:10-12`; `app/(homes)/*` | **103 MB** from the deploy; unbounded on `/home02` | 1 h | **blocker** |
| **5** | **Delete the three jQuery-plugin stylesheets** — Fancybox, Magnific Popup, Nice Select — whose plugins are not installed; and `swiper-bundle.min.css`, which duplicates `layout.js:3-4` | `public/assets/scss/style.scss:11,12,14,13` | **~43 KB raw / ~11 KB gz** | 15 min | serious |
| **6** | **Lazy-load `@emailjs/browser`** inside the submit handlers | `footers/Footer1.jsx:4,19-42`; `otherPages/Contact.jsx:4,19` | **12 KB gz × every route** | 20 min | serious |
| **7** | **Remove `wowjs`** + `animate.css`; if fades are wanted on desktop, 6 lines of IntersectionObserver | `app/ClientShell.jsx:62-70`; `style.scss:10`; `package.json:13` | **11 KB gz JS + ~37 KB raw CSS × every route**, + a desktop timer leak | 2 h | serious |
| **8** | **`pnpm remove chart.js`** — orphaned, zero source imports | `package.json:12` | 59 KB gz (locks in the deletion) + 6.2 MB install | 5 min | serious |
| **9** | **Move `rc-slider` + `photoswipe` CSS out of the global layout**; `next/dynamic` the `FilterSidebar` | `app/layout.js:1,5`; `carsListings/FilterSidebar.jsx:4,10` | **9 KB gz JS + ~6 KB gz CSS × every route** | 1 h | minor |

**Tier 1 total: ~1.0 MB off the homepage, in roughly two days.**

### Tier 2 — high value, meaningful effort

| # | Fix | file:line | Saving | Effort | Severity |
|---|---|---|---:|---:|---|
| **10** | **Remove Google Maps.** Delete `/listing-grid-map` + `/listing-list-map` and `@react-google-maps/api`; replace with a WhatsApp/`maps.google.com` link on the detail page | `carsListings/ListingMap.jsx:198-201`; `Cars4.jsx:369`; `Cars5.jsx:395`; `dashboard/Map.jsx:192`; `package.json:9` | **598 KB** on those routes; **4 third-party origins**; 5 CSP exceptions | 2 h (delete) / 4 h (tap-to-load) | **blocker** on those routes |
| **11** | **Purge/subset the CSS.** Delete the vendor `@import`s, switch Bootstrap to a Sass `@use` of the ~13 partials in use, add PurgeCSS with a 10-class safelist | `style.scss:9-17`; `app/layout.js:2` | **102 KB gz → ~12–18 KB gz**, and unblocks first paint | 1–2 d | **blocker** |
| **12** | **`generateStaticParams` + `revalidate = 30` on the detail routes**; add a narrow `getRecommended()` instead of `getListings()` (`pageSize=100`, 10 populates) for four cards | `app/(car-details)/listing-detail-v1/[id]/page.jsx:44-53` (and v2–v5); `lib/strapi.js:150-160` | Removes a Strapi round trip from TTFB on the highest-value URLs | 3 h | serious |
| **13** | **Restore Inter + Outfit via `next/font`, self-hosted, Latin subset, no italic axis, `display:swap`.** Do **not** re-add the `@import` | `style.scss:16`; `abstracts/_variables.scss:2-3`; `app/layout.js` | Fixes a live design bug; ~78 KB, self-hosted, no third-party origin, no CLS | 3 h | serious |
| **14** | **`Footer1` → server component.** `<details>`/`<summary>` for the mobile accordion; the newsletter form becomes a small island or a server action | `footers/Footer1.jsx:1,4,43-71` | ~414 of 434 lines stop hydrating **on every route** | 4 h | serious |
| **15** | **Replace the homepage's 7 Swiper instances with CSS scroll-snap**; convert the 5 sections that are `"use client"` only for Swiper to server components | `homes/home-1/{Hero,Categories,Process,Cars2,CarBrands}.jsx:1` | **43–69 KB gz** + the bulk of the measured 484 ms of long tasks | 1–2 d | serious |
| **16** | **Pre-optimise the static theme imagery** with `sharp`, commit AVIF+WebP; delete the unused `slider/slide1–10.jpg` and the near-blank `car-list/car4.jpg` | `public/assets/images/**` | ~600 KB in-repo; smaller deploys | 1 d | minor |

### Tier 3 — worthwhile, lower ratio

| # | Fix | file:line | Saving | Effort | Severity |
|---|---|---|---:|---:|---|
| 17 | Subset Bootstrap JS to `Offcanvas`, `Modal`, `Dropdown`, `Collapse` | `app/ClientShell.jsx:12-18` | ~10–15 KB gz *(estimate)* | 3 h | minor |
| 18 | Convert the 10 handler-only client components (`Header1–4`, `Login`, `SignUp`, `Pagination`, `ListGridToggler`, `Pricing`, `FilterSidebar`) to server components with tiny client islands | `headers/Header1.jsx:1,55-60` et al. | 20–40 KB gz *(estimate)* + hydration time | 2 d | minor |
| 19 | Fix the spacer-div leak: `injectSpace.remove()` in cleanup | `app/ClientShell.jsx:20-30` | Correctness | 10 min | minor |
| 20 | Memoise `allProps` and the filter/sort in `Cars2.jsx`; move `buildFilterOptions` out of module scope in `FilterSidebar.jsx` | `carsListings/Cars2.jsx:20,43-73`; `FilterSidebar.jsx:10` | INP under filtering, especially past ~200 listings | 3 h | minor |
| 21 | Replace the `/listing-grid` LCP CSS-background banner with a CSS gradient or an `<Image priority>`; rewrite its lorem copy | `app/(car-listings)/listing-grid/page.jsx:24-44` | 21 KB + a structurally slow LCP | 1 h | serious |
| 22 | Delete `listing-detail-v2`–`v5` and the redundant browse layouts | `app/(car-details)/*`, `app/(car-listings)/*` | Build time, deploy size, crawl budget | 2 h | minor |
| 23 | Strip dead theme attributes (`data-src`, `className="lazyload ls-is-cached lazyloaded"`) from ~60 `<Image>` call sites | `common/Banner.jsx:11-18,37-44`; `headers/Header1.jsx:22,30,190`, and throughout | A few KB of HTML on every page | 1 h | minor |
| 24 | Remove the self-referencing `<link rel="preconnect" href="/" crossorigin>` | Next-emitted | Negligible | 15 min | minor |
| 25 | Enable Brotli at the CDN/edge. Measured on the CSS bundle: gzip-9 **108,816 B** vs brotli-11 **84,390 B** | deploy config | **~22% off all text assets** | 1 h | minor |

---

## 11. Projected outcome

| | today (measured) | after Tier 1 | after Tier 1+2 |
|---|---:|---:|---:|
| Homepage total | **1,644 KB** | ~640 KB | **~415 KB** |
| — icon fonts | 526 KB | **0 KB** | 0 KB |
| — images | 688 KB | ~152 KB | ~110 KB |
| — CSS (gz) | 102 KB | ~91 KB | **~14 KB** |
| — JS (gz) | 262 KB | ~230 KB | ~180 KB |
| — text fonts | 0 KB *(broken)* | 0 KB | ~78 KB *(working)* |
| Listing detail total | ~1,301 KB | ~570 KB | ~380 KB |
| Map browse total | ~2,000 KB | ~950 KB | **route deleted** |
| Transfer time @ Slow-4G model | **8.2 s** | 3.2 s | **2.1 s** |
| Cost per 5-page session @ OMR 1/GB | OMR 0.0029 | OMR 0.0012 | **OMR 0.0009** |
| Share of a 200 MB / OMR 0.100 add-on, per homepage load | **0.80%** | 0.31% | **0.20%** |

**Note that Tier 1+2 leaves the site lighter than today even after adding the Arabic font and the two Latin text faces that are currently missing.** That is the point: the icon-font budget is what is standing between this build and a genuinely bilingual, genuinely fast site.

---

## 12. The single highest-impact change

> **Delete Font Awesome and the `autodeal` icon font, and inline the ~39 glyphs the site actually uses as SVG.**

- **Measured saving: 525.7 KB on every single page view** — 32% of the homepage, more than all the photography, more than all the JavaScript.
- **It is what the 526 KB is buying that makes this indefensible:** ten Font Awesome glyphs, one of which (`fal fa-angle-down`, 186.3 KB of font) appears exactly once, in a header variant no live route renders; and a 138.6 KB Solid face pulled in by a dropdown caret and a password-reveal eye. A **186.3 KB webfont downloads on every page of this site to draw a close button** (`.close-btn:before`, `font-weight: 100`, inside the login/signup modals that `ClientShell.jsx:83-84` mounts everywhere).
- **It also fixes a trust problem, not just a speed problem.** Both icon faces are `font-display: block` — up to three seconds during which the page renders with holes where the search, filter, WhatsApp and navigation icons should be. A page full of missing icons is exactly what a scam listing site looks like, and NICHE.md is explicit that trust is the entire differentiator.
- **The codebase already contains the answer.** `components/common/WhatsAppButton.jsx:12-20` and `components/homes/home-1/Hero.jsx:53-108` inline their icons as SVG. The pattern is established, proven in this repo, and simply needs to be applied to the rest.
- **Effort: about one day. Risk: low — mechanical, and verifiable icon by icon.** A 30-minute interim (delete the unused `Header4.jsx`, swap the one `fa-eye`, change one `font-weight`) banks **325 KB of the 526 KB immediately**.

---

**Sources**

- [Ooredoo Oman — Hala Prepaid internet add-ons](https://www.ooredoo.om/en/personal/mobile/hala-prepaid/hala-add-ons/internet/) — prepaid data bundle prices in OMR, inclusive of 5% VAT (retrieved 2026-07-25). The only tariff figures asserted as fact in this report.
- [Omantel — Hayyak prepaid plans](https://www.omantel.om/Personal/mobile/Prepaid/Plans/Hayyak%20Tariff%20Plan) — consulted for cross-reference; a first-party price table could not be retrieved, so no Omantel figure is asserted.
