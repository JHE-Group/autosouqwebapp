/**
 * Smoke-test the two Swiper carousels against a running Next.js server.
 *
 * Usage: CAROUSEL_BASE=http://127.0.0.1:3001 node scripts/test-carousels.mjs
 *
 * Why this exists as a script rather than a code review note.
 *
 * Swiper 7 renamed the carousel root from `.swiper-container` to `.swiper`.
 * The theme this site is built on vendored Swiper **6.8.1** CSS
 * (public/assets/css/swiper-bundle.min.css), which styles only the old name —
 * so after the JS was upgraded, `.swiper` was left with no `position:
 * relative` and no `overflow: hidden`, and the listing gallery computed
 * `overflow-x: visible`. Nothing looked broken, because the crossfade stacks
 * its slides instead of laying them in a row, and because RecomandedCars
 * happened to pass the legacy `swiper-container` class by hand.
 *
 * That is a failure no unit test and no amount of reading catches: it only
 * shows up in a browser, in computed style. Hence this file. It asserts the
 * things that silently regress on a Swiper upgrade — the root is clipped, the
 * instance initialises, a slide actually advances, and the prev/next controls
 * are exposed to assistive tech (which requires the A11y module to be
 * registered; Swiper adds nothing otherwise).
 */
import { chromium } from "playwright-core";

const BASE = process.env.CAROUSEL_BASE || "http://127.0.0.1:3001";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/**
 * `slug` is resolved at runtime for the gallery, because listing slugs change
 * with the catalogue. /about-us is stable and always carries the recommended
 * rail.
 */
const RAIL_PATH = "/en/about-us";

async function firstListingPath(page) {
  await page.goto(`${BASE}/en/used-cars`, { waitUntil: "domcontentloaded" });
  return page.evaluate(() => {
    const a = document.querySelector('a[href*="/car/"]');
    return a ? new URL(a.href).pathname : null;
  });
}

async function inspect(page, path) {
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => {
    const root = document.querySelector(".swiper");
    if (!root) return null;
    const cs = getComputedStyle(root);
    const nav = [
      ...document.querySelectorAll(".swiper-button-next, .swiper-button-prev"),
    ];
    return {
      initialised: root.classList.contains("swiper-initialized"),
      overflow: cs.overflowX,
      position: cs.position,
      slides: root.querySelectorAll(".swiper-slide").length,
      navCount: nav.length,
      navNamed: nav.filter((n) => n.getAttribute("aria-label")).length,
      navFocusable: nav.filter((n) => n.hasAttribute("tabindex")).length,
    };
  });
  if (!state) return { status: res.status(), missing: true };

  const moved = await page.evaluate(() => {
    const sw = document.querySelector(".swiper")?.swiper;
    if (!sw) return null;
    const before = sw.activeIndex;
    sw.slideNext();
    return { before, after: sw.activeIndex };
  });
  return { status: res.status(), ...state, moved };
}

function check(name, r, { galleryMayBeAbsent = false } = {}) {
  const problems = [];
  if (r.missing) {
    /*
     * A listing with no photographs renders no gallery at all — Slider1 returns
     * null on an empty image list. That became the normal state once
     * lib/strapi.js stopped handing AI-generated stand-ins to real listings in
     * production, so an absent gallery on a photo-less listing is correct
     * behaviour, not a regression. Still a failure anywhere a carousel must
     * exist, which is why this is opt-in per case.
     */
    if (galleryMayBeAbsent) {
      console.log(`  ok  ${name}  [${r.status}] no gallery — listing has no photos yet`);
      return true;
    }
    problems.push("no .swiper root");
  }
  else {
    if (!r.initialised) problems.push("never initialised");
    // The regression this file was written for.
    if (r.overflow !== "hidden") problems.push(`root not clipped (overflow-x: ${r.overflow})`);
    if (r.position !== "relative") problems.push(`root position: ${r.position}`);
    // Arrows are rendered only when there is more than one slide; when they are
    // rendered, the A11y module must have named them.
    if (r.navCount > 0 && r.navNamed < r.navCount)
      problems.push(`${r.navCount - r.navNamed} unnamed nav control(s) — is the A11y module registered?`);
    if (r.navCount > 0 && r.navFocusable < r.navCount)
      problems.push(`${r.navCount - r.navFocusable} nav control(s) not focusable`);
    if (r.slides > 1 && r.moved && r.moved.before === r.moved.after)
      problems.push("slideNext() did not advance");
  }

  const ok = problems.length === 0;
  console.log(
    `${ok ? "  ok" : "FAIL"}  ${name}  [${r.status}] ` +
      (r.missing
        ? ""
        : `slides=${r.slides} overflow-x=${r.overflow} nav=${r.navCount}(${r.navNamed} named)`),
  );
  for (const p of problems) console.log(`        - ${p}`);
  if (r.slides === 1)
    console.log("        note: single slide, so nav controls are correctly absent");
  return ok;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  // 390px: the carousels matter most on a phone.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let ok = true;

  ok = check("recommended cars (slide)", await inspect(page, RAIL_PATH)) && ok;

  const listing = await firstListingPath(page);
  if (listing) {
    ok =
      check(`listing gallery (fade) ${listing}`, await inspect(page, listing), {
        galleryMayBeAbsent: true,
      }) && ok;
  } else {
    console.log("FAIL  listing gallery: no /car/ link found on /en/used-cars");
    ok = false;
  }

  console.log(ok ? "\nOK — carousels behave" : "\nFAILED");
  process.exitCode = ok ? 0 : 1;
} finally {
  await browser.close();
}
