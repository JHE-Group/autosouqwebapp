# AutoTrader (autotrader.co.uk) — UX patterns, and what Autosouq should do with them

**Researched:** 25 July 2026
**Subject:** autotrader.co.uk (UK), desktop web + help/support corpus + Play Store listing
**Purpose:** extract interaction patterns and information architecture worth adapting for Autosouq.om. Not a visual or copy reference.

---

## 0. Method, evidence quality, and caveats

**How the site was accessed.** autotrader.co.uk returns HTTP 403 to direct automated fetches (both `WebFetch` and `curl` with a browser UA), serving "Enable JavaScript and cookies to continue". All page observations below were obtained through a rendering proxy (`r.jina.ai`) which executes the page and returns the rendered text, plus AutoTrader's own help centre, advice articles and Play Store listing, which are not bot-blocked.

**Consequences for evidence quality — read this before trusting anything below:**

- **What I observed directly:** text content, labels, section order, badge wording, filter names and their order, result counts, URL parameter structure, CTA labels, listing card contents, detail page section sequence, help-centre policy text. These are reliable and cited.
- **What I could not observe directly:** pixel layout, spacing, colour, sticky/fixed positioning, scroll behaviour, animation, gesture handling, the mobile breakpoint's actual rendering, and payload weight. The proxy returns a desktop render flattened to text.
- **Everything about mobile layout in §5 is therefore inference**, explicitly labelled as such, drawn from the labels that *do* appear (e.g. a combined "Filter and sort" control with a count badge is a mobile-first affordance) plus the Play Store feature list. Treat §5 as hypotheses to verify on a real device, not as observed fact.
- **Date caveat:** today is 25 July 2026. AutoTrader ships continuously; a PistonHeads thread in the search corpus references recent grid-view and filter changes users disliked, so the layout is actively churning. The *policy* documents (price indicator exclusions, vehicle check contents) change more slowly and are the more durable findings. Anything in §1–§3 could be a month old by the time it is acted on. The findings in §4 are the ones worth building on.

**The framing that governs every recommendation.** AutoTrader is a 40-year-old marketplace with ~450,000 live listings, a mature dealer network, an FCA-regulated finance arm, and national vehicle databases (DVLA, police, insurers, finance houses) to draw on. Autosouq launches with ~10 real listings, private sellers only, cash buyers, no national data feed, on budget Android over metered data, in a market where the incumbent competitors are actively untrustworthy. **Most of AutoTrader's cleverness is a function of scale Autosouq does not have.** The valuable transfer is rarely the feature; it is the user need underneath, and often the correct adaptation is to solve that need with an entirely different, cheaper mechanism — or to decline.

---

## 1. Search and filtering

### 1.1 What was observed

**Homepage entry point.** The primary widget is three fields in this order — **Postcode → Make → Model** — under a Buy / Lease / Sell toggle, with the submit button carrying the live inventory count: **"Search 452,718 cars"**. Source: [autotrader.co.uk/cars/homepage](https://www.autotrader.co.uk/cars/homepage). The used-cars landing page repeats the widget with an added **"More options"** expander and the button reading **"Search 427,411 cars"** ([autotrader.co.uk/cars/used](https://www.autotrader.co.uk/cars/used)).

Two things are notable. First, **location is a precondition, not a filter** — postcode is field one, before make. Second, **the count is inside the button**. The user is told the size of the haystack before they commit, which is a confidence signal that only works when the number is large.

**Search results filter panel, in exact observed order** (left rail on desktop; source: [car-search?postcode=M15+4FN&price-to=6000](https://www.autotrader.co.uk/car-search?postcode=M15%204FN&price-to=6000)):

1. **Price** — pinned at the top, rendered as the applied state ("Up to £6,000")
2. **I'm looking for** — free-text keyword
3. **Make and model**
4. **Year**
5. **Mileage**
6. **Gearbox**
7. **Body type**
8. **Fuel type**
9. **Engine size**
10. **Distance**

The ordering is a claim about buyer psychology: **budget first, then the free-text escape hatch, then identity (make/model), then age and wear, then mechanical preference, then geography last** (because postcode was already collected). Distance being last, not first, is only defensible because the postcode gate already narrowed the set.

**Filters combine as AND, and every filter is in the URL.** `?postcode=M15+4FN&make=Ferrari&price-to=2000&sort=price-asc&page=2` — observed working. This makes any result set shareable, bookmarkable, back-button-safe and indexable. This is the single most transferable technical decision on the entire site.

**Count presentation.** Above results: **"77,483 results"**, alongside the disclosure **"Ads may appear higher in results based on popularity, quality and paid-for visibility."** That disclosure is a trust mechanic in its own right — they tell you the ranking is partly bought.

**Sort.** URL-driven (`sort=price-asc` observed working). AutoTrader's own developer documentation for its search API lists sorts by **price (total or supplied), vehicle age, mileage, and distance from a postcode**, ascending and descending, plus relevance ([help.autotrader.co.uk — Introduction to Search](https://help.autotrader.co.uk/hc/en-gb/articles/21946045692445-Introduction-to-Search)).

**Saved searches and alerts.** Observed on the results page: a **"Save search"** control, and the prompt **"Save vehicles, searches and create alerts for price drops and new listings by signing in"**. Price-drop alerts and new-match notifications are also the headline features of the Android app ("Get instant notifications when new vehicles match your search" — [Play Store](https://play.google.com/store/apps/details?id=uk.co.autotrader.androidconsumersearch)).

**"Load previous results"** appears on page 2 — i.e. paginated URLs plus a mechanism to restore the earlier scroll position rather than losing it.

**Mobile control.** A single combined **"Filter and sort"** button carrying a count of applied filters (observed rendering as "Filter and sort 1").

### 1.2 Judgement for Autosouq

**Which filters actually matter at OMR 1,500–6,000?** AutoTrader's filter list is built for a market where a buyer is choosing between broadly sound cars and expressing *preference*. At OMR 1,500–6,000 in Oman the buyer is not expressing preference; they are managing *risk and budget*. Their real questions, per NICHE.md, are: **does it run, is it GCC spec, how many km, can I afford it, and where is it**.

Mapping AutoTrader's ten filters onto that:

| AutoTrader filter | Serves Autosouq's buyer? | Verdict |
|---|---|---|
| Price | Yes — the whole site is a price band, but *within* the band OMR 1,500 vs 5,500 is the difference between two different lives | **Keep, lead with it** |
| Keyword ("I'm looking for") | Marginal at 10 listings; essential at 500 | **Later** |
| Make and model | Yes — Omani buyers shop by nameplate reputation (Corolla, Sunny, Prado) more than by body type | **Keep, second** |
| Year | Partially — proxies condition, but at this price band km matters more | **Keep, but below km** |
| Mileage | **Critical** — at 200,000+ km this is the primary condition signal | **Promote above year** |
| Gearbox | Yes, but weakly — near-universal automatic preference | **Keep, low** |
| Body type | Yes — sedan vs SUV vs pickup is a real Omani decision | **Keep, mid** |
| Fuel type | **No** — Oman is ~100% petrol in this band. A filter whose every option returns the same set is noise | **Skip / auto-hide** |
| Engine size | **No** at this price. Cylinders (4 vs 6) matters more for fuel cost | **Replace with cylinders** |
| Distance | Different problem — see below | **Replace with city** |
| — | **Import origin (GCC / US / Japan)** — has no AutoTrader equivalent and is *the* differentiating question | **Add, and rank it high** |

**Location is a different problem in Oman than in the UK.** AutoTrader collects a postcode and computes radius in miles. Oman's postcode system is not in everyday use, and the practical geography is a short list of cities and wilayats — Muscat, Seeb, Sohar, Salalah, Nizwa, Sur, Ibri. The right adaptation is a **city dropdown, not a radius**. The codebase already does this: `OMAN_CITIES` in `AddListing.jsx` and a `location` facet in the reducer. Do not add radius search; it would require geocoding every listing and would answer a question no one asked.

### 1.3 Recommendations — search and filtering

---

**Pattern: filter state lives in the URL.**

- **User need it serves:** send a friend a link to "automatics under 3,000 in Sohar"; return to results after opening a car; not lose your work on back.
- **Does the need exist for Autosouq?** **Yes, more acutely than for AutoTrader.** Autosouq's users live on WhatsApp. The dominant sharing act in this market is pasting a link into a family or community group chat. A filtered view that cannot be pasted is a growth channel thrown away. Additionally, WhatsApp's in-app browser and Android's aggressive backgrounding mean state loss is frequent.
- **Adapted version:** mirror the reducer state to `searchParams` (`?make=toyota&price-max=3000&city=sohar&spec=gcc`), hydrate the reducer from `searchParams` on mount, and push (replace, not push, while dragging sliders) on change. Arabic values should be stored as stable Latin slugs in the URL, with labels resolved from `lib/listingLabels.js` — never put Arabic display strings in the querystring.
- **Priority:** **Must-have for launch.** It is the cheapest single change with the largest compounding return (sharing, SEO, analytics, back-button correctness) and it unblocks landing pages later.
- **Implementation notes:** `apps/web/reducer/carFilterReducer.js` already has a clean action set and `createInitialState(cars)`. Add a `HYDRATE_FROM_PARAMS` action and a small `lib/searchParams.js` with `toParams(state)` / `fromParams(params, bounds)`. Wire in `apps/web/components/carsListings/Cars2.jsx` (the canonical `/listing-grid`) using `useSearchParams()` + `router.replace(..., { scroll: false })`. **Do this once in a shared hook** — the filter pipeline is currently duplicated across `Cars1.jsx`–`Cars5.jsx`, and adding URL sync five times would be a mistake. See §7.3 on collapsing those variants first.

---

**Pattern: result count shown before and after searching (count-in-button).**

- **User need it serves:** calibrate expectations; know whether to broaden or narrow.
- **Does the need exist for Autosouq?** **The need yes; the pattern no — and this is a good example of a right-for-them, wrong-for-us pattern.** "Search 452,718 cars" is a confidence signal *because the number is huge*. "Search 10 cars" is an anti-signal that tells a first-time visitor the site is empty and to go back to OpenSooq. Do not put the inventory count in the button, and do not put it on the homepage, until the number is genuinely reassuring (the honest threshold is probably several hundred).
- **Adapted version:** keep a count **on the results page only**, phrased as a statement of the current filter rather than of the whole business. The existing "There Are Currently {n} Results" in `Cars2.jsx` is close but reads like machine output. Better: "12 cars match — 12 سيارة مطابقة", and when filters are applied, name them: "3 cars in Sohar under OMR 3,000". Never show a count of zero without the recovery UI in §8.
- **Priority:** **Must-have** for the results-page phrasing; **skip** the homepage/button count until inventory justifies it.
- **Implementation notes:** `Cars2.jsx` around the `heading-section` block. Sentence-case the string, add the Arabic, and drop the title-case "There Are Currently".

---

**Pattern: filter ordering by decision weight, budget first.**

- **User need it serves:** get to a shortlist in the fewest interactions by answering the most eliminating question first.
- **Does the need exist for Autosouq?** Yes, but the weights are different (table in §1.2).
- **Adapted version — proposed Autosouq filter order:**
  1. **Price** (slider, band-bounded 1,000–6,000)
  2. **Make** → **Model** (dependent)
  3. **Kilometres** (slider) — promoted above year, because at this band km is the condition proxy
  4. **City**
  5. **Import origin** — GCC / US import / Japan import / not stated
  6. **Body type**
  7. **Transmission**
  8. **Year**
  9. **Cylinders**
  10. Colour, doors — collapsed under "more"
  - **Remove fuel type entirely** unless and until non-petrol listings exist. A filter with one populated option is a lie about the size of the catalogue.
- **Priority:** **Must-have** (reorder is nearly free); **import-origin filter must-have** — it is the differentiator and it is already in the data model.
- **Implementation notes:** `apps/web/components/carsListings/FilterSidebar.jsx` currently orders Make → Model → Body → Price → Fuel → Transmission → Location → Doors → Cylinders → Colour → Year → KM. There is also a **live bug to fix while you are in there**: the KM slider at `FilterSidebar.jsx:171-172` passes `MIN={allProps.bounds.price[0]} MAX={allProps.bounds.price[1]}` — price bounds driving the kilometre slider, directly under a label reading `KM: … km`. On this data that means the km slider spans roughly 1,000–6,000 and can never select a real mileage. Filtering by km is currently broken. Add `importOrigin` to `buildFilterOptions()` in `apps/web/lib/carOptions.js` and a `SET_IMPORT_ORIGIN` action to the reducer.

---

**Pattern: saved searches with new-match and price-drop alerts.**

- **User need it serves:** the market has nothing right for me today; tell me when it does.
- **Does the need exist for Autosouq?** **Yes — and it is more valuable here than at AutoTrader, for the opposite reason.** AutoTrader users save searches because 450,000 results are overwhelming. Autosouq users would save a search because **10 results are not enough** — the honest answer to most early searches is "not yet". A saved search converts the launch inventory problem from a bounce into a returning user, and it is the only ethical way to handle a near-empty catalogue.
- **Adapted version:** **do not build account-based saved searches with email.** Build **"Tell me on WhatsApp when a car like this is listed"** — capture the current filter state plus a WhatsApp number, and notify via a manually-operated broadcast at first. This fits the market (WhatsApp is the channel), fits the brand (a friend who texts you when something turns up), and needs no login, no email deliverability work and no push infrastructure. Be explicit about frequency and give a one-word opt-out.
- **Priority:** **Must-have for launch — this is the single highest-value adaptation in this document.** With ~10 listings, capturing intent is worth more than converting it.
- **Implementation notes:** requires the URL-state work above (the saved search *is* the URL). A `POST` to a CMS collection storing `{ query, msisdn, locale, createdAt }`. `apps/web/lib/whatsapp.js` already has `normalizeOmaniMsisdn()` with `/^968[79]\d{7}$/` validation — reuse it for the capture field so bad numbers are rejected at entry. Surface the CTA in the zero/low-result state (§8) and at the bottom of every results page. **Do not** send automated messages before you have a documented consent string and an opt-out; WhatsApp Business policy and basic decency both require it.

---

**Pattern: paid-placement disclosure ("Ads may appear higher in results based on popularity, quality and paid-for visibility").**

- **User need it serves:** understand why this order, and trust that it is not arbitrary.
- **Does the need exist for Autosouq?** Yes — **and this is a place to beat AutoTrader rather than match it.** The `featured` flag already exists in the data model (`data/cars.js`, rendered as a green "Featured" pill on every card). A "Featured" badge with no explanation is exactly the pattern that makes OpenSooq feel rigged.
- **Adapted version:** either (a) do not sell or use placement at launch and say so — "Results are sorted by newest first. We do not sell position." — or (b) if `featured` is used, label it plainly ("Promoted — إعلان مموّل") and explain it in one line. Do not use a positive-sounding word like "Featured" for a paid slot.
- **Priority:** **Must-have** (it is one string plus a decision).
- **Implementation notes:** the `featured` pill is rendered inline in all five `Cars*.jsx` files (e.g. `Cars2.jsx`, the `flag-tag success` list item). Another reason to extract a single card component first.

---

## 2. The listing card

### 2.1 What was observed

A results card at the £5,000–£6,000 end, transcribed in order ([car-search?price-to=6000](https://www.autotrader.co.uk/car-search?postcode=M15%204FN&price-to=6000)):

```
[photo]
Vauxhall Mokka X 1.4i Turbo Elite Nav Euro 6 (s/s) 5dr        £5,950
1.4i Turbo Elite Nav Euro 6 (s/s) 5dr
Elite Nav - Great History              ← seller's own attention-grabber line
Lower price                            ← price indicator badge
64,402 miles
2017 (17 reg)
Derby (50 miles)
4.2                                    ← dealer review score
Reserve online
```

At the very cheap end (`sort=price-asc`, sub-£300 cars), the same card renders quite differently:

```
Private seller                         ← seller-type label, prominent
Nissan Micra 1.2 16v S 3dr             £250
63,000 miles | 2003 (53 reg)
Olney (112 miles)
(no price indicator, no rating, no Reserve online)
```

Other observed card states: a **"SOLD"** badge on a still-listed car; an **"Ad"** label on sponsored placements; **"Reserve online"** on dealer stock only.

**The hierarchy is: photo → identity (make/model/derivative) → price → seller's hook → market judgement → wear (miles) → age → place → seller credibility → transaction affordance.**

**What is deliberately absent from the card:** seller name, seller photo, phone number, description body, engine/spec detail beyond the derivative string, and any contact button. Contact requires opening the detail page. That is a deliberate funnel: AutoTrader monetises the detail page and the dealer lead, so the card's only job is to earn a click.

**The derivative string is doing enormous work** — "1.4i Turbo Elite Nav Euro 6 (s/s) 5dr" encodes engine, fuel, trim, emissions standard and door count in one line, because UK buyers can read it. It is generated from a national vehicle database keyed off the registration plate, not typed by the seller.

### 2.2 Judgement for Autosouq

**The single most important divergence: AutoTrader's card is optimised to earn a click; Autosouq's card should be optimised to earn a WhatsApp tap.** AutoTrader withholds contact from the card because the detail page is where the money is. Autosouq's stated promise is "one WhatsApp tap to the seller" — putting the WhatsApp button on the card is *correct here and would be wrong there*. The codebase already does this (`WhatsAppButton` renders in all five `Cars*` card layouts). **Keep it. Do not be talked out of it by AutoTrader's counterexample.**

**The derivative-string pattern does not transfer, and trying to fake it would be actively harmful.** There is no Omani equivalent of the DVLA-keyed derivative lookup, so any equivalent string would be seller-typed free text — which is precisely how OpenSooq listings become "2015 Corolla GCC FULL OPTION ORIGINAL PAINT" noise. Autosouq should instead render a **small number of structured, verified-shape facts**: km, year, transmission, import origin. The existing `SpecChips.jsx` (max 4 chips, each rendered only when the value exists, returns `null` when empty) is the right instinct and better suited to this market than AutoTrader's derivative line.

**Card density on mobile.** AutoTrader shows a large photo per card. At OMR 1,500–6,000 the photo is doing more work than anywhere else on the site — it is the primary condition signal, since there is no MOT history to fall back on. Do not shrink it to fit more cards. But see §5 on weight: a large photo per card is the main data cost of the results page, and Autosouq currently ships those photos **unoptimised**.

**The "Private seller" label reads differently in each market.** On AutoTrader, "Private seller" is a *caution* label — it means no dealer warranty, no reviews, no price indicator, no Reserve online. On Autosouq, where **every** seller is private, the label carries no information and should not be shown. What should be shown is the verification state, which is the information the buyer actually lacks.

### 2.3 Recommendations — the listing card

---

**Pattern: a fixed, scannable field order, price adjacent to identity.**

- **User need:** compare ten cards in ten seconds without re-reading.
- **Exists for Autosouq?** Yes, unchanged.
- **Adapted version — proposed Autosouq card order:**
  1. Photo, with photo-count badge and **year** in the corner (both already present)
  2. **Title** (year + make + model)
  3. **Price**, large, with OMR — and, for 1,000–1,499, the **"Sold as-is"** pill immediately beside it, never below the fold of the card
  4. **Import-origin pill** (GCC / US import / not stated)
  5. **km · transmission** — the two facts that answer "how worn, how easy to drive"
  6. **City**
  7. **Verification state** ("Autosouq checked this listing" / "Not checked yet")
  8. **WhatsApp button**
- The current order in `Cars2.jsx` places the body type first as muted text and the price *below* the spec row. **Move price up, directly under the title.** Price is the entry criterion on a price-banded site; burying it under a spec row inverts the hierarchy.
- **Priority:** **Must-have.** Reordering existing JSX; no new data.
- **Implementation notes:** there is **no extracted card component** — the markup is duplicated across `Cars1.jsx`, `Cars2.jsx`, `Cars3.jsx`, `Cars4.jsx`, `Cars5.jsx`, and `Cars5` additionally uses a raw `<img>` where the others use `next/image`. **Extract `apps/web/components/carsListings/ListingCard.jsx` before making any card change.** Everything else in this section assumes that has happened.

---

**Pattern: the empty author row.**

- **Observed problem, not an AutoTrader pattern:** every Autosouq card renders an author row bound to `car.authorName` / `car.authorImage`, both of which are `null` on every record by deliberate policy (`data/cars.js`: inventing a seller "is the one thing we must never do"). The policy is right; the leftover markup is not — it renders an empty row on every card.
- **Adapted version:** delete the author row from the card. Replace the space with the verification chip, which is the credibility signal that actually exists.
- **Priority:** **Must-have** — it is a visible defect.

---

**Pattern: status badges on the card ("SOLD", "Ad", "Reserve online").**

- **User need:** don't waste a tap on a car that is gone.
- **Exists for Autosouq?** **Yes for "sold"; no for the others.** In a low-trust market, stale listings are one of the top complaints about OpenSooq — you message a number and the car went months ago. AutoTrader's willingness to keep showing a car marked **SOLD** rather than silently removing it is worth copying: it proves cars actually sell here.
- **Adapted version:** the model already has `listingStatus` (defaulting to `"available"` in `lib/strapi.js`). Render a **"Sold — تم البيع"** state that greys the card, **hides the WhatsApp button** (do not send someone to a seller who has nothing to sell), and keeps the listing visible for a bounded period. With 10 listings, a visible "sold" card is evidence of a working marketplace, not an embarrassment.
- **Priority:** **Later** — needs the sold-marking flow to exist first, but design the card state now so it is not retrofitted.

---

**Pattern: a per-card "attention grabber" line of seller free text.**

- **User need (AutoTrader's):** let dealers differentiate identical stock.
- **Exists for Autosouq?** **No — reject.** The observed examples are `"SH|H-STS|W-RANTY|S-NV"` and `"3 OWNERS-LAST OWNER 2021 - FSH"`. This is compressed dealer shorthand that only works for a fluent UK buyer, and on a small site it becomes an all-caps shouting match — exactly the OpenSooq texture Autosouq exists to escape. Keep seller free text on the detail page only, where it has room to be a sentence.
- **Priority:** **Skip.**

---

## 3. The detail page

### 3.1 What was observed

**Private-seller listing** — 2014 Audi A1, £5,900, Sheffield ([car-details/202607244493495](https://www.autotrader.co.uk/car-details/202607244493495)); cross-checked against a 2012 BMW 1 Series, £5,250, private seller, Lewisham ([car-details/202607244493362](https://www.autotrader.co.uk/car-details/202607244493362)). Order top to bottom:

1. **Gallery** — with an in-image counter, observed as **"5/9"**
2. **Title** — "2014 Audi A1 1.6 TDI Sport Euro 5 (s/s) 3dr" + location
3. **Price block** — "£5,900", then a **"Get it on finance"** module
4. **Overview / key specs**, in this order: Mileage (**tagged "Lower mileage"**) · Registration (2014, 14 reg) · Fuel type · Body type · Engine · Gearbox · Doors · Seats · Emission class · Body colour
5. **Description** — the seller's own text. Both observed listings volunteered condition and paperwork facts unprompted: *"2 previous owners, last 5 years lady owner"*, *"MOT TILL JANUARY 2026, full service History"*, *"Drives like a dream"*; and on the BMW, *"minor scratches and a bit of damage to the alloys"* alongside *"3 owners"* and *"MOT valid until March 2027"*.
6. **Seller block** — labelled **"Private seller"**, with **"Message"** and **"Call (0114) 4886438"**, and the disclosure **"Seller's number has been protected."**
7. **Insurance for 2014 Audi A1**
8. **Before you buy**
9. **Expert reviews for the 2014 Audi A1**
10. **Buying a car safely**
11. **Monthly finance price example**
12. Footer

**Dealer listing** — 2018 Vauxhall Astra, £5,895, The Car Shop, Rochester ([car-details/202604241838744](https://www.autotrader.co.uk/car-details/202604241838744)). Same skeleton, different transaction layer: CTAs in sequence are **"Reserve now"** (refundable £99) → **"Build a deal"** → **"Contact seller"**, plus the finance calculator and dealer identity.

**Observations worth isolating:**

- **The mileage figure carries a comparative tag** — "Lower mileage" — inside the spec grid. AutoTrader does not just state the number, it tells you what the number *means* relative to comparable cars. This is a genuinely clever, cheap-feeling pattern.
- **Number masking is disclosed at the point of contact**, not buried in a policy page. "Seller's number has been protected" appears next to the call button.
- **Three contact CTAs on a dealer page, two on a private page.** The private page is markedly simpler.
- **Description is unstructured free text and is where the real trust content lives** — MOT expiry, owner count, known damage. AutoTrader collects none of this as structured data for private sellers, so buyers must read prose to find it.

### 3.2 Judgement for Autosouq

**The section order is broadly right and Autosouq already follows most of it.** `CarDetails1.jsx` runs Gallery → scrollspy nav → Description → Car overview → Features → Location, with a sidebar of spec chips + price + trust signals → seller contact → report link → recommended. The one structural disagreement: **AutoTrader puts specs above description; Autosouq puts description above specs.** AutoTrader is right here. At OMR 1,500–6,000 with no history data, the buyer's first three questions are km, year and spec — all structured — and the description is the seller's voice, which is valuable but slower to read. **Move "Car overview" above "Description".**

**The "Lower mileage" comparative tag is the most transferable idea on the detail page — with one hard caveat.** The user need ("is 180,000 km a lot for a 2013 Corolla?") is *stronger* in Oman than in the UK, because expat first-time buyers often have no reference frame for Omani mileage norms (long highway distances mean numbers that would be alarming in Europe are ordinary here). **But AutoTrader's tag rests on real comparison data.** Autosouq has ~10 listings and cannot compute a comparative percentile without fabricating one. Do not ship "Lower mileage" as a computed badge. **What would be required to earn it:** a corpus of a few hundred sold-or-listed cars with make/model/year/km, or a licensed local dataset. Until then, the honest version of the same need is a **plain factual line, not a judgement** — e.g. "180,000 km · about 15,000 km per year" (arithmetic from year and km, no external data, always true). That gives the buyer a frame without pretending to a market comparison.

**AutoTrader's biggest structural weakness is Autosouq's biggest opportunity.** The trust-critical facts on the private-seller pages — MOT expiry, owner count, known damage — are buried in unstructured prose. Autosouq should collect those as **structured fields** and render them in the overview grid. In this market the equivalents are: **mulkiya (registration) expiry**, **import origin**, **number of owners**, **known faults**, and **whether the car is under bank lien (مرهونة)**. See §4.

### 3.3 Recommendations — the detail page

---

**Pattern: specs before prose; a fixed key-spec grid.**

- **User need:** answer the three qualifying questions before investing in reading.
- **Exists for Autosouq?** Yes, strongly.
- **Adapted version:** in `CarDetails1.jsx`, swap the order so `Overview` precedes `Description`. Reorder `Overview.jsx`'s current grid (Condition · Cylinders · Fuel · Doors · Year · Colour · Seats · Transmission · Engine size · Drive type) to lead with what matters here: **Kilometres · Year · Import origin · Condition · Transmission · Cylinders · Colour · Doors · Seats · Drive type**. Note that `Overview.jsx` currently does not show kilometres at all — it is in `SpecChips` only. For the single most important fact at this price band, that is the wrong placement; it should be in both.
- **Priority:** **Must-have.** Pure reordering plus one added row.
- **Implementation notes:** `apps/web/components/carDetails/CarDetails1.jsx` (section sequence), `apps/web/components/carDetails/detailComponents/Overview.jsx` (grid contents; it already has a `const v = (value) => value ?? "—"` fallback, which is the right treatment for missing data — an em dash is honest, a blank is ambiguous).

---

**Pattern: contextualise the headline number rather than just stating it.**

- **User need:** "is this a lot of kilometres?"
- **Exists for Autosouq?** **Yes, more than at AutoTrader** — expat buyers lack an Omani reference frame.
- **Adapted version:** **not** a comparative badge (no data). A derived, arithmetically-true annotation: `km / (currentYear − year)` → "≈ 15,000 km per year". Optionally a two-word neutral gloss keyed to fixed, published thresholds you are willing to state openly (e.g. under 12,000/yr = "light use") — but **only if the thresholds are documented on the page**, not presented as a market comparison. If in doubt, ship the number alone.
- **Priority:** **Later** — high value, but only after the honest-framing decision is made deliberately. Do not let it ship as a fake "Great mileage" badge.
- **Implementation notes:** a pure function in `apps/web/lib/format.js` alongside `formatPrice`; render in `Overview.jsx`. Guard against `year` missing or in the future.

---

**Pattern: one primary contact CTA on a private-seller page, plus a disclosed protection.**

- **User need:** reach the seller now, without exposing yourself.
- **Exists for Autosouq?** Yes — and Autosouq's version is already better than AutoTrader's, because "one WhatsApp tap" beats "Message" + "Call". The current implementation is strong: `WhatsAppButton` renders `null` when there is no usable number (no dead `#` links), `listingEnquiryMessage()` prefills the car, **the listed price**, and the listing URL, and `StickyContactBar` gives a mobile-fixed price + WhatsApp + optional `tel:` row with a 48px target.
- **Adapted version — what to add:** AutoTrader's **disclosure at the point of contact** is missing. Next to the WhatsApp button, one line in the buyer's language explaining what happens: e.g. "Opens WhatsApp with this car's details. Autosouq does not see your chat." — أو ما يعادلها بالعربية. In a market defined by scam anxiety, telling the user exactly what the button does before they tap it is worth more than any badge.
- **Priority:** **Must-have** — one string, large trust return.
- **Implementation notes:** `apps/web/components/carDetails/detailComponents/ProfileInfo.jsx` (the "Contact the seller / تواصل مع البائع" block) and `apps/web/components/common/WhatsAppButton.jsx`. Do **not** duplicate the line into `StickyContactBar.jsx` — sticky bars should carry action only.

---

**Pattern: prefilling the enquiry with the listed price.**

- Already implemented in `lib/whatsapp.js`, and it deserves calling out as **the strongest single trust mechanic in the codebase**. Putting the listed price into the seller's own WhatsApp thread makes "the price you see is the real price" self-enforcing: a seller who quotes a different number is contradicting a message they are looking at. AutoTrader has nothing equivalent, because its contact is generic.
- **Recommendation:** protect this. Any redesign of the contact flow must keep the price and the listing URL in the prefilled text. Consider adding the listing ID so disputes are traceable.
- **Priority:** **Must-have (preserve).**

---

**Pattern: "Report this listing".**

- **User need:** a way to flag a scam — which is the whole reason this audience distrusts incumbents.
- **Exists for Autosouq?** **Yes, critically.** It currently exists in `CarDetails1.jsx` as **static text with no handler** — a promise with nothing behind it, which is worse than absent.
- **Adapted version:** make it work, in the cheapest possible way. A `mailto:` or a WhatsApp link to the Autosouq operations number with the listing ID prefilled is sufficient at launch and requires no backend. Reply to every report. At ~10 listings you can moderate by hand, and doing so visibly is the entire product.
- **Priority:** **Must-have for launch** — a non-functional report link on a trust-led site is a credibility hole.

---

## 4. Trust mechanics — the section that matters most

### 4.1 What AutoTrader actually does

**(a) Price indicator — five tiers.** Labels: **Lower price · Great price · Good price · Fair price · Higher price**. Definitions, verbatim from the help centre: a *Great price* means "this car is priced slightly lower than most other cars of a similar type in the UK right now"; *Good price* "priced very closely to most other cars"; *Fair price* "slightly higher"; *Higher price* "more expensively than other cars of a similar type". Sources: [What does 'Great price' mean?](https://help.autotrader.co.uk/hc/en-gb/articles/9831680616477-What-does-Great-price-mean), [Good](https://help.autotrader.co.uk/hc/en-gb/articles/9831718888733-What-does-Good-price-mean), [Fair](https://help.autotrader.co.uk/hc/en-gb/articles/9831756983453-What-does-Fair-price-mean), [Higher](https://help.autotrader.co.uk/hc/en-gb/articles/9832184721565-What-does-Higher-price-mean).

It is computed by comparing the advertised price to an AutoTrader valuation derived from "data from millions of vehicles", using **make, model, age, fuel type, and optional extras**. It explicitly **excludes condition, colour, and local supply and demand**. Flags can change daily as market data moves.

**This is the finding that matters most, and it is a negative one.** Per [Why do I have a Price Indicator on my advert?](https://help.autotrader.co.uk/hc/en-gb/articles/19212037724957-Why-do-I-have-a-Price-Indicator-on-my-advert), AutoTrader shows **no indicator at all** ("No analysis") for, among others:

- cars **priced under £1,500**
- cars **over 15 years old**
- **imports**
- **written-off vehicles** (Cat C/D/S/N)
- **private-seller listings**
- rare/classic cars, or anywhere valuation data is insufficient

Confirmed by observation: sorting by ascending price returns cards at £75, £250, £299, £300 — **not one of which carries a price indicator**, while £5,000–£6,000 dealer cards carry them consistently.

**Read that list against Autosouq's inventory.** Old, imported, privately sold, and — at the OMR 1,000–1,499 "sold as-is" tier — around the £1,500 sterling exclusion line. **AutoTrader, with the best used-car pricing data in Europe, declines to price-rate exactly the kind of car Autosouq sells.** That is not a gap in their product; it is a considered judgement that the data does not support a claim at that end of the market. Autosouq must reach the same conclusion faster and with far less data.

**(b) Free five-point check on every listing.** "All vehicles listed on Autotrader undergo a free, five-point car check" covering whether a car has been **stolen, scrapped, written off, imported, or exported** ([vehiclecheck](https://www.autotrader.co.uk/vehiclecheck)). Marketed on the used-cars landing page as "Every car undergoes a basic history check" ([cars/used](https://www.autotrader.co.uk/cars/used)).

**(c) Paid Vehicle Check — £5.95.** A "27 point independent report": reported stolen, insurance write-off, outstanding finance, import/export status, mileage history, colour changes, previous owner count, risk of third-party trace, plus full spec and VIN confirmation. Backed by an **"Up to £30,000 data guarantee"**, "over 27,000 checks completed per month", drawing on "the police database, DVLA, insurance companies and finance houses".

**(d) Dealer reviews.** Numeric scores on cards and detail pages (4.2, 4.8, 5.0). Site-level, a Trustpilot score of **"4.6/5 … based on 108,424 reviews"** on the used-cars landing page.

**(e) Number masking, disclosed inline.** A free **"Hide your number"** service for private sellers, surfaced to buyers at the point of contact as **"Seller's number has been protected."** ([how-to-spot-and-avoid-potential-scams](https://www.autotrader.co.uk/content/advice/how-to-spot-and-avoid-potential-scams))

**(f) Keep-it-on-platform messaging.** "Keep your communications through our platform where possible", with the rationale that platform messages are documented and monitored.

**(g) Published scam taxonomy.** Named scam types with warning signs and countermeasures: phishing/SMiShing, canvassers, the PayPal overpayment scam, fake shipping fees. Concrete advice: "Never handover your car keys"; "Don't include phone number in advert description"; verify cleared funds before releasing keys; meet at a bank to check cash. Plus a named security team and address (`customersecurity@autotrader.co.uk`), operating seven days a week.

**(h) Explicit ranking disclosure** — the paid-visibility line in §1.

### 4.2 The Oman analogue: what exists, what does not

**There is no DVLA, no MOT database, no HPI, and no national write-off register accessible to a marketplace.** Nothing in category (b) or (c) is directly buildable. What Oman does have:

| UK mechanism | Oman analogue | Available to Autosouq? |
|---|---|---|
| MOT history | **Mulkiya (بطاقة الملكية / ROP registration card)** with a printed expiry; renewal requires passing the ROP technical inspection (الفحص الفني) | **Not as a data feed.** Available as a **document the seller can photograph.** |
| Outstanding finance (HPI) | **Bank lien recorded against the vehicle (مرهونة)** — a lien-encumbered car cannot legally transfer at ROP | **Not as a feed. Available as a seller declaration**, and verifiable at the ROP transfer counter. |
| Number of owners | Recorded at ROP; not publicly queryable | Seller declaration only |
| Write-off / Cat S/N | No equivalent public register | **Not available. Do not imply otherwise.** |
| Import status | **GCC spec vs US/Japan import** — the single most consequential fact in this market | **Partially derivable from the VIN** — see below |
| Valuation data | No published Omani transaction dataset | **Not available at launch** |

**The VIN is the one genuinely verifiable signal Autosouq can compute today.** The first character of a VIN is the region of manufacture (WMI): `1`, `4`, `5` = United States; `2` = Canada; `3` = Mexico; `J` = Japan; `K` = South Korea; `W` = Germany; `S` = United Kingdom; `V` = France/Spain; `Y`/`Z` = other Europe. `AddListing.jsx` already collects a `VIN` field.

**Be precise about what this does and does not prove.** The WMI gives the **country of manufacture, not the market the car was specified for**. A GCC-spec Land Cruiser is built in Japan and starts with `J`; so does a Japanese-auction import. So the VIN **cannot confirm** "GCC spec". What it **can** do is detect a specific, high-value **contradiction**: a seller who states "GCC spec" on a car whose VIN begins `1`, `4` or `5` is describing a US-built vehicle. US-built cars sold in the region are overwhelmingly US imports — the "salvage-title Camry re-registered in Oman" problem that this audience is most exposed to. That contradiction is worth flagging **for human review before publication**, not auto-badging on the public page.

This is the correct shape of a trust feature for a site with no data: **cheap, deterministic, honest about its limits, and used to trigger a human check rather than to manufacture a claim.**

### 4.3 Recommendations — trust

---

**Pattern: a price indicator ("Great price" / "Fair price").**

- **User need:** "am I being ripped off?" — the number one anxiety of a first-time cash buyer in a low-trust market.
- **Exists for Autosouq?** **The need: yes, more intensely than anywhere on AutoTrader. The feature: no. REJECT for launch.**
- **Rationale, stated plainly:** AutoTrader computes this from millions of transactions and *still refuses to compute it* for old cars, imports, private sales and sub-£1,500 cars — i.e. for Autosouq's entire catalogue. With ~10 listings, any price rating would be a number invented to look authoritative. That is precisely the OpenSooq behaviour Autosouq exists to oppose. **Do not build it, do not stub it, do not seed it with estimates.**
- **What would be required to earn it later:** a few hundred *completed sale* prices (not asking prices) with make/model/year/km/spec, gathered over enough months to be current — plus, critically, **separate curves for GCC-spec and US-import cars**, since the spread between them is large and market-specific. Asking prices alone would bake in exactly the inflation the site exists to expose. Realistically 12+ months of operation, or a licensed local dataset.
- **The honest interim substitute — build this instead:** show the buyer the comparison set rather than a verdict. On the detail page, a link: **"See other [2014 Toyota Corolla] listings on Autosouq"** — a filtered search on make/model/±2 years. With three comparable cars this is genuinely useful and makes **zero** claims. When the corpus grows, this same surface becomes the natural home for a real indicator. Where there are no comparables, show nothing (`Recommended.jsx` already returns `null` when empty — the right instinct).
- **Priority:** **Must-have** for the comparison link (it is a `Link` with querystring params, and it falls out of the URL-state work for free). **Skip** the indicator itself.

---

**Pattern: a verification badge backed by a stated check.**

- **User need:** "is this listing real?"
- **Exists for Autosouq?** **Yes — this is the core proposition.** The mechanism already exists: `verified` in the data model, rendered by `ProfileInfo.jsx` as "Autosouq checked this listing / تحقّقنا من هذا الإعلان" versus "We haven't checked this listing yet". The wording already names the actor, which is right — "Verified" alone is a word OpenSooq has drained of meaning.
- **What is missing, and what AutoTrader does better:** AutoTrader **publishes what the check consists of** — "a free, five-point car check" covering stolen, scrapped, written off, imported, exported. Autosouq says a check happened but not what it was. **A badge without a published definition is the same badge the competitors use.**
- **Adapted version:** publish an Autosouq check list and link the badge to it. A defensible launch-stage list, all of which is doable by hand at 10 listings:
  1. Spoke to the seller on the phone
  2. Seller's WhatsApp number is a live Omani mobile
  3. Photos are of this car (not stock or reused images — a reverse-image check)
  4. **Mulkiya sighted**, and the plate/VIN matches the listing
  5. Stated import origin does not contradict the VIN
  6. Price is the seller's real asking price
- Every item must be true or the badge does not go on. Where you have not checked, the existing amber "not checked yet" is the correct and honest state — **do not** default listings to verified.
- **Priority:** **Must-have for launch.** This is the product.
- **Implementation notes:** `ProfileInfo.jsx` (badge) → new `/how-we-check` page under the `(info)` route group, which already has `InfoShell` + `BulletList` components for exactly this shape of page. Add the link to the badge itself so it is discoverable at the moment of doubt.

---

**Pattern: seller-declared documents surfaced as structured fields (the MOT analogue).**

- **User need:** "is the paperwork clean, and can I actually register this car?"
- **Exists for Autosouq?** **Yes — and it is currently unanswered anywhere on the site.** Note that AutoTrader's own private sellers volunteer this in free text unprompted ("MOT TILL JANUARY 2026, full service History"), which is strong evidence that the need is real even where the platform does not structure it.
- **Adapted version:** collect and display, as structured fields:
  - **Mulkiya valid until [month/year]** — the direct MOT analogue; the single most useful paperwork fact at this price band, because an expired mulkiya means an inspection and possible repairs before the buyer can drive it
  - **Under bank lien? (مرهونة)** yes/no — the outstanding-finance analogue; a lien blocks transfer entirely
  - **Number of owners** (optional)
  - **Known faults** (free text, prompted — see §6)
- **Label all four unambiguously as seller-declared**, e.g. "Seller says: mulkiya valid to March 2027 / حسب البائع". The distinction between *checked by Autosouq* and *stated by the seller* must be visible and consistent — the codebase already has exactly this vocabulary in `lib/listingLabels.js` (`importOriginLabel()` returns `{ text, stated }`, and *withheld* information gets amber while *stated* information gets neutral grey). **Extend that same convention to these fields rather than inventing a second one.**
- **Priority:** **Must-have** for mulkiya expiry and lien; **later** for owner count.
- **Implementation notes:** new fields in the Strapi listing model, mapped in `lib/strapi.js#toCar()`, collected in `AddListing.jsx` (§6), rendered in `Overview.jsx`. Consider requiring a **photo of the mulkiya for the verification check** — visible to the Autosouq operator, never published (it carries the owner's personal details and ID number). Publishing it would be a data-protection failure and a gift to identity thieves.

---

**Pattern: VIN-derived contradiction check on import origin.**

- **User need:** "is this really GCC spec, or is it a US import being passed off?" — named in NICHE.md as the differentiator.
- **Exists for Autosouq?** Yes, acutely.
- **Adapted version:** on submission, decode the VIN's first character. If the seller selected **GCC spec** and the VIN begins `1`, `4` or `5` (US-built), **hold the listing for manual review** and ask the seller to confirm. Do not auto-reject (there are legitimate edge cases), do not auto-badge, and **do not publish a "VIN verified" claim** — the WMI proves country of build, not market spec, and claiming more would be the exact overreach this site exists to avoid. Also validate VIN length (17 characters) and reject `I`, `O`, `Q`, which never appear in a VIN — a cheap typo catch.
- **Priority:** **Later** (needs a submit path — see §6) but **design the field validation now**, since `AddListing.jsx` already has the VIN input.
- **Implementation notes:** a pure `lib/vin.js` with `wmiRegion(vin)` and `contradictsStatedOrigin(vin, importOrigin)`. Server-side/CMS lifecycle, not client-side — a client check is trivially bypassed. `apps/cms` already runs price-band enforcement in a lifecycle hook; this belongs beside it.

---

**Pattern: number masking.**

- **User need (AutoTrader's):** protect private sellers from canvassers and phishing.
- **Exists for Autosouq?** **The need exists; the pattern conflicts with the proposition — think carefully before adopting.** Autosouq's entire differentiator is *one WhatsApp tap to the seller*. Masking inserts a relay and breaks that. The seller-protection need is real (published numbers do attract spam), but the cost here is the core promise.
- **Adapted version:** **do not mask at launch.** Instead: (1) adopt AutoTrader's *disclosure* discipline — tell the buyer what tapping does (§3.3); (2) tell the **seller**, in `AddListing.jsx`, plainly, that their WhatsApp number will be public, before they type it, so the choice is informed; (3) revisit only if spam becomes a measured complaint, and revisit via *seller-controlled* options (e.g. "show my number only to buyers who message first"), never by default.
- **Priority:** **Skip at launch; revisit on evidence.**

---

**Pattern: a published scam taxonomy and a named safety contact.**

- **User need:** "how do I not get robbed?" — the defining anxiety of this audience.
- **Exists for Autosouq?** **Yes, and this is the highest value-to-cost item in the entire document.** It is prose. It needs no backend, no data, no schema change, and it is *exactly* the brand voice: a knowledgeable, honest friend telling you what to watch for at the souq.
- **Adapted version:** an Oman-specific safety page, in Arabic and English, covering the scams this market actually runs — not AutoTrader's UK list (PayPal overpayment and fake export shipping are not the Omani threat model). Cover instead: **deposit-before-viewing requests**; **"the car is in another city/country, send money and I'll ship it"**; **prices well below the band with a pressure story**; **sellers who refuse to show the mulkiya**; **cars under lien sold without disclosure**; **odometer tampering**; **US-import salvage rebuilt and sold as GCC spec**. Practical, concrete instructions: view in daylight in a public place; bring someone; take the car to a workshop for a pre-purchase inspection (فحص) and expect the seller to allow it; **complete the transfer at the ROP counter and pay only when the mulkiya is in your name**; never transfer money before seeing the car.
- Add a **named, monitored contact** for reporting a listing (WhatsApp is right for this audience) and wire the "Report this listing" link to it (§3.3).
- **Priority:** **Must-have for launch. Do this in week one.**
- **Implementation notes:** `apps/web/app/(info)/` — a new route beside `/how-it-works` and `/sell-your-car`, using the existing `InfoShell` + `BulletList`. Link it from the detail page next to the WhatsApp button (AutoTrader places "Buying a car safely" on every detail page — copy that placement discipline, not the content) and from the footer. **This page is a genuine differentiator versus OpenSooq/Dubizzle** and is also durable SEO for high-intent queries.

---

**Pattern: seller/dealer reviews and star ratings.**

- **User need:** "has this seller behaved before?"
- **Exists for Autosouq?** **The need yes; the pattern no — REJECT for launch.** Reviews require repeat sellers. Private sellers sell one car and leave; there is no second transaction to review. AutoTrader shows ratings only on **dealer** listings — the observed private-seller pages carry none. A review widget with no reviews, or with a handful of solicited ones, is worse than nothing. `data/testimonials.js` is already deliberately empty with a documented refusal to ship fabricated reviews — that judgement is correct and should extend here.
- **The substitute:** the platform vouches, not the crowd. That is what the verification badge is for.
- **Priority:** **Skip.**

---

**Pattern: paid vehicle history check (£5.95) as a revenue line.**

- **User need:** independent verification.
- **Exists for Autosouq?** The need yes; the product cannot exist — there is no data source to sell. **Do not build a paid check.**
- **The genuine local analogue is physical, not digital:** a **pre-purchase workshop inspection**. If Autosouq ever monetises trust, that is the direction — a short list of named, vetted garages in Muscat/Sohar/Salalah who will inspect a car for a fixed fee, surfaced on the detail page as "Get this car checked before you buy". This is real, matches the market, and requires partnerships rather than data. But it needs relationships you do not have on day one.
- **Priority:** **Later.** Worth mentioning as a "before you buy" link even at launch — pointing at generic advice costs nothing.

---

## 5. Mobile UX

**Evidence warning: this section is substantially inference.** The proxy returns a desktop render as text. What I can state as observed: a combined **"Filter and sort"** control carrying an applied-filter count; an in-gallery counter (**"5/9"**); **"Load previous results"** on paginated pages; and an Android app with 10m+ installs, a 4.8 rating from 105k reviews, last updated **14 July 2026**. Everything about positioning, stickiness and gesture is inferred from those labels and from general knowledge of the category, and **should be verified on a device before being cited to anyone**.

**The asymmetry that governs this section:** AutoTrader requires JavaScript and cookies to render at all (its bot wall returns "Enable JavaScript and cookies to continue"), ships a heavy client bundle, and serves a UK audience on cheap, fast, largely unmetered mobile data. **Autosouq's audience is on budget Android over metered data.** Weight AutoTrader can absorb, Autosouq cannot. Every pattern below is judged against that.

### 5.1 Recommendations — mobile

---

**Pattern: a single "Filter and sort" entry with an applied-count badge.**

- **User need:** filters must not eat the results on a small screen; you must be able to see at a glance that filters are active (a hidden filter that returns nothing is a classic dead end).
- **Exists for Autosouq?** Yes.
- **Adapted version:** Autosouq already has the offcanvas (`FilterSidebar.jsx`, titled "Filters and Sort" — the same combined concept). **What is missing is the count badge.** Add "Filters (2)" on the trigger, and render **removable chips** for applied filters above the results so a user can undo one without reopening the panel. This is the mobile equivalent of AutoTrader's pinned "Up to £6,000" filter state.
- **Priority:** **Must-have.** With 10 listings, a forgotten active filter is the difference between three results and zero — the failure mode that matters most at launch.
- **Implementation notes:** derive the count from the reducer state versus `createInitialState`. The offcanvas trigger lives in the `Cars*` toolbars; the chips row belongs above the grid in the extracted card list.

---

**Pattern: sticky bottom contact bar.**

- **User need:** contact without scrolling back up, from anywhere on a long page.
- **Exists for Autosouq?** Yes — and it is **already implemented and correct**: `StickyContactBar.jsx` is `d-lg-none position-fixed bottom-0`, `zIndex: 1030`, `paddingBottom: max(0.75rem, env(safe-area-inset-bottom))`, 48px minimum targets, price + signals on row one and WhatsApp + `tel:` on row two. The safe-area handling and the 48px targets are better than most production sites.
- **Recommendation:** verify it does not occlude the last section of page content (add matching bottom padding to the page container) and that it does not cover the footer's final row. Keep it action-only; do not add the disclosure line here.
- **Priority:** **Must-have (verify, do not rebuild).**

---

**Pattern: image weight.**

- **This is the most serious mobile problem in the codebase and AutoTrader offers no cover for it.** `next.config.mjs` sets **`images: { unoptimized: true }`**, and no `sizes` prop is passed anywhere. Every card therefore ships the full-resolution source image to a phone that will display it at ~350px wide. On a results page of 12 cards over metered data, that is the whole page budget spent on pixels the user cannot see.
- **Adapted version:** enable the Next image optimizer (or a build-time resize pipeline if the deploy target lacks a loader), pass `sizes` on every card image, and serve WebP/AVIF. Set an explicit quality target and a per-image byte budget. Given the audience described in NICHE.md, this is not a performance nicety — it is a cost imposed on people paying for data by the megabyte.
- **Priority:** **Must-have for launch.** Highest value-to-cost ratio of any technical change here.
- **Implementation notes:** `apps/web/next.config.mjs`; then `sizes` in the extracted `ListingCard.jsx` and in `sliders/Slider1.jsx`. Also fix `alt="image"` — hardcoded on every card photo in `Cars1`–`Cars4` — to a real description; `data/cars.js` already carries `imageAlt` per record and `gallery.js` already uses it. Also normalise `Cars5.jsx`, which uses a raw `<img>`.

---

**Pattern: gallery with a position counter.**

- **User need:** know how many photos there are and where you are — at this price band, photos are the primary condition evidence, so a buyer will look at all of them.
- **Exists for Autosouq?** Yes.
- **Adapted version:** `Slider1.jsx` (Swiper + PhotoSwipe lightbox) shows prev/next arrows only when `images.length > 1` and returns `null` when there are none — both correct. **Add the "3 / 9" counter** in the corner. On a small screen, arrows alone do not tell you how much is left.
- One caution on weight: **PhotoSwipe plus Swiper is a lot of JavaScript for a gallery.** Verify it is not in the shared bundle and is loaded only on detail pages. Consider whether a native CSS scroll-snap carousel would do the job at a fraction of the cost — swipe, snap, and a counter are all achievable in CSS. This is worth measuring before launch.
- **Priority:** **Must-have** for the counter; **later** for the library reassessment (but measure now).

---

**Pattern: "Load previous results" / scroll restoration.**

- **User need:** open a car, go back, and land where you were.
- **Exists for Autosouq?** Yes, but it is currently guaranteed to be broken — filter state is not in the URL, so back-navigation resets the whole result set. **This is fixed for free by the URL-state work in §1.3** and is one of the strongest arguments for doing it first.
- **Priority:** **Must-have (via URL state).**

---

**Pattern: the placeholder-image disclosure.**

- Not an AutoTrader pattern — Autosouq's own, in `sliders/gallery.js`: *"Illustrative image — the seller has not uploaded photos of this car yet."* / *"صورة توضيحية — لم يرفع البائع صور هذه السيارة بعد."*
- **Keep it, and extend it to the card.** Currently the disclosure appears on the detail page, but the results card shows the placeholder photo with no caveat — so a buyer scanning the grid sees what looks like a photo of a car. A small corner label on the card ("No photos yet") closes that gap. This is precisely the kind of small honesty that distinguishes the site from its competitors, and it costs one conditional.
- **Priority:** **Must-have.**

---

## 6. Seller-side flow

### 6.1 What was observed

**Entry is the registration plate, not a form.** The seller enters **reg + mileage**, then presses "sell my". "Your car's registration number will help Autotrader find the car and its key details, and they'll use this to recommend a guide price" ([How do I create an advert?](https://help.autotrader.co.uk/hc/en-gb/articles/29420340164381-How-do-I-create-an-advert)). The identical two-field pattern powers the valuation tool: **Registration → Mileage → "Get my instant valuation"**, returning **both a private-sale price and a part-exchange price** ([cars/valuation](https://www.autotrader.co.uk/cars/valuation)).

**Step order:** account/personal details (name, mobile) → reg + mileage → auto-filled car details → photos → description → **"Continue to package selection"** → pay → live. Note the sequence: **all the effort comes before the paywall.** By the time price is mentioned, the seller has invested twenty photos and a description.

**Photo guidance is specific and quantified:** "You can upload up to 100 images. The best adverts have at least 20 photos of your vehicles." Tips: clean the car; keep the background clear and distraction-free; shoot in **landscape**; choose a well-lit area; and — notably — **"including photos of damage and close-ups of wheels, accessories and boot"** ([Top tips for creating an advert](https://help.autotrader.co.uk/hc/en-gb/articles/25551752752541-Top-tips-for-creating-an-advert)).

**Description guidance is prompted by question:** "add the reason for the sale, the type of use the vehicle has had and the condition it is in", plus "any modifications or recent mechanical work". The public-facing sell page adds a principle: **"Be honest"** — the description should be "accurate" with faults mentioned upfront ([sell-my-car](https://www.autotrader.co.uk/sell-my-car)).

**Pricing help:** "make sure you get an up-to-date valuation", plus advice to search the site for comparable cars.

**Packages:** £18.95 / £25.95 / £35.95 / £45.95, differing in duration and prominence; all four include up to 100 photos ([advertising-prices](https://www.autotrader.co.uk/sell-my-car/advertising-prices)).

### 6.2 Judgement for Autosouq

**The reg-lookup pattern is the best idea in AutoTrader's seller flow, and it does not transfer.** Its value is that it removes ~15 fields of typing by looking the car up. Oman has no public plate-to-specification API available to a marketplace. **Do not fake it.** But the *need* — "typing 20 fields on a phone is why people give up" — is real and severe for this audience, and there is a cheaper answer: **ask less**. Autosouq's `AddListing.jsx` currently asks for ~18 car-detail fields (title, make, model, year, condition, spec, VIN, mileage, transmission, fuel, body, drive type, engine size, cylinders, colour, doors, seats, description) plus features, price, location, two phone numbers, a video URL and PDF attachments, **all on one page with no steps and no progress indicator**. On a budget Android over metered data, that is a wall.

**AutoTrader's paywall-last sequencing is a real insight worth stealing wholesale**, minus the paywall. Ask for effort in ascending order of cost, and never ask for the expensive thing (photos) before the seller is committed. But Autosouq's ordering problem is the opposite: **photos are currently step one**, before the seller has told you anything. Photos are the highest-friction step (camera, upload, data cost) and putting them first maximises abandonment.

**The "photograph the damage" instruction is the strongest brand fit in this entire document.** AutoTrader tells sellers to photograph damage and close-ups of wheels. `AddListing.jsx` already says "Photograph the car as it is, including any dents or scratches." That is exactly the honest-friend voice, and it is the trust proposition enacted at the point of supply rather than asserted in marketing. Strengthen it, do not soften it.

### 6.3 Recommendations — seller flow

---

**Pattern: staged form with visible progress, cheap questions first.**

- **User need:** don't face a wall; know how much is left; don't lose work.
- **Exists for Autosouq?** Yes, urgently.
- **Adapted version — proposed step order:**
  1. **The car** — make, model, year, kilometres, transmission (5 fields; all thumb-friendly dropdowns/number pads)
  2. **Spec and condition** — import origin (required), condition, mulkiya expiry, under-lien yes/no, known faults
  3. **Price** — with the band explainer and live "sold as-is" feedback (already built and good)
  4. **Photos** — moved from first to fourth, with the guidance below
  5. **Where and how to reach you** — city, WhatsApp number, with the disclosure that the number will be public
  6. **Review and publish**
- Everything else (VIN, engine size, cylinders, doors, seats, drive type, body, colour, video, PDFs) goes behind **"Add more details (optional)"** on the review step. None of it is a first-order buyer question at OMR 1,500–6,000, and each one is a chance to abandon.
- **Priority:** **Must-have** — but note the honest blocker: `AddListing.jsx` carries an explicit comment that there is **no submit path at all** (no auth, no listing POST, no upload target). Restructuring the form is worth little until that exists. **Sequence: build the submit path, then restage the form.** Do not restage a form that cannot submit.
- **Implementation notes:** `apps/web/components/dashboard/AddListing.jsx` (912 lines, one page). Most fields are uncontrolled; staging will require lifting them into state, which argues for doing it once, properly, with a single `useReducer` mirroring the pattern in `reducer/carFilterReducer.js`. **Persist to `localStorage` on every step** — this audience will be interrupted, and losing a half-typed listing on a phone is the difference between a listing and no listing.

---

**Pattern: quantified, specific photo guidance ("at least 20 photos", "include the damage").**

- **User need:** sellers do not know what a good advert looks like; buyers cannot assess condition without evidence.
- **Exists for Autosouq?** Yes — **and it is more important here than at AutoTrader**, because photos are the *only* condition evidence available. There is no MOT history to fall back on.
- **Adapted version:** keep the existing honest instruction and make it a checklist against a target. `AddListing.jsx` currently caps at **10 photos** — the right call over metered data (AutoTrader's 100 is absurd for this audience), but the guidance should name the shots rather than the count: **front three-quarter · rear three-quarter · both sides · interior front · dashboard showing the odometer reading · engine bay · tyres · any dents, scratches or rust**. An odometer photo in particular is a cheap, powerful anti-tampering signal that costs nothing to request. Show the checklist as ticks that fill in as photos are added.
- **Priority:** **Must-have** — it is copy plus a checklist, and it directly raises listing quality, which is the whole supply-side problem at 10 listings.
- **Implementation notes:** the `.upload-media` block in `AddListing.jsx`. **Compress client-side before upload** (canvas resize to ~1600px long edge) — uploading 10 full-resolution phone photos over metered data is a real cost to the seller and a real cause of abandonment.

---

**Pattern: prompted description ("reason for sale, type of use, condition").**

- **User need:** a blank textarea produces either nothing or "car for sale good condition".
- **Exists for Autosouq?** Yes.
- **Adapted version:** replace the single textarea with **three short prompted fields** that concatenate into the description: "Why are you selling?", "What has been replaced or repaired recently?", "What needs attention?". The third is the important one and the current placeholder already gestures at it ("Service history, what has been replaced, anything that needs attention…"). Making it a **separate required-ish field** — with an explicit "Nothing that I know of" option — is what turns the honesty promise into a data field. A seller who ticks "nothing" and is later contradicted has made a checkable claim; a seller who simply omits it has not.
- **Priority:** **Must-have.** This is the trust proposition implemented on the supply side, and it is a bigger differentiator than any badge.

---

**Pattern: pricing help at the point of pricing.**

- **User need:** "what is my car worth?" — sellers overprice from ignorance as often as from greed, and overpriced listings are what make a marketplace feel fake.
- **Exists for Autosouq?** Yes.
- **Adapted version:** **not** a valuation (no data — see §4.3). Next to the price field, a link: **"See what similar cars are listed for on Autosouq"** → filtered search on the make/model/year already entered. Same mechanism as the buyer-side comparison link, same zero data claims, and it puts the seller and the buyer in front of the *same* evidence — which is a fair and defensible position for a site whose promise is "the price you see is the real price".
- **Priority:** **Must-have** (falls out of URL-state work).
- **Implementation notes:** the price section of `AddListing.jsx`. The existing band feedback UI there is genuinely good — four states, `aria-live="polite"`, `role="alert"` on invalid, and `soldAsIs` derived from price rather than chosen by the seller. **Do not disturb it**; add the comparison link beside it.

---

**Pattern: paywall after effort, package tiers.**

- **Exists for Autosouq?** **No — REJECT for launch.** Charging private sellers OMR anything at 10 listings kills supply, and paid prominence tiers are precisely the mechanic that makes a marketplace feel rigged. It also directly contradicts the paid-visibility problem discussed in §1.3. If monetisation comes later, prefer something that adds value (the workshop-inspection partnership in §4.3) over something that sells position.
- **Priority:** **Skip.**

---

## 7. Navigation and information architecture

### 7.1 What was observed

**Header, two tiers.** Vehicle channels first — *Cars, Vans, Bikes, Motorhomes, Caravans, Trucks, Farm, Plant, Electric bikes* — then a cars sub-menu: *Used cars, New cars, Sell your car, Value your car, Car reviews, Car leasing, Electric cars, Buy a car online*. Top-right actions: **Sell · Saved · Search · Sign in** ([cars/homepage](https://www.autotrader.co.uk/cars/homepage)).

The IA is **task-first inside a vehicle-type-first shell**: pick your vehicle class, then pick your job (buy / sell / value / research).

**Landing pages are the connective tissue.** `/cars/used` is a hub that interlinks aggressively with search: "Browse by brand" (Ford, Volkswagen, Audi, Mercedes-Benz, BMW, Toyota, Vauxhall, Nissan — **each with a car count**), "Popular models in the UK" (Ford Fiesta, BMW 3 Series, Mercedes-Benz E Class), category pages ("Nearly new cars", "Best small cars", "Best cars for students"), service links (valuation, vehicle check, finance, insurance), plus buying guides and an FAQ block. Every one of these is a pre-filtered search dressed as a page.

**Footer groups:** Autotrader Group · Products & services · Buying advice · Quick search · Autotrader for dealers.

### 7.2 Judgement for Autosouq

**The landing-page-to-search pattern is the right growth architecture and the wrong launch priority.** It works because each landing page is a real search with real inventory and a real count. "Toyota cars in Oman (2 listings)" is not a page; it is an admission. **Build the mechanism (URL-driven search) now, build the landing pages when inventory supports them.** The counts should be omitted until they are reassuring.

**Autosouq's actual IA problem is not AutoTrader-shaped; it is self-inflicted.** The public navigation exposes the purchased theme's demo structure: **Home Page 01–10**, **Listing / Listing grid / Listing grid map / Listing detail V1–V5**. A first-time visitor to a trust-led marketplace is offered a menu of ten identical homepages and five identical detail-page layouts. Canonical tags and a curated sitemap have handled the SEO consequences, but **the navigation is still offering them to humans**, and it is the single most credibility-damaging thing on the site — far more than any missing badge. A visitor who sees "Home Page 07" in the menu will correctly conclude the site is a template.

### 7.3 Recommendations — navigation and IA

---

**Pattern: a small, task-shaped primary navigation.**

- **User need:** know what this site does and where to go, in one glance.
- **Exists for Autosouq?** Yes.
- **Adapted version:** four items, in both languages: **Browse cars · Sell your car · How we check · Help/Safety**. Nothing else. Remove the Home/Listing/Page mega-menus entirely.
- **Priority:** **Must-have for launch. This is the highest-priority IA change and one of the cheapest.**
- **Implementation notes:** `apps/web/data/menu.js` (`homepages`, `listingPages`, `otherPages`) drives both `components/headers/Nav.jsx` and `MobileNav.jsx` — so this is largely a data edit. **Then delete the variant routes**, or at minimum make them non-public: `app/(homes)/home02`–`home10`, `(car-listings)/listing-grid2`, `listing-list`, `listing-grid-map`, `listing-list-map`, and `(car-details)/listing-detail-v2`–`v5`. Keeping five card layouts and five detail layouts alive means every improvement in this document must be made five times, which is why they keep drifting (`Cars5` already uses a different image component). **Collapse to one of each before implementing anything else here.** This is prerequisite work, not cleanup.

---

**Pattern: category/brand landing pages interlinked with search.**

- **User need:** browse without knowing how to search; entry from Google.
- **Exists for Autosouq?** The need yes; the volume no — **later**.
- **Adapted version:** when inventory reaches roughly 50+ listings, generate a small set of routes from real data: by make (Toyota, Nissan, Mitsubishi), by city (Muscat, Sohar, Salalah), by price step (under 2,000 / 2,000–4,000 / 4,000–6,000), and — distinctively — **by import origin** ("GCC-spec cars in Oman"), which no competitor offers as an entry point and which is exactly the query an anxious buyer types. Bilingual URLs. Omit counts until they help.
- **Priority:** **Later.** But **the URL-state work in §1.3 is the prerequisite**, so doing that now buys this cheaply later.

---

**Pattern: dead links.**

- **Observed in the codebase, not at AutoTrader:** five footer social links are `<a href="#">`, as are the header search and favourites icons and the compare offcanvas target. On a site whose proposition is trustworthiness, a link that does nothing is a small, repeated broken promise. Remove what does not exist rather than stubbing it.
- **Priority:** **Must-have.** Trivial, and it removes a whole class of "this site is fake" signals.

---

## 8. Empty states, zero results, and loading

### 8.1 What was observed

A deliberately impossible search (`make=Ferrari&price-to=2000`) returns ([car-search](https://www.autotrader.co.uk/car-search?postcode=M15%204FN&make=Ferrari&price-to=2000)):

```
0 results
There are no vehicles that match your filters
[Search all cars]   [Refine search]
```

No relaxed-criteria results, no "we widened the distance to 50 miles", no suggested alternatives. Two escape buttons — one to reset everything, one to go back and edit.

### 8.2 Judgement for Autosouq

**This is the weakest pattern on AutoTrader, and it is the one Autosouq must most emphatically not copy.** It is *adequate for them*: with 450,000 cars, a zero-result search is almost always the user's own over-filtering, and "Search all cars" reliably rescues them. **With ~10 listings, a zero-result search is the normal case, and it is the site's fault, not the user's.** Sending a first-time visitor to a bare "0 results" screen is sending them back to OpenSooq.

**The zero-result state is arguably the most important screen on Autosouq at launch.** It is where the inventory gap becomes visible, and it is the one screen where honesty plus a genuinely useful next action can convert a disappointment into a returning user.

### 8.3 Recommendations — empty and error states

---

**Pattern: a recovery-oriented zero-result state.**

- **User need:** don't dead-end me; tell me the truth; give me something to do.
- **Adapted version — a four-part zero-result screen:**
  1. **An honest, friendly statement, not an error.** "No cars match that yet — لا توجد سيارات مطابقة حتى الآن." The word *yet* is doing real work: it frames a small catalogue as early rather than empty, without overclaiming.
  2. **The offending filter, named and individually removable.** "You filtered by: Sohar · under OMR 2,000 · automatic" with an × on each. AutoTrader's all-or-nothing reset is a blunt instrument at this scale — this is where the removable chips from §5 earn their place.
  3. **Nearest matches, explicitly labelled as relaxed.** With 10 listings you can always show something, but **only if you say what you relaxed**: "No automatics in Sohar under OMR 2,000. Here are 3 cars in nearby cities:" Silently returning non-matching results is the behaviour that makes competitors feel dishonest. **Label it or don't do it.**
  4. **The WhatsApp alert capture from §1.3** — "Tell me when one is listed". This is the point of maximum intent in the entire funnel and it currently leads nowhere.
- **Priority:** **Must-have for launch — top three.** At 10 listings this screen will be seen more than the results screen.
- **Implementation notes:** the `Cars*` components render `sorted.slice(...)` with no empty branch. Add an `EmptyResults` component; note `apps/web/components/dashboard/EmptyState.jsx` already exists with real `dir="rtl"` markup and can serve as the bilingual pattern to follow.

---

**Pattern: loading behaviour.**

- **User need:** on a slow connection, know the page is coming rather than assuming it is broken.
- **Adapted version:** the listing and detail routes are async server components reading from Strapi with a fallback to `data/cars.js`. Add `loading.jsx` at `app/(car-listings)/` and `app/(car-details)/` rendering **skeleton cards** matching the real card dimensions, so the layout does not jump. On a slow Android connection the difference between a blank screen and a skeleton is the difference between waiting and leaving.
- **Priority:** **Must-have.** Two small files; large perceived-performance return for exactly this audience.

---

**Pattern: error and fallback states.**

- The Strapi-unreachable path silently falls back to `data/cars.js` demo listings. **This is a trust hazard**: on a CMS outage the site would serve demo data as if it were live inventory, with no indication. Either fail visibly ("We can't load listings right now — try again shortly") or ensure the fallback set is genuinely the real inventory. Do not let a trust-led site display placeholder cars as real ones.
- **Priority:** **Must-have** — resolve before launch.
- **Implementation notes:** `apps/web/lib/strapi.js`. Also add `app/not-found.jsx` and `app/error.jsx`, both bilingual, both with a route back to browse.

---

## 9. Patterns to reject — and why

This list is as load-bearing as the adopt list. Each of these is *correct for AutoTrader*.

| Pattern | Why AutoTrader has it | Why Autosouq must not |
|---|---|---|
| **Finance calculator / "Get it on finance" / monthly price examples** | An FCA-regulated finance business is a primary revenue line | Buyers here pay **cash** (NICHE.md). A monthly-payment module is meaningless and reads as upselling. The codebase already deleted the theme's "Auto Loan Calculator" with the note that "our buyers pay cash" — that judgement was right; do not reintroduce it in another form. |
| **"Reserve now" for a refundable £99** | Dealers hold stock and can take deposits | Autosouq holds no inventory, takes no payments, and has no escrow. A deposit mechanism on a private-sale site is a **scam vector**, not a feature — it is the exact behaviour the safety page will warn users about. |
| **"Build a deal" / part-exchange valuation** | Dealer-network transaction tooling | No dealer network, no trade-in desk, no valuation data. |
| **Dealer reviews and star ratings** | Repeat sellers accumulate reputation | Private sellers sell one car. AutoTrader itself shows no ratings on private listings. A ratings widget with no ratings is worse than none. |
| **Price indicator badges** | Rests on millions of real transactions | ~10 listings. **And AutoTrader itself refuses to rate cars that are old, imported, privately sold or under £1,500 — i.e. Autosouq's entire catalogue.** Fabricating one would be the precise dishonesty the site exists to oppose. |
| **Inventory counts in CTAs ("Search 452,718 cars")** | The number is the proof | "Search 10 cars" is an anti-signal. Revisit at several hundred. |
| **Paid advertising packages / prominence tiers** | Mature two-sided marketplace with pricing power | Kills supply at launch; paid position is the mechanic that makes marketplaces feel rigged. |
| **Multi-vertical channel nav (Vans, Bikes, Motorhomes, Trucks, Farm, Plant)** | Genuine multi-vertical business | Implies scale that does not exist. One vertical, one narrow band — that focus **is** the product. |
| **"Buy a car online" / home delivery** | Dealers can fulfil remotely | No fulfilment. Also directly contradicts the safety guidance (view the car, meet the seller, transfer at ROP). |
| **New cars / leasing / EV hub** | Adjacent revenue | Outside the band by definition. Ever listing one would break NICHE.md. |
| **Registration-plate auto-lookup** | DVLA-derived data | No Omani equivalent. Solve the underlying need — "typing is why sellers quit" — by **asking fewer questions**, not by faking a lookup. |
| **Paid vehicle history check** | Real national data to resell | No data source. The honest local analogue is a **physical workshop inspection**, which is a partnership, not a product. |
| **Insurance comparison / expert reviews / editorial hub** | Content and affiliate revenue at scale | Editorial "Top picks from the experts" reads as slick-dealership. A short, practical safety and buying guide is on-brand; a reviews magazine is not. |
| **Number masking / relay** | Protects private sellers from canvassers | Breaks "one WhatsApp tap", which is the core promise. Solve the same need with **disclosure to both sides** instead. |
| **Free-text "attention grabber" on cards** | Lets dealers differentiate identical stock | Becomes an all-caps shouting match — the OpenSooq texture being escaped. |
| **100-photo uploads** | Unmetered UK data | Metered data on both sides. 10 well-specified photos beats 100 unguided ones. |
| **AutoTrader's bare "0 results" screen** | Fine at 450,000 listings | **Actively harmful at 10.** See §8. |

---

## 10. Prioritised adoption list

Ranked by user value ÷ implementation cost. Items 1–3 are prerequisites that unlock several of the rest.

| # | Change | Why it ranks here |
|---|---|---|
| **1** | **Collapse the five card layouts and five detail layouts to one each; strip demo routes (`home02–10`, `listing-*` variants, `listing-detail-v2–v5`) from `data/menu.js` and the app** | Prerequisite for everything else — right now every improvement must be made five times — and it removes the "Home Page 07" menu, the most credibility-damaging thing on the site. Deletion, not construction. |
| **2** | **Put filter state in the URL** (`reducer/carFilterReducer.js` + a `lib/searchParams.js`) | One focused change that unlocks WhatsApp-shareable searches, working back-button, saved searches, comparison links, and landing pages later. Highest compounding return per hour. |
| **3** | **Fix image weight**: enable optimisation in `next.config.mjs`, add `sizes`, fix `alt="image"`, normalise `Cars5`'s raw `<img>` | Config plus a handful of props. The audience is on metered data — this is a direct cost imposed on users today. |
| **4** | **Rebuild the zero-result state**: honest "yet" copy, removable filter chips, labelled relaxed matches, WhatsApp alert capture | At ~10 listings this screen is seen more than the results screen; it currently dead-ends the highest-intent moment on the site. |
| **5** | **"Tell me on WhatsApp when a car like this is listed"** | Converts the launch inventory gap from a bounce into a returning user. Needs #2; no login, no email, no push. Uses `normalizeOmaniMsisdn()` which already exists. |
| **6** | **Publish an Oman-specific safety and "how we check" page**, and wire the dead "Report this listing" link to a real WhatsApp contact | Pure prose plus one link. It is the brand voice enacted, a real differentiator versus OpenSooq/Dubizzle, durable SEO — and it closes a non-functional promise on a trust-led site. |
| **7** | **Reorder the card and the detail page**: price directly under title; delete the empty author row; `Overview` above `Description`; km into the overview grid; specs ordered km → year → import origin | JSX reordering, no new data. Puts the three questions this buyer actually asks at the top of both surfaces. |
| **8** | **Add structured seller-declared paperwork fields** — mulkiya expiry, under-lien (مرهونة), known faults — labelled "seller says" using the existing `stated`/amber convention in `lib/listingLabels.js` | The genuine Oman analogue of MOT/HPI. AutoTrader's own private sellers volunteer this in prose unprompted, which proves the demand; structuring it is the differentiator. |
| **9** | **Fix the km slider bug** (`FilterSidebar.jsx:171-172` passes price bounds to the kilometre slider), add the applied-filter count badge and chips, add the gallery position counter, add skeleton `loading.jsx` | A cluster of small, independent fixes. Filtering by kilometres — the primary condition signal at this price band — is currently broken. |
| **10** | **Restage `AddListing.jsx` into steps with photos moved to step four, a named photo checklist (including the odometer), client-side image compression, prompted three-part description, and a "see similar listings" pricing link** | Highest supply-side value, but honestly the highest cost — and blocked behind building a submit path, which does not exist. Do it properly, once, after the submit path lands. |

**Deliberately not on this list:** price indicators, seller ratings, finance, reserve/deposits, part-exchange, paid packages, inventory counts in CTAs, number masking, plate lookup. See §9 for why each is rejected rather than deferred.

---

## Sources

- [autotrader.co.uk/cars/homepage](https://www.autotrader.co.uk/cars/homepage) — homepage search widget, header nav, trust messaging
- [autotrader.co.uk/cars/used](https://www.autotrader.co.uk/cars/used) — landing page IA, internal linking, Trustpilot and history-check claims
- [autotrader.co.uk/car-search?postcode=M15+4FN&price-to=6000](https://www.autotrader.co.uk/car-search?postcode=M15%204FN&price-to=6000) — filter panel order, result count, card contents, save search
- [car-search sorted by ascending price](https://www.autotrader.co.uk/car-search?postcode=M15%204FN&price-to=3000&sort=price-asc) — cheap-end cards, absence of price indicators, "Private seller" and "SOLD" badges
- [car-search with zero results](https://www.autotrader.co.uk/car-search?postcode=M15%204FN&make=Ferrari&price-to=2000) — zero-result state
- [car-details/202607244493495](https://www.autotrader.co.uk/car-details/202607244493495) — private-seller detail page structure
- [car-details/202607244493362](https://www.autotrader.co.uk/car-details/202607244493362) — second private-seller detail page
- [car-details/202604241838744](https://www.autotrader.co.uk/car-details/202604241838744) — dealer detail page, Reserve now / Build a deal
- [help.autotrader.co.uk — Why do I have a Price Indicator on my advert?](https://help.autotrader.co.uk/hc/en-gb/articles/19212037724957-Why-do-I-have-a-Price-Indicator-on-my-advert) — **price indicator exclusion list (the key finding)**
- [What does 'Great price' mean?](https://help.autotrader.co.uk/hc/en-gb/articles/9831680616477-What-does-Great-price-mean) · [Good](https://help.autotrader.co.uk/hc/en-gb/articles/9831718888733-What-does-Good-price-mean) · [Fair](https://help.autotrader.co.uk/hc/en-gb/articles/9831756983453-What-does-Fair-price-mean) · [Higher](https://help.autotrader.co.uk/hc/en-gb/articles/9832184721565-What-does-Higher-price-mean)
- [autotrader.co.uk/vehiclecheck](https://www.autotrader.co.uk/vehiclecheck) — free five-point check, 27-point paid check, £30,000 data guarantee
- [How to spot and avoid potential scams](https://www.autotrader.co.uk/content/advice/how-to-spot-and-avoid-potential-scams) — scam taxonomy, number masking, platform messaging, security team
- [help.autotrader.co.uk — How do I create an advert?](https://help.autotrader.co.uk/hc/en-gb/articles/29420340164381-How-do-I-create-an-advert) — seller step order
- [Top tips for creating an advert](https://help.autotrader.co.uk/hc/en-gb/articles/25551752752541-Top-tips-for-creating-an-advert) — photo and description guidance
- [autotrader.co.uk/sell-my-car](https://www.autotrader.co.uk/sell-my-car) — "Take great photos", "Be honest"
- [sell-my-car/advertising-prices](https://www.autotrader.co.uk/sell-my-car/advertising-prices) — package tiers
- [autotrader.co.uk/cars/valuation](https://www.autotrader.co.uk/cars/valuation) — reg + mileage valuation flow
- [help.autotrader.co.uk — Introduction to Search](https://help.autotrader.co.uk/hc/en-gb/articles/21946045692445-Introduction-to-Search) — sort dimensions
- [Play Store — Autotrader Used Cars for Sale](https://play.google.com/store/apps/details?id=uk.co.autotrader.androidconsumersearch&hl=en_GB) — app feature set, alerts, 10m+ installs, updated 14 Jul 2026
