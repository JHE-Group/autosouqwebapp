/**
 * The one place the default content language is decided.
 *
 * NICHE.md wants Arabic first and English an equal second. Several modules
 * implemented that individually as `locale = "ar"` default parameters, which
 * produced Arabic spec pills, Arabic WhatsApp messages and Arabic labels inside
 * an `<html lang="en">` page. That is not Arabic-first — it is mixed-language,
 * and it reads as broken to Arabic and English speakers alike.
 *
 * So the default follows the document language, and there is exactly one of
 * them. When `[locale]` routing lands, thread the segment value through from
 * the route instead of relying on this constant, and the whole page flips
 * together rather than one label at a time.
 *
 * Anything that renders user-facing text in a chosen language should take a
 * `locale` argument defaulting to this — never hard-code "ar" or "en".
 */
export const DEFAULT_LOCALE = "en";

/**
 * Prefer the requested language, fall back to whatever content actually exists.
 * A listing with only an English title should still render, not vanish.
 */
export function pickLocale(locale, ar, en) {
  return (locale === "ar" ? ar || en : en || ar) || null;
}
