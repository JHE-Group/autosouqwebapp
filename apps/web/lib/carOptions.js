import { featureOptions } from "@/data/filterOptions";

const sortUnique = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "ar"),
  );

/**
 * Filter dropdown options derived from the listings actually on the page.
 *
 * The theme hardcodes its demo values ("Audi", "London", …). Once listings come
 * from Strapi those no longer match anything, so every filter would return zero
 * results — build the option lists from the data instead.
 *
 * Each list keeps the theme's "Any …" sentinel first; `reducer/carFilterReducer`
 * treats it as "no filter applied".
 */
export function buildFilterOptions(cars = []) {
  const values = (key) => sortUnique(cars.map((car) => car[key]));
  const counted = (key, suffix) =>
    sortUnique(cars.map((car) => car[key])).map((n) => `${n} ${suffix}`);

  return {
    make: ["Any Make", ...values("make")],
    model: ["Any Model", ...values("model")],
    body: ["Any Body", ...values("body")],
    fuel: ["Any Fuel", ...values("fuelType")],
    transmission: ["Any Transmission", ...values("transmission")],
    location: ["Any Location", ...values("location")],
    color: ["Any Color", ...values("color")],
    door: ["Any Door", ...counted("door", "Door")],
    cylinder: ["Any Cylinder", ...counted("cylinder", "Cylinder")],
    // Features are a fixed checkbox grid in the theme's markup (5 rows of 3),
    // so fall back to the full list when listings carry none.
    features: sortUnique(cars.flatMap((car) => car.features ?? [])).length
      ? sortUnique(cars.flatMap((car) => car.features ?? []))
      : featureOptions,
  };
}
