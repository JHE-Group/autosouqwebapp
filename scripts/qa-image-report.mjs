/** THROWAWAY analyzer for qa-image-audit.json */
import fs from "node:fs";
const D = JSON.parse(fs.readFileSync(process.env.QA_IN || "/tmp/qa-image-audit.json", "utf8"));
const B = D.base;
const short = (u) => (u || "").replace(B, "").replace(/^http:\/\/localhost:1337/, "STRAPI:");
const kb = (n) => (n == null ? "?" : (n / 1024).toFixed(1) + "KB");

const sec = (t) => console.log("\n\n" + "=".repeat(90) + "\n" + t + "\n" + "=".repeat(90));

// ---------- 1. BROKEN ----------
sec("1. BROKEN — non-200 image responses, failed requests, naturalWidth===0");
for (const r of D.results) {
  const bad = (r.imageNet || []).filter((x) => x.status && x.status !== 200);
  const failed = (r.imageNet || []).filter((x) => x.failed);
  const zero = (r.postScroll?.imgs || []).filter((i) => i.complete && i.naturalWidth === 0);
  const notComplete = (r.postScroll?.imgs || []).filter((i) => !i.complete);
  const noSrc = (r.postScroll?.imgs || []).filter((i) => !i.currentSrc);
  if (bad.length || failed.length || zero.length || notComplete.length || noSrc.length || r.navError) {
    console.log(`\n[${r.locale} ${r.viewport} ${r.route}] ${short(r.url)} nav=${r.navStatus} ${r.navError || ""}`);
    bad.forEach((x) => console.log(`   NON-200 ${x.status} ${short(x.url)} ct=${x.contentType} enc=${kb(x.encodedDataLength)}`));
    failed.forEach((x) => console.log(`   FAILED  ${x.failed} ${short(x.url)}`));
    zero.forEach((i) => console.log(`   ZERO-W  src=${short(i.currentSrc || i.src)} css=${i.cssW}x${i.cssH} alt=${JSON.stringify(i.alt)}`));
    notComplete.forEach((i) => console.log(`   INCOMPL src=${short(i.currentSrc || i.src)} css=${i.cssW}x${i.cssH}`));
    noSrc.forEach((i) => console.log(`   NO-SRC  src=${JSON.stringify(i.src)} css=${i.cssW}x${i.cssH} alt=${JSON.stringify(i.alt)}`));
  }
}

// ---------- full inventory ----------
sec("2. FULL IMAGE NETWORK INVENTORY (unique per route/locale/viewport)");
for (const r of D.results) {
  console.log(`\n--- [${r.locale} ${r.viewport}px] ${r.route} :: ${short(r.url)} (nav ${r.navStatus}) ---`);
  const imgs = r.postScroll?.imgs || [];
  const byUrl = new Map();
  for (const n of r.imageNet || []) if (!byUrl.has(n.url)) byUrl.set(n.url, n);
  for (const n of byUrl.values()) {
    const users = imgs.filter((i) => i.currentSrc === n.url);
    const dims = users.map((u) => `${u.cssW}x${u.cssH}`).join(",") || "(no <img>; css-bg or icon)";
    console.log(
      `  ${String(n.status || n.failed).padEnd(6)} ${kb(n.encodedDataLength).padStart(9)}  ${(n.contentType || "").padEnd(24)} css=${dims}  ${short(n.url)}`,
    );
  }
  const noNet = imgs.filter((i) => i.currentSrc && !byUrl.has(i.currentSrc));
  noNet.forEach((i) => console.log(`  [cached/no-net] css=${i.cssW}x${i.cssH} nat=${i.naturalWidth}x${i.naturalHeight} ${short(i.currentSrc)}`));
}

// ---------- 3. OVERSIZE ----------
sec("3. OVERSIZE — bytes vs rendered CSS box (DPR-aware)");
console.log("ratio = transferred bytes per rendered CSS pixel-area unit; also natural px vs needed px");
for (const r of D.results) {
  const dpr = r.viewport === "390" ? 2 : 1;
  const imgs = r.postScroll?.imgs || [];
  const byUrl = new Map();
  for (const n of r.imageNet || []) if (!byUrl.has(n.url)) byUrl.set(n.url, n);
  const rows = [];
  for (const i of imgs) {
    const n = byUrl.get(i.currentSrc);
    if (!n || !n.encodedDataLength || !i.cssW || !i.cssH) continue;
    if (/svg/i.test(n.contentType || "")) continue;
    const neededW = Math.round(i.cssW * dpr);
    const bytesPerKpx = n.encodedDataLength / ((i.cssW * i.cssH) / 1000);
    const overW = i.naturalWidth / (neededW || 1);
    rows.push({ url: n.url, bytes: n.encodedDataLength, cssW: i.cssW, cssH: i.cssH, nat: `${i.naturalWidth}x${i.naturalHeight}`, neededW, overW, bytesPerKpx, ct: n.contentType });
  }
  const flagged = rows.filter((x) => x.bytes > 25000 || x.overW > 1.8 || x.bytesPerKpx > 900);
  if (flagged.length) {
    console.log(`\n[${r.locale} ${r.viewport} ${r.route}]  (dpr=${dpr})`);
    flagged.sort((a, b) => b.bytes - a.bytes);
    for (const x of flagged)
      console.log(
        `  ${kb(x.bytes).padStart(9)}  css=${x.cssW}x${x.cssH} (needs ${x.neededW}px) natural=${x.nat} overW=${x.overW.toFixed(2)}x  ${Math.round(x.bytesPerKpx)}B/kpx  ${x.ct}  ${short(x.url)}`,
      );
  }
}

// ---------- 4. ALT ----------
sec("4. ALT TEXT");
const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z]{3,}/;
const seenAlt = new Set();
for (const r of D.results) {
  if (r.viewport !== "1280") continue; // alt is viewport-independent; 1280 shows the most
  const imgs = r.postScroll?.imgs || [];
  const rows = [];
  for (const i of imgs) {
    const key = `${r.locale}|${r.route}|${i.currentSrc || i.src}|${i.alt}`;
    let flag = null;
    if (!i.hasAltAttr) flag = "MISSING alt attribute";
    else if (i.alt === "") flag = "alt=\"\" (decorative claim)";
    else if (r.locale === "ar" && LATIN.test(i.alt) && !ARABIC.test(i.alt)) flag = "ENGLISH alt on /ar";
    else if (r.locale === "ar" && LATIN.test(i.alt) && ARABIC.test(i.alt)) flag = "mixed ar/en alt on /ar";
    if (flag) rows.push({ flag, i });
  }
  if (rows.length) {
    console.log(`\n[${r.locale} ${r.route}]`);
    for (const { flag, i } of rows)
      console.log(`  ${flag.padEnd(28)} css=${i.cssW}x${i.cssH} alt=${JSON.stringify(i.alt)}\n      src=${short(i.currentSrc || i.src)}`);
  }
}

// ---------- alt full dump for /ar 1280 ----------
sec("4b. ALL ALT STRINGS, /ar @1280 (for language review)");
for (const r of D.results) {
  if (r.locale !== "ar" || r.viewport !== "1280") continue;
  console.log(`\n[${r.route}]`);
  for (const i of r.postScroll?.imgs || [])
    console.log(`  alt=${JSON.stringify(i.alt)}  <- ${short(i.currentSrc || i.src)}`);
}

// ---------- 5. LAYOUT SHIFT ----------
sec("5. LAYOUT SHIFT — CLS + images lacking intrinsic sizing");
for (const r of D.results) {
  const imgs = r.postScroll?.imgs || [];
  const unsized = imgs.filter((i) => {
    const hasWH = i.widthAttr != null && i.heightAttr != null;
    const hasAR = i.styleAspect && i.styleAspect !== "auto";
    const fill = i.position === "absolute";
    return !hasWH && !hasAR && !fill;
  });
  const cls = r.postScroll?.cls ?? 0;
  if (cls > 0.001 || unsized.length) {
    console.log(`\n[${r.locale} ${r.viewport} ${r.route}] CLS=${cls.toFixed(4)} (preScrollCLS=${(r.preScroll?.cls ?? 0).toFixed(4)})`);
    for (const e of r.postScroll?.clsEntries || [])
      console.log(`   shift ${e.value.toFixed(4)} @${Math.round(e.time)}ms sources=${JSON.stringify(e.sources).slice(0, 200)}`);
    for (const i of unsized)
      console.log(`   UNSIZED w=${i.widthAttr} h=${i.heightAttr} ar=${i.styleAspect} pos=${i.position} css=${i.cssW}x${i.cssH} ${short(i.currentSrc || i.src)}`);
  }
}

// ---------- 6. ABOVE FOLD ----------
sec("6. ABOVE-THE-FOLD IMAGE WEIGHT (pre-scroll, images intersecting first viewport)");
console.log("locale | vp | route | AF <img> count | AF bytes | largest single file | ALL pre-scroll img bytes");
for (const r of D.results) {
  const byUrl = new Map();
  for (const n of r.imageNet || []) if (!byUrl.has(n.url)) byUrl.set(n.url, n);
  const af = (r.preScroll?.imgs || []).filter((i) => i.inFirstViewport);
  const urls = new Set(af.map((i) => i.currentSrc).filter(Boolean));
  let total = 0, largest = null;
  for (const u of urls) {
    const n = byUrl.get(u);
    if (!n) continue;
    total += n.encodedDataLength || 0;
    if (!largest || (n.encodedDataLength || 0) > (largest.encodedDataLength || 0)) largest = n;
  }
  // all image bytes fetched before scroll
  let preAll = 0;
  for (const u of r.aboveFoldNetUrls || []) {
    const n = byUrl.get(u);
    if (n) preAll += n.encodedDataLength || 0;
  }
  console.log(
    `${r.locale} | ${r.viewport} | ${r.route.padEnd(18)} | ${String(urls.size).padStart(2)} | ${kb(total).padStart(9)} | ${largest ? kb(largest.encodedDataLength) + " " + short(largest.url).slice(0, 90) : "-"} | ${kb(preAll)}`,
  );
}

// ---------- misc ----------
sec("7. SVG DELIVERY (raw vs /_next/image)");
const svgSeen = new Map();
for (const r of D.results)
  for (const n of r.imageNet || [])
    if (/svg/i.test(n.contentType || "") || /\.svg/.test(n.url)) {
      const k = n.url;
      if (!svgSeen.has(k)) svgSeen.set(k, { ...n, routes: new Set() });
      svgSeen.get(k).routes.add(`${r.locale}/${r.route}`);
    }
for (const [u, n] of svgSeen)
  console.log(`  ${n.status} ${kb(n.encodedDataLength).padStart(8)} ct=${n.contentType} viaOptimizer=${/_next\/image/.test(u)} ${short(u)} (${n.routes.size} route-views)`);

sec("8. UNIQUE IMAGE FILES ACROSS WHOLE SITE (by URL, with size)");
const all = new Map();
for (const r of D.results) for (const n of r.imageNet || []) if (!all.has(n.url)) all.set(n.url, n);
[...all.values()].sort((a, b) => (b.encodedDataLength || 0) - (a.encodedDataLength || 0)).forEach((n) =>
  console.log(`  ${String(n.status).padEnd(4)} ${kb(n.encodedDataLength).padStart(9)} ${(n.contentType || "").padEnd(22)} ${short(n.url)}`),
);
