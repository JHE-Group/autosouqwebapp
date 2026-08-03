/**
 * Composing a listing title from its parts.
 *
 * Deliberately dependency-free. `strapi.js` reaches next-intl's routing through
 * `locale.js`, which makes it unimportable outside a Next runtime — so the rule
 * below could not be tested where it matters if it lived there. Here,
 * `scripts/check-title-dedup.mjs` can drive the real function over the real CMS
 * taxonomy with plain node.
 *
 * Resolving `{ name, nameAr }` down to one string stays in `strapi.js`, because
 * that is locale plumbing. What arrives here is two labels and a year.
 */

/**
 * Some nameplates carry their own brand and have to keep it. An Omani writes
 * مازدا 6, never a bare 6; "3 Series" without "BMW" is not a car anyone
 * searches for. So in 17 of the CMS's 69 model rows the model label already
 * begins with the make label, and concatenating both produced
 * "2015 BMW BMW 3 Series" on /en and "انفينيتي انفينيتي QX60 2015" on /ar — in
 * the h1, the last breadcrumb, the SERP title and the meta description.
 *
 * Ten of the seventeen doubled in English too, so this was never an Arabic
 * bug. It only looked like one because Arabic is the default locale.
 *
 * The CMS data is right and is left alone: strip the brand out of `nameAr` and
 * the title is fixed while the model dropdown becomes unusable, because a bare
 * "6" or "ZS" under a Mazda filter is not a label anyone can pick. This is the
 * layer that holds both tokens, so it is the layer that can see they are one.
 */
export function dropDuplicatedMake(make, model) {
  if (!make || !model || !model.startsWith(make)) return make;
  // Require a word boundary. Without it, a distinct nameplate that merely
  // shares a prefix with its make — "MGB" under "MG" — would lose its brand
  // altogether, which is the worse failure of the two.
  const next = model.charAt(make.length);
  return next === "" || next === " " ? null : make;
}

/**
 * Arabic leads with the make and trails the year; English leads with the year.
 * Both orders are what AddListing.jsx shows the seller as a preview, so a title
 * generated here has to match the one they were shown.
 */
export function composeTitle(make, model, year, locale) {
  if (!make && !model) return null;
  const m = dropDuplicatedMake(make, model);
  const y = year ? String(year) : null;
  const parts = locale === "ar" ? [m, model, y] : [y, m, model];
  return parts.filter(Boolean).join(" ") || null;
}
