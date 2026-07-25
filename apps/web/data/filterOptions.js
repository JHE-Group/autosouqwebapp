/**
 * Fallback feature checkboxes for the filter panels.
 *
 * `lib/carOptions.js#buildFilterOptions()` derives the real list from whatever
 * listings are on the page and only falls back here when none carry features.
 * The values mirror the `feature` taxonomy seeded in the CMS, so the fallback
 * and the live data offer buyers the same vocabulary — and it is the vocabulary
 * that actually matters at OMR 1,500–6,000 (a cold A/C and a working power
 * window, not the theme's "body character lines").
 */
export const featureOptions = [
  "Air conditioning",
  "Power steering",
  "Power windows",
  "Central locking",
  "Driver airbag",
  "ABS",
  "Rear camera",
  "Alloy wheels",
  "Bluetooth",
  "Cruise control",
  "4WD",
  "Agency service history",
];
