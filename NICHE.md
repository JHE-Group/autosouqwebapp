# NICHE.md — Autosouq.om

**This file is non-negotiable. If a feature conflicts with it, refuse.**

## The niche

Autosouq.om is Oman's marketplace for **affordable used cars only: OMR 1,000 to 6,000**.
Nothing above 6,000 is ever listed, and nothing below 1,000.

The band has two tiers, and the split is a disclosure rule, not a second product:

| Tier | Range | Rule |
|---|---|---|
| **Sold as-is** | OMR 1,000–1,499 | Accepted, and **labelled "sold as-is"** on the card and the listing |
| **Standard** | OMR 1,500–6,000 | The main band |

*The headline here used to read "OMR 1,500 to 6,000", with the 1,000–1,499 tier explained in
the sentence after it. That is the number a reader quotes, so it made the floor ambiguous —
while the code has always enforced 1,000. `scripts/check-price-band.mjs` asserts the four
constants agree across the CMS schema, the CMS lifecycle hooks and the seller form; this file
now agrees with them too.*

This price band is the entire identity of the business — we are deliberately **NOT** a general car
site, **not** a new-car site, **not** a luxury site.

## Why this band

It's where Oman's market actually is: cars under OMR 6,000 make up roughly two-thirds of all
used-car listings in the country, and the 2,000–5,000 range is the single biggest concentration of
buying activity. Oman has 5.4 million people, 43% expatriates, median age under 30, and most
private-sector workers earn less than OMR 600 a month — the majority of the country can only buy in
this band, and no competitor serves it properly.

## Who the customers are

- **Expat workers** (Indian, Bangladeshi, Pakistani, Filipino communities — over 1.4 million people):
  buying their first car in Oman at OMR 1,000–2,500, paying cash, living on WhatsApp, browsing on
  budget Android phones.
- **Young Omanis on starting salaries** (OMR 325–900/month): first car at OMR 2,000–5,000,
  Arabic-speaking, on Instagram/TikTok/Snapchat.
- **Families** needing an affordable second car, OMR 2,000–5,000.

## The promise that sets us apart

Competitors (OpenSooq, Dubizzle) are full of scams, fake prices, and unverified sellers — worst of
all at the cheap end. Autosouq's difference is **trust**:

- the price you see is the real price
- listings are verified
- **GCC-spec vs US-import is always shown honestly**
- contacting a seller is **one WhatsApp tap**

Brand feeling: a knowledgeable, honest friend at the car souq — never a slick dealership.
**"Affordable" is the brand voice. "Cheap" / رخيصة is allowed where buyers search it.**

This replaces a blanket ban on "cheap", lifted 28 Jul 2026 on the evidence below. The two
words do different jobs and both are now available:

- **How we describe ourselves** stays "affordable" — بأسعار مناسبة / في المتناول. The friend
  at the souq does not call your budget cheap.
- **How we match a search** may use رخيصة / "cheap", in titles, meta descriptions and
  headings that answer that query.

Why the change: Google autocomplete (gl=OM) shows رخيصة is the phrasing Omani buyers
actually use — `سيارات للبيع في عمان رخيصه` completes, while `أقل من X` returns no Oman
completions at all and resolves to UAE/Egypt. The one competitor positioned on رخيصة
(omanista.com) serves `noindex`, so the term is effectively uncontested in Omani search.

What does not change: the claim underneath the word. A cheap car here is still a real
price on a checked listing. "Cheap" may describe the price; it may never describe the
listing, the check, or the seller.

## Languages

**Arabic first, English equal second.** Everything the customer sees exists in both.
