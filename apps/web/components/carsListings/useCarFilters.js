"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { parsePriceParam } from "@/data/budgetBands";
import { createInitialState, reducer } from "@/reducer/carFilterReducer";
import { buildFilterOptions } from "@/lib/carOptions";
import { activeFilterCount, applyFilters } from "./filterLogic";

/**
 * The filtering, sorting and paging behind every listing view.
 *
 * This was ~130 lines pasted into each of Cars1–Cars5, and three of the five
 * copies still ran the theme's original hand-rolled filter chain while Cars2
 * had been moved onto `filterLogic`. Two implementations of "does this car
 * match" is not a tidiness problem: the zero-result screen labels its relaxed
 * matches "everything except city", and that label is only true if it is asking
 * the same question the grid asked.
 *
 * @param {object[]} listings Strapi listings; the demo catalogue when empty.
 * @param {number}   pageSize how many cards a page holds in this layout.
 * @param {boolean} [readPriceFromUrl] apply `?price=min-max` after hydration.
 *
 *   Read from `window.location` in an effect rather than with
 *   `useSearchParams()`, and that choice is the whole point. Two earlier
 *   attempts were wrong in instructive ways:
 *
 *   1. Calling `useSearchParams()` inside this hook opted **all five** layouts
 *      that share it into client rendering — hooks cannot be conditional, so a
 *      flag does not help. The build caught it, failing to prerender
 *      `/[locale]/listing-grid-map`.
 *   2. Moving the call into Cars2 and wrapping it in `<Suspense>` fixed that
 *      but relocated the damage: `useSearchParams()` forces its subtree to
 *      client-render during static generation, so `/used-cars` and every facet
 *      shipped a skeleton and **zero crawlable listing links** in their server
 *      HTML. Measured — 0, against 6 on the homepage, which has no boundary.
 *      On the site's main commercial page, whose internal links are how a
 *      crawler reaches the listings, that is a bad trade.
 *
 *   Reading after hydration keeps the grid server-rendered and crawlable. The
 *   cost is honest and small: a buyer arriving from a budget link sees the full
 *   grid for one frame before it narrows. Better a brief flash for one entry
 *   path than an uncrawlable results page for everyone.
 */
export default function useCarFilters(
  listings,
  { pageSize = 6, defaultGrid = false, readPriceFromUrl = false } = {},
) {
  /**
   * Trust what the server handed down. No demo fallback here.
   *
   * This used to substitute `allCars` whenever `listings` was empty, which
   * silently overrode the server's decision: lib/listingSource.js stops serving
   * the demo catalogue in production, and this line put it straight back. The
   * result was a live site rendering twelve cars that do not exist while the
   * server believed it had rendered an empty state.
   *
   * One place decides whether demo data is allowed, and it is the server.
   */
  const source = useMemo(() => listings ?? [], [listings]);
  const filterOptions = useMemo(() => buildFilterOptions(source), [source]);

  const [state, dispatch] = useReducer(reducer, source, (cars) => ({
    ...createInitialState(cars),
    itemPerPage: pageSize,
  }));

  // Apply `?price=` once, on mount. `window` rather than `useSearchParams` for
  // the reason set out above; the empty dep array is deliberate, since this
  // seeds an initial value and must not fight the user's own slider afterwards.
  useEffect(() => {
    if (!readPriceFromUrl || typeof window === "undefined") return;
    const parsed = parsePriceParam(
      new URLSearchParams(window.location.search).get("price"),
    );
    if (parsed) dispatch({ type: "SET_PRICE", payload: parsed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isGrid, setIsGrid] = useState(defaultGrid);

  const {
    price,
    km,
    year,
    body,
    make,
    model,
    fuel,
    transmission,
    location,
    door,
    cylinder,
    color,
    features,
    filtered,
    sortingOption,
    sorted,
    currentPage,
    itemPerPage,
  } = state;

  const allProps = {
    ...state,
    setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),
    setYear: (value) => dispatch({ type: "SET_YEAR", payload: value }),
    setModel: (value) => dispatch({ type: "SET_MODEL", payload: value }),
    setKM: (value) => dispatch({ type: "SET_KM", payload: value }),
    setBody: (value) => dispatch({ type: "SET_BODY", payload: value }),
    setMake: (value) => dispatch({ type: "SET_MAKE", payload: value }),
    setFuel: (value) => dispatch({ type: "SET_FUEL", payload: value }),
    setTransmission: (value) =>
      dispatch({ type: "SET_TRANSMISSION", payload: value }),
    setLocation: (value) => dispatch({ type: "SET_LOCATION", payload: value }),
    setDoor: (value) => dispatch({ type: "SET_DOOR", payload: value }),
    setCylinder: (value) => dispatch({ type: "SET_CYLINDER", payload: value }),
    setColor: (value) => dispatch({ type: "SET_COLOR", payload: value }),
    setFeatures: (newFeature) => {
      const updated = features.includes(newFeature)
        ? features.filter((elm) => elm !== newFeature)
        : [...features, newFeature];
      dispatch({ type: "SET_FEATURES", payload: updated });
    },
    setSortingOption: (value) =>
      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
    setCurrentPage: (value) =>
      dispatch({ type: "SET_CURRENT_PAGE", payload: value }),
    setItemPerPage: (value) => {
      dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
      dispatch({ type: "SET_ITEM_PER_PAGE", payload: value });
    },
  };

  const clearFilter = () => dispatch({ type: "CLEAR_FILTER" });

  useEffect(() => {
    dispatch({ type: "SET_FILTERED", payload: applyFilters(source, state) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    price,
    km,
    year,
    body,
    make,
    model,
    fuel,
    transmission,
    location,
    door,
    cylinder,
    color,
    features,
    source,
  ]);

  useEffect(() => {
    /*
     * Sold cars sink, in every sort order.
     *
     * They were arriving at positions 2, 3 and 4 of the default grid — the
     * second, third and fourth cars a buyer sees — with a struck-through price
     * and no way to act on them, because the source order is newest-first and
     * a sold car is often a recently-touched one. On a catalogue this small
     * that is most of the first screen spent on cars nobody can buy.
     *
     * Sunk rather than removed. A sold listing is genuine evidence that cars
     * move here, which is worth something on a new marketplace, and hiding
     * them would also make the result count disagree with the grid. They just
     * do not get the top of the page.
     *
     * `Array.prototype.sort` is stable in every engine we target, so within
     * each partition the chosen order — newest-first, or by price — is
     * preserved exactly.
     */
    const soldLast = (rows) =>
      [...rows].sort(
        (a, b) =>
          Number(a.listingStatus === "sold") - Number(b.listingStatus === "sold"),
      );

    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: soldLast([...filtered].sort((a, b) => a.price - b.price)),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: soldLast([...filtered].sort((a, b) => b.price - a.price)),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: soldLast(filtered) });
    }
    dispatch({ type: "SET_CURRENT_PAGE", payload: 1 });
  }, [filtered, sortingOption]);

  // A page that no longer exists renders an empty grid under a pager pointing
  // at it — reachable at ten listings by widening a page size while on page 2.
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(sorted.length / itemPerPage));
    if (currentPage > pages) {
      dispatch({ type: "SET_CURRENT_PAGE", payload: pages });
    }
  }, [sorted.length, itemPerPage, currentPage]);

  const pageItems = sorted.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage,
  );

  return {
    source,
    filterOptions,
    state,
    allProps,
    clearFilter,
    appliedCount: activeFilterCount(state),
    isGrid,
    setIsGrid,
    sorted,
    pageItems,
    currentPage,
    itemPerPage,
    sortingOption,
  };
}
