#!/usr/bin/env node
/**
 * A published listing has to be reachable at its own URL.
 *
 * Two files decide that and they are not adjacent: `lib/slugifyTitle.js` mints
 * the slug, and `lib/resolveListing.js` reads `/^(\d+)(?:-|$)/` as a numeric
 * listing id. When they disagree the failure is total and silent — the seller
 * is told the listing saved, a moderator publishes it, and the car 404s on the
 * page every link points at.
 *
 * They have disagreed twice.
 *
 *   985cc28  Titles were [year, make, model], so every slug began with a year
 *            and every seller listing 404'd. Fixed by reordering the title to
 *            [make, model, year].
 *   this     That reorder cannot help a seller filing in ARABIC, which is the
 *            default locale. slugifyTitle keeps only [a-z0-9], so
 *            "تويوتا كورولا 2015" reduces to "2015" — the year is the only
 *            surviving character class — and the slug leads with a digit again.
 *
 * So this asserts the contract rather than either implementation: whatever a
 * title is, the slug it produces must not be read as a numeric id. It runs the
 * real `slugifyTitle` and the real regex from `resolveListing`.
 *
 * Run: node scripts/check-listing-slug.mjs   (also `pnpm check:slugs`)
 */
import { readFileSync } from "node:fs";
import { slugifyTitle } from "../apps/web/lib/slugifyTitle.js";

// The regex is read out of resolveListing rather than copied, so that editing
// it there without thinking about this contract fails here.
const resolveSrc = readFileSync(
  new URL("../apps/web/lib/resolveListing.js", import.meta.url),
  "utf8",
);
const match = resolveSrc.match(/=\s*raw\.match\((\/.+\/[gimsuy]*)\);/);
if (!match) {
  console.error(
    "✗ could not find the numeric-id regex in lib/resolveListing.js — it was " +
      "renamed or restructured, and this check went blind",
  );
  process.exit(1);
}
// eslint-disable-next-line no-eval -- reading our own source, not input.
const NUMERIC_ID = eval(match[1]);

const problems = [];

/** Titles a seller can actually produce, in both languages. */
const TITLES = [
  // English: [make, model, year], the order 985cc28 established.
  "Toyota Corolla 2015",
  "Nissan Sunny 2019",
  "MG 5 2021",
  "BMW 3 Series 2014",
  // Arabic: the same fields, from the Arabic datalist on the default locale.
  "تويوتا كورولا 2015",
  "نيسان صني 2019",
  "هوندا سيفيك 2013",
  "ميتسوبيشي لانسر 2016",
  // Degenerate but reachable: no make/model resolved, year only.
  "2015",
  // Mixed, and a title with no year at all.
  "تويوتا Corolla 2015",
  "Toyota Corolla",
];

for (const title of TITLES) {
  const slug = `${slugifyTitle(title)}-ab3f`;
  if (NUMERIC_ID.test(slug)) {
    problems.push(
      `"${title}" -> "${slug}" is read as numeric id ` +
        `${slug.match(NUMERIC_ID)[1]}; the listing 404s on its own URL`,
    );
  }
  if (!slug || slug === "-ab3f") {
    problems.push(`"${title}" -> "${slug}" is empty; the car's page is /car/`);
  }
}

/**
 * The route prefers a slug composed from the resolved taxonomy, whose slugs are
 * Latin whatever the seller typed. That path must also clear the contract —
 * and it is the one that gives an Arabic-filed car the same URL as an
 * English-filed one, which is what hreflang wants.
 */
for (const [make, model, year] of [
  ["toyota", "corolla", 2015],
  ["nissan", "sunny", 2019],
  ["mg", "mg-5", 2021],
]) {
  const slug = `${[make, model, year].join("-")}-ab3f`;
  if (NUMERIC_ID.test(slug)) {
    problems.push(`taxonomy slug "${slug}" is read as a numeric id`);
  }
}

// And the guard must not fire where it is not needed — a Latin title should
// keep its readable slug rather than being prefixed for no reason.
const plain = slugifyTitle("Toyota Corolla 2015");
if (plain !== "toyota-corolla-2015") {
  problems.push(
    `Latin titles must be untouched: expected "toyota-corolla-2015", got "${plain}"`,
  );
}

if (problems.length) {
  console.error(
    "✗ listing slugs resolve to nothing:\n" +
      problems.map((p) => "  " + p).join("\n"),
  );
  process.exit(1);
}

console.log(
  `✓ every listing slug survives resolveListing — ${TITLES.length} titles ` +
    `(English, Arabic, mixed, degenerate) plus 3 taxonomy-composed`,
);
