/**
 * Display labels for filter values, without touching the values themselves.
 *
 * The "Any Make" / "Price Ascending" / "Show: 12" strings are **state**, not
 * copy. `reducer/carFilterReducer` and `components/carsListings/filterLogic.js`
 * compare against them literally (`if (make !== "Any Make")`), `useCarFilters`
 * branches on `sortingOption === "Price Ascending"`, and they are the values a
 * `<DropdownSelect>` reports back through `onChange`. Translating them at
 * source would mean the Arabic tree filters nothing and sorts nothing, silently.
 *
 * So the value stays English forever and only its *rendering* is localised.
 * That is also why this is a lookup on the way out rather than a wrapper on the
 * way in: anything that fails to match — a make, a model, a city, a colour, a
 * feature name from the CMS — falls through unchanged, which is correct.
 * "Toyota" is Toyota in both languages, and a city name arrives already
 * localised from Strapi.
 *
 * Numeric variants ("4 Door", "6 Cylinder", "Show: 12") are matched by pattern
 * so the list does not have to enumerate every count the catalogue might hold.
 */

const SENTINELS = {
  "Any Make": { en: "Any Make", ar: "كل الماركات" },
  "Any Model": { en: "Any Model", ar: "كل الموديلات" },
  "Any Body": { en: "Any Body", ar: "كل الأنواع" },
  "Any Fuel": { en: "Any Fuel", ar: "كل أنواع الوقود" },
  "Any Transmission": { en: "Any Transmission", ar: "كل ناقلات الحركة" },
  "Any Location": { en: "Any Location", ar: "كل المدن" },
  "Any Color": { en: "Any Color", ar: "كل الألوان" },
  "Any Door": { en: "Any Door", ar: "أي عدد أبواب" },
  "Any Cylinder": { en: "Any Cylinder", ar: "أي عدد أسطوانات" },
  "Sort by (Default)": { en: "Sort by (Default)", ar: "الترتيب (الافتراضي)" },
  "Price Ascending": { en: "Price Ascending", ar: "السعر: من الأقل" },
  "Price Descending": { en: "Price Descending", ar: "السعر: من الأعلى" },
};

/** "4 Door" -> "4 أبواب", "6 Cylinder" -> "6 أسطوانات", "Show: 12" -> "عرض 12". */
const PATTERNS = [
  [/^(\d+)\s*Door$/i, (n) => `${n} أبواب`],
  [/^(\d+)\s*Cylinder$/i, (n) => `${n} أسطوانات`],
  [/^Show:\s*(\d+)$/i, (n) => `عرض ${n}`],
];

/**
 * Localise one option for display. Returns the input unchanged for English and
 * for anything unrecognised.
 */
export function filterLabel(value, locale = "en") {
  if (locale !== "ar" || typeof value !== "string") return value;
  const known = SENTINELS[value];
  if (known) return known.ar;
  for (const [re, render] of PATTERNS) {
    const match = value.match(re);
    if (match) return render(match[1]);
  }
  return value;
}
