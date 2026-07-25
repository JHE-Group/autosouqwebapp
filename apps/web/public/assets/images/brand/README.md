# Autosouq.om brand assets

The real logo artwork, supplied by the client as Illustrator SVG exports on
25 July 2026. These replace the AutoDeal template's placeholder logos.

Every file here is vector, text already converted to outlines — so the wordmark
renders identically on machines with no brand font installed, including the
budget Android devices NICHE.md describes. Gzipped, the horizontal lockup is
~1.9 KB against the 7.3 KB template PNG it replaces.

## Palette

Read directly off the artwork's vector fills. **This is the authoritative brand
palette** — it supersedes both the AutoDeal template's orange `#FF7101` and the
earlier guessed yellow/navy in the tokens files.

| Name | Hex | Role |
|---|---|---|
| Terracotta | `#E97451` | the mark; the accent colour |
| Indigo | `#262262` | the wordmark; dark surfaces |
| Cream | `#F1E4C5` | wordmark on dark; warm surface |
| Ink | `#231F20` | near-black, mono lockups |
| White | `#FFFFFF` | reversed mono |

## Naming

`logo-{lockup}-{colourway}.svg` and `icon-{colour}.svg`.

### Lockups

| Prefix | Contents | viewBox | Ratio |
|---|---|---|---|
| `logo-horizontal-` | mark + "Autosouq" | 566.9 × 283.5 | 2:1 |
| `logo-horizontal-om-` | mark + "Autosouq.om" | 566.9 × 196.1 | 2.89:1 |
| `logo-vertical-` | mark above "Autosouq" | 566.9 × 566.9 | 1:1 |
| `logo-vertical-om-` | mark above "Autosouq.om" | 566.9 × 566.9 | 1:1 |
| `icon-` | mark alone | 566.9 × 566.9 | 1:1 |

The four lockups have **different aspect ratios**. Set `width`/`height` from the
viewBox — reusing the old PNG dimensions squashes the mark.

### Colourways

Suffix reads *text colour* then *mark colour*; a single word means monochrome.

| Suffix | Text | Mark | Use on |
|---|---|---|---|
| `primary` | indigo | terracotta | light backgrounds — **the default** |
| `ink-terracotta` | ink | terracotta | light, when indigo is too blue |
| `cream-terracotta` | cream | terracotta | dark / indigo backgrounds |
| `indigo-cream` | indigo | cream | cream or light-warm surfaces |
| `ink-cream` | ink | cream | cream surfaces |
| `terracotta` | — | — | mono, light backgrounds |
| `indigo` | — | — | mono, light backgrounds |
| `ink` | — | — | mono; print, faxes, single-colour |
| `white` | — | — | mono, reversed on photos/dark |

Icons: `icon-terracotta`, `icon-indigo`, `icon-cream`, `icon-ink`, `icon-white`.

## Picking one

Check the background before you choose. Indigo-on-dark and cream-on-light are
both unreadable, and either one on a trust-led marketplace reads as carelessness.

- Light header → `logo-horizontal-om-primary.svg`
- Dark/indigo footer → `logo-horizontal-om-cream-terracotta.svg`
- Favicon / app icon → an `icon-*` variant (the wordmark is illegible at 32px)
- Over a photo → `logo-*-white.svg`

## Where PNG is still required

SVG does not work everywhere, so the vector set above is not the whole story.
These rasters are generated from it and live in `apps/web/app/` (Next.js
file-convention routes) and `pwa-icon-*.png` in this folder:

| Asset | Size | Why not SVG |
|---|---|---|
| `app/opengraph-image.png` | 1200 × 630 | WhatsApp, Instagram and Facebook will not render an SVG in a link preview. NICHE.md makes WhatsApp sharing the growth channel, so a broken preview is a real cost. |
| `app/twitter-image.png` | 1200 × 630 | same |
| `app/favicon.ico` | 16/32/48 | legacy browsers and scrapers hard-request `/favicon.ico` |
| `app/icon.png` | 512 × 512 | older Android WebViews don't reliably do SVG favicons |
| `app/apple-icon.png` | 180 × 180 | iOS home screen |
| `pwa-icon-{192,512,maskable-512}.png` | — | Android home screen / manifest |

## Regenerating

Two scripts, both reproducible from the repo alone — no scratchpad, no network:

```sh
node design/brand/generate.mjs                 # the 41 vector lockups
node design/brand/generate-raster-assets.mjs   # favicon, app icons, OG cards
```

The vectors are built from five geometry templates in `design/brand/templates/`
by substituting two colour tokens, so path data is identical across every
colourway of a lockup. **Add a colourway by extending the table in
`generate.mjs`, not by hand-editing 41 files.** Re-run the raster script after
any vector change, or the icons and the site will disagree.

The raster script uses `sharp` (a hoisted transitive Next.js dependency) for SVG
rasterising. Note the OG card's Arabic is currently set in Geeza Pro, a macOS
system font baked into the PNG — if brand fonts are chosen later, regenerate.
