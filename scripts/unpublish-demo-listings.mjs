#!/usr/bin/env node
/**
 * Unpublish the seeded demo listings from a live CMS.
 *
 * These are stand-ins for cars that do not exist — invented prices, mileage and
 * WhatsApp numbers, with AI-generated photos. They reached production on
 * 2026-07-31 because `demoSeedingEnabled()` returns true whenever NODE_ENV is
 * not "production", and the deployed process did not have it set. Publishing
 * them is the exact thing NICHE.md, the SEED_DEMO_DATA flag and commit 07b86ee
 * all exist to prevent.
 *
 * ## Usage
 *
 *   export AUTOSOUQ_CMS=https://app.autosouq.om
 *   export AUTOSOUQ_ADMIN_EMAIL=you@example.com
 *   export AUTOSOUQ_ADMIN_PASSWORD=...
 *
 *   node scripts/unpublish-demo-listings.mjs             # dry run, changes nothing
 *   node scripts/unpublish-demo-listings.mjs --confirm   # actually unpublish
 *
 * ## Why the admin API and not SQL
 *
 * In Strapi 5 a document has separate draft and published rows, and
 * unpublishing *deletes* the published one. `UPDATE listings SET published_at =
 * NULL` would instead leave two draft rows for the same document — a corruption
 * that looks like it worked. The admin endpoint does the right thing.
 *
 * ## Why the admin API and not a second Strapi process
 *
 * Booting `createStrapi()` against the live database runs register() and
 * bootstrap() again — permission writes, and the seeder itself. Using a
 * long-lived HTTP session touches nothing but the ten documents named below.
 *
 * ## Why it will not touch a real seller's car
 *
 * It matches the ten seeded slugs exactly, and nothing else, so it stays safe to
 * run later when real inventory exists. It also refuses to act on a listing
 * carrying a `seller`, which a seeded one never has and a real submission always
 * does — belt and braces, because the cost of unpublishing a genuine seller's
 * car is a phone call from someone who trusted us.
 */

const CMS = (process.env.AUTOSOUQ_CMS ?? "https://app.autosouq.om").replace(/\/$/, "");
const EMAIL = process.env.AUTOSOUQ_ADMIN_EMAIL;
const PASSWORD = process.env.AUTOSOUQ_ADMIN_PASSWORD;
const CONFIRM = process.argv.includes("--confirm");

/** The seeded catalogue, verbatim from apps/cms/src/index.ts. */
const DEMO_SLUGS = new Set([
  "toyota-corolla-2015-xli",
  "toyota-yaris-2016",
  "toyota-camry-2013-gl",
  "nissan-sunny-2019",
  "honda-civic-2013",
  "hyundai-tucson-2018",
  "mitsubishi-pajero-2014",
  "toyota-prado-2008-vx",
  "kia-picanto-2016",
  "suzuki-swift-dzire-2016",
]);

function die(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

if (!EMAIL || !PASSWORD) {
  die(
    [
      "Set the admin credentials first:",
      "",
      "  export AUTOSOUQ_CMS=https://app.autosouq.om",
      "  export AUTOSOUQ_ADMIN_EMAIL=you@example.com",
      "  export AUTOSOUQ_ADMIN_PASSWORD=...",
      "",
      "These are your Strapi ADMIN PANEL credentials, not a seller account.",
    ].join("\n"),
  );
}

async function main() {
  // 1. Authenticate against the admin API.
  const loginRes = await fetch(`${CMS}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    die(`Admin login failed (${loginRes.status}). Check the credentials and ${CMS}.`);
  }

  const token = (await loginRes.json())?.data?.token;
  if (!token) die("Admin login returned no token.");
  const auth = { Authorization: `Bearer ${token}` };

  /*
   * 2. Read through the ADMIN content-manager API, not the public one.
   *
   * The obvious call is `/api/listings?populate=seller`, and it answers 400:
   * `seller` is `private` in the schema, so the content API rejects populating
   * it — the same restriction that stops the owning account leaking to anyone
   * who asks. The admin API is not subject to it, and the seller is precisely
   * the field this script needs in order to tell a seeded car from a real one.
   */
  const listRes = await fetch(
    `${CMS}/content-manager/collection-types/api::listing.listing?page=1&pageSize=100&status=published`,
    { headers: auth },
  );
  if (!listRes.ok) {
    die(`Could not read listings (${listRes.status}): ${await listRes.text()}`);
  }
  const published = (await listRes.json())?.results ?? [];

  console.log(`${published.length} published listing(s) on ${CMS}\n`);

  const targets = [];
  for (const row of published) {
    const slug = row.slug ?? "";
    if (!DEMO_SLUGS.has(slug)) {
      console.log(`  SKIP  ${slug || "(no slug)"} — not a seeded demo listing`);
      continue;
    }
    /*
     * A seeded listing has no seller; a real submission always does. If this
     * ever fires it means a slug collided with a genuine car, and unpublishing
     * someone's actual listing is far worse than leaving a demo one up.
     */
    if (row.seller) {
      console.log(`  SKIP  ${slug} — has a seller attached, so it is not seeded`);
      continue;
    }
    targets.push(row);
  }

  console.log(`\n${targets.length} to unpublish:`);
  for (const t of targets) console.log(`  - ${t.title}  (${t.slug})`);

  if (!targets.length) {
    console.log("\nNothing to do.");
    return;
  }

  if (!CONFIRM) {
    console.log("\nDry run — nothing changed. Re-run with --confirm to unpublish.");
    return;
  }

  // 3. Unpublish each. The document survives as a draft: recoverable from the
  //    admin, and invisible to the site meanwhile.
  let done = 0;
  for (const t of targets) {
    const res = await fetch(
      `${CMS}/content-manager/collection-types/api::listing.listing/${t.documentId}/actions/unpublish`,
      { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: "{}" },
    );
    if (res.ok) {
      done += 1;
      console.log(`  unpublished  ${t.slug}`);
    } else {
      console.log(`  FAILED       ${t.slug} — ${res.status} ${await res.text()}`);
    }
  }

  // 4. Verify against the public view rather than trusting the responses.
  const after = await fetch(`${CMS}/api/listings?pagination%5BpageSize%5D=100`);
  const remaining = (await after.json())?.data ?? [];
  console.log(`\nUnpublished ${done}/${targets.length}.`);
  console.log(`${remaining.length} listing(s) still public.`);
  for (const r of remaining) console.log(`  still live: ${r.title} (${r.slug})`);
}

main().catch((err) => {
  console.error("\nFAILED:", err.message);
  process.exit(1);
});
