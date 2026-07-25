"use client";

import React from "react";

/**
 * Results pagination.
 *
 * Rewritten from the template's version, which had four faults that compounded:
 *
 * 1. The controls were `<li onClick>` wrapping an `<a>` with no `href`. Neither
 *    element is focusable without one, so the entire pager was unreachable by
 *    keyboard and invisible to a screen reader as a control. They are `<button>`
 *    now — the element that already means "does something on this page".
 * 2. The prev/next arrows were `<i className="far fa-angle-left">`. Font Awesome
 *    is never imported (style.scss loads bootstrap, swiper, nice-select and the
 *    `autodeal` icon font, not that sheet), so both arrows rendered as blank
 *    boxes. They are inline SVG now, and mirrored under dir="rtl" — "previous"
 *    points towards the start of the line, which is the right edge in Arabic.
 * 3. Prev at page 1 and next at the last page stayed fully styled and clickable;
 *    the click was swallowed silently. They are `disabled` now, so the control
 *    tells you where you are instead of pretending to move.
 * 4. Nothing carried `aria-current`, so a screen reader read the page list as
 *    seven identical links.
 */

function Chevron({ back = false }) {
  return (
    <svg
      className={`pagination-chevron${back ? " pagination-chevron--back" : ""}`}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={back ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pagination({
  itemLength = 200,
  itemPerPage = 10,
  setPage = () => {},
  currentPage = 1,
  labels,
}) {
  const totalPages = Math.ceil(itemLength / itemPerPage);
  if (totalPages <= 1) return null;

  // Bilingual by default so the pager is never a row of untranslated English
  // inside dir="rtl". A caller with next-intl messages to hand can override.
  const t = {
    previous: "Previous page",
    next: "Next page",
    page: (n) => `Page ${n}`,
    current: (n) => `Page ${n}, current page`,
    ...labels,
  };

  const go = (page) => {
    if (page >= 1 && page <= totalPages) setPage(page);
  };

  // Which numbers to show: the first four, then the current one once it has
  // moved past them, then an ellipsis while there is still more to come.
  const leading = Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1);
  const showCurrent = currentPage > 4;
  const showEllipsis = totalPages > 4 && currentPage !== totalPages;

  return (
    <React.Fragment>
      <li>
        <button
          type="button"
          className="page-numbers style"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label={t.previous}
        >
          <Chevron back />
        </button>
      </li>

      {leading.map((page) => (
        <li key={page}>
          <button
            type="button"
            className={`page-numbers ${currentPage === page ? "current" : ""}`}
            onClick={() => go(page)}
            aria-label={currentPage === page ? t.current(page) : t.page(page)}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        </li>
      ))}

      {showCurrent && (
        <li>
          <button
            type="button"
            className="page-numbers current"
            aria-label={t.current(currentPage)}
            aria-current="page"
          >
            {currentPage}
          </button>
        </li>
      )}

      {showEllipsis && (
        <li aria-hidden="true">
          <span className="page-numbers dot">…</span>
        </li>
      )}

      <li>
        <button
          type="button"
          className="page-numbers style"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label={t.next}
        >
          <Chevron />
        </button>
      </li>
    </React.Fragment>
  );
}
