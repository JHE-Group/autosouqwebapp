"use client";

import FilterChips from "./FilterChips";
import EmptyResults from "./EmptyResults";
import FilterRail from "./FilterRail";
import FilterSidebar from "./FilterSidebar";
import ListingCard from "./ListingCard";
import ListingPagination from "./ListingPagination";
import ResultsToolbar from "./ResultsToolbar";
import useCarFilters from "./useCarFilters";

/**
 * Listing list/grid with a desktop filter rail.
 *
 * The filter rail, the card, the toolbar and the pager were all inlined here
 * and separately in Cars3–Cars5; they are shared components now. What was lost
 * in the process, deliberately: a hand-written rail still offering the theme's
 * demo makes ("Audi / Dongfeng / BMW") and cities ("London / New York /
 * Paris"), and a kilometre slider wired to the price bounds.
 */
export default function Cars1({ listings }) {
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
  } = useCarFilters(listings, { pageSize: 6 });

  return (
    <>
      <section className="listing-grid tf-section3">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="heading-section">
                {/* Was "10,000+ Get The Best Deals On Used Cars" over a
                    catalogue of about ten, naming Mercedes — a marque that
                    does not exist in this price band. An inventory claim we
                    cannot back is the first thing that makes a marketplace
                    read as fake. */}
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
                  <div className="col-lg-12 listing-list-car-wrap">
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
                                ? "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
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
