import { NextResponse } from "next/server";
import { registerSeller, startSession } from "@/lib/auth";

/**
 * Create an account, then sign the seller in.
 *
 * The browser posts here, not to the CMS — `connect-src 'self'` in the CSP
 * blocks the direct call, and the token should never reach client JavaScript
 * anyway. This handler is the only thing that sees it: it hands the token to an
 * httpOnly cookie and returns nothing but a verdict.
 *
 * Registering signs you in. The alternative is bouncing someone who just typed
 * their details to a login form to type half of them again, which is friction
 * with no security value — the account was created by this same request.
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

  const { email, password, fullName, whatsapp } = body ?? {};

  const result = await registerSeller({ email, password, fullName, whatsapp });

  if (!result.ok || !result.refreshCookie) {
    // The CMS owns these messages — it is the thing that knows the email is
    // taken or the number malformed. Passing them through keeps one source of
    // truth for validation rather than restating the rules in two places.
    return NextResponse.json(
      {
        ok: false,
        code: result.code ?? "registration_failed",
        error: result.error ?? "Could not create your account.",
      },
      { status: 400 },
    );
  }

  await startSession(result.refreshCookie);

  // Never the token. The client gets only what it needs to greet the seller.
  return NextResponse.json({ ok: true, user: result.user ?? null });
}
