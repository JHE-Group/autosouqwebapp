/**
 * Default content language — one source of truth with i18n/routing.
 *
 * NICHE.md: Arabic first, English equal second. Client components that omit a
 * `locale` prop should still follow the active route via `useLocale()`; this
 * constant is the fallback for server helpers and non-React modules.
 */
export { DEFAULT_LOCALE } from "@/i18n/routing";

/**
 * Prefer the requested language, fall back to whatever content actually exists.
 * A listing with only an English title should still render, not vanish.
 */
export function pickLocale(locale, ar, en) {
  return (locale === "ar" ? ar || en : en || ar) || null;
}
