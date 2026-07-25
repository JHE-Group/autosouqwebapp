import { useTranslations } from "next-intl";
import React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { SOLD_AS_IS, importOriginLabel } from "@/lib/listingLabels";
import { cars } from "@/data/cars";
import DropdownSelect from "../common/DropDownSelect";
import EmptyState from "./EmptyState";
import Pagination2 from "../common/Pagination2";

export default function MyFavourite() {
  const tCommon = useTranslations("common");
  const t = useTranslations("dashboard.saved");
  const tPage = useTranslations("dashboard.page");
  // Stands in for the signed-in buyer's saved cars until auth is wired up.
  const favourites = cars;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{tPage("savedCars")}</h1>
                <div className="tfcl-favorite-listing">
                  {favourites.length === 0 ? (
                    <EmptyState
                      icon="heart"
                      title={t("emptyTitle")}
                      body={t("emptyBody")}
                      actionHref="/listing-grid"
                      actionLabel={t("emptyAction")}
                    />
                  ) : (
                    <>
                      <div className="controller-sorting mb-3">
                        {/* Counted, not typed: the template printed "26" over a
                            list of a different length. */}
                        <div className="count-list">
                          {t("count", { count: favourites.length })}
                        </div>
                        <div className="sorting-input">
                          <div className="label">{t("sortBy")}</div>
                          <DropdownSelect
                            addtionalParentClass="form-control"
                            options={[
                              "Recently saved",
                              "Price: low to high",
                              "Price: high to low",
                            ]}
                          />
                        </div>
                      </div>
                      <div className="wrap-favorite-listing">
                        {favourites.map((car, i) => (
                          <div key={car.id ?? i} className="box-car-list hv-one">
                            <div className="image-group relative">
                              <div className="img-style">
                                <Image
                                  className="lazyload"
                                  alt={car.title ?? "listing photo"}
                                  src={car.imgSrc}
                                  width={450}
                                  height={338}
                                />
                              </div>
                            </div>
                            <div className="content">
                              <div className="text-address">
                                <p className="text-color-3 font">{car.type}</p>
                              </div>
                              <h5 className="link-style-1">
                                <Link href={`/listing-detail-v1/${car.id}`}>
                                  {car.title}
                                </Link>
                              </h5>
                              <div className="icon-box flex flex-wrap">
                                <div className="icons flex-three">
                                  <i className="icon-autodeal-km1" />
                                  {/* km, not miles */}
                                  <span>
                                    {Number(car.km).toLocaleString("en-US")} km
                                  </span>
                                </div>
                                <div className="icons flex-three">
                                  <i className="icon-autodeal-diesel" />
                                  <span>{car.fuelType}</span>
                                </div>
                                <div className="icons flex-three">
                                  <i className="icon-autodeal-automatic" />
                                  <span>{car.transmission}</span>
                                </div>
                              </div>
                              <Labels car={car} />
                              <div className="money fs-20 fw-5 lh-25 text-color-3">
                                {formatPrice(car.price, car.currency)}
                              </div>
                              {/* The template's author row was bound to
                                  car.authorName / car.authorImage, both null on
                                  every record by deliberate policy (data/cars.js:
                                  inventing a seller "is the one thing we must
                                  never do"). It rendered an empty name beside an
                                  <Image src={null}> on every card. The city is
                                  the fact a shortlisting buyer actually needs —
                                  how far they have to drive. */}
                              <div className="days-box flex justify-space align-center">
                                {car.location ? (
                                  <span className="font text-color-2 fw-5">
                                    {car.location}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                <Link
                                  href={`/listing-detail-v1/${car.id}`}
                                  className="view-car"
                                >
                                  View car
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="themesflat-pagination clearfix mt-40">
                        <ul>
                          <Pagination2 itemLength={favourites.length} />
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The two signals a buyer saved the car for: whether it is sold as-is and what
 * spec it is. Shown on the saved card so the buyer does not have to reopen the
 * listing to remember (NICHE.md: "GCC-spec vs US-import is always shown
 * honestly"). Rendered only when the listing carries the field.
 */
function Labels({ car }) {
  const hasSpec = "importOrigin" in car;
  if (!car.soldAsIs && !hasSpec) return null;
  const spec = hasSpec ? importOriginLabel(car.importOrigin, "en") : null;
  return (
    <div className="tfcl-pill-row">
      {car.soldAsIs ? (
        <span className="tfcl-pill tfcl-pill--as-is">{tCommon("soldAsIs")}</span>
      ) : null}
      {spec ? (
        <span
          className={`tfcl-pill ${
            spec.stated ? "tfcl-pill--spec" : "tfcl-pill--unstated"
          }`}
        >
          {spec.text}
        </span>
      ) : null}
    </div>
  );
}
