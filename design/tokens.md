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
| Terracotta 700 | `#C9502E` | `$brand-terracotta-dark` | ~700 fill step. **Not** the text token — see below |
| Terracotta 750 | `#BD4B2B` | `$color-3-text` | the accessible accent for **text on light** (4.99:1) |
| Terracotta 300 | `#F2A88F` | `$brand-terracotta-soft` | decorative washes only (was `#FFAD6B`) |
| Success 700 | `#4A7B13` | `$color-9-text` | the accessible success green for **text on light** (5.08:1) |

**`$color-3-text` is `#BD4B2B`, not `#C9502E`.** Earlier revisions of this file
said `#C9502E` at "4.50:1". Recomputed, `#C9502E` on white is **4.4964:1** —
it rounds to 4.50 but sits fractionally *under* the 4.5 threshold, and on the
terracotta tint surfaces that actually carry accent body text (the header
dropdown hover, `$bg-color4` over white = `#FEF7F5`) it drops to 4.25:1.
`#BD4B2B` is the same hue (13.2°) and saturation one lightness step down and
clears AA on every light surface in the palette. `_variables.scss` is correct;
this file was stale.

**`$color-9` `#7ED321` must never be used as text.** It is 1.87:1 on white and
1.76:1 on its own 10% tint — the "Verified" badge, the single most important
thing the site says, was rendering effectively invisible. `$color-9-text`
`#4A7B13` is the same hue (88.7°) and saturation, four lightness steps down.
The teal `#0F9D58` this file previously proposed for the badge is only 3.51:1
on white and also fails AA for text; it is not used.

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
| terracotta 700 `#C9502E` on white | **4.4964:1** | **FAILS** — just under 4.5. Superseded |
| terracotta 750 `#BD4B2B` on white | 4.99:1 | passes AA — `$color-3-text` |
| `#BD4B2B` on `$bg-color4` tint `#FEF7F5` | 4.72:1 | passes AA |
| `#BD4B2B` on `$bg-color3` tint `#FDF1EE` | 4.52:1 | passes AA |
| terracotta on indigo | 4.76:1 | passes AA — accent links in the footer are fine |
| cream on indigo | 11.19:1 | passes AAA |
| indigo on cream | 11.19:1 | passes AAA |
| ink on cream | 12.92:1 | passes AAA |
| white on indigo | 14.12:1 | passes AAA |
| ink on white | 16.30:1 | passes AAA |
| body `#696665` on cream | 4.51:1 | passes AA, only just |
| meta `#5C6368` on white | 6.11:1 | passes AA |
| muted `#B6B6B6` on white | **2.03:1** | **FAILS** — never text, never a lone icon |
| ink `#24272C` on WhatsApp green | 7.55:1 | passes AAA — the existing precedent |
| success `#7ED321` on white | **1.87:1** | **FAILS badly** — fills only, never text |
| white on success `#7ED321` | **1.87:1** | **FAILS badly** |
| ink on success `#7ED321` | 8.71:1 | passes AAA — labels on a green fill |
| success 700 `#4A7B13` on white | 5.08:1 | passes AA — `$color-9-text` |
| verified teal `#0F9D58` on white | **3.51:1** | **FAILS** for text — not used |
| pending amber `#B45309` on white | 5.02:1 | passes AA |

### Focus indicator (SC 1.4.11 — 3:1 against everything adjacent)

The accent **cannot** be the focus ring. Indigo is the only brand colour that
clears 3:1 against every light surface the site has, including the terracotta
button fill a ring will most often sit beside.

| Ring on… | white | `#F8F8F9` | cream | terracotta soft | terracotta fill |
|---|---|---|---|---|---|
| terracotta `#E97451` | **2.97** | **2.79** | **2.35** | **1.52** | — |
| `#BD4B2B` | 4.99 | 4.71 | 3.96 | **2.56** | — |
| **indigo `#262262`** | **14.12** | **13.30** | **11.19** | **7.24** | **4.76** |

On indigo/dark surfaces indigo is invisible, so those flip to cream
(11.19:1 on indigo). Tokens: `$focus-ring-color` / `$focus-ring-color-inverse`,
3px wide with 2px offset.

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

### The scale

Defined as `$type-scale` in `_variables.scss`, applied with
`@include type('base')`. Each step is (size, line-height).

| Step | Size | LH | Ratio | Use |
|---|---|---|---|---|
| `micro` | 12px | 18px | 1.500 | badges, legal, timestamps. **Floor — never prose** |
| `sm` | 14px | 22px | 1.571 | meta rows (year · km · city), captions, table cells |
| `base` | **16px** | **26px** | 1.625 | **body copy and all form controls** |
| `md` | 18px | 28px | 1.556 | lead paragraph, h6, card titles |
| `lg` | 20px | 28px | 1.400 | h5 |
| `xl` | 24px | 32px | 1.333 | h4, price on a listing card |
| `2xl` | 30px | 38px | 1.267 | h3, section headings |
| `3xl` | 40px | 48px | 1.200 | h2, page titles |
| `4xl` | 56px | 62px | 1.107 | h1 hero display |
| `5xl` | 70px | 76px | 1.086 | oversized display numerals only |

The theme's 12/14/16/18/20/24/30/40 spine was already a sane progression, so it
is kept. The strays that should collapse onto it are 13, 15, 17, 19, 22, 25, 26,
33, 35, 36, 37.

What changed is the leading. The theme shipped body at 14px/19.6px (1.40) and
*every* heading at exactly 1.26. Per NICHE.md the audience reads outdoors in
bright sun on small budget Android screens and half of them are reading a second
language, so prose is 1.5–1.63 (WCAG 1.4.12's minimum is 1.5) and headings
relax to 1.20–1.40, tightening as the size grows.

Mixins: `type-body`, `type-meta`, `type-micro`, `type-display($step)`,
`type-label($step)` — the last uses `$lh-tight` so a button label never
inflates a fixed control height.

## Shape & spacing

### Spacing — 4px base unit

`$space-N` where N is the multiplier: `$space-6` = 24px. Steps: 0, 2, 4, 8, 12,
16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 96, 112, 128.

The theme ran two competing rhythms (a 5-based one and a 4-based one) plus a
long tail of one-offs (7, 9, 11, 13, 19, 21, 22, 26, 27, 29, 31, 34, 37, 38, 39,
41, 49). 4px wins, because 4/8/12/16/20/24 were already its most common values.
Migrations that matter: 5→4, 10→8 or 12, 15→16, 30→32, 50→48, 60→64, 100→96.

Page rhythm is only ever `$section-py` (96px), `$section-py-tight` (64px) or
`$section-py-mobile` (48px), with `$section-title-gap` (32px) from a heading
block to its content.

### Radii — **buttons and inputs are 14px**

| Token | Value | Use |
|---|---|---|
| `$radius-xs` | 4px | tags, tiny badges |
| `$radius-sm` | 8px | inner elements, small thumbnails |
| `$radius-md` | 12px | nested panels, media inside a card |
| `$radius-control` | **14px** | buttons, inputs, selects, textareas |
| `$radius-card` | 16px | cards, widgets, listing tiles |
| `$radius-lg` | 24px | hero media, modals, large panels |
| `$radius-pill` | 999px | pills, chips, segmented controls |
| `$radius-circle` | 50% | avatars, icon buttons |

**Settled: 14px, not the 10px this file used to specify.** 10px was documented
but never shipped anywhere except `lib/whatsapp.js`; buttons, text inputs,
textareas and `.view-car` are all 14px today (38 sites). The deciding argument
is that a CTA sits directly beside a search field and `style.scss` gives inputs
14px — matching radii are what make the search bar and its button read as one
control group. The outlier to fix is `lib/whatsapp.js`, not the 38 SCSS sites.
Cards are 16px, not the 14px this file used to claim — that is what 86
occurrences already ship.

- Borders: 1px `#EDEDED` on cards.
- The theme ships a dark mode (`body.dark-light`) — ignore for v1.

## Motion

| Token | Value | Use |
|---|---|---|
| `$dur-fast` | 150ms | colour/opacity swaps, tooltips, icon tints |
| `$dur-base` | 250ms | **default** — hover and active states on controls |
| `$dur-slow` | 400ms | disclosure, dropdowns, accordions, drawers |
| `$dur-slower` | 600ms | image zoom, large reveals |
| `$ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | default, both directions |
| `$ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | entrances |
| `$ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | exits |

This replaces the theme's 0.3s/0.5s/0.6s/500ms/300ms/0.2s/0.4s/0.25s/450ms/
150ms/0.8s/2s with `ease` and three unrelated cubic-beziers. The legacy
`transition3/5/6` mixins still exist (≈500 call sites) but now emit
`$dur-base/$dur-slow/$dur-slower` with `$ease-standard`, unprefixed.

Prefer `@include motion(transform, $dur-slow)` in new code — naming the
property is cheaper than `all` on a card repeated 20× down a listing page.

**All motion is disabled under `prefers-reduced-motion: reduce`** by a global
block in `abstracts/_base.scss`.

## Focus

Every interactive element takes `@include focusable` (or `-inverse` on dark
surfaces, `-inset` where an offset ring would be clipped). A safety net in
`abstracts/_base.scss` catches anything missed; it is the floor, not the design.

The theme suppressed focus in ~12 places (`outline: 0` on the reset, on every
input, and inside `.link-style-1..5`) and had a visible indicator in three.
Never re-introduce `outline: 0` / `outline: none`.

## SCSS token block (the shipping source of truth)

`apps/web/public/assets/scss/abstracts/_variables.scss`:

```scss
$brand-terracotta      : #E97451; // the mark - the accent colour
$brand-indigo          : #262262; // the wordmark - the dark / primary surface
$brand-cream           : #F1E4C5; // light wordmark on dark - warm surface
$brand-ink             : #231F20; // near-black, mono lockups
$brand-white           : #FFFFFF; // reversed mono

$brand-terracotta-dark : #C9502E; // ~700 fill step (NOT the text token)
$brand-terracotta-soft : #F2A88F; // ~300 step. decorative washes only

$color-1: $brand-white;
$color-2: $brand-ink;
$color-3: $brand-terracotta;      // THE accent
$color-9: #7ED321;                // success - FILLS ONLY (1.87:1 as text)
$color-on-accent: $brand-ink;     // text/icons ON a terracotta fill
$color-3-text  : #BD4B2B;         // accent as TEXT on light. 4.99:1 on white
$color-9-text  : #4A7B13;         // success as TEXT on light. 5.08:1 on white

$bg-color3: rgba(233, 116, 81, 0.1);  // terracotta @ 10%
$bg-color4: rgba(233, 116, 81, 0.06); // terracotta @ 6%

$focus-ring-color        : $brand-indigo; // on light. 4.76:1 worst case
$focus-ring-color-inverse: $brand-cream;  // on indigo. 11.19:1
$focus-ring-width        : 3px;
$focus-ring-offset       : 2px;
```

The full set — `$type-scale`, `$space-*`, `$radius-*`, `$dur-*`, `$ease-*`,
`$shadow-*` — is in the same file. It is also republished as CSS custom
properties (`--as-terracotta`, `--as-space-4`, `--as-radius-control`, …) on
`:root` by `abstracts/_base.scss`, so JSX inline styles can read a token
instead of retyping a hex.

> The original version of this file shipped a `tailwind.config.ts` block. That
> was wrong for this codebase — `apps/web` is Bootstrap 5 + SCSS, not Tailwind.
> If a Tailwind surface is ever added, generate its colours from the block
> above rather than re-typing hexes.

## Component conventions

- **Listing card:** white card, `$radius-card` (16px), 1px `#EDEDED` border,
  photo top with rounded top corners, price in bold ink at `xl`, meta row
  (year · km · city) via `type-meta` (`#5C6368`, 6.11:1 — *not* `$color-5`,
  which is 2.03:1), WhatsApp-green CTA full-width at the card bottom on mobile.
- **Buttons — three tiers, and only three:**
  | Tier | Class | Rest | Hover |
  |---|---|---|---|
  | Primary | `.sc-button` | terracotta fill, ink label (5.50:1) | indigo fill, white label (14.12:1) |
  | Secondary | `.sc-button.btn-1` | outlined `#BD4B2B`, `#BD4B2B` label (4.99:1) | terracotta fill, ink label |
  | Tertiary | `.view-car` | outlined ink, ink label (16.30:1) | outlined `#BD4B2B`, `#BD4B2B` label |

  Solid fills, no gradients. They differ by **fill first, colour second**, so
  they stay distinguishable on a cheap LCD in sunlight. Minimum height 48px
  (44px tertiary). Outlines use `$color-3-text`, never `$color-3` — a
  terracotta border on white is 2.97:1, under the 3:1 a control boundary needs.
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
   non-text UI boundaries. Fixed in `_button.scss` (all three tiers) and on the
   form-field focus border in `_section.scss`, which now use `$color-3-text`.
   Still outstanding wherever else a 1px `$color-3` border is a control's only
   boundary — notably `_header.scss:1302`, which uses `outline: 2px solid
   $color-3` (2.97:1) as a focus ring; that should be `@include focusable`.
3. **Hardcoded hexes in React components** bypass these tokens entirely — see
   `components/dashboard/AddListing.jsx` and `components/footers/Footer1.jsx`.
   The `:root` custom properties in `abstracts/_base.scss` are the fix path.
4. **`public/assets/css/nice-select.css`** is vendor CSS with the template
   orange baked in at line 209.
5. **`style.scss` and `responsive.scss` are unowned.** The base typography
   lives there and has not been migrated to the scale above: `body` is still
   `$font-1` (Outfit — it should be `$font-2`/Inter; only `p` currently gets
   Inter) at 14px/19.6px, and the `.fs-*` / `.lh-*` / `.title-*` utilities are
   still the theme's px-named set. Until someone owns that file the scale is
   defined and available but not applied at the root. See the handover note in
   the design-foundations report for the exact replacement block.
6. **`$color-5` `#B6B6B6` is 2.03:1 on white** and appears as icon and label
   colour in several partials. It is a hairline/divider colour, not a text or
   icon colour; use `$color-7` (6.11:1).
7. **White on `$color-9` `#7ED321` is 1.87:1** and still appears on green
   fills in `_dashboard.scss` and `_widget.scss`. Labels on a green fill are
   ink (8.71:1), same rule as terracotta.
