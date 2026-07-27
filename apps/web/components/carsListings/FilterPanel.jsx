"use client";

import { useEffect, useMemo } from "react";
import { formatPrice } from "@/lib/format";
import Pricing from "../common/Pricing";
import DropdownSelect from "../common/DropDownSelect";
import { isFilterActive, NEUTRAL } from "./filterLogic";
import { useLocale, useTranslations } from "next-intl";

/**
 * One filter body, used by both the desktop rail and the mobile offcanvas.
 *
 * There were three copies of this form: the offcanvas in FilterSidebar.jsx, and
 * hand-written rails inlined in Cars1.jsx and Cars3.jsx. The inlined pair still
 * carried the purchased theme's demo values — Make offered "Audi / Dongfeng /
 * BMW" and City offered "London / New York / Paris" — none of which matches an
 * Omani listing, so every one of those filters returned zero results. They also
 * still fed `bounds.price` into the kilometre slider, the bug called out in the
 * UX research: a ~1,000–6,000 track under a "KM" label, so the first drag wrote
 * a price-scale number into `km` and emptied the grid. Filtering by kilometres
 * is the primary condition signal at OMR 1,500–6,000.
 *
 * Order is by decision weight for this band, not the theme's order: budget →
 * nameplate → wear → place → shape → drive → age, then everything a buyer at
 * this price is not deciding on behind a disclosure.
 */

const sortUnique = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "ar"),
  );

/**
 * A dropdown with one real value under its "Any …" sentinel cannot narrow
 * anything — offering it implies a catalogue with variety we do not have. The
 * research note is about fuel type specifically (this band in Oman is
 * effectively all petrol), but the rule is general and derived from the data
 * rather than hardcoded, so a facet reappears the moment it means something.
 */
const hasChoice = (options) => (options?.length ?? 0) > 2;

/** A slider whose ends are the same value is a control that cannot move. */
const hasRange = (bound) =>
  Array.isArray(bound) && Number(bound[1]) - Number(bound[0]) > 1;

function Facet({ label, value, active, onReset, children }) {
  const t = useTranslations("browse.filter");

  return (
    <div className={`asq-facet${active ? " is-active" : ""}`}>
      <div className="asq-facet__head">
        <span className="asq-facet__label">{label}</span>
        {active && onReset && (
          <button type="button" className="asq-facet__reset" onClick={onReset}>
            {t("reset")}
            {/* Names the facet for a screen reader, which hears the buttons
                out of context as a row of identical "Reset"s. */}
            <span className="asq-sr-only"> {label}</span>
          </button>
        )}
      </div>
      {value && <p className="asq-facet__value">{value}</p>}
      {children}
    </div>
  );
}

export default function FilterPanel({
  allProps,
  filterOptions,
  source = [],
  className = "",
}) {
  const t = useTranslations("browse.filter");
  const { bounds } = allProps;

  // Model options follow the chosen make. Offering every model in the
  // catalogue under a chosen make is a guaranteed zero-result trap when the
  // catalogue is ten cars.
  const modelOptions = useMemo(() => {
    if (!source.length || allProps.make === NEUTRAL.make) {
      return filterOptions.model;
    }
    return [
      NEUTRAL.model,
      ...sortUnique(
        source.filter((car) => car.make === allProps.make).map((car) => car.model),
      ),
    ];
  }, [source, allProps.make, filterOptions.model]);

  // A model left selected after its make changed filters everything out while
  // the control that caused it is no longer even offering that value.
  useEffect(() => {
    if (
      allProps.model !== NEUTRAL.model &&
      !modelOptions.includes(allProps.model)
    ) {
      allProps.setModel(NEUTRAL.model);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelOptions, allProps.model]);

  const active = (key) => isFilterActive(key, allProps, bounds);
  const plain = (n) => Number(n).toLocaleString("en-US");
  // formatPrice defaults to the English currency label; without this the price
  // facet read "5,900 OMR" on /ar beside "ر.ع" everywhere else on the page.
  const locale = useLocale();

  const select = (key, labelKey, options, setter) =>
    hasChoice(options) ? (
      <Facet
        label={t(labelKey)}
        active={active(key)}
        onReset={() => setter(NEUTRAL[key])}
      >
        <DropdownSelect
          selectedValue={allProps[key]}
          onChange={setter}
          options={options}
        />
      </Facet>
    ) : null;

  return (
    <div className={`asq-filter ${className}`.trim()}>
      {hasRange(bounds.price) && (
        <Facet
          label={t("price")}
          value={`${plain(allProps.price[0])} – ${formatPrice(allProps.price[1], undefined, locale)}`}
          active={active("price")}
          onReset={() => allProps.setPrice(bounds.price)}
        >
          <Pricing
            MIN={bounds.price[0]}
            MAX={bounds.price[1]}
            priceRange={allProps.price}
            setPriceRange={allProps.setPrice}
          />
        </Facet>
      )}

      {select("make", "make", filterOptions.make, allProps.setMake)}
      {select("model", "model", modelOptions, allProps.setModel)}

      {hasRange(bounds.km) && (
        <Facet
          label={t("km")}
          value={`${plain(allProps.km[0])} – ${plain(allProps.km[1])} km`}
          active={active("km")}
          onReset={() => allProps.setKM(bounds.km)}
        >
          <Pricing
            MIN={bounds.km[0]}
            MAX={bounds.km[1]}
            priceRange={allProps.km}
            setPriceRange={allProps.setKM}
          />
        </Facet>
      )}

      {select("location", "city", filterOptions.location, allProps.setLocation)}
      {select("body", "bodyType", filterOptions.body, allProps.setBody)}
      {select(
        "transmission",
        "transmission",
        filterOptions.transmission,
        allProps.setTransmission,
      )}

      {hasRange(bounds.year) && (
        <Facet
          label={t("year")}
          value={`${allProps.year[0]} – ${allProps.year[1]}`}
          active={active("year")}
          onReset={() => allProps.setYear(bounds.year)}
        >
          <Pricing
            MIN={bounds.year[0]}
            MAX={bounds.year[1]}
            priceRange={allProps.year}
            setPriceRange={allProps.setYear}
          />
        </Facet>
      )}

      {/* Below the fold on purpose. At OMR 1,500–6,000 the buyer is managing
          budget and risk, not expressing a preference about door count. */}
      <details className="asq-filter__more">
        <summary>{t("more")}</summary>
        <div className="asq-filter__more-body">
          {select(
            "cylinder",
            "cylinders",
            filterOptions.cylinder,
            allProps.setCylinder,
          )}
          {select("door", "doors", filterOptions.door, allProps.setDoor)}
          {select("color", "colour", filterOptions.color, allProps.setColor)}
          {select("fuel", "fuel", filterOptions.fuel, allProps.setFuel)}

          {filterOptions.features?.length > 0 && (
            <fieldset className="asq-facet asq-facet--features">
              <legend className="asq-facet__label">{t("features")}</legend>
              <div className="asq-checks">
                {filterOptions.features.map((feature) => (
                  <label className="asq-check" key={feature}>
                    <input
                      type="checkbox"
                      checked={allProps.features.includes(feature)}
                      onChange={() => allProps.setFeatures(feature)}
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </details>
    </div>
  );
}
