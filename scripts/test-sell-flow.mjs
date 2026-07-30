/**
 * Smoke-test the Sell your car -> Add listing workflow.
 *
 * Usage: pnpm test:sell          (or node scripts/test-sell-flow.mjs)
 *
 * ## Run it against a PRODUCTION build, not `next dev`
 *
 *   pnpm db:dev && pnpm dev:cms                      (Strapi on :1337)
 *   cd apps/web && pnpm build && npx next start -p 3001
 *   pnpm test:sell
 *
 * `next dev` does not work for this, and the reason is unresolved: React never
 * finishes hydrating there. Confirmed directly rather than inferred — the
 * Publish button has no React props attached, so no click handler exists.
 * Symptoms are misleading: pages render (the server rendered them) and inputs
 * accept typing (that is the browser, not React), so only a click reveals it.
 * The console shows the HMR websocket failing with ERR_INVALID_HTTP_RESPONSE on
 * a loop.
 *
 * Ruled out while chasing it: the security headers are NOT applied to the
 * upgrade (the 101 response carries none — checked with curl), and the endpoint
 * upgrades correctly when called directly. Adding `'unsafe-eval'` to the dev CSP
 * did not fix it either. Left alone rather than patched on a guess.
 *
 * It needs a reachable CMS as well as the web app. It used to need only the web
 * app, because submitting was a WhatsApp handoff — a link, no server involved.
 * Since 4be81c8 an account is required and the submission is a real POST.
 *
 * ## What changed in this test, and why it was failing
 *
 * Three assertions went stale the moment the account gate landed, and because
 * this script is not wired into CI nothing said so:
 *
 *   1. Steps 1-2 waited for `/en/add-listing`. An anonymous visitor now gets a
 *      307 to `/en/sign-in?next=/add-listing`, so both timed out.
 *   2. Everything from the form onwards assumed it could reach the form at all.
 *   3. The last step waited for a WhatsApp popup and a "sent — check whatsapp"
 *      notice. SUBMIT_MODE is "api"; no popup is ever opened.
 *
 * The redirect is now asserted rather than worked around — it is the feature —
 * and the run then signs in so the rest of the flow has a session.
 */
import { chromium } from "playwright-core";

// Default to 127.0.0.1 so Playwright matches a hostname-bound next dev
// (`next dev --hostname 127.0.0.1`). Override with SELL_FLOW_BASE if needed.
const BASE = process.env.SELL_FLOW_BASE || "http://127.0.0.1:3001";

/**
 * One fixed account, reused across runs.
 *
 * A fresh address per run was the first design and it is wrong: registration is
 * rate-limited to 10 attempts per 15 minutes per IP, so running this test more
 * than ten times in a quarter of an hour — which is exactly what happens while
 * working on it — starts failing with "Too many attempts". The limiter is
 * correct; burning a rate-limited resource on every run was not.
 *
 * So sign in first and register only if that fails. Steady state is one login
 * and zero registrations, and a first run on a fresh database registers once.
 */
const TEST_EMAIL = "smoke-seller@test.local";
const TEST_PASSWORD = "Passw0rd!23";
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
    if (msg.type() !== "error") return;
    /*
     * Record the URL, not only the text.
     *
     * Chrome logs a failed subresource as the bare string "Failed to load
     * resource: the server responded with a status of 404", with the offending
     * URL only in the message *location*. Filtering on text alone therefore
     * cannot tell one of our 404s from one of Vercel's — and Vercel's were
     * failing this test after the flow itself had entirely passed.
     */
    const where = msg.location?.().url ?? "";
    errors.push(`console: ${msg.text()}${where ? ` [${where}]` : ""}`);
  });

  const fail = (msg) => {
    throw new Error(msg);
  };

  // 0. The account gate itself. An anonymous visitor must NOT reach the form.
  console.log("0. Account gate");
  await page.goto(`${BASE}/en/add-listing`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  if (!/\/en\/sign-in/.test(page.url())) {
    fail(`Anonymous /add-listing should redirect to sign-in, landed on ${page.url()}`);
  }
  if (!/next=%2Fadd-listing|next=\/add-listing/.test(page.url())) {
    fail(`Sign-in redirect lost the ?next= target: ${page.url()}`);
  }
  console.log("   anonymous redirect:", page.url().replace(BASE, ""));

  // 0b. Get a session for the rest of the run.
  //     Through the page's own request context, so the httpOnly cookie the route
  //     handler sets lands in this browser context — the form cannot be reached
  //     any other way, and no token is readable from JS by design.
  console.log("0b. Sign in (registering once if the account is new)");
  let auth = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });

  if (!auth.ok()) {
    const reg = await page.request.post(`${BASE}/api/auth/register`, {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD, fullName: "Smoke Tester" },
    });
    if (!reg.ok()) {
      const body = await reg.text();
      fail(
        `Could not sign in or register (${reg.status()}): ${body}\n` +
          `      Is the CMS running? This test needs Strapi as well as the web app.`,
      );
    }
    console.log("   registered", TEST_EMAIL, "(first run against this database)");
    auth = reg;
  } else {
    console.log("   signed in as", TEST_EMAIL);
  }

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
  console.log("   publish disabled:", disabled);

  const reviewTitle = await page.getByText("2015 Toyota Corolla").count();
  console.log("   derived title visible:", reviewTitle > 0);

  if (!disabled) {
    /**
     * Assert the API submission, not a WhatsApp popup.
     *
     * This block used to wait for `page.waitForEvent("popup")` and a URL like
     * `wa.me/968...`. SUBMIT_MODE is "api" now, so no window is ever opened and
     * that wait could only ever time out.
     *
     * What replaces it is stronger: watch the actual POST to /api/listings and
     * check what the server said. A green tick in the UI is worth much less than
     * a 200 carrying `status: "pending-review"`, which is the whole contract —
     * the listing was accepted, and it is a draft awaiting a human.
     */
    const postPromise = page.waitForResponse(
      (r) => r.url().includes("/api/listings") && r.request().method() === "POST",
      { timeout: 30000 },
    );
    await page.getByTestId("listing-publish").click({ force: true });

    const res = await postPromise;
    const body = await res.json().catch(() => null);
    console.log("   POST /api/listings ->", res.status(), JSON.stringify(body));

    if (res.status() !== 200 || body?.ok !== true) {
      fail(`Submission rejected (${res.status()}): ${JSON.stringify(body)}`);
    }
    if (body?.status !== "pending-review") {
      // Not cosmetic. Anything else means the draft/review contract changed, and
      // the review queue is the only thing keeping unverified cars off the site.
      fail(`Expected status "pending-review", got ${JSON.stringify(body?.status)}`);
    }

    // The UI has to agree with the server — a silent success is a bug of its own.
    const sent = await page
      .getByText(/thank you|received|pending|review/i)
      .count();
    console.log("   success notice shown:", sent > 0);
    if (sent === 0) fail("Server accepted the listing but the form said nothing");
  }

  /*
   * Soft-filter tooling noise, keep real app errors.
   *
   * `_vercel` covers the analytics and speed-insights scripts. @vercel/analytics
   * injects those tags unconditionally and the files only exist when served by
   * Vercel, so locally they 404 and Chrome then refuses the HTML error page as a
   * script. Two errors per page load, on every page, none of them ours — and
   * they were failing this test after the flow itself had entirely passed.
   */
  const realErrors = errors.filter(
    (e) =>
      !/favicon|hydration|Download the React DevTools|WebSocket|webpack-hmr|MISSING_MESSAGE|_vercel/i.test(
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
  if (disabled) {
    /*
     * Under SUBMIT_MODE "api" this should be unreachable: canSubmitListing()
     * returns true unconditionally, so a disabled Publish button means the form
     * thought the listing was incomplete. Say so rather than exit 0 quietly —
     * the previous version printed a note about an unset WhatsApp number, which
     * has not been the reason since the API path landed.
     */
    fail("Publish was disabled — the form considered the listing incomplete");
  }
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
