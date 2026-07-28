"use client";

import FlatFilter3 from "../common/FlatFilter3";
import EmptyResults from "./EmptyResults";
import FilterChips from "./FilterChips";
import FilterSidebar from "./FilterSidebar";
import ListingCard from "./ListingCard";
import ListingPagination from "./ListingPagination";
import ResultsToolbar from "./ResultsToolbar";
import { useSearchParams } from "next/navigation";
import { parsePriceParam } from "@/data/budgetBands";
import useCarFilters from "./useCarFilters";

/**
 * The canonical browse grid.
 *
 * `FlatFilter3` is a wide hero filter that collapses out of the way on a phone,
 * which left the mobile visitor here with no filter at all — so the offcanvas
 * panel the other layouts already had is now rendered here too, reached from
 * the toolbar trigger with its applied count.
 */
export default function Cars2({ listings, resultsHeading = "Browse cars" }) {
  /*
   * The homepage budget links land here as `?price=1500-2500`.
   * Read in this component rather than inside useCarFilters: the hook is
   * shared with four legacy layouts, and `useSearchParams()` there would opt
   * every one of them into client rendering. Parsing is strict — a mangled
   * value yields null and the grid renders unfiltered rather than empty.
   */
  const initialPrice = parsePriceParam(useSearchParams().get("price"));

  const {
    source,
    filterOptions,
    allProps,
    clearFilter,
    appliedCount,
    sorted,
    pageItems,
    currentPage,
    itemPerPage,
    sortingOption,
  } = useCarFilters(listings, { pageSize: 12, initialPrice });

  // Facet landers put the SEO H1 in the hero; the results block then uses a
  // plain heading so the page does not ship two competing H1s.
  const HeadingTag = resultsHeading ? "h2" : "h1";
  const headingText = resultsHeading || "Browse cars";

  return (
    <>
      <div className="flat-filter-search mt--3">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="flat-tabs">
                <FlatFilter3
                  clearFilter={clearFilter}
                  allProps={allProps}
                  filterOptions={filterOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="tf-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="heading-section">
                <HeadingTag>{headingText}</HeadingTag>
              </div>
              <ResultsToolbar
                resultCount={sorted.length}
                appliedCount={appliedCount}
                sortingOption={sortingOption}
                setSortingOption={allProps.setSortingOption}
                itemPerPage={itemPerPage}
                setItemPerPage={allProps.setItemPerPage}
                className="mt-18"
              />
              <FilterChips
                allProps={allProps}
                clearFilter={clearFilter}
                className="mb-4"
              />
            </div>
            {/* The target FlatFilter3's "Find cars" scrolls to. tabIndex={-1}
                makes it programmatically focusable without adding a tab stop,
                so focus lands here rather than staying in the filter panel. */}
            <div className="col-lg-12" id="browse-results" tabIndex={-1}>
              {sorted.length ? (
                <div className="asq-results asq-results--grid list-car-grid-4 gap-30">
                  {pageItems.map((car) => (
                    <ListingCard
                      key={car.id}
                      car={car}
                      variant="grid"
                      // Four-up on a wide desktop, one-up on a phone: without
                      // this every card ships a desktop-width image to a
                      // ~360px viewport, on metered data.
                      sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 25vw"
                    />
                  ))}
                </div>
              ) : (
                <EmptyResults
                  source={source}
                  allProps={allProps}
                  clearFilter={clearFilter}
                />
              )}
              <ListingPagination
                currentPage={currentPage}
                setPage={allProps.setCurrentPage}
                itemLength={sorted.length}
                itemPerPage={itemPerPage}
                className="pagination-style1 center mt-40"
              />
            </div>
          </div>
        </div>
      </section>

      <FilterSidebar
        allProps={allProps}
        clearFilter={clearFilter}
        filterOptions={filterOptions}
        source={source}
        resultCount={sorted.length}
      />
    </>
  );
}
