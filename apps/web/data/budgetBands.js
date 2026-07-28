import { BAND } from "@/lib/priceBand";

/**
 * The four budget bands the homepage offers as short-links into browse.
 *
 * ## Why adjacent ranges and not "under X"
 *
 * The obvious shape — `under 2,000`, `under 3,000`, `under 4,000` — is how the
 * two Omani incumbents *label* their price pages, and design/seo-research.md
 * §8 reads that as validation of the query shape. Later research measured what
 * those pages actually return: on hatla2ee, `/price-limit/2500` shares **18 of
 * 20 listings** with `/price-limit/2000`, while `/price-limit/3000` shares
 * **0**. Their ladder is labelled with ceilings and implemented as ranges.
 *
 * Cumulative ceilings are near-duplicates of each other by construction, and
 * each one is a near-duplicate of `/used-cars` itself — the hub's own H1 is
 * already "Used cars in Oman under OMR 6,000". Adjacent ranges partition the
 * catalogue instead: every car appears in exactly one band.
 *
 * We also decline the "under X" *label*, which the incumbents keep. On a site
 * whose argument is that it does not overstate what it has, a link reading
 * "under OMR 3,000" that hides the OMR 1,200 cars beneath it is the wrong
 * trade.
 *
 * ## Why these boundaries
 *
 * 1,000 and 6,000 are the product (NICHE.md). 1,500 is the sold-as-is line,
 * already enforced in the CMS and the seller form. 2,500 is the one editorial
 * boundary: from live Omani listings it is roughly where a car stops being
 * high-mileage and starts having life left in it — a 2007 Corolla sits at
 * ~1,550, a 2014 at ~2,700. 4,000 splits the remainder.
 *
 * Weighted low on purpose. OpenSooq generates tag pages from real user queries,
 * and its Oman price ladder runs 300 / 500 / 800 / 1,000 / 1,500 and then
 * stops. Omani budget-search demand sits at or below our floor, so the bands
 * are finest where the buyers are and coarsest at the top, where a single
 * 4,000–6,000 band is a navigation convenience rather than a demand signal.
 */

/** @typedef {{ id: string, min: number, max: number, asIs?: boolean }} BudgetBand */

/** @type {BudgetBand[]} */
export const BUDGET_BANDS = [
  // `max` is inclusive of everything below it and exclusive of itself, so the
  // bands tile the range with no gap and no overlap: [1000,1500) [1500,2500)
  // [2500,4000) [4000,6000].
  { id: "asIs", min: BAND.ASIS_MIN, max: BAND.STANDARD_MIN, asIs: true },
  { id: "entry", min: BAND.STANDARD_MIN, max: 2500 },
  { id: "mid", min: 2500, max: 4000 },
  { id: "upper", min: 4000, max: BAND.MAX + 1 },
];

/** Does this car fall in this band? The one definition of that question. */
export function matchesBand(car, band) {
  const price = Number(car?.price);
  return Number.isFinite(price) && price >= band.min && price < band.max;
}

/** How many of `listings` sit in this band. */
export function countInBand(listings, band) {
  return (listings ?? []).filter((car) => matchesBand(car, band)).length;
}

/**
 * The `?price=` value for a band — the contract between the homepage link and
 * the browse page's filter. `min-max`, inclusive-exclusive, matching
 * `matchesBand` so a tile's count and its destination can never disagree.
 */
export function bandParam(band) {
  return `${band.min}-${band.max}`;
}

/**
 * Parse a `?price=` value back into a [min, max] pair, or null.
 *
 * Deliberately strict: anything that is not two plain integers is ignored
 * rather than coerced, so a hand-edited or crawler-mangled URL falls back to
 * the unfiltered grid instead of rendering an empty one.
 */
export function parsePriceParam(value) {
  const match = /^(\d{1,7})-(\d{1,7})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  return [min, max];
}
