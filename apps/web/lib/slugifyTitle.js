/**
 * Minting the CMS slug for a seller's listing.
 *
 * Dependency-free so scripts/check-listing-slug.mjs can exercise it directly.
 * The rule it enforces is not local to this function — lib/resolveListing.js
 * decides what a slug means, and these two have to agree or a published car is
 * unreachable on its own URL.
 */
/**
 * Mint the slug ourselves, because Strapi will not.
 *
 * `slug` is a `uid` with `targetField: "title"`, which reads as "Strapi fills
 * this in". It does — in the **admin panel**, where the generation is a
 * client-side convenience. Over the content API the field simply arrives null,
 * `required: true` notwithstanding: verified by submitting a listing and
 * reading the row back, which came out `slug=<NULL>` with a perfectly good
 * title beside it.
 *
 * That is a silent break rather than a loud one. The listing saves, the seller
 * is told it worked, and the damage only appears when a human publishes it and
 * the car's page is at `/car/` with nothing after the slash.
 *
 * Non-Latin titles collapse here — a seller may well type an Arabic make — so
 * there is a fallback rather than an empty string, which would fail the same
 * way.
 *
 * That sentence used to say they "collapse to empty", and believing it is how
 * the Arabic 404 survived a fix aimed at exactly this bug. They do not collapse
 * to empty. A title is [make, model, year], and the year is Latin: "تويوتا
 * كورولا 2015" reduces to "2015" — non-empty, so the `|| "listing"` fallback
 * never fires, and a bare year is the one shape resolveListing mistakes for a
 * numeric id. Hence the digit guard below, and the taxonomy-first composition
 * in the route that calls this.
 */
export function slugifyTitle(title) {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  /*
   * A slug may not begin with a digit. lib/resolveListing matches
   * `/^(\d+)(?:-|$)/` as a numeric listing id, looks that id up, misses, and
   * returns — it never falls through to slug matching. So a leading digit is
   * not a cosmetic problem, it is a 404.
   *
   * That is not hypothetical for Arabic. slugify keeps only [a-z0-9], so
   * "تويوتا كورولا 2015" reduces to "2015" — the year is the only surviving
   * character class — and Arabic is the default locale. Word order was
   * reordered to [make, model, year] in 985cc28 to keep the year off the front,
   * which fixed the English path and could not fix this one.
   */
  const safe = /^\d/.test(base) ? `car-${base}` : base;

  return safe || "listing";
}
