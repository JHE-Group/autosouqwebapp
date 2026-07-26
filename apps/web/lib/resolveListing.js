import { allCars } from "@/data/cars";
import { getListing, getListings } from "@/lib/strapi";
import { listingSlug } from "@/lib/seo";

/**
 * Tag a listing that came from `data/cars.js` rather than the CMS.
 *
 * data/cars.js says it plainly: those cars are stand-ins, not real inventory.
 * app/sitemap.js already refuses to nominate them — but the sitemap is not the
 * only way in. Whenever Strapi returns nothing, the homepage grid and
 * /used-cars render the demo catalogue and link every card at `/car/{slug}`,
 * and those pages answered `200 index, follow` with `Car` + `Offer` structured
 * data quoting a price. That is how a launch with a half-loaded CMS gets
 * invented inventory into the index.
 *
 * The flag is read by app/[locale]/(car-details)/car/[slug]/page.jsx. It is
 * inert on a populated CMS, which is the normal production state.
 */
function asDemoListing(car) {
  return car ? { ...car, isDemoListing: true } : null;
}

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
      asDemoListing(allCars.find((car) => String(car.id) === id)) ??
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
    asDemoListing(
      allCars.find((car) => listingSlug(car) === raw) ??
        allCars.find((car) => String(car.id) === raw),
    ) ?? null
  );
}
