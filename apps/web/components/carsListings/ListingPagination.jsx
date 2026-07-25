"use client";

import Pagination from "../common/Pagination";
import { useTranslations } from "next-intl";

/**
 * Pagination, or nothing at all.
 *
 * `Pagination` already returns null on a single page, but every Cars* file
 * wrapped it in `<div class="themesflat-pagination mt-40"><ul>` regardless — so
 * a ten-listing catalogue rendered a 40px empty bar under the grid on every
 * page. At launch scale that is the normal case, not the edge case, and a
 * navigation control that is present but empty is exactly the kind of small
 * seam that makes a site read as an unfinished template.
 */
export default function ListingPagination({
  currentPage,
  setPage,
  itemLength = 0,
  itemPerPage = 6,
  className = "mt-40",
}) {
  const t = useTranslations("browse.toolbar");
  if (!itemPerPage || Math.ceil(itemLength / itemPerPage) <= 1) return null;

  return (
    <nav
      className={`themesflat-pagination clearfix ${className}`.trim()}
      aria-label={t("pages")}
    >
      <ul>
        <Pagination
          currentPage={currentPage}
          setPage={setPage}
          itemLength={itemLength}
          itemPerPage={itemPerPage}
        />
      </ul>
    </nav>
  );
}
