import { NextResponse } from "next/server";
import { loginSeller, startSession } from "@/lib/auth";

/**
 * Sign in.
 *
 * Same shape as register: the token stops here and goes into an httpOnly
 * cookie, and the response carries a verdict rather than a credential.
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

  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, code: "missing_fields", error: "Enter your email and password." },
      { status: 400 },
    );
  }

  const result = await loginSeller({ email, password, request });

  if (!result.ok || !result.refreshCookie) {
    /**
     * 401 with one message for every failure.
     *
     * Wrong password and no-such-account answer identically, and deliberately:
     * distinguishing them tells a stranger which email addresses hold accounts
     * here. The CMS register endpoint is vague for the same reason, so the two
     * cannot be played off against each other.
     */
    return NextResponse.json(
      {
        ok: false,
        code: result.code ?? "bad_credentials",
        error: result.error ?? "Email or password is incorrect.",
      },
      { status: 401 },
    );
  }

  await startSession(result.refreshCookie);

  return NextResponse.json({ ok: true, user: result.user ?? null });
}
