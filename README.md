# Autosouq.om

Oman car marketplace — **Next.js** frontend + **Strapi** CMS.

The frontend is the **AutoDeal** React/Next.js template (Bootstrap 5 + SCSS), running on
Next 16 / React 19. The listing and car-detail pages read from Strapi; everything else still
renders the template's demo data from [`apps/web/data/`](./apps/web/data/).

## Structure

```
apps/web   → Next.js 16 App Router (JSX, Bootstrap 5 + SCSS, Swiper, PhotoSwipe)
apps/cms   → Strapi 5 (SQLite locally)
design/    → design tokens reference
```

Inside `apps/web`:

```
app/         route groups: (homes) (car-listings) (car-details) (dealer) (agents) (blogs) (dashboard) (other-pages)
components/  theme components, grouped by area
lib/         strapi.js (fetch + map), carOptions.js (filter options), format.js (OMR prices)
data/        demo data for the pages not yet wired to the CMS
reducer/     car filter reducer — slider bounds derived from the listings
public/assets/  scss/ css/ fonts/ images/
```

### How listings flow

```
Strapi /api/listings
  └─ lib/strapi.js  getListings() / getListing(slugOrId)   → toCar(): CMS shape → theme shape
       └─ app/(car-listings)/*/page.jsx   server component, ISR 30s
            └─ Cars1…Cars5  listings={…}   ← falls back to data/cars.js when the CMS returns nothing
                 └─ FilterSidebar / FlatFilter3   options + slider bounds derived from those listings
```

Detail pages (`/listing-detail-v1/[id]` … `v5`) resolve by **slug** first, then numeric id, then fall
back to demo data — so both `/listing-detail-v1/toyota-camry-2019` and the theme's `/listing-detail-v1/3`
keep working. A CMS outage logs `[strapi] listings unavailable` and serves demo data rather than erroring.

## Prerequisites

- Node.js 20–26
- pnpm 10+

## Setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/cms/.env.example apps/cms/.env   # already generated on create
```

`apps/web/.env.local` keys:

| Key | Needed for |
|-----|------------|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi API base (default `http://localhost:1337`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | map views (`/listing-grid-map`, `/listing-list-map`, dashboard map) — blank key ⇒ blank map |
| `NEXT_PUBLIC_EMAILJS_*` | contact form + footer newsletter form |

## Develop

```bash
# Frontend only (http://localhost:3001)
pnpm dev:web

# CMS only (http://localhost:1337/admin)
pnpm dev:cms

# Both
pnpm dev
```

On first Strapi boot, create an admin user at http://localhost:1337/admin.

Public `find` / `findOne` permissions for listings (and taxonomies) are enabled automatically on bootstrap. Demo cities, makes, models, and 4 published listings are seeded once when the database is empty.

## Routes

| Area | Routes |
|------|--------|
| Homes | `/`, `/home02` … `/home10` |
| Listings | `/listing-grid`, `/listing-grid2`, `/listing-list`, `/listing-grid-map`, `/listing-list-map` |
| Car detail | `/listing-detail-v1/[id]` … `/listing-detail-v5/[id]` |
| Dealers / agents | `/dealer-listing`, `/dealer-detail/[id]`, `/sale-agents`, `/sale-agents-detail/[id]` |
| Dashboard | `/dashboard`, `/add-listing`, `/my-listing`, `/my-favorite`, `/my-review`, `/my-profile`, `/message`, `/change-password` |
| Blog | `/blog`, `/blog-grid`, `/blog-detail/[id]` |
| Other | `/about-us`, `/contact`, `/faq`, `/pricing`, `/compare` |

Pick the home / listing / detail variants you want and delete the rest once decided.

## Content model (from AutoDeal listing fields)

| Type | Purpose |
|------|---------|
| `listing` | Car ads (price OMR, year, mileage, WhatsApp, gallery, badges) |
| `make` / `model` | Manufacturer → model |
| `body-type`, `condition`, `transmission`, `fuel-type`, `car-color`, `feature` | Filters / taxonomy |
| `city` | Oman cities |

Listing badges: `featured`, `verified`, `soldAsIs` (for ~1,000–1,499 OMR “as-is” cars).

## Notes

- Theme styles live in `apps/web/public/assets/scss/` (entry: `app.scss`); brand colours in `abstracts/_variables.scss`. Palette reference: [`design/tokens.md`](./design/tokens.md).
- The theme is LTR-only — no RTL stylesheet ships with it. Arabic / RTL needs an added `_rtl.scss` pass before flipping `dir` in `apps/web/app/layout.js`.
- `public/assets/images/section/video.mp4` (home02 hero) is 103 MB and git-ignored — it exceeds GitHub's file limit. Host it on a CDN or re-encode before deploying.
- Fonts are trimmed to woff2/woff. Font Awesome's brands (`fab`) and duotone (`fad`) weights were removed — re-add the font files and their `@font-face` rules in `public/assets/css/font-awesome.css` if a design starts using them.
- All prices render through `lib/format.js` (`formatPrice`) as `6,250 OMR`. The theme's hardcoded `$` is gone from components, but literal dollar amounts still exist in `data/` demo copy.
- The map pages need `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with billing enabled. `ListingMap` plots listings that carry `latitude`/`longitude` and centres on Muscat when none do — the seeded listings have no coordinates yet, so it renders empty until you add them.
- `apps/cms/src/index.ts` seeds demo data on bootstrap. Taxonomy seeding is find-or-create (slugs are unique `uid` fields), and both bootstrap steps log-and-continue on failure so a seeding problem can never stop the CMS from starting.

## Next steps

1. Seed the rest of the Oman cities + common makes/models in Strapi
2. Wire the remaining surfaces to the CMS — home pages, dealer / agent pages, and the "recommended cars" block on detail pages still use `data/`
3. Give `add-listing` a real submit path (it is currently a static form)
4. Localise copy to Arabic, add an RTL stylesheet
5. Auth / dealer accounts when needed
