# Autosouq.om — SEO & Market Research

**Prepared:** 25 July 2026
**Scope:** research only. No application code was changed by this document.
**Audience:** the agent who will build pages, IA, metadata and structured data from it.

---

## 0. How to read this document

Every substantive claim is tagged:

- **[VERIFIED]** — I fetched the page/data myself during this research and can point at the URL. Where I derived numbers, the method is stated so you can re-run it.
- **[SOURCED]** — a named third party asserts it; I read their page but could not independently confirm the underlying fact.
- **[INFERENCE]** — my reasoning from general SEO practice. Not verified. Treat as an opinion to be tested.
- **[UNVERIFIED / STALE RISK]** — I could not confirm this at all, or my knowledge may be out of date.

### Hard limits you must know about

1. **No search volume data.** I have no access to Google Keyword Planner, Ahrefs, Semrush or DataForSEO. **There are no search volume figures anywhere in this document, and you must not invent any.** Everything is ranked by *reasoned priority* using observable proxies — chiefly the keyword landing pages competitors have chosen to build (which are a revealed preference for demand), listing counts, and market structure.
2. **My SERP view is not an Omani SERP view.** The search tool I used is US-located. Results are indicative of *which sites exist and compete*, not of exact Omani ranking order. Before acting on ranking claims, someone should check `google.com.om` from an Omani IP (or with `&gl=om&hl=ar`). Flagged in §2.
3. **Two competitor sites (Hatla2ee, YallaMotor) block automated fetching** (HTTP 403). Everything I say about their IA comes from their URLs and titles as they appeared in search results, not from reading their pages.

### Immediate operational finding — read this first

**`https://autosouq.om` is currently serving a live WordPress site titled "Autsouq Oman"** (note: the title has a typo, "Autsouq"). **[VERIFIED]** — fetched 25 Jul 2026.

Its sitemap index at `https://autosouq.om/wp-sitemap.xml` exposes a *car-listing theme demo*, fully crawlable (`robots.txt` only disallows `/wp-admin/`). Indexable URLs include:

```
/sample-page/  /test/  /home-03/  /listing-card/  /listing-default/
/listing-half-map-right/  /listing-half-map-left/  /listing-sidebar-right/
/dealer-listing/  /sale-agents/  /car-listing-plan/  /package-list/
/payment-invoice/  /payment-completed/  /dashboard/  /my-profile/ …
```

plus taxonomy sitemaps for `make`, `model`, `body`, `condition`, `transmission`, `cylinders`, `drive-type`, `fuel-type`, `car-color`, `features`.

**This is a launch-blocking liability.** A brand whose entire proposition is trust cannot have `autosouq.om/test/` and `autosouq.om/sample-page/` in Google's index. Whoever owns the cutover must:
- inventory what is currently indexed (Search Console, `site:autosouq.om`);
- 301 anything with equity to the new equivalent, 410 the demo junk;
- ensure the new `robots.txt` and sitemap replace the WordPress ones at cutover, not alongside them;
- decide whether the existing WP taxonomy URLs (`/make/toyota/` style, if populated) are worth redirecting into the new `/used-cars/toyota` pattern.

**Business decision required.** See §11, item B1.

---

## 1. How Omanis actually search for used cars

### 1.1 The best evidence available: competitors' own keyword landing pages

Dubizzle Oman builds a dedicated indexable URL for each search term it considers worth ranking for, in the form `/{lang}/vehicles/cars-for-sale/muscat/q-{term}/`. I extracted **104 such terms** from the Muscat category page. **[VERIFIED]** — extracted from `https://www.dubizzle.com.om/en/vehicles/cars-for-sale/muscat/` and the Arabic twin `https://www.dubizzle.com.om/ar/vehicles/cars-for-sale/muscat/`, 25 Jul 2026.

This is the single most valuable artefact in this research. It is a commercial marketplace's own judgement about which queries convert in Oman, and it is *identical on the Arabic and English versions of the page* — meaning Dubizzle serves the same term set to both audiences.

**Arabic terms Dubizzle builds pages for:**

```
افالون  افلون  اف-جي  اقساط  اكستيرا  اكورد  البدل  التيما  النترا  باجيرو
باص  برادو  بيكاب  بيكب  تاهو  تكملة-اقساط  تندرا  تويوتا  تيدا  جيب
جيب-رانجلر  خليجي  دفع-رباعي  راف-فور  راف-فور-4  رانجلر  رنج-روفر  زد
سوناتا  سيفيك  صلالة  صني  ظفار  فورد  كامري  كرولا  كورولا  كيا  لاند
لاندكروزر  لاند-كروزر  لكزس  لكزس-es  لكزس-is  للبدل  مازدا  مرسيدس
مسقط  مكسيما  موستانج  نيسان  نيسان-باترول  نيسان-بترول  هوندا
هوندا-اكورد  ياريس
```

**Latin/English terms Dubizzle builds pages for:**

```
altima  automatic  bmw  camry  car  car-used  civic  corolla  elantra
exchange  expat  expat-leaving  ford  hatchback  honda  honda-civic
hyundai  installment  installments  jeep  jeep-wrangler  kia  lancer
land-cruiser  leaving  lexus  mazda  mercedes  mustang  nissan
nissan-patrol  nissan-sunny  pajero  prado  sedan  sonata  sports-car
suv  suzuki  toyota  toyota-camry  toyota-corolla  toyota-yaris
urgent  urgent-sale  used  yaris
```

### 1.2 What that list actually tells you

Six things, and they are all directly actionable:

**(a) People search by make and by make+model far more than by anything else.** 40+ of the 104 terms are a make or a model. Nobody is searching a body style much (`sedan`, `hatchback`, `suv`, `sports-car` — four terms) and nobody at all is searching a colour, a transmission variant beyond `automatic`, or a cylinder count. **Implication: make and make+model pages are the primary landing-page axis. Body-type, colour and fuel pages are not.**

**(b) Arabic spelling is not stable, and Dubizzle has built pages for both spellings.** This is the most important Arabic-SEO fact in the document:

| Concept | Variant A | Variant B |
|---|---|---|
| Corolla | كورولا | كرولا |
| Avalon | افالون | افلون |
| Pickup | بيكاب | بيكب |
| Land Cruiser | لاندكروزر | لاند كروزر |
| Nissan Patrol | نيسان باترول | نيسان بترول |

A commercial operator does not build duplicate pages for fun. Both spellings get typed, in volume. **Implication: your Arabic content and your on-site search synonym table must handle both. See §6.4.**

**(c) Finance/instalment intent is a first-class query type.** `اقساط` (instalments), `تكملة-اقساط` (literally "completion of instalments" — i.e. take over the remaining payments on someone else's financed car), `installment`, `installments`. `تكملة أقساط` also has its own tag page on world111.com (`world111.com/cars/tag/سيارات-للبيع-في-مسقط-تكملة-اقساط/`) **[VERIFIED — appeared in search results]**.

**This conflicts with your product.** NICHE.md positions Autosouq as cash-buyer-first (expats "paying cash"), and the footer research notes "Personal loan" was removed because "we do not offer finance". But a meaningful slice of Omani used-car search intent is instalment-shaped. **Business decision required — see §11, item B2.**

**(d) `خليجي` (khaleeji / GCC) is a search term in its own right.** Dubizzle built `/q-خليجي/`. Buyers are actively filtering for GCC-spec at the query level. This is direct evidence that your GCC-spec trust promise maps onto real search demand, not just a nice-to-have. See §4.

**(e) Expat-departure selling is a recognised query cluster.** `expat`, `expat-leaving`, `leaving`, `urgent`, `urgent-sale`. This is the classic "leaving the country, must sell this week" listing — cheap, motivated seller, exactly your price band. Also `exchange`, `البدل`, `للبدل` (part-exchange/swap).

**(f) City is a query modifier, but a thin one.** Only three geographic terms appear in the whole 104: `مسقط` (Muscat), `صلالة` (Salalah), `ظفار` (Dhofar). Dubizzle handles geography through its *path* hierarchy instead (`/cars-for-sale/muscat/`, `/cars-for-sale/al-seeb/`, `/cars-for-sale/ruwi/` … 20+ Muscat sub-localities **[VERIFIED]**). **Implication: geography belongs in the URL path, not as a search-term page — and see §3.4 before you build a city page for anywhere that is not Muscat.**

### 1.3 Head-term phrasing, confirmed from ranking pages

These are the exact H1s and title tags competitors run — i.e. the phrasing they have concluded matches the query. **[VERIFIED]** — read from live HTML, 25 Jul 2026.

| Language | Phrasing in the wild | Source |
|---|---|---|
| AR | `سيارات للبيع في مسقط` (H1, OpenSooq) | `om.opensooq.com/ar/مسقط/حراج-السيارات/سيارات-للبيع` |
| AR | `سيارات للبيع في مسقط` (H1, Dubizzle) | `dubizzle.com.om/ar/vehicles/cars-for-sale/muscat/` |
| AR | `سيارات مستعملة للبيع في مسقط` (Hatla2ee title) | `oman.hatla2ee.com/ar/car/city/muscat` |
| AR | `حراج السيارات` — used as the *category* word by OpenSooq (`/حراج-السيارات/`) and Kulshe | multiple |
| EN | `Cars for Sale in Muscat` (H1, Dubizzle) | `dubizzle.com.om/en/vehicles/cars-for-sale/muscat/` |
| EN | `Used Cars for Sale in Muscat` (Hatla2ee, YallaMotor titles) | `oman.hatla2ee.com/en/car/city/muscat` |
| EN | `Used Toyota Corolla Cars For Sale in Oman` (H1, OpenSooq) | `om.opensooq.com/en/cars/cars-for-sale/toyota/corolla` |

**Note the Arabic split:** `سيارات للبيع` (cars for sale) vs `سيارات مستعملة` (used cars) vs `حراج السيارات` (car souq/auction — the colloquial classifieds word). All three are live. `حراج` is the vernacular Gulf term and is what OpenSooq chose for its category slug. **[INFERENCE]** Your brand name "Autosouq" already leans on this vocabulary; using `حراج` somewhere in your Arabic copy is on-brand and matches how people talk. But `سيارات مستعملة` is the more literal, more "searchable-looking" phrase and Hatla2ee uses it. **Use both: `سيارات مستعملة للبيع` in the H1, `حراج السيارات` in supporting copy.**

### 1.4 The transliterated mix

Two distinct real-world behaviours, both evidenced above:

1. **Arabic script for the make, Latin for the trim.** Dubizzle built `/q-لكزس-es/` and `/q-لكزس-is/` — Arabic "Lexus", Latin trim code. This is exactly how Gulf buyers type. **[VERIFIED]**
2. **English model names typed by Arabic speakers.** Both `corolla` and `كورولا` pages exist on the *Arabic* version of Dubizzle. **[VERIFIED]**

**[INFERENCE]** The practical consequence: an Arabic page targeting the Corolla should contain the string "Corolla" in Latin script somewhere in the body (spec table, badge, breadcrumb), and an English page should not be afraid to carry `كورولا`. Do not machine-purify either language of the other's script.

### 1.5 The budget long tail

Competitors have built explicit price-band URLs — evidence that price-band search is real: **[VERIFIED — URLs and titles observed in search results]**

```
oman.hatla2ee.com/en/car/price-limit/2000     "Used Cars for Sale under 2000 OMR in Oman"
oman.hatla2ee.com/en/car/price-limit/3000     "Used Cars for Sale under 3000 OMR in Oman"
oman.yallamotor.com/used-cars/under-1000-omr  "Used cars between OMR 0 and 1000 for sale in Oman"
oman.yallamotor.com/used-cars/under-2000-omr
oman.yallamotor.com/used-cars/under-3000-omr  "Used Cars under 3,000 OMR for sale in Oman"
oman.yallamotor.com/used-cars/pr_3000_6000/ft_petrol
```

Note the pattern: **"under X"**, not "between X and Y". Both operators lead with a ceiling. YallaMotor's Arabic equivalent is `سيارات للبيع فى عُمان أقل من 1000` — "less than 1000". **[VERIFIED]**

**This is the single most important IA insight for Autosouq.** Your entire business *is* a price band. Competitors have already validated "under {price}" as a query shape, and they are serving it with generic pages that contain their whole inventory sliced by a filter. You can serve it with a page where the band *is* the product. See §8.

---

## 2. The competitive SERP

### 2.1 Who is actually in the market

**[VERIFIED]** — every one of these returned live Oman car-listing pages during this research.

| Site | Type | Scale (self-reported, 25 Jul 2026) | Notes |
|---|---|---|---|
| **OpenSooq** (`om.opensooq.com`) | Pan-Arab classifieds | 13,150 cars Oman-wide; 6,774 in Muscat | The incumbent. Full schema stack, Arabic-slug URLs, hreflang across 10+ Arab countries. |
| **dubizzle Oman** (`dubizzle.com.om`) | Classifieds, now OLX-branded | 3,235 in Muscat; 4,252 Oman-wide in one check, 7,070 in another | **Title is literally `dubizzle Oman (OLX)`** — the rebrand is live. Deep locality IA, 104 keyword landing pages. |
| **Hatla2ee** (`oman.hatla2ee.com`) | Regional auto vertical | not read (403) | Strong price-band and city+make+model IA. |
| **YallaMotor** (`oman.yallamotor.com`) | Regional auto vertical + editorial | 1,648 used listings; 1,635 in Muscat | Also runs the biggest Arabic+English *editorial* car library in the region. Your real content competitor. |
| **Bezaat** (`bezaat.com/oman/...`) | Classifieds | — | Returned HTTP 526 when fetched; appears in Arabic SERPs. |
| **Kulshe** (`om.kulshe.com`) | Classifieds | — | Arabic-slug URLs. |
| **Omanista** (`omanista.com/sooqc/vehicles/cars-sale`) | Oman-only classifieds | — | Title: `سيارات للبيع في عمان 2026 \| مستعملة رخيصة تويوتا نيسان لكزس` — note it targets **رخيصة ("cheap")**. |
| **OmaniCar** (`omanicar.com`) | Oman-only vertical | — | Returned a 4-byte body to my fetch; SERP-visible only. |
| **world111.com** | Arabic classifieds aggregator | — | Runs tag pages incl. `تكملة اقساط`. |
| **FridayMarket** (`om.fridaymarket.com`) | Classifieds | — | Surfaces on budget queries. |
| **Facebook Marketplace** | Social | — | Ranks on `Cars for sale in {locality}, Oman` — including sub-localities: Ghubrah, Al Amarat, Halban, Arqi. **[VERIFIED — indexed marketplace URLs in results]** |

Instagram/WhatsApp dealer accounts are widely described as a major Omani channel but I found **no** evidence of them ranking in organic search, which is what matters here. **[UNVERIFIED]** — treat Instagram as a distribution channel, not an SEO competitor.

### 2.2 What page types rank

**[VERIFIED]** across every query I ran, the SERP is dominated by **marketplace category pages** — a filtered inventory list with an H1, a count, and a schema `ItemList`. Individual listing pages barely surface on generic queries. Editorial only surfaces on informational queries.

The category pages that rank are, in descending frequency of appearance:

1. `{marketplace}/cars-for-sale/{city}` — city category
2. `{marketplace}/cars-for-sale/{make}/{model}` — make+model
3. `{marketplace}/car/price-limit/{n}` or `/under-{n}-omr` — price band
4. `{marketplace}/cars-for-sale/{make}/{city}` — make × city
5. Facebook Marketplace `{locality}/cars/`

### 2.3 Honest assessment of difficulty

**You will not outrank OpenSooq or dubizzle on head terms. Do not try.**

The reason is not just domain authority. It is that these queries are *inventory queries*, and Google is answering them with inventory. OpenSooq has 6,774 cars in Muscat; at launch you have roughly 10. A page titled "Used cars in Muscat" with 10 cars on it is, from Google's point of view, a strictly worse answer than one with 6,774. No amount of markup fixes that. **[INFERENCE — but a well-founded one; the observable SERP is sorted roughly by inventory depth.]**

### 2.4 Where the gaps actually are

I found four, in descending order of realism.

**Gap 1 — The Arabic informational SERP is held by content farms.** This is the strongest finding in the whole section.

Searching `نقل ملكية سيارة في سلطنة عمان` (transfer car ownership in Oman) returns, in order: **[VERIFIED]**

```
omanreference.com/916/نقل-ملكية-سيارة/     "المرجع العماني"
honaoman.com/1003/نقل-ملكية-سيارة/         "هنا عمان"
omaneservices.com/1162/نقل-ملكية-سيارة/    "خدمات عمان الإلكترونية"
omanalez.com/1278/نقل-ملكية-سيارة/         "عمان العز"
omanpedia.net/1253/نقل-ملكية-السيارة/      "عمان بيديا"
```

Five near-identical Arabic content farms, same `/{numeric-id}/{arabic-slug}/` URL template, same article, no brand, no author, no first-hand knowledge. The Royal Oman Police's own page and gov.om are *below* them. This SERP is winnable by anyone who publishes one genuinely good, current, first-hand Arabic page. **This is the highest-ROI content opportunity available to you.**

The English equivalent (`how to transfer car ownership in Oman`) is meaningfully harder — YallaMotor, ExpatFocus, sandan.om, gov.om, Oman Observer. Real sites. **[VERIFIED]**

**Gap 2 — Nobody owns "affordable used cars in Oman" as a *brand position*, only as a filter.** Every price-band page in the market (Hatla2ee `price-limit/2000`, YallaMotor `under-3000-omr`) is a generic filtered view of a general inventory. None of them is written *for* the person whose entire situation is a OMR 2,500 budget. There is no page in Omani search that says "here is what OMR 2,500 actually buys you in Oman in 2026, here is the honest mileage you should expect, here is what will break." **[VERIFIED — I looked; the closest is sandan.om's "Best Used Cars Under OMR 1,000 in Oman", a single blog post.]**

**Gap 3 — GCC-spec vs import is discussed pan-regionally, never Omani-specifically.** Every article ranking on this topic is UAE- or Saudi-framed: yallamotor.com, arabwheels.ae, invygo.com, octane.rent, dubicars.com, automarket.ae, syarah.com (Saudi), shory.com (Saudi). **[VERIFIED]** There is no authoritative Oman-specific page covering Omani import rules, the ROP position, and what "خليجي عماني" vs "خليجي غير عماني" means for *your* resale. See §4.

**Gap 4 — Individual listing pages.** OpenSooq's listing URLs are `om.opensooq.com/ar/search/281632588` — an opaque numeric ID with no keywords. **[VERIFIED]** A listing page at `/car/toyota-corolla-2016-muscat-2200-omr` with a real spec table, honest photos and Vehicle markup is a genuinely better document. With 10 listings this is a rounding error; at 500 listings it is a real long-tail channel.

### 2.5 What I could not verify

- **Actual Omani SERP order.** My search tool is US-located. Someone must check from Oman. **[UNVERIFIED]**
- **Relative domain authority** of these sites — no Ahrefs/Moz access. **[UNVERIFIED]**
- **Whether Bezaat/OmaniCar/Kulshe are alive and growing or decaying.** Bezaat returned HTTP 526 and OmaniCar returned a 4-byte body to direct fetches; both may be geo-fenced or may be dying. **[UNVERIFIED]**

---

## 3. The market in the OMR 1,500–6,000 band

### 3.1 Method

I sampled OpenSooq Oman's default-sorted (newest-first) national car listing feed, `https://om.opensooq.com/en/cars/cars-for-sale`, pages 1–14, on 25 July 2026, and parsed the `ItemList` JSON-LD each page emits. After de-duplication: **376 unique listings**. **[VERIFIED — reproducible; the JSON-LD is in the page source.]**

This is a *recency* sample, not a random sample of standing inventory. It over-represents whatever was posted this week. Treat the percentages as indicative to ±5pp, not as census figures.

### 3.2 Does the price band hold up?

NICHE.md asserts cars under OMR 6,000 are "roughly two-thirds of all used-car listings". My sample says: **[VERIFIED, n=376 → 328 with parseable prices]**

| Band (OMR) | Count | Share |
|---|---|---|
| under 1,000 | 17 | 5.2% |
| 1,000–1,499 | 22 | 6.7% |
| 1,500–2,999 | 45 | 13.7% |
| 3,000–3,999 | 41 | 12.5% |
| 4,000–4,999 | 42 | 12.8% |
| 5,000–6,000 | 32 | 9.8% |
| over 6,000 | 129 | 39.3% |
| **≤ 6,000 (total)** | **199** | **60.7%** |
| **1,500–6,000 (your core band)** | **160** | **48.8%** |
| **1,000–1,499 ("sold as-is" tier)** | **22** | **6.7%** |

**Verdict: the thesis holds, slightly softer than stated.** ~61% under 6,000 rather than "roughly two-thirds"; your addressable core band is just under half of all listings, and the as-is tier adds another ~7%. **Autosouq's rules make it eligible for roughly 55% of the Omani used-car listing market.** That is a very large niche, and the claim in NICHE.md is defensible — I would just soften "two-thirds" to "around 60%" in any public-facing copy, because it is the number I can actually defend.

Note also that the band is **not uniformly distributed within itself**: 3,000–6,000 (35.1%) is much fatter than 1,500–2,999 (13.7%). NICHE.md says "the 2,000–5,000 range is the single biggest concentration of buying activity" — my *listing* data agrees directionally but puts the peak higher, around 3,000–5,000. Listings ≠ transactions, so this is not a contradiction. **[INFERENCE]**

### 3.3 What actually trades in the band

Makes present in the 1,500–6,000 band, from the same sample: **[VERIFIED]**

`Nissan 32 · Toyota 25 · Mitsubishi 13 · Hyundai 12 · Honda 9 · Kia 9 · Mercedes 7 · Jeep 7 · Dodge 5 · Suzuki 4 · MG 4 · Volkswagen 4 · Mazda 4 · Lexus 3 · BMW 3 · GMC 2 · GAC 2 · Land Rover 2 · Cadillac 2 · Infiniti 2`

Models present in the band: **[VERIFIED]**

`Nissan Altima 12 · Toyota Camry 9 · Honda Accord 7 · Mercedes (various) 7 · Toyota Corolla 5 · Kia Sportage 5 · Nissan Sunny 4 · Jeep Wrangler 4 · Nissan Maxima 4 · MG (various) 4 · Hyundai Santa Fe 3 · Mitsubishi Outlander 3 · Toyota Yaris 3 · Mitsubishi Pajero 3 · Mitsubishi Attrage 2 · Toyota Avalon 2 · Hyundai Elantra 2 · Suzuki Vitara 2 · Lexus IS 2 · Hyundai Creta 2`

**⚠️ This contradicts the brief's assumed model list in three important ways:**

1. **Nissan is the #1 make in your band, ahead of Toyota.** Toyota dominates the *overall* Omani market (**[SOURCED]** — Mordor Intelligence and Best Selling Cars Blog both put Toyota near 38–48% share, per search results), but Toyota's volume is Hilux / Land Cruiser / Prado — vehicles that sit *above* OMR 6,000. In your specific band, **Nissan Altima is the single most common model.**
2. **The brief's list is missing real band leaders:** Honda **Accord**, Nissan **Maxima**, Hyundai **Elantra**, Kia **Sportage**, Mitsubishi **Attrage**, Mitsubishi **Outlander**, Hyundai **Creta**, Toyota **Avalon**.
3. **Some models on the brief's list are marginal.** Kia Picanto has only **13 used listings nationally on OpenSooq** and Suzuki Swift only **31**. **[VERIFIED — from the page titles: "13 Used Kia Picanto Cars For Sale in Oman", "31 Used Suzuki Swift Cars For Sale in Oman".]** These do not justify landing pages.

### 3.4 Real price-by-year data

Pulled from each model's OpenSooq category page `ItemList` on 25 Jul 2026. **[VERIFIED]** Prices in OMR. Use these to sanity-check listings and to write honest "what does OMR X buy" content.

| Model | National listing count | Observed prices by year |
|---|---|---|
| **Toyota Corolla** | 538 | '08 XLI 1,200–2,900 · '13 SE 2,100 · '15 SE 3,500 · '16 LE 2,200–2,700 · '19 SE/XLI 4,250–4,500 · '20 LE 4,200–4,350 · '21 LE 3,908–5,000 · '22 XSE 5,200–6,000 |
| **Toyota Camry** | 1,021 | '02 900 · '07 SE 1,475 · '08 1,400–2,200 · '14 SE 2,300 · '15 XLE 3,100 · '17 SE 4,000 · '19 LE 4,800–5,100 · '20 SE 3,850 · '21 LE 5,500 · '23 LE 6,800 |
| **Toyota Yaris** | 165 | '07 930–1,000 · '09 SE 1,350 · '11 1,350 · '14 SE 1,950 · '15 2,000–2,400 · '19 E 3,900 · '20 SE 4,150 · '21 SE 4,250–4,350 · '23 G 6,000 |
| **Nissan Altima** | 701 | '12 S 1,150 · '13 SV 1,750 · '15 S 2,600 · '16 SR/SL 2,100–3,150 · '18 SV 2,950 · '19 SR 4,000 · '20 SL 3,800–4,200 · '22 4,500–4,900 · '23 SR 4,950–5,500 |
| **Nissan Sunny** | 91 | '05 730–850 · '08 SL 950 · '12 S 1,000 · '14 1,350–2,000 · '15 1,650 · '19 1,640–1,700 · '21 2,900 · '22 3,000–3,750 · '24 SV 5,500–5,800 |
| **Hyundai Accent** | 75 | '05 GLS 550 · '07 650–850 · '11 GL 770 · '12 1,150–1,550 · '13 1,350 · '15 1,600–2,000 · '17 SE 2,000 · '19 3,100 · '20 GL 2,700 · '22 3,500 · '24 5,050 |
| **Kia Rio** | 59 | '06/'07 450 · '12 1,200–1,300 · '13 1,250–1,550 · '15 1,550 · '16 2,000 · '18 2,500–3,200 · '19 LX 2,300 · '20 2,700–3,000 |
| **Honda Civic** | 107 | '05 480–650 · '06 VTi 1,050 · '08 1,250–1,500 · '09 EXi 1,500 · '12 EX 2,100 · '16 RS 2,750 · '19 3,500–3,950 · '21 EX 5,500 · '22 EX 5,600 |
| **Mitsubishi Lancer** | 40 | '04 580 · '07 450–650 · '09 GT 1,100–1,200 · '10 GL 900 · '15 1,700–2,200 · '16 2,050–3,500 · '17 GT 2,650 |
| **Mitsubishi Pajero** | 104 | '07 1,250 · '08 GLS 1,700 · '09 1,850 · '10 GLX 2,350 · '13 GLS 3,400 · '14 GLX 2,900 · '16 4,500–4,700 · '17 2,900–4,200 · '19 5,600–8,600 |
| **Suzuki Swift** | 31 | '08 800–900 · '10 1,150 · '11 1,100 · '12 980–1,350 · '14 1,650 · '15 1,300–1,400 · '18 Sport 2,250 · '19 Sport 2,700 |
| **Kia Picanto** | 13 | '05/'06 420–575 · '09 900 · '12 EX 950 · '13 1,200 · '14 1,070 · '16 EX 1,150–1,350 · '19 1,900 · '23 GT-Line 3,750 |

**Rule of thumb derived from this table [INFERENCE, but grounded in the data above]:** in the Omani market, a mainstream Japanese/Korean sedan enters your 1,500 floor at roughly **12–15 years old**, sits mid-band (3,000–4,500) at **5–8 years old**, and exits your 6,000 ceiling at about **3–4 years old**. That is the sentence your "what does OMR X buy" pages should be built around.

On mileage: I could not extract mileage systematically because **OpenSooq does not populate `mileageFromOdometer` in its JSON-LD** — every Vehicle object omits it. **[VERIFIED]** From the handful of listings where mileage appeared in prose, 200,000–350,000 km at the bottom of the band is entirely normal (e.g. a 2012 Corolla at 350,000 km for OMR 1,650 in Salalah; a 2010 Corolla at 385,000 km for OMR 2,000). **[SOURCED — Hatla2ee/YallaMotor listing snippets in search results.]**

### 3.5 Which cities actually matter — and this will surprise you

Geographic distribution of the 186 sampled listings in the 1,500–6,000 band: **[VERIFIED]**

| Governorate | Listings in band | Share |
|---|---|---|
| **Muscat** | 133 | **71.5%** |
| **Al Batinah** | 35 | **18.8%** |
| Al Dakhiliya | 8 | 4.3% |
| Al Sharqiya | 3 | 1.6% |
| **Dhofar (Salalah)** | 3 | **1.6%** |
| Buraimi | 2 | 1.1% |
| Al Dhahirah | 2 | 1.1% |

Top localities within the band: `Al Maabilah 24 · Ghubrah 18 · Bosher 14 · Seeb 10 · Azaiba 10 · Rustaq 9 · Sohar 9 · Al Hail 8 · Al Khoud 7 · Suwaiq 7 · Al Khuwair 6 · Qurm 6 · Amerat 5 · Al Mawaleh 5 · Barka 3 · Saham 3 · Salalah 3 · Ibri 2 · Izki 2`

**The brief's city list — "Muscat, Seeb, Salalah, Sohar, Nizwa, Sur, Ibri, Barka" — is not supported by the data.**

- **Muscat is ~72% of the market.** Everything else is a rounding error by comparison.
- **Al Batinah (Sohar, Rustaq, Suwaiq, Barka, Saham, Al Masnaah) is the only meaningful second region** at ~19%. Note that *Rustaq and Suwaiq outrank Sohar* in my sample — Sohar's brand recognition exceeds its listing volume.
- **Salalah is tiny** — 3 listings in band out of 186 (1.6%). Building a Salalah landing page at launch would be building a page for almost nothing. Dubizzle does keep a `/q-صلالة/` and `/q-ظفار/` page, which suggests *search* demand exists even where *supply* doesn't — but a page with zero inventory converts nobody. **[VERIFIED / INFERENCE mix]**
- **Sur, Ibri, Nizwa: 1–2 listings each.** Do not build.
- **Seeb is real** (10 in band) but it is a *Muscat locality*, not a peer city. It belongs under Muscat, matching Dubizzle's model (`/cars-for-sale/al-seeb/` sits alongside `/cars-for-sale/muscat/`).

**Implication for IA: one city page (Muscat) at launch. Al Batinah second, when you have inventory there. Nothing else.** See §8.2.

---

## 4. GCC-spec vs US-import

### 4.1 Why this is your best content asset

This is a real, high-anxiety, high-money-consequence topic that **no one has written well for Oman specifically**, and it is one where you have already committed to being honest in the product. That combination — genuine content gap + genuine product differentiator — is rare.

### 4.2 The taxonomy the market actually uses

dubizzle Oman's `source` facet has these values, with both Arabic and English SEO slugs baked in: **[VERIFIED — extracted from the dubizzle Oman page's embedded facet config, 25 Jul 2026]**

| Value | English label | Arabic label | AR seoSlug |
|---|---|---|---|
| `gcc` | GCC | الخليج | `الخليج` |
| `gcc-omani` | **GCC Omani** | **خليجي عماني** | `خليجي-عماني` |
| `gcc-non-omani` | **GCC Non-Omani** | **خليجي غير عماني** | `خليجي-غير-عماني` |
| `europe` | Europe | — | `europe` |

**This is a much finer distinction than "GCC vs US" and you should adopt it.** Omani buyers do not just want to know it's Gulf-spec; they want to know whether it was **originally sold in Oman** (`خليجي عماني` — Oman agency, Omani service history, Omani warranty) or **imported from another Gulf state, typically the UAE** (`خليجي غير عماني`). Listings I read carried strings like `"GCC Specs / Import: GCC Specs – UAE Agency"` and `"GCC, Oman Agency"` in free text. **[VERIFIED]**

**Recommended field for Autosouq — four values, shown on every listing:**

| Autosouq value | English | Arabic |
|---|---|---|
| `gcc-oman` | GCC — Oman agency | خليجي — وكالة عمان |
| `gcc-import` | GCC — imported (UAE/other Gulf) | خليجي — وارد خليجي |
| `us-import` | US import (وارد أمريكي) | وارد أمريكي |
| `other-import` | Other import (Japan / Europe) | وارد آخر (ياباني / أوروبي) |

Dubizzle conspicuously has **no `american` value** in the facet I extracted. **[VERIFIED but incomplete — I only captured the visible slice of the config; there may be more values.]** If true, it means dubizzle lets US imports hide inside "GCC" or leave the field blank. **That is precisely the dishonesty gap you exist to fill.** Making `us-import` a mandatory, prominent, never-blank field is your differentiator made concrete.

### 4.3 What buyers actually worry about, and what is true

| Concern | What is actually claimed | Confidence |
|---|---|---|
| **Heat / cooling** | GCC-spec has larger radiators, uprated A/C, heat-resistant components; US cars are tuned for temperate North America and "may not handle GCC summers". | **[SOURCED]** — consistent across yallamotor.com, arabwheels.ae, invygo.com, dubicars.com. Repeated everywhere; I could not find an engineering source. |
| **Dust filtration** | GCC-spec cars get larger, higher-efficiency engine and cabin air filters for fine sand. | **[SOURCED]** — firstcarsblog.com, syarah.com. |
| **Lighting/signals** | US cars have red rear indicators integrated with brake lights; GCC-spec has separate amber. A visible, checkable tell. | **[SOURCED]** — syarah.com, firstcarsblog.com. **This is genuinely useful, actionable buyer advice — put it in the guide with a photo.** |
| **Resale value** | GCC-spec holds materially higher resale in the Gulf; US-spec "fetch lower prices". | **[SOURCED]** — yallamotor.com, arabwheels.ae. Directionally certain, magnitude unquantified. **Do not publish a percentage.** |
| **Parts availability** | Some US-spec parts must be imported → delay and cost. | **[SOURCED]** |
| **Warranty** | Local agency warranty typically does not transfer to a privately imported US car. | **[UNVERIFIED for Oman specifically]** — plausible and widely stated regionally; **verify with an Omani agency before publishing as fact.** |
| **Accident / flood / salvage history** | **"Approximately 2 out of every 3 imported vehicles have had some sort of issues in their original country"** — total loss from accident, fire or flood; factory defects/recalls; or reported stolen. | **[SOURCED]** — `vehiclereport.me/oman/vehicle-history`, verbatim quote. **This is a commercial VIN-check vendor with an obvious interest in the number being scary. Attribute it explicitly; never state it in Autosouq's own voice.** |

### 4.4 The Omani regulatory layer — the part nobody has written

**[SOURCED]** unless noted:

- **Age limit: vehicles must have been manufactured no more than 7 years before import.** Older vehicles are generally barred unless classic/specialty. Source: `sandan.om/import-used-car-oman-age-limits-duties-documents/`.
- **The ROP explicitly warns on this.** Royal Oman Police said importers "should ensure the vehicles have not met with any serious accident or suffered damage due to disasters such as floods, fires or cyclone." Source: Oman Observer, "Importing used cars? Comply with norms" (`omanobserver.om/article/59366/...`). There is also a Times of Oman piece headlined **"IMPORTED A SECOND-HAND CAR? IT MAY NOT BE SAFE FOR OUR ROADS: ROP"** (7 Nov 2017) **[SOURCED — pressreader.com]**. Dated, but it is the ROP on the record, and it is exactly the authority citation your guide needs.
- **Salvage-title cars *can* be shipped to Oman** but must pass Omani technical inspection and must have no flood/fire/structural history. Left-hand-drive only. Source: `globalshopaholics.com`, `easyhaul.com`, `auctionexport.com`.
- **Customs 5% + VAT 5%** on import. **[SOURCED — sandan.om]. Verify against current Oman Customs schedule before publishing; tax rates change.**

**⚠️ STALE RISK:** the 7-year rule, the duty rates and the ROP procedure are all things that change. Every number in this subsection must be re-checked against a primary Omani government source (`rop.gov.om`, `gov.om`, Oman Customs) before it goes on a page with Autosouq's name on it. Publishing a wrong import rule would be brand-fatal for a trust-led site.

---

## 5. Buyer anxieties worth owning

Ranked by *(genuine anxiety) × (SERP winnability) × (relevance to your band)*.

### 5.1 Mulkiya / ownership transfer — **the #1 informational opportunity**

**[SOURCED]** facts, all needing a primary re-check before publication:

- Transfer is now doable **online** via the ROP website/app (`rop.gov.om/english/VehicleOwnershipTransfer.aspx`, `omanportal.gov.om`).
- **Fee: OMR 5.** (One source says transfer fees run OMR 20–30 "depending on vehicle category" — **these two figures conflict; resolve before publishing.**)
- **Cars older than 10 years must pass technical inspection before transfer.** **This is directly load-bearing for your band** — from §3.4, a large share of cars at OMR 1,500–3,000 are 12–18 years old, so **most Autosouq transactions at the bottom of the band will require an inspection.** That single sentence is more useful to your buyer than anything on the first page of Google today.
- The **seller initiates**; the **buyer must ratify and pay within 24 hours** or the transaction auto-cancels. A concrete, checkable, high-anxiety detail.
- Registration must be **valid** (not expired); pawned/mortgaged cars cannot be transferred; neither party may hold a car with registration expired over a year.
- **Mulkiya** = the vehicle operating licence, valid one year from registration/renewal.

Sources: Oman Observer (`omanobserver.om/article/1117625/`), `omanportal.gov.om`, `rop.gov.om`, `sandan.om/car-ownership-oman-registration-insurance-inspection/`, `gov.om/en/w/electronic-transfer-of-vehicle-records-in-the-sultanate-of-oman`.

**Why this wins:** §2.4 Gap 1 — the Arabic SERP here is five content farms. And the ROP's own page ranks *below* them.

### 5.2 The 10-year inspection rule as its own page

Spun out of the above because it deserves its own URL. Query intent: "does my car need a fahs / inspection", "فحص فني سيارة عمان". Covers: what triggers it, where (ROP service centres or ROP-approved private centres **[SOURCED — expatfocus.com]**), what they check, what fails, and — critically for you — **who pays, buyer or seller.**

### 5.3 Insurance

Third-party liability is **mandatory**, comprehensive optional. Indicative annual premiums: third-party from ~OMR 80–100; comprehensive OMR 150–250 for a mid-range sedan. **[SOURCED — sandan.om/guide-to-car-insurance-in-oman/, livainsurance.om, giggulf.om. Ranges vary between sources; publish as "typically" with attribution, never as a quote.]**

The angle nobody covers: **an active policy naming the new owner is required at the handover moment** — so the buyer must arrange insurance *before* the transfer completes, not after. **[SOURCED — sandan.om]** That sequencing trips up first-time buyers constantly.

### 5.4 Chassis / VIN check and accident history

- VIN is 17 characters; found on the driver's-side dash through the windscreen, the door jamb, and the Mulkiya. **[SOURCED]**
- Commercial VIN-history vendors serving Oman: `detailedvehiclehistory.com/vin-check/oman`, `premiumvin.com/vin-check/oman`, `vehiclereport.me/oman/vehicle-history`. **[VERIFIED — these pages exist and target Oman.]**
- Whether Oman offers a *free official* accident-history lookup like Abu Dhabi's, I **could not confirm**. **[UNVERIFIED — must be checked with ROP before you tell users it exists.]**

**Strong product tie-in [INFERENCE]:** "we check the chassis number on every listing" is a concrete, cheap, verifiable trust promise. It is also the natural CTA at the foot of this guide.

### 5.5 Scams on OpenSooq — handle with care

You have a **citable, credible, Omani, recent** source: Tariq Al Barwani, *"Be aware of Opensooq scams"*, **Oman Observer, 6 October 2025** (`omanobserver.om/article/1177678/opinion/business/be-aware-of-opensooq-scams`). **[VERIFIED — I read it.]** The scam described: fake "buyers" send a QR code purporting to be part of the platform payment system; it leads to a counterfeit lookalike site that harvests bank details **including the CVV**. The author's own teenage son was targeted selling a guitar; he notes others "got scammed (lost their money)".

Corroborating but weak: SmartCustomer aggregates 8 OpenSooq reviews at 1.5/5, citing phishing links and lookalike sites. **[SOURCED — n=8, essentially anecdotal, do not cite as evidence of scale.]**

**⚠️ Guidance:** write **"how to avoid used-car scams in Oman"**, cite the Oman Observer piece, and describe the *pattern*. Do **not** publish a page attacking a named competitor. It is legally exposed, it is off-brand for "a knowledgeable, honest friend", and it will read as slick — the one thing NICHE.md forbids. Let the sourced journalism do the naming.

### 5.6 The fake-price problem — you can prove it yourself

While sampling OpenSooq I hit these in their **own structured data**: **[VERIFIED]**

- `2010 Toyota Corolla LE — 1,650,000 OMR` (a decimal-point error nobody caught)
- `2027 Suzuki Swift Sport — 750 OMR` (a model year that does not exist yet, at an impossible price)
- `2021 Toyota Yaris Basic — 1,100 OMR` alongside `2021 Toyota Yaris SE — 4,250 OMR`
- `2008 Nissan Altima S — 430 OMR`
- Search-result snippet: `Toyota Corolla 2012, automatic — **295 km** — 1,600 OMR, Yiti, Muscat` — a 14-year-old car with 295 km on it. **[SOURCED — Hatla2ee snippet.]**

**This is a gift.** You can honestly write, in your own voice: *"We sampled several hundred live Omani car listings in July 2026. We found a 2010 Corolla priced at 1.65 million riyals, a 2027 model year on a used car, and a 14-year-old Corolla claiming 295 kilometres."* That is first-hand, reproducible, non-defamatory (you are describing the *market*, not a named company), and it is the most persuasive possible articulation of "the price you see is the real price."

### 5.7 "What to check on a 200,000 km Corolla"

**[INFERENCE — I found no Oman-specific version of this page anywhere.]** Nobody writes maintenance-reality content for the bottom of the market. This is the page that makes Autosouq feel like a friend rather than a listing site. Content: what 200k km actually means on a Corolla in Omani heat, the specific things to check (timing belt/chain interval, A/C compressor, suspension bushes after Omani road surfaces, radiator and cooling system, gearbox behaviour when hot), what is a fair price adjustment for each, and when to walk away.

---

## 6. Arabic SEO — practical, implementable

### 6.1 The competitors do the exact opposite of each other

**[VERIFIED — read from live HTML, 25 Jul 2026.]** This is the most useful thing in this section, because it means there is no single "right answer" and you get to choose deliberately.

| | **OpenSooq** | **dubizzle Oman** |
|---|---|---|
| Default language | Arabic (`/ar/` prefix, `x-default` → Arabic) | **Arabic (no prefix)**; English at `/en/` |
| URL slugs | **Native Arabic** — `/ar/مسقط/حراج-السيارات/سيارات-للبيع` | **Latin, identical in both languages** — `/ar/vehicles/cars-for-sale/muscat/` |
| hreflang codes | `ar-om`, `en-om`, **`x-default`** (→ the Arabic URL) | `ar`, `en` — **no region, no x-default** |
| hreflang scope | Cross-country: `ar-ae`, `en-ae`, `ar-bh`, `en-bh`, `ar-dz`… across the whole OpenSooq network | Within-site only |
| `<html>` tag | `<html dir="rtl" lang="ar">` | `<html lang="ar" dir="rtl" itemscope itemType="http://schema.org/WebPage">` |
| Numerals in titles | **Latin** — `6,774 سيارة` | **Latin** — `3,235 سيارات للبيع` |
| Structured data | Full stack (see §7) | **None** — zero JSON-LD blocks on the category page |

### 6.2 Recommendations

**Language routing: copy dubizzle's *structure*, OpenSooq's *default*.**

```
/            → Arabic (default, no prefix)
/en/…        → English
```

Arabic-default with no prefix matches "Arabic first, English equal second" and gives Arabic the root domain's natural weight. **[INFERENCE]**

**⚠️ Counter-consideration you must weigh:** NICHE.md says over 1.4 million expatriates (Indian, Bangladeshi, Pakistani, Filipino) are a core audience, and they are English-first, not Arabic-first. Serving them an Arabic page on a bare `autosouq.om` link — which is what gets pasted into WhatsApp — adds friction for possibly half your buyers. The alternative is explicit prefixes for both (`/ar/…` and `/en/…`) with the bare root doing language negotiation and `x-default` pointing at a language chooser. **Business decision required — §11, item B3.**

**hreflang: use `ar` and `en` plus `x-default`, not `ar-OM`.**

Rationale: Autosouq serves one country. Region codes exist to disambiguate the *same language across different countries* (`ar-AE` vs `ar-OM`), which is why OpenSooq — running 10+ country sites — needs them and dubizzle Oman does not. You are dubizzle's case. **[INFERENCE, grounded in the observed behaviour of both.]**

Google's actual rules, verified: **[VERIFIED — `developers.google.com/search/docs/specialty/international/localized-versions`]**
- Language code is ISO 639-1, optional region code is ISO 3166-1 Alpha-2.
- **"You can't specify the country code by itself."** Never emit `hreflang="OM"`.
- A bare language code is explicitly permitted.
- **"Each language version must list itself as well as all other language versions."** Self-referencing is mandatory.
- **"If two pages don't both point to each other, the tags will be ignored."** Return links are mandatory — this is the #1 hreflang bug in practice.
- `x-default` is the fallback when nothing matches the user's browser setting.

Emit on every page, both versions:
```html
<link rel="alternate" hreflang="ar" href="https://autosouq.om/used-cars/toyota" />
<link rel="alternate" hreflang="en" href="https://autosouq.om/en/used-cars/toyota" />
<link rel="alternate" hreflang="x-default" href="https://autosouq.om/used-cars/toyota" />
```

**URL slugs: Latin/transliterated, identical across both languages. Do not use Arabic-script slugs.**

Four reasons:
1. **dubizzle — the more modern, better-engineered of the two incumbents — does exactly this**, serving `/ar/vehicles/cars-for-sale/muscat/` to Arabic users. **[VERIFIED]**
2. Arabic slugs percent-encode when shared. Your primary sharing channel is **WhatsApp** (NICHE.md: "one WhatsApp tap"). `om.opensooq.com/ar/%D9%85%D8%B3%D9%82%D8%B7/%D8%AD%D8%B1%D8%A7%D8%AC…` pasted into a chat is unreadable and looks untrustworthy — a real cost for a trust-led brand. **[INFERENCE, but the mechanism is verified: OpenSooq's own canonical is the percent-encoded form.]**
3. istizada's Arabic SEO guide recommends English URLs, noting *"No one manually types in an Arabic URL because it's so easy to make a mistake that will result in a 404."* **[SOURCED — `istizada.com/arabic-seo-guide/`]**
4. One slug per concept halves your routing surface and eliminates a whole class of canonical bugs.

**Numerals: Latin (0–9) everywhere — titles, prices, mileage, years.** Both OpenSooq and dubizzle use Latin numerals in their Arabic titles. **[VERIFIED]** Arabic-Indic (٠١٢٣) in a price would be a deviation from every competitor and from how Omani sites actually render money. Note also that OMR is a **three-decimal currency** (1 rial = 1000 baisa); format as `2,500 ر.ع.` / `OMR 2,500`.

**RTL:** `<html lang="ar" dir="rtl">` on Arabic, `<html lang="en" dir="ltr">` on English. Set `dir` on the element, not via CSS, so it is available to crawlers and assistive tech.

### 6.3 Arabic stemming — set expectations correctly

**[UNVERIFIED for Google specifically.]** I could not find any Google documentation on how Search normalises Arabic. What is well established in the NLP literature is that Arabic retrieval systems generally normalise alef variants (أ إ آ → ا), yeh (ي/ى), teh marbuta (ة/ه), strip diacritics and strip tatweel. **[SOURCED — QCRI Arabic Normalizer, MDPI review of Arabic NLP.]** It is reasonable to assume Google does something similar, **but do not build on that assumption.**

The safe operating rule, which is also what the market does: **treat spelling variants as separate targets and cover both in your content.** Dubizzle building both `/q-كورولا/` and `/q-كرولا/` is a commercial operator telling you not to rely on Google's normaliser. **[VERIFIED]**

### 6.4 The Arabic variant table — implement this

Build it once as a synonym/alias map, then use it for (a) on-site search, (b) `keywords`-style content coverage, (c) alt text and spec labels. Derived from dubizzle's live pages plus standard alef/hamza rules. **[VERIFIED for the pairs marked ✓; the rest are [INFERENCE] from standard normalisation.]**

| Concept | Primary AR | Also seen | |
|---|---|---|---|
| Corolla | كورولا | كرولا | ✓ |
| Land Cruiser | لاند كروزر | لاندكروزر | ✓ |
| Patrol | نيسان باترول | نيسان بترول | ✓ |
| Avalon | افالون | افلون | ✓ |
| Pickup | بيكاب | بيكب | ✓ |
| Camry | كامري | كامرى | |
| Yaris | ياريس | يارس | |
| Sunny | صني | سني | |
| Civic | سيفيك | سيفك | |
| Altima | التيما | الطيما | |
| Accent | اكسنت | أكسنت | |
| GCC-spec | خليجي | الخليج / وارد خليجي | ✓ |
| US import | وارد أمريكي | امريكي / وارد امريكا | |
| Instalments | أقساط | اقساط | ✓ |
| Take over payments | تكملة أقساط | تكملة اقساط | ✓ |
| Part-exchange | البدل | للبدل / بدل | ✓ |
| Cars for sale | سيارات للبيع | حراج السيارات | ✓ |
| Used | مستعملة | مستعمل | |

**Note the alef-hamza pattern:** the *informal* spelling (bare ا, no hamza) is what people actually type — `اقساط` not `أقساط`. istizada: *"informal spelling often has the highest search volume since Arabic searchers tend to write in a lazy less formal way."* **[SOURCED]** Dubizzle's slug is the bare-alef `اقساط`. **[VERIFIED]** **Lead with the informal spelling in slugs and metadata; use the correct formal spelling in body prose.**

### 6.5 Mobile

*"Somewhere between 90–95% of the traffic that comes from the Arab world is on a mobile device."* **[SOURCED — istizada.com; a single vendor's figure, unverified.]** Consistent with NICHE.md's "budget Android phones". **[INFERENCE]** Treat Arabic font loading (a Cairo/Noto Arabic variable font is ~30–165 KB) as a Core Web Vitals budget item, not an afterthought.

---

## 7. Structured data — current rules, checked not assumed

### 7.1 ⚠️ Two features you might reflexively implement are DEAD

**(a) `Vehicle` / vehicle-listing rich results — DEPRECATED.**

Verbatim from Google's own blog, **12 June 2025**: **[VERIFIED — I fetched `developers.google.com/search/blog/2025/06/simplifying-search-results` and read it in full]**

> "The following structured data types will no longer be supported in Google Search results and will be phased out over the coming weeks and months: Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement, **Vehicle Listing**"

> "…our analysis shows that they're not commonly used in Search, and we found that these specific displays are no longer providing significant additional value for users."

> "**This update won't affect how pages are ranked.**"

> "The use of these structured data types outside of Google Search (and dependent features) is not affected."

The same page's **8 September 2025** update: Search Console rich-result reporting, the Rich Results Test and Search-appearance filters dropped these types on **9 September 2025**; the Search Console API supported them **through December 2025**.

Corroborating: the Google Search Central docs URL `…/structured-data/vehicle-listing` now 404s to a changelog stub confirming removal **[VERIFIED]**; the "Vehicles for sale" feature on Google Business Profiles was retired **12 November 2025** **[SOURCED — searchlabdigital.com, dealerrefresh forum]**.

**(b) `FAQPage` rich results — DEPRECATED, and very recently.**

**[VERIFIED — fetched `developers.google.com/search/docs/appearance/structured-data/faqpage`]**: a deprecation notice was added **8 May 2026**, the documentation was removed **15 June 2026**, and the feature **"will no longer appear in Google Search starting May 7, 2026."** From September 2023 it had already been restricted to "well-known, authoritative government and health websites."

**This is fresh — under three months old as of today.** Any SEO advice you have seen recommending FAQ schema for lead generation predates this. **[VERIFIED as of 25 Jul 2026.]**

Note that **OpenSooq still ships `FAQPage` markup** on its Omani category pages **[VERIFIED]** — a large incumbent has simply not caught up. Do not copy them on this.

### 7.2 What to implement anyway

**Critically: deprecation of a *rich result* does not make the *markup* useless.** Google's own wording — "The use of these structured data types outside of Google Search is not affected" — plus the general industry position that attribute-rich schema improves machine legibility for AI answer engines and non-Google consumers. **[SOURCED for the AI-engine claim — schemaapp.com, relevantaudience.com. This is vendor commentary, not Google guidance. [INFERENCE] that it is worth the (small) cost anyway.]**

| Type | Where | Verdict | Why |
|---|---|---|---|
| **`Organization`** | Site-wide, homepage | **Build — required** | Actively supported in Google's structured data gallery **[VERIFIED — `…/structured-data/search-gallery`, last updated 15 Jun 2026]**. Carries name, logo, `sameAs`, `contactPoint`. Do it in both languages with `alternateName` for the Arabic name, exactly as OpenSooq does. |
| **`BreadcrumbList`** | Every non-home page | **Build — required** | Explicitly listed as currently supported **[VERIFIED — same gallery]**. Genuinely changes the SERP display. Cheap. |
| **`ItemList`** | Every category/landing page | **Build** | This is how both a working marketplace and a crawler understand a listing grid. OpenSooq emits 30 items per page. Not a standalone rich result on its own, but it is the correct semantic description. **[INFERENCE]** |
| **`Vehicle`** (schema.org) | Each item inside `ItemList`, and each listing page | **Build — despite deprecation** | Google won't render it, but it remains valid schema.org, it is what OpenSooq uses, and it is the honest description of the entity. Zero risk (Google: "won't affect how pages are ranked"). |
| **`Offer`** | Nested in each `Vehicle` | **Build** | `price`, `priceCurrency: "OMR"`, `availability`, `itemCondition: UsedCondition`, `areaServed`. |
| **`Product` + `Offer`** | Listing pages, **optionally in addition to `Vehicle`** | **Consider — see caveat** | `Product` *is* still supported and splits into "product snippet" (no direct purchase) and "merchant listing" (purchasable) **[VERIFIED — `…/structured-data/product`]**. Autosouq is a lead-gen marketplace with WhatsApp handoff, not checkout, so you are in **product snippet** territory at best. Google's docs I read did **not** address whether marketplaces may mark up third-party goods **[UNVERIFIED]**. **[INFERENCE]** Ship `Vehicle`+`Offer` first; treat `Product` as an experiment, and do not fabricate `aggregateRating` or `review` to chase stars — that is a manual-action risk. |
| **`FAQPage`** | Guide pages | **DO NOT BUILD** | Dead as of 7 May 2026 **[VERIFIED]**. Write the FAQ as real on-page content in real HTML. Skip the JSON-LD. |
| **`LocalBusiness`** | — | **DO NOT BUILD** | You are an online marketplace, not a physical premises. `Organization` is the correct type. Marking up a `LocalBusiness` with no genuine public storefront is a misrepresentation, and misrepresentation is the one thing this brand cannot afford. **[INFERENCE]** |
| **`WebSite` + `SearchAction`** | Homepage | **Build** | Cheap; enables sitelinks searchbox where eligible. **[INFERENCE]** |
| **`CollectionPage` / `SearchResultsPage`** | Category pages | **Optional** | OpenSooq types its category pages as `["CollectionPage","SearchResultsPage"]` inside an `@graph` **[VERIFIED]**. Semantically correct, no known display benefit. |
| **`AggregateOffer`** | Category pages | **Optional** | OpenSooq emits it (low/high price across the page). Useful for describing a price-band page. |

### 7.3 Reference shape — copy this pattern

This is OpenSooq's live `ItemList` item, verbatim from their page, as a known-good template. **[VERIFIED]**

```json
{
  "@type": "ListItem",
  "position": 1,
  "item": {
    "@type": "Vehicle",
    "url": "https://om.opensooq.com/ar/search/281632588",
    "name": "2022 جينيسيس GV70",
    "itemCondition": "https://schema.org/UsedCondition",
    "description": "…",
    "image": { "@type": "ImageObject", "url": "…", "height": "480", "width": "640", "caption": "…" },
    "offers": {
      "@type": "Offer",
      "price": "11800",
      "priceCurrency": "OMR",
      "priceValidUntil": "2026-08-22",
      "availability": "https://schema.org/InStock",
      "offeredBy": { "@type": "Organization", "additionalType": "https://schema.org/AutoDealer", "name": "TAJ MOTORS" },
      "areaServed": {
        "@type": "Place",
        "address": { "@type": "PostalAddress", "addressCountry": "OM", "addressRegion": "مسقط", "addressLocality": "بوشر" }
      }
    }
  }
}
```

**Beat them on completeness.** OpenSooq **omits `mileageFromOdometer` entirely** **[VERIFIED — checked all 376 sampled Vehicle objects]**. For a used-car marketplace that is a glaring hole, and mileage is the second thing after price that a buyer in your band cares about. Also add, on listing pages: `vehicleModelDate`/`productionDate`, `vehicleTransmission`, `fuelType`, `bodyType`, `vehicleIdentificationNumber` (if you verify VINs — and if you do, say so), `numberOfDoors`, `color`, and your GCC/import field via `vehicleConfiguration` or an `additionalProperty`.

---

## 8. Recommended SEO information architecture

### 8.1 Guiding principle

**At ~10 listings, landing pages are a liability, not a strategy.**

Google's spam policies, verbatim: **[VERIFIED — `developers.google.com/search/docs/essentials/spam-policies`]**

> "Doorway abuse is when sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination."

and it specifically names *"multiple domain names or pages targeted at specific regions or cities that funnel users to one page."*

> "Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users."

**A generated matrix of `/used-cars/{make}/{city}` pages, each showing zero or one car, is a textbook match for both definitions.** The instinct to launch with 100 landing pages is exactly wrong here. Build few pages, make each of them genuinely the best page on the Omani internet for its query, and add pages *as inventory earns them*.

### 8.2 The inventory-gated rule — the single most important recommendation

**Adopt a hard, coded threshold: a listing landing page is only rendered, linked and indexed when it has ≥ 5 live listings. Below that, it returns 404, or (better) 200 with `noindex` and a redirect-style pointer to the parent.**

Implement it as a config constant so it can be raised later:

```
MIN_LISTINGS_FOR_INDEXABLE_LANDING_PAGE = 5
```

Behaviour:
- **≥ 5 listings** → render, `index,follow`, in sitemap, linked from parent facet nav.
- **1–4 listings** → render but `noindex,follow`, **not** in sitemap, reachable by filter UI only.
- **0 listings** → do not render a URL at all.

This one rule converts "hundred empty landing pages = penalty risk" into a system that grows itself safely and needs no ongoing editorial judgement. **[INFERENCE — but directly derived from the verified spam-policy text above.]**

### 8.3 URL patterns

Arabic at root, English under `/en/`, **identical Latin slugs** (per §6.2).

```
/                                    Home (AR)  ·  /en/                       Home (EN)
/used-cars                           All listings — the money page
/used-cars/under-2000-omr            Price band
/used-cars/under-3000-omr            Price band
/used-cars/under-6000-omr            Price band (= your whole inventory; see note)
/used-cars/toyota                    Make
/used-cars/toyota/corolla            Make + model
/used-cars/muscat                    City
/used-cars/muscat/toyota             City + make        ← gated, phase 2
/used-cars/toyota/corolla/muscat     Model + city       ← gated, phase 3
/car/{id}-{make}-{model}-{year}-{city}   Individual listing
/guides/{slug}                       Editorial
/sell-your-car                       Seller acquisition
```

**Notes on this scheme:**

- **`/used-cars/` not `/cars-for-sale/`.** Both incumbents use `cars-for-sale`; Hatla2ee and YallaMotor use `used-cars`. **[VERIFIED]** "Used" is the honest, differentiating word for a site that only sells used cars, and it matches the English head term `Used Cars for Sale in Muscat`.
- **Price bands use "under-{n}-omr", matching YallaMotor's proven pattern** and the "under X" query shape from §1.5. **[VERIFIED]** Do not build `/between-2000-and-3000/` — nobody searches that way.
- **`/used-cars/under-6000-omr` is a trap.** It is 100% of your inventory, so it duplicates `/used-cars`. **Either don't build it, or build it as the canonical `/used-cars` page with the band explained in the H1.** I recommend the latter: your H1 on `/used-cars` should *be* "Used cars in Oman under OMR 6,000" — because the band is your identity, and you get the price-band query for free with no duplicate page. **[INFERENCE]**
- **Listing URLs must carry keywords**, unlike OpenSooq's opaque `/search/281632588`. **[VERIFIED]** Keep the ID first so the route stays resolvable if the slug changes.
- **Ordering `{make}/{model}/{city}` vs `{city}/{make}`:** Dubizzle uses `{make}/{city}` (`/cars-for-sale/toyota/muscat/`); Hatla2ee uses `{city}/{make}/{model}` (`/car/city/al-khoud-2201/toyota/corolla`). **[VERIFIED]** Either works. Pick one, enforce it, and 301 the other — **do not let both resolve**, which is how marketplaces generate infinite duplicate-content surface.

### 8.4 Which landing pages to build at launch (~10 listings) — be ruthless

| Page | Build now? | Reasoning |
|---|---|---|
| `/used-cars` (AR + EN) | **YES** | Your core page. Doubles as the "under OMR 6,000" price-band page. |
| `/used-cars/muscat` | **YES** | 72% of the market is here **[VERIFIED §3.5]**. It will have inventory. Genuine target: `سيارات مستعملة للبيع في مسقط` / `used cars for sale in Muscat`. |
| `/used-cars/under-3000-omr` | **YES, if ≥5 listings qualify** | Proven query shape; both Hatla2ee and YallaMotor built it. It is also the most Autosouq-shaped page in existence — it *is* your customer. |
| `/used-cars/under-2000-omr` | **Only if ≥5 qualify** | Same logic; likely thinner at launch. Gate it. |
| `/used-cars/toyota` and `/used-cars/nissan` | **Probably not at launch** | With ~10 listings you'd have 2–3 each. **Gate at 5.** These are the first two pages to unlock as inventory grows — Nissan and Toyota are the top two makes in your band **[VERIFIED §3.3]**. |
| Other make pages (Hyundai, Mitsubishi, Honda, Kia, Suzuki) | **NO** | Gated. Unlock in that order — it's the observed frequency order in your band. |
| Any make+model page | **NO** | Phase 2. Priority when unlocked, by band frequency **[VERIFIED §3.3]**: Nissan Altima → Toyota Camry → Honda Accord → Toyota Corolla → Nissan Sunny → Toyota Yaris → Hyundai Elantra → Mitsubishi Pajero. |
| Salalah / Nizwa / Sur / Ibri city pages | **NO — and probably not for a long time** | 1.6% and below **[VERIFIED §3.5]**. Building these at launch is precisely the doorway-page pattern Google names. |
| Sohar / Barka / Rustaq (or one `/used-cars/al-batinah`) | **NO at launch; first city page to unlock after Muscat** | Al Batinah is 19% of the band **[VERIFIED]**. **[INFERENCE]** Consider a single **`/used-cars/al-batinah`** governorate page rather than four thin town pages — it aggregates Sohar+Rustaq+Suwaiq+Barka+Saham into one page that can actually clear the threshold. |
| Body-type pages (sedan/SUV/hatchback) | **NO** | Only 4 of dubizzle's 104 keyword pages are body types **[VERIFIED §1.2a]**. Weak demand, high thin-content risk. |
| Colour / transmission / fuel / cylinder pages | **NEVER** | Zero evidence of demand. Filters, not pages. Keep them behind `?` query params and disallow crawling of parameterised URLs — as dubizzle does (`Disallow: *sorting=*` etc. in their robots.txt **[VERIFIED]**). |

**Launch total: 3–4 indexable listing landing pages per language. That is the correct number.**

### 8.5 Guide pages, in priority order

Each with its target query. Priority = anxiety × winnability × brand fit. **[INFERENCE on ordering; each underlying opportunity is verified in §§2, 4, 5.]**

| # | Page | Target query (AR / EN) | Rationale |
|---|---|---|---|
| 1 | **How to transfer car ownership in Oman (Mulkiya)** | `نقل ملكية سيارة في سلطنة عمان` / `how to transfer car ownership in Oman` | §2.4 Gap 1 — Arabic SERP is five content farms; the ROP's own page ranks below them. Highest ROI on the site. |
| 2 | **GCC-spec vs American import: what it means in Oman** | `الفرق بين الوارد الخليجي والأمريكي` / `GCC spec vs American spec Oman` | §2.4 Gap 3 — every ranking article is UAE/Saudi. Also one of your four trust promises, and `خليجي` is a live search term **[VERIFIED §1.2d]**. |
| 3 | **What OMR 2,000 / 3,000 / 5,000 actually buys you in Oman** | `سيارات مستعملة رخيصة في عمان` / `used cars under 3000 OMR Oman` | §2.4 Gap 2. Uses the real price-by-year table from §3.4. Links straight to the matching price-band landing page. Nobody has written this. |
| 4 | **How to avoid used-car scams in Oman** | `احتيال بيع السيارات عمان` / `used car scams Oman` | §5.5/§5.6. Cite Oman Observer (6 Oct 2025). Include your own July 2026 sampling finding. **Never name a competitor in your own voice.** |
| 5 | **Does this car need an ROP inspection? (the 10-year rule)** | `فحص فني للسيارة في عمان` / `car inspection Oman used car` | §5.2. Directly load-bearing for your band — most bottom-of-band cars are >10 years old. |
| 6 | **What to check on a 200,000 km Corolla** | `سيارة مستعملة ممشى عالي` / `high mileage used car what to check Oman` | §5.7. The most on-brand page on the site: "a knowledgeable, honest friend." |
| 7 | **Insurance when you buy a used car in Oman** | `تأمين سيارة مستعملة عمان` / `car insurance Oman used car` | §5.3. The sequencing insight (insurance before transfer) is genuinely useful and undocumented. |
| 8 | **Chassis number / VIN check in Oman** | `فحص رقم الشاسيه عمان` / `chassis number check Oman` | §5.4. Ties to a concrete trust promise. **Verify the ROP free-lookup question first.** |
| 9 | **Buying your first car in Oman as an expat** | `first car in Oman expat guide` (EN-weighted) | Serves the 1.4m expat audience directly. Matches dubizzle's `expat` / `expat-leaving` keyword pages **[VERIFIED]**. |
| 10 | **Selling your car when you leave Oman** | `sell my car before leaving Oman` | Supply-side acquisition, not just demand. Matches `leaving` / `urgent-sale` **[VERIFIED]**. Fills your inventory, which unlocks §8.2 gating. |

**Language note:** write **1, 2, 3, 5, 6** Arabic-first (Omani-national anxieties, and the Arabic SERP is softer). Write **9, 10** English-first (expat audience). **4, 7, 8** need genuine parity.

**Do not** make these thin translations of each other. Google's localised-versions guidance treats them as alternates, but a machine-translated Arabic page will lose to `المرجع العماني` because a content farm writing natively still reads better than a bad translation. **[INFERENCE]**

### 8.6 Sitemaps and crawl hygiene

- One sitemap index; separate child sitemaps for listings, landing pages, guides, static.
- **Only ever include indexable URLs.** A `noindex` URL in a sitemap is a contradictory signal.
- Regenerate on listing create/expire. A sold car's URL should 410, not 404 and not soft-404 to the grid.
- `robots.txt`: disallow parameterised sort/filter URLs, `/api/`, auth pages. Model on dubizzle's, which explicitly blocks `*sorting=*`, `*search%*`, `/profile/`, `/payment/` **[VERIFIED]**.
- **Kill the WordPress sitemap at cutover** (§0).

---

## 9. The footer

### 9.1 Current state

The footer has **already been rebuilt** by another agent working in parallel. `/Users/joshheywood/Autosouq.om/apps/web/data/footerLinks.js` now holds **10 links across 3 groups**, down from the template's 21-link farm, with the dead surfaces (Personal loan, Investors, Careers, Car sales trends, Corporate Policies, Copyrights) removed rather than re-pointed, and the duplicate Terms/Privacy entries gone. **[VERIFIED — read the file 25 Jul 2026.]**

**That work is correct and this section endorses it.** What follows is what to do next, not a re-do.

### 9.2 What "optimised for short links" should mean here

The user's phrase is right but needs unpacking. It should mean **five** things:

**(1) Every link resolves to a real page.** Non-negotiable, and already achieved. A footer link to a 404 on a trust-branded site is worse than no footer.

**(2) Anchor text describes the destination.** "Used cars in Oman" beats "Browse". Already achieved. **[INFERENCE]** Footer anchors are one of the few places you get to state, sitewide, what your pages are about — spend them on descriptive noun phrases, not verbs.

**(3) Short means *few*, not *terse*.** There is no Google-published numeric limit on footer links — Google removed the old "keep links under 100" guidance from its guidelines years ago, and John Mueller's position is that footer links are read as *navigation* and carry less weight than in-content links. **[SOURCED — secondhand via SEO commentary (rocktherankings.com, outreachmonks.com); I could not find a primary Google statement, so treat the specific numbers those sources quote (20–40 footer links, 150 page total, "45–50 internal links perform best") as UNVERIFIED folklore. Do not cite them to anyone.]** The defensible principle is simpler: **every sitewide link you add slightly dilutes the signal of the others, so only add a link you'd defend individually.** 10 is a good number. 15 is fine. 21 pointing at 7 destinations was the actual bug.

**(4) The footer is for *stable, universal* destinations — not for SEO landing pages.** This is the key judgement call and I want to be explicit about it because there will be pressure to do the opposite:

> **Do not put a make/model/city link farm in the footer.**

The temptation, once you have `/used-cars/toyota`, `/used-cars/nissan`, `/used-cars/muscat` etc., will be to list all of them sitewide "for internal linking". Resist. Reasons: (a) it recreates exactly the link farm that was just removed; (b) Google names *"pages targeted at specific regions or cities that funnel users to one page"* in its doorway-abuse definition **[VERIFIED §8.1]**; (c) it puts your weakest, thinnest pages on every URL on the site, which is the opposite of what you want. **[INFERENCE]**

Those links belong in **facet navigation on `/used-cars`** — contextual, on the relevant page, where a user actually browsing wants them — and in the **XML sitemap**. That is what sitemaps are *for*.

**(5) Trust signals belong in the footer; they just aren't links.** For this brand specifically, the footer is prime real estate for the four promises from NICHE.md rendered as text or icons — real prices, verified listings, GCC-spec shown honestly, one WhatsApp tap. **[INFERENCE]** A trust-led brand should restate its promise where every page ends.

### 9.3 Recommended target footer

Building on the existing 10 links. Additions marked **+**.

| Group | Links |
|---|---|
| **Buy a car** (اشترِ سيارة) | Used cars in Oman · Used cars on the map · **+** Used cars in Muscat · **+** Used cars under OMR 3,000 *(only once §8.2 gate is cleared)* |
| **Sell a car** (بِع سيارتك) | Sell your car · Add a listing |
| **Guides** (أدلة) **+ new group** | **+** How to transfer ownership · **+** GCC-spec vs imported · **+** All guides |
| **Autosouq** | About us · FAQs · Contact us · Terms & Conditions · Privacy Policy |
| **Not links** | Language switcher (AR ⇄ EN, with `hreflang`-matched hrefs) · WhatsApp contact · the four trust promises as static text |

**Target: 14–16 links.** Every one a distinct real destination.

**Two things the footer must carry that are not in the list:**
- **The language switcher.** Arabic-first with English equal second means the switch has to be findable on every page. Its hrefs must be the same URLs as your `hreflang` alternates, or you create a conflicting signal. **[INFERENCE]**
- **The `Organization` JSON-LD** (§7.2) is conventionally emitted near the footer. Its `sameAs` should list your real social profiles — and only real ones.

**One thing to remove if it appears:** a "Popular searches" or "Popular brands" tag cloud. That is the link farm under a different name.

---

## 10. Prioritised build list

Ordered. Do these in sequence.

### Phase 0 — before anything is indexed

| # | Build | Target | Why |
|---|---|---|---|
| 0.1 | **Audit and neutralise the existing WordPress site at autosouq.om** | — | `/test/`, `/sample-page/`, `/home-03/` are live and crawlable today (§0). A trust brand cannot launch on top of a theme demo. **Blocking.** |
| 0.2 | **Implement the `MIN_LISTINGS_FOR_INDEXABLE_LANDING_PAGE = 5` gate** | — | §8.2. Everything downstream depends on it. Build it before the first landing page, not after the hundredth. |
| 0.3 | **hreflang + `<html lang/dir>` + canonical on every route** | — | §6.2. Cheap now, agonising to retrofit. Self-referencing + return links or Google ignores the lot **[VERIFIED]**. |
| 0.4 | **`Organization` + `BreadcrumbList` JSON-LD, sitewide** | — | §7.2. Both currently supported **[VERIFIED]**. |

### Phase 1 — launch (~10 listings)

| # | Build | Target query | Why |
|---|---|---|---|
| 1.1 | **`/used-cars` (AR) + `/en/used-cars`**, H1 = "Used cars in Oman under OMR 6,000" / `سيارات مستعملة للبيع في عمان بأقل من 6,000 ريال` | `سيارات مستعملة للبيع في عمان` / `used cars for sale Oman` | The money page. Absorbs the "under 6,000" price-band query without a duplicate URL (§8.3). |
| 1.2 | **`/used-cars/muscat`** (both languages) | `سيارات مستعملة للبيع في مسقط` / `used cars for sale in Muscat` | 72% of your market **[VERIFIED §3.5]**. The only city that earns a page at launch. |
| 1.3 | **Listing pages with keyword URLs + `Vehicle`/`Offer` JSON-LD including `mileageFromOdometer`** | long tail | OpenSooq's URLs are opaque IDs and they omit mileage entirely **[VERIFIED]**. Two free wins. |
| 1.4 | **Guide: How to transfer car ownership in Oman (Mulkiya)** — Arabic first | `نقل ملكية سيارة في سلطنة عمان` | The softest good SERP in the market: five content farms, ROP ranking below them **[VERIFIED §2.4]**. |
| 1.5 | **Guide: GCC-spec vs American import in Oman** — Arabic first | `الفرق بين الوارد الخليجي والأمريكي` + `خليجي` | No Oman-specific page exists **[VERIFIED §2.4]**; `خليجي` is a live query **[VERIFIED §1.2d]**; it's a stated trust promise. |
| 1.6 | **The four-value GCC/import field, mandatory on every listing** | — | §4.2. Turns a promise into a data structure. Never blank, never "GCC" as a catch-all. |
| 1.7 | **Footer: add Guides group + language switcher** | — | §9.3. |
| 1.8 | **`/used-cars/under-3000-omr`** *(only if ≥5 qualifying listings)* | `used cars under 3000 OMR Oman` / `سيارات أقل من 3000 ريال` | Proven pattern **[VERIFIED §1.5]**; the most Autosouq-shaped page there is. Gate it honestly. |

### Phase 2 — as inventory grows (30–80 listings)

| # | Build | Target | Why |
|---|---|---|---|
| 2.1 | `/used-cars/nissan`, then `/used-cars/toyota` | `نيسان مستعملة عمان` / `used Nissan Oman` | Nissan **before** Toyota — Nissan leads your band **[VERIFIED §3.3]**, even though Toyota leads the overall market. |
| 2.2 | **Guide: What OMR 2,000 / 3,000 / 5,000 actually buys** | `سيارات مستعملة رخيصة عمان` | §2.4 Gap 2. Use the §3.4 price table. Unowned territory. |
| 2.3 | **Guide: How to avoid used-car scams in Oman** | `used car scams Oman` | Cite Oman Observer (6 Oct 2025) + your own July 2026 sampling **[VERIFIED §5.5–5.6]**. Never name a competitor yourself. |
| 2.4 | `/used-cars/under-2000-omr` | `used cars under 2000 OMR Oman` | Unlock when the gate clears. |
| 2.5 | Make+model pages, in band-frequency order | Altima → Camry → Accord → Corolla → Sunny → Yaris | Order taken from real band data **[VERIFIED §3.3]**, not from assumption. |
| 2.6 | **Guide: the ROP 10-year inspection rule** | `فحص فني للسيارة في عمان` | Applies to most bottom-of-band cars. |
| 2.7 | Arabic synonym/alias map wired into on-site search | — | §6.4. Both `كورولا` and `كرولا` must return results. |

### Phase 3 — scale (150+ listings)

| # | Build | Target | Why |
|---|---|---|---|
| 3.1 | `/used-cars/al-batinah` (one governorate page, not four town pages) | `سيارات مستعملة صحار` etc. | 19% of the band **[VERIFIED §3.5]**; aggregating clears the gate where individual towns never would. |
| 3.2 | `/used-cars/{make}/{city}`, gate-controlled | long tail | Only where ≥5 listings. Enforce one ordering; 301 the other (§8.3). |
| 3.3 | Remaining guides 6–10 (§8.5) | — | High-mileage checks, insurance, VIN, expat first car, selling on departure. |
| 3.4 | Muscat sub-locality pages (Al Maabilah, Ghubrah, Bosher, Seeb, Azaiba) | `used cars Al Maabilah` | Only at real depth. These are the actual hot localities **[VERIFIED §3.5]** and they're where Facebook Marketplace currently ranks unopposed **[VERIFIED §2.1]**. |
| 3.5 | Revisit `Product` schema; re-check FAQ/Vehicle deprecation status | — | §7. Google's rules moved twice in 14 months. Re-check before assuming anything here still holds. |

---

## 11. Decisions the business must make

These are not engineering choices and I should not make them.

**B1 — What happens to the existing autosouq.om WordPress site?** It is live, indexed and full of theme-demo URLs (§0). Someone must decide: hard cutover with 410s, or a redirect map? Is there any accumulated SEO equity worth preserving, or is it a clean slate? **This blocks launch.**

**B2 — Does Autosouq serve instalment/finance intent?** `اقساط`, `تكملة اقساط`, `installments` are demonstrably significant query clusters in Oman **[VERIFIED §1.2c]**, and dubizzle built four separate landing pages for them. NICHE.md and the current footer both say Autosouq does not do finance. Three options: (a) ignore the intent entirely; (b) support a **"seller accepts instalments / تكملة أقساط"** flag on listings, which is peer-to-peer and costs you nothing regulatory; (c) offer finance, which is a different business. **My recommendation is (b)** — it captures real search intent, it is honest, and it is a listing attribute rather than a financial product. But it is your call.

**B3 — Arabic at the root, or explicit `/ar/` and `/en/` prefixes?** Arabic-at-root best expresses "Arabic first" and matches dubizzle. But NICHE.md's 1.4m-strong expat audience is English-first, and the bare domain is what gets pasted into WhatsApp (§6.2). Trade-off between brand statement and conversion friction for possibly half your buyers.

**B4 — Which price-band pages do you commit to?** `/used-cars/under-3000-omr` is the highest-value single landing page available to you, but only if you will genuinely hold ≥5 listings under OMR 3,000 at all times. If your real inventory skews to 3,000–5,000, build `/used-cars/under-5000-omr` instead. **Do not build a band page you cannot keep stocked** — an empty price-band page is worse than none.

**B5 — Do you verify VINs, and will you say so?** §5.4 and §7.3. If yes, it is a strong differentiator, a `vehicleIdentificationNumber` schema field and a guide page. If no, drop the VIN claim from the trust copy entirely — a trust brand cannot imply a check it does not perform.

**B6 — Who owns fact-checking the regulatory content?** The mulkiya fee (§5.1 has a **conflict**: OMR 5 vs OMR 20–30), the 7-year import age limit, the 5% customs/VAT, the 10-year inspection threshold — all are third-party sourced and all change. Publishing a wrong ROP rule under Autosouq's name would do more brand damage than the page earns. Someone must verify against `rop.gov.om` / `gov.om` / Oman Customs before publish, and own re-checking annually.

---

## 12. Source index

**Primary — Google (all fetched and read 25 Jul 2026):**
- `developers.google.com/search/blog/2025/06/simplifying-search-results` — vehicle listing deprecation, verbatim, 12 Jun 2025 + 8 Sep 2025 update
- `developers.google.com/search/docs/appearance/structured-data/faqpage` — FAQ deprecation, "no longer appear… starting May 7, 2026"
- `developers.google.com/search/docs/appearance/structured-data/search-gallery` — currently supported features, page updated 15 Jun 2026
- `developers.google.com/search/docs/appearance/structured-data/vehicle-listing` — 404, removal confirmed
- `developers.google.com/search/docs/appearance/structured-data/product` — product snippet vs merchant listing
- `developers.google.com/search/docs/specialty/international/localized-versions` — hreflang rules
- `developers.google.com/search/docs/essentials/spam-policies` — doorway abuse, scaled content abuse

**Primary — competitor HTML (fetched and parsed 25 Jul 2026):**
- `om.opensooq.com/ar/مسقط/حراج-السيارات/سيارات-للبيع` — schema stack, hreflang, H1
- `om.opensooq.com/en/cars/cars-for-sale` pages 1–14 — the 376-listing price/geo sample
- `om.opensooq.com/en/cars/cars-for-sale/{make}/{model}` × 12 — price-by-year data
- `www.dubizzle.com.om/en/vehicles/cars-for-sale/muscat/` and `/ar/…` — 104 keyword pages, spec facet taxonomy, hreflang, robots
- `autosouq.om/` and `autosouq.om/wp-sitemap.xml` — current site state

**Named third-party sources:**
- Oman Observer — "Be aware of Opensooq scams", Tariq Al Barwani, 6 Oct 2025 · "Car ownership transfer can be done online: ROP" · "Importing used cars? Comply with norms"
- `rop.gov.om/english/VehicleOwnershipTransfer.aspx`, `omanportal.gov.om`, `gov.om`
- `sandan.om` — car ownership, insurance, import rules, used-car market guides (note: TLS certificate expired at time of research)
- `vehiclereport.me/oman/vehicle-history` — the "2 out of 3 imported vehicles" claim (commercial VIN vendor)
- `yallamotor.com`, `arabwheels.ae`, `invygo.com`, `dubicars.com`, `syarah.com`, `firstcarsblog.com` — GCC vs American spec
- `istizada.com/arabic-seo-guide/` — Arabic SEO practice
- `mordorintelligence.com/industry-reports/oman-used-car-market`, `focus2move.com`, `bestsellingcarsblog.com` — market size and share
- `oman.hatla2ee.com`, `oman.yallamotor.com` — IA patterns from URLs/titles only (403 on fetch)

**Explicitly NOT sourced:** search volumes, keyword difficulty, domain authority, traffic estimates, and the numeric footer-link thresholds in §9.2. None of these were available and none are asserted.
