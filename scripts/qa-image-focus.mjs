/** THROWAWAY: focused checks — about-us empty boxes, placeholder render, ar CLS sources. */
import { chromium } from "playwright-core";
import fs from "node:fs";
const BASE = "http://127.0.0.1:3210";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT = process.env.SHOT_DIR || "/tmp";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// ---------- A. about-us: are the non-loading imgs visible empty boxes? ----------
for (const vp of [
  ["390", { width: 390, height: 844 }, 2],
  ["1280", { width: 1280, height: 800 }, 1],
]) {
  const ctx = await browser.newContext({ viewport: vp[1], deviceScaleFactor: vp[2], locale: "ar-OM" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ar/about-us`, { waitUntil: "networkidle", timeout: 45000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
  });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    return [...document.querySelectorAll("img")].map((img) => {
      const r = img.getBoundingClientRect();
      // walk ancestors to find overflow-hidden / off-screen container
      let anc = [], el = img.parentElement, d = 0;
      while (el && d < 6) {
        const cs = getComputedStyle(el);
        anc.push(`${el.tagName}.${(el.className||"").toString().split(" ").slice(0,3).join(".")}|ovf=${cs.overflow}|vis=${cs.visibility}|disp=${cs.display}|tf=${cs.transform.slice(0,30)}`);
        el = el.parentElement; d++;
      }
      const pr = img.parentElement.getBoundingClientRect();
      return {
        src: (img.getAttribute("src")||"").slice(0,90),
        complete: img.complete, naturalWidth: img.naturalWidth, currentSrc: !!img.currentSrc,
        box: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) },
        parentBox: { x: Math.round(pr.x), w: Math.round(pr.width) },
        docW: document.documentElement.clientWidth,
        ancestors: anc,
      };
    });
  });
  console.log(`\n===== /ar/about-us @${vp[0]} =====`);
  for (const i of info) {
    const offscreenX = i.box.x + i.box.w < 0 || i.box.x > i.docW;
    console.log(
      `  loaded=${i.complete && i.naturalWidth > 0 ? "YES" : "NO "} nat=${i.naturalWidth} box=(x${i.box.x},y${i.box.y},${i.box.w}x${i.box.h}) docW=${i.docW} offscreenX=${offscreenX}  ${i.src}`,
    );
    if (!(i.complete && i.naturalWidth > 0)) console.log(`      anc: ${i.ancestors.slice(0, 3).join("  //  ")}`);
  }
  await page.screenshot({ path: `${SHOT}/about-us-ar-${vp[0]}.png`, fullPage: true });
  await ctx.close();
}

// ---------- B. used-cars @390: what a card actually looks like + placeholder render ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "ar-OM" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/ar/used-cars`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT}/used-cars-ar-390.png`, fullPage: false });
  const cards = await page.evaluate(() =>
    [...document.querySelectorAll("img")].filter((i) => /listings/.test(i.currentSrc)).slice(0, 3).map((i) => ({
      currentSrc: i.currentSrc.slice(-70), nat: `${i.naturalWidth}x${i.naturalHeight}`, css: `${i.getBoundingClientRect().width}x${i.getBoundingClientRect().height}`, alt: i.alt,
    })),
  );
  console.log("\n===== /ar/used-cars @390 sample cards =====");
  console.log(JSON.stringify(cards, null, 1));
  await ctx.close();
}

// ---------- C. AR CLS attribution with node detail ----------
for (const [loc, route] of [["ar", "/used-cars"], ["en", "/used-cars"], ["ar", "/how-it-works"], ["en", "/how-it-works"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: loc === "ar" ? "ar-OM" : "en-OM" });
  await ctx.addInitScript(`
    window.__s=[];
    new PerformanceObserver(l=>{for(const e of l.getEntries()){ if(e.hadRecentInput) continue;
      window.__s.push({v:e.value,t:e.startTime,src:(e.sources||[]).map(s=>{ const n=s.node; if(!n) return "?";
        const tag=n.nodeName; const txt=(n.textContent||"").trim().slice(0,40);
        return tag+":"+txt; })});}}).observe({type:'layout-shift',buffered:true});
  `);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${loc}${route}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(2500);
  const s = await page.evaluate(() => window.__s);
  const total = s.reduce((a, b) => a + b.v, 0);
  console.log(`\n===== CLS /${loc}${route} @1280 total=${total.toFixed(4)} =====`);
  s.forEach((e) => console.log(`   ${e.v.toFixed(4)} @${Math.round(e.t)}ms  ${JSON.stringify(e.src).slice(0, 260)}`));
  await ctx.close();
}

// ---------- D. Strapi-hosted image path (what a real CMS photo would do) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const r = await page.goto(
    `${BASE}/_next/image?url=${encodeURIComponent("http://localhost:1337/uploads/nonexistent.jpg")}&w=640&q=75`,
  );
  console.log(`\n===== /_next/image on the ALLOW-LISTED strapi host: ${r.status()} =====`);
  console.log("  body:", (await r.text()).slice(0, 200));
  await ctx.close();
}

await browser.close();
