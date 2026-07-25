"use client";

import { allCars } from "@/data/cars";
import { buildFilterOptions } from "@/lib/carOptions";
import FilterPanel from "./FilterPanel";
import { activeFilterCount } from "./filterLogic";
import { useTranslations } from "next-intl";

const DEMO_OPTIONS = buildFilterOptions(allCars);

/**
 * The mobile filter panel.
 *
 * Two things make an offcanvas filter usable rather than merely present, and
 * neither was here: you must be able to see what you have already applied
 * without closing it, and you must be able to leave without hunting for the ×.
 * So the header carries the applied count, and a footer pinned to the bottom of
 * the sheet carries the live result count as the confirm button — "Show 3 cars"
 * is the answer to the only question a buyer has while dragging a slider, and
 * at a ten-car catalogue watching it fall to zero is the difference between
 * understanding the filter and concluding the site is empty.
 *
 * The count is `sorted.length` from the grid behind the sheet: the same number
 * the page will show, never an estimate.
 */
export default function FilterSidebar({
  allProps,
  clearFilter,
  filterOptions = DEMO_OPTIONS,
  source = [],
  resultCount,
}) {
  const t = useTranslations("browse.filter");
  const applied = activeFilterCount(allProps);
  const showsCount = Number.isFinite(resultCount);

  return (
    <div
      className="offcanvas offcanvas-end asq-filter-sheet"
      tabIndex={-1}
      id="offcanvasRight"
      aria-labelledby="offcanvasRightLabel"
    >
      <div className="offcanvas-header asq-filter-sheet__head">
        <h4 className="offcanvas-title" id="offcanvasRightLabel">
          {t("heading")}
        </h4>
        <div className="asq-filter-sheet__head-actions">
          {applied > 0 && (
            <button
              type="button"
              className="asq-filter-sheet__clear"
              onClick={clearFilter}
            >
              {t("clear", { count: applied })}
            </button>
          )}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label={t("close")}
          />
        </div>
      </div>

      <div className="offcanvas-body asq-filter-sheet__body">
        <form onSubmit={(e) => e.preventDefault()}>
          <FilterPanel
            allProps={allProps}
            filterOptions={filterOptions}
            source={source}
          />
        </form>
      </div>

      <div className="asq-filter-sheet__foot">
        <button
          type="button"
          className="asq-btn asq-btn--accent"
          data-bs-dismiss="offcanvas"
        >
          {showsCount
            ? resultCount === 1
              ? t("showCars", { count: 1 })
              : t("showCars", { count: resultCount })
            : t("showResults")}
        </button>
      </div>
    </div>
  );
}
