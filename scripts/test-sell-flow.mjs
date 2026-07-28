/**
 * Smoke-test the Sell your car → Add listing workflow against a running
 * Next.js server (default http://127.0.0.1:3001).
 *
 * Usage: node scripts/test-sell-flow.mjs
 */
import { chromium } from "playwright-core";

// Default to 127.0.0.1 so Playwright matches a hostname-bound next dev
// (`next dev --hostname 127.0.0.1`). Override with SELL_FLOW_BASE if needed.
const BASE = process.env.SELL_FLOW_BASE || "http://127.0.0.1:3001";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });

  const fail = (msg) => {
    throw new Error(msg);
  };

  // 1. Header CTA (`.flat-bt-top .sc-button`) → add-listing
  //    Nav also has a "Sell your car" link to /sell-your-car (rules). Same
  //    label, different destinations — click the button, not the nav item.
  console.log("1. Header Sell CTA → add-listing");
  await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const headerCta = page.locator("header .flat-bt-top a.sc-button").first();
  if (!(await headerCta.count())) fail("Header has no Sell your car CTA button");
  const headerHref = await headerCta.getAttribute("href");
  if (!/add-listing/.test(headerHref || "")) {
    fail(`Header CTA should go to add-listing, got ${headerHref}`);
  }
  await Promise.all([
    page.waitForURL(/\/en\/add-listing/, { timeout: 20000 }),
    headerCta.click(),
  ]);

  // 2. Nav "Sell your car" → rules page, then Add a listing
  console.log("2. Nav sell-your-car → Add a listing");
  await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded", timeout: 60000 });
  const navSell = page.locator('header nav a[href*="sell-your-car"]').first();
  if (!(await navSell.count())) fail("Nav missing Sell your car link");
  await Promise.all([
    page.waitForURL(/\/en\/sell-your-car/, { timeout: 20000 }),
    navSell.click(),
  ]);
  /*
   * Wait for the thing we actually need, not for `networkidle`.
   *
   * `waitForLoadState("networkidle")` is tied to a *document* navigation
   * lifecycle. The click above is a Next.js client-side transition, so no new
   * document loads and that state never re-fires — the wait ran to its 30s
   * timeout with **zero requests in flight**, and this step had been failing on
   * every run. Verified it fails identically with and without the route change
   * that prompted this fix, so it was the harness, not the site.
   *
   * Waiting for the link to be visible is both more robust and closer to what
   * the test means: the page is ready when the control we are about to click
   * is there.
   */
  // Prefer in-page CTAs (not the header button, which also goes to add-listing).
  const addLinks = page.getByRole("link", { name: /^add a listing$/i });
  await addLinks.first().waitFor({ state: "visible", timeout: 20000 });
  if ((await addLinks.count()) < 1) fail("sell-your-car missing Add a listing");
  await Promise.all([
    page.waitForURL(/\/en\/add-listing/, { timeout: 20000 }),
    addLinks.first().click(),
  ]);

  // 3. Form loads with a real step heading (not undefined)
  console.log("3. Form shell");
  await page.waitForSelector(".tfcl-add-listing-flow", { timeout: 20000 });
  const heading = (await page.locator(".tfcl-step-heading").innerText()).trim();
  if (!heading || /undefined/.test(heading)) {
    fail(`Step heading broken: "${heading}"`);
  }
  console.log("   step 1 heading:", heading);

  // 4. Fill car step
  console.log("4. Car step");
  const next = () => page.getByTestId("listing-next").click({ force: true });

  await page.locator("#listing_make").fill("Toyota");
  await page.locator("#listing_model").fill("Corolla");
  await page.locator("#listing_year").fill("2015");
  await page.locator("#listing_km").fill("185000");
  await next();
  await page.waitForSelector(".tfcl-step-heading:text-is('Spec & condition')", {
    timeout: 10000,
  });

  // 5. Spec
  console.log("5. Spec step");
  await page.locator("#listing_spec").selectOption({ index: 1 });
  await next();
  await page.waitForSelector(".tfcl-step-heading:text-is('Price')", {
    timeout: 10000,
  });

  // 6. Price — reject over-band, accept in-band
  console.log("6. Price step");
  const priceInput = page.locator("#listing_price");
  await priceInput.fill("12000");
  await page.waitForTimeout(200);
  const overBand = await page.getByText(/only lists cars up to|above the band/i).count();
  if (!overBand) fail("Expected over-band validation message for OMR 12,000");
  await priceInput.fill("1200");
  await page.waitForTimeout(200);
  const asIs = await page.getByText(/sold as-is|as-is/i).count();
  console.log("   as-is notice for 1200:", asIs > 0);
  await priceInput.fill("3500");
  await next();
  await page.waitForSelector(".tfcl-step-heading:text-is('Photos')", {
    timeout: 10000,
  });

  // 7. Photos skip
  console.log("7. Photos step (skip)");
  await next();
  await page.waitForSelector(".tfcl-step-heading:text-is('Where & contact')", {
    timeout: 10000,
  });

  // 8. Contact
  console.log("8. Contact step");
  const cityValue = await page.locator("#listing_city option").evaluateAll((opts) => {
    const hit = opts.find((o) => /muscat/i.test(o.textContent || ""));
    return hit?.value || (opts[1] && opts[1].value) || "";
  });
  if (!cityValue) fail("No city options on contact step");
  await page.locator("#listing_city").selectOption(cityValue);
  const waField = page.locator("#listing_whatsapp");
  if (await waField.count()) await waField.fill("91234567");
  else await page.locator('input[placeholder*="9XXX"]').first().fill("91234567");
  await page.waitForTimeout(200);
  const validHint = await page.getByText(/buyers will message \+96891234567/i).count();
  console.log("   valid WhatsApp hint:", validHint > 0);
  await next();
  await page.waitForSelector(".tfcl-step-heading:text-is('Review')", {
    timeout: 10000,
  });

  // 9. Review
  console.log("9. Review step");
  const publish = page.getByRole("button", { name: /publish listing/i }).first();
  if (!(await publish.count())) fail("Publish button missing on review");
  const disabled = await publish.isDisabled();
  const notConfigured = await page
    .getByText(/not switched on yet|no WhatsApp number configured/i)
    .count();
  console.log("   publish disabled:", disabled);
  console.log("   not-configured notice:", notConfigured > 0);

  const reviewTitle = await page.getByText("2015 Toyota Corolla").count();
  console.log("   derived title visible:", reviewTitle > 0);

  if (!disabled) {
    // Capture the WhatsApp handoff URL instead of letting a real window open.
    const popupPromise = page.waitForEvent("popup", { timeout: 5000 }).catch(() => null);
    await page.getByTestId("listing-publish").click({ force: true });
    const popup = await popupPromise;
    if (!popup) fail("Publish did not open a WhatsApp window");
    const popupUrl = popup.url();
    const waOk =
      /wa\.me\/968\d+/i.test(popupUrl) ||
      (/api\.whatsapp\.com/i.test(popupUrl) && /phone=968\d+/i.test(popupUrl));
    console.log("   whatsapp href ok:", waOk);
    if (!waOk) fail(`Unexpected WhatsApp URL: ${popupUrl}`);
    if (!/Toyota|Corolla|3500|3%2C500|OMR/i.test(popupUrl)) {
      fail(`WhatsApp message missing listing details: ${popupUrl}`);
    }
    await popup.close();
    const sent = await page.getByText(/sent — check whatsapp/i).count();
    console.log("   success notice:", sent > 0);
  }

  // Soft-filter noisy console noise (HMR / tooling), keep real app errors.
  const realErrors = errors.filter(
    (e) =>
      !/favicon|hydration|Download the React DevTools|WebSocket|webpack-hmr|MISSING_MESSAGE/i.test(
        e,
      ),
  );
  if (realErrors.length) {
    console.log("page errors:");
    for (const e of realErrors.slice(0, 20)) console.log(" ", e);
    fail(`Runtime errors on page:\n${realErrors.join("\n")}`);
  }

  await browser.close();

  console.log("\nOK — sell workflow smoke test finished");
  if (disabled && notConfigured > 0) {
    console.log(
      "NOTE: Publish is disabled because NEXT_PUBLIC_AUTOSOUQ_WHATSAPP is unset.",
    );
    console.log(
      "      Set it in apps/web/.env.local (e.g. 9689XXXXXXX) and restart the web app to complete the handoff.",
    );
  }
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
