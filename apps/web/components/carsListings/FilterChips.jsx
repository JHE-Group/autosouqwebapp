"use client";
import { useLocale, useTranslations } from "next-intl";

import { formatPrice } from "@/lib/format";
import { activeFilterKeys } from "./filterLogic";

/**
 * The applied filters, named and individually removable.
 *
 * With ten listings a forgotten filter is the difference between three results
 * and none, and the offcanvas panel hides the reason on a phone. AutoTrader's
 * all-or-nothing "Search all cars" reset is fine at 450,000 listings; here the
 * buyer needs to undo the one filter that emptied the page, not start again.
 *
 * Chip text is the filter's *value* ("Sohar", "2,000 – 4,000 OMR"), which is
 * data rather than UI copy, so it reads correctly in either language. Only the
 * remove control carries prose, and it carries both.
 */

// #5C6368 on #F8F8F9 is 5.75:1 — the same neutral pairing as the spec pill in
// lib/listingLabels.js, so an applied filter never shouts louder than a
// disclosure about the car itself.
const CHIP_STYLE = {
  color: "#5C6368",
  background: "#F8F8F9",
  border: "1px solid #EDEDED",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.4,
  padding: "6px 6px 6px 12px",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

// 32px is under the 44px guidance for a standalone target, but this sits
// inside a 36px-tall chip whose whole surface is the button — the hit area is
// the chip, not the glyph.
const REMOVE_STYLE = {
  border: 0,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: "6px 8px",
  minWidth: 32,
  minHeight: 32,
};

const range = (value, format) => `${format(value[0])} – ${format(value[1])}`;
const plain = (n) => Number(n).toLocaleString("en-US");

/**
 * One short, human string per applied filter.
 *
 * `locale` is required for the price chip: `formatPrice` defaults its third
 * argument to "en", so omitting it rendered "1,000 – 5,900 OMR" in the applied
 * filter bar on /ar while every other price on the same screen read "ر.ع".
 */
export function chipsFor(state, locale) {
  const chips = [];
  for (const key of activeFilterKeys(state)) {
    if (key === "features") {
      state.features.forEach((feature) =>
        chips.push({ key, value: feature, text: feature }),
      );
    } else if (key === "price") {
      chips.push({
        key,
        text: `${plain(state.price[0])} – ${formatPrice(state.price[1], undefined, locale)}`,
      });
    } else if (key === "km") {
      chips.push({ key, text: `${range(state.km, plain)} km` });
    } else if (key === "year") {
      chips.push({ key, text: range(state.year, plain) });
    } else {
      chips.push({ key, text: String(state[key]) });
    }
  }
  return chips;
}

/** Put one filter back to the value that means "not filtering on this". */
export function clearChip(chip, allProps) {
  switch (chip.key) {
    case "price":
      return allProps.setPrice(allProps.bounds.price);
    case "km":
      return allProps.setKM(allProps.bounds.km);
    case "year":
      return allProps.setYear(allProps.bounds.year);
    case "features":
      // setFeatures toggles, so passing the feature back removes it.
      return allProps.setFeatures(chip.value);
    case "make":
      return allProps.setMake("Any Make");
    case "model":
      return allProps.setModel("Any Model");
    case "body":
      return allProps.setBody("Any Body");
    case "fuel":
      return allProps.setFuel("Any Fuel");
    case "transmission":
      return allProps.setTransmission("Any Transmission");
    case "location":
      return allProps.setLocation("Any Location");
    case "door":
      return allProps.setDoor("Any Door");
    case "cylinder":
      return allProps.setCylinder("Any Cylinder");
    case "color":
      return allProps.setColor("Any Color");
    default:
      return undefined;
  }
}

export default function FilterChips({ allProps, clearFilter, className = "" }) {
  const t = useTranslations("browse.filter");
  const locale = useLocale();
  const chips = chipsFor(allProps, locale);
  if (!chips.length) return null;

  return (
    <div
      className={`d-flex flex-wrap align-items-center ${className}`}
      style={{ gap: 8 }}
    >
      {chips.map((chip, i) => (
        <span key={`${chip.key}-${chip.value ?? i}`} style={CHIP_STYLE}>
          {chip.text}
          <button
            type="button"
            style={REMOVE_STYLE}
            onClick={() => clearChip(chip, allProps)}
            aria-label={t("removeFilter", { name: chip.text })}
          >
            <span aria-hidden="true">×</span>
          </button>
        </span>
      ))}
      {chips.length > 1 && clearFilter && (
        <button
          type="button"
          onClick={clearFilter}
          className="btn btn-link p-0"
          // #BD4B2B on white is 4.99:1 — the accent tone that passes on light.
          style={{
            color: "#BD4B2B",
            fontSize: 13,
            fontWeight: 600,
            minHeight: 32,
            textDecoration: "underline",
          }}
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}
