/**
 * Smoke-test the buy-a-car journey against a running Next.js server.
 *
 * Usage: BUY_FLOW_BASE=http://127.0.0.1:3001 node scripts/test-buy-flow.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.BUY_FLOW_BASE || "http://127.0.0.1:3001";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function ms(n) {
  return `${Math.round(n)}ms`;
}

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const failures = [];
  const log = (label, ok, detail = "") => {
    console.log(`${ok ? "PASS" : "FAIL"} — ${label}${detail ? `: ${detail}` : ""}`);
    if (!ok) failures.push(label);
  };

  async function runViewport(name, size) {
    const context = await browser.newContext({
      viewport: size,
      locale: "en-OM",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    const t0 = Date.now();
    let r = await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
    log(`[${name}] home`, r?.ok(), `${ms(Date.now() - t0)} status=${r?.status()}`);

    const t1 = Date.now();
    r = await page.goto(`${BASE}/en/used-cars`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    const cards = page.locator('a[href*="/car/"]');
    const cardCount = await cards.count();
    log(
      `[${name}] used-cars browse`,
      r?.status() === 200 && cardCount > 0,
      `${ms(Date.now() - t1)} status=${r?.status()} cards=${cardCount}`,
    );

    // Legacy browse URL must 301/308 to /used-cars
    r = await page.goto(`${BASE}/en/listing-grid`, { waitUntil: "domcontentloaded" });
    const onUsedCars = page.url().includes("/used-cars");
    log(
      `[${name}] listing-grid → used-cars`,
      onUsedCars,
      `url=${page.url()} status=${r?.status()}`,
    );

    // Facets are inventory-gated (≥5 matches). A 404 with no footer link is
    // correct thin-content behaviour, not a buy-flow bug.
    for (const facet of [
      "muscat",
      "under-2000-omr",
      "under-3000-omr",
      "gcc-spec",
    ]) {
      const tf = Date.now();
      r = await page.goto(`${BASE}/en/used-cars/${facet}`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(200);
      const body = await page.locator("body").innerText().catch(() => "");
      const notFound = /This page could not be found/i.test(body);
      const live = r?.status() === 200 && !notFound;
      let gatedOk = false;
      if (!live) {
        await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
        const footerHit = await page
          .locator(`footer a[href*="used-cars/${facet}"]`)
          .count();
        gatedOk = footerHit === 0;
      }
      log(
        `[${name}] facet ${facet}`,
        live || gatedOk,
        `${ms(Date.now() - tf)} status=${r?.status()}${live ? "" : gatedOk ? " (gated, hidden from footer)" : " unexpected"}`,
      );
    }

    // Open first listing card from browse
    await page.goto(`${BASE}/en/used-cars`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    const href = await page.locator('a[href*="/car/"]').first().getAttribute("href");
    if (!href) {
      log(`[${name}] open listing`, false, "no card href");
    } else {
      const td = Date.now();
      r = await page.goto(new URL(href, BASE).toString(), {
        waitUntil: "domcontentloaded",
      });
      await page.waitForLoadState("networkidle").catch(() => {});
      const body = await page.locator("body").innerText().catch(() => "");
      const notFound = /This page could not be found/i.test(body);
      const titleOk = !notFound && (await page.locator("h1, .title, .listing-title").count()) > 0;
      log(
        `[${name}] listing detail`,
        r?.status() === 200 && !notFound && titleOk,
        `${ms(Date.now() - td)} url=${page.url()} status=${r?.status()}`,
      );

      // Canonical slug should not duplicate make/model block
      const path = new URL(page.url()).pathname;
      const dup = /\/car\/([a-z0-9]+(?:-[a-z0-9]+)*)-\1-/i.test(path);
      log(`[${name}] slug not duplicated`, !dup, path);

      const wa = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
      const noContact = page.getByText(/has not given a WhatsApp number/i);
      const waCount = await wa.count();
      const noContactVisible = await noContact.isVisible().catch(() => false);
      // Either a real WA CTA or an honest no-contact state — never a silent void.
      log(
        `[${name}] contact affordance`,
        waCount > 0 || noContactVisible,
        waCount > 0 ? `wa=${waCount}` : noContactVisible ? "no-contact copy" : "missing",
      );

      if (waCount > 0) {
        const waHref = await wa.first().getAttribute("href");
        log(`[${name}] wa.me href valid`, /wa\.me\/\d+/.test(waHref || ""), waHref);
      }
    }

    // Mulkiya guide + footer Muscat link
    r = await page.goto(`${BASE}/en/guides/transfer-car-ownership-oman`, {
      waitUntil: "domcontentloaded",
    });
    log(`[${name}] mulkiya guide`, r?.ok(), `status=${r?.status()}`);

    /*
     * The footer must AGREE with the facet, not merely contain a link.
     *
     * This asserted that the footer links Muscat, full stop — written when
     * Muscat had inventory, and never reconciled with the gating added later.
     * It contradicted this test's own facet check thirty lines above, which
     * treats "404 and absent from the footer" as the correct thin-content
     * behaviour. Both could not pass at once, and the one that failed was the
     * one that had stopped describing the site.
     *
     * The invariant worth protecting is the pair: the footer must never
     * advertise a page that 404s, and must link one that works. That holds
     * whether or not there is inventory, so it does not rot the next time the
     * catalogue changes.
     */
    const facetRes = await page.goto(`${BASE}/en/used-cars/muscat`, {
      waitUntil: "domcontentloaded",
    });
    const facetBody = await page.locator("body").innerText().catch(() => "");
    const facetLive =
      facetRes?.status() === 200 &&
      !/This page could not be found/i.test(facetBody);

    await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
    const footerMuscat = await page
      .locator('footer a[href*="used-cars/muscat"]')
      .count();

    log(
      `[${name}] footer matches facet state`,
      facetLive ? footerMuscat > 0 : footerMuscat === 0,
      facetLive
        ? `facet live, footer links=${footerMuscat} (want >0)`
        : `facet gated, footer links=${footerMuscat} (want 0)`,
    );

    await context.close();
  }

  await runViewport("desktop", { width: 1280, height: 800 });
  await runViewport("mobile", { width: 390, height: 844 });

  await browser.close();
  if (failures.length) {
    console.error(`\n${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log("\nBuy flow OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
