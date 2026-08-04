import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8000;

/**
 * Update the signed-in seller's name and WhatsApp number.
 *
 * /my-profile showed a full form that saved nothing, under a notice claiming
 * accounts were not switched on — they had been for weeks. Same shape as the
 * password screen before it: a complete-looking control that quietly discards
 * what you give it, which on a trust-led site is worse than no control.
 *
 * Proxied like every other CMS call: `connect-src 'self'` forbids the direct
 * request and the token is in an httpOnly cookie this page cannot read. The
 * CMS writes exactly two fields and takes the user id from the token, never
 * from the body — the users-permissions update route is deliberately not
 * exposed, because it accepts the whole user object including `role`.
 */
export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_request", error: "Invalid request." },
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
    res = await fetch(`${STRAPI_URL}/api/seller/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: body?.fullName,
        whatsapp: body?.whatsapp,
      }),
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
     * 400 is the CMS's validation — an empty name, or a number that is not an
     * Omani mobile. Both are things the seller can fix, so they get their own
     * code rather than collapsing into a generic failure.
     */
    const code = res.status === 400 ? "invalid_profile" : "failed";
    return NextResponse.json(
      {
        ok: false,
        code,
        error:
          code === "invalid_profile"
            ? "Check your name and WhatsApp number."
            : "Your profile could not be saved.",
      },
      { status: res.status === 400 ? 400 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
