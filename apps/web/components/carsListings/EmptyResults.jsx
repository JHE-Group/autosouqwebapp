"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ListingSignals from "@/components/common/ListingSignals";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { formatPrice } from "@/lib/format";
import { listingPath } from "@/lib/seo";
import { buildWhatsAppUrl, WHATSAPP_BUTTON_STYLE } from "@/lib/whatsapp";
import FilterChips, { chipsFor } from "./FilterChips";
import { findRelaxedMatches } from "./filterLogic";
import { useLocale, useTranslations } from "next-intl";

/**
 * The zero-result screen.
 *
 * AutoTrader answers an empty search with "0 results" and two buttons. That is
 * right for 450,000 listings, where an empty search is almost always the
 * user's own over-filtering and "search all cars" reliably rescues them. Here
 * an empty search is usually the catalogue's fault, not the buyer's, and it is
 * the highest-intent moment on the site. So: say so honestly, show which
 * filter emptied the page and let it be removed one at a time, offer near
 * matches only when we can name exactly what we relaxed, and give the buyer
 * something to do about it.
 *
 * What is deliberately NOT here: a fabricated "we found 12 similar cars",
 * anything resembling a price estimate, and any control that does not work.
 */

// Ink #231F20 on white is 16.30:1; on cream #F1E4C5 it is 12.92:1.
const INK = "#231F20";
const CREAM = "#F1E4C5";

// The one accent tone that passes on a light surface: #BD4B2B is 4.99:1 on
// white. White on terracotta #E97451 is 2.97:1 and is never used for text.
const ACCENT_TEXT = "#BD4B2B";

const PANEL_STYLE = {
  background: "#FFFFFF",
  border: "1px solid #EDEDED",
  borderRadius: 12,
  padding: "28px 24px",
};

const RELAXED_BANNER_STYLE = {
  background: CREAM,
  color: INK,
  borderRadius: 10,
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.5,
};

/* The names of the filters we relax live in messages under `browse.field`, so
   the relaxed-search banner names the filter in the reader's own language. It
   is never relaxed silently. */

/**
 * "Tell me on WhatsApp when a car like this is listed."
 *
 * No backend exists, so this is a click-to-chat link to the Autosouq
 * operations number carrying the search the buyer just ran — the buyer starts
 * the conversation, which is both the consent and the capture. Alerts then go
 * out by hand, which is the honest scale for a ten-listing catalogue.
 *
 * When NEXT_PUBLIC_AUTOSOUQ_WHATSAPP is not set the whole control is absent.
 * A dead "notify me" button on a trust-led site is worse than no button.
 */
function AlertCapture({ chips }) {
  const t = useTranslations("browse.alert");
  const ops = process.env.NEXT_PUBLIC_AUTOSOUQ_WHATSAPP;
  const summary = chips.map((chip) => chip.text).join(" · ");

  // The WhatsApp body is composed in the reader's language: it is the message
  // they are about to send under their own name, so it must not arrive half in
  // a language they did not choose.
  const message = [
    t("greeting"),
    t("intro"),
    summary || t("anyCar"),
    "",
    t("ask"),
    t("consent"),
  ].join("\n");

  const href = buildWhatsAppUrl(ops, message);
  if (!href) return null;

  return (
    <div className="mt-4">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="d-inline-flex align-items-center justify-content-center w-100"
        style={{ ...WHATSAPP_BUTTON_STYLE, padding: "0 16px", maxWidth: 420 }}
      >
        {t("cta")}
      </a>
      <p className="fs-12 mt-2 mb-0" style={{ color: "#5C6368" }}>
        {t("note")}
      </p>
    </div>
  );
}

/**
 * A near match, rendered small on purpose. It is not what the buyer asked for,
 * so it must not be dressed as if it were.
 */
function RelaxedMatch({ car, locale }) {
  return (
    <div
      className="d-flex align-items-start gap-3 py-3"
      style={{ borderTop: "1px solid #EDEDED" }}
    >
      {car.imgSrc && (
        <Link
          href={listingPath(car)}
          style={{ flex: "0 0 96px" }}
          aria-hidden="true"
          tabIndex={-1}
        >
          <Image
            className="lazyload"
            alt=""
            src={car.imgSrc}
            width={96}
            height={72}
            sizes="96px"
            style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 8 }}
          />
        </Link>
      )}
      <div className="flex-grow-1">
        <h6 className="mb-1">
          <Link href={listingPath(car)}>{car.title}</Link>
        </h6>
        <div className="fs-14 fw-6" style={{ color: INK }}>
          {formatPrice(car.price, car.currency)}
        </div>
        <p className="fs-12 mb-1" style={{ color: "#5C6368" }}>
          {Number.isFinite(car.km) ? `${car.km.toLocaleString("en-US")} km` : "km not stated"}
          {car.transmission ? ` · ${car.transmission}` : ""}
          {car.location ? ` · ${car.location}` : ""}
        </p>
        <ListingSignals car={car} locale={locale} className="mb-2" />
        <WhatsAppButton car={car} locale={locale} />
      </div>
    </div>
  );
}

export default function EmptyResults({
  source = [],
  allProps,
  clearFilter,
  locale: localeProp,
}) {
  const t = useTranslations("browse.empty");
  const tField = useTranslations("browse.field");
  const routeLocale = useLocale();
  const locale = localeProp ?? routeLocale;
  const chips = chipsFor(allProps);
  const relaxed = findRelaxedMatches(source, allProps, allProps?.bounds);

  return (
    <div style={PANEL_STYLE}>
      {/* "yet" is doing the work: a small catalogue is early, not empty — and
          saying so is true, where "no results" implies the buyer got it wrong. */}
      <h3 className="mb-1" style={{ color: INK }}>
        {t("title")}
      </h3>
      <p className="mb-2" style={{ color: "#5C6368" }}>
        {t("body")}
      </p>
      <p
        className="mb-3"
        style={{
          ...RELAXED_BANNER_STYLE,
          fontWeight: 500,
        }}
      >
        {t("bandNote")}
      </p>

      {chips.length > 0 && (
        <div className="mb-2">
          <p className="fs-14 fw-6 mb-2" style={{ color: INK }}>
            {t("filteredBy")}
          </p>
          <FilterChips allProps={allProps} clearFilter={clearFilter} />
        </div>
      )}

      {relaxed && (
        <div className="mt-4">
          {/* Named, every time. A widened search passed off as a match is the
              behaviour that makes the incumbents feel dishonest. */}
          <p style={RELAXED_BANNER_STYLE}>
            {t("relaxed", {
              count: relaxed.cars.length,
              field: tField(relaxed.key),
            })}
          </p>
          <div>
            {relaxed.cars.slice(0, 3).map((car) => (
              <RelaxedMatch key={car.id} car={car} locale={locale} />
            ))}
          </div>
        </div>
      )}

      <AlertCapture chips={chips} />

      <div className="mt-4 d-flex flex-wrap gap-2">
        {chips.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-dark"
            style={{ minHeight: 48, borderRadius: 10 }}
            onClick={clearFilter}
          >
            {t("showAll")}
          </button>
        )}
        <Link
          href="/used-cars"
          className="btn btn-link"
          style={{ color: ACCENT_TEXT, minHeight: 48, fontWeight: 600 }}
        >
          {t("newSearch")}
        </Link>
      </div>
    </div>
  );
}
