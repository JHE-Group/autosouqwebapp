/**
 * Where to send someone after they sign in.
 *
 * `?next=` arrives from the URL, so it is attacker-controlled. Without this
 * check a link like `/sign-in?next=https://autosouq.example` would bounce a
 * seller off-site the instant they typed their password — the classic open
 * redirect, and an unusually convincing one, because the victim has just
 * proved to themselves that they are on the real site.
 *
 * Only same-site absolute paths survive. `//evil.example` is rejected too: it
 * is protocol-relative and leaves the site just as effectively as an `https://`
 * URL, which is what makes it the form people forget.
 */
export function safeNext(next, fallback = "/add-listing") {
  const value = typeof next === "string" ? next : "";
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
