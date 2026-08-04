#!/usr/bin/env node
/**
 * Three lists in three places have to agree about Omani geography.
 *
 *   apps/web/lib/omanCities.js         what the seller can choose
 *   apps/cms/src/index.ts              what the CMS can store
 *   apps/web/data/muscatLocalities.js  what /used-cars/muscat counts
 *
 * None of them imports another, and a disagreement between them fails
 * silently in both directions.
 *
 * It already had. The form offered 24 places and the CMS seeded six, so 18
 * resolved to nothing — resolveRelations logs a warning and files the listing
 * anyway, deliberately, so that a vocabulary gap never blocks a seller. The
 * effect was that a seller in Ruwi answered the location question and the
 * answer was thrown away, taking the listing's place in every city facet with
 * it, while `/used-cars/muscat` waited for five listings that the Muscat-area
 * sellers were being prevented from contributing.
 *
 * The first fix mapped those places onto "Muscat" when the listing was written.
 * That passed the facet gate and was still wrong: muscatLocalities.js already
 * aggregates at READ time, and flattening on write discards the locality for
 * good — which forecloses the neighbourhood facet pages that file's header
 * plans for. So every place now has its own row, and this checks all three
 * agree.
 *
 * Run: node scripts/check-cities.mjs   (also `pnpm check:cities`)
 */
import { readFileSync } from "node:fs";
import { OMAN_CITIES } from "../apps/web/lib/omanCities.js";
import { MUSCAT_LISTING_LOCATIONS } from "../apps/web/data/muscatLocalities.js";

const src = readFileSync(
  new URL("../apps/cms/src/index.ts", import.meta.url),
  "utf8",
);

const block = src.match(/cities\s*(?::[^=]*)?=\s*\[(.*?)\n\s*\];/s);
if (!block) {
  console.error(
    "✗ could not find the city seed array in apps/cms/src/index.ts — it was " +
      "renamed or restructured, and this check went blind",
  );
  process.exit(1);
}

const cms = [...block[1].matchAll(/name:\s*"([^"]+)",\s*nameAr:\s*"([^"]+)",\s*slug:\s*"([^"]+)"/g)]
  .map(([, name, nameAr, slug]) => ({ name, nameAr, slug }));

if (cms.length < 10) {
  console.error(`✗ parsed only ${cms.length} CMS cities — check went blind`);
  process.exit(1);
}

const problems = [];
const byName = new Map(cms.map((c) => [c.name.toLowerCase(), c]));

// 1. Every place the form offers must be storable.
for (const city of OMAN_CITIES) {
  if (!byName.has(city.en.toLowerCase())) {
    problems.push(
      `"${city.en}" is in the seller's dropdown and has no CMS row — the ` +
        `answer will be discarded silently`,
    );
  }
}

// 2. Arabic labels must match, or an Arabic seller's choice misses pickTaxonomy
//    on the nameAr candidate and falls through to a different row.
for (const city of OMAN_CITIES) {
  const row = byName.get(city.en.toLowerCase());
  if (row && row.nameAr !== city.ar) {
    problems.push(
      `"${city.en}" is «${city.ar}» in the form and «${row.nameAr}» in the CMS`,
    );
  }
}

/**
 * 3. isMuscatListing compares a listing's citySlug against these names with
 *    spaces turned to hyphens. A CMS slug in any other shape drops the car out
 *    of /used-cars/muscat without changing anything visible.
 */
const slugOf = (name) => name.toLowerCase().replace(/\s+/g, "-");
for (const name of MUSCAT_LISTING_LOCATIONS) {
  const row = byName.get(name.toLowerCase());
  if (!row) continue; // Not offered by the form yet; forward-compatible.
  if (row.slug !== slugOf(name)) {
    problems.push(
      `"${name}" has CMS slug "${row.slug}" but isMuscatListing looks for ` +
        `"${slugOf(name)}" — this car will not count toward /used-cars/muscat`,
    );
  }
}

if (problems.length) {
  console.error(
    "✗ the form, the CMS and the Muscat facet disagree:\n" +
      problems.map((p) => "  " + p).join("\n"),
  );
  process.exit(1);
}

const muscatRows = MUSCAT_LISTING_LOCATIONS.filter((n) =>
  byName.has(n.toLowerCase()),
).length;

console.log(
  `✓ all ${OMAN_CITIES.length} places the form offers have a CMS row with a ` +
    `matching Arabic name; ${muscatRows} of them count toward /used-cars/muscat`,
);
