/**
 * The half-finished listing kept in localStorage.
 *
 * Lives here rather than inside AddListing because signing out has to be able
 * to clear it, and the sidebar has no business importing the form.
 *
 * **Scoped by seller id.** The key used to be a single global
 * `autosouq:listing-draft:v1`, which on a shared phone — a family phone, a
 * phone passed between flatmates, exactly the audience NICHE.md describes —
 * offered seller B a restore banner for seller A's draft, complete with their
 * car, their asking price and their WhatsApp number. Nothing in the flow
 * suggested it belonged to someone else; it looked like unfinished work.
 *
 * The id is enough. It never leaves the device, and two sellers on one phone
 * now have two drafts that cannot see each other. `clearListingDraft` on sign
 * out closes the remaining window, where a seller hands the phone over without
 * the next person signing in as themselves.
 */
const PREFIX = "autosouq:listing-draft:v2";

/** v1 was unscoped. Anything still under it belongs to whoever typed it. */
const LEGACY_KEY = "autosouq:listing-draft:v1";

export function draftKeyFor(sellerId) {
  return sellerId ? `${PREFIX}:${sellerId}` : PREFIX;
}

export function clearListingDraft(sellerId) {
  try {
    window.localStorage.removeItem(draftKeyFor(sellerId));
    // Whoever is leaving may have written the unscoped one before this change.
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Private mode or a full quota. Nothing here is worth interrupting a sign
    // out over — the session cookie is what actually ends the session.
  }
}
