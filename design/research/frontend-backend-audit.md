# Frontend ↔ CMS coherence audit — Autosouq.om

**Date:** 2026-07-25 · **Scope:** `apps/web` (Next.js 16) ↔ `apps/cms` (Strapi 5)
**Method:** code read, plus read-only queries against the running Strapi at `http://localhost:1337`.
**Nothing under `apps/` was modified.**

> **Snapshot caveat.** Nine agents were editing `apps/` while this audit ran. One finding
> (B1) is an in-flight broken edit observed at read time; two dev servers on :3000 and
> :3001 were returning inconsistent responses, so all runtime claims below are derived
> from reading the code, not from hitting the servers. Re-verify B1 before acting on it.

---

## 0. Executive summary

The **seam is good**. `lib/strapi.js`, `lib/whatsapp.js`, `lib/listingLabels.js`, `lib/seo.js`
and the detail-page components are careful, well-reasoned, NICHE-aware code. Nulls are
guarded, nothing is invented, the price is never rendered with a `$`.

The **problem is reach**. The good code is wired into roughly a third of the surface area.
The home page — the site's front door — never calls the CMS at all, renders demo cars, and
shows a price slider reading **"60,000 OMR – 90,000 OMR"** over a marketplace whose entire
identity is OMR 1,500–6,000. Meanwhile the CMS's own seed data puts Arabic strings in the
English `title` column, so every listing on the English site is titled in Arabic.

Three things dominate everything else:

1. **The home page is not connected to the CMS** and its filter contradicts NICHE.md's price band.
2. **`title`/`titleAr` are inverted in the CMS seed**, so the bilingual contract is broken at the source.
3. **The demo fallback has no `whatsapp` field**, so the moment Strapi is unreachable the
   "one WhatsApp tap" promise disappears from every page on the site.

---

## 1. Contract integrity: every CMS field traced to a pixel

### 1.1 The field map

`toCar()` — `apps/web/lib/strapi.js:67–135`.

| CMS field (`schema.json`) | `toCar` key | Consumed by | Rendered? |
|---|---|---|---|
| `title` | `title` (via `pick`) | `Cars1–5`, `common/Cars*`, all `CarDetails*`, `Recommended`, `ListingsTable`, `lib/seo.js` | ✅ **but see B2** |
| `titleAr` | `title` (via `pick`) | same | ⚠️ null in all 10 seeded rows — **B2** |
| `slug` | `id` (`strapi.js:78`) | every `<Link href={/listing-detail-v1/${car.id}}>` | ✅ |
| `description` | `description` | `detailComponents/Description.jsx`, `seo.js:247` | ✅ **but richtext rendered raw — M4** |
| `descriptionAr` | `description` (via `pick`) | same | ⚠️ null in all seeded rows — **B2** |
| `price` | `price` (`strapi.js:83`) | `formatPrice` in 36 files, `StickyContactBar:35`, `vehicleJsonLd:289` | ✅ |
| `currency` | `currency` | `formatPrice(price, currency)` | ✅ |
| `year` | `year` | `SpecChips:29`, `Overview:116`, card year badges | ✅ |
| `mileage` | `km` | `SpecChips:16–24`, `ListingsTable:227`, cards, `seo.js:264` | ✅ (km everywhere, no miles) |
| `whatsapp` | `whatsapp` | `WhatsAppButton`, `StickyContactBar`, `ProfileInfo` | ✅ from CMS; ❌ **absent from demo fallback — B3** |
| `phone` | `phone` | `StickyContactBar:23`, `ProfileInfo:16` (`tel:`) | ✅ |
| `featured` | `featured` | "Featured" flag on every card | ✅ |
| `verified` | `verified` | **`ProfileInfo:45,66` only** | ⚠️ **detail page only — S1** |
| `soldAsIs` | `soldAsIs` | `ListingSignals:26`, `ListingsTable:270`, `MyFavourite:158` | ✅ |
| `listingStatus` | `listingStatus` | `sitemap.js:59`, `seo.js:292` (JSON-LD) — **never rendered visually** | ❌ **S2** |
| `importOrigin` | `importOrigin` | `ListingSignals`, `ListingsTable`, `MyFavourite`, `seo.js:284` | ⚠️ **missing on most cards — S3** |
| `cylinders` | `cylinder` (singular) | `Overview:50`, `carOptions.js:32` filter | ✅ |
| `doors` | `door` (singular) | `Overview:94`, `carOptions.js:31` filter | ✅ |
| `seats` | `seats` | `Overview:160` | ✅ |
| `engineSize` | `engineSize` | `Overview:204`, `seo.js:268` | ✅ (but **no unit shown — N1**) |
| `driveType` | `driveType` (mapped) | `Overview:226`, `seo.js:281` | ✅ mapping complete — see 1.3 |
| `address` | `address` | `CarDetails1:94` (+v2–v5), `ProfileInfo:71` | ✅ |
| `latitude`/`longitude` | same | `CarDetails1:98–106` (+v2–v5), `ProfileInfo:78`, `ListingMap:209` | ✅ (needs a Maps key) |
| `videoUrl` | — | **nothing** | ❌ **dead weight — S4** |
| `gallery` | `images`, `imgSrc`, `imageAlt`, `hasPlaceholderImage` | `sliders/gallery.js`, all cards | ✅ |
| `make` → | `make` | cards, filters, `seo.js:255` | ✅ |
| `model` → | `model` | cards, filters, `seo.js:256` | ✅ |
| `bodyType` → | `body` **and** `type` (duplicated, `strapi.js:90–91`) | cards, filters | ✅ (dup — **N2**) |
| `condition` → | `conditionType` | `Overview:28` only | ✅ |
| `transmission` → | `transmission` | `SpecChips:27`, `Overview:182`, cards, filters | ✅ |
| `fuelType` → | `fuelType` | `SpecChips:25`, `Overview:72`, cards, filters | ✅ |
| `color` → | `color` | `Overview:138`, filters | ✅ |
| `city` → | `location` | cards, filters | ✅ |
| `features` → | `features` | `detailComponents/Features.jsx`, filter checkboxes | ✅ |
| — | `documentId` (`strapi.js:79`) | **nothing** | ❌ dead — **N3** |
| — | `authorName`/`authorImage` (`strapi.js:126–127`) | 18 `next/image` sites | ⚠️ 17 guarded, **1 not — B4** |
| — (CMS has no column) | `updatedAt` | wanted by `sitemap.js:54–57` | ❌ **M1** |

**Answer to "which are dead weight, which are genuinely missing":**

- **Genuinely dead weight in the model:** `videoUrl` (collected by the form, stored by the
  CMS, rendered nowhere). `documentId` (mapped by `toCar`, consumed nowhere).
- **Genuinely missing from the UI, not dead:** `verified` (card surface), `listingStatus`
  (no "Sold"/"Reserved" badge anywhere a buyer looks), `importOrigin` on ~15 of the ~20 card
  components.
- **Not dead at all** (the brief listed these as suspects, but they *do* reach the UI):
  `engineSize`, `cylinders`, `doors`, `seats`, `driveType`, `latitude`/`longitude`,
  `address`, `condition` — all rendered on the detail page via `Overview.jsx`,
  `CarDetails1–5` and `ProfileInfo.jsx`.

### 1.2 UI that expects fields the CMS does not have

| UI expects | Where | CMS status |
|---|---|---|
| `vin` / chassis number | `AddListing.jsx:327–338` | **No attribute.** Field is collected, nothing can store it. |
| PDF service documents | `AddListing.jsx:662–716` | **No media attribute.** Nothing can store them. |
| `status` (`"Approved"`/`"Sold"`/`"Pending"`) | `ListingsTable.jsx:150,153`; `DashBoard.jsx:24–27` | CMS has `listingStatus` with different values. **Key name mismatch — S5.** |
| `postedDate`/`createdAt` | `ListingsTable.jsx:246` | CMS has `createdAt`; `toCar` drops it. Column shows "—" always. |
| `lat`/`long` (short form) | `ListingMap.jsx:209–210` | Normalised — handled correctly. |
| `authorName`/`authorImage` | 18 card sites | Deliberately null. No seller entity exists. |
| Arabic seller-facing inputs (`titleAr`, `descriptionAr`) | `AddListing.jsx` | CMS **has** the columns; **the form has no inputs for them — S6.** |

### 1.3 Type and unit mismatches

- **`price` is a Strapi `decimal`.** Live API returns it as a JSON number (verified:
  `"price": 2700`, not `"2700"`). `toCar:83` does `Number(listing.price) || 0`.
  - Nothing assumes integer *for display* — `formatPrice` handles decimals.
  - ⚠️ `|| 0` turns a null/absent price into `0`, which `formatPrice` renders as
    **"0 OMR"** rather than the "—" it returns for non-finite input. On a site whose first
    promise is "the price you see is the real price", `0 OMR` is worse than a dash.
    Should be `listing.price == null ? null : Number(listing.price)`. **M2.**
  - ⚠️ `AddListing.jsx:512` sets `step={10}` on the price input. That makes 1,175 and 2,745
    invalid in the browser — and **1,175 is a price in the CMS's own seed**
    (`cms/src/index.ts:412`), whose comment explicitly says prices are "round-ish but never
    perfectly round". **M3.**
- **Mileage is km everywhere.** ✅ `SpecChips:22`, `ListingsTable:228`, `seo.js:264` (`unitCode: "KMT"`),
  `AddListing.jsx:348` ("Mileage (km)"). No "miles" survives.
- **`driveType` enum → label mapping is complete and correct.**
  `strapi.js:121–123` maps all four enum values `fwd→FWD, rwd→RWD, awd→AWD, four_wd→4WD`;
  `seo.js:195–200` maps all four labels onto the schema.org enum. No gaps.
  - Nit: an unrecognised enum value yields `undefined` rather than the `null` used
    everywhere else in `toCar`. **N4.**
- **`engineSize`** is a decimal rendered bare: `Overview:204` prints `1.6`, not `1.6 L`. **N1.**

### 1.4 Null-safety — verifying the "~17 unguarded `next/image`" claim

**The claim is accurate but incomplete.** There are **18** `next/image` sites bound to
`authorImage`. **17 are now guarded**; **1 is not**.

Guarded (all via a `{car.authorName && (…)}` wrapper, which works because both fields are
always null together):
`Cars1:609` · `Cars2:336` · `Cars3:625` · `Cars4:326` · `Cars5:352` ·
`common/Cars.jsx:176` · `common/Cars2:209` · `common/Cars3:234` · `common/CarSlider:189` ·
`common/RecomandedCars:187` · `home-1/Cars2:184` · `home-1/Cars2:331` · `home-2/Cars:180` ·
`home-3/Cars:180` · `home-5/Cars:180` · `home-7/Cars:201` · `home-7/Cars2:172` ·
`home-9/Cars:231` · `home-9/Cars2:231` · `home-9/Cars3:204` · `home-10/Cars:217` ·
`home-10/Cars2:186`.

**Remaining unguarded — `apps/web/components/dashboard/MyFavourite.jsx:106–113`:**

```jsx
<div className="img-author">
  <Image className="lazyload" alt="" src={car.authorImage} width={120} height={120} />
```

`MyFavourite.jsx:12,19` sources from `cars` in `data/cars.js`, where **every** entry has
`authorImage: null`. `next/image` with `src={null}` throws. `/my-favorite` is a hard render
failure. Consistent with the 500 observed on :3000 during this audit. **B4.**

Second-order nit: the guard used everywhere is `authorName &&`, not `authorImage &&`. If a
seller entity ever lands with a name but no avatar, all 17 sites break at once. Guard the
thing you are about to render. **N5.**

---

## 2. The price band, end to end

### 2.1 Layer-by-layer

| Layer | File | Enforces? |
|---|---|---|
| CMS schema | `cms/.../listing/schema.json:32–37` — `"min": 1000, "max": 6000` | ✅ Content-API validation only |
| CMS lifecycle | `cms/.../listing/lifecycles.ts:21–43` | ✅ **The real guard** — fires on the query engine too, so `strapi.db.query().create()` cannot bypass it |
| `soldAsIs` derivation | `lifecycles.ts:42` — `data.soldAsIs = price <= 1499` | ✅ Derived, never chosen. Correct. |
| Client validation | `AddListing.jsx:22–70` | ✅ Mirrors `BAND` exactly, same order, same thresholds |
| Filter/slider UI | `FlatFilter3.jsx:196–197`, `FilterSidebar.jsx:81–82` (derived from data) | ✅ |
| Filter/slider UI | **`FlatFilter.jsx:48,256–257`, `FlatFilter2.jsx:49,241–242`** | ❌ **BLOCKER — B5** |
| Demo fallback | `data/cars.js` | ✅ All 40 prices in 1,175–5,900; the three under 1,500 (1,175 / 1,250 / 1,400) all carry `soldAsIs: true` |
| Read path | `lib/strapi.js:150–160` | ❌ No `filters[price][$lte]=6000` — no defence in depth |

### 2.2 Boundary reasoning (`lifecycles.ts:21–43`)

| Input | schema | hook | `soldAsIs` | Result |
|---|---|---|---|---|
| **1000** | pass (`min:1000`) | `1000 >= 1000`, `<= 1499` | `true` | ✅ accepted, labelled as-is |
| **1499** | pass | `<= 1499` | `true` | ✅ accepted, labelled as-is |
| **1500** | pass | `> 1499` | `false` | ✅ accepted, no label |
| **6000** | pass (`max:6000`, inclusive) | `6000 > 6000` is false | `false` | ✅ accepted |
| **6001** | **reject** | **reject** — `ValidationError` naming NICHE.md | — | ✅ rejected twice |
| **999** | reject | reject | — | ✅ |
| **`null`** | reject (`required`) | `Number(null)=0` → `< 1000` → throw | — | ✅ |
| **`""`** | reject | `Number("")=0` → throw | — | ✅ |
| **`"abc"`** | reject (decimal) | `NaN` → **early return at line 25, no error, `soldAsIs` untouched** | unchanged | ⚠️ relies entirely on schema validation |
| **`"2700"`** (string) | pass | `Number("2700")` | `false` | ✅ |

### 2.3 Paths where an out-of-band listing could reach a user

**B5 — BLOCKER. The home page filter advertises a 40,000–100,000 OMR marketplace.**

`components/common/FlatFilter.jsx:48` → `useState([60000, 90000])`, rendered at line 251 as
`Price: {formatPrice(60000)} - {formatPrice(90000)}` → **"60,000 OMR – 90,000 OMR"**, with
the slider bounded `MIN={40000} MAX={100000}` (lines 256–257). Identical in
`FlatFilter2.jsx:49,241–242`.

Reach: `FlatFilter` is rendered by `homes/home-1/Filter.jsx` → **`app/page.jsx:21` — the
site's home page** — plus `home-4` and `home-10`. `FlatFilter2` covers `home-3`, `home-5`,
`home-6`, `home-7`, `home-8`, `home-9`. That is **every homepage variant on the site**.
A buyer's first impression is a price control whose *floor* is nearly seven times the
site's ceiling.

Same components also carry:
- Theme demo makes — `FlatFilter.jsx:80–86`: Audi, BMW, Dongfeng, Ford, Foton, Isuzu
  (none exist in the CMS `make` taxonomy).
- Theme demo models — `:94–101`: A4, Bellett, C-Class, Mondeo Sport, Territory.
- `$` leaking out of a template literal into visible text —
  `FlatFilter.jsx:233` renders `kms: 60000 kms - $90000 kms`, `:269` renders
  `year: 2016 - $2025`. Same at `FlatFilter2.jsx:218,254`.
- A "Find cars" button that is `<a href="#">` (`:154`) and does nothing.

**S7 — no server-side band filter.** `getListings()` (`strapi.js:153`) fetches with no price
filter. If an out-of-band row ever exists — direct SQLite write, a row created before the
guard landed, a future migration — it renders. Add `&filters[price][$lte]=6000` and
`&filters[price][$gte]=1000`. Cheap defence in depth on the rule the business *is*.

**S8 — `beforeUpdate` can be bypassed when `where.id` is absent.**
`lifecycles.ts:56` guards on `where?.id`. Strapi 5's Document Service addresses documents by
`documentId`; if a partial update reaches the query engine with `where: { documentId }` and
no `price` in `data`, `currentPrice` stays `undefined`, `applyBand` returns at line 25, and
**a client-supplied `soldAsIs: false` on a 1,200 OMR car is written through unchanged**.
*Inferred from the code path — not reproduced, because reproducing it means writing to the
CMS.* The fix is cheap and unconditional: look the row up by `documentId` when `id` is
missing, and if neither is available, refuse to let `soldAsIs` through at all.

**Minor:** `lifecycles.ts:58–60` uses `findOne` against `where: { id: where.id }`. On a bulk
`updateMany`, `where.id` may be `{ $in: [...] }`, and one arbitrary row's price would be
applied to the whole set. **N6.**

---

## 3. The four trust promises, end to end

### 3.1 "The price you see is the real price"

**Chain:** `price` (decimal) → `toCar:83` → `formatPrice` (36 files) → card + detail +
`StickyContactBar:35` (permanently on screen on mobile) → `listingEnquiryMessage`
(`whatsapp.js:61`) puts the listed price into the seller's own chat log before negotiation.

This chain is **excellent** and is the strongest part of the codebase. Breaks:

- `toCar:83` `|| 0` → a null price renders "0 OMR" (**M2**).
- `formatPrice` is bypassed nowhere — verified, no surviving `$` on any price.
- ⚠️ `FlatFilter.jsx:233,269` leak a literal `$` into non-price text (**part of B5**).

### 3.2 "Listings are verified"

**Chain:** `verified` (bool) → `toCar:102` → **`ProfileInfo.jsx:45,66` and nowhere else.**

- **S1 — `verified` never appears on a card.** A buyer scanning 12 cards on `/listing-grid`
  cannot tell a checked listing from an unchecked one. The promise is claimed in the
  `<meta description>` of nine pages and in three `Features` sections, and delivered on one
  component of one page.
- `ProfileInfo` handles it exactly right: it names the actor and the act
  ("Autosouq checked this listing" / "We haven't checked this listing yet"), amber rather
  than red for the negative. That treatment should be lifted onto the card.
- **S9 — the meta description lies about it.** `lib/seo.js:331–333`:
  ```js
  const tail = car.soldAsIs
    ? " Sold as-is. Message the seller on WhatsApp."
    : " Verified listing. Message the seller on WhatsApp.";
  ```
  `car.verified` is never consulted. Every non-as-is listing ships a `<meta description>`
  claiming "Verified listing." — including the two seeded rows with `verified: false`
  (`honda-civic-2013`, `kia-picanto-2016`) and **all 40 demo cars**, none of which carries a
  `verified` key at all. `app/(info)/terms/page.jsx:118` states: *"We will not claim to have
  verified something we have not verified."* This code does exactly that, in the text Google
  shows.

### 3.3 "GCC-spec vs US-import is always shown honestly"

**Chain:** `importOrigin` (enum, nullable) → `toCar:108` → `importOriginLabel()`
(`listingLabels.js:27–32`) → `ListingSignals` → rendered.

The **null-handling is exemplary** and answers the brief's question directly: a null
`importOrigin` is **not** hidden. `listingLabels.js:28–30` returns
`{ text: "Spec not stated by seller" / "لم يحدّد البائع المواصفات", stated: false }`, and
`ListingSignals:23` renders it in the amber `SPEC_UNSTATED_STYLE`. Stated origins all render
identically neutral so that disclosing is never punished — the reasoning in the file header
(`listingLabels.js:20–26`) is correct and should be preserved.

**S3 — but "always" is not met.** `ListingSignals` is rendered in only 11 places:

| Rendered | Not rendered |
|---|---|
| `Cars1:597`, `Cars2:330`, `Cars3:613`, `Cars4:320`, `Cars5:346` (the `/listing-*` pages) | **`common/Cars.jsx`** — home-page grid, `app/page.jsx:22` |
| `CarDetails2:31`, `CarDetails3:32`, `CarDetails4:32`, `CarDetails5:73` | `common/Cars2`, `common/Cars3`, `common/CarSlider`, `common/RecomandedCars` |
| `CarInfo:24` (feeds `CarDetails1`) | `homes/home-1/Cars2`, `home-2/Cars`, `home-3/Cars`, `home-5/Cars`, `home-7/Cars`, `home-7/Cars2`, `home-9/Cars`, `home-9/Cars2`, `home-9/Cars3`, `home-10/Cars`, `home-10/Cars2` |
| `home-2/Features:75` | `detailComponents/Recommended.jsx` (sidebar cards) |
| `StickyContactBar:37`, `ListingsTable:264`, `MyFavourite:152` | |

So roughly **15 of ~20 card components** omit the spec disclosure, including every card on
every home page and the "other cars" sidebar on every detail page.

**S10 — locale inconsistency makes the pill Arabic on an English page.**
`ListingSignals` defaults `locale = "ar"` (`:16`), and every call site except
`home-2/Features:75` omits the prop. Meanwhile `toCar` runs with `DEFAULT_LOCALE = "en"`
(`strapi.js:48`) and `app/layout.js` ships `<html lang="en">`. Result: an English page with
an English make and model, and a pill reading **"خليجي"** next to it. This is precisely the
mixed-language failure `lib/strapi.js:35–47` warns against — the warning is right, but the
default was set on the wrong side. Same for `SOLD_AS_IS`, `Description`, `Features`,
`Recommended`, `ProfileInfo`, `WhatsAppButton` and `StickyContactBar`, all of which default
to `"ar"`.

### 3.4 "Contacting a seller is one WhatsApp tap"

**Chain:** `whatsapp` (string, required) → `toCar:110` → `normalizeOmaniMsisdn`
(`whatsapp.js:17–29`) → `buildWhatsAppUrl` → `WhatsAppButton`.

`lib/whatsapp.js` is the best file in the repo: correct `wa.me` format, correct Omani MSISDN
normalisation (`00968…`, `+968…`, `0 9…`, bare 8-digit), correct rejection of landlines,
`null` → render nothing rather than a dead `#`, UTF-8 encoding that survives Arabic and
newlines, a 48 px target, and a contrast-corrected button style.

**B3 — BLOCKER: the promise vanishes in fallback mode.**
`data/cars.js` contains **zero** occurrences of `whatsapp` across all 40 entries (verified).
Therefore, whenever `getListings()` returns `[]` — CMS down, CMS empty, CMS slow — every
page falls back to `allCars`, `buildWhatsAppUrl(undefined, …)` returns `null`
(`whatsapp.js:40`), and `WhatsAppButton` returns `null` (`WhatsAppButton.jsx:43`). **The
entire site loses its primary CTA, silently, exactly when it is already degraded.**
The same gap removes `phone` (no `tel:` fallback), `verified` (every car reads
"We haven't checked this listing yet"), `address`/`latitude`/`longitude` (no map),
and `seats`/`engineSize`/`driveType`/`currency` (em dashes in `Overview`).

**S11 — the WhatsApp button is absent from home-page cards entirely.**
`WhatsAppButton` appears in only 7 places: `Cars1:628`, `Cars2:332`, `Cars3:644`,
`Cars4:322`, `Cars5:348`, `ProfileInfo:95`, `StickyContactBar:41`. Not on `common/Cars.jsx`
or any `homes/*` card. A visitor who lands on `/` and finds a car has no one-tap path.

---

## 4. The listing lifecycle as one flow

### 4.1 The walk

```
Seller opens /add-listing                 ✅ app/(dashboard)/add-listing/page.jsx
  → sees the band up front                ✅ AddListing.jsx:138–155 (bilingual, cream panel)
  → fills the form                        ⚠️ see gaps below
  → price validated in-browser            ✅ AddListing.jsx:38–70, mirrors BAND exactly
  → import spec required                  ✅ AddListing.jsx:90
  → clicks "Publish listing"              ❌ NOTHING HAPPENS — no submit path
  → CMS create                            ❌ does not exist
  → lifecycle hook derives soldAsIs       ✅ would work, if anything called it
  → publish                               ❌ no path; admin UI only
  → getListings()                         ✅ works
  → card                                  ⚠️ only on /listing-* pages, not home
  → detail page                           ✅ (v1 currently broken — B1)
  → WhatsApp tap                          ✅ from CMS data
```

### 4.2 The submit gap — confirmed, and exactly what is missing

`AddListing.jsx:718–729` documents the gap honestly and deliberately, and both buttons are
`type="button"` so they cannot half-submit. Confirmed: **there is no submit path.**
What is missing, concretely:

1. **No POST target.** No route handler under `app/api/`, no server action, no `fetch` to
   `/api/listings`. `apps/cms/src/index.ts:3–18` grants the public role `find` and `findOne`
   on listings — **`create` is deliberately not granted**, so even a hand-rolled POST would
   401. Correct posture, but it means submission requires an authenticated path.
2. **No controlled inputs.** Only `price` (`:83`) and `importSpec` (`:84`) are in React
   state. Every other field is an uncontrolled `defaultValue=""` input or a
   `DropdownSelect` with no `onChange`. There is no form object to submit.
3. **No upload target.** Photos live in state as base64 data URLs
   (`readInto`, `:92–96`). Strapi's upload endpoint wants `multipart/form-data`.
   A 10-photo listing is several MB of base64 held in browser memory on a budget Android —
   already a memory risk before any upload exists.
4. **Relation fields are free text.** Make, model and colour are `<input type="text">`
   (`:253, :265, :422`). The CMS wants relation IDs. Nothing resolves "Toyota" → make #1.
5. **Taxonomy option lists do not match the CMS** (see 4.3).
6. **No `slug` generation.** `slug` is `required` in the schema with `targetField: "title"`;
   Strapi's UID auto-fill happens in the admin panel, not on an API create.
7. **No Arabic inputs** (`titleAr`, `descriptionAr`) — **S6**, and a direct NICHE.md conflict
   ("Everything the customer sees exists in both").
8. **VIN and PDF documents have nowhere to go** — the CMS has no such attributes.
9. **No "draft" concept in the UI.** "Save draft" (`:739`) is inert; the CMS *does* have
   `draftAndPublish: true`, so the concept exists server-side and is simply unwired.

### 4.3 Form ↔ taxonomy mismatches (all in `AddListing.jsx:763–801`)

| Form list | Values offered | CMS taxonomy actually contains | Verdict |
|---|---|---|---|
| `CONDITION_OPTIONS:763` | Excellent, Good, Fair, Needs work | **Used** (only) | ❌ **0 of 4 map** |
| `FUEL_OPTIONS:765` | Petrol, Diesel, Hybrid, Electric | Petrol, Diesel | ❌ 2 of 4 map |
| `BODY_OPTIONS:766` | Sedan, Hatchback, SUV, Crossover, Pick-up, Van, Coupe, Wagon | Sedan, Hatchback, SUV, **Pickup** | ❌ 3 of 8 map ("Pick-up" ≠ "Pickup") |
| `OMAN_CITIES:788` | 12 cities | Muscat, Salalah, Sohar, Nizwa, Sur, Barka | ❌ 6 of 12 map (Seeb, Ibri, Rustaq, Ibra, Buraimi, Khasab absent) |
| `CYLINDER_OPTIONS:784` | 3,4,5,6,8 | schema `min:2 max:12` | ⚠️ comment says "ranges match the CMS"; they don't |
| `DOOR_OPTIONS:785` | 2,3,4,5 | schema `min:2 max:6` | ⚠️ 6-door missing |
| `SEAT_OPTIONS:786` | 2,4,5,7,8,9 | schema `min:2 max:9` | ⚠️ 3 and 6 missing |
| `DRIVE_OPTIONS:777` | four labels | enum `fwd/rwd/awd/four_wd` | ⚠️ labels only; no value mapping exists |

Note `data/cars.js` uses `"Seeb"` as a location — a city the CMS does not have.

### 4.4 The auth gap

**What exists:** `components/modals/Login.jsx` and `SignUp.jsx`, opened from
`Header1.jsx:102,114,204`.

**What they do:** nothing. `Login.jsx:37` is `onSubmit={(e) => e.preventDefault()}`. There is
no state, no credential capture, no request, no token storage, no session. "Forgot password"
(`:94`) is a bare `<a>` with no `href`. Google and Facebook buttons are `href="#"`
(`:114,141`). `SignUp.jsx` is the same shape.

**What is unprotected:** every route in `app/(dashboard)/` — `/dashboard`, `/add-listing`,
`/my-listing`, `/my-favorite`, `/my-profile`, `/my-review`, `/message`, `/change-password`.
There is **no `middleware.js`** in `apps/web`, no layout-level auth check, no redirect. All
eight render for anyone who types the URL. `app/robots.js:24–32` disallows them, which stops
indexing but is not access control.

They currently leak nothing real — every dashboard screen is stubbed from `data/cars.js`
(`DashBoard.jsx:22`, `MyListings.jsx:14`, `MyFavourite.jsx:19`) — so this is **serious, not a
blocker, only because there is no real user data yet.** It becomes a blocker on the same day
the submit path lands.

**Minimal correct implementation.** Strapi's `users-permissions` plugin is already installed
(`cms/src/index.ts:21` queries its role table), so the pieces exist:

1. **CMS:** create an `Authenticated` role permission set granting
   `api::listing.listing.create` and `.update`; add an `owner` relation
   (`listing → plugin::users-permissions.user`) to the listing schema; add a policy or
   lifecycle so a seller can only update their own rows. `verified` and `featured` must stay
   admin-only — they are the trust signals and must never be settable by a seller.
2. **Web — session:** POST to `/api/auth/local` (login) and `/api/auth/local/register`
   (signup) from a server action; store the returned JWT in an **httpOnly, secure,
   sameSite=lax cookie**, never `localStorage` (an XSS on a marketplace whose value is trust
   must not be able to read seller tokens).
3. **Web — protection:** one `apps/web/middleware.js` with
   `export const config = { matcher: ['/dashboard/:path*', '/add-listing', '/my-:path*', '/message', '/change-password'] }`
   that redirects to `/` (opening the login modal) when the cookie is absent. One file, eight
   routes protected.
4. **Web — data:** replace `cars.slice(0, 5)` in `DashBoard.jsx:22`, `MyListings.jsx:14` and
   `MyFavourite.jsx:19` with a `getMyListings(userId)` call filtered on the owner relation.
5. **Web — form:** make `AddListing` a controlled form posting to a server action that
   attaches the JWT, resolves taxonomy names to relation IDs, uploads photos as
   `multipart/form-data` to `/api/upload` first, and re-validates the band server-side.
   `AddListing.jsx:724–728` already says this — it is right.

---

## 5. Data-layer robustness

### 5.1 ISR / caching

`revalidate: 30` is set in exactly one place — `strapi.js:140`, inside `strapiFetch` — and
therefore applies uniformly to `getListings`, `getListing` and the sitemap. **Consistent: yes.**
No page sets `export const revalidate` or `dynamic`, so nothing overrides it.

**Is 30 s right?** For listing *content*, yes — probably generous, since listings change
slowly. For **`listingStatus`, it is not conservative enough in the direction that matters**:
a car marked sold stays purchasable-looking for up to 30 s per cached page, and since nothing
renders `listingStatus` visually (**S2**) it stays purchasable-looking indefinitely. The
caching interval is not the bug; the missing badge is.

Also worth noting: `revalidate` is time-based only. There is no `revalidateTag`/`revalidatePath`
webhook from Strapi, so an editor publishing a fix waits out the window with no way to force it.
**M5.**

### 5.2 Failure modes

| Scenario | Behaviour | Verdict |
|---|---|---|
| **CMS down** | `fetch` rejects → caught at `strapi.js:156` → `console.warn` → `[]` → pages fall back to `allCars` | ✅ degrades — ❌ **but see B3: no WhatsApp, no verified, no map in fallback** |
| **CMS up, empty** | `json.data = []` → `[]` → same fallback | ✅ but **dishonest**: an empty marketplace shows 40 fabricated cars as if they were inventory |
| **Malformed response** | `json.data ?? []` (`:155`); `toCar` is null-tolerant on every relation (`label()` returns null, `Array.isArray` guards on `gallery`/`features`/`images`) | ✅ robust |
| **Non-2xx** | `strapi.js:142` throws → caught → `[]` | ✅ |
| **Invalid JSON body** | `res.json()` rejects → caught | ✅ |
| **Slow response** | ❌ **no timeout / AbortSignal.** A hung Strapi hangs the RSC render until the platform's own timeout | ⚠️ **S12** |
| **Detail page, unknown slug** | `getListing` → `null` → `allCars.find(...)` → `null` → `notFound()` (v2–v5) | ✅ correct |
| **`/listing-detail-v1/<anything>`** | **infinite recursion** — see B1 | ❌ |

**Honesty note on the empty case.** `data/cars.js:1–23` is scrupulous about what it is —
no invented sellers, in-band prices, real Omani cities, AI stand-in photos. But
`hasPlaceholderImage` is only set by `toCar:133`; demo entries do not carry it, so
`placeholderNotice()` (`gallery.js:44`) returns null and **the AI-generated stand-in photos
render with no "illustrative image" disclosure**. In CMS-down mode the site shows generated
car photos as if they were photographs. **S13.**

### 5.3 The numeric-id fallback in `getListing`

`strapi.js:167–169`. **Still needed today, and it is actively harmful.**

- **Needed:** `data/menu.js:43–48` still links `/listing-detail-v1/1` … `/listing-detail-v5/1`
  from the site's main navigation, and every demo card links `/listing-detail-v1/${car.id}`
  where `id` is 1–40.
- **Collision risk is real.** Current CMS ids are 62, 64, …, 80 (verified), so 1–40 do not
  collide *in this database*. On a fresh install ids start at 1: clicking a demo "2019 Nissan
  Sunny" card (`id: 3`) would call `getListing(3)` → CMS id 3 → a completely different car.
  **A user clicks one car and lands on another** — and every home page currently renders demo
  cards, so the click path exists today. **S14.**
- **Fix:** drop the numeric branch, point `data/menu.js` at real slugs, and let unknown ids
  404 (v2–v5 already do). The fallback protects theme demo links that should not ship.

### 5.4 Over-fetching and N+1

- **`LISTING_POPULATE` pulls all ten relations on list views** (`strapi.js:17–28`).
  Measured against the live CMS: **38,817 bytes fully populated vs 7,833 unpopulated for 10
  listings** — a **5.0× multiplier**, ~3.9 KB per listing.
- This is not just server→CMS. `Cars2` is `"use client"` (`:1`) and receives `listings` as a
  prop, so **the whole array is serialised into the RSC flight payload sent to the browser**.
  At the 100-listing cap that is ~390 KB of JSON on the wire, before HTML, before images —
  to a NICHE.md audience explicitly described as "budget Android phones" on metered data.
  **S15.** A card needs ~10 of ~35 fields; `fields[]=` plus per-relation
  `populate[make][fields][0]=name` would cut it by roughly 60–70%.
- **`next.config.mjs:3–5` sets `images: { unoptimized: true }`.** Every image ships at its
  source resolution with no WebP/AVIF and no responsive `srcset`. On this audience that is
  the single largest byte cost on the site. **S16.**
- **No N+1** — `populate` is one round trip. ✅
- **Detail pages fetch three times per request:** `getListing` in `generateMetadata`,
  `getListing` in `page`, and a **full `getListings()` (100 listings, all relations) purely to
  pick four `recommended` cards** (`listing-detail-v1/page.jsx:55–58`). The two `getListing`
  calls are deduped by Next's fetch cache; the `getListings()` call is ~39 KB fetched to use
  ~2 KB. **M6.**
- **`pagination[pageSize]=100` silently caps the site at 100 listings.**
  `cms/config/api.ts` sets `maxLimit: 100`, so this is the hard ceiling — listing #101 is
  invisible with no error and no log. Needs real pagination on both sides. **S17.**

---

## 6. Clean-code review of the seam

### `lib/strapi.js`
- `:83` `Number(listing.price) || 0` — masks null as `0 OMR`. **M2.**
- `:90–91` `body` and `type` are the same value under two keys. Dead duplication kept for
  theme compatibility; `type` is used by `common/Cars.jsx:15` and `home-5/Cars.jsx:15` tab
  filters, so it cannot simply be deleted — but it should be one key with an alias comment. **N2.**
- `:79` `documentId` mapped, never consumed. **N3.**
- `:121–123` builds the drive-type lookup object on **every call**; hoist to module scope. **N7.**
- `:121–123` unknown enum → `undefined`, breaking the file's own `null` convention. **N4.**
- `:137–144` no `AbortSignal.timeout()`. **S12.**
- `:150,166` `locale` parameter threads through correctly but every caller uses the default —
  correct forward-looking design, currently unexercised.
- `:157,177` `console.warn` only. No metric, no `Sentry`, nothing that would tell anyone the
  site has been serving fabricated demo cars for a week. **M7.**
- `videoUrl` and `updatedAt` are not mapped. **S4 / M1.**

### `lib/format.js`
Clean. Correct `Number.isFinite` guard, correct `"—"` for bad input. Only note: it forces
`toLocaleString("en-US")`, so Arabic pages will show Western digits — deliberate and
defensible for prices, worth a comment. **N8.**

### `lib/whatsapp.js`
The strongest file in the repo. No correctness bugs found.
- `:58` `origin` defaults to `NEXT_PUBLIC_SITE_URL`, which `.env.local` sets to
  `http://localhost:3001`. A share from a mispointed staging build puts a localhost URL in a
  real seller's chat. Worth a production assertion. **N9.**
- `:60` hardcodes `/listing-detail-v1/` rather than importing `listingPath` from `lib/seo.js`,
  which exists for exactly this. Two sources of truth for the canonical listing URL. **M8.**
- `:65–69` the year-duplication guard uses `title.includes(String(year))` — a title containing
  "2016" as part of a trim name would suppress a legitimate year prefix. Acceptable. **N10.**

### `lib/listingLabels.js`
Excellent. Correct null handling, correct locale fallbacks, contrast values documented and
checked. No bugs. Only note: `SOLD_AS_IS_DETAIL` (`:39–42`) is **exported and never imported
anywhere** — the full as-is explanation the buyer most needs is written and unrendered. **S18.**

### `lib/carOptions.js`
- `:35–37` calls `sortUnique(cars.flatMap(...))` **twice** — once for the length test, once for
  the value. Compute once. **N11.**
- `:31–32` `counted("door", "Door")` yields "4 Door"; the reducer parses it back with
  `parseInt(door.match(/\d+/)[0])` (`Cars2.jsx:120`). Round-tripping a number through a string
  label is fragile — if a car ever has `door: null` the label becomes `"null Door"` and the
  regex match returns `null`, throwing on `[0]`. `sortUnique` filters falsy values, so `null`
  is dropped — safe today, but by accident rather than by design. **N12.**
- `:5` sorts with `localeCompare(a, b, "ar")` on lists that are currently English. Harmless. **N13.**

### `reducer/carFilterReducer.js`
- `getBounds` (`:10–25`) is the right idea, correctly implemented, and is what makes
  `FlatFilter3`/`FilterSidebar` band-honest. Good.
- `:21` price fallback `[0, 100000]` — only reached when zero cars have a finite price, but it
  is another 100,000 in the codebase. Should be `[1000, 6000]`, the actual band. **M9.**
- **`bounds` is computed once in `createInitialState` and never recomputed.** `Cars2.jsx:20`
  passes `source` as the lazy-init argument; if `listings` arrives after first render (or
  changes), `state.bounds` is stale while `source` is not. Server-rendered pages pass
  `listings` on the first render so this does not bite today. **M10.**
- `CLEAR_FILTER` (`:91–108`) duplicates the twelve defaults already written at `:36–48`.
  Extract one `DEFAULT_FILTERS` object. **N14.**
- `itemPerPage: 6` (`:49`) is in state and dispatchable but **`Cars2.jsx:217` hardcodes 12**
  in its `slice`. Dead state. **N15.**

### Filter components
- **`FlatFilter3.jsx:178–179` — real bug.** The **KM** slider is given
  `MIN={allProps.bounds.price[0]} MAX={allProps.bounds.price[1]}` while its value is
  `allProps.km`. With CMS data that is a 1,175–5,200 track holding a 141,000–378,000 value.
  `rc-slider` clamps the handles to `max`, so the control is pinned and unusable; the moment a
  user drags it, `km` becomes a price-scale number and the grid empties. Should be
  `bounds.km`. **S19.**
- **`FilterSidebar.jsx:171–172` — the identical bug**, same fix.
- `FlatFilter.jsx` / `FlatFilter2.jsx` — see **B5**.

### Card components
- **`Cars1.jsx:630` and `Cars3.jsx:646`** print *"View 20 variants matching your search
  criteria"* on every card — a fabricated count on a site that sells not fabricating things.
  Two survivors of a cleanup that removed the same class of claim from `SpecChips`,
  `Recommended` and `DashBoard`. **S20.**
- `common/Cars.jsx:161` `car.km.toLocaleString(...)` unguarded. `mileage` is required in the
  CMS and present on all 40 demo cars, so it holds — but it is the one unguarded numeric in
  the card set. **N16.**

### `lib/seo.js`
High quality; two issues.
- **S9** — the unconditional "Verified listing." tail (`:331–333`).
- `:250–252` `absoluteUrl(img?.src)` with an undefined `src` produces the **site root URL as
  an image**, because `canonicalPath()`'s default only applies to a missing argument, not an
  explicit `undefined`. Filter for `img?.src` first. **N17.**

### CMS
- **`cms/src/index.ts:198,217` (and all ten seed rows)** — Arabic in `title`/`description`,
  `titleAr`/`descriptionAr` left null. **B2**, detailed below.
- `lifecycles.ts` — see **S8**, **N6**. Otherwise correct and well-argued.
- `schema.json` — `soldAsIs` is a plain writable boolean. The hook re-derives it on every
  create/update so it self-heals, but marking it read-only in the admin would make the intent
  visible to whoever is editing.

---

## 7. Prioritised fix list

### Blockers for launch

**B1 · `app/(car-details)/listing-detail-v1/[id]/page.jsx:28–32` — infinite recursion.**
```js
async function resolveCar(id) {
  return (
    await resolveCar(id)   // calls itself
  );
}
```
Every canonical listing URL — the only detail layout in the sitemap — stack-overflows.
v2–v5 hold the correct body: `(await getListing(id)) ?? allCars.find((elm) => elm.id == id) ?? null`.
*Observed mid-edit by a concurrent agent; confirm before fixing.*

**B2 · `apps/cms/src/index.ts:196–417` — `title`/`titleAr` are inverted in the seed.**
All ten seeded listings put the Arabic string in `title` and leave `titleAr` and
`descriptionAr` null (verified against the live API). `pick("en", titleAr, title)`
(`strapi.js:52`) therefore returns Arabic for the English site: every card heading, every
`<title>`, every `og:title`, every JSON-LD `name`, and the car name inside every WhatsApp
enquiry message is Arabic inside an `<html lang="en">` shell. There is no English title in
the CMS at all. Move the Arabic to `titleAr`/`descriptionAr` and write English into
`title`/`description`.

**B3 · `apps/web/data/cars.js` — the fallback has no `whatsapp`, so the primary CTA vanishes when the CMS is down.**
Zero occurrences of `whatsapp` across all 40 entries. `buildWhatsAppUrl(undefined, …)` → null
(`whatsapp.js:40`) → `WhatsAppButton` renders nothing (`WhatsAppButton.jsx:43`). Add
`whatsapp`, `phone`, `currency: "OMR"` and `verified` to every demo entry, and
`hasPlaceholderImage: true` to the AI-stand-in entries (see S13).

**B4 · `apps/web/components/dashboard/MyFavourite.jsx:106–113` — unguarded `next/image`.**
The one remaining site of the reported ~17. `src={car.authorImage}` where the source
(`:12,19`) guarantees `null`. `/my-favorite` throws. Wrap in `{car.authorName && (…)}` like
the other 17, or better, guard on `authorImage`.

**B5 · `apps/web/components/common/FlatFilter.jsx:48,233,256–257` and `FlatFilter2.jsx:49,218,241–242` — the home-page filter contradicts NICHE.md.**
Renders **"Price: 60,000 OMR – 90,000 OMR"** on a 40,000–100,000 track, on `/` and on all nine
home variants. Also carries Audi/BMW/Dongfeng makes that do not exist in the CMS, and leaks a
literal `$` into the km and year captions. Either rebuild these on `getBounds()` the way
`FlatFilter3` does, or delete both and use `FlatFilter3` everywhere.

**B6 · `apps/web/app/page.jsx:5,22,25` — the home page never calls the CMS.**
`common/Cars.jsx:6` and `homes/home-1/Cars2.jsx:6` import `cars`/`carData` from
`@/data/cars` directly. The home page shows demo cars even when Strapi is serving real ones,
with no `importOrigin`, no `verified`, no `soldAsIs`, no WhatsApp button, and links that
resolve through the numeric-id fallback (S14). Make `app/page.jsx` `async`, call
`getListings()`, and thread `listings` into `Cars` and `Cars2` the way
`app/(car-listings)/listing-grid/page.jsx:18,45` already does. The same applies to
`home02`–`home10` — or drop them from `data/menu.js` and the router entirely.

### Serious

| # | Where | Issue |
|---|---|---|
| **S1** | `ProfileInfo.jsx:45,66` is the only consumer of `verified` | Trust promise #2 never appears on a card. Lift the "Autosouq checked this listing" treatment into `ListingSignals`. |
| **S2** | `strapi.js:104` → `sitemap.js:59`, `seo.js:292` only | `listingStatus` is never shown to a buyer. A **sold** car looks available on every card and detail page. Add a badge to `ListingSignals`. |
| **S3** | ~15 card components (list in §3.3) | `importOrigin` missing from every home-page card and from `Recommended.jsx`. NICHE.md says "always". |
| **S4** | `schema.json:115–117`; `AddListing.jsx:649–659` | `videoUrl` is collected and stored and rendered nowhere. Either map it in `toCar` and render an embed, or drop it from schema and form. |
| **S5** | `ListingsTable.jsx:150,153`; `DashBoard.jsx:24–27` | Reads `elm.status`; `toCar` produces `listingStatus`. Every CMS-backed row shows "—", and the dashboard's Live/Sold/Pending counts are always wrong. |
| **S6** | `AddListing.jsx` (whole form) | No `titleAr`/`descriptionAr` inputs. The CMS has the columns; NICHE.md requires both languages. |
| **S7** | `strapi.js:153` | No `filters[price][$lte]=6000&filters[price][$gte]=1000`. No read-path defence on the rule the business *is*. |
| **S8** | `lifecycles.ts:56` | `where?.id` guard: a partial update addressed by `documentId` with no `price` skips band enforcement and lets a client-supplied `soldAsIs` through. *(Inferred — verify against Strapi 5's query-engine `where` shape.)* |
| **S9** | `seo.js:331–333` | `<meta description>` claims "Verified listing." without consulting `car.verified`. Directly contradicts `terms/page.jsx:118`. |
| **S10** | `ListingSignals.jsx:16` and ~10 other components | Default `locale = "ar"` while `strapi.js:48` and `layout.js` are English. Arabic pills on English pages. Thread one locale from the route. |
| **S11** | `common/Cars.jsx`, all `homes/*` cards | No `WhatsAppButton`. A visitor landing on `/` has no one-tap path to any seller. |
| **S12** | `strapi.js:137–144` | No `signal: AbortSignal.timeout(…)`. A hung CMS hangs the render. |
| **S13** | `gallery.js:44` + `data/cars.js` | Demo entries lack `hasPlaceholderImage`, so AI-generated stand-in photos render with no "illustrative image" notice in fallback mode. |
| **S14** | `strapi.js:167–169` + `data/menu.js:43–48` | Numeric-id fallback: on a fresh DB (ids 1–N), a demo card link resolves to an unrelated real listing. Drop the branch; fix the nav links. |
| **S15** | `strapi.js:17–28` | `LISTING_POPULATE` is 5.0× the unpopulated payload (38.8 KB vs 7.8 KB for 10 rows, measured), and it is serialised into the client payload because `Cars2` is a client component. Add `fields[]` selection for list views. |
| **S16** | `next.config.mjs:3–5` | `images: { unoptimized: true }` — no WebP, no `srcset`, full-resolution originals to budget Android on metered data. |
| **S17** | `strapi.js:153` + `cms/config/api.ts` | `pageSize=100` at `maxLimit: 100`. Listing #101 is silently invisible. |
| **S18** | `listingLabels.js:39–42` | `SOLD_AS_IS_DETAIL` — the full buyer-facing explanation of as-is terms — is exported and never rendered. |
| **S19** | `FlatFilter3.jsx:178–179`; `FilterSidebar.jsx:171–172` | KM slider bounded by `bounds.price`. Should be `bounds.km`. Control is unusable and corrupts the filter on first drag. |
| **S20** | `Cars1.jsx:630`; `Cars3.jsx:646` | "View 20 variants matching your search criteria" — a fabricated count on every card. |
| **S21** | `data/menu.js:1–48` | Public nav ships "Home Page 01–10", "Listing detail V1–V5", and five browse variants, all pointing at `/listing-detail-v1/1`. The theme's demo menu is the marketplace's menu. |
| **S22** | `AddListing.jsx:763–801` | Condition (0/4), fuel (2/4), body (3/8) and city (6/12) option lists do not match the CMS taxonomies. Derive them from the CMS. |
| **S23** | `app/(dashboard)/*` — no `middleware.js` | Eight dashboard routes render for anyone. Blocker the day real seller data exists. |

### Minor

| # | Where | Issue |
|---|---|---|
| **M1** | `strapi.js:67–135`; `sitemap.js:54–57` | `updatedAt` not mapped, so the sitemap ships no `lastModified`. The comment says two-line fix; it is. |
| **M2** | `strapi.js:83` | `Number(price) \|\| 0` renders a missing price as "0 OMR" instead of "—". |
| **M3** | `AddListing.jsx:512` | `step={10}` forbids 1,175 — a price in the CMS's own seed. Use `step="any"` or `step={5}`. |
| **M4** | `Description.jsx:19,31` | `description` is Strapi **richtext** (markdown) rendered as plain text. `**bold**` and `- lists` will show literally once a seller uses them. |
| **M5** | `strapi.js:140` | Time-based ISR only; no Strapi webhook → `revalidateTag`. An editor's fix waits out 30 s with no way to force it. |
| **M6** | `listing-detail-v1/page.jsx:55–58` (and v2–v5) | Fetches 100 fully-populated listings to render four sidebar cards. |
| **M7** | `strapi.js:157,177` | `console.warn` only. Nothing alerts that the site has been serving demo data. |
| **M8** | `whatsapp.js:60` | Hardcodes `/listing-detail-v1/${car.id}`; `lib/seo.js:57` exports `listingPath()` for this. |
| **M9** | `carFilterReducer.js:21` | Price fallback `[0, 100000]`. Should be `[1000, 6000]`. |
| **M10** | `carFilterReducer.js:27`; `Cars2.jsx:20` | `bounds` computed once, never recomputed when `source` changes. |

### Nits

`N1` `Overview.jsx:204` engine size printed without "L" ·
`N2` `strapi.js:90–91` `body`/`type` duplication ·
`N3` `strapi.js:79` `documentId` dead ·
`N4` `strapi.js:121–123` unknown enum → `undefined`, not `null` ·
`N5` 17 sites guard on `authorName` while rendering `authorImage` ·
`N6` `lifecycles.ts:58` `findOne` on a possible `$in` ·
`N7` `strapi.js:122` lookup object rebuilt per call ·
`N8` `format.js:12` forces Western digits ·
`N9` `whatsapp.js:58` `origin` can be `localhost` in a share ·
`N10` `whatsapp.js:67` year-in-title heuristic ·
`N11` `carOptions.js:35–37` double computation ·
`N12` `carOptions.js:31–32` numbers round-tripped through label strings ·
`N13` `carOptions.js:5` `localeCompare(…, "ar")` on English lists ·
`N14` `carFilterReducer.js:91–108` duplicated defaults ·
`N15` `carFilterReducer.js:49` `itemPerPage` dead vs `Cars2.jsx:217` hardcoded 12 ·
`N16` `common/Cars.jsx:161` unguarded `car.km.toLocaleString` ·
`N17` `seo.js:250–252` undefined image src → site root URL ·
`N18` `CarDetails1.jsx:126–127` "Report this listing" is inert text on a trust-led site ·
`N19` `ListingMap.jsx:249` `zoom={4}` is continent scale for a city map ·
`N20` `.env.local` has no `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, so both map views render blank ·
`N21` `Cars2.jsx:8` imports `cars` and never uses it.

---

## 8. The top three

**1. Connect the home page to the CMS, and delete the two filter components that contradict the niche.**
`app/page.jsx:22,25` renders demo cars from `data/cars.js` while a working `getListings()`
sits one import away, and `FlatFilter.jsx:48` tells every first-time visitor the price range
is 60,000–90,000 OMR. The front door is the one page that must state the niche correctly, and
it is the one page still running entirely on theme demo data. Fixing this closes B5, B6, S3,
S11 and S14 at once — and it is the difference between a marketplace and a template.

**2. Fix the bilingual contract at the source: Arabic in `titleAr`, English in `title`.**
`cms/src/index.ts` puts Arabic strings in the English columns, so `pick()` returns Arabic on
an English page for every listing, and there is no English title anywhere in the system.
Combined with the ten components that default `locale = "ar"` while `toCar` runs `"en"`
(S10), the site is currently coherent in neither language. NICHE.md's "Arabic first, English
equal second" cannot begin until the columns hold what their names say.

**3. Make the demo fallback carry the four promises — or stop falling back to it.**
`data/cars.js` has no `whatsapp`, no `verified`, no `currency`, and no
`hasPlaceholderImage`. So the moment Strapi hiccups, the site silently becomes: forty
fabricated cars, AI-generated photos presented as real, no verification signal, and **no way
to contact anybody**. Graceful degradation that drops the primary CTA is not graceful. Either
fill those fields in, or make an empty/unreachable CMS render an honest empty state —
`components/dashboard/EmptyState.jsx` already exists and already gets the tone right.
