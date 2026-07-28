/** THROWAWAY: crop shots of the about-us placeholder cards + verify carousel lazy slides load on swipe. */
import { chromium } from "playwright-core";
const BASE = "http://127.0.0.1:3210";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT = process.env.SHOT_DIR || "/tmp";
const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// A. about-us placeholder cards, cropped
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "ar-OM" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ar/about-us`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  const el = await page.$("img[alt='2017 Hyundai Accent']");
  // scroll the carousel so the grey placeholder cards come into view, then shoot the strip
  await page.evaluate(() => {
    const wrap = document.querySelector(".swiper-wrapper") || document.querySelector('[class*="swiper"]');
    if (wrap) wrap.style.transform = "translate3d(-960px,0,0)";
  });
  await page.waitForTimeout(2500);
  const strip = await page.evaluate(() => {
    const i = document.querySelector("img[alt='2013 Honda Civic']") || document.querySelector("img[alt*='Toyota Camry']");
    if (!i) return null;
    const c = i.closest("section") || i.parentElement;
    const r = c.getBoundingClientRect();
    return { x: Math.max(0, r.x), y: r.y + window.scrollY, w: Math.min(1280, r.width), h: Math.min(700, r.height) };
  });
  const loaded = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((i) => /car-list|listings/.test(i.getAttribute("src") || ""))
      .map((i) => ({ src: (i.getAttribute("src") || "").split("url=")[1]?.split("&")[0], loaded: i.complete && i.naturalWidth > 0, nat: i.naturalWidth, x: Math.round(i.getBoundingClientRect().x) })),
  );
  console.log("=== about-us after forcing carousel to slide (do lazy slides load?) ===");
  console.log(JSON.stringify(loaded, null, 1));
  if (strip) {
    await page.evaluate((y) => window.scrollTo(0, y - 100), strip.y);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SHOT}/about-us-cards-1280.png`, clip: { x: 0, y: 0, width: 1280, height: 700 } });
  }
  await ctx.close();
}

// B. used-cars @390 scrolled to the card grid — do real photos render?
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "ar-OM" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ar/used-cars`, { waitUntil: "networkidle", timeout: 45000 });
  await page.evaluate(() => {
    const i = document.querySelector('img[src*="listings"]');
    if (i) i.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOT}/used-cars-cards-390.png` });
  await ctx.close();
}
await browser.close();
