import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Who is signed in, from the browser's point of view.
 *
 * Server components read `getSession()` directly and never need this. It exists
 * for the client: a form that has to know whether to show "Sign in" or the
 * seller's name, without any of them holding a token.
 *
 * `no-store` because the answer is per-session. A cached `{"user": ...}` on a
 * shared proxy would hand one seller another's name.
 */
export async function GET() {
  const user = await getSession();

  return NextResponse.json(
    { ok: true, user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
