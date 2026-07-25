/**
 * One implementation of "does this car match the current filters".
 *
 * The same block of `if (make !== "Any Make") …` was inlined in an effect in
 * each of Cars1–Cars5. Extracting it is not tidiness for its own sake: the
 * zero-result screen has to be able to ask "what would match if we dropped
 * exactly one of these filters?", and it must get the same answer the grid
 * would give. Two implementations would mean the relaxed matches we label as
 * "everything except city" could quietly be wrong.
 */

/** The dropdown value that means "no filter applied". */
export const NEUTRAL = {
  make: "Any Make",
  model: "Any Model",
  body: "Any Body",
  fuel: "Any Fuel",
  transmission: "Any Transmission",
  location: "Any Location",
  door: "Any Door",
  cylinder: "Any Cylinder",
  color: "Any Color",
};

/**
 * `buildFilterOptions` labels numbers ("4 Door"), so the number has to come
 * back out. Returns null rather than throwing on a label with no digits.
 */
function numberFrom(label) {
  const match = String(label ?? "").match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

const RANGE_KEYS = ["price", "km", "year"];

const PREDICATES = {
  make: (car, s) => car.make === s.make,
  model: (car, s) => car.model === s.model,
  body: (car, s) => car.body === s.body,
  fuel: (car, s) => car.fuelType === s.fuel,
  transmission: (car, s) => car.transmission === s.transmission,
  location: (car, s) => car.location === s.location,
  color: (car, s) => car.color === s.color,
  door: (car, s) => numberFrom(s.door) === car.door,
  cylinder: (car, s) => numberFrom(s.cylinder) === car.cylinder,
  features: (car, s) =>
    s.features.every((f) => (car.features ?? []).includes(f)),
  price: (car, s) => car.price >= s.price[0] && car.price <= s.price[1],
  km: (car, s) => car.km >= s.km[0] && car.km <= s.km[1],
  year: (car, s) => car.year >= s.year[0] && car.year <= s.year[1],
};

/**
 * Order matters only for display — this is the order applied filters are
 * listed to the buyer, weighted the way the buyer weighs them at OMR
 * 1,500–6,000: budget, then nameplate, then wear, then place, then the rest.
 */
export const FILTER_ORDER = [
  "price",
  "make",
  "model",
  "km",
  "location",
  "body",
  "transmission",
  "year",
  "fuel",
  "cylinder",
  "door",
  "color",
  "features",
];

/** Is this filter doing anything, or is it still at its default? */
export function isFilterActive(key, state, bounds = state?.bounds) {
  if (!state) return false;
  if (key === "features") return Boolean(state.features?.length);
  if (RANGE_KEYS.includes(key)) {
    const value = state[key];
    const bound = bounds?.[key];
    if (!Array.isArray(value) || !Array.isArray(bound)) return false;
    return value[0] !== bound[0] || value[1] !== bound[1];
  }
  return state[key] !== NEUTRAL[key];
}

export function activeFilterKeys(state, bounds = state?.bounds) {
  return FILTER_ORDER.filter((key) => isFilterActive(key, state, bounds));
}

export function activeFilterCount(state, bounds = state?.bounds) {
  return activeFilterKeys(state, bounds).length;
}

/**
 * Apply every active filter except the named ones.
 * `except` is how the zero-result screen builds a relaxed search.
 */
export function applyFilters(cars = [], state, { except = [] } = {}) {
  if (!state) return [...cars];
  const keys = activeFilterKeys(state).filter((key) => !except.includes(key));
  return cars.filter((car) => keys.every((key) => PREDICATES[key](car, state)));
}

/**
 * Least decisive first. Colour is a preference; price is a budget.
 *
 * Price is deliberately absent: a buyer who says "under OMR 3,000" is stating
 * what they can pay, and showing them a 5,000 car as a "near match" is the
 * behaviour that makes classifieds feel like a bait-and-switch. We relax what
 * someone might flex on, never what they cannot.
 */
export const RELAXABLE = [
  "color",
  "door",
  "cylinder",
  "fuel",
  "features",
  "body",
  "transmission",
  "year",
  "km",
  "location",
  "model",
  "make",
];

/**
 * Find cars that match everything except ONE named filter.
 *
 * Returns `{ key, cars }` or null. Only ever drops a single filter, and always
 * hands the caller the name of what it dropped — a relaxed result set that
 * cannot be labelled must not be shown at all.
 */
export function findRelaxedMatches(cars = [], state, bounds = state?.bounds) {
  if (!state) return null;
  for (const key of RELAXABLE) {
    if (!isFilterActive(key, state, bounds)) continue;
    const relaxed = applyFilters(cars, state, { except: [key] });
    if (relaxed.length) return { key, cars: relaxed };
  }
  return null;
}
