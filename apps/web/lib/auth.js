import { cookies } from "next/headers";

/**
 * The seller session, and the only place the web app knows how one is made.
 *
 * ## Why the browser never sees the CMS
 *
 * Every function here runs on the server. That is not a preference: the CSP in
 * next.config.mjs sets `connect-src 'self'`, so a browser fetch to
 * app.autosouq.om is blocked before it leaves the page — deliberately, since
 * the CMS is a different origin and the site's whole proposition is that a
 * listing page cannot be talking to somewhere it shouldn't. So the pages call
 * our own route handlers under /api/auth/*, those call this module, and this
 * module is the only thing that holds a Strapi token.
 *
 * The token lives in an httpOnly cookie for the same reason. A JWT in
 * localStorage is readable by any script that gets onto the page; one in an
 * httpOnly cookie is not, which turns a cross-site scripting bug from "every
 * seller's account is compromised" into "someone defaced a page".
 *
 * There is no `import "server-only"` guard because the package is not a
 * dependency and this is not worth adding one for: `cookies()` from
 * next/headers already throws if this module is pulled into a client bundle,
 * so the mistake fails at build rather than shipping a token to the browser.
 *
 * ## Where phone OTP swaps in
 *
 * `registerSeller` and `loginSeller` are the entire surface. Both return the
 * same `{ ok, error, jwt }` shape, and nothing above them — not the route
 * handlers, not the pages, not the forms — knows that email and password are
 * involved. When OTP replaces them, this file and the CMS controller behind it
 * change; the rest of apps/web does not.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8000;

/**
 * Session cookie.
 *
 * `lax` rather than `strict`: a seller following a link to their listing from
 * WhatsApp — which is how most of this market navigates — arrives cross-site,
 * and `strict` would drop the cookie on that first request and log them out
 * for no reason. `lax` still withholds it from cross-site POSTs, which is the
 * case that matters.
 */
const COOKIE = "autosouq_session";

/**
 * Why this cookie holds a *refresh* token and not the JWT.
 *
 * config/plugins.ts in the CMS sets `jwtManagement: 'refresh'`, deliberately —
 * it makes sessions revocable, which is the lever moderation needs. The
 * consequence is that the token `/api/auth/local` returns in its body is a
 * ten-minute **access** token, not a session. Measured, not assumed: a freshly
 * issued one decodes to `{"type":"access", exp - iat: 600}`.
 *
 * Storing that in a seven-day cookie produces the worst kind of bug — it works
 * perfectly for ten minutes, then silently signs the seller out, most likely
 * halfway through filling in a listing. The durable half is a pair of httpOnly
 * cookies the CMS sets alongside it, `strapi_up_refresh` and its `.sig`. Those
 * are what we keep, and `getToken` trades them for a fresh access token per
 * request via `/api/auth/refresh`.
 *
 * The round trip is real but small, and it buys the property that matters: an
 * account blocked or a session revoked in the admin stops working on the next
 * request rather than up to seven days later.
 */
const REFRESH_COOKIE_NAMES = ["strapi_up_refresh", "strapi_up_refresh.sig"];

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  // Seven days. Long enough that a seller listing a car over a weekend is not
  // logged out mid-form; short enough that a shared or stolen device stops
  // being useful reasonably soon.
  maxAge: 60 * 60 * 24 * 7,
};

/**
 * Pull the refresh pair out of a CMS response and flatten it to a Cookie header.
 *
 * `getSetCookie()` rather than `get("set-cookie")`: there are two cookies here,
 * and the single-value getter joins them with a comma into one unusable string.
 */
function extractRefreshCookie(res) {
  const all = res.headers.getSetCookie?.() ?? [];
  const pairs = all
    .map((line) => line.split(";")[0])
    .filter((pair) => REFRESH_COOKIE_NAMES.some((n) => pair.startsWith(`${n}=`)));
  return pairs.length ? pairs.join("; ") : null;
}

async function cmsPost(path, body, { cookie } = {}) {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      // Strapi nests the readable part; everything else is shape we do not want
      // to leak to a form. Falls back to a sentence rather than a status code.
      const message =
        payload?.error?.message ?? "Something went wrong. Please try again.";
      return { ok: false, error: message };
    }

    return { ok: true, data: payload, refreshCookie: extractRefreshCookie(res) };
  } catch {
    // A timeout or a dead CMS must not read as "your password was wrong".
    // app.autosouq.om going down is our problem, and the message should say so.
    return {
      ok: false,
      error: "We could not reach the server. Please try again in a moment.",
    };
  }
}

/**
 * Create an account.
 *
 * `fullName` is required by the CMS User type; `whatsapp` is optional at signup
 * because a seller supplies a number on the listing itself.
 */
export async function registerSeller({ email, password, fullName, whatsapp }) {
  const created = await cmsPost("/api/seller/register", {
    email,
    password,
    fullName,
    ...(whatsapp ? { whatsapp } : {}),
  });

  if (!created.ok) return created;

  /**
   * Create the account, then log in through the ordinary route.
   *
   * `/api/seller/register` mints a token but does not set the refresh pair —
   * issuing session cookies is the login controller's job, and duplicating it
   * in ours would mean maintaining two copies of Strapi's cookie handling and
   * getting the signing right by hand.
   *
   * So account creation and session creation stay separate concerns, and there
   * is exactly one place a session is minted. The cost is a second round trip
   * on the one request in a seller's life where nobody minds.
   */
  const session = await loginSeller({ email, password });

  if (!session.ok) {
    // The account exists but we could not sign them in — a bad state to leave
    // silently, since the seller would be told registration failed and then
    // find the email taken when they retried.
    return {
      ok: false,
      error: "Your account was created. Please sign in to continue.",
    };
  }

  return {
    ok: true,
    refreshCookie: session.refreshCookie,
    user: created.data?.user ?? session.user,
  };
}

/**
 * Sign in.
 *
 * The stock `/api/auth/local` endpoint, which needed no customising — it reads
 * `identifier` and `password` and nothing else. Registration was the only half
 * that had to become ours.
 */
export async function loginSeller({ email, password }) {
  const result = await cmsPost("/api/auth/local", {
    identifier: email,
    password,
  });

  if (!result.ok) {
    // Strapi says "Invalid identifier or password", which is the right amount
    // of information but not the right voice for a form.
    return { ok: false, error: "Email or password is incorrect." };
  }

  /**
   * Narrowed deliberately.
   *
   * `/api/auth/local` answers with the whole user row — `documentId`,
   * `provider`, `confirmed`, `blocked`, `publishedAt` and the rest. None of it
   * is secret, but none of it is the client's business either, and handing a
   * browser fields like `blocked` invites something to start branching on them.
   * `getSession` returns this same four-field shape, so callers see one user
   * object regardless of which door they came through.
   */
  const u = result.data?.user ?? {};
  return {
    ok: true,
    refreshCookie: result.refreshCookie,
    user: {
      id: u.id,
      email: u.email,
      fullName: u.fullName ?? null,
      whatsapp: u.whatsapp ?? null,
    },
  };
}

/** Attach the session cookie to a response. */
export async function startSession(refreshCookie) {
  if (!refreshCookie) return false;
  const jar = await cookies();
  jar.set(COOKIE, refreshCookie, COOKIE_OPTIONS);
  return true;
}

/** Drop it. */
export async function endSession() {
  const jar = await cookies();
  jar.set(COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * A usable access token for this seller, or null.
 *
 * The cookie holds the refresh pair, not a bearer token, so this trades it for
 * a fresh ten-minute access token every time. That is one extra CMS round trip
 * per authenticated request, and it is the price of sessions that can actually
 * be revoked — a blocked account stops working immediately rather than
 * whenever a long-lived JWT happened to expire.
 */
export async function getToken() {
  const jar = await cookies();
  const refreshCookie = jar.get(COOKIE)?.value;
  if (!refreshCookie) return null;

  const result = await cmsPost("/api/auth/refresh", {}, { cookie: refreshCookie });
  if (!result.ok) return null;

  return result.data?.jwt ?? null;
}

/**
 * The signed-in seller's own listings, drafts included.
 *
 * Goes to `/api/seller/listings`, which scopes by the token rather than by
 * anything we send. The ordinary content API cannot answer this — `find`
 * returns published documents only, and `seller` is `private` so it is not even
 * filterable — and adding a filter would be the wrong fix, since a
 * client-supplied owner is a request to be lied to.
 *
 * Returns `[]` rather than throwing. A dashboard that renders empty during a
 * CMS outage is a bad afternoon; one that 500s is a support call.
 */
export async function getMyListings() {
  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${STRAPI_URL}/api/seller/listings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return [];

    const body = await res.json().catch(() => null);
    const rows = Array.isArray(body?.data) ? body.data : [];

    /**
     * Translate the CMS's vocabulary into the table's.
     *
     * ListingsTable predates the API and speaks its own dialect: `status` as
     * "Live" / "Sold" / "Pending", and `km` rather than `mileage`. Adapting
     * here rather than rewriting the component keeps one shape for a table that
     * is also rendered on /dashboard, and keeps the CMS free to name its own
     * fields — `state` is derived from `publishedAt`, which is Strapi's word,
     * not a seller's.
     *
     * A published listing marked sold reads "Sold" rather than "Live": the
     * seller's question is whether the car is still available, not whether the
     * document is published.
     */
    return rows.map((row) => ({
      ...row,
      km: typeof row.mileage === "number" ? row.mileage : undefined,
      status:
        row.state === "live"
          ? row.listingStatus === "sold"
            ? "Sold"
            : "Live"
          : "Pending",
    }));
  } catch {
    return [];
  }
}

/**
 * Who is signed in, or null.
 *
 * Validated against the CMS on every call rather than decoded locally. A JWT
 * carries its own claims, so trusting it without asking would keep a seller
 * signed in after their account was blocked or deleted in the admin — which is
 * exactly the lever moderation depends on.
 */
export async function getSession() {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const user = await res.json();
    if (!user?.id || user.blocked) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName ?? null,
      whatsapp: user.whatsapp ?? null,
    };
  } catch {
    // A CMS outage is not a logout. Returning null signs the seller out of the
    // UI for the duration, but the cookie survives, so they are back as soon as
    // the CMS is. Deleting it here would make every blip a forced re-login.
    return null;
  }
}
