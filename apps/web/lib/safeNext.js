/**
 * Where to send someone after they sign in.
 *
 * `?next=` arrives from the URL, so it is attacker-controlled. Without a check,
 * a link like `/sign-in?next=https://autosouq.example` bounces a seller off-site
 * the instant they type their password — the classic open redirect, and an
 * unusually convincing one, because the victim has just proved to themselves
 * that they are on the real site.
 *
 * ## Why this is stricter than it strictly needs to be
 *
 * A security review found the first version accepted `/\evil.example` and
 * `/%2f%2fevil.example`, and concluded neither was exploitable: next-intl's
 * `localePrefix` is `"always"`, so every consumer passes this value through
 * `redirect({href, locale})` or `useRouter().push`, which prepend a locale and
 * leave the result same-origin.
 *
 * That is true, and it is a property of a dependency's URL handling rather than
 * of this code. It holds until someone uses this helper somewhere that does not
 * go through next-intl — a `Location` header, a `<meta refresh>`, a plain
 * `window.location` — at which point the guard silently stops guarding. A
 * redirect allowlist is the wrong place to depend on something else being
 * careful.
 *
 * So: allowlist, not denylist. A value is accepted only if it looks like a path
 * this application would have generated; everything else falls back.
 */

/**
 * Characters that must never appear in an accepted value.
 *
 * `\` because browsers have historically treated it interchangeably with `/`
 * when resolving an authority, so `/\evil.example` can behave as
 * protocol-relative. Whitespace and control characters because they are the
 * standard way to smuggle past a prefix check — a leading tab or newline gets
 * stripped by some parsers *after* validation has already passed — and because
 * neither has any business in a path we produced.
 *
 * Written as `\u` escapes rather than pasted literals: control characters in
 * source are invisible in a diff and get silently mangled by editors.
 */
// eslint-disable-next-line no-control-regex
const FORBIDDEN = /[\\\s\u0000-\u001f\u007f-\u009f]/;

/** A scheme at the start of the path portion — `javascript:`, `data:`, `http:`. */
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Decode until stable, so an encoded attack is judged on what it means.
 *
 * `%2f%2fevil.example` is `//evil.example` once decoded, and one pass of
 * `decodeURIComponent` is not enough against `%252f`. Capped at four rounds so a
 * deliberately deep chain cannot spin. A malformed escape throws, which is
 * itself grounds for rejection — this application never generates one.
 */
function fullyDecode(value) {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    let decoded;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      return null;
    }
    if (decoded === current) return current;
    current = decoded;
  }
  // Still changing after four passes: not something we produced.
  return null;
}

export function safeNext(next, fallback = "/add-listing") {
  if (typeof next !== "string" || next === "") return fallback;

  const decoded = fullyDecode(next);
  if (decoded === null) return fallback;

  // Both forms are judged by the same rules: the raw one catches a literal
  // backslash, the decoded one catches its percent-encoding.
  for (const candidate of [next, decoded]) {
    if (!candidate.startsWith("/")) return fallback;
    // `//host` and, on some parsers, `/\host` are an authority, not a path.
    if (candidate.startsWith("//")) return fallback;
    if (FORBIDDEN.test(candidate)) return fallback;
    if (HAS_SCHEME.test(candidate.slice(1))) return fallback;
  }

  /**
   * Return the ORIGINAL, not the decoded form.
   *
   * The decoding exists to judge intent, not to rewrite the value. Returning the
   * decoded string would mean a legitimately encoded path — a slug carrying an
   * encoded character — comes back different from how it arrived, and the caller
   * would navigate somewhere subtly other than what it asked for.
   */
  return next;
}
