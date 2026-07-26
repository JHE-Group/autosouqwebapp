"use client";

import { useLocale, useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { listingPath } from "@/lib/seo";
import {
  SOLD_AS_IS,
  importOriginLabel,
} from "@/lib/listingLabels";
import EmptyState from "./EmptyState";

/**
 * The seller's listings table, shared by /dashboard and /my-listing — the two
 * screens shipped byte-identical copies of it.
 *
 * Everything it prints comes from the listing objects it is handed: the result
 * count is the array length, the summary line is the car's own spec, and the
 * price goes through formatPrice (OMR — never a bare "$"). Nothing here invents
 * a number.
 *
 * The toolbar used to be four inert controls: a search box, two date pickers
 * and a status dropdown, none of them wired to anything. The search and the
 * status filter now actually filter. The date pickers are gone — no listing
 * object carries a posting date (see formatPosted below), so a date range could
 * never have matched anything, and a filter that cannot filter is the same
 * broken promise as a link that goes nowhere.
 */
export default function ListingsTable({ listings = [], title }) {
  const tCommon = useTranslations("common");
  const t = useTranslations("dashboard.listings");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL_STATUSES);

  const statuses = useMemo(() => {
    // Offer only the statuses actually present, so the dropdown never implies
    // a state this seller's inventory does not contain.
    const present = new Set(
      listings.map((listing) => statusLabel(listing)).filter(Boolean),
    );
    return [ALL_STATUSES, ...Array.from(present)];
  }, [listings]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (status !== ALL_STATUSES && statusLabel(listing) !== status) {
        return false;
      }
      if (!needle) return true;
      return [listing.title, listing.make, listing.model, listing.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [listings, query, status]);

  if (listings.length === 0) {
    return (
      <div className="tfcl-dashboard-listing">
        {title ? <h5 className="title-dashboard-table">{title}</h5> : null}
        <EmptyState
          icon="car"
          title={t("emptyTitle")}
          body={t("emptyBody")}
          steps={[t("step1"), t("step2"), t("step3")]}
          actionHref="/add-listing"
          actionLabel={t("emptyAction")}
          secondaryHref="/used-cars"
          secondaryLabel={t("emptySecondary")}
        />
      </div>
    );
  }

  return (
    <div className="tfcl-dashboard-listing">
      {title ? <h5 className="title-dashboard-table">{title}</h5> : null}

      <div className="tfcl-listing-toolbar">
        <div className="group-input-icon search">
          <label className="visually-hidden" htmlFor="title_search">
            Search your listings
          </label>
          <input
            type="search"
            name="title_search"
            id="title_search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your listings…"
          />
          <span className="datepicker-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M15.7506 15.7506L11.8528 11.8528M11.8528 11.8528C12.9078 10.7979 13.5004 9.36711 13.5004 7.87521C13.5004 6.38331 12.9078 4.95252 11.8528 3.89759C10.7979 2.84265 9.36711 2.25 7.87521 2.25C6.38331 2.25 4.95252 2.84265 3.89759 3.89759C2.84265 4.95252 2.25 6.38331 2.25 7.87521C2.25 9.36711 2.84265 10.7979 3.89759 11.8528C4.95252 12.9078 6.38331 13.5004 7.87521 13.5004C9.36711 13.5004 10.7979 12.9078 11.8528 11.8528Z"
                stroke="#B6B6B6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <div className="tfcl-listing-toolbar__status">
          <label className="visually-hidden" htmlFor="status_filter">
            Filter by status
          </label>
          {/* A native <select>, not the theme's div-based nice-select: on a
              budget Android this opens the OS picker, which is a bigger, more
              reliable target than a custom dropdown list. */}
          <select
            id="status_filter"
            className="form-control"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tfcl-table-listing">
        <div className="table-responsive">
          <span className="result-text" aria-live="polite">
            <b>{filtered.length}</b>{" "}
            {filtered.length === 1 ? "listing" : "listings"}
            {filtered.length !== listings.length
              ? ` of ${listings.length}`
              : ""}
          </span>
          <table className="table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="tfcl-table-content">
              {filtered.map((elm, i) => (
                <tr key={elm.id ?? i}>
                  <td className="column-listing" data-label="Listing">
                    <div className="tfcl-listing-product">
                      <Link href={listingPath(elm)}>
                        <Image
                          alt={elm.title ?? "listing photo"}
                          src={elm.imgSrc}
                          width={168}
                          height={95}
                        />
                      </Link>
                      <div className="tfcl-listing-summary">
                        <h4 className="tfcl-listing-title">
                          <Link href={listingPath(elm)}>
                            {elm.title}
                          </Link>
                        </h4>
                        <div className="features-text">{summarise(elm)}</div>
                        <ListingLabels listing={elm} />
                        <div className="price">
                          <div className="inner tfcl-listing-price">
                            {formatPrice(elm.price, elm.currency, locale)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="column-status" data-label="Status">
                    <StatusPill listing={elm} />
                  </td>
                  <td className="column-date" data-label="Posted">
                    <div className="tfcl-listing-date">{formatPosted(elm)}</div>
                  </td>
                  <td className="column-controller" data-label="Action">
                    <div className="inner-controller">
                      <Link
                        href={listingPath(elm)}
                        className="btn-action"
                      >
                        View listing
                      </Link>
                    </div>
                    {/*
                      No edit / mark-sold / delete endpoint exists. These were
                      <a href="#"> — links that look live and do nothing, which
                      on a trust-led site is worse than an absence. Disabled
                      controls with a stated reason at least tell the seller
                      where they stand.
                    */}
                    <div className="inner-controller">
                      <button type="button" className="btn-action" disabled>
                        Edit
                      </button>
                    </div>
                    <div className="inner-controller">
                      <button type="button" className="btn-action" disabled>
                        Mark sold
                      </button>
                    </div>
                    <p className="btn-action-note">
                      Editing and marking sold are not switched on yet.
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="tfcl-table-noresult" role="status">
              None of your listings match that. Clear the search or choose “
              {ALL_STATUSES}”.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const ALL_STATUSES = "All statuses";

/**
 * The template printed "1st owned, automatic transmission, Apple Carplay…"
 * under every single car regardless of what the car actually was. Build the
 * line from the listing's own fields instead, and print only the fields it has.
 */
function summarise(listing) {
  const parts = [
    listing.year,
    listing.transmission,
    listing.fuelType,
    // km, not miles — Oman measures distance in kilometres.
    Number.isFinite(listing.km)
      ? `${listing.km.toLocaleString("en-US")} km`
      : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No specification given";
}

/**
 * Four states, four colours, no red.
 *
 * The theme's palette failed on two of the three it had: "publish" was #7ED321
 * on a 10% tint of itself, which computes to 1.76:1 and is unreadable, and
 * "sold" was #6E55FF on its own tint at 4.18:1, under AA. Amber is reserved for
 * the sold-as-is label — a car in the 1,000–1,499 band, where the label
 * describes the terms of sale and never a fault — so "pending review" takes
 * brand indigo instead of a second amber, and there is no colour collision
 * between "we are still checking this" and "this is sold as-is".
 */
function statusKey(listing) {
  const status = listing.status;
  if (status === "Approved" || status === "Live") return "live";
  if (status === "Sold") return "sold";
  if (status === "Pending") return "pending";
  return status ? "pending" : "unknown";
}

function statusLabel(listing) {
  const key = statusKey(listing);
  if (key === "live") return "Live";
  if (key === "sold") return "Sold";
  if (key === "pending") return "Pending review";
  return null;
}

function StatusPill({ listing }) {
  const key = statusKey(listing);
  const label = statusLabel(listing);
  if (!label) return <span className="tfcl-listing-date">—</span>;
  return (
    <span className={`tfcl-pill tfcl-pill--${key}`}>
      <span className="tfcl-pill__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

/**
 * No listing object carries a posting date yet — the demo data has no such key
 * and the CMS `createdAt` is not plumbed through. Print an em dash rather than
 * the template's hardcoded "March 22, 2023" on every row.
 */
function formatPosted(listing) {
  const raw = listing.postedDate ?? listing.createdAt;
  if (!raw) return "—";
  const date = new Date(raw);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/**
 * The two niche-critical signals, shown to the seller exactly as the buyer sees
 * them: whether the listing carries the "sold as-is" label (derived from price
 * by the CMS, never chosen) and which spec the car is. Rendered only when the
 * listing actually carries the field.
 */
function ListingLabels({ listing }) {
  const tCommon = useTranslations("common");
  const hasSpec = "importOrigin" in listing;
  if (!listing.soldAsIs && !hasSpec) return null;
  const spec = hasSpec ? importOriginLabel(listing.importOrigin, "en") : null;
  return (
    <div className="tfcl-pill-row">
      {listing.soldAsIs ? (
        <span className="tfcl-pill tfcl-pill--as-is">{tCommon("soldAsIs")}</span>
      ) : null}
      {spec ? (
        <span
          className={`tfcl-pill ${
            spec.stated ? "tfcl-pill--spec" : "tfcl-pill--unstated"
          }`}
        >
          {spec.text}
        </span>
      ) : null}
    </div>
  );
}
