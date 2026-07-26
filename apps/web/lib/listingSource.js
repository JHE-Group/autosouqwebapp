import { allCars } from "@/data/cars";
import { getListings } from "@/lib/strapi";

/**
 * CMS listings when Strapi has any; otherwise the local demo catalogue.
 * Facet gates and browse pages must use the same source Cars2 falls back to.
 */
export async function getBrowseListings(locale) {
  const cms = await getListings(locale);
  return cms?.length ? cms : allCars;
}
