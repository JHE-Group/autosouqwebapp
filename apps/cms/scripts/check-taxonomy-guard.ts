/**
 * Exercise the taxonomy guard against each bug it claims to catch.
 *
 * `assertTaxonomyIsUrlSafe` refuses to seed a taxonomy that would break a URL.
 * Its rules are drawn from bugs this repo has actually shipped, so the rules
 * themselves need testing — a guard nobody exercises is a guard that quietly
 * stops matching reality.
 *
 * Run: npx tsx apps/cms/scripts/check-taxonomy-guard.ts
 */
import { assertTaxonomyIsUrlSafe } from "../src/index";

type Row = { name: string; nameAr: string; slug: string };
const M = (slug: string, name = slug): Row => ({ name, nameAr: "س", slug });
const MO = (slug: string, make: string, name = slug) => ({ ...M(slug, name), make });

const CITIES = [M("muscat", "Muscat")];
const MAKES = [M("toyota", "Toyota")];
const MODELS = [MO("corolla", "toyota", "Corolla")];

let bad = 0;

const throws = (label: string, fn: () => void, needle: string) => {
  try {
    fn();
    console.log(`  FAIL  ${label} — did not throw`);
    bad += 1;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes(needle)) {
      console.log(`  ok    ${label}`);
    } else {
      console.log(`  FAIL  ${label} — wrong reason: ${message.slice(0, 100)}`);
      bad += 1;
    }
  }
};

const passes = (label: string, fn: () => void) => {
  try {
    fn();
    console.log(`  ok    ${label}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  FAIL  ${label} — threw: ${message.slice(0, 120)}`);
    bad += 1;
  }
};

console.log("\nTaxonomy guard");

passes("a valid taxonomy seeds", () =>
  assertTaxonomyIsUrlSafe(MAKES, MODELS, CITIES),
);

// The city "muscat" and the /used-cars/muscat facet are the same place on
// purpose. Only makes and models are checked against facet routes.
passes("a city may share a slug with a facet route", () =>
  assertTaxonomyIsUrlSafe(MAKES, MODELS, [M("muscat", "Muscat")]),
);

throws(
  "model slug starting with a digit",
  () => assertTaxonomyIsUrlSafe(MAKES, [MO("3-series", "toyota")], CITIES),
  "starts with a digit",
);

throws(
  "make slug starting with a digit",
  () => assertTaxonomyIsUrlSafe([...MAKES, M("500", "Fiat 500")], MODELS, CITIES),
  "starts with a digit",
);

throws(
  "same slug used by a make and a model",
  () => assertTaxonomyIsUrlSafe([...MAKES, M("corolla")], MODELS, CITIES),
  "used by both",
);

throws(
  "make colliding with a /used-cars/ facet",
  () => assertTaxonomyIsUrlSafe([...MAKES, M("gcc-spec")], MODELS, CITIES),
  "collides with a /used-cars/ facet",
);

throws(
  "model pointing at a make that is not seeded",
  () => assertTaxonomyIsUrlSafe(MAKES, [MO("x5", "bmw")], CITIES),
  "not seeded",
);

throws(
  "Mercedes and Mercedes-Benz both present",
  () =>
    assertTaxonomyIsUrlSafe(
      [...MAKES, M("mercedes"), M("mercedes-benz")],
      MODELS,
      CITIES,
    ),
  "same brand spelled two ways",
);

throws(
  "vw alongside volkswagen",
  () =>
    assertTaxonomyIsUrlSafe([...MAKES, M("vw"), M("volkswagen")], MODELS, CITIES),
  "same brand spelled two ways",
);

throws(
  "row missing nameAr",
  () =>
    assertTaxonomyIsUrlSafe(
      [{ name: "Kia", slug: "kia" } as unknown as Row],
      MODELS,
      CITIES,
    ),
  "missing nameAr",
);

throws(
  "uppercase in a slug",
  () => assertTaxonomyIsUrlSafe([...MAKES, M("Land-Rover")], MODELS, CITIES),
  "kebab-case",
);

throws(
  "underscore in a slug",
  () => assertTaxonomyIsUrlSafe([...MAKES, M("land_rover")], MODELS, CITIES),
  "kebab-case",
);

console.log(
  bad === 0
    ? "\n  guard behaves correctly on all cases\n"
    : `\n  ${bad} case(s) wrong\n`,
);
process.exit(bad === 0 ? 0 : 1);
