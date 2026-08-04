#!/usr/bin/env node
/**
 * Every place the form offers must reach a CMS city row — directly, or through
 * a parent.
 *
 * The form offered 24 places and apps/cms/src/index.ts seeded six, so 18 of
 * them resolved to nothing. `resolveRelations` logs a warning and files the
 * listing anyway, by design, so nobody found out: the seller was asked for
 * their location, answered, and the answer was dropped between the form and
 * the database.
 *
 * It cost more than a field. The city relation composes the public URL and
 * decides facet membership, so the Muscat-area sellers — most sellers — filed
 * cars that joined no city facet, while `/used-cars/muscat` waited for enough
 * listings to exist. The people who would have unlocked it were the ones being
 * dropped.
 *
 * Two lists in two apps that must agree, with no import between them, is
 * exactly the shape that drifts. So: assert it.
 *
 * Run: node scripts/check-cities.mjs   (also `pnpm check:cities`)
 */
import { readFileSync } from "node:fs";
import { OMAN_CITIES, cityParent } from "../apps/web/lib/omanCities.js";

const src = readFileSync(
  new URL("../apps/cms/src/index.ts", import.meta.url),
  "utf8",
);

// The city seed block, read out of the CMS rather than duplicated here.
const block = src.match(/cities\s*(?::[^=]*)?=\s*\[(.*?)\n\s*\];/s);
if (!block) {
  console.error(
    "✗ could not find the city seed array in apps/cms/src/index.ts — it was " +
      "renamed or restructured, and this check went blind",
  );
  process.exit(1);
}
const cmsCities = [...block[1].matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);

if (cmsCities.length < 3) {
  console.error(`✗ parsed only ${cmsCities.length} CMS cities — check went blind`);
  process.exit(1);
}

const known = new Set(cmsCities.map((c) => c.toLowerCase()));
const unreachable = [];

for (const city of OMAN_CITIES) {
  if (known.has(city.en.toLowerCase())) continue;
  const parent = cityParent(city.en);
  if (parent && known.has(parent.toLowerCase())) continue;
  unreachable.push(city.en);
}

/**
 * Five places are knowingly unreachable: separate cities in other governorates
 * that want their own CMS rows, which is a CMS-branch change. Listed by name so
 * that adding a 25th place to the form without a row fails here rather than
 * joining them silently — and so that adding the rows makes this list shrink
 * visibly.
 */
const KNOWN_MISSING = ["Ibri", "Rustaq", "Ibra", "Buraimi", "Khasab"];

const unexpected = unreachable.filter((c) => !KNOWN_MISSING.includes(c));
const fixed = KNOWN_MISSING.filter((c) => !unreachable.includes(c));

if (unexpected.length) {
  console.error(
    "✗ places the form offers that reach no CMS city:\n" +
      unexpected.map((c) => `  ${c} — add a CMS row, or give it a parent`).join("\n"),
  );
  process.exit(1);
}

if (fixed.length) {
  console.error(
    "✗ these are no longer missing — remove them from KNOWN_MISSING:\n" +
      fixed.map((c) => "  " + c).join("\n"),
  );
  process.exit(1);
}

const viaParent = OMAN_CITIES.filter(
  (c) => !known.has(c.en.toLowerCase()) && cityParent(c.en),
).length;

console.log(
  `✓ ${OMAN_CITIES.length - unreachable.length}/${OMAN_CITIES.length} places reach a CMS city ` +
    `(${viaParent} via a parent); ${KNOWN_MISSING.length} known-missing await CMS rows`,
);
