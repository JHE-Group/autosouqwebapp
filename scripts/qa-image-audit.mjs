/**
 * THROWAWAY QA HARNESS — image delivery audit.
 * Usage: node scripts/qa-image-audit.mjs
 * Writes JSON to scratchpad. Delete after use.
 */
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.env.QA_BASE || "http://127.0.0.1:3210";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = process.env.QA_OUT || "/tmp/qa-image-audit.json";

const ROUTES = [
  ["home", ""],
  ["used-cars", "/used-cars"],
  ["used-cars/muscat", "/used-cars/muscat"],
  ["listing-detail", "__LISTING__"],
  ["guides", "/guides"],
  ["guide-post", "/guides/transfer-car-ownership-oman"],
  ["blog", "/blog"],
  ["blog-post", "/blog/what-omr-3000-buys-oman-2026"],
  ["about-us", "/about-us"],
  ["faq", "/faq"],
  ["contact", "/contact"],
  ["sell-your-car", "/sell-your-car"],
  ["add-listing", "/add-listing"],
  ["how-it-works", "/how-it-works"],
];

const VIEWPORTS = [
  ["390", { width: 390, height: 844 }],
  ["1280", { width: 1280, height: 800 }],
];
const LOCALES = ["ar", "en"];

const IMG_RE = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp)(\?|$)/i;

function isImageish(url, contentType, resourceType) {
  if (resourceType === "image") return true;
  if (contentType && /^image\//i.test(contentType)) return true;
  if (/\/_next\/image/.test(url)) return true;
  return IMG_RE.test(url);
}

const CLS_INIT = `
window.__cls = 0;
window.__clsEntries = [];
try {
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (!e.hadRecentInput) {
        window.__cls += e.value;
        window.__clsEntries.push({ value: e.value, time: e.startTime,
          sources: (e.sources||[]).map(s => (s.node && s.node.nodeName) ? (s.node.nodeName + (s.node.getAttribute && s.node.getAttribute('src') ? '['+s.node.getAttribute('src').slice(0,120)+']' : '')) : '?') });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
} catch (e) {}
`;

const COLLECT = `(() => {
  const vh = window.innerHeight, vw = window.innerWidth;
  const out = [];
  document.querySelectorAll('img').forEach((img, i) => {
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    const absTop = r.top + window.scrollY;
    out.push({
      idx: i,
      src: img.getAttribute('src'),
      currentSrc: img.currentSrc,
      srcsetAttr: img.getAttribute('srcset') ? img.getAttribute('srcset').slice(0, 400) : null,
      sizesAttr: img.getAttribute('sizes'),
      hasAltAttr: img.hasAttribute('alt'),
      alt: img.getAttribute('alt'),
      widthAttr: img.getAttribute('width'),
      heightAttr: img.getAttribute('height'),
      styleAspect: cs.aspectRatio,
      cssW: Math.round(r.width * 100) / 100,
      cssH: Math.round(r.height * 100) / 100,
      absTop: Math.round(absTop),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      loading: img.getAttribute('loading'),
      fetchpriority: img.getAttribute('fetchpriority'),
      display: cs.display,
      visibility: cs.visibility,
      position: cs.position,
      objectFit: cs.objectFit,
      inFirstViewport: absTop < vh && (absTop + r.height) > 0 && r.width > 0 && r.height > 0,
      parentTag: img.parentElement ? img.parentElement.tagName : null,
    });
  });
  // CSS background-images anywhere in the doc
  const bgs = [];
  document.querySelectorAll('*').forEach((el) => {
    const bi = getComputedStyle(el).backgroundImage;
    if (bi && bi !== 'none' && bi.includes('url(')) {
      const r = el.getBoundingClientRect();
      bgs.push({ tag: el.tagName, cls: (el.className && el.className.toString ? el.className.toString().slice(0,80) : ''),
        bg: bi.slice(0, 300), cssW: Math.round(r.width), cssH: Math.round(r.height),
        absTop: Math.round(r.top + window.scrollY) });
    }
  });
  return { imgs: out, bgs, vw, vh, docHeight: document.documentElement.scrollHeight,
           cls: window.__cls, clsEntries: window.__clsEntries,
           dir: document.documentElement.getAttribute('dir'), lang: document.documentElement.getAttribute('lang') };
})()`;

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const results = [];

  // ---- discover a listing detail URL ----
  let listingPath = null;
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(`${BASE}/en/used-cars`, { waitUntil: "networkidle", timeout: 45000 });
    const hrefs = await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    const car = hrefs.find((h) => h && /\/car\//.test(h));
    if (car) listingPath = car.replace(/^\/(ar|en)/, "");
    if (!listingPath) {
      // dump for diagnosis
      const txt = await p.evaluate(() => document.body.innerText.slice(0, 3000));
      fs.writeFileSync("/tmp/qa-usedcars-dump.txt", txt + "\n\nHREFS:\n" + hrefs.join("\n"));
    }
    await ctx.close();
  }
  console.error("listingPath =", listingPath);

  for (const locale of LOCALES) {
    for (const [vpName, vp] of VIEWPORTS) {
      for (const [routeName, routePath] of ROUTES) {
        let path = routePath;
        if (path === "__LISTING__") {
          if (!listingPath) {
            results.push({ locale, viewport: vpName, route: routeName, url: null, skipped: "no listing url discovered" });
            continue;
          }
          path = listingPath;
        }
        const url = `${BASE}/${locale}${path}`;
        const ctx = await browser.newContext({
          viewport: vp,
          deviceScaleFactor: vpName === "390" ? 2 : 1,
          userAgent:
            vpName === "390"
              ? "Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
              : undefined,
          locale: locale === "ar" ? "ar-OM" : "en-OM",
        });
        await ctx.addInitScript(CLS_INIT);
        const page = await ctx.newPage();
        page.setDefaultTimeout(30000);

        const netById = new Map();
        const responses = [];
        const consoleErrors = [];
        const failedRequests = [];

        const cdp = await ctx.newCDPSession(page);
        await cdp.send("Network.enable");
        cdp.on("Network.requestWillBeSent", (e) => {
          netById.set(e.requestId, { url: e.request.url, type: e.type });
        });
        cdp.on("Network.responseReceived", (e) => {
          const rec = netById.get(e.requestId) || {};
          rec.url = e.response.url;
          rec.status = e.response.status;
          rec.contentType = e.response.headers["content-type"] || e.response.headers["Content-Type"] || null;
          rec.mimeType = e.response.mimeType;
          rec.type = e.type;
          rec.fromCache = e.response.fromDiskCache || e.response.fromServiceWorker || false;
          rec.headers = {
            "content-length": e.response.headers["content-length"] || e.response.headers["Content-Length"] || null,
            "cache-control": e.response.headers["cache-control"] || null,
            vary: e.response.headers["vary"] || null,
            "x-nextjs-stale-time": e.response.headers["x-nextjs-stale-time"] || null,
          };
          netById.set(e.requestId, rec);
        });
        cdp.on("Network.loadingFinished", (e) => {
          const rec = netById.get(e.requestId);
          if (rec) rec.encodedDataLength = e.encodedDataLength;
        });
        cdp.on("Network.loadingFailed", (e) => {
          const rec = netById.get(e.requestId) || {};
          rec.failed = e.errorText;
          rec.type = e.type;
          netById.set(e.requestId, rec);
        });

        page.on("console", (m) => {
          if (m.type() === "error") consoleErrors.push(m.text().slice(0, 300));
        });
        page.on("requestfailed", (r) => {
          failedRequests.push({ url: r.url(), failure: r.failure()?.errorText, type: r.resourceType() });
        });

        let navStatus = null, navError = null;
        try {
          const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
          navStatus = resp ? resp.status() : null;
          await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
        } catch (e) {
          navError = String(e).slice(0, 300);
        }
        await page.waitForTimeout(600);

        // --- ABOVE THE FOLD snapshot: before any scrolling ---
        const aboveFoldNet = [...netById.values()]
          .filter((r) => isImageish(r.url || "", r.contentType, r.type))
          .map((r) => ({ ...r }));
        const preScroll = await page.evaluate(COLLECT).catch(() => null);

        // --- now scroll the whole page to trigger lazy loads ---
        await page
          .evaluate(async () => {
            const step = Math.round(window.innerHeight * 0.8);
            for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 180));
            }
            window.scrollTo(0, document.documentElement.scrollHeight);
            await new Promise((r) => setTimeout(r, 500));
            window.scrollTo(0, 0);
            await new Promise((r) => setTimeout(r, 300));
          })
          .catch(() => {});
        await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(600);

        const postScroll = await page.evaluate(COLLECT).catch(() => null);
        const allNet = [...netById.values()].map((r) => ({ ...r }));
        const imageNet = allNet.filter((r) => isImageish(r.url || "", r.contentType, r.type));

        results.push({
          locale,
          viewport: vpName,
          route: routeName,
          url,
          navStatus,
          navError,
          consoleErrors,
          failedRequests,
          aboveFoldNetUrls: aboveFoldNet.map((r) => r.url),
          imageNet,
          preScroll,
          postScroll,
        });
        console.error(
          `done ${locale} ${vpName} ${routeName} status=${navStatus} imgs=${postScroll ? postScroll.imgs.length : "?"} netImgs=${imageNet.length}`,
        );
        await ctx.close();
      }
    }
  }

  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify({ base: BASE, listingPath, results }, null, 1));
  console.error("WROTE", OUT);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
