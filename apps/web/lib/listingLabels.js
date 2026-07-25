import { DEFAULT_LOCALE } from "@/lib/locale";
/**
 * Bilingual labels and styling for the two niche-critical listing signals.
 *
 * Terms are the standard Gulf classifieds idiom buyers actually scan for
 * (خليجي / وارد أمريكي / وارد اليابان), verified against live Gulf listings.
 */

export const IMPORT_ORIGIN = {
  gcc: { en: "GCC spec", ar: "خليجي" },
  "us-import": { en: "US import", ar: "وارد أمريكي" },
  "japan-import": { en: "Japan import", ar: "وارد اليابان" },
  other: { en: "Other spec", ar: "مواصفات أخرى" },
};

const NOT_STATED = {
  en: "Spec not stated by seller",
  ar: "لم يحدّد البائع المواصفات",
};

/**
 * Every stated origin renders identically — neutral, never a red "bad" pill.
 *
 * The moment US-import looks like a warning, sellers stop declaring it and we
 * lose the disclosure entirely. Honest disclosure requires that disclosing is
 * never punished; only *withholding* is marked (amber).
 */
export function importOriginLabel(origin, locale = DEFAULT_LOCALE) {
  if (!origin || !IMPORT_ORIGIN[origin]) {
    return { text: NOT_STATED[locale] ?? NOT_STATED.ar, stated: false };
  }
  return { text: IMPORT_ORIGIN[origin][locale] ?? IMPORT_ORIGIN[origin].ar, stated: true };
}

export const SOLD_AS_IS = {
  en: "Sold as-is",
  ar: "تُباع كما هي",
};

export const SOLD_AS_IS_DETAIL = {
  en: "This car is priced under OMR 1,500. The seller offers no warranty and no returns — you buy it in its current condition. That's normal at this price, and it's why the price is what it is. Please inspect it, or bring a mechanic, before you pay.",
  ar: "هذه السيارة بسعر أقل من 1,500 ريال عُماني. لا يقدّم البائع أي ضمان ولا إرجاع — أنت تشتريها بحالتها الحالية. هذا أمر طبيعي في هذه الفئة السعرية، وهو سبب انخفاض السعر. افحصها بنفسك، أو اصطحب معك فنيّاً، قبل الدفع.",
};

// Amber #B45309 on #FFF7ED is 4.76:1 — passes AA. Never red, never a warning
// triangle: as-is describes the terms of sale, not a fault in the car.
export const SOLD_AS_IS_STYLE = {
  color: "#B45309",
  background: "#FFF7ED",
  border: "1px solid rgba(180, 83, 9, 0.25)",
  borderRadius: 5,
  fontSize: 12,
  fontWeight: 600,
  padding: "4px 10px",
  display: "inline-block",
  lineHeight: 1.4,
};

// Stated spec origin: deliberately quiet and identical for every value.
export const SPEC_PILL_STYLE = {
  color: "#5C6368",
  background: "#F8F8F9",
  border: "1px solid #EDEDED",
  borderRadius: 5,
  fontSize: 12,
  fontWeight: 600,
  padding: "4px 10px",
  display: "inline-block",
  lineHeight: 1.4,
};

// Not stated — same amber family as as-is: information the buyer is missing.
export const SPEC_UNSTATED_STYLE = {
  ...SPEC_PILL_STYLE,
  color: "#B45309",
  background: "#FFF7ED",
  border: "1px solid rgba(180, 83, 9, 0.25)",
};
