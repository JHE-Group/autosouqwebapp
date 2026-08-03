#!/usr/bin/env node
/**
 * A listing title is derived, never typed — `[year, make, model]` in English,
 * `[make, model, year]` in Arabic. That is only correct while the make and the
 * model are two different tokens, and in 17 of the CMS's 69 model rows they are
 * not: the nameplate carries its own brand.
 *
 * Ten of those seventeen doubled in ENGLISH — "2015 BMW BMW 3 Series",
 * "2015 Mazda Mazda 6", "2015 MG MG ZS" — and all seventeen doubled in Arabic,
 * where the affected set also includes rows whose English `name` is a bare code
 * ("QX60") but whose `nameAr` spells the make out ("انفينيتي QX60"). The title
 * is the h1, the last breadcrumb, the SERP title and the meta description, so
 * this was visible to Google in both languages.
 *
 * The data is not the bug and is left alone: "Mazda 6" and "3 Series" have to
 * keep their brand in the model dropdown, where a bare "6" is not a label
 * anyone can pick. The fix lives in the generator, and this script holds it
 * there by driving the REAL composeTitle() over the REAL taxonomy in
 * apps/cms/src/index.ts — neither of them a copy. A new doubling row added to
 * the CMS fails this check without anyone having to remember the rule.
 *
 * Run: node scripts/check-title-dedup.mjs   (also `pnpm check:titles`)
 */
import { readFileSync } from "node:fs";
import { composeTitle } from "../apps/web/lib/listingTitle.js";

const src = readFileSync(
  new URL("../apps/cms/src/index.ts", import.meta.url),
  "utf8",
);

const MAKE = /\{\s*name:\s*"([^"]+)",\s*nameAr:\s*"([^"]+)",\s*slug:\s*"([^"]+)"\s*\}/g;
const MODEL =
  /\{\s*name:\s*"([^"]+)",\s*nameAr:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*make:\s*"([^"]+)"\s*\}/g;

const makes = new Map(
  [...src.matchAll(MAKE)].map(([, name, nameAr, slug]) => [
    slug,
    { name, nameAr },
  ]),
);
const models = [...src.matchAll(MODEL)].map(([, name, nameAr, slug, make]) => ({
  name,
  nameAr,
  slug,
  make,
}));

// If the row shape in index.ts changes, this check would silently pass on an
// empty set. Fail loudly instead.
if (makes.size < 20 || models.length < 60) {
  console.error(
    `✗ parsed only ${makes.size} makes and ${models.length} models from ` +
      `apps/cms/src/index.ts — the row shape changed and this check went blind`,
  );
  process.exit(1);
}

const problems = [];

for (const model of models) {
  const make = makes.get(model.make);
  if (!make) continue; // assertTaxonomyIsUrlSafe already fails on unknown refs.

  for (const locale of ["en", "ar"]) {
    const makeLabel = locale === "ar" ? make.nameAr : make.name;
    const modelLabel = locale === "ar" ? model.nameAr : model.name;
    const title = composeTitle(makeLabel, modelLabel, 2015, locale);
    const occurrences = title.split(makeLabel).length - 1;

    if (occurrences > 1) {
      problems.push(
        `${locale}: "${title}" repeats "${makeLabel}" (${model.make}/${model.slug})`,
      );
    }
    // Dropping too eagerly is the worse failure: a title with no brand in it.
    if (occurrences === 0) {
      problems.push(
        `${locale}: "${title}" has lost "${makeLabel}" entirely (${model.make}/${model.slug})`,
      );
    }
  }
}

// A model that merely shares a prefix with its make keeps it. Without the
// boundary check, `startsWith` would strip "MG" from "MGB".
const cases = [
  ["MG", "MGB", 2015, "en", "2015 MG MGB"],
  ["Mazda", "Mazda 6", 2015, "en", "2015 Mazda 6"],
  ["بي ام دبليو", "الفئة الثالثة", 2015, "ar", "بي ام دبليو الفئة الثالثة 2015"],
  ["انفينيتي", "انفينيتي QX60", 2015, "ar", "انفينيتي QX60 2015"],
  // A year is optional; a make with no model still titles.
  ["Toyota", null, 2015, "en", "2015 Toyota"],
  ["Toyota", "Corolla", null, "en", "Toyota Corolla"],
];
for (const [make, model, year, locale, expected] of cases) {
  const got = composeTitle(make, model, year, locale);
  if (got !== expected) {
    problems.push(`composeTitle(${make}, ${model}, ${year}, ${locale}) = "${got}", expected "${expected}"`);
  }
}

if (problems.length) {
  console.error(
    "✗ listing titles repeat the make:\n" +
      problems.map((p) => "  " + p).join("\n"),
  );
  process.exit(1);
}

console.log(
  `✓ no listing title repeats its make — ${models.length} models × 2 locales, ` +
    `plus ${cases.length} boundary cases`,
);
