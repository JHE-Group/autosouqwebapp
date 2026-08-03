import { allCars } from "@/data/cars";
import { demoFallbackAllowed } from "@/lib/listingSource";
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
/**
 * Limits on the progressive-strip fallback below. A canonical listing slug is
 * `{id-}{make}-{model}-{year}-{city}` (lib/seo.js `listingSlug`), so a real one
 * runs to a handful of tokens; 16 is generous headroom for a long model name.
 */
const MAX_SLUG_TOKENS = 16;
const MAX_STRIP_ATTEMPTS = 3;

function asDemoListing(car) {
  /*
   * Gated in production, on the same switch every browse surface uses.
   *
   * `noindex` was already set on these pages, and that was treated as enough.
   * lib/listingSource.js argues, in its own words, why it is not: "it protects
   * Google, not the person looking at the page." That reasoning was applied to
   * the homepage grid and /used-cars and never reached here.
   *
   * So on 2026-08-04, with the CMS holding ZERO published listings,
   * /en/car/3-toyota-corolla answered 200 on the live domain with "2019 Nissan
   * Sunny" — a car from data/cars.js — and a WhatsApp button beside it. The ten
   * seeded demo cars had been indexed until hours earlier, so a stale search
   * result or a shared link lands a real buyer on a car that does not exist,
   * carrying a number that reaches nobody, on a site whose entire claim is that
   * its listings are real.
   *
   * A 404 is the honest answer. The fallback still works outside production,
   * where it does its actual job: letting the site be developed and demoed
   * without a CMS running.
   */
  if (!demoFallbackAllowed()) return null;
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

  /**
   * Single-slug fetch with progressive strip (city / trailing tokens).
   *
   * Bounded on purpose. This loop used to run once per token, all the way down
   * to a single token, and `/car/[slug]` is a dynamic route that calls
   * `resolveListing` twice per request (generateMetadata *and* the page). So an
   * unauthenticated GET for a made-up 40-token slug turned into ~80 sequential
   * upstream requests against Strapi, at full CMS latency each, and every
   * distinct junk slug missed the cache. Measured against the built app: a
   * 40-token slug took 23× the wall-clock of a 1-token one *with Strapi down*
   * — with Strapi up and answering in 50ms it is multiple seconds of CMS time
   * bought with one cheap request, from any number of URLs.
   *
   * Bounding it costs nothing real. The strip exists to forgive a *stale* slug
   * — a renamed model or a missing/changed city suffix — which is one or two
   * trailing tokens, not twelve. Anything longer is not a stale link, it is
   * not one of our URLs, and 404 is the correct answer.
   */
  const parts = raw.split("-").filter(Boolean);
  if (parts.length <= MAX_SLUG_TOKENS) {
    const floor = Math.max(1, parts.length - MAX_STRIP_ATTEMPTS);
    for (let i = parts.length; i >= floor; i -= 1) {
      const key = parts.slice(0, i).join("-");
      const hit = await getListing(key, locale);
      if (hit) return hit;
    }
  }

  return (
    asDemoListing(
      allCars.find((car) => listingSlug(car) === raw) ??
        allCars.find((car) => String(car.id) === raw),
    ) ?? null
  );
}
