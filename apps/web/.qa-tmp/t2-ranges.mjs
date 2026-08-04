import { BASE, browser, chipTexts, eq, pick, renderedSlugs } from "./lib.mjs";

const LOCALE = "ar";
const results = [];
const log = (n, p, d) => {
  results.push({ n, p, d });
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  :: " + d : ""}`);
};

const b = await browser();
const page = await b.newPage({ viewport: { width: 1400, height: 1400 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

async function load(url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".asq-toolbar", { timeout: 30000 });
  await page.waitForTimeout(900);
}
/** [slug, price, km, year] straight off the rendered cards. */
const cards = () =>
  page.$$eval("article.asq-card", (cs) =>
    cs.map((c) => ({
      slug: c.querySelector(".asq-card__title a").getAttribute("href").split("/car/")[1],
      price: Number(c.querySelector(".asq-card__price").textContent.replace(/[^\d]/g, "")),
      km: Number((c.querySelector(".asq-card__km")?.textContent ?? "").replace(/[^\d]/g, "")) || null,
      year: Number(c.querySelector(".asq-card__year")?.textContent) || null,
    })),
  );

// ---------- ?price= band links: is the range half-open or closed? ---------
await load(`${BASE}/${LOCALE}/used-cars`);
const all = await cards();
console.log(`# baseline ${all.length} cards; prices ${all.map((c) => c.price).sort((a, z) => a - z)}`);

for (const [param, min, max] of [
  ["1000-1500", 1000, 1500],
  ["1500-2500", 1500, 2500],
  ["2500-4000", 2500, 4000],
  ["4000-6001", 4000, 6001],
]) {
  await load(`${BASE}/${LOCALE}/used-cars?price=${param}`);
  const shown = await cards();
  const onCeiling = shown.filter((c) => c.price === max);
  const belowFloor = shown.filter((c) => c.price < min);
  const aboveCeiling = shown.filter((c) => c.price > max);
  log(
    `?price=${param}: no car outside [${min},${max})`,
    onCeiling.length === 0 && belowFloor.length === 0 && aboveCeiling.length === 0,
    `shown=${shown.length} atCeiling=${onCeiling.map((c) => c.slug)} belowFloor=${belowFloor.length} aboveCeiling=${aboveCeiling.length}`,
  );
}

// ---------- sliders by keyboard -----------------------------------------
async function openPanel() {
  if (!(await page.locator("div.wd-search-form.show").count())) {
    await page.locator("button.icon-filter").click();
    await page.waitForTimeout(400);
  }
}
/** Drag one handle of the km/price/year slider to `frac` across its track. */
async function drag(which, side, frac) {
  const labels = await page.$$eval("[role=slider]", (e) =>
    e.map((x) => x.getAttribute("aria-label")),
  );
  const stems = [...new Set(labels.map((x) => x.replace(/ — (minimum|maximum)$/, "")))];
  const order = ["km", "price", "year"]; // FlatFilter3 panel order
  const idx = labels.findIndex(
    (l) =>
      stems.indexOf(l.replace(/ — (minimum|maximum)$/, "")) === order.indexOf(which) &&
      l.endsWith(side),
  );
  if (idx < 0) throw new Error(`no ${which}/${side} in ${JSON.stringify(labels)}`);
  const h = page.locator("[role=slider]").nth(idx);
  const track = page.locator(".rc-slider").nth(Math.floor(idx / 2));
  const hb = await h.boundingBox();
  const tb = await track.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(tb.x + tb.width * frac, hb.y + hb.height / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  return Number(await h.getAttribute("aria-valuenow"));
}
const nudge = (which, side, _key, _presses) =>
  drag(which, side, side === "minimum" ? 0.45 : 0.35);

await load(`${BASE}/${LOCALE}/used-cars`);
await openPanel();
{
  const now = await nudge("price", "minimum", "ArrowRight", 2200);
  const shown = await cards();
  log(
    `price slider: floor raised to ${now}, nothing cheaper is shown`,
    shown.every((c) => c.price >= now),
    `shown=${shown.length} min=${Math.min(...shown.map((c) => c.price))} expectedFromBaseline=${all.filter((c) => c.price >= now).length}`,
  );
  log(
    "price slider result set equals baseline filtered by the same bound",
    eq(shown.map((c) => c.slug), all.filter((c) => c.price >= now).map((c) => c.slug)),
    `${shown.length} vs ${all.filter((c) => c.price >= now).length}`,
  );
  const chips = [...new Set(await chipTexts(page))];
  log("moving the price slider raises exactly one chip", chips.length === 1, JSON.stringify(chips));
}

await load(`${BASE}/${LOCALE}/used-cars`);
await openPanel();
{
  const now = await nudge("km", "maximum", "ArrowLeft", 900);
  const shown = await cards();
  log(
    `km slider: ceiling lowered to ${now}, nothing higher is shown`,
    shown.every((c) => c.km === null || c.km <= now),
    `shown=${shown.length} max=${Math.max(...shown.map((c) => c.km ?? 0))}`,
  );
  log(
    "km slider result set equals baseline filtered by the same bound",
    eq(shown.map((c) => c.slug), all.filter((c) => c.km !== null && c.km <= now).map((c) => c.slug)),
    `${shown.length} vs ${all.filter((c) => c.km !== null && c.km <= now).length}`,
  );
}

await load(`${BASE}/${LOCALE}/used-cars`);
await openPanel();
{
  const now = await nudge("year", "minimum", "ArrowRight", 8);
  const shown = await cards();
  log(
    `year slider: floor raised to ${now}, nothing older is shown`,
    shown.every((c) => c.year >= now),
    `shown=${shown.length} min=${Math.min(...shown.map((c) => c.year ?? 0))}`,
  );
  log(
    "year slider result set equals baseline filtered by the same bound",
    eq(shown.map((c) => c.slug), all.filter((c) => c.year >= now).map((c) => c.slug)),
    `${shown.length} vs ${all.filter((c) => c.year >= now).length}`,
  );
  const chips = [...new Set(await chipTexts(page))];
  log("year chip present", chips.length === 1, JSON.stringify(chips));
}

// ---------- sort ---------------------------------------------------------
await load(`${BASE}/${LOCALE}/used-cars`);
await pick(page, "ترتيب النتائج حسب", "السعر: من الأقل");
await page.waitForTimeout(500);
let p = (await cards()).map((c) => c.price);
log("sort ascending", p.every((v, i) => i === 0 || p[i - 1] <= v), JSON.stringify(p));
await pick(page, "ترتيب النتائج حسب", "السعر: من الأعلى");
await page.waitForTimeout(500);
p = (await cards()).map((c) => c.price);
log("sort descending", p.every((v, i) => i === 0 || p[i - 1] >= v), JSON.stringify(p));
log("sort keeps the whole result set", p.length === all.length, `${p.length}/${all.length}`);

// ---------- pagination ---------------------------------------------------
await load(`${BASE}/${LOCALE}/used-cars`);
const total = (await cards()).length;
const pagerBefore = await page.locator("nav.themesflat-pagination").count();
log(
  `no pager when ${total} results fit page size 12`,
  total <= 12 ? pagerBefore === 0 : pagerBefore > 0,
  `pager=${pagerBefore}`,
);
if (await page.locator('div.nice-select[aria-label="عدد السيارات في الصفحة"]').count()) {
  await pick(page, "عدد السيارات في الصفحة", "عرض 6");
  await page.waitForTimeout(600);
  const p1 = await renderedSlugs(page);
  const pager = await page.locator("nav.themesflat-pagination").count();
  log("page size 6 → 6 cards + pager", p1.length === 6 && pager > 0, `cards=${p1.length} pager=${pager}`);
  console.log(`   pager: ${JSON.stringify(await page.locator("nav.themesflat-pagination li").allTextContents())}`);
  await page.locator("nav.themesflat-pagination li", { hasText: /^2$/ }).first().click();
  await page.waitForTimeout(600);
  const p2 = await renderedSlugs(page);
  log(
    "page 2 = remainder, no overlap with page 1",
    p2.length === Math.min(6, total - 6) && !p2.some((s) => p1.includes(s)),
    `page2=${p2.length} overlap=${p2.filter((s) => p1.includes(s))}`,
  );
} else {
  log("page-size control offered", false, "absent");
}

console.log("\n--- page errors ---");
console.log(errors.length ? [...new Set(errors)].join("\n") : "none");
await b.close();
const f = results.filter((r) => !r.p);
console.log(`\n${results.length - f.length}/${results.length} passed`);
if (f.length) console.log("FAILED:\n" + f.map((x) => "  " + x.n + " :: " + x.d).join("\n"));
