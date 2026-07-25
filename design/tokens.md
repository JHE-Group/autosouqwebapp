# Autosouq.om — Design Tokens (extracted from the AutoDeal theme, July 24 2026)

Extracted from `autodeal/css/main.css` and the autodeal-listing plugin CSS in the package you bought. Use this with the build spec: it gives the Next.js site the visual identity you paid for, without any theme code. Hand the Tailwind block below to Claude Code in Week 2 ("use these tokens in tailwind.config").

## Palette (as found in the theme)

| Role | Hex | Where the theme uses it |
|---|---|---|
| Ink / headings | `#24272C` | primary text color (the theme's `--dark-text-color`) |
| Deep navy | `#0A1426` | dark sections, footer, hero backgrounds |
| Body text | `#696665` | paragraph text (`--dark-text-body-color`) |
| Muted | `#8E8E93` / `#9C9EA6` | secondary text, meta info |
| Accent yellow | `#FDD906` (hover `#FBD83F`) | highlights, ribbons, promo elements |
| Border | `#EFEFEF` / `#EDEDED` | card borders, dividers |
| Surface | `#F6F6F6` | page-section backgrounds |
| White | `#FFFFFF` | cards, main background |

**Autosouq adaptations (add these — not from the theme):**

| Role | Hex | Why |
|---|---|---|
| WhatsApp green | `#25D366` | every contact CTA — buyers convert on WhatsApp |
| Verified teal | `#0F9D58` (or keep WhatsApp green family) | Verified badge |
| As-is amber | `#B45309` | "Sold as-is" label on 1,000–1,499 OMR cars |
| Danger | `#DC3545` | form errors (theme uses Bootstrap red) |

Note: the theme's yellow (#FDD906) reads well on the navy — keep it as the brand accent (price highlights, featured ribbons). It also happens to suit a budget-brand personality: bright, honest, market-stall energy.

## Typography

- Primary UI font: **Inter** (76 uses — the theme's workhorse). For Arabic, pair with **IBM Plex Sans Arabic** or **Noto Sans Arabic** (Inter has no Arabic glyphs; pick one and load both via `next/font`).
- Display/secondary: DM Sans / Outfit appear sparingly — skip them; one Latin + one Arabic family keeps the site fast.
- Weights used: 400 body, 500 headings (Bootstrap base), bold for prices.

## Shape & spacing

- Radii: cards `14px`, buttons/inputs `10px`, small elements `5px`, avatars/pills `50%`.
- Borders: 1px `#EFEFEF` on cards.
- The theme also ships a dark mode (`body.dark-light` swaps the ink/border variables) — ignore for v1.

## Tailwind config block (paste into `tailwind.config.ts`)

```ts
export default {
  theme: {
    extend: {
      colors: {
        ink: '#24272C',
        navy: '#0A1426',
        body: '#696665',
        muted: '#8E8E93',
        accent: { DEFAULT: '#FDD906', hover: '#FBD83F' },
        line: '#EFEFEF',
        surface: '#F6F6F6',
        whatsapp: '#25D366',
        verified: '#0F9D58',
        asis: '#B45309',
      },
      borderRadius: {
        card: '14px',
        btn: '10px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-arabic)', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
    },
  },
}
```

## Component conventions to carry over (from the theme's look)

- Listing card: white card, 14px radius, 1px `#EFEFEF` border, photo top with rounded top corners, **price in bold ink with the accent yellow as highlight**, meta row (year · km · city) in muted, WhatsApp-green CTA button full-width at the card bottom on mobile.
- Dark navy footer and hero sections with white text and yellow accent — this is the theme's most distinctive look; keep it.
- Buttons: 10px radius, solid fills, no gradients (the theme's gradient uses of the yellow are decorative ribbons — skip).

## What NOT to carry over

- Bootstrap (the theme is Bootstrap 5; you're on Tailwind — take the tokens, not the framework).
- The `autodeal` icon font — use Lucide or Heroicons instead.
- Demo/stock car photos — not licensed for reuse; real listing photos only.
- LTR-first layouts — Autosouq is RTL-first; mirror everything.
