import { allCars } from "@/data/cars";
import { getListing, getListings } from "@/lib/strapi";
import { listingSlug } from "@/lib/seo";

/**
 * Resolve a `/car/{slug}` segment to a listing.
 *
 * Demo cars use numeric ids (`3-toyota-corolla-2015-muscat`). CMS cars use the
 * listing slug as `id` (`suzuki-swift-dzire-2016-muscat`). Matching must not
 * truncate the CMS slug at the first hyphen.
 */
export async function resolveListing(slug, locale) {
  const raw = String(slug ?? "").trim();
  if (!raw) return null;

  const numeric = raw.match(/^(\d+)(?:-|$)/);
  if (numeric) {
    const id = numeric[1];
    return (
      (await getListing(id, locale)) ??
      allCars.find((car) => String(car.id) === id) ??
      null
    );
  }

  const listings = await getListings(locale);
  const fromCms =
    listings.find((car) => listingSlug(car) === raw) ??
    listings.find((car) => String(car.id) === raw) ??
    listings.find((car) => {
      const id = String(car.id);
      return raw === id || raw.startsWith(`${id}-`);
    });
  if (fromCms) return fromCms;

  // Single-slug fetch with progressive strip (city / trailing tokens).
  const parts = raw.split("-").filter(Boolean);
  for (let i = parts.length; i >= 1; i -= 1) {
    const key = parts.slice(0, i).join("-");
    const hit = await getListing(key, locale);
    if (hit) return hit;
  }

  return (
    allCars.find((car) => listingSlug(car) === raw) ??
    allCars.find((car) => String(car.id) === raw) ??
    null
  );
}
