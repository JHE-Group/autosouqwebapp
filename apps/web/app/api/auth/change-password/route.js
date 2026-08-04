import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8000;

/**
 * Change the signed-in seller's password.
 *
 * There was no route here at all. /change-password rendered a form that
 * validated its own rules, disabled its own button, and posted nowhere — under
 * a notice reading "There is no account system yet, so there is no password to
 * change", which stopped being true the day registration shipped. A seller who
 * wanted to change their password could not, and was told the wrong reason.
 *
 * Proxied rather than called from the browser, like every other CMS call here:
 * `connect-src 'self'` forbids the direct request, and the token lives in an
 * httpOnly cookie this code can read and the page cannot. Strapi's
 * users-permissions plugin owns the actual change, including checking the
 * current password — which is the part that must not be reimplemented.
 *
 * Password RESET is a different problem and is not solved here. It needs an
 * email provider, which is a deliberate outstanding decision rather than an
 * oversight, so a seller who has forgotten their password still has no route
 * back in. /sign-in says so rather than offering a link that goes nowhere.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_request", error: "Invalid request." },
      { status: 400 },
    );
  }

  const { currentPassword, password, passwordConfirmation } = body ?? {};

  if (!currentPassword || !password || !passwordConfirmation) {
    return NextResponse.json(
      { ok: false, code: "missing_fields", error: "Fill in all three fields." },
      { status: 400 },
    );
  }

  if (password !== passwordConfirmation) {
    return NextResponse.json(
      { ok: false, code: "mismatch", error: "The two passwords do not match." },
      { status: 400 },
    );
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, code: "signed_out", error: "Please sign in again." },
      { status: 401 },
    );
  }

  let res;
  try {
    res = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json(
      { ok: false, code: "unavailable", error: "We could not reach the server." },
      { status: 503 },
    );
  }

  if (!res.ok) {
    /*
     * The current password being wrong is the one failure a seller can act on,
     * and it is the common one. Everything else collapses to a generic message
     * — Strapi's own wording is English, unlocalised, and occasionally
     * describes its internals.
     */
    const code = res.status === 400 ? "bad_current_password" : "failed";
    return NextResponse.json(
      {
        ok: false,
        code,
        error:
          code === "bad_current_password"
            ? "That is not your current password."
            : "The password could not be changed.",
      },
      { status: res.status === 400 ? 400 : 502 },
    );
  }

  /*
   * Strapi issues a fresh JWT here, and we deliberately drop it. The session
   * cookie is a refresh cookie set at sign-in; the seller stays signed in on
   * this device and nothing about the session needs to change because the
   * password did. Returning the token would put a credential in a response
   * body, which is the thing this whole proxy exists to avoid.
   */
  return NextResponse.json({ ok: true });
}
