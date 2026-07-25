"use client";

import EmptyResults from "./EmptyResults";
import FilterChips from "./FilterChips";
import FilterRail from "./FilterRail";
import FilterSidebar from "./FilterSidebar";
import ListingCard from "./ListingCard";
import ListingPagination from "./ListingPagination";
import ResultsToolbar from "./ResultsToolbar";
import useCarFilters from "./useCarFilters";

/**
 * Wide browse grid — same system as Cars1, four columns instead of three.
 *
 * Removed on the way through: a tab strip reading "All car / Used car". Neither
 * tab was wired to anything, and on a site that lists only used cars in one
 * price band the distinction it implied does not exist. A control that looks
 * like a filter and filters nothing is the cheapest way to lose a visitor's
 * trust in every other control on the page.
 */
export default function Cars3({ listings }) {
  const {
    source,
    filterOptions,
    allProps,
    clearFilter,
    appliedCount,
    isGrid,
    setIsGrid,
    sorted,
    pageItems,
    currentPage,
    itemPerPage,
    sortingOption,
  } = useCarFilters(listings, { pageSize: 12, defaultGrid: true });

  return (
    <>
      <section className="listing-grid tf-section3">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="heading-section">
                <h1>Browse cars</h1>
                <p className="mt-20">
                  Affordable used cars in Oman, OMR 1,500 – 6,000. Every listing
                  shows whether the car is GCC spec or an import, and whether we
                  have checked it.
                </p>
              </div>
            </div>
            <div className="col-lg-12 flex gap-30 text-start">
              <FilterRail
                allProps={allProps}
                clearFilter={clearFilter}
                filterOptions={filterOptions}
                source={source}
              />
              <div className="sidebar-left-listing">
                <div className="row">
                  <div className="col-lg-12 listing-list-car-wrap listing-grid-car-wrap">
                    <ResultsToolbar
                      resultCount={sorted.length}
                      appliedCount={appliedCount}
                      isGrid={isGrid}
                      setIsGrid={setIsGrid}
                      sortingOption={sortingOption}
                      setSortingOption={allProps.setSortingOption}
                      itemPerPage={itemPerPage}
                      setItemPerPage={allProps.setItemPerPage}
                      filterTriggerMobileOnly
                    />
                    <FilterChips
                      allProps={allProps}
                      clearFilter={clearFilter}
                      className="mb-30"
                    />
                    {sorted.length ? (
                      <div
                        className={`asq-results list-car-list-1 ${
                          isGrid ? "asq-results--grid list-car-grid-1" : "asq-results--list"
                        }`}
                      >
                        {pageItems.map((car) => (
                          <ListingCard
                            key={car.id}
                            car={car}
                            variant={isGrid ? "grid" : "list"}
                            sizes={
                              isGrid
                                ? "(max-width: 767px) 100vw, (max-width: 991px) 50vw, 25vw"
                                : "(max-width: 767px) 100vw, 300px"
                            }
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
                    />
                  </div>
                </div>
              </div>
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
