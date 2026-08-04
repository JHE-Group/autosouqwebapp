#!/usr/bin/env node
/**
 * Every field the seller answers must reach somewhere.
 *
 * Eleven did not. The form collected body, colour, transmission, fuel type,
 * doors, cylinders, seats, engine size, drive type, phone and video URL; the
 * CMS had a column for every one of them; api/listings sent none of them and
 * buildDescription mentioned none of them. The seller answered and the answer
 * stopped at the route.
 *
 * Four of the eleven were the ones the BUYER filters on. bodyType,
 * transmission, fuelType and color are relations that toCar() maps and that
 * components/carsListings builds its filter options from — so a seller who
 * answered "Automatic" and "Petrol" filed a car that matched neither the
 * Automatic filter nor the Petrol one, and whose card showed no transmission.
 * The form asked, the CMS could store it, the browse page needed it, and the
 * route dropped it.
 *
 * Nothing failed. That is the point of this check: a discarded field raises no
 * error anywhere, so only an assertion finds it.
 *
 * Run: node scripts/check-submitted-fields.mjs  (also `pnpm check:fields`)
 */
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const form = read("apps/web/components/dashboard/AddListing.jsx");
const route = read("apps/web/app/api/listings/route.js");

// What the form collects: every `set("field", …)` call.
const collected = new Set(
  [...form.matchAll(/\bset\("([a-zA-Z]+)"/g)].map((m) => m[1]),
);

if (collected.size < 20) {
  console.error(
    `✗ parsed only ${collected.size} form fields — AddListing changed shape ` +
      `and this check went blind`,
  );
  process.exit(1);
}

// Where a field can legitimately end up.
const asRelation = new Set(
  [...route.matchAll(/\["[a-zA-Z]+",\s*"[a-z-]+",\s*form\.([a-zA-Z]+)\]/g)].map(
    (m) => m[1],
  ),
);
const inPayload = new Set(
  [...route.matchAll(/\bform\.([a-zA-Z]+)/g)].map((m) => m[1]),
);

/**
 * Fields that deliberately do not travel, with the reason. Anything else that
 * stops at the route fails this check.
 */
const DELIBERATE = {
  // Answered to decide whether the *other* fault fields are shown; the prose
  // it produces is what matters, and buildDescription already writes it.
  noKnownFaults: "folded into the description as prose",
};

const stranded = [...collected].filter(
  (field) =>
    !asRelation.has(field) && !inPayload.has(field) && !(field in DELIBERATE),
);

if (stranded.length) {
  console.error(
    "✗ the seller answers these and nothing carries them:\n" +
      stranded
        .map(
          (f) =>
            `  ${f} — send it in the payload, resolve it as a relation, or ` +
            `write it into buildDescription`,
        )
        .join("\n"),
  );
  process.exit(1);
}

/**
 * The four the buyer filters on. Named individually because losing one of
 * these is not "a field went missing", it is "seller listings became invisible
 * to a filter", and the generic message above would undersell it.
 */
const FILTERABLE = ["body", "transmission", "fuelType", "color"];
const missingFilterable = FILTERABLE.filter((f) => !asRelation.has(f));
if (missingFilterable.length) {
  console.error(
    "✗ these are browse filters and are not resolved as relations:\n" +
      missingFilterable
        .map((f) => `  form.${f} — seller listings will match no ${f} filter`)
        .join("\n"),
  );
  process.exit(1);
}

console.log(
  `✓ all ${collected.size} collected fields reach the CMS or the description ` +
    `(${asRelation.size} as relations, including all ${FILTERABLE.length} browse filters)`,
);
