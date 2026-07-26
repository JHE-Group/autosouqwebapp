"use client";

import EmptyResults from "./EmptyResults";
import { listingPath } from "@/lib/seo";
import FilterChips from "./FilterChips";
import FilterSidebar from "./FilterSidebar";
import ListingCard from "./ListingCard";
import ListingMap from "./ListingMap";
import ListingPagination from "./ListingPagination";
import ResultsToolbar from "./ResultsToolbar";
import useCarFilters from "./useCarFilters";

/**
 * Browse with a sticky map, list-first.
 *
 * Identical to Cars4 apart from the default view and the detail route it links
 * to. This is the last of the five layouts that had its own copy of the card —
 * and the one that used a raw <img>, opting out of the image pipeline so it
 * shipped full-resolution source bytes to a phone.
 */
export default function Cars5({ listings }) {
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
  } = useCarFilters(listings, { pageSize: 4 });

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
                  detailHref={listingPath(car)}
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
