import { allCars } from "@/data/cars";

/**
 * Slider bounds taken from the listings themselves.
 *
 * The theme hardcoded 50,000–100,000 for price, which matches its USD demo
 * cars but excludes every real Omani listing (a 6,250 OMR Camry would be
 * filtered out before the page even rendered). Derive the range instead.
 */
export function getBounds(cars = []) {
  const range = (key, fallback) => {
    const values = cars.map((car) => Number(car[key])).filter(Number.isFinite);
    if (!values.length) return fallback;
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    // rc-slider needs a non-zero span.
    return min === max ? [min, max + 1] : [min, max];
  };

  return {
    price: range("price", [0, 100000]),
    km: range("km", [0, 200000]),
    year: range("year", [2000, 2026]),
  };
}

export function createInitialState(cars = allCars) {
  const bounds = getBounds(cars);
  return {
    bounds,
    price: bounds.price,
    km: bounds.km,
    year: bounds.year,
    body: "Any Body",
    make: "Any Make",
    model: "Any Model",
    fuel: "Any Fuel",
    transmission: "Any Transmission",
    location: "Any Location",
    door: "Any Door",
    cylinder: "Any Cylinder",
    color: "Any Color",

    features: [],
    filtered: cars,
    sortingOption: "Sort by (Default)",
    sorted: cars,
    currentPage: 1,
    itemPerPage: 6,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "SET_PRICE":
      return { ...state, price: action.payload };
    case "SET_YEAR":
      return { ...state, year: action.payload };
    case "SET_KM":
      return { ...state, km: action.payload };
    case "SET_MODEL":
      return { ...state, model: action.payload };
    case "SET_BODY":
      return { ...state, body: action.payload };
    case "SET_MAKE":
      return { ...state, make: action.payload };
    case "SET_FUEL":
      return { ...state, fuel: action.payload };
    case "SET_TRANSMISSION":
      return { ...state, transmission: action.payload };
    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "SET_DOOR":
      return { ...state, door: action.payload };
    case "SET_CYLINDER":
      return { ...state, cylinder: action.payload };
    case "SET_COLOR":
      return { ...state, color: action.payload };
    case "SET_FEATURES":
      return { ...state, features: action.payload };
    case "SET_FILTERED":
      return { ...state, filtered: [...action.payload] };
    case "SET_SORTING_OPTION":
      return { ...state, sortingOption: action.payload };
    case "SET_SORTED":
      return { ...state, sorted: [...action.payload] };
    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_ITEM_PER_PAGE":
      return { ...state, itemPerPage: action.payload };
    case "CLEAR_FILTER":
      return {
        ...state,
        price: state.bounds.price,
        km: state.bounds.km,
        year: state.bounds.year,
        body: "Any Body",
        make: "Any Make",
        model: "Any Model",
        fuel: "Any Fuel",
        transmission: "Any Transmission",
        location: "Any Location",
        door: "Any Door",
        cylinder: "Any Cylinder",
        color: "Any Color",

        features: [],
      };
    default:
      return state;
  }
}
