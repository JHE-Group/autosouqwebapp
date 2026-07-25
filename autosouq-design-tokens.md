> **This file mirrors `design/tokens.md`, which is canonical.** Two divergent
> copies of the palette are what produced the #FF7101 / #FDD906 / #E97451
> three-way conflict in the first place. If you change one, change both — or
> better, delete this copy.

# Autosouq.om — Design Tokens

**Palette source of truth: the client's logo artwork at
`apps/web/public/assets/images/brand/*.svg`** (41 SVGs, supplied 25 July 2026).
Every hex below was read directly off the vector fills. Do not re-derive the
palette from anywhere else.

Two earlier palettes are now dead and must not come back:

- the AutoDeal template's orange `#FF7101` — what the site rendered until the
  artwork landed;
- the accent yellow `#FDD906` on navy `#0A1426` that the first version of this
  file specified — that was a guess made before the artwork existed.

`#FF7101` and `#E97451` are not interchangeable. One is a vivid saturated
orange, the other a muted terracotta; side by side they read as a mistake.

The tokens live in code at
`apps/web/public/assets/scss/abstracts/_variables.scss`. This file documents
them; that file is what ships.

## Palette (from the artwork)

| Role | Hex | SCSS | Where it goes |
|---|---|---|---|
| Terracotta | `#E97451` | `$brand-terracotta` / `$color-3` | **the accent** — buttons, active states, price highlights, ribbons |
| Indigo | `#262262` | `$brand-indigo` | dark surfaces — footer, dashboard sidebar, fixed header, button hover |
| Cream | `#F1E4C5` | `$brand-cream` | warm surface — tab pills, icon boxes, marketing panels |
| Ink | `#231F20` | `$brand-ink` / `$color-2` | headings, and **text on terracotta** |
| White | `#FFFFFF` | `$color-1` | cards, main background, text on indigo |

### Derived steps (not in the artwork)

Same hue as the terracotta, different lightness. Introduced so the theme's
hover/active/darker states are terracotta rather than orphaned orange.

| Role | Hex | SCSS | Why it exists |
|---|---|---|---|
| Terracotta 700 | `#C9502E` | `$brand-terracotta-dark` / `$color-3-text` | the accessible accent for **text on light** (4.50:1) |
| Terracotta 300 | `#F2A88F` | `$brand-terracotta-soft` | decorative washes only (was `#FFAD6B`) |

### Carried over from the theme (unchanged)

| Role | Hex | SCSS |
|---|---|---|
| Body text | `#696665` | `$color-4` |
| Muted | `#B6B6B6` / `#5C6368` | `$color-5` / `$color-7` |
| Border | `#EDEDED` / `#E4E4E4` | `$color-6` / `$color-8` |
| Surface | `#F8F8F9` | `$bg-color2` |
| Success | `#7ED321` | `$color-9` |

### Autosouq-specific (not from the artwork)

| Role | Hex | Why |
|---|---|---|
| WhatsApp green | `#25D366` | every contact CTA. **Never recolour this** — its recognisability is the point. Lives in `apps/web/lib/whatsapp.js`, not the SCSS. |
| Verified teal | `#0F9D58` | Verified badge |
| As-is / pending amber | `#B45309` | "Sold as-is" label on 1,000–1,499 OMR cars, and the dashboard's pending-listing chip (`$color-10`). Was `#EE6742`, which is now too close to the terracotta accent to read as a distinct status. |
| Danger | `#DC3545` | form errors (Bootstrap red) |

## Contrast — computed, not assumed

WCAG 2.1 relative-luminance ratios. AA needs 4.5:1 for body text, 3:1 for large
text (≥24px, or ≥19px bold) and for non-text UI boundaries.

| Combination | Ratio | Verdict |
|---|---|---|
| white on terracotta | **2.97:1** | **FAILS at every size** |
| ink `#231F20` on terracotta | 5.50:1 | passes AA — **this is what filled accent surfaces use** |
| indigo on terracotta | 4.76:1 | passes AA |
| terracotta as text on white | **2.97:1** | **FAILS** — see follow-ups |
| terracotta 700 `#C9502E` on white | 4.50:1 | passes AA |
| terracotta on indigo | 4.76:1 | passes AA — accent links in the footer are fine |
| cream on indigo | 11.19:1 | passes AAA |
| indigo on cream | 11.19:1 | passes AAA |
| ink on cream | 12.92:1 | passes AAA |
| white on indigo | 14.12:1 | passes AAA |
| ink on white | 16.30:1 | passes AAA |
| body `#696665` on cream | 4.51:1 | passes AA, only just |
| ink `#24272C` on WhatsApp green | 7.55:1 | passes AAA — the existing precedent |

**Rule that falls out of this: never put white text on terracotta.** Filled
accent surfaces carry ink (`$color-on-accent`). This is the same call
`lib/whatsapp.js` already makes — it keeps the recognisable WhatsApp green and
darkens the label, because white on `#25D366` is 1.98:1.

When a terracotta fill goes dark on hover (indigo), the label has to flip back
to white in the same rule, or ink-on-indigo gives you 1.15:1 and the label
disappears.

## Typography

- Primary UI font: **Inter** (`$font-2`); display **Outfit** (`$font-1`). For
  Arabic, pair with **IBM Plex Sans Arabic** or **Noto Sans Arabic** — neither
  Latin family has Arabic glyphs. Load both via `next/font`.
- Weights: 400 body, 500–600 headings, bold for prices.

## Shape & spacing

- Radii: cards `14px`, buttons/inputs `10px`, small elements `5px`,
  avatars/pills `50%`.
  - *Observed discrepancy:* the ported SCSS actually uses `14px` on `.sc-button`
    and on text inputs, not `10px`. `lib/whatsapp.js` uses `10px`. Worth
    settling, but it is a shape decision, not a colour one.
- Borders: 1px `#EDEDED` on cards.
- The theme ships a dark mode (`body.dark-light`) — ignore for v1.

## SCSS token block (the shipping source of truth)

`apps/web/public/assets/scss/abstracts/_variables.scss`:

```scss
$brand-terracotta      : #E97451; // the mark - the accent colour
$brand-indigo          : #262262; // the wordmark - the dark / primary surface
$brand-cream           : #F1E4C5; // light wordmark on dark - warm surface
$brand-ink             : #231F20; // near-black, mono lockups
$brand-white           : #FFFFFF; // reversed mono

$brand-terracotta-dark : #C9502E; // ~700 step. white on it = 4.50:1
$brand-terracotta-soft : #F2A88F; // ~300 step. decorative washes only

$color-1: $brand-white;
$color-2: $brand-ink;
$color-3: $brand-terracotta;      // THE accent
$color-on-accent: $brand-ink;     // text/icons ON a terracotta fill
$color-3-text  : $brand-terracotta-dark;

$bg-color3: rgba(233, 116, 81, 0.1);  // terracotta @ 10%
$bg-color4: rgba(233, 116, 81, 0.06); // terracotta @ 6%
```

> The original version of this file shipped a `tailwind.config.ts` block. That
> was wrong for this codebase — `apps/web` is Bootstrap 5 + SCSS, not Tailwind.
> If a Tailwind surface is ever added, generate its colours from the block
> above rather than re-typing hexes.

## Component conventions

- **Listing card:** white card, 14px radius, 1px `#EDEDED` border, photo top
  with rounded top corners, price in bold ink, meta row (year · km · city) in
  muted, WhatsApp-green CTA button full-width at the card bottom on mobile.
- **Buttons:** solid fills, no gradients. Primary = terracotta fill with **ink**
  label; hover goes indigo and the label flips to white.
- **Dark sections:** indigo, not near-black. White or cream text, terracotta
  accents. This is the brand's most distinctive pairing — the footer, the
  dashboard sidebar and the fixed header all use it.
- **Logo:** pick the colourway from the background — see
  `apps/web/public/assets/images/brand/README.md`. Light header →
  `logo-horizontal-om-primary.svg`; indigo footer →
  `logo-horizontal-om-cream-terracotta.svg`.

## What NOT to carry over

- The `autodeal` icon font — use Lucide or Heroicons instead.
- Demo/stock car photos — not licensed for reuse; real listing photos only.
- LTR-first layouts — Autosouq is RTL-first; mirror everything.
- The template's orange, in any form.

## Known follow-ups

1. **Accent-as-text on white is 2.97:1 and fails AA.** It appears ~86 times as
   `color: $color-3`. It is not fixed site-wide because the same token is also
   used as text on the indigo footer, where terracotta is a healthy 4.76:1 but
   the darker `$color-3-text` would fail. Fixing it properly needs a
   per-surface pass: `$color-3-text` on light, `$color-3` on dark. The token is
   already defined and ready.
   (For context, the template's own orange was 2.76:1 here, so this is not a
   regression — it is an inherited defect that is now measured.)
2. **Terracotta borders on white are 2.97:1**, a hair under the 3:1 needed for
   non-text UI boundaries. Decorative only today; if a border ever becomes the
   sole indicator of a control's state, use `$color-3-text`.
3. **Hardcoded hexes in React components** bypass these tokens entirely — see
   `components/dashboard/AddListing.jsx` and `components/footers/Footer1.jsx`.
4. **`public/assets/css/nice-select.css`** is vendor CSS with the template
   orange baked in at line 209.
