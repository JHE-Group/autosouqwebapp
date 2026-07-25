import { useTranslations } from "next-intl";
import React from "react";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The headline spec row every detail layout repeats above the price.
 *
 * The theme hardcoded a fourth chip reading "1st owner" onto every listing —
 * an ownership-history claim the content model has no field for, and exactly
 * the kind of unverifiable detail buyers use to decide a car is safe. It is
 * gone. Each remaining chip renders only when the CMS actually has the value,
 * so a sparse listing looks sparse instead of looking complete.
 *
 * Distance is km — Oman is metric, and the theme's "miles" was simply wrong.
 *
 * The icons are decorative and `aria-hidden`, so each chip also carries a
 * visually-hidden name: without one a screen reader announced this row as
 * "180,000 km, Petrol, Automatic, 2016" with nothing to say which was which,
 * and "2016" on its own is not a fact. Order is buyer-priority — kilometres
 * first because it is the condition proxy when there is no service history,
 * then year, then the two that only narrow a shortlist.
 */

export default function SpecChips({ carItem, locale = DEFAULT_LOCALE }) {
  const car = carItem ?? {};
  const km = Number(car.km);
  const t = useTranslations("listing.spec");

  const chips = [
    Number.isFinite(km) && km > 0
      ? {
          key: "km",
          icon: "icon-autodeal-km1",
          label: t("km"),
          text: `${km.toLocaleString("en-US")} ${t("unit")}`,
        }
      : null,
    car.year
      ? { key: "year", icon: "icon-autodeal-year", label: t("year"), text: String(car.year) }
      : null,
    car.transmission
      ? {
          key: "transmission",
          icon: "icon-autodeal-automatic",
          label: t("transmission"),
          text: car.transmission,
        }
      : null,
    car.fuelType
      ? { key: "fuel", icon: "icon-autodeal-diesel", label: t("fuel"), text: car.fuelType }
      : null,
  ].filter(Boolean);

  if (!chips.length) return null;

  return (
    <div className="icon-box flex flex-wrap">
      {chips.map((chip) => (
        <div className="icons flex-three gap-8" key={chip.key}>
          <i className={chip.icon} aria-hidden="true" />
          <span>
            <span className="visually-hidden">{chip.label}: </span>
            {chip.text}
          </span>
        </div>
      ))}
    </div>
  );
}
