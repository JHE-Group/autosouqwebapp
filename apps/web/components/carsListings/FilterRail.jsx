"use client";

import FilterPanel from "./FilterPanel";
import { activeFilterCount } from "./filterLogic";
import { useTranslations } from "next-intl";

/**
 * The desktop filter rail.
 *
 * Cars1 and Cars3 each hand-wrote this column, which is how both ended up
 * shipping the theme's demo dropdown values and the kilometre-slider bug months
 * after FilterSidebar had been fixed. It is now the same FilterPanel the mobile
 * sheet renders, so the two can no longer disagree about what a filter is.
 *
 * `.sidebar-right-listing` is retained from the theme because responsive.scss
 * uses it to hide this column below 1200px, where the offcanvas takes over.
 */
export default function FilterRail({
  allProps,
  clearFilter,
  filterOptions,
  source = [],
}) {
  const t = useTranslations("browse.filter");
  const applied = activeFilterCount(allProps);

  return (
    <aside
      className="sidebar-right-listing style-2 asq-rail"
      aria-label={t("aria")}
    >
      <div className="asq-rail__head">
        <h2 className="asq-rail__title">{t("heading")}</h2>
        {/* Was an always-present "Clear" that did nothing to look at when
            nothing was applied. It now appears only when there is something to
            clear, and says how much. */}
        {applied > 0 && (
          <button type="button" className="asq-rail__clear" onClick={clearFilter}>
            {t("clear", { count: applied })}
          </button>
        )}
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <FilterPanel
          allProps={allProps}
          filterOptions={filterOptions}
          source={source}
        />
      </form>
    </aside>
  );
}
