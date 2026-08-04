import { BASE, browser } from "./lib.mjs";
const b = await browser();
const p = await b.newPage({ viewport: { width: 1400, height: 1200 } });
async function load(u){ await p.goto(u,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(1500); }
await load(`${BASE}/ar`);
const tiles = await p.$$eval("li.hp-budget__item", (ls) =>
  ls.map((l) => ({
    label: l.querySelector(".hp-budget__label")?.textContent.trim(),
    count: l.querySelector(".hp-budget__count")?.textContent.trim(),
    href: l.querySelector("a")?.getAttribute("href"),
  })),
);
for (const t of tiles) {
  if (!t.href) { console.log(`TILE ${t.label} | ${t.count} | (no link)`); continue; }
  await load(BASE + (t.href.startsWith("/ar") ? t.href : "/ar" + t.href));
  const cards = await p.$$eval("article.asq-card .asq-card__price", (e) => e.map((x) => Number(x.textContent.replace(/[^\d]/g,""))));
  const count = await p.locator(".asq-toolbar__count").first().textContent().catch(()=>null);
  console.log(`TILE ${t.label} | tileCount=${t.count} | -> ${t.href} | destinationCount="${count}" | prices=${JSON.stringify(cards.sort((a,z)=>a-z))}`);
}
await b.close();
