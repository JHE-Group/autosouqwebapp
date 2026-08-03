#!/usr/bin/env node
/**
 * The OMR 1,500–6,000 band is stated in three places that must agree:
 *
 *   apps/cms/src/api/listing/content-types/listing/schema.json   (min/max)
 *   apps/cms/src/api/listing/content-types/listing/lifecycles.ts (BAND)
 *   apps/web/lib/priceBand.js                                    (BAND)
 *
 * NICHE.md calls the band "the entire identity of the business". Until now the
 * only thing keeping the three in step was a comment asking the next person to
 * remember. A silent divergence is not a cosmetic bug: if the web form's MAX
 * drifted above the CMS's, a seller would fill in the whole flow and be
 * rejected at the end; if it drifted below, an in-band car would be refused.
 *
 * Run: node scripts/check-price-band.mjs   (also `pnpm check:band`)
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// \b alone is not enough: MAX is a substring of ASIS_MAX, so `MAX:` matched
// the as-is ceiling and reported a false mismatch the first time this ran.
const num = (src, key) => {
  const m = src.match(new RegExp(`(?:^|[^A-Z_])${key}\\s*:\\s*([0-9_]+)`, "m"));
  return m ? Number(m[1].replace(/_/g, "")) : undefined;
};

const schema = JSON.parse(
  read("apps/cms/src/api/listing/content-types/listing/schema.json"),
).attributes.price;

const lifecycles = read(
  "apps/cms/src/api/listing/content-types/listing/lifecycles.ts",
);
// The web side's single definition. It used to live in AddListing.jsx; it moved
// when data/budgetBands.js began partitioning the same range and a second copy
// of the numbers would have been exactly the drift this script exists to catch.
const priceBand = read("apps/web/lib/priceBand.js");

const sources = {
  "cms/lifecycles.ts": {
    ASIS_MIN: num(lifecycles, "ASIS_MIN"),
    ASIS_MAX: num(lifecycles, "ASIS_MAX"),
    STANDARD_MIN: num(lifecycles, "STANDARD_MIN"),
    MAX: num(lifecycles, "MAX"),
  },
  "web/priceBand.js": {
    ASIS_MIN: num(priceBand, "ASIS_MIN"),
    ASIS_MAX: num(priceBand, "ASIS_MAX"),
    STANDARD_MIN: num(priceBand, "STANDARD_MIN"),
    MAX: num(priceBand, "MAX"),
  },
};

const problems = [];
const [refName, ref] = Object.entries(sources)[0];

for (const [name, band] of Object.entries(sources).slice(1)) {
  for (const key of Object.keys(ref)) {
    if (band[key] !== ref[key]) {
      problems.push(
        `${key}: ${refName}=${ref[key]} but ${name}=${band[key]}`,
      );
    }
  }
}

// The schema is the hard database constraint; it must bracket the same range.
if (schema.min !== ref.ASIS_MIN) {
  problems.push(`schema.json min=${schema.min} but ASIS_MIN=${ref.ASIS_MIN}`);
}
if (schema.max !== ref.MAX) {
  problems.push(`schema.json max=${schema.max} but MAX=${ref.MAX}`);
}

for (const [key, value] of Object.entries(ref)) {
  if (value === undefined) problems.push(`could not parse ${key} from ${refName}`);
}
if (ref.ASIS_MAX + 1 !== ref.STANDARD_MIN) {
  problems.push(
    `gap between ASIS_MAX (${ref.ASIS_MAX}) and STANDARD_MIN (${ref.STANDARD_MIN}) — a price in between would fall through both branches`,
  );
}

/*
 * The prose has to agree with the constants too.
 *
 * The four numbers above were consistent in code the whole time, and the site
 * still told Arabic readers the floor was OMR 1,500. NICHE.md had already been
 * corrected — it records that the headline "used to read OMR 1,500 to 6,000"
 * and that the code "has always enforced 1,000" — but the correction never
 * reached the copy. On 2026-08-03 twenty-six strings across messages/ar.json,
 * the FAQ data, Terms, How it works, eight guides, four blog posts and the hero
 * slides still named the retired floor, while English named the right one. The
 * default locale was the wrong one.
 *
 * A constant nobody writes out is easy to keep consistent. This band is quoted
 * in prose on nearly every page, in two languages, which is exactly where a
 * number rots — so the check has to read the sentences, not just the constants.
 *
 * Only a RANGE is a violation: "1,500 to 6,000" claims a floor. A bare
 * "under OMR 1,500" is correct and common, because 1,000–1,499 is the sold-as-is
 * tier — so matching a lone 1,500 would fail on true sentences and teach people
 * to bypass this script.
 */
const RANGE_RE = new RegExp(
  String.raw`${ref.STANDARD_MIN.toLocaleString("en-US")}\s*(?:and|to|إلى|و)\s*${ref.MAX.toLocaleString("en-US")}`,
  "g",
);

// lib/seo.js documents a fixed bug by quoting the old sentence. Quoting history
// is not repeating it.
const PROSE_EXEMPT = new Set(["apps/web/lib/seo.js"]);

const proseRoots = ["apps/web/app", "apps/web/components", "apps/web/data", "apps/web/messages"];
const walk = (dir, out = []) => {
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === ".next" || e.name === "node_modules") continue;
      walk(full, out);
    } else if (/\.(jsx?|json)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
};

for (const root of proseRoots) {
  for (const file of walk(root)) {
    const rel = file.replace(/^\.\//, "");
    if (PROSE_EXEMPT.has(rel)) continue;
    const text = readFileSync(file, "utf8");
    const hits = text.match(RANGE_RE);
    if (hits) {
      problems.push(
        `${rel}: ${hits.length} string(s) name the band as "${hits[0]}" — the floor is ` +
          `${ref.ASIS_MIN.toLocaleString("en-US")}, not ${ref.STANDARD_MIN.toLocaleString("en-US")}`,
      );
    }
  }
}

if (problems.length) {
  console.error("✗ price band mismatch:\n" + problems.map((p) => "  " + p).join("\n"));
  process.exit(1);
}

console.log(
  `✓ price band consistent across schema.json, lifecycles.ts and lib/priceBand.js ` +
    `(as-is ${ref.ASIS_MIN}–${ref.ASIS_MAX}, standard ${ref.STANDARD_MIN}–${ref.MAX})`,
);
