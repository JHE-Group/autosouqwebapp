"use client";

import FlatFilter3 from "../common/FlatFilter3";
import EmptyResults from "./EmptyResults";
import FilterChips from "./FilterChips";
import FilterSidebar from "./FilterSidebar";
import ListingCard from "./ListingCard";
import ListingPagination from "./ListingPagination";
import ResultsToolbar from "./ResultsToolbar";
import useCarFilters from "./useCarFilters";

/**
 * The canonical browse grid.
 *
 * `FlatFilter3` is a wide hero filter that collapses out of the way on a phone,
 * which left the mobile visitor here with no filter at all — so the offcanvas
 * panel the other layouts already had is now rendered here too, reached from
 * the toolbar trigger with its applied count.
 */
export default function Cars2({ listings }) {
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
  } = useCarFilters(listings, { pageSize: 12 });

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
                <h1>Browse cars</h1>
                {/* A statement about this search, not about the business. An
                    inventory count is a confidence signal only when the number
                    is large; ours is not yet, so it stays off the button and
                    off the home page and lives in the toolbar only. */}
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
            <div className="col-lg-12">
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
