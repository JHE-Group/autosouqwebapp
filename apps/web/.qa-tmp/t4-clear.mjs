import { BASE, browser, chipTexts, pick, renderedSlugs } from "./lib.mjs";
const b = await browser();
const page = await b.newPage({ viewport: { width: 1400, height: 1400 } });
const errs=[]; page.on("pageerror",e=>errs.push(String(e)));
async function load(u){ await page.goto(u,{waitUntil:"domcontentloaded"}); await page.waitForSelector(".asq-toolbar"); await page.waitForTimeout(900); }

async function setup() {
  await load(`${BASE}/ar/used-cars`);
  const all = await renderedSlugs(page);
  await pick(page, "الماركة", "سوزوكي");
  await page.waitForTimeout(400);
  await page.locator("button.icon-filter").click(); await page.waitForTimeout(300);
  await pick(page, "المدينة", "صحار");
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  return all;
}

// 1. "اعرض كل السيارات" (Show all cars) on the empty screen
let all = await setup();
console.log("empty?", (await renderedSlugs(page)).length, "chips", JSON.stringify(await chipTexts(page)));
const showAll = page.locator('button:has-text("اعرض كل السيارات")');
console.log("showAll count", await showAll.count(), "visible", await showAll.first().isVisible().catch(()=>null));
await showAll.first().click();
await page.waitForTimeout(700);
console.log("AFTER showAll -> cards", (await renderedSlugs(page)).length, "of", all.length, "chips", JSON.stringify(await chipTexts(page)));

// 2. "مسح الكل" (clear all) in the chip row
all = await setup();
const ca = page.locator('button:has-text("مسح الكل")');
console.log("clearAll count", await ca.count());
for (let i=0;i<await ca.count();i++) console.log("  visible",i, await ca.nth(i).isVisible());
await ca.last().click();
await page.waitForTimeout(700);
console.log("AFTER clearAll(last) -> cards", (await renderedSlugs(page)).length, "chips", JSON.stringify(await chipTexts(page)));

// 3. one chip at a time
all = await setup();
const rm = page.locator('button[aria-label^="إزالة الفلتر"]');
console.log("remove buttons", await rm.count());
await rm.last().click();
await page.waitForTimeout(700);
console.log("AFTER removing one chip -> cards", (await renderedSlugs(page)).length, "chips", JSON.stringify(await chipTexts(page)));

// 4. "مسح الفلاتر" in the hero panel
all = await setup();
await page.locator("button.icon-filter").click(); await page.waitForTimeout(300);
const cf = page.locator('button:has-text("مسح الفلاتر")');
console.log("clearFilter(hero) count", await cf.count());
await cf.first().click();
await page.waitForTimeout(700);
console.log("AFTER hero clear -> cards", (await renderedSlugs(page)).length, "chips", JSON.stringify(await chipTexts(page)));

console.log("errors:", errs.length? errs: "none");
await b.close();
