"use client";

import EmptyResults from "./EmptyResults";
import FilterChips from "./FilterChips";
import FilterSidebar from "./FilterSidebar";
import ListingCard from "./ListingCard";
import ListingMap from "./ListingMap";
import ListingPagination from "./ListingPagination";
import ResultsToolbar from "./ResultsToolbar";
import useCarFilters from "./useCarFilters";

/**
 * Browse with a sticky map beside the results.
 *
 * The per-card Swiper carousel is gone. It was fed `[car.imgSrc, car.imgSrc,
 * car.imgSrc]` until recently — one photo presented as three — and once that
 * was corrected it was a full carousel library instantiated once per card to
 * show, for almost every listing in this catalogue, a single image. On a budget
 * Android over metered data that is a real cost for no information. The photo
 * count badge on the card says how many there are; the detail page gallery
 * shows them.
 */
export default function Cars4({ listings }) {
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
  } = useCarFilters(listings, { pageSize: 4, defaultGrid: true });

  return (
    <>
      <div className="wrap-map flat-featured listing-grid style flex listing-wrap-map">
        <div className="content-left wg-dream sidebar-left-listing listing-list-car-wrap">
          <div className="asq-maphead">
            <h1 className="heading-listing">Used cars for sale</h1>
          </div>
          <ResultsToolbar
            resultCount={sorted.length}
            appliedCount={appliedCount}
            isGrid={isGrid}
            setIsGrid={setIsGrid}
            sortingOption={sortingOption}
            setSortingOption={allProps.setSortingOption}
            showPageSize={false}
          />
          <FilterChips
            allProps={allProps}
            clearFilter={clearFilter}
            className="mb-20"
          />
          {sorted.length ? (
            <div
              className={`asq-results list-car-1 list-car-list-1 map-listing-car ${
                isGrid ? "asq-results--grid list-car-grid-1" : "asq-results--list"
              }`}
            >
              {pageItems.map((car) => (
                <ListingCard
                  key={car.id}
                  car={car}
                  variant={isGrid ? "grid" : "list"}
                  sizes="(max-width: 991px) 100vw, 40vw"
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
        <div className="content-right fixed-space po-sticky">
          <div id="map" className="row-height">
            {/* The map plots the whole catalogue, not the filtered page: a map
                that empties as you filter is a map you cannot orient by. */}
            <ListingMap listings={source} />
          </div>
        </div>
      </div>

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
