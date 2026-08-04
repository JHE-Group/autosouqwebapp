#!/usr/bin/env node
/**
 * One seller, one car, all the way through — against the running local stack.
 *
 * Run: pnpm test:journey    (or node scripts/test-seller-journey.mjs)
 *
 * ## Why this exists, when six other checks already pass
 *
 * On 2026-08-04 a single manual run of this journey found four defects that two
 * full audits and a day of code review had missed. Three of them were the same
 * defect wearing three hats: `/api/seller/listings`, `/seller/listings/:id/status`
 * and `/seller/profile` mounted, took a perfectly valid token, and answered 403
 * to every seller — because a custom Strapi route still needs a row in the
 * permissions table and those three had none. Nothing in the code that needs the
 * grant mentions the grant. Every unit-style check of those handlers passed,
 * because a handler that is never reached cannot fail.
 *
 * That is the gap. `check-submitted-fields.mjs` proves the route *sends* a
 * field; only a real submission proves the CMS *stored* it. `check-listing-slug.mjs`
 * proves slugifyTitle and resolveListing agree about a string; only a real
 * publish proves the car answers on its own URL. This test asserts the things
 * that are only true at the seam:
 *
 *   - a seller can register, and the session that comes back actually works
 *   - an ARABIC submission attaches every taxonomy relation (the four the buyer
 *     filters on, and the three the URL is built from)
 *   - Arabic-Indic digits survive the trip into integer columns
 *   - the slug is Latin and does not begin with a digit
 *   - the draft is not on the site, and the published version is — in BOTH locales
 *   - every seller action on a live car reaches the version it is supposed to
 *
 * It talks to the web app's own route handlers, never to Strapi, for everything
 * a seller does. That is the point: the 403s were invisible from either side on
 * its own, and only the proxy hop exposed them.
 *
 * ## What it needs
 *
 *   web    http://localhost:3050    a PRODUCTION build (`next start`), not `next dev`
 *   CMS    http://localhost:1337    Strapi
 *   db     psql -d autosouq_dev     the same database the CMS is pointed at
 *
 * `next dev` is not supported here for the same reason test-sell-flow.mjs says
 * it is not: React never finishes hydrating there. This test does not click
 * anything, so it would mostly work — but the ISR behaviour it waits on (see
 * step 6) only exists in a built app, so a dev server would fail step 6 with a
 * confusing message about a cache that is not running.
 *
 * ## It will not run against production
 *
 * Every base URL is checked to be loopback before a single request is made. This
 * script registers accounts, writes rows and deletes them again; pointed at
 * app.autosouq.om it would be a data-loss incident, so the guard is the first
 * thing that happens and it has no override flag.
 *
 * ## Publishing
 *
 * Publishing is a moderator action and the local CMS has no admin account to
 * perform it with (`select * from admin_users` is empty — the panel has never
 * been registered on this machine). Strapi 5 keeps the published version of a
 * document as a SEPARATE ROW, so publishing is: clone the draft row, stamp
 * `published_at`, clone its `listings_*_lnk` rows. That is exactly what the
 * admin's Publish button leaves behind, and it is what the QA brief prescribes.
 *
 * Taking it down afterwards goes through the seller's own endpoint, which calls
 * Strapi's real `unpublish()` — so the teardown is not simulated, and the run
 * proves that the two agree about what a published document looks like.
 */
import { execFileSync } from "node:child_process";

/* ------------------------------------------------------------------ setup -- */

const WEB = (process.env.SELLER_JOURNEY_WEB ?? "http://localhost:3050").replace(/\/$/, "");
const CMS = (process.env.SELLER_JOURNEY_CMS ?? "http://localhost:1337").replace(/\/$/, "");
const DB = process.env.AUTOSOUQ_DEV_DB ?? "autosouq_dev";

/**
 * Loopback only, and no way to say "yes I mean it".
 *
 * The QA brief's first rule is that nothing here touches production, and this
 * script is the most dangerous thing in scripts/: it creates accounts, publishes
 * a listing by writing to the database, and deletes rows in a `finally` block
 * that runs even when an assertion fails. A typo'd environment variable is the
 * whole distance between a test run and an incident.
 *
 * Hostnames rather than a substring match — "localhost.autosouq.om" resolves
 * wherever its owner points it, and `includes("localhost")` would wave it
 * through.
 */
const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"]);
for (const [label, url] of [["web", WEB], ["CMS", CMS]]) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    console.error(`✗ ${label} base "${url}" is not a URL.`);
    process.exit(1);
  }
  if (!LOOPBACK.has(host)) {
    console.error(
      `✗ refusing to run: the ${label} base is ${url}.\n` +
        `  This test registers sellers, publishes a listing by writing to the\n` +
        `  database, and deletes rows on the way out. It runs against localhost\n` +
        `  and nothing else. There is no override.`,
    );
    process.exit(1);
  }
}

/** Everything this run creates carries this, so a killed run can be swept up. */
const RUN = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
// The brief's convention: `qa-<name>-*@example.com`, removable in one query.
const EMAIL = `qa-e2e-${RUN}@example.com`;
const PASSWORD = "Passw0rd!23";

/**
 * A different client address per run, and why that is not cheating.
 *
 * `/seller/register` is rate-limited to 10 attempts per 15 minutes per address,
 * and lib/auth.js forwards the seller's own address so the limit is per-seller
 * rather than per-site. Correct, and fatal to this test: the journey starts with
 * a BRAND NEW seller — that is the thing being tested — so it cannot reuse one
 * account the way test-sell-flow.mjs does, and eleven runs in a quarter of an
 * hour is exactly what happens on the afternoon someone is working on it.
 *
 * So each run presents itself as a different client. Honest about what this is:
 * `x-forwarded-for` is a header the web app chooses to believe, which is stated
 * in lib/auth.js and in the CMS middleware. Sending it here means the limiter is
 * not exercised by this test — that is a deliberate trade, and 10.x is a private
 * range that can never be a real seller's address.
 */
const CLIENT_IP = `10.${(Math.random() * 254) | 0}.${(Math.random() * 254) | 0}.${((Math.random() * 253) | 0) + 1}`;

/**
 * The car, filed the way the default locale's seller files it.
 *
 * Make, model, colour and city are Arabic because they are free text or a
 * datalist, and `/ar` is the default locale — api/listings' `pickTaxonomy` only
 * learned to match `nameAr` after a seller typing تويوتا was found to match
 * nothing, drop `make`, and file a car whose URL 404'd.
 *
 * `تـويوتا` carries a TATWEEL (U+0640), the decorative stretch an Arabic
 * keyboard emits and a reader does not see. It must fold away in
 * `normalizeForMatch` and match `تويوتا`. A test that only sends the exact
 * stored string proves the lookup works on the one input that needs no
 * normalising.
 *
 * Body, transmission, fuel and drive are the English CMS vocabulary on purpose:
 * AddListing's Select stores a stable English `value` whatever language the
 * label is in, so that is genuinely what an Arabic seller's form submits.
 *
 * The numbers are Arabic-Indic (٠-٩) throughout. `\d` is `[0-9]`, so an unfolded
 * `٩١٢٣٤٥٦٧` is deleted entirely by `replace(/\D/g, "")` and the seller is told
 * their WhatsApp number is missing — which is what happened, in the submit path,
 * after the same bug had already been fixed twice elsewhere.
 */
const EXPECT_PRICE = 3500;
const EXPECT_YEAR = 2015;
const EXPECT_MILEAGE = 185000;
const REPRICED_TO = 2750;

const PAYLOAD = {
  make: "تـويوتا",
  model: "كورولا",
  city: "مسقط",
  color: "أبيض",
  year: "٢٠١٥",
  km: "١٨٥٠٠٠",
  price: "٣٥٠٠",
  whatsapp: "٩١٢٣٤٥٦٧",
  phone: "٩١٢٣٤٥٦٧",
  doors: "٤",
  cylinders: "٤",
  seats: "٥",
  engineSize: "١.٦",
  body: "Sedan",
  transmission: "Automatic",
  fuelType: "Petrol",
  driveType: "Front-wheel drive (FWD)",
  importSpec: "gcc",
  condition: "Good",
  noKnownFaults: true,
  videoUrl: `https://youtu.be/qa-${RUN}`,
  /*
   * I, O and Q have never appeared in a VIN — they are excluded because they
   * read as 1 and 0, which is also why a seller copying one off a dusty plate
   * types them. api/listings folds them rather than rejecting the listing, and
   * this is the input that proves it: 17 characters in, 17 out, no I/O/Q left.
   */
  vin: "JTDBR32E1I0O0Q123",
};
const EXPECT_VIN = "JTDBR32E110000123";

/** Taxonomy the submission must end up related to, by the row's Latin slug. */
const EXPECT_RELATIONS = {
  make_slug: ["toyota", "the public URL is composed from make/model/year/city (lib/seo.js listingSlug). A listing with no make gets a link on browse that 404s on arrival — that was every seller listing until 985cc28"],
  model_slug: ["corolla", "same as make: without it the composed URL loses a segment and the car is unreachable from the page that links to it"],
  city_slug: ["muscat", "the city is a URL segment AND facet membership. Unrelated, the car never counts towards /used-cars/muscat and never appears in a filtered view"],
  body_slug: ["sedan", "components/carsListings builds its filter options from this relation. Unset, the seller's car matches no body filter"],
  transmission_slug: ["automatic", "a browse filter. The seller answered 'Automatic' and the card would show no transmission and match no filter"],
  fuel_slug: ["petrol", "a browse filter. Eleven fields once reached neither a column nor the description; four of them were these"],
  color_slug: ["white", "a browse filter, and the one an Arabic seller types free-hand — so it is also the proof that pickTaxonomy matched on nameAr"],
};

/* --------------------------------------------------------------- failures -- */

class JourneyFailure extends Error {}

let currentStep = "startup";

/**
 * Fail with a sentence, not a boolean.
 *
 * "expected true, got false" is the failure mode this test exists to replace.
 * Whoever reads this output is about to deploy, may not have written the code,
 * and needs to know what a seller would experience — so every failure names the
 * request, what was observed, and what it costs.
 */
function fail(what, why, observed) {
  const err = new JourneyFailure(
    `${what}\n` +
      `      why it matters: ${why}` +
      (observed ? `\n      observed:       ${observed}` : ""),
  );
  // Captured here, not read at print time: cleanup runs in a `finally` and moves
  // `currentStep` on, so the report would otherwise blame every failure on the
  // teardown that followed it.
  err.step = currentStep;
  throw err;
}

function check(ok, what, why, observed) {
  if (!ok) fail(what, why, observed);
}

function step(label) {
  currentStep = label;
  console.log(`\n${label}`);
}

const say = (line) => console.log(`   ${line}`);

/* ------------------------------------------------------------------- http -- */

/**
 * One cookie jar for the run.
 *
 * The session is an httpOnly cookie holding Strapi's refresh pair — never a
 * bearer token, deliberately (lib/auth.js). So there is nothing to read out and
 * put in a header: the only way to be signed in is to carry the cookies, which
 * is also the only way a browser can do it.
 */
const jar = new Map();

function absorbCookies(res) {
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const pair = line.split(";")[0];
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
}

async function web(path, init = {}) {
  let res;
  try {
    res = await fetch(`${WEB}${path}`, {
      ...init,
      headers: {
        "x-forwarded-for": CLIENT_IP,
        ...(init.headers ?? {}),
        ...(jar.size
          ? { Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") }
          : {}),
      },
      redirect: "manual",
    });
  } catch (err) {
    fail(
      `${init.method ?? "GET"} ${path} — the web app did not answer`,
      "nothing below this line can run. Start the production build first: cd apps/web && pnpm build && npx next start -p 3050",
      String(err),
    );
  }
  absorbCookies(res);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* HTML page, or an empty body */
  }
  return { status: res.status, json, text, headers: res.headers };
}

async function cms(path, init = {}) {
  const res = await fetch(`${CMS}${path}`, init);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: res.status, json, text };
}

/* --------------------------------------------------------------- database -- */

/**
 * `psql`, not a driver.
 *
 * scripts/dev-db.mjs already talks to Postgres this way and the root package has
 * exactly one dependency (playwright-core). `pg` is present in node_modules only
 * because pnpm hoisted it out of apps/cms, which is not a thing to build a
 * pre-deploy gate on.
 */
function psql(sql) {
  try {
    return execFileSync("psql", ["-d", DB, "-tAX", "-c", sql], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (err) {
    const detail = (err.stderr || err.message || "").toString().trim();
    fail(
      `psql -d ${DB} failed`,
      `this test reads the database to prove what was stored, because an API that answers 200 having dropped a field is exactly the failure it is looking for`,
      detail,
    );
  }
}

/**
 * Anything interpolated into SQL has to be boring first.
 *
 * Document ids and generated emails are the only values that reach a query, and
 * both are ours — but "both are ours" is what everyone says before the one that
 * is not. Rejecting anything that is not `[A-Za-z0-9@._-]` is cheaper than
 * getting quoting right, and it fails loudly rather than quietly building the
 * wrong statement.
 */
function literal(value) {
  const raw = String(value ?? "");
  if (!/^[A-Za-z0-9@._-]+$/.test(raw)) {
    fail(
      `refusing to put ${JSON.stringify(raw)} into a SQL statement`,
      "it is not a plain identifier, and this script builds statements by concatenation",
    );
  }
  return `'${raw}'`;
}

/** One row as an object, or null. */
function queryOne(sql) {
  const out = psql(`select row_to_json(t) from (${sql}) t limit 1;`);
  return out ? JSON.parse(out.split("\n")[0]) : null;
}

/** Every row as an array of objects. */
function queryAll(sql) {
  const out = psql(`select row_to_json(t) from (${sql}) t;`);
  return out ? out.split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
}

/**
 * The listing's rows, draft first.
 *
 * Both versions are read every time on purpose. Half of what this test asserts
 * is about WHICH version a write landed on — a reprice must move the draft and
 * leave the live page alone; marking sold must move both — and you cannot see
 * that from an endpoint that returns one of them.
 */
function listingRows(documentId) {
  return queryAll(`
    select
      l.id, l.document_id, l.title, l.slug, l.price::float8 as price, l.year, l.mileage,
      l.whatsapp, l.phone, l.vin, l.doors, l.cylinders, l.seats,
      l.engine_size::float8 as engine_size, l.drive_type, l.import_origin, l.currency,
      l.listing_status, l.sold_as_is, l.verified, l.video_url, l.description,
      l.published_at is not null as published,
      l.availability_confirmed_at is not null as confirmed,
      mk.slug as make_slug, md.slug as model_slug, ct.slug as city_slug,
      bt.slug as body_slug, tr.slug as transmission_slug, fu.slug as fuel_slug,
      cc.slug as color_slug, u.email as seller_email
    from listings l
      left join listings_make_lnk lmk on lmk.listing_id = l.id
      left join makes mk on mk.id = lmk.make_id
      left join listings_model_lnk lmd on lmd.listing_id = l.id
      left join models md on md.id = lmd.model_id
      left join listings_city_lnk lct on lct.listing_id = l.id
      left join cities ct on ct.id = lct.city_id
      left join listings_body_type_lnk lbt on lbt.listing_id = l.id
      left join body_types bt on bt.id = lbt.body_type_id
      left join listings_transmission_lnk ltr on ltr.listing_id = l.id
      left join transmissions tr on tr.id = ltr.transmission_id
      left join listings_fuel_type_lnk lfu on lfu.listing_id = l.id
      left join fuel_types fu on fu.id = lfu.fuel_type_id
      left join listings_color_lnk lcc on lcc.listing_id = l.id
      left join car_colors cc on cc.id = lcc.car_color_id
      left join listings_seller_lnk lsl on lsl.listing_id = l.id
      left join up_users u on u.id = lsl.user_id
    where l.document_id = ${literal(documentId)}
    order by l.published_at nulls first, l.id
  `);
}

const draftOf = (rows) => rows.find((r) => !r.published) ?? null;
const publishedOf = (rows) => rows.find((r) => r.published) ?? null;

/**
 * Publish, the way the admin's Publish button does.
 *
 * Strapi 5 stores the published version as its own row sharing the document id,
 * so this clones the draft, stamps `published_at`, and clones every
 * `listings_*_lnk` row plus the media join — a published listing that lost its
 * relations would 404 on its own URL, which is the failure this whole test is
 * built around, and it must not be introduced by the test's own scaffolding.
 *
 * Column lists are read from `information_schema` rather than written out. A
 * column added to the Listing content type must not silently stop being copied
 * here, because the symptom would be a published car missing a field the draft
 * has — indistinguishable from the product bug this test is hunting.
 */
function publishAsModerator(documentId) {
  const doc = literal(documentId);
  psql(`
    DO $journey$
    DECLARE cols text; draft_id int; new_id int; t record;
    BEGIN
      SELECT id INTO draft_id FROM listings
        WHERE document_id = ${doc} AND published_at IS NULL LIMIT 1;
      IF draft_id IS NULL THEN
        RAISE EXCEPTION 'no draft row for document %', ${doc};
      END IF;

      SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
        INTO cols FROM information_schema.columns
        WHERE table_name = 'listings' AND column_name <> 'id';
      EXECUTE format(
        'INSERT INTO listings (%s) SELECT %s FROM listings WHERE id = %s RETURNING id',
        cols, cols, draft_id) INTO new_id;
      UPDATE listings SET published_at = now() WHERE id = new_id;

      FOR t IN SELECT table_name FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name LIKE 'listings\\_%\\_lnk' LOOP
        SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
          INTO cols FROM information_schema.columns
          WHERE table_name = t.table_name AND column_name <> 'id';
        EXECUTE format('INSERT INTO %I (%s) SELECT %s FROM %I WHERE listing_id = %s',
          t.table_name, cols, replace(cols, 'listing_id', new_id::text), t.table_name, draft_id);
      END LOOP;

      -- The gallery lives in the polymorphic media join, not a _lnk table.
      INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
        SELECT file_id, new_id, related_type, field, "order"
        FROM files_related_mph
        WHERE related_type = 'api::listing.listing' AND related_id = draft_id;
    END
    $journey$;
  `);
}

/* ---------------------------------------------------------------- cleanup -- */

/**
 * Remove everything this run made, whether it passed or not.
 *
 * In a `finally`, because a test that leaves a half-published car and an orphan
 * account behind every time it fails is a test people stop running — and the
 * runs that fail are precisely the ones that leave the most litter.
 *
 * The sweep at the end collects anything an earlier run was killed before it
 * could tidy. Two hours rather than immediately, so two people running this at
 * the same time do not delete each other's listing mid-assertion.
 */
function cleanup(documentId) {
  const notes = [];
  try {
    if (documentId) {
      const gone = psql(
        `with d as (delete from listings where document_id = ${literal(documentId)} returning 1)
         select count(*) from d;`,
      );
      notes.push(`${gone} listing row(s)`);
    }
    // Anything else this seller owns — a second submission from a future step,
    // or a row whose document id we never learned because the run died first.
    psql(`
      delete from listings l using listings_seller_lnk sl, up_users u
       where sl.listing_id = l.id and u.id = sl.user_id and u.email = ${literal(EMAIL)};
    `);
    const users = psql(
      `with d as (delete from up_users where email = ${literal(EMAIL)} returning 1)
       select count(*) from d;`,
    );
    notes.push(`${users} account`);

    const swept = psql(`
      with old as (
        select u.id from up_users u
         where u.email like 'qa-e2e-%@example.com'
           and u.created_at < now() - interval '2 hours'
      ), l as (
        delete from listings l using listings_seller_lnk sl
         where sl.listing_id = l.id and sl.user_id in (select id from old) returning 1
      ), d as (
        delete from up_users where id in (select id from old) returning 1
      )
      select (select count(*) from l) || '/' || (select count(*) from d);
    `);
    if (swept && swept !== "0/0") notes.push(`swept ${swept} listing/account from older runs`);
  } catch (err) {
    // Never let teardown mask the real failure — the assertion that fired is the
    // news, and an exception thrown from a finally block replaces it.
    console.error(`   cleanup problem (rows may be left behind): ${err.message}`);
  }
  say(`cleaned up: ${notes.join(", ")}`);
}

/* -------------------------------------------------------------- the steps -- */

async function main() {
  console.log(`Seller journey — web ${WEB}, CMS ${CMS}, db ${DB}`);
  console.log(`Run ${RUN} as ${EMAIL}`);

  let documentId = null;
  try {
    /* -- 1. Register, and get a session that works ------------------------ */
    step("1. Register a seller and prove the session");

    const registered = await web("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        fullName: "QA Journey",
        whatsapp: "91234567",
      }),
    });
    check(
      registered.status === 200 && registered.json?.ok === true,
      `POST /api/auth/register answered ${registered.status}`,
      registered.status === 429 || /too many/i.test(registered.text)
        ? "the CMS allows 10 registrations per 15 minutes per address. This run presents a fresh 10.x address each time, so hitting the limit means the CMS is seeing one address for everyone — check that lib/auth.js still forwards x-forwarded-for"
        : "nobody can list a car without an account. This is the first door and everything after it is unreachable",
      registered.text.slice(0, 300),
    );
    check(
      jar.has("autosouq_session"),
      "registration succeeded but set no autosouq_session cookie",
      "the cookie IS the session — it holds Strapi's refresh pair, and without it the seller is registered and immediately signed out",
      `cookies received: ${[...jar.keys()].join(", ") || "none"}`,
    );
    say(`registered ${EMAIL}`);

    const me = await web("/api/auth/me");
    check(
      me.status === 200 && me.json?.user?.email === EMAIL,
      `GET /api/auth/me answered ${me.status} for a session created seconds ago`,
      "getToken() trades the refresh cookie for an access token on every request. If that exchange is broken the seller is signed out between the form and the submit, halfway through filing a car",
      me.text.slice(0, 200),
    );

    /*
     * Signed out means signed out.
     *
     * A session check that only ever tests the positive case passes just as
     * happily against a handler that returns the same user to everybody.
     *
     * `/api/auth/me` answers 200 with `user: null` rather than 401 — it is the
     * client's "who is signed in" probe, not a gate, and a 401 would make every
     * anonymous page load look like an error. So the assertion is on the body:
     * a cookie-less caller must be nobody.
     */
    const anon = await fetch(`${WEB}/api/auth/me`, { redirect: "manual" });
    const anonBody = await anon.json().catch(() => null);
    check(
      anon.status === 200 && anonBody?.user === null,
      `GET /api/auth/me without a cookie answered ${anon.status} ${JSON.stringify(anonBody?.user ?? null)}`,
      "if it names a seller to a caller carrying no session, the session is not what decides who you are — and the response is `no-store` precisely because one seller must never be handed another's name",
    );
    say("session works, and a cookie-less caller is nobody");

    /*
     * The third of the three routes that answered 403 to every seller.
     *
     * `updateProfile` is not part of listing a car, so it is here rather than in
     * its own step — but it shipped without a permission row alongside
     * `setStatus`, and a test that covers two of the three leaves the third to
     * be found by a seller.
     */
    const profile = await web("/api/seller/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "QA Journey Renamed", whatsapp: "91234567" }),
    });
    check(
      profile.status === 200,
      `PUT /api/seller/profile answered ${profile.status}`,
      "a 502 here is the signature of a missing `api::seller-auth.seller-auth.updateProfile` grant in apps/cms/src/index.ts: the route mounts, the token is valid, the CMS answers 403, and the seller reads a generic failure on a form that used to save nothing at all",
      profile.text.slice(0, 200),
    );
    const renamed = queryOne(
      `select full_name from up_users where email = ${literal(EMAIL)}`,
    );
    check(
      renamed?.full_name === "QA Journey Renamed",
      "PUT /api/seller/profile answered 200 but the name did not change",
      "answering 200 without writing is worse than failing: the seller believes their name is fixed and buyers keep seeing the old one",
      `stored: ${JSON.stringify(renamed?.full_name)}`,
    );
    say("profile update reaches the database");

    /* -- 2. File the listing, in Arabic ----------------------------------- */
    step("2. File a listing with Arabic make/model/city and Arabic-Indic digits");

    const body = new FormData();
    body.append("payload", JSON.stringify(PAYLOAD));
    const filed = await web("/api/listings", { method: "POST", body });

    check(
      filed.status === 200 && filed.json?.ok === true,
      `POST /api/listings answered ${filed.status}`,
      /invalid key (make|model|city)/i.test(filed.text)
        ? "'Invalid key make' is a PERMISSIONS error wearing a schema error's clothes: Strapi strips relations pointing at a type the caller cannot read. The Authenticated role needs api::make.make.find and its siblings"
        : "this is the whole product. A seller who cannot file a car has nothing else to do here",
      filed.text.slice(0, 300),
    );
    check(
      filed.json?.status === "pending-review",
      `submission accepted but reported status ${JSON.stringify(filed.json?.status)}`,
      "the review queue is the only thing keeping unverified cars off a site whose entire claim is that its listings are real",
    );
    say("submission accepted as pending-review");

    /*
     * Read the id back through the seller's own dashboard endpoint.
     *
     * POST /api/listings deliberately returns no id — the draft is not viewable
     * yet, so an id would only invite a link to a page that 404s. The id has to
     * come from somewhere, and `/api/seller/listings` is where the seller's own
     * dashboard gets it. That makes this both a lookup and an assertion: it is
     * the first of the three routes that answered 403 to every valid token.
     */
    const jwtRes = await cms("/api/auth/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: EMAIL, password: PASSWORD }),
    });
    check(
      jwtRes.status === 200 && jwtRes.json?.jwt,
      `POST ${CMS}/api/auth/local answered ${jwtRes.status}`,
      "the web app signs sellers in through this exact endpoint; if it refuses a freshly created account nobody can sign back in",
      jwtRes.text.slice(0, 200),
    );
    const auth = { Authorization: `Bearer ${jwtRes.json.jwt}` };

    const mine = await cms("/api/seller/listings", { headers: auth });
    check(
      mine.status === 200,
      `GET ${CMS}/api/seller/listings answered ${mine.status} to a valid seller token`,
      mine.status === 403
        ? "403 to a valid token is a MISSING PERMISSION ROW, not a broken session: a custom Strapi route needs `api::seller-auth.seller-auth.listings` in AUTHENTICATED_ACTIONS (apps/cms/src/index.ts). The seller sees an empty dashboard and files the car again"
        : "the dashboard reads this. Without it a seller cannot see, price or sell anything they have listed",
      mine.text.slice(0, 200),
    );

    const rowsForSeller = mine.json?.data ?? [];
    check(
      rowsForSeller.length === 1,
      `the seller's dashboard lists ${rowsForSeller.length} cars after filing one`,
      "zero means the submission did not attach the seller (the dashboard would be permanently empty); more than one means the endpoint is not scoped to the caller, which is another seller's inventory leaking",
    );
    documentId = rowsForSeller[0]?.documentId;
    check(documentId, "the dashboard row carries no documentId", "every later action addresses the car by it");
    say(`listing ${documentId} — slug ${rowsForSeller[0]?.slug}`);

    /* -- 3. What actually landed ------------------------------------------ */
    step("3. Assert what reached the database");

    const rows = listingRows(documentId);
    check(
      rows.length === 1 && !rows[0].published,
      `expected exactly one draft row, found ${rows.length}`,
      "a submission that arrives published skipped review entirely",
      JSON.stringify(rows.map((r) => ({ id: r.id, published: r.published }))),
    );
    const draft = rows[0];

    // Relations, each with its own reason, because "a relation is missing" and
    // "the car is invisible to the Automatic filter" are different sentences.
    const missing = [];
    for (const [field, [expected, why]] of Object.entries(EXPECT_RELATIONS)) {
      if (draft[field] !== expected) {
        missing.push(
          `  ${field}: expected ${expected}, got ${JSON.stringify(draft[field])}\n      → ${why}`,
        );
      }
    }
    check(
      missing.length === 0,
      `${missing.length} of ${Object.keys(EXPECT_RELATIONS).length} taxonomy relations did not attach:\n${missing.join("\n")}`,
      "the seller typed Arabic. pickTaxonomy matches slug, then name, then nameAr, after folding tatweel, alef forms and Arabic-Indic digits — a miss here means an Arabic seller's car loses the field silently, which is how it failed before",
    );
    check(
      draft.seller_email === EMAIL,
      "the listing is not attached to the seller who filed it",
      "ownership is stamped in the CMS from the token. Unattached, the car never appears on its own seller's dashboard and no seller endpoint can reach it",
      `seller: ${JSON.stringify(draft.seller_email)}`,
    );
    say(`all ${Object.keys(EXPECT_RELATIONS).length} relations attached, owned by the filing seller`);

    // Scalars. Arabic-Indic digits in, integers out.
    const scalars = [
      ["price", EXPECT_PRICE, "٣٥٠٠ folded to 3500. Unfolded it is NaN, and the seller is told the price is missing"],
      ["year", EXPECT_YEAR, "the year is a URL segment and a browse filter"],
      ["mileage", EXPECT_MILEAGE, "kilometres are the first thing an Omani buyer asks"],
      ["whatsapp", "91234567", "the ONLY way a buyer reaches the seller. /\\D/ deletes Arabic-Indic digits outright, leaving an empty number and a rejected submission"],
      ["doors", 4, "collected, has a column, and was dropped for months"],
      ["cylinders", 4, "as above"],
      ["seats", 5, "as above"],
      ["engine_size", 1.6, "a decimal from Arabic-Indic input — the one number that is not an integer"],
      ["drive_type", "fwd", "the form stores 'Front-wheel drive (FWD)' and the column is an enum of fwd/rwd/awd/four_wd. Unmapped, the CMS rejects the whole submission"],
      ["import_origin", "gcc", "GCC vs US-import is a price-defining fact in Oman"],
      ["currency", "OMR", "a price with no currency is not a price"],
      ["listing_status", "available", "a new listing is for sale"],
      ["video_url", PAYLOAD.videoUrl, "collected by the form and once dropped by the route"],
      ["vin", EXPECT_VIN, "I/O/Q never appear in a VIN and are folded to 1/0/0. A VIN that does not normalise is stored wrong or lost into the description"],
    ];
    const wrong = scalars
      .filter(([field, expected]) => draft[field] !== expected)
      .map(([field, expected, why]) =>
        `  ${field}: expected ${JSON.stringify(expected)}, stored ${JSON.stringify(draft[field])}\n      → ${why}`,
      );
    check(
      wrong.length === 0,
      `${wrong.length} field(s) did not survive the submission:\n${wrong.join("\n")}`,
      "a dropped field raises no error anywhere — the form asks, the column exists, and the answer stops at the route. Only an assertion finds it",
    );
    say(`all ${scalars.length} scalar fields stored, Arabic-Indic digits folded, VIN normalised`);

    /**
     * `phone` is asserted on its VALUE, not its bytes, and that is a finding.
     *
     * api/listings folds Arabic-Indic digits for price, year, mileage and
     * whatsapp, and does not for `phone` — it is stored exactly as typed, so an
     * Arabic seller's landline lands in the column as `٩١٢٣٤٥٦٧`. Measured on
     * 2026-08-04, on this run.
     *
     * Harmless today only because nothing renders it: lib/strapi.js maps it onto
     * the car object and no component reads it. The moment one does, that string
     * is unreadable to an English-reading buyer and, in a `tel:` href, is not a
     * dialable number at all. `foldDigits` in api/listings/route.js is the fix,
     * one line beside the `whatsapp` call that already does it.
     *
     * So this checks the number is the right number, which holds before and
     * after that fix, and still fails loudly if the field goes missing again —
     * which it did, along with ten others, for months.
     */
    const foldDigits = (v) =>
      String(v ?? "")
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
    check(
      foldDigits(draft.phone) === "91234567",
      `phone stored as ${JSON.stringify(draft.phone)}`,
      "one of the eleven fields the form collected and the route used to drop entirely. Note it is stored UNFOLDED — see the comment above this check",
    );

    /*
     * The slug contract, asserted on a real row rather than on a function.
     *
     * check-listing-slug.mjs asserts that slugifyTitle and resolveListing agree.
     * This asserts the thing that actually decides a seller's URL: what
     * api/listings chose to store. An Arabic title reduces to its year under
     * slugify — "تويوتا كورولا 2015" becomes "2015" — and resolveListing reads a
     * leading number as a listing id, so the car 404s on its own page. The fix
     * was to compose the slug from the LATIN taxonomy slugs instead, and this is
     * the assertion that the fix is still in force.
     */
    check(
      /^[a-z0-9-]+$/.test(draft.slug ?? ""),
      `the slug is not Latin: ${JSON.stringify(draft.slug)}`,
      "the URL is built from it. A non-Latin or empty slug gives the car a link nobody can share and a page that does not resolve",
    );
    check(
      !/^\d/.test(draft.slug ?? ""),
      `the slug starts with a digit: ${JSON.stringify(draft.slug)}`,
      "resolveListing reads /^(\\d+)(?:-|$)/ as a numeric listing id, so this slug is looked up as an id, misses, and the car 404s on the page every link points at. This is the exact shape of 985cc28 and of the Arabic case that followed it",
    );
    check(
      draft.slug.startsWith("toyota-corolla-2015-"),
      `the slug is ${JSON.stringify(draft.slug)}, not composed from the taxonomy`,
      "an Arabic submission must borrow the Latin slugs of the make and model it resolved to, so a car filed in Arabic and one filed in English share a URL — which is what hreflang wants and what a shared WhatsApp link needs",
    );
    check(
      draft.description.includes(PAYLOAD.city) && /Condition: Good/.test(draft.description),
      "the description lost the answers that have no column",
      "mulkiya expiry, lien, area and the seller's own condition rating have no column on the Listing type. Dropping them silently loses the two facts an Omani buyer asks first",
      draft.description.slice(0, 160),
    );
    say(`slug ${draft.slug} — Latin, taxonomy-composed, safe for resolveListing`);

    /* -- 4. A draft is not on the site ------------------------------------ */
    step("4. Assert the draft is not publicly reachable");

    const publicPath = `${draft.slug}-${draft.city_slug}`;
    const bySlug = await cms(
      `/api/listings?filters%5Bslug%5D%5B%24eq%5D=${encodeURIComponent(draft.slug)}`,
    );
    check(
      (bySlug.json?.data ?? []).length === 0,
      "the CMS's public listings API is already serving this car",
      "the content API returns published documents only. A draft appearing there means the submission published itself, and an unreviewed car is live",
    );
    for (const locale of ["ar", "en"]) {
      const page = await web(`/${locale}/car/${publicPath}`);
      check(
        page.status === 404,
        `GET /${locale}/car/${publicPath} answered ${page.status} for an unpublished car`,
        "a draft reachable on the site is a car nobody has checked, indexable, with a WhatsApp number on it",
      );
    }
    say(`/ar and /en both 404 at /car/${publicPath} — correct for a draft`);

    /* -- 5. Publish, and the car must resolve in both locales -------------- */
    step("5. Publish as a moderator would, then resolve in both locales");

    publishAsModerator(documentId);
    const afterPublish = listingRows(documentId);
    check(
      afterPublish.length === 2 && publishedOf(afterPublish),
      `publishing produced ${afterPublish.length} rows`,
      "Strapi 5 keeps draft and published as separate rows. If this scaffolding is wrong the rest of the run measures the wrong thing",
    );
    const live = publishedOf(afterPublish);
    check(
      live.make_slug === "toyota" && live.city_slug === "muscat",
      "the published version did not inherit the draft's relations",
      "a published listing with no relations composes no URL and joins no facet — the same failure as an unrelated draft, but visible to buyers",
    );

    const nowPublic = await cms(
      `/api/listings?filters%5Bslug%5D%5B%24eq%5D=${encodeURIComponent(draft.slug)}`,
    );
    check(
      (nowPublic.json?.data ?? []).length === 1,
      "the CMS still does not serve the car after publishing",
      "everything the site renders comes from this endpoint. If Strapi cannot see the published row, neither can any page",
      nowPublic.text.slice(0, 200),
    );

    /**
     * Wait for the site, and say why the wait exists.
     *
     * `/car/[slug]` is ISR and lib/strapi.js fetches with `revalidate: 30`, and
     * step 4 just requested this exact URL and got an honest 404 — so a 404 is
     * now in the cache with a 30s life and a stale-while-revalidate tail. The
     * first request after it expires still serves the stale answer and kicks off
     * the refresh; the next one is the car.
     *
     * That is correct behaviour, not a defect, and it is also exactly the
     * confusion the QA brief warns about: "a change will not appear on the first
     * request after it". So poll rather than sleep a magic number, and if it
     * never resolves, say which of the two possible things went wrong.
     */
    /*
     * Two 30s windows compound, so budget for more than one.
     *
     * Step 4 left a 404 in the route's ISR cache AND a miss in the fetch data
     * cache lib/strapi.js populates, and both are 30s stale-while-revalidate.
     * The route revalidates first against data that is itself still stale, so the
     * car appears on the pass after that: measured at ~63s, not ~30s. 120s per
     * locale is headroom, and the second locale is fast because the two share
     * lib/strapi's fetch cache (the CMS query carries no locale — toCar applies
     * it afterwards).
     */
    const budgetMs = 120_000;
    for (const locale of ["ar", "en"]) {
      const started = Date.now();
      /*
       * Strip <script> before reading anything.
       *
       * next-intl serialises the whole message catalogue into every document, so
       * grepping raw HTML for an Arabic string finds it whether or not anything
       * rendered it. The QA brief records two false findings from exactly this.
       */
      const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "");
      const canonicalOf = (html) =>
        (strip(html).match(/rel="canonical"[^>]*href="([^"]+)"/) ?? [])[1] ?? null;

      /*
       * Wait for the metadata, not just for a 200.
       *
       * Observed on this stack: the first 200 after a publish can carry the car's
       * body with the ROOT layout's title and no canonical link — the route's
       * generateMetadata ran against the cached miss while the page body rendered
       * against fresh data. It settles on the next request. Treating that as
       * "resolved" made this step fail on a page that was merely half-warm, which
       * is a flaky test, and a flaky pre-deploy gate is one that gets skipped.
       *
       * So the page counts as live when it agrees with itself about where it
       * lives — which is also the property worth asserting: the canonical URL is
       * what gets indexed and shared, and it has to be the one that resolves.
       */
      let page = null;
      let polls = 0;
      while (Date.now() - started < budgetMs) {
        polls += 1;
        page = await web(`/${locale}/car/${publicPath}`);
        if (
          page.status === 200 &&
          canonicalOf(page.text)?.endsWith(`/${locale}/car/${publicPath}`)
        ) {
          break;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      const waited = Math.round((Date.now() - started) / 1000);
      check(
        page?.status === 200,
        `GET /${locale}/car/${publicPath} never resolved — still ${page?.status} after ${waited}s`,
        "the CMS is serving this listing, so either the URL the site composes is not {slug}-{city} any more (check lib/seo.js listingSlug against lib/resolveListing.js), or the ISR cache is not revalidating at all. A published car that 404s on its own URL is the single most expensive bug this site has had",
      );
      check(
        canonicalOf(page.text)?.endsWith(`/${locale}/car/${publicPath}`),
        `/${locale} answers 200 but declares its canonical URL as ${JSON.stringify(canonicalOf(page.text))} — after ${waited}s`,
        "if the page believes it lives somewhere else, that is the URL Google indexes and the one buyers share. The two disagreeing is how a listing gets indexed at a 404",
      );

      const visible = strip(page.text);
      const h1 = (visible.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1]
        ?.replace(/<[^>]+>/g, "")
        .trim();
      /*
       * Compare the heading with the tatweel folded out, because the two locales
       * legitimately build it from different places.
       *
       * `/ar` composes the heading from the resolved taxonomy, so it reads
       * "تويوتا كورولا 2015" — clean, whatever the seller typed. `/en` renders the
       * stored `title`, which api/listings joined from the seller's own words, so
       * it keeps the decorative tatweel and the Arabic-Indic year: "تـويوتا كورولا
       * ٢٠١٥". Both are the right car; only one is the seller's keystrokes.
       *
       * (That the English page shows an Arabic title with Arabic-Indic digits is
       * a real cosmetic gap, and it is a separate argument from this assertion —
       * which is only that the make reached the heading at all.)
       */
      const readable = (s) => String(s ?? "").replace(/ـ/g, "");
      check(
        h1 && readable(h1).includes("تويوتا"),
        `/${locale} rendered the page but its <h1> is ${JSON.stringify(h1 ?? null)}`,
        "the seller filed in Arabic. A heading missing the make means the taxonomy did not reach the view, or the title fell back to something generic",
      );
      check(
        visible.includes(EXPECT_PRICE.toLocaleString("en-US")),
        `/${locale} does not show the price ${EXPECT_PRICE.toLocaleString("en-US")}`,
        "the price is the reason the buyer is on the page, and it came in as ٣٥٠٠ — this is the last point at which a folding failure would still be silent",
      );
      say(
        `/${locale}/car/${publicPath} → 200 after ${waited}s (${polls} request${polls === 1 ? "" : "s"}); heading, price and canonical all agree`,
      );
    }

    /* -- 6. Seller actions on a live car ---------------------------------- */
    step("6. Reprice, confirm, mark sold and take down");

    /*
     * The band first. It is the entire identity of the business — this site
     * lists OMR 1,000-6,000 and nothing else — so a reprice that can escape it
     * is a bigger problem than a reprice that fails.
     */
    const overBand = await web(`/api/listings/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: 12000 }),
    });
    check(
      overBand.status === 400 && overBand.json?.code === "price_above_band",
      `repricing to OMR 12,000 answered ${overBand.status} (${overBand.json?.code})`,
      "the band is the product. A car above it must be refused with a message naming the limit, or the seller retypes it and waits for a review that will never approve it",
      overBand.text.slice(0, 200),
    );

    const repriced = await web(`/api/listings/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: REPRICED_TO }),
    });
    check(
      repriced.status === 200,
      `PUT /api/listings/${documentId} answered ${repriced.status}`,
      "a seller who cannot change their price drops it on WhatsApp instead, and the site shows a number nobody is selling at",
      repriced.text.slice(0, 200),
    );

    const afterReprice = listingRows(documentId);
    check(
      draftOf(afterReprice)?.price === REPRICED_TO,
      `the draft still says ${draftOf(afterReprice)?.price} after repricing to ${REPRICED_TO}`,
      "200 without a write is the worst answer: the seller believes the new price is in the queue",
    );
    check(
      publishedOf(afterReprice)?.price === EXPECT_PRICE,
      `repricing changed the LIVE price to ${publishedOf(afterReprice)?.price}`,
      "the CMS controller forces every seller edit onto the draft precisely so a car approved at one price cannot silently become another. If the published row moved, moderation is decorative and any approved listing can be rewritten the moment it goes up",
    );
    say(`reprice landed on the draft (${EXPECT_PRICE} → ${REPRICED_TO}); the live price is untouched`);

    const confirmed = await web(`/api/listings/${documentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmAvailable: true }),
    });
    check(
      confirmed.status === 200,
      `PUT /api/listings/${documentId}/status {confirmAvailable} answered ${confirmed.status}`,
      confirmed.status === 502
        ? "502 here is the signature of a missing `api::seller-auth.seller-auth.setStatus` grant in apps/cms/src/index.ts — the route mounts, the CMS answers 403 to a valid token, and the seller reads 'The listing could not be updated' on a button that has never worked"
        : "the freshness prompt is how this site avoids becoming a board of cars that sold weeks ago",
      confirmed.text.slice(0, 200),
    );
    const afterConfirm = listingRows(documentId);
    check(
      draftOf(afterConfirm)?.confirmed && publishedOf(afterConfirm)?.confirmed,
      "confirming availability stamped only one version",
      "the moderator's view and the buyer's view must agree about when the seller last vouched for the car; stamping the draft alone leaves the live listing looking stale forever",
      `draft=${draftOf(afterConfirm)?.confirmed} published=${publishedOf(afterConfirm)?.confirmed}`,
    );
    say("confirm-available stamped both versions");

    const sold = await web(`/api/listings/${documentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingStatus: "sold" }),
    });
    check(
      sold.status === 200,
      `PUT /api/listings/${documentId}/status {listingStatus:"sold"} answered ${sold.status}`,
      "a seller who cannot say 'this is sold' is the classifieds failure everyone recognises, and it lands hardest on a site whose whole proposition is that its listings are real",
      sold.text.slice(0, 200),
    );
    const afterSold = listingRows(documentId);
    check(
      draftOf(afterSold)?.listing_status === "sold" &&
        publishedOf(afterSold)?.listing_status === "sold",
      "marking the car sold did not reach both versions",
      "this is the one seller write that must touch the PUBLISHED row: writing only the draft leaves the live page telling buyers a sold car is available, which is the exact bug the endpoint was built to avoid",
      `draft=${draftOf(afterSold)?.listing_status} published=${publishedOf(afterSold)?.listing_status}`,
    );
    say("mark sold reached both the draft and the live version");

    const takenDown = await web(`/api/listings/${documentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ takeDown: true }),
    });
    check(
      takenDown.status === 200,
      `PUT /api/listings/${documentId}/status {takeDown} answered ${takenDown.status}`,
      "taking a car down is the seller's only way to withdraw it. Without it the only remaining option is to ask us by WhatsApp",
      takenDown.text.slice(0, 200),
    );
    const afterTakedown = listingRows(documentId);
    check(
      !publishedOf(afterTakedown),
      "the car is still published after being taken down",
      "the seller pressed the button, was told it worked, and buyers can still see and message about a car they have withdrawn",
    );
    check(
      draftOf(afterTakedown),
      "taking the car down deleted it outright",
      "take-down unpublishes, it does not delete: the seller can ask for it back, a moderator can still see what was up there, and the evidence survives a dispute",
    );
    const goneFromCms = await cms(
      `/api/listings?filters%5Bslug%5D%5B%24eq%5D=${encodeURIComponent(draft.slug)}`,
    );
    check(
      (goneFromCms.json?.data ?? []).length === 0,
      "the CMS's public API still serves the car after take-down",
      "everything the site renders reads this endpoint, so a car still listed here is still on the site as soon as any cache turns over",
    );

    const finalDashboard = await cms("/api/seller/listings", { headers: auth });
    check(
      finalDashboard.json?.data?.[0]?.state === "pending",
      `the dashboard shows the withdrawn car as ${JSON.stringify(finalDashboard.json?.data?.[0]?.state)}`,
      "after a take-down the seller's own view must say the car is no longer live. 'live' here would tell them buyers can still see it",
    );
    say("take-down unpublished the car, kept the draft, and the dashboard agrees");

    console.log(
      `\nOK — a seller registered, filed a car in Arabic, had it published, ` +
        `repriced it, confirmed it, sold it and took it down.`,
    );
  } finally {
    step("Cleanup");
    cleanup(documentId);
  }
}

main().catch((err) => {
  if (err instanceof JourneyFailure) {
    console.error(`\n✗ FAILED at "${err.step ?? currentStep}"\n\n    ${err.message}\n`);
  } else {
    console.error(`\n✗ FAILED at "${currentStep}" — unexpected error\n`);
    console.error(err);
  }
  process.exit(1);
});
