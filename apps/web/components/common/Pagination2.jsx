"use client";

import { useState } from "react";
import Pagination from "./Pagination";

/**
 * Self-contained pager for the dashboard tables.
 *
 * This was a line-for-line copy of `Pagination` with one extra class name and
 * the page state held internally, which meant every fix had to be made twice —
 * and in practice wasn't: both carried the same unreachable `<li onClick>`
 * controls and the same blank-box Font Awesome arrows. It now delegates, so
 * `Pagination` is the single place any of that is defined.
 *
 * NOTE — this pager does not filter anything. It holds a page number and
 * nothing reads it: `ListingsTable` and `MyFavourite` render their full array
 * regardless of which number is highlighted. That is honest only while those
 * views are showing a fixed stand-in slice; the moment they hold a real
 * seller's listings, `onPageChange` needs to be wired to the array they slice,
 * or the pager needs to come out. It is left visible rather than silently
 * removed because the dashboard's own comments already flag the same gap.
 */
export default function Pagination2({
  itemLength = 100,
  itemPerPage = 10,
  onPageChange,
  labels,
}) {
  const [currentPage, setPage] = useState(1);

  return (
    <Pagination
      itemLength={itemLength}
      itemPerPage={itemPerPage}
      currentPage={currentPage}
      setPage={(page) => {
        setPage(page);
        onPageChange?.(page);
      }}
      labels={labels}
    />
  );
}
