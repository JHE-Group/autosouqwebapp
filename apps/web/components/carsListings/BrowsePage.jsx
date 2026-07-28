import { Suspense } from "react";
import Cars2 from "@/components/carsListings/Cars2";
import ListingGridSkeleton from "@/components/carsListings/ListingCardSkeleton";
import PriceBandNote from "@/components/common/PriceBandNote";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { MUSCAT_AREAS_FOR_COPY } from "@/data/muscatLocalities";

/**
 * Shared chrome for `/used-cars` and `/used-cars/{facet}`.
 *
 * The hero states the query the page owns; Cars2 owns the results H1 only when
 * no facet H1 is supplied (hub page uses the hero as H1). The cream band note
 * reminds every lander that the whole catalogue is Autosouq’s OMR band.
 */
export default function BrowsePage({
  listings,
  title,
  lead,
  showMuscatAreas = false,
  resultsHeading,
  locale = "en",
}) {
  const areaNames = MUSCAT_AREAS_FOR_COPY.map((place) =>
    locale === "ar" ? place.ar : place.en,
  ).join(locale === "ar" ? "، " : ", ");

  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="tf-banner style-2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="content relative z-2">
                <div className="heading">
                  <h1 className="text-color-1 fs-30 fw-6 lh-38">{title}</h1>
                  {lead ? (
                    <p className="text-color-1 fs-18 fw-4 lh-22 font">{lead}</p>
                  ) : null}
                  {showMuscatAreas ? (
                    <p className="text-color-1 fs-14 fw-4 lh-22 font mt-3">
                      {locale === "ar"
                        ? `مناطق يبحث فيها المشترون: ${areaNames}.`
                        : `Areas buyers search: ${areaNames}.`}
                    </p>
                  ) : null}
                  <PriceBandNote />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*
        Cars2 reads `?price=` via useSearchParams, which needs a Suspense
        boundary — without one Next opts this whole route out of static
        rendering and the card grid disappears from the server HTML, taking the
        crawlable listing links with it. The boundary is scoped to the results
        block so the hero, the breadcrumb and the price-band note stay
        prerendered.

        The fallback is the six-card skeleton the route group used to render as
        a loading.jsx, before that file was removed for holding these pages
        dynamic. Same reasoning as then: six, not twelve, because a twelve-card
        skeleton resolving to three cars is its own small dishonesty about how
        much inventory is coming.
      */}
      <Suspense
        fallback={
          <section className="tf-section">
            <div className="container">
              <ListingGridSkeleton
                count={6}
                variant="grid"
                className="asq-results asq-results--grid list-car-grid-4 gap-30"
              />
            </div>
          </section>
        }
      >
        <Cars2 listings={listings} resultsHeading={resultsHeading} />
      </Suspense>
      <SiteFooter locale={locale} />
    </>
  );
}
