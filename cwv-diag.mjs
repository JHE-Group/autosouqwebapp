/* THROWAWAY diagnostic script - delete after use */
import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3224";
const OUT = "/private/tmp/claude-501/-Users-joshheywood-Autosouq-om/d89ccb42-cb11-41e2-8196-1a17153e5128/scratchpad";

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto(`${BASE}/ar/how-it-works`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);

const result = await page.evaluate(() => {
  const sample = document.querySelector("p.font-2.fs-18.lh-28")?.textContent
    || "أوتوسوق منصة للسيارات المستعملة بأسعار في المتناول في عُمان";
  const stacks = {
    Cairo: '"Cairo"',
    CairoFallbackOnly: '"Cairo Fallback"',
    ArialOnly: 'Arial',
    AppleSystem: '-apple-system',
    SystemUI: 'system-ui',
    Roboto: 'Roboto',
    HelveticaNeue: '"Helvetica Neue"',
    NotoSansArabic: '"Noto Sans Arabic"',
    GenericSans: 'sans-serif',
    Bogus: '"__NoSuchFontXyz__"',
    FullFallbackChain: '"Cairo Fallback", -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Arabic", sans-serif',
  };
  const out = { sample: sample.slice(0, 80), widths: {}, wrapped: {}, metrics: {} };

  const span = document.createElement("span");
  span.style.cssText = "position:absolute;left:-99999px;top:0;white-space:nowrap;font-size:100px;font-weight:400;letter-spacing:normal;";
  span.textContent = sample;
  document.body.appendChild(span);
  for (const [k, v] of Object.entries(stacks)) {
    span.style.fontFamily = v;
    out.widths[k] = span.getBoundingClientRect().width;
  }

  const box = document.createElement("div");
  box.style.cssText = "position:absolute;left:-99999px;top:0;width:366px;font-size:18px;line-height:1.85;font-weight:400;letter-spacing:normal;";
  box.textContent = sample;
  document.body.appendChild(box);
  for (const [k, v] of Object.entries(stacks)) {
    box.style.fontFamily = v;
    const h = box.getBoundingClientRect().height;
    out.wrapped[k] = { height: h, lines: Math.round(h / (18 * 1.85)) };
  }

  const one = document.createElement("span");
  one.style.cssText = "position:absolute;left:-99999px;top:0;white-space:nowrap;font-size:100px;line-height:normal;display:inline-block;";
  one.textContent = "أوتوسوق";
  document.body.appendChild(one);
  for (const [k, v] of Object.entries(stacks)) {
    one.style.fontFamily = v;
    out.metrics[k] = one.getBoundingClientRect().height;
  }

  span.remove(); box.remove(); one.remove();

  const faces = [];
  document.fonts.forEach((f) => faces.push({ family: f.family, weight: f.weight, status: f.status }));
  out.faces = faces;
  out.bodyFont = getComputedStyle(document.body).fontFamily;
  out.textLen = document.body.innerText.length;
  return out;
});

fs.writeFileSync(`${OUT}/fontmetrics.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
