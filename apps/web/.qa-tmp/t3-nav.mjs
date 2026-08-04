import { BASE, browser, chipTexts, eq, pick, renderedSlugs } from "./lib.mjs";

const results = [];
const log = (n, p, d) => {
  results.push({ n, p, d });
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  :: " + d : ""}`);
};

const b = await browser();
const page = await b.newPage({ viewport: { width: 1400, height: 1200 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

async function load(url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("body", { timeout: 30000 });
  await page.waitForTimeout(800);
}

// ---- clear all from the zero-result screen -----------------------------
await load(`${BASE}/ar/used-cars`);
const ALL = await renderedSlugs(page);
await pick(page, "الماركة", "سوزوكي");
await page.waitForTimeout(400);
// close the hero panel so it cannot intercept the click
await page.keyboard.press("Escape");
await page.locator("button.icon-filter").click();
await page.waitForTimeout(300);
await pick(page, "المدينة", "صحار");
await page.waitForTimeout(500);
const zero = await renderedSlugs(page);
const emptyPanel = await page.locator('h3:has-text("لا توجد سيارات مطابقة حتى الآن")').count();
log("zero-result combo shows the empty state", zero.length === 0 && emptyPanel > 0, `cards=${zero.length} panel=${emptyPanel}`);
const relaxed = await page.locator("text=/ليست مطابقة/").count();
log("zero-result screen names what it relaxed", relaxed > 0, `relaxedBanners=${relaxed}`);

const clearAll = page.locator('button:has-text("مسح الكل")').last();
await clearAll.scrollIntoViewIfNeeded();
await clearAll.click({ force: true });
await page.waitForTimeout(600);
const after = await renderedSlugs(page);
log("clear all restores the full catalogue", eq(after, ALL), `${after.length}/${ALL.length}`);
log("clear all removes every chip", (await chipTexts(page)).length === 0, JSON.stringify(await chipTexts(page)));

// ---- individual chip removal -------------------------------------------
await load(`${BASE}/ar/used-cars`);
await pick(page, "الماركة", "تويوتا");
await page.waitForTimeout(400);
const withMake = await renderedSlugs(page);
await page.locator('button[aria-label^="إزالة الفلتر"]').first().click({ force: true });
await page.waitForTimeout(500);
const afterChip = await renderedSlugs(page);
log("removing a chip restores the catalogue", eq(afterChip, ALL) && withMake.length < ALL.length, `${withMake.length} -> ${afterChip.length} / ${ALL.length}`);

// ---- back from detail ---------------------------------------------------
await load(`${BASE}/ar/used-cars`);
await pick(page, "الماركة", "تويوتا");
await page.waitForTimeout(500);
const before = await renderedSlugs(page);
await page.locator("article.asq-card .asq-card__title a").first().click();
await page.waitForTimeout(1500);
const onDetail = page.url();
log("card links to a listing detail page", /\/ar\/car\//.test(onDetail), onDetail);
const h1 = await page.locator("h1.title").first().textContent().catch(() => null);
log("detail page has an h1 for the car", Boolean(h1), JSON.stringify(h1));

// breadcrumb back
const crumb = page.locator('a:has-text("سيارات مستعملة")').first();
log("breadcrumb offers a way back to browse", (await crumb.count()) > 0);
await page.goBack();
await page.waitForTimeout(1200);
const back = await renderedSlugs(page);
log(
  "browser back returns to the results (filters are NOT preserved — no URL state)",
  back.length > 0,
  `before=${before.length} afterBack=${back.length} chips=${JSON.stringify(await chipTexts(page))}`,
);

// ---- locale switch on a detail page -------------------------------------
await load(onDetail);
const alt = await page.$$eval('link[rel="alternate"]', (ls) => ls.map((l) => [l.hreflang, l.href]));
console.log("   hreflang:", JSON.stringify(alt));
const canon = await page.$eval('link[rel="canonical"]', (l) => l.href).catch(() => null);
console.log("   canonical:", canon);

console.log("\n--- page errors ---");
console.log(errors.length ? [...new Set(errors)].join("\n") : "none");
await b.close();
const f = results.filter((r) => !r.p);
console.log(`\n${results.length - f.length}/${results.length} passed`);
if (f.length) console.log("FAILED:\n" + f.map((x) => "  " + x.n + " :: " + x.d).join("\n"));
