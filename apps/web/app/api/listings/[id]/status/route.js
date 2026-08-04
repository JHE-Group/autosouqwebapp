import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8000;

/** The three a seller may choose. Mirrors SELLER_MAY_SET_STATUS in the CMS. */
const ALLOWED = new Set(["available", "reserved", "sold"]);

/**
 * Mark the seller's own car sold or reserved, or take it down.
 *
 * Until now a published listing was frozen: the dashboard's Edit and Mark sold
 * buttons were disabled with a note saying so, and a seller whose car had sold
 * had no way to say it. That is the failure everyone recognises in classifieds
 * — a board of cars that went weeks ago — and it lands hardest on a site whose
 * whole proposition is that its listings are real.
 *
 * Narrow on purpose. These operations reach the PUBLISHED version, skipping
 * review, and they are the only ones that do. Both only ever reduce what a
 * listing claims: sold and reserved withdraw availability, taking it down
 * withdraws the car. Price, description and photos still edit the draft and
 * still go back through moderation — see the CMS controller for why that split
 * exists.
 *
 * Proxied like every other CMS call: `connect-src 'self'` forbids the direct
 * request and the token is in an httpOnly cookie this page cannot read.
 * Ownership is decided in the CMS from the stored document, never from
 * anything sent here.
 */
export async function PUT(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { ok: false, code: "missing_id", error: "Which listing?" },
      { status: 400 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_request", error: "Invalid request." },
      { status: 400 },
    );
  }

  const { listingStatus, takeDown, confirmAvailable } = body ?? {};

  if (!takeDown && !confirmAvailable && !ALLOWED.has(String(listingStatus))) {
    return NextResponse.json(
      { ok: false, code: "bad_status", error: "Not a status you can set." },
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
    res = await fetch(
      `${STRAPI_URL}/api/seller/listings/${encodeURIComponent(id)}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          confirmAvailable
            ? { confirmAvailable: true }
            : takeDown
              ? { takeDown: true }
              : { listingStatus },
        ),
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
  } catch {
    return NextResponse.json(
      { ok: false, code: "unavailable", error: "We could not reach the server." },
      { status: 503 },
    );
  }

  if (!res.ok) {
    /*
     * 404 covers both "no such listing" and "not yours" — the CMS answers
     * notFound for the second on purpose, so that ids cannot be used to
     * enumerate other sellers' inventory. Passing it through unchanged keeps
     * that property; distinguishing them here would give the oracle back.
     */
    const code = res.status === 404 ? "not_found" : "failed";
    return NextResponse.json(
      {
        ok: false,
        code,
        error:
          code === "not_found"
            ? "That listing is not yours, or no longer exists."
            : "The listing could not be updated.",
      },
      { status: res.status === 404 ? 404 : 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    listingStatus,
    takenDown: !!takeDown,
    confirmed: !!confirmAvailable,
  });
}
