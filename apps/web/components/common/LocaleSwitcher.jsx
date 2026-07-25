"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale } from "next-intl";

/**
 * Language toggle.
 *
 * Deliberately a real link, not a button with an onClick:
 *
 * - It works with JavaScript disabled or still loading, which on the budget
 *   Android devices NICHE.md describes is a real state, not a hypothetical.
 * - Crawlers can follow it, so the other language tree is discoverable rather
 *   than depending solely on the sitemap.
 * - Middle-click and "open in new tab" behave the way a link should.
 *
 * `usePathname` here is next-intl's, which returns the path with the locale
 * segment already stripped — so on /en/guides/used-car-scams-oman it gives
 * /guides/used-car-scams-oman, and the `locale` prop puts the other prefix on.
 * The switch therefore lands on the *same page* in the other language rather
 * than dumping the reader back at the home page, which is the usual failure of
 * these controls and the reason people stop using them.
 */

// Each language named in its own script — never "AR"/"EN" flags or codes. A
// reader looking for Arabic scans for العربية, not for a two-letter code, and
// flags conflate language with country (Arabic is not "the flag of Oman").
const LANGUAGE_NAMES = {
  ar: "العربية",
  en: "English",
};

export default function LocaleSwitcher({ className = "" }) {
  const locale = useLocale();
  const pathname = usePathname();

  const other = routing.locales.find((l) => l !== locale);
  if (!other) return null;

  return (
    <Link
      href={pathname}
      locale={other}
      // Tells crawlers what is on the other end before they follow it.
      hrefLang={other}
      // The label is in the target language, so mark it up as such or a screen
      // reader will read Arabic with an English voice.
      lang={other}
      dir={other === "ar" ? "rtl" : "ltr"}
      // The visible label is the language name; this says what the control does.
      aria-label={
        other === "ar" ? "التبديل إلى العربية" : "Switch to English"
      }
      className={`locale-switcher ${className}`.trim()}
    >
      {/* Inline rather than an icon font: the Font Awesome faces were removed
          for weight, and a language control is much easier to spot with a
          globe than as bare text in a header full of other links. */}
      <svg
        className="locale-switcher__icon"
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M1.75 8h12.5M8 1.75c1.6 1.7 2.5 3.9 2.5 6.25S9.6 12.55 8 14.25C6.4 12.55 5.5 10.35 5.5 8S6.4 3.45 8 1.75Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{LANGUAGE_NAMES[other]}</span>
    </Link>
  );
}
