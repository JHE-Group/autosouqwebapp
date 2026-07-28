#!/usr/bin/env node
/**
 * Refuse to launch while any published listing is running on a generated photo.
 *
 * `public/assets/images/listings/README.md` asks for exactly this check and
 * says why: every file in that folder was made by an image model, none of them
 * shows a car that exists, and NICHE.md makes "the price you see is the real
 * price" and verified listings the whole proposition. A generated picture of a
 * car that is not real, attached to a car that is, is the single most damaging
 * thing this site could publish.
 *
 * The trap it guards is not theoretical. The stand-ins are keyed by slug, and
 * their ten slugs are the ten most ordinary cars in the OMR 1,000–6,000 band.
 * Strapi mints a listing's slug from its title, and the gallery is optional —
 * so a real Toyota Corolla 2015 XLI listed without photos collides exactly.
 * `lib/strapi.js` now refuses to serve stand-ins in production; this checks the
 * other half, that the CMS itself has real photographs before you go live.
 *
 * Usage:
 *   STRAPI_URL=https://cms.autosouq.om node scripts/check-listing-photos.mjs
 *
 * Exit 0 when every published listing has at least one real gallery image.
 * Exit 1 when any is bare, listing which. Exit 0 with a notice when the CMS is
 * unreachable — this must not fail a build over a network blip; it is a
 * pre-launch gate to run deliberately, not a unit test.
 */
const STRAPI_URL =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const url =
  `${STRAPI_URL}/api/listings` +
  `?populate[gallery]=true&pagination[pageSize]=100&fields[0]=slug&fields[1]=title`;

let payload;
try {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  payload = await res.json();
} catch (err) {
  console.log(
    `• listing-photo check skipped — CMS unreachable at ${STRAPI_URL} (${err.message}).\n` +
      "  Run this against the real CMS before launch.",
  );
  process.exit(0);
}

const rows = payload.data ?? [];
if (rows.length === 0) {
  console.log("• listing-photo check: the CMS has no published listings yet.");
  process.exit(0);
}

const bare = rows.filter((r) => !(Array.isArray(r.gallery) && r.gallery.length > 0));

if (bare.length) {
  console.error(
    `✗ ${bare.length} of ${rows.length} published listings have no gallery photo.\n` +
      "  Each would fall back to an AI-generated stand-in, which must never reach a buyer\n" +
      "  (public/assets/images/listings/README.md). Upload real photos in Strapi:\n" +
      bare.map((r) => `    - ${r.slug ?? "(no slug)"}  ${r.title ?? ""}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  `✓ all ${rows.length} published listings carry at least one real gallery photo`,
);
