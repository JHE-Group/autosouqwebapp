/* THROWAWAY audit script - delete after use */
import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3224";
const OUT = "/private/tmp/claude-501/-Users-joshheywood-Autosouq-om/d89ccb42-cb11-41e2-8196-1a17153e5128/scratchpad";

const ROUTES = [
  ["home", ""],
  ["used-cars", "/used-cars"],
  ["used-cars/muscat", "/used-cars/muscat"],
  ["car-detail", "/car/kia-picanto-2016-muscat"],
  ["guides", "/guides"],
  ["faq", "/faq"],
  ["how-it-works", "/how-it-works"],
];

const VIEWPORTS = [
  {
    name: "mobile390",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ua: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    cpu: 4,
    net: { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 },
  },
  {
    name: "desktop1280",
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    ua: undefined,
    cpu: 1,
    net: { offline: false, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (10 * 1024 * 1024) / 8, latency: 40 },
  },
];

const INIT = `
(() => {
  window.__cwv = { shifts: [], lcp: [], longtasks: [], paints: [], fontLoads: [] };
  const desc = (n) => {
    if (!n) return null;
    try {
      if (n.nodeType !== 1) n = n.parentElement;
      if (!n) return null;
      const cls = (n.className && typeof n.className === 'string') ? '.' + n.className.trim().split(/\\s+/).slice(0,3).join('.') : '';
      const id = n.id ? '#' + n.id : '';
      const txt = (n.textContent || '').trim().replace(/\\s+/g,' ').slice(0, 60);
      let ff = null, fs2 = null;
      try { const cs = getComputedStyle(n); ff = cs.fontFamily; fs2 = cs.fontSize + '/' + cs.lineHeight; } catch(e){}
      return { tag: n.tagName.toLowerCase(), sel: n.tagName.toLowerCase() + id + cls, text: txt, src: n.currentSrc || n.src || null, fontFamily: ff, fontSize: fs2 };
    } catch (e) { return null; }
  };
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__cwv.shifts.push({
          value: e.value, startTime: e.startTime, hadRecentInput: e.hadRecentInput,
          sources: (e.sources || []).map(s => ({
            node: desc(s.node),
            prev: s.previousRect ? {x:s.previousRect.x,y:s.previousRect.y,w:s.previousRect.width,h:s.previousRect.height} : null,
            curr: s.currentRect ? {x:s.currentRect.x,y:s.currentRect.y,w:s.currentRect.width,h:s.currentRect.height} : null,
          })),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch(e){}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__cwv.lcp.push({ startTime: e.startTime, renderTime: e.renderTime, loadTime: e.loadTime, size: e.size, url: e.url, element: desc(e.element) });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch(e){}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__cwv.longtasks.push({ startTime: e.startTime, duration: e.duration, name: e.name, attribution: (e.attribution||[]).map(a=>({name:a.name, containerType:a.containerType, containerSrc:a.containerSrc, containerName:a.containerName})) });
    }).observe({ type: 'longtask', buffered: true });
  } catch(e){}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__cwv.paints.push({ name: e.name, startTime: e.startTime });
    }).observe({ type: 'paint', buffered: true });
  } catch(e){}
  try {
    document.fonts.addEventListener('loadingdone', (ev) => {
      for (const f of ev.fontfaces) window.__cwv.fontLoads.push({ family: f.family, weight: f.weight, style: f.style, t: performance.now() });
    });
  } catch(e){}
})();
`;

function clsSessionMax(shifts) {
  const s = shifts.filter((x) => !x.hadRecentInput).sort((a, b) => a.startTime - b.startTime);
  let max = 0, cur = 0, first = 0, last = 0, curEntries = [], maxEntries = [];
  for (const e of s) {
    if (cur > 0 && (e.startTime - last > 1000 || e.startTime - first > 5000)) {
      if (cur > max) { max = cur; maxEntries = curEntries; }
      cur = 0; curEntries = []; first = e.startTime;
    }
    if (cur === 0) first = e.startTime;
    last = e.startTime;
    cur += e.value;
    curEntries.push(e);
  }
  if (cur > max) { max = cur; maxEntries = curEntries; }
  return { cls: max, entries: maxEntries, total: s.reduce((a, b) => a + b.value, 0) };
}

async function measure(browser, vp, locale, route, opts = {}) {
  const url = `${BASE}/${locale}${route[1]}`;
  const ctx = await browser.newContext({
    viewport: vp.viewport,
    deviceScaleFactor: vp.deviceScaleFactor,
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    userAgent: vp.ua,
  });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();

  // --- experiment hooks -------------------------------------------------
  if (opts.blockFonts) {
    await page.route("**/*.woff2", (r) => r.abort());
  }
  if (opts.injectHead) {
    await page.route(`**${new URL(url).pathname}`, async (r) => {
      const resp = await r.fetch();
      let body = await resp.text();
      body = body.replace("</head>", opts.injectHead + "</head>");
      await r.fulfill({ response: resp, body, headers: { ...resp.headers(), "content-length": undefined } });
    });
  }
  // ----------------------------------------------------------------------

  const client = await ctx.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", vp.net);
  await client.send("Emulation.setCPUThrottlingRate", { rate: vp.cpu });

  const requests = new Map();
  client.on("Network.responseReceived", (e) => {
    requests.set(e.requestId, {
      url: e.response.url, type: e.type, status: e.response.status,
      mime: e.response.mimeType, headers: e.response.headers, encoded: 0,
    });
  });
  client.on("Network.loadingFinished", (e) => {
    const r = requests.get(e.requestId);
    if (r) r.encoded = e.encodedDataLength;
  });

  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(opts.settle ?? 6000);

  const data = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] || {};
    const rt = performance.getEntriesByType("resource").map((r) => ({
      name: r.name, initiatorType: r.initiatorType, startTime: r.startTime,
      responseEnd: r.responseEnd, duration: r.duration,
      transferSize: r.transferSize, encodedBodySize: r.encodedBodySize, decodedBodySize: r.decodedBodySize,
      renderBlockingStatus: r.renderBlockingStatus || null,
    }));
    const head = [...document.head.querySelectorAll("link,script,style")].map((n) => ({
      tag: n.tagName.toLowerCase(), rel: n.getAttribute("rel"), as: n.getAttribute("as"),
      href: n.getAttribute("href") || n.getAttribute("src") || null,
      async: n.hasAttribute("async"), defer: n.hasAttribute("defer"), type: n.getAttribute("type"),
    }));
    const loaded = [];
    try { document.fonts.forEach((f) => loaded.push({ family: f.family, weight: f.weight, status: f.status, unicodeRange: (f.unicodeRange||"").slice(0,40) })); } catch(e){}
    const cs = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    return {
      cwv: window.__cwv, rt, head, loaded,
      nav: { domContentLoaded: nav.domContentLoadedEventEnd, loadEvent: nav.loadEventEnd, responseEnd: nav.responseEnd, transferSize: nav.transferSize, encodedBodySize: nav.encodedBodySize, decodedBodySize: nav.decodedBodySize },
      dpr: window.devicePixelRatio, innerWidth: window.innerWidth,
      fontsStatus: document.fonts.status, htmlClass: document.documentElement.className, htmlLang: document.documentElement.lang,
      vars: { inter: cs.getPropertyValue("--font-inter").trim(), outfit: cs.getPropertyValue("--font-outfit").trim(), cairo: cs.getPropertyValue("--font-cairo").trim() },
      bodyFont: body.fontFamily, bodyLH: body.lineHeight, bodySize: body.fontSize,
      docHeight: document.documentElement.scrollHeight,
    };
  });

  const res = [...requests.values()];
  const { cls, entries, total } = clsSessionMax(data.cwv.shifts);
  const lcpEntries = data.cwv.lcp;
  const lcp = lcpEntries.length ? lcpEntries[lcpEntries.length - 1] : null;
  const fcp = (data.cwv.paints.find((p) => p.name === "first-contentful-paint") || {}).startTime ?? null;
  const longtasks = data.cwv.longtasks;
  const tbt = longtasks.filter((t) => t.startTime > (fcp ?? 0)).reduce((a, t) => a + Math.max(0, t.duration - 50), 0);

  const byType = {};
  for (const r of res) {
    const k = r.mime.includes("javascript") ? "js" : r.mime.includes("css") ? "css" : r.mime.includes("font") ? "font" : r.mime.includes("image") ? "image" : r.mime.includes("html") ? "html" : "other";
    byType[k] = (byType[k] || 0) + r.encoded;
  }
  const strip = (u) => u.replace(BASE, "");
  const jsList = res.filter((r) => r.mime.includes("javascript")).sort((a, b) => b.encoded - a.encoded).map((r) => ({ url: strip(r.url), bytes: r.encoded }));
  const cssList = res.filter((r) => r.mime.includes("css")).sort((a, b) => b.encoded - a.encoded).map((r) => ({ url: strip(r.url), bytes: r.encoded }));
  const fontList = res.filter((r) => r.mime.includes("font")).map((r) => {
    const t = data.rt.find((x) => x.name.endsWith(strip(r.url)) || x.name === r.url);
    return { url: strip(r.url), bytes: r.encoded, start: t?.startTime ?? null, end: t?.responseEnd ?? null };
  });
  const imgList = res.filter((r) => r.mime.includes("image")).sort((a, b) => b.encoded - a.encoded).slice(0, 8).map((r) => ({ url: strip(r.url).slice(0, 160), bytes: r.encoded }));

  await ctx.close();
  return {
    route: route[0], path: route[1] || "/", locale, viewport: vp.name, url, variant: opts.name || "baseline",
    fcp, lcp, cls, clsTotal: total, clsEntries: entries,
    tbt, longtaskCount: longtasks.length, longtaskMax: longtasks.reduce((a, t) => Math.max(a, t.duration), 0), longtasks,
    nav: data.nav, byType, jsList, cssList, fontList, imgList, fontLoads: data.cwv.fontLoads,
    head: data.head, loadedFaces: data.loaded, vars: data.vars, bodyFont: data.bodyFont, bodyLH: data.bodyLH, bodySize: data.bodySize,
    htmlClass: data.htmlClass, htmlLang: data.htmlLang, docHeight: data.docHeight,
    renderBlocking: data.rt.filter((r) => r.renderBlockingStatus === "blocking").map((r) => ({ name: strip(r.name), size: r.encodedBodySize, end: r.responseEnd })),
    allRequests: res.map((r) => ({ url: strip(r.url).slice(0, 200), mime: r.mime, bytes: r.encoded, cc: r.headers["cache-control"] || null, ce: r.headers["content-encoding"] || null, vary: r.headers["vary"] || null, status: r.status })),
  };
}

const outFile = process.argv[2] || `${OUT}/cwv.json`;
const onlyRoute = process.env.ONLY_ROUTE;
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--disable-dev-shm-usage"] });
const out = [];
for (const vp of VIEWPORTS) {
  for (const locale of ["ar", "en"]) {
    for (const route of ROUTES) {
      if (onlyRoute && route[0] !== onlyRoute) continue;
      process.stderr.write(`${vp.name} ${locale} ${route[0]}\n`);
      try {
        const r = await measure(browser, vp, locale, route);
        out.push(r);
        fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
      } catch (e) {
        process.stderr.write(`FAIL ${vp.name} ${locale} ${route[0]}: ${e.message}\n`);
      }
    }
  }
}
await browser.close();
console.log("done", out.length, outFile);
