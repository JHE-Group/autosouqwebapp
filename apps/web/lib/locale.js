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

/**
 * `pickLocale`, but it also tells you which language you got.
 *
 * The fallback above is right — a listing with only English prose should render
 * rather than vanish — but it is silent, and silence is the problem. A seller's
 * English paragraph shown inside `<html lang="ar" dir="rtl">` with nothing
 * marking it tells a screen reader to pronounce English with Arabic phonemes,
 * tells the browser to lay out a left-to-right sentence in a right-to-left
 * block, and tells the reader that this is what we consider an Arabic page.
 *
 * design/research/arabic-seo-strategy.md §10 gate 11: "Any surviving English
 * seller text on an Arabic page is wrapped in `lang="en" dir="ltr"` **and
 * visibly labelled. Never silent.**"
 *
 * Returns `{ value, lang, isFallback }`:
 *   - `value`      the string to render, or null
 *   - `lang`       "ar" | "en" — the language `value` is actually in
 *   - `isFallback` true when that is not the language which was asked for
 *
 * Callers that do not care can keep using `pickLocale`. Use this one wherever
 * the text is **unbounded seller input** — a description, a free-text note.
 * Our own taxonomy labels do not need it: those are a closed vocabulary we
 * control and can require translations for in the CMS.
 */
export function pickLocaleWithLang(locale, ar, en) {
  const wanted = locale === "ar" ? "ar" : "en";
  const primary = wanted === "ar" ? ar : en;
  const secondary = wanted === "ar" ? en : ar;

  const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const first = clean(primary);
  if (first) return { value: first, lang: wanted, isFallback: false };

  const second = clean(secondary);
  if (second) {
    return {
      value: second,
      lang: wanted === "ar" ? "en" : "ar",
      isFallback: true,
    };
  }
  return { value: null, lang: wanted, isFallback: false };
}
