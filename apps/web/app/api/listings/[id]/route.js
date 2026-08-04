import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { BAND } from "@/lib/priceBand";
import { foldDigits } from "@/lib/format";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8000;
const MAX_DESCRIPTION = 4000;

/**
 * Edit a listing the seller owns.
 *
 * Everything here lands on the DRAFT version, and that is the whole design.
 * The CMS controller calls forceVersion(ctx, 'draft') so a seller cannot
 * rewrite live content past review — a car approved at OMR 2,000 stays approved
 * at OMR 2,000 until a human looks at the new number.
 *
 * The consequence is worth being explicit about, because it is not obvious and
 * the UI has to say it: editing a published listing does NOT change what a
 * buyer currently sees. The live version keeps the approved content and the
 * edit waits in the queue. That is better than the alternatives — unpublishing
 * on every edit would let a seller take their own car off the site by fixing a
 * typo, and publishing immediately would make review decorative.
 *
 * Marking sold and taking a car down are the deliberate exceptions and have
 * their own endpoint, because they only ever reduce what a listing claims. See
 * ./status.
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

  const data = {};

  if (body?.price !== undefined) {
    const price = Number(foldDigits(body.price));
    if (!Number.isFinite(price)) {
      return NextResponse.json(
        { ok: false, code: "price_not_number", error: "That is not a price." },
        { status: 400 },
      );
    }
    /*
     * Checked here as well as in the CMS lifecycle, and not instead of it. The
     * lifecycle is the authority — it is what a direct API call meets — but a
     * seller who has just retyped a price deserves the answer in their own
     * language without a round trip, and lib/priceBand is the same source both
     * sides read.
     */
    if (price > BAND.MAX) {
      return NextResponse.json(
        { ok: false, code: "price_above_band", error: "Above the band." },
        { status: 400 },
      );
    }
    if (price < BAND.ASIS_MIN) {
      return NextResponse.json(
        { ok: false, code: "price_below_band", error: "Below the floor." },
        { status: 400 },
      );
    }
    data.price = price;
  }

  if (body?.description !== undefined) {
    const description = String(body.description ?? "").trim();
    if (description.length > MAX_DESCRIPTION) {
      return NextResponse.json(
        { ok: false, code: "description_too_long", error: "That is too long." },
        { status: 400 },
      );
    }
    data.description = description;
  }

  if (!Object.keys(data).length) {
    return NextResponse.json(
      { ok: false, code: "nothing_to_change", error: "Nothing to change." },
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
      `${STRAPI_URL}/api/listings/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
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
    // 404 covers "no such listing" and "not yours" alike — the CMS answers
    // notFound for the second deliberately, so ids cannot enumerate inventory.
    const code = res.status === 404 ? "not_found" : "failed";
    return NextResponse.json(
      {
        ok: false,
        code,
        error:
          code === "not_found"
            ? "That listing is not yours, or no longer exists."
            : "The change could not be saved.",
      },
      { status: res.status === 404 ? 404 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
