/**
 * The price band, for the web app. **The entire identity of the business.**
 *
 * NICHE.md: only OMR 1,000–6,000 is ever listed. 1,000–1,499 is accepted but
 * labelled "sold as-is"; 1,500–6,000 is the standard band.
 *
 * These four numbers must stay identical to `BAND` in the CMS's
 * `listing/lifecycles.ts` and to the `min`/`max` on `listing/schema.json`.
 * `scripts/check-price-band.mjs` (`pnpm check:band`) asserts that on every run
 * and reads *this file* for the web side.
 *
 * It lives here rather than inside `components/dashboard/AddListing.jsx`, where
 * it used to, because it is no longer only the seller form's business: the
 * homepage budget bands (`data/budgetBands.js`) partition exactly this range,
 * and a second copy of the numbers is precisely the drift the checker exists to
 * prevent. A shared constant is also plain data, so importing it into a server
 * component costs nothing.
 */
export const BAND = {
  ASIS_MIN: 1000,
  ASIS_MAX: 1499,
  STANDARD_MIN: 1500,
  MAX: 6000,
};

export const CURRENCY = "OMR";
