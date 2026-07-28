"use client";

import Slider from "rc-slider";
// Was in the root layout, where every route paid for it.
import "rc-slider/assets/index.css";

/**
 * A two-handle range slider.
 *
 * `rc-slider` gives each handle `role="slider"` and `aria-valuenow`, but no
 * name unless you supply one — so a screen-reader user met six of these across
 * the filter panel and heard "slider, 1500", "slider, 130000", "slider, 2004"
 * with nothing to say which was price, which mileage and which year. The
 * numbers alone do not disambiguate them, and the visible facet heading is a
 * plain <span> with no programmatic association.
 *
 * `ariaValueTextFormatterForHandle` matters as much as the label: without it
 * the announced value for a price is the bare integer "5900", where what the
 * user needs is "5,900 OMR". `aria-valuetext` replaces the number in the
 * announcement rather than adding to it, which is exactly what we want here.
 */
export default function Pricing({
  priceRange,
  setPriceRange,
  MIN = 10,
  MAX = 100,
  label = "",
  formatValue,
}) {
  const describe = (value) =>
    formatValue ? formatValue(value) : Number(value).toLocaleString("en-US");

  return (
    <Slider
      range
      max={MAX}
      min={MIN}
      value={priceRange}
      onChange={setPriceRange}
      ariaLabelForHandle={
        label ? [`${label} — minimum`, `${label} — maximum`] : undefined
      }
      ariaValueTextFormatterForHandle={[describe, describe]}
    />
  );
}
