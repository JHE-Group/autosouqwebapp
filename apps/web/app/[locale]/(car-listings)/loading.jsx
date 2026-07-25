import ListingGridSkeleton from "@/components/carsListings/ListingCardSkeleton";

/**
 * The waiting state for every browse route.
 *
 * These pages are async server components that read listings from Strapi. Until
 * that resolves there was nothing on screen at all, and NICHE.md's audience is
 * on budget Android over metered data — where a blank screen and a broken site
 * are indistinguishable, and the response to both is to go back to OpenSooq.
 *
 * Six cards, matching the smallest page size any of the layouts uses. A twelve
 * card skeleton that resolves to three cars would be its own small dishonesty
 * about how much inventory is on the way.
 */
export default function Loading() {
  return (
    <section className="tf-section">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <ListingGridSkeleton
              count={6}
              variant="grid"
              className="asq-results asq-results--grid list-car-grid-4 gap-30"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
