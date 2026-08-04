import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8000;

/**
 * Apply to become a showroom from an account that started private.
 *
 * There was no way to do this. The showroom checkbox exists only on /sign-up,
 * so an account's type was fixed at the moment it was created and could never
 * change. That is the wrong shape for how dealers will actually arrive: a
 * showroom owner hears about the site, lists one car to see whether it works,
 * and only then wants the badge and the packages. Before this route, the only
 * answer was "make a second account" — which strands the listings they already
 * filed under the first one, and gives us two records for one business.
 *
 * Proxied like every other CMS call, for the two reasons that always apply:
 * `connect-src 'self'` forbids the browser reaching the CMS, and the token is
 * in an httpOnly cookie this page cannot read.
 *
 * The CMS takes the owner from the token and finds any existing application by
 * owner, so nothing here can be pointed at another seller's record by editing
 * the request. Approving is not reachable from this route at all — the handler
 * only ever writes `pending`.
 */
async function call(method, body) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, code: "signed_out", error: "Please sign in again." },
      { status: 401 },
    );
  }

  let res;
  try {
    res = await fetch(`${STRAPI_URL}/api/seller/showroom`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "unavailable",
        error: "We could not reach the server.",
      },
      { status: 503 },
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    /*
     * 400 from this endpoint means one thing worth separating: they have
     * applied already. The seller can do nothing about that, so it is not a
     * "fix your input" error — the UI shows them the state they are in rather
     * than a validation message under a field.
     */
    return NextResponse.json(
      {
        ok: false,
        code: res.status === 400 ? "already_applied" : "failed",
        error: data?.error?.message ?? "Could not send your application.",
      },
      { status: res.status === 400 ? 400 : 502 },
    );
  }

  return NextResponse.json({ ok: true, data: data?.data ?? null });
}

export async function GET() {
  return call("GET");
}

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

  return call("POST", {
    businessName: body?.businessName,
    crNumber: body?.crNumber,
  });
}
