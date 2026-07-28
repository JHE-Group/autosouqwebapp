/* THROWAWAY diagnostic script - delete after use */
import { chromium } from "playwright-core";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3224";
const OUT = "/private/tmp/claude-501/-Users-joshheywood-Autosouq-om/d89ccb42-cb11-41e2-8196-1a17153e5128/scratchpad";

const CAIRO_AR = "9ff27b8a0a8f3dc0-s.40_3w74kn95bo.woff2";
const CAIRO_LAT = "d41831e24743a3c1-s.08tn9snzkmifr.woff2";
const INTER_P = "83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2";
const OUTFIT_P = "1b99372b3eaef0c8-s.p.1gsd1jahc5dg_.woff2";

const ROUTES = [
  ["home", ""],
  ["browse", "/used-cars"],
  ["detail", "/car/toyota-corolla-2015-xli-muscat"],
  ["blog-post", "/blog/what-omr-3000-buys-oman-2026"],
  ["faq", "/faq"],
  ["guide-post", "/guides/used-car-scams-oman"],
];

const VIEWPORTS = [
  { name: "mobile390", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    ua: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    cpu: 4, net: { offline: false, downloadThroughput: (1.6*1024*1024)/8, uploadThroughput: (750*1024)/8, latency: 150 } },
  { name: "desktop1280", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false,
    ua: undefined, cpu: 1, net: { offline: false, downloadThroughput: (10*1024*1024)/8, uploadThroughput: (10*1024*1024)/8, latency: 40 } },
];

const INIT = `
(() => {
  window.__cwv = { shifts: [], lcp: [] };
  const desc = (n) => { if(!n) return null; try { if(n.nodeType!==1) n=n.parentElement; if(!n) return null;
    const cls=(n.className&&typeof n.className==='string')?'.'+n.className.trim().split(/\\s+/).slice(0,3).join('.'):'';
    return { sel: n.tagName.toLowerCase()+(n.id?'#'+n.id:'')+cls, text:(n.textContent||'').trim().replace(/\\s+/g,' ').slice(0,40) }; } catch(e){return null;} };
  try { new PerformanceObserver((l)=>{ for(const e of l.getEntries()) window.__cwv.shifts.push({value:e.value,startTime:e.startTime,hadRecentInput:e.hadRecentInput,
    sources:(e.sources||[]).map(s=>({node:desc(s.node),prev:s.previousRect?{y:s.previousRect.y,h:s.previousRect.height}:null,curr:s.currentRect?{y:s.currentRect.y,h:s.currentRect.height}:null}))}); }).observe({type:'layout-shift',buffered:true}); } catch(e){}
  try { new PerformanceObserver((l)=>{ for(const e of l.getEntries()) window.__cwv.lcp.push({startTime:e.startTime,size:e.size,url:e.url,element:desc(e.element)}); }).observe({type:'largest-contentful-paint',buffered:true}); } catch(e){}
})();`;

function clsSessionMax(shifts) {
  const s = shifts.filter(x=>!x.hadRecentInput).sort((a,b)=>a.startTime-b.startTime);
  let max=0,cur=0,first=0,last=0,curE=[],maxE=[];
  for (const e of s) {
    if (cur>0 && (e.startTime-last>1000 || e.startTime-first>5000)) { if(cur>max){max=cur;maxE=curE;} cur=0;curE=[];first=e.startTime; }
    if (cur===0) first=e.startTime;
    last=e.startTime; cur+=e.value; curE.push(e);
  }
  if (cur>max){max=cur;maxE=curE;}
  return { cls:max, entries:maxE };
}

async function run(browser, vp, locale, route, variant) {
  const url = `${BASE}/${locale}${route[1]}`;
  const ctx = await browser.newContext({ viewport: vp.viewport, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch, userAgent: vp.ua });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const client = await ctx.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", vp.net);
  await client.send("Emulation.setCPUThrottlingRate", { rate: vp.cpu });

  let fontBytes = 0;
  const reqs = new Map();
  client.on("Network.responseReceived", (e) => { if ((e.response.mimeType||"").includes("font")) reqs.set(e.requestId, e.response.url); });
  client.on("Network.loadingFinished", (e) => { if (reqs.has(e.requestId)) fontBytes += e.encodedDataLength; });

  if (variant === "block-cairo") {
    await page.route(`**/${CAIRO_AR}`, (r) => r.abort());
    await page.route(`**/${CAIRO_LAT}`, (r) => r.abort());
  }
  if (variant === "preload-cairo" || variant === "preload-cairo-drop-latin") {
    await page.route(url, async (r) => {
      const resp = await r.fetch();
      let body = await resp.text();
      let inject = `<link rel="preload" href="/_next/static/media/${CAIRO_AR}" as="font" crossorigin="" type="font/woff2"/>`;
      body = body.replace("<head>", "<head>" + inject);
      if (variant === "preload-cairo-drop-latin") {
        body = body.replace(new RegExp(`<link rel="preload" href="/_next/static/media/${INTER_P.replace(/\./g,"\\.")}"[^>]*>`), "");
        body = body.replace(new RegExp(`<link rel="preload" href="/_next/static/media/${OUTFIT_P.replace(/\./g,"\\.")}"[^>]*>`), "");
      }
      await r.fulfill({ response: resp, body, headers: { ...resp.headers(), "content-length": undefined } });
    });
  }

  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(6000);
  const d = await page.evaluate(() => ({ cwv: window.__cwv, headLinks: [...document.querySelectorAll('link[rel=preload]')].map(l=>l.href.split('/').pop()) }));
  const { cls, entries } = clsSessionMax(d.cwv.shifts);
  const lcp = d.cwv.lcp.length ? d.cwv.lcp[d.cwv.lcp.length-1] : null;
  await ctx.close();
  return { route: route[0], locale, viewport: vp.name, variant, cls, entries, lcp: lcp ? { t: lcp.startTime, el: lcp.element?.sel, url: lcp.url } : null, fontBytes, preloads: d.headLinks };
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const out = [];
const VARIANTS = ["baseline", "block-cairo", "preload-cairo", "preload-cairo-drop-latin"];
for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    for (const v of VARIANTS) {
      // /en only needs baseline (no Cairo there)
      const locales = v === "baseline" ? ["ar", "en"] : ["ar"];
      for (const locale of locales) {
        process.stderr.write(`${vp.name} ${locale} ${route[0]} ${v}\n`);
        try { out.push(await run(browser, vp, locale, route, v)); }
        catch (e) { process.stderr.write(`FAIL: ${e.message}\n`); }
      }
    }
  }
}
await browser.close();
fs.writeFileSync(`${OUT}/diag.json`, JSON.stringify(out, null, 2));
console.log("done", out.length);
