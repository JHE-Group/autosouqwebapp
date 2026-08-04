# English keyword re-harvest — 2026-08-04

**Why this exists:** the previous English harvest was run through
`suggestqueries.google.com/complete/search?client=firefox`, which **ignores
`gl=`** and answers from the egress IP. It carried 363 findings tagged
`(gl=OM)` and was reading Irish autocomplete. See the warning block at the top
of `arabic-seo-strategy.md`. This pass re-ran the same seed set on
`client=chrome`, which honours the parameter.

**Method.** 143 English seeds, `client=chrome&hl=en&gl=om`, 2026-08-04. Any
completion identical to its own seed is discarded, so no seed can be counted as
its own rank-1 result — that was the second defect in the old file. Raw output:
`kw-english-rechecked.json` in the session scratchpad.

| | |
|---|---|
| seeds run | 143 |
| returned completions | 135 |
| returned nothing | 6 |
| request failed | 2 |
| total completions | 1,124 |

## How to read a negative here

`gl=om` is a geotargeting parameter, not an Omani IP, and autocomplete reflects
what Google is willing to suggest rather than what people search. **Presence of
a completion is moderate evidence. Absence is weak evidence.** Nothing below
says a term has no demand; it says the term did not surface, which is a reason
to look harder before building on it, not a reason to delete anything.

## Finding 1 — the two budget facets target a phrasing nobody completes

`/used-cars/under-2000-omr` and `/used-cars/under-3000-omr` are built on the
shape "cars under N OMR". That shape returned nothing, in either language:

| query | completions |
|---|---|
| `cars under 2000 omr` | 0 |
| `cars under 2000 in oman` | 0 |
| `used cars under 2000 oman` | 0 |
| `cars under 3000 omr` | 0 |
| `سيارات بسعر 2000 ريال عماني` | 0 |
| `سيارات باقل من 2000` | 8 — but toward Qatar and dirhams (`أقل من 20000 درهم`), not Omani rials |

Two shapes that **do** complete, and they are not the one we built:

- **The adjective, not the number.** `cheap cars oman` → `cheap cars in oman`,
  `cheapest cars in oman`. In Arabic `سيارات رخيصة عمان` → `سيارات رخيصه في
  عمان`, `سيارات رخيصة للبيع في عمان`, `سيارات رخيصة للبيع في سلطنة عمان`.
  NICHE.md already permits رخيصة on search-facing surfaces while the prose says
  في المتناول; this is the evidence for that rule.
- **Rial-first, not "under".** `riyal used car sale oman` → `500 riyal used car
  sale oman`, `1000 riyal used car sale oman`, `300 riyal used car sale oman`.
  Numeric budget search exists — the preposition and word order differ from
  ours. Note also that two of those three sit *below* the site's floor.

## Finding 2 — "GCC spec" does not complete, in either language

| query | completions |
|---|---|
| `gcc spec cars oman` | 0 |
| `gcc specs oman` | 0 |
| `gcc spec cars` | 13, none Omani |
| `سيارات خليجي عمان` | 0 |
| `خليجي ولا وارد` | 0 |

The *import* side of the same axis is the opposite — `وارد أمريكي` carries a
deep cluster (`رقم الشاصي وارد امريكي`, `وارد امريكي كلين تايتل`, `فحص سيارة
وارد امريكي`). So the axis has demand; the half we named the facet after is the
half that does not surface.

This does **not** argue for deleting the GCC-spec guide. That page exists to
correct a specific widespread error and earns its place on merit. It argues
that `/used-cars/gcc-spec` should not be expected to win traffic on its name,
and that the import phrasing is where the searches are.

## Finding 3 — OLX is a bigger entry point than the research assumed

`olx` appears throughout the corrected harvest as a navigational prefix, which
the competitor work did not centre:

- `olx oman` → `olx oman cars`, `olx oman jobs`, `olx oman mobile`
- `olx oman cars` → `olx oman cars toyota`, `… muscat`, `… sohar`
- `used cars oman` → `used car oman olx`
- `toyota corolla oman` → `toyota corolla olx oman`

People reach for a marketplace by name before they describe the car. Worth a
look at how that traffic behaves before assuming category terms are the way in.

## Finding 4 — `used cars muscat` collides with Muscatine, Iowa

`used cars muscat` completes, but leads with `used cars muscatine` and `used
cars muscatine iowa`. `used cars muscat oman` is present and unambiguous. The
disambiguating token matters in English exactly as عُمان's damma does in
Arabic — relevant to `/used-cars/muscat`, which is the facet five listings
would unlock.

## Seeds returning nothing

`cars under 2000 omr` · `cars under 3000 omr` · `gcc spec cars oman` ·
`gcc spec vs american specs` · `mulkiya transfer oman` ·
`pre purchase car inspection oman`

`mulkiya transfer oman` returning nothing while the concept is unmistakably
real is the clearest illustration of the caveat above: people search the
process, not our word for it.
