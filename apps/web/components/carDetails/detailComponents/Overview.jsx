import { useTranslations } from "next-intl";
import React from "react";
import { importOriginLabel } from "@/lib/listingLabels";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Car overview.
 *
 * Two problems with the version this replaces. It hardcoded every value in the
 * theme ("Condition: New", a fabricated VIN on every listing) — fixed earlier.
 * And it then rendered eleven fixed rows whatever the CMS held, so a listing
 * with four facts came out as four facts and seven em dashes. A screen of
 * dashes does not read as "the seller didn't say", it reads as "this page is
 * broken", and it makes a well-described car look no better than a bare one.
 *
 * So the grid is now in two parts:
 *
 * - **Three rows that always render**: kilometres, year, spec origin. At OMR
 *   1,500-6,000 there is no service history, no MOT database and no write-off
 *   register, so these three are the entire qualifying set — km leads because
 *   it is the condition proxy, and spec origin is a NICHE.md promise that must
 *   appear whether or not the seller filled it in. When one is missing it says
 *   so in words, in amber, because a missing headline fact is information.
 * - **Everything else renders only if the CMS has it**, and the fields the
 *   seller left blank are named once at the bottom instead of being drawn as
 *   empty rows. Four facts then look like four facts, deliberately, and the
 *   buyer still leaves knowing exactly what was not answered — which is the
 *   thing they can act on in the WhatsApp chat.
 */


const INK = "#231F20"; // 16.30:1 on white
const LABEL = "#696665"; // $color-4, 5.69:1 on white
const AMBER = "#B45309"; // 5.02:1 on white — "you are missing this"

function SpecRow({ icon, label, value, missing }) {
  return (
    <div
      className="d-flex align-items-baseline justify-content-between gap-3"
      style={{ padding: "10px 0", borderBottom: "1px solid #F1F1F1" }}
    >
      <span
        className="d-flex align-items-baseline"
        style={{ color: LABEL, fontSize: 14, lineHeight: 1.5, gap: 8 }}
      >
        {/* Flex `gap` rather than a margin, so the icon sits on the
            reading-start side in both ar (rtl) and en (ltr) with no mirrored
            rule. The theme's own `.listing-infor-box` is avoided entirely here:
            it positions the value with `margin-left: -50px`, which lands in the
            wrong place the moment the document is rtl. */}
        <i className={icon} aria-hidden="true" style={{ color: "#B6B6B6" }} />
        {label}
      </span>
      <span
        style={{
          // `textAlign: "end"`, not Bootstrap's `.text-end`: the project loads
          // only the LTR bootstrap.css build, in which `.text-end` compiles to
          // `text-align: right` and stays right under dir="rtl". The CSS-wide
          // keyword resolves against the element's own direction instead.
          textAlign: "end",
          color: missing ? AMBER : INK,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Overview({ carItem, locale = DEFAULT_LOCALE }) {
  const car = carItem ?? {};
  const t = useTranslations("listing.spec");

  const km = Number(car.km);
  const hasKm = Number.isFinite(km) && km > 0;
  const origin = importOriginLabel(car.importOrigin, locale);

  // Always shown. These three are what the buyer is here to qualify.
  const headline = [
    {
      key: "km",
      icon: "icon-autodeal-km1",
      label: t("km"),
      value: hasKm ? `${km.toLocaleString("en-US")} ${t("unit")}` : t("notStated"),
      missing: !hasKm,
    },
    {
      key: "year",
      icon: "icon-autodeal-year",
      label: t("year"),
      value: car.year ? String(car.year) : t("notStated"),
      missing: !car.year,
    },
    {
      key: "origin",
      icon: "icon-autodeal-used-car",
      label: t("origin"),
      value: origin.text,
      missing: !origin.stated,
    },
  ];

  // Shown only when the CMS actually has the value; named at the bottom when
  // it does not. Order is buyer-priority, not schema order.
  const optional = [
    { key: "condition", icon: "icon-autodeal-condition", label: t("condition"), value: car.conditionType },
    { key: "transmission", icon: "icon-autodeal-transmission", label: t("transmission"), value: car.transmission },
    { key: "fuel", icon: "icon-autodeal-fuel", label: t("fuel"), value: car.fuelType },
    { key: "body", icon: "icon-autodeal-suv", label: t("body"), value: car.body },
    {
      key: "engine",
      icon: "icon-autodeal-engine",
      label: t("engine"),
      // Was a bare "1.6" with no unit.
      value: car.engineSize == null ? null : `${car.engineSize} L`,
    },
    { key: "cylinders", icon: "icon-autodeal-cylinders", label: t("cylinders"), value: car.cylinder },
    { key: "drive", icon: "icon-autodeal-drive", label: t("drive"), value: car.driveType },
    { key: "doors", icon: "icon-autodeal-doors", label: t("doors"), value: car.door },
    { key: "seats", icon: "icon-autodeal-seats", label: t("seats"), value: car.seats },
    { key: "colour", icon: "icon-autodeal-color", label: t("colour"), value: car.color },
  ];

  const present = optional.filter(
    (row) => row.value !== null && row.value !== undefined && row.value !== "",
  );
  const absent = optional.filter((row) => !present.includes(row));

  const rows = [...headline, ...present];

  return (
    <div className="tfcl-listing-info tf-collapse-content mt-30">
      <div className="row">
        {rows.map((row) => (
          <div className="col-md-6" key={row.key}>
            <SpecRow {...row} />
          </div>
        ))}
      </div>

      {absent.length > 0 && (
        <p
          className="mt-3 mb-0"
          // #696665 on #F8F8F9 is 5.36:1. Deliberately quiet: this is a note
          // about the listing, not a fault in the car, and it must not compete
          // with the amber rows above, which are the facts that actually
          // change a buying decision.
          style={{
            color: LABEL,
            background: "#F8F8F9",
            border: "1px solid #EDEDED",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <span style={{ fontWeight: 600 }}>{t("missingLead")}</span>{" "}
          {absent.map((row) => row.label).join(t("listSeparator"))}.{" "}
          {t("missingTail")}
        </p>
      )}
    </div>
  );
}
