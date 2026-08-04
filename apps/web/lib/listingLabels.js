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
  // Amber is now the ONLY chip colour on a card, so it no longer needs an
  // outline to separate it from its neighbours.
  border: "none",
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
  // No border. At 3.5px of blur the pill outlines survived and the price did
  // not — four bordered boxes are four shapes competing with the one number a
  // buyer came to read. The fill alone is enough to read as a chip.
  border: "none",
  borderRadius: 5,
  fontSize: 12,
  fontWeight: 600,
  padding: "4px 10px",
  display: "inline-block",
  lineHeight: 1.4,
};

/**
 * Not stated — quiet, like every other absence.
 *
 * This used the amber of SOLD_AS_IS_STYLE, and so did "not checked yet", so a
 * browse grid rendered two identical amber chips on 8 of its 12 cards and at
 * least one on 9. Measured across the whole page. The effect is a wall of
 * warning colour on a marketplace whose disclosures are meant to read as
 * candour, not as a hazard notice on every car.
 *
 * The distinction that matters: as-is is a FACT THE SELLER ASSERTED about the
 * terms of sale, and it changes what the buyer is agreeing to — it earns a
 * colour. "Not stated" and "not checked yet" are ABSENCES. They must still be
 * said, and they are, in the same words as before; they just stop shouting.
 *
 * Every disclosure is kept. Only the volume changes — and the green verified
 * chip becomes the one coloured trust mark on the card, which is what makes it
 * mean anything.
 */
export const SPEC_UNSTATED_STYLE = {
  ...SPEC_PILL_STYLE,
};
