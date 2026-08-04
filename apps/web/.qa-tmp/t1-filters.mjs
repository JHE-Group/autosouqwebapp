import {
  BASE,
  browser,
  chipTexts,
  cmsCars,
  eq,
  listingSlug,
  optionsOf,
  pick,
  renderedSlugs,
} from "./lib.mjs";

const LOCALE = process.argv[2] || "ar";
const L = {
  ar: {
    make: "الماركة",
    model: "الموديل",
    doors: "عدد الأبواب",
    body: "نوع الهيكل",
    fuel: "نوع الوقود",
    transmission: "ناقل الحركة",
    city: "المدينة",
    cylinders: "عدد السلندرات",
    colour: "اللون",
    empty: "لا توجد سيارات مطابقة حتى الآن",
  },
  en: {
    make: "Make",
    model: "Model",
    doors: "Doors",
    body: "Body type",
    fuel: "Fuel",
    transmission: "Transmission",
    city: "City",
    cylinders: "Cylinders",
    colour: "Colour",
    empty: "No matching cars yet",
  },
}[LOCALE];

const results = [];
const log = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  :: " + detail : ""}`);
};

const cms = await cmsCars(LOCALE);
const b = await browser();
const page = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});

await page.goto(`${BASE}/${LOCALE}/used-cars`, { waitUntil: "networkidle" });

const baseline = await renderedSlugs(page);
// The page is ISR; the catalogue moves under us (other QA agents publish). Test
// filtering against what the page actually holds, and report the delta apart.
const cars = cms.filter((c) => baseline.includes(listingSlug(c)));
const missing = cms.filter((c) => !baseline.includes(listingSlug(c))).map(listingSlug);
console.log(
  `# baseline rendered=${baseline.length} cms=${cms.length} notRendered=${JSON.stringify(missing)}`,
);
log(
  "baseline: rendered set is all resolvable CMS listings",
  cars.length === baseline.length,
  `matched ${cars.length}/${baseline.length}`,
);

const ALL = cars.map(listingSlug);

async function testSelect(label, name, predicate, nth = 0, reopenPanel = false) {
  const opts = await optionsOf(page, name, nth);
  if (!opts.length) {
    log(`${label}: control present`, false, "no dropdown found");
    return;
  }
  for (const value of opts.slice(1)) {
    if (reopenPanel) await ensurePanel();
    await pick(page, name, value, nth);
    const shown = await renderedSlugs(page);
    const expected = cars.filter((c) => predicate(c, value)).map(listingSlug);
    const chips = await chipTexts(page);
    const ok = eq(shown, expected);
    log(
      `filter ${label} = "${value}"`,
      ok,
      `shown ${shown.length} expected ${expected.length}` +
        (ok ? "" : ` | shown=${shown} | expected=${expected}`),
    );
    log(
      `chip ${label} = "${value}"`,
      chips.length === 1 && chips[0] === value,
      `chips=${JSON.stringify(chips)}`,
    );
    if (expected.length === 0) {
      const emptyShown = await page.locator(`h3:has-text("${L.empty}")`).count();
      log(
        `empty state for ${label} = "${value}"`,
        emptyShown > 0 && shown.length === 0,
        `emptyPanel=${emptyShown} cards=${shown.length}`,
      );
    }
  }
  if (reopenPanel) await ensurePanel();
  await pick(page, name, opts[0], nth);
  const back = await renderedSlugs(page);
  log(`${label} clears back to all`, eq(back, ALL), `${back.length}/${ALL.length}`);
}

async function ensurePanel() {
  const open = await page.locator("div.wd-search-form.show").count();
  if (!open) {
    await page.locator("button.icon-filter").click();
    await page.waitForTimeout(200);
  }
}

// --- top row (always visible) -------------------------------------------
await testSelect("make", L.make, (c, v) => c.make === v);
await testSelect("body", L.body, (c, v) => c.body === v);
await testSelect("doors", L.doors, (c, v) => String(c.door) === v.match(/\d+/)?.[0]);
await testSelect("model", L.model, (c, v) => c.model === v);

// --- advanced panel ------------------------------------------------------
await ensurePanel();
await testSelect("fuel", L.fuel, (c, v) => c.fuelType === v, 0, true);
await testSelect("transmission", L.transmission, (c, v) => c.transmission === v, 0, true);
await testSelect("city", L.city, (c, v) => c.location === v, 0, true);
await testSelect("cylinders", L.cylinders, (c, v) => String(c.cylinder) === v.match(/\d+/)?.[0], 0, true);
await testSelect("colour", L.colour, (c, v) => c.color === v, 0, true);

// --- features ------------------------------------------------------------
await ensurePanel();
const featureLabels = await page.$$eval(".features-wrap label.flex-three", (ls) =>
  ls.map((l) => l.textContent.trim()),
);
console.log(`# feature checkboxes offered: ${JSON.stringify(featureLabels)}`);
const allFeatures = [...new Set(cars.flatMap((c) => c.features))];
log(
  "features: every feature in the catalogue is offered as a checkbox",
  allFeatures.every((f) => featureLabels.includes(f)),
  `catalogue=${allFeatures.length} offered=${featureLabels.length} missing=${allFeatures.filter((f) => !featureLabels.includes(f))}`,
);

for (const f of featureLabels.slice(0, 4)) {
  await ensurePanel();
  await page.locator(`.features-wrap label.flex-three:has-text("${f}") input`).first().click();
  await page.waitForTimeout(250);
  const shown = await renderedSlugs(page);
  const expected = cars.filter((c) => c.features.includes(f)).map(listingSlug);
  log(`filter feature "${f}"`, eq(shown, expected), `shown ${shown.length} expected ${expected.length}`);
  const chips = await chipTexts(page);
  log(`chip feature "${f}"`, chips.length === 1 && chips[0] === f, JSON.stringify(chips));
  await ensurePanel();
  await page.locator(`.features-wrap label.flex-three:has-text("${f}") input`).first().click();
  await page.waitForTimeout(250);
}

// --- deliberate zero-result combination ----------------------------------
await ensurePanel();
await pick(page, L.make, LOCALE === "ar" ? "سوزوكي" : "Suzuki", 0);
await ensurePanel();
const cityOpts = await optionsOf(page, L.city, 0);
const otherCity = cityOpts.slice(1).find((c) => !cars.some((x) => x.make === (LOCALE === "ar" ? "سوزوكي" : "Suzuki") && x.location === c));
await ensurePanel();
await pick(page, L.city, otherCity, 0);
const zero = await renderedSlugs(page);
const emptyPanel = await page.locator(`h3:has-text("${L.empty}")`).count();
log(
  `zero-result combo (Suzuki + ${otherCity}) shows empty state, not everything`,
  zero.length === 0 && emptyPanel > 0,
  `cards=${zero.length} emptyPanel=${emptyPanel}`,
);
const zeroChips = await chipTexts(page);
log("zero-result screen lists both applied filters", zeroChips.length === 2, JSON.stringify(zeroChips));

// clear-all from the chips
const clearAll = page.locator('button:has-text("مسح الكل"), button:has-text("Clear all")');
if (await clearAll.count()) {
  await clearAll.first().click();
  await page.waitForTimeout(300);
  const after = await renderedSlugs(page);
  log("clear all restores full catalogue", eq(after, ALL), `${after.length}/${ALL.length}`);
  log("clear all removes every chip", (await chipTexts(page)).length === 0);
} else {
  log("clear-all control present on zero-result screen", false, "not found");
}

console.log("\n--- page errors ---");
console.log(errors.length ? [...new Set(errors)].join("\n") : "none");

await b.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length) console.log("FAILED:\n" + failed.map((f) => "  " + f.name + " :: " + f.detail).join("\n"));
