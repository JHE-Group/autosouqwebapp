"use client";

import { useLocale, useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { foldDigits, formatPrice } from "@/lib/format";
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
export default function ListingsTable({ listings = [], title, loaded = true }) {
  const tCommon = useTranslations("common");
  const t = useTranslations("dashboard.listings");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState(ALL_STATUSES);
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  /**
   * Reprice. The only edit there is, and deliberately so.
   *
   * Description and photos are not editable here because the seller endpoint
   * does not return them — SELLER_LISTING_FIELDS carries price, title, year and
   * mileage, not the prose — so a form for them would have nothing to prefill
   * and would silently blank whatever it did not know. Repricing is also the
   * edit sellers actually want: a car that has sat for three weeks needs a new
   * number, not new adjectives.
   *
   * The change lands on the DRAFT. If the listing is live, buyers keep seeing
   * the approved price until a moderator looks at the new one — which the note
   * beside this says out loud, because a seller who thinks they have just cut
   * their price and has not is worse off than one who knows they are waiting.
   */
  const savePrice = async (listing) => {
    const documentId = listing?.documentId;
    if (!documentId || busy) return;
    setBusy(documentId);
    setActionError(null);
    try {
      const res = await fetch(`/api/listings/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: editPrice }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) {
        setActionError(data?.code ?? "failed");
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setActionError("unavailable");
    } finally {
      setBusy(null);
    }
  };

  /**
   * Mark sold / reserved, or take the car down.
   *
   * `router.refresh()` rather than local state: the rows are fetched on the
   * server by the page, so re-reading them is the only way this table and the
   * public site agree afterwards. Optimistically flipping a row here would show
   * the seller "Sold" while the live listing still said available, which is
   * precisely the lie this whole endpoint exists to prevent.
   */
  const setStatus = async (listing, change) => {
    const documentId = listing?.documentId;
    if (!documentId || busy) return;
    setBusy(documentId);
    setActionError(null);
    try {
      const res = await fetch(`/api/listings/${documentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) {
        setActionError(data?.code ?? "failed");
        return;
      }
      router.refresh();
    } catch {
      setActionError("unavailable");
    } finally {
      setBusy(null);
    }
  };

  /**
   * Keys, not labels.
   *
   * This collected `statusLabel(listing)` — the rendered English string — and
   * used it as the <option> value, the state, and the comparison target below.
   * Translating the label in place would then have filtered nothing: the
   * option would read «منشور» while the comparison still tested for "Live". The
   * key/label split has to ship in the same change as the translation.
   */
  const statuses = useMemo(() => {
    // Offer only the statuses actually present, so the dropdown never implies
    // a state this seller's inventory does not contain.
    const present = new Set(
      listings
        .map((listing) => statusKey(listing))
        .filter((key) => key !== "unknown"),
    );
    return [ALL_STATUSES, ...Array.from(present)];
  }, [listings]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (status !== ALL_STATUSES && statusKey(listing) !== status) {
        return false;
      }
      if (!needle) return true;
      return [listing.title, listing.make, listing.model, listing.location]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [listings, query, status]);

  /*
   * An empty list and a failed load are different facts and used to render the
   * same screen. getMyListings returned [] for "no cars", for a CMS error and
   * for a thrown fetch alike, so during a Strapi outage a seller with three
   * listings was told "No listings yet" over a button inviting them to add
   * their first — which reads as their cars having been deleted, and invites a
   * duplicate.
   */
  if (!loaded) {
    return (
      <div className="tfcl-dashboard-listing">
        {title ? <h5 className="title-dashboard-table">{title}</h5> : null}
        <p className="tfcl-amber" role="alert">
          {t("loadFailed")}
        </p>
      </div>
    );
  }

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
            {t("searchLabel")}
          </label>
          <input
            type="search"
            name="title_search"
            id="title_search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
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
            {t("statusFilterLabel")}
          </label>
          {/* A native <select>, not the theme's div-based nice-select: on a
              budget Android this opens the OS picker, which is a bigger, more
              reliable target than a custom dropdown list. */}
          <select
            id="status_filter"
            className="form-control"
            value={status}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statuses.map((key) => (
              <option key={key} value={key}>
                {key === ALL_STATUSES
                  ? t("allStatuses")
                  : statusLabel(key, t, tCommon)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tfcl-table-listing">
        <div className="table-responsive">
          <span className="result-text" aria-live="polite">
            {filtered.length === listings.length
              ? t("results", { count: filtered.length })
              : t("resultsOfTotal", {
                  count: filtered.length,
                  total: listings.length,
                })}
          </span>
          <table className="table">
            <thead>
              <tr>
                <th>{t("colListing")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colPosted")}</th>
                <th>{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="tfcl-table-content">
              {filtered.map((elm, i) => (
                <tr key={elm.id ?? i}>
                  <td className="column-listing" data-label={t("colListing")}>
                    <div className="tfcl-listing-product">
                      <Link href={listingPath(elm)}>
                        <Image
                          alt={elm.title ?? t("photoAlt")}
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
                        <div className="features-text">{summarise(elm, t)}</div>
                        <ListingLabels listing={elm} />
                        <div className="price">
                          <div className="inner tfcl-listing-price">
                            {formatPrice(elm.price, elm.currency, locale)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="column-status" data-label={t("colStatus")}>
                    <StatusPill listing={elm} t={t} tCommon={tCommon} />
                  </td>
                  <td className="column-date" data-label={t("colPosted")}>
                    <div className="tfcl-listing-date">{formatPosted(elm, locale)}</div>
                  </td>
                  <td className="column-controller" data-label={t("colAction")}>
                    <div className="inner-controller">
                      <Link
                        href={listingPath(elm)}
                        className="btn-action"
                      >
                        {t("viewListing")}
                      </Link>
                    </div>
                    {/*
                      Edit stays disabled: changing price, description or photos
                      re-enters review and there is no editor for it yet. Mark
                      sold and Take down are live — they only ever reduce what a
                      listing claims, which is why they are allowed to skip
                      review. See app/api/listings/[id]/status.
                    */}
                    <div className="inner-controller">
                      {editing === elm.documentId ? (
                        <span className="tfcl-reprice">
                          <label
                            className="visually-hidden"
                            htmlFor={`price_${elm.documentId}`}
                          >
                            {t("newPrice")}
                          </label>
                          <input
                            id={`price_${elm.documentId}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9٠-٩۰-۹]*"
                            className="form-control"
                            value={editPrice}
                            onChange={(e) => setEditPrice(foldDigits(e.target.value))}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn-action"
                            onClick={() => savePrice(elm)}
                            disabled={busy === elm.documentId || !editPrice}
                          >
                            {t("save")}
                          </button>
                          <button
                            type="button"
                            className="btn-action"
                            onClick={() => setEditing(null)}
                          >
                            {t("cancel")}
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => {
                            setEditing(elm.documentId);
                            setEditPrice(String(elm.price ?? ""));
                            setActionError(null);
                          }}
                        >
                          {t("reprice")}
                        </button>
                      )}
                    </div>
                    {statusKey(elm) !== "sold" ? (
                      <div className="inner-controller">
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => setStatus(elm, { listingStatus: "sold" })}
                          disabled={busy === elm.documentId}
                        >
                          {t("markSold")}
                        </button>
                      </div>
                    ) : null}
                    {statusKey(elm) === "live" ? (
                      <div className="inner-controller">
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() => setStatus(elm, { takeDown: true })}
                          disabled={busy === elm.documentId}
                        >
                          {t("takeDown")}
                        </button>
                      </div>
                    ) : null}
                    {/* A pending listing has no public page — it is a draft,
                        by design, until a moderator publishes it. Linking to
                        one sent the seller to a 404 on their own car. */}
                    <div className="inner-controller">
                      {statusKey(elm) === "pending" ? (
                        <span className="btn-action-note">
                          {t("notPublicYet")}
                        </span>
                      ) : (
                        <Link href={listingPath(elm)} className="btn-action">
                          {t("viewListing")}
                        </Link>
                      )}
                    </div>
                    {statusKey(elm) === "declined" ? (
                      /* The reason, where the seller is already looking at the
                         car it belongs to. A decision with no explanation is
                         the same dead end as no decision at all. */
                      <p className="tfcl-amber" role="note">
                        {elm.moderationNote || t("declinedNoReason")}
                      </p>
                    ) : null}
                    <p className="btn-action-note">
                      {statusKey(elm) === "live"
                        ? t("repriceLiveNote")
                        : t("repriceNote")}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {actionError ? (
            <p className="tfcl-amber" role="alert">
              {t(
                `actionError.${actionError === "not_found" ? "notFound" : actionError === "unavailable" ? "unavailable" : "failed"}`,
              )}
            </p>
          ) : null}
          {filtered.length === 0 ? (
            <p className="tfcl-table-noresult" role="status">
              {t("noMatch", { status: t("allStatuses") })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Sentinel key, never rendered — t("allStatuses") is what the seller reads. */
const ALL_STATUSES = "all";

/**
 * The template printed "1st owned, automatic transmission, Apple Carplay…"
 * under every single car regardless of what the car actually was. Build the
 * line from the listing's own fields instead, and print only the fields it has.
 */
function summarise(listing, t) {
  const parts = [
    listing.year,
    listing.transmission,
    listing.fuelType,
    // km, not miles — Oman measures distance in kilometres.
    Number.isFinite(listing.km)
      ? `${listing.km.toLocaleString("en-US")} km`
      : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : t("noSpec");
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
  if (status === "Declined") return "declined";
  return status ? "pending" : "unknown";
}
/**
 * Display only, and it takes a KEY rather than a listing — the dropdown
 * already holds a key and should not have to invent a listing to get a label.
 *
 * "Sold" reuses common.sold, which ListingSignals already shows the buyer. The
 * seller was reading English for the same fact the buyer read in Arabic.
 */
function statusLabel(key, t, tCommon) {
  if (key === "live") return t("statusLive");
  if (key === "sold") return tCommon("sold");
  if (key === "pending") return t("statusPending");
  if (key === "declined") return t("statusDeclined");
  return null;
}

function StatusPill({ listing, t, tCommon }) {
  const key = statusKey(listing);
  const label = statusLabel(key, t, tCommon);
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
function formatPosted(listing, locale = "en") {
  const raw = listing.postedDate ?? listing.createdAt;
  if (!raw) return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "—";
  /**
   * `ar-OM-u-nu-latn`, matching formatGuideDate/formatBlogDate elsewhere.
   *
   * Was hardcoded "en-GB", so an Arabic table showed "Mar"/"Sep". The `-u-nu-latn`
   * extension is the load-bearing part: plain `ar-OM` would switch the day and
   * year to Arabic-Indic digits (٢٠٢٦), and lib/format.js keeps every numeral on
   * this site Latin so a date never disagrees with the price beside it.
   */
  return date.toLocaleDateString(
    locale === "ar" ? "ar-OM-u-nu-latn" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

/**
 * The two niche-critical signals, shown to the seller exactly as the buyer sees
 * them: whether the listing carries the "sold as-is" label (derived from price
 * by the CMS, never chosen) and which spec the car is. Rendered only when the
 * listing actually carries the field.
 */
function ListingLabels({ listing }) {
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const hasSpec = "importOrigin" in listing;
  if (!listing.soldAsIs && !hasSpec) return null;
  // Was hardcoded "en": /ar showed the seller "GCC spec" for the same car the
  // buyer-facing card correctly labels "خليجي" — the same fact, two languages,
  // two screens of the same product.
  const spec = hasSpec ? importOriginLabel(listing.importOrigin, locale) : null;
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
