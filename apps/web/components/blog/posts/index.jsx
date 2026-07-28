import React from "react";
import WhatOmr3000Buys from "./WhatOmr3000Buys";
import CarsUnder1500SoldAsIs from "./CarsUnder1500SoldAsIs";
import HighMileageCorolla from "./HighMileageCorolla";
import CorollaVsSunnyVsAccent from "./CorollaVsSunnyVsAccent";
import TestingUsedCarAc from "./TestingUsedCarAc";
import UsedCarRunningCosts from "./UsedCarRunningCosts";
import SellingAffordableCar from "./SellingAffordableCar";
import FloodSalvageImports from "./FloodSalvageImports";
import WhatOmr3000BuysAr from "./ar/WhatOmr3000Buys";
import CarsUnder1500SoldAsIsAr from "./ar/CarsUnder1500SoldAsIs";
import HighMileageCorollaAr from "./ar/HighMileageCorolla";
import CorollaVsSunnyVsAccentAr from "./ar/CorollaVsSunnyVsAccent";
import TestingUsedCarAcAr from "./ar/TestingUsedCarAc";
import UsedCarRunningCostsAr from "./ar/UsedCarRunningCosts";
import SellingAffordableCarAr from "./ar/SellingAffordableCar";
import FloodSalvageImportsAr from "./ar/FloodSalvageImports";

/**
 * slug -> body, joined here rather than in data/blog/index.js so the registry
 * stays pure data for the sitemap. Switch (not object lookup) avoids
 * react-hooks/static-components treating a looked-up type as created in render.
 *
 * Each post has an English body and an Arabic one under ./ar. They are separate
 * components rather than translated strings because a post is structured prose
 * — headings, lists, inline links — and an Arabic writer needs to edit Arabic
 * sentences in Arabic order, not fill ICU placeholders. Same reasoning as
 * app/[locale]/(info)/_content.
 *
 * Both languages must exist for a slug: a post that renders in English and
 * 404s in Arabic breaks the identical-path-shape requirement hreflang depends
 * on (strategy doc §10, gate 1).
 */
export function BlogBody({ slug, locale = "en" }) {
  const ar = locale === "ar";
  switch (slug) {
    case "what-omr-3000-buys-oman-2026":
      return ar ? <WhatOmr3000BuysAr /> : <WhatOmr3000Buys />;
    case "cars-under-1500-sold-as-is":
      return ar ? <CarsUnder1500SoldAsIsAr /> : <CarsUnder1500SoldAsIs />;
    case "high-mileage-corolla-oman":
      return ar ? <HighMileageCorollaAr /> : <HighMileageCorolla />;
    case "corolla-vs-sunny-vs-accent-omr-3000":
      return ar ? <CorollaVsSunnyVsAccentAr /> : <CorollaVsSunnyVsAccent />;
    case "testing-used-car-ac-oman":
      return ar ? <TestingUsedCarAcAr /> : <TestingUsedCarAc />;
    case "used-car-running-costs-oman":
      return ar ? <UsedCarRunningCostsAr /> : <UsedCarRunningCosts />;
    case "selling-affordable-car-oman":
      return ar ? <SellingAffordableCarAr /> : <SellingAffordableCar />;
    case "flood-salvage-imports-oman":
      return ar ? <FloodSalvageImportsAr /> : <FloodSalvageImports />;
    default:
      return null;
  }
}

export function hasBlogBody(slug) {
  switch (slug) {
    case "what-omr-3000-buys-oman-2026":
    case "cars-under-1500-sold-as-is":
    case "high-mileage-corolla-oman":
    case "corolla-vs-sunny-vs-accent-omr-3000":
    case "testing-used-car-ac-oman":
    case "used-car-running-costs-oman":
    case "selling-affordable-car-oman":
    case "flood-salvage-imports-oman":
      return true;
    default:
      return false;
  }
}
