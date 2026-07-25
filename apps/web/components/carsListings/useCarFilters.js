"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { allCars } from "@/data/cars";
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
 */
export default function useCarFilters(listings, { pageSize = 6, defaultGrid = false } = {}) {
  // Strapi listings when the CMS has them, the theme demo data otherwise.
  const source = useMemo(() => (listings?.length ? listings : allCars), [listings]);
  const filterOptions = useMemo(() => buildFilterOptions(source), [source]);

  const [state, dispatch] = useReducer(reducer, source, (cars) => ({
    ...createInitialState(cars),
    itemPerPage: pageSize,
  }));

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
    if (sortingOption === "Price Ascending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => a.price - b.price),
      });
    } else if (sortingOption === "Price Descending") {
      dispatch({
        type: "SET_SORTED",
        payload: [...filtered].sort((a, b) => b.price - a.price),
      });
    } else {
      dispatch({ type: "SET_SORTED", payload: filtered });
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
