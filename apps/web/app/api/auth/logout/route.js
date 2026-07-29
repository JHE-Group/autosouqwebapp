import { NextResponse } from "next/server";
import { endSession } from "@/lib/auth";

/**
 * Sign out.
 *
 * POST, never GET. A logout on GET can be fired by any `<img src>` on any page
 * on the internet, which is a nuisance rather than a breach — but it is a
 * nuisance nobody can debug, and the fix is choosing the right verb once.
 */
export async function POST() {
  await endSession();
  return NextResponse.json({ ok: true });
}
