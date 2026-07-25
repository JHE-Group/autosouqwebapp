"use client";

import DropdownSelect from "../common/DropDownSelect";
import ListGridToggler from "./ListGridToggler";
import { useTranslations } from "next-intl";

/**
 * The row above the results: how many, how to narrow, how to look, how to sort.
 *
 * Cars1–Cars5 each had their own version — different order, different controls,
 * different wording, and in two of them a "Show: 12" page size offered over a
 * catalogue of ten. Pagination and page-size controls that cannot do anything
 * are the small tells that make a marketplace read as a template, and this site
 * launches at roughly ten listings, so every control here is derived from the
 * result count and simply absent when it would be inert.
 *
 * The count itself is a statement about *this search*, never about the
 * business: "Search 452,718 cars" is a confidence signal because the number is
 * huge, and the same pattern at ten is an advertisement for the competitor.
 */

// The sort strings are matched exactly in the Cars* effects and in
// reducer/carFilterReducer — the label IS the value, so it cannot be reworded
// here without changing the sort. Noted rather than silently reworded.
export const SORT_OPTIONS = [
  "Sort by (Default)",
  "Price Ascending",
  "Price Descending",
];

const PAGE_SIZES = [6, 9, 12];

export default function ResultsToolbar({
  resultCount = 0,
  appliedCount = 0,
  isGrid,
  setIsGrid,
  sortingOption,
  setSortingOption,
  itemPerPage,
  setItemPerPage,
  // Cars1/Cars3 keep a desktop rail, so their trigger is mobile-only; the map
  // layouts have no rail and show it at every width.
  filterTriggerMobileOnly = false,
  showPageSize = true,
  className = "",
}) {
  const t = useTranslations("browse.toolbar");
  // Only page sizes that would actually split this result set. At ten listings
  // "Show: 12" is a control that does nothing.
  const pageSizes = PAGE_SIZES.filter((n) => n < resultCount);
  const offerPageSize =
    showPageSize && setItemPerPage && pageSizes.length > 1;

  return (
    <div className={`asq-toolbar ${className}`.trim()}>
      <div className="asq-toolbar__lead">
        {resultCount > 0 && (
          <p className="asq-toolbar__count" aria-live="polite">
            {t("matches", { count: resultCount })}
          </p>
        )}
        <div className={filterTriggerMobileOnly ? "filter-mobie" : undefined}>
          {/* The count on the trigger is the whole point of a combined filter
              control on a phone: with a small catalogue a forgotten active
              filter is the difference between three results and none, and the
              panel that caused it is closed. */}
          <button
            type="button"
            className="filter asq-toolbar__filter"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasRight"
            aria-controls="offcanvasRight"
          >
            {appliedCount ? t("filtersCount", { count: appliedCount }) : t("filters")}
            <i className="icon-autodeal-filter" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="asq-toolbar__controls">
        {setIsGrid && <ListGridToggler isGrid={isGrid} setIsGrid={setIsGrid} />}
        <div className="wd-find-select asq-toolbar__selects">
          {offerPageSize && (
            <div className="group-select">
              <DropdownSelect
                selectedValue={`Show: ${itemPerPage}`}
                onChange={(value) => {
                  const match = String(value).match(/\d+/);
                  if (match) setItemPerPage(parseInt(match[0], 10));
                }}
                addtionalParentClass="list-page"
                options={pageSizes.map((n) => `Show: ${n}`)}
              />
            </div>
          )}
          <div className="group-select">
            <DropdownSelect
              selectedValue={sortingOption}
              onChange={setSortingOption}
              addtionalParentClass="list-sort"
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
