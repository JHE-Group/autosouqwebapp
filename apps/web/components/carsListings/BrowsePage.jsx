import Cars2 from "@/components/carsListings/Cars2";
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
      <Cars2 listings={listings} resultsHeading={resultsHeading} />
      <SiteFooter locale={locale} />
    </>
  );
}
