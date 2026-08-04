#!/usr/bin/env node
/**
 * Every key the code asks for must exist in both catalogues.
 *
 * next-intl does not throw for a missing key. It prints the dot path. So
 * `t("missing.accountName")` with no such entry renders the literal string
 * "addListing.missing.accountName" into the page, styled like everything
 * around it, and nothing anywhere reports a problem.
 *
 * That shipped. The sell form's publish checklist pushes `accountName`,
 * `accountEmail` and `accountPassword` when the seller is not signed in — the
 * account step that moved to the end of the form — and the three keys were
 * never added to ar.json or en.json. So the checklist read:
 *
 *     الماركة، الموديل، سنة الصنع …
 *     addListing.missing.accountName
 *     addListing.missing.accountEmail
 *     addListing.missing.accountPassword
 *
 * to every signed-out seller, in both languages, twice per page, on the screen
 * that tells them what to do before publishing. It was invisible to every
 * existing check: the build passes, the catalogues are aligned with each other
 * (both were missing the same three), and a page fetch returns 200.
 *
 * This checks the class of key that caused it — the ones assembled from a
 * variable, `t(`missing.${item.key}`)`, where the string never appears in the
 * source and grep cannot find it. Those are exactly the ones a human reviewer
 * misses too.
 *
 * Run: node scripts/check-i18n-keys.mjs   (also `pnpm check:i18n`)
 */
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const ar = JSON.parse(read("apps/web/messages/ar.json"));
const en = JSON.parse(read("apps/web/messages/en.json"));

const get = (obj, path) =>
  path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

const problems = [];

/**
 * Dynamic namespaces: a source file, the template it interpolates, and the
 * list of values that can land in it.
 *
 * Written out rather than inferred. Inferring which literals reach a template
 * needs real dataflow analysis, and a check that silently resolves nothing is
 * worse than no check — it reports success either way. Each entry below names
 * where the values come from so it can be re-derived when the code moves.
 */
const DYNAMIC = [
  {
    file: "apps/web/components/dashboard/AddListing.jsx",
    // Rendered by t(`missing.${item.key}`) in two places.
    prefix: "addListing.missing",
    // Source of truth: every `key: "..."` pushed into the blockers list.
    extract: (src) =>
      [...src.matchAll(/list\.push\(\{\s*step:\s*\d+,\s*key:\s*"([a-zA-Z]+)"/g)].map(
        (m) => m[1],
      ),
  },
];

for (const { file, prefix, extract } of DYNAMIC) {
  const keys = [...new Set(extract(read(file)))];

  if (keys.length === 0) {
    problems.push(
      `✗ ${file}: parsed zero dynamic keys for "${prefix}" — the code changed ` +
        `shape and this check went blind. Fix the extractor, do not delete it.`,
    );
    continue;
  }

  for (const key of keys) {
    for (const [lang, cat] of [
      ["ar", ar],
      ["en", en],
    ]) {
      if (typeof get(cat, `${prefix}.${key}`) !== "string") {
        problems.push(
          `✗ ${lang}.json is missing "${prefix}.${key}" — ${file} renders it, ` +
            `and next-intl will print the raw key path to the seller`,
        );
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const total = DYNAMIC.reduce(
  (n, d) => n + new Set(d.extract(read(d.file))).size,
  0,
);
console.log(
  `✓ all ${total} dynamically-composed message keys resolve in both catalogues`,
);
