#!/usr/bin/env node
/**
 * The metrics endpoint must refuse everyone who is not an admin.
 *
 * `GET /autosouq/metrics` returns the whole operational picture of the
 * business: how many cars are queued, how much live inventory there is, how
 * many sellers exist. None of that is public.
 *
 * The thing that keeps it private is ONE property — `type: 'admin'` on the
 * router in apps/cms/src/metrics/route.ts. It is not the policy list, whatever
 * the names suggest: `admin::isAuthenticatedAdmin` is, in its entirety,
 *
 *     (policyCtx) => Boolean(policyCtx.state.isAuthenticated)
 *
 * and @strapi/core sets `isAuthenticated` for ANY strategy that accepts the
 * request, including users-permissions accepting an ordinary seller. Move that
 * route file under src/api/ and the loader hard-assigns
 * `router.type = 'content-api'`; every registered seller can then read the
 * dashboard, and nothing anywhere errors.
 *
 * That is a one-line mistake with no symptom, which is exactly the kind this
 * repo has shipped before. So it gets an assertion rather than a comment.
 *
 * Requires a running CMS. Skips (exit 0) when there is none, so it does not
 * fail a checkout that simply has nothing up.
 *
 * Run: node scripts/check-metrics-endpoint.mjs   (also `pnpm check:metrics`)
 */
const CMS = process.env.CMS_URL ?? "http://localhost:1337";
const PATH = "/autosouq/metrics";

const alive = async () => {
  try {
    await fetch(`${CMS}/api/cities?pagination[limit]=1`, {
      signal: AbortSignal.timeout(3000),
    });
    return true;
  } catch {
    return false;
  }
};

if (!(await alive())) {
  console.log(`— no CMS at ${CMS}; skipping the metrics-endpoint check`);
  process.exit(0);
}

const failures = [];
const status = async (headers = {}) => {
  const res = await fetch(`${CMS}${PATH}`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  return res.status;
};

/* 1. Anonymous. */
const anon = await status();
if (anon === 200) {
  failures.push(
    `✗ anonymous GET ${PATH} returned 200 — the endpoint is public. Check that ` +
      `the route still declares type: 'admin' and is still registered from ` +
      `src/metrics/route.ts rather than from src/api/.`,
  );
}

/* 2. A real seller token. The one that actually matters: a seller is
 *    authenticated, so any guard that only checks "is authenticated" lets them
 *    through. */
const email = `qa-metrics-${Date.now()}@example.com`;
let jwt = null;
try {
  const res = await fetch(`${CMS}/api/seller/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "Check-Passw0rd!",
      fullName: "Metrics Check",
      whatsapp: "+96891234567",
    }),
    signal: AbortSignal.timeout(10000),
  });
  jwt = (await res.json())?.jwt ?? null;
} catch {
  /* handled below */
}

if (!jwt) {
  failures.push(
    "✗ could not register a seller, so the seller-token refusal was NOT " +
      "tested. Fix the check rather than deleting it — this is the case that " +
      "matters most.",
  );
} else {
  /* The positive control. Without it a 401 below could just mean the token is
     broken, and the check would pass while proving nothing. */
  const control = await fetch(`${CMS}/api/seller/listings`, {
    headers: { Authorization: `Bearer ${jwt}` },
    signal: AbortSignal.timeout(8000),
  });
  if (control.status !== 200) {
    failures.push(
      `✗ the positive control failed (GET /api/seller/listings returned ` +
        `${control.status}), so a refusal below would prove nothing about the ` +
        `metrics endpoint.`,
    );
  }

  const seller = await status({ Authorization: `Bearer ${jwt}` });
  if (seller === 200) {
    failures.push(
      `✗ a SELLER's token reads ${PATH}. Every account holder can see the ` +
        `owner's dashboard. The route has almost certainly become content-api.`,
    );
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `✓ ${PATH} refuses anonymous (${anon}) and seller callers` +
    (jwt ? ", with a passing positive control" : ""),
);
