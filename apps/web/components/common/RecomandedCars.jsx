"use client";

import { formatPrice, formatKm } from "@/lib/format";
import { listingPath } from "@/lib/seo";
import { A11y, Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link } from "@/i18n/navigation";
import ListingSignals from "@/components/common/ListingSignals";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { useLocale, useTranslations } from "next-intl";
/**
 * The "Recommended" carousel on /about-us.
 *
 * `listings` is required. This used to import `carData` from data/cars.js and
 * map it directly, so /about-us — `index, follow`, sitemap-nominated, and
 * about nothing except the listings being real — shipped eight fabricated cars
 * with prices no matter what the CMS held. Every other surface routes through
 * lib/listingSource.js; this one did not.
 *
 * Renders nothing when there is nothing real to show, rather than reaching for
 * a stand-in: the same shape the rest of the app uses for an empty catalogue.
 */
export default function RecomandedCars({ listings, locale: localeProp }) {
  const t = useTranslations("browse.card");
  const tCommon = useTranslations("common");
  const tAbout = useTranslations("aboutPage");
  const activeLocale = useLocale();
  const locale = localeProp ?? activeLocale;
  const cars = listings ?? [];
  const swiperOptions = {
    speed: 1000,
    spaceBetween: 30,
    pagination: {
      el: ".spd9",
      clickable: true,
    },
    navigation: {
      nextEl: ".snbn6",
      prevEl: ".snbp6",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      991: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  };

  // Nothing real to show — render nothing rather than a heading over an empty
  // carousel. Hooks above are unconditional, so this early return is safe.
  if (cars.length === 0) return null;

  return (
    <section className="tf-section3">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="heading-section flex align-center justify-space flex-wrap gap-20">
              <h2
                className="wow fadeInUpSmall"
                data-wow-delay="0.2s"
                data-wow-duration="1000ms"
              >
                {tAbout("recommendedTitle")}
              </h2>
              <Link
                href={`/used-cars`}
                className="tf-btn-arrow wow fadeInUpSmall"
                data-wow-delay="0.2s"
                data-wow-duration="1000ms"
              >
                {tCommon("viewAll")}
                <i className="icon-autodeal-btn-right" />
              </Link>
            </div>
          </div>
          <div className="col-lg-12 relative">
            <Swiper
              {...swiperOptions}
              // A11y was missing, which is why the prev/next arrows had no
              // role, no tabindex and no accessible name — Swiper only adds
              // those when the module is registered. Pagination was also listed
              // twice.
              modules={[A11y, Navigation, Pagination]}
              className="swiper-container tf-sw-mobile3"
            >
              {cars.map((car, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                  <div className="box-car-list hv-one">
                    <div className="image-group relative">
                      <div className="top flex-two">
                        <ul className="d-flex gap-8">
                          {car?.featured && (
                            <li className="flag-tag success">{t("featured")}</li>
                          )}
                          <li className="flag-tag style-1">
                            <div className="icon">
                              <svg
                                width={16}
                                height={13}
                                viewBox="0 0 16 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M1.5 9L4.93933 5.56067C5.07862 5.42138 5.24398 5.31089 5.42597 5.2355C5.60796 5.16012 5.80302 5.12132 6 5.12132C6.19698 5.12132 6.39204 5.16012 6.57403 5.2355C6.75602 5.31089 6.92138 5.42138 7.06067 5.56067L10.5 9M9.5 8L10.4393 7.06067C10.5786 6.92138 10.744 6.81089 10.926 6.7355C11.108 6.66012 11.303 6.62132 11.5 6.62132C11.697 6.62132 11.892 6.66012 12.074 6.7355C12.256 6.81089 12.4214 6.92138 12.5607 7.06067L14.5 9M2.5 11.5H13.5C13.7652 11.5 14.0196 11.3946 14.2071 11.2071C14.3946 11.0196 14.5 10.7652 14.5 10.5V2.5C14.5 2.23478 14.3946 1.98043 14.2071 1.79289C14.0196 1.60536 13.7652 1.5 13.5 1.5H2.5C2.23478 1.5 1.98043 1.60536 1.79289 1.79289C1.60536 1.98043 1.5 2.23478 1.5 2.5V10.5C1.5 10.7652 1.60536 11.0196 1.79289 11.2071C1.98043 11.3946 2.23478 11.5 2.5 11.5ZM9.5 4H9.50533V4.00533H9.5V4ZM9.75 4C9.75 4.0663 9.72366 4.12989 9.67678 4.17678C9.62989 4.22366 9.5663 4.25 9.5 4.25C9.4337 4.25 9.37011 4.22366 9.32322 4.17678C9.27634 4.12989 9.25 4.0663 9.25 4C9.25 3.9337 9.27634 3.87011 9.32322 3.82322C9.37011 3.77634 9.4337 3.75 9.5 3.75C9.5663 3.75 9.62989 3.77634 9.67678 3.82322C9.72366 3.87011 9.75 3.9337 9.75 4Z"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            {car?.images?.length || ""}
                          </li>
                        </ul>
                        {/* Was the hardcoded literal `2024`, printed over cars whose real years
                            are 2008–2019 (data/cars.js). On the page a sceptical buyer
                            visits to decide whether to trust us, every card carried a
                            false model year — a NICHE.md violation, not a cosmetic bug. */}
                        <div className="year flag-tag">{car.year}</div>
                      </div>
                      <ul className="change-heart flex">
                        <li className="box-icon w-32">
                          <a
                            data-bs-toggle="offcanvas"
                            data-bs-target="#offcanvasBottom"
                            aria-controls="offcanvasBottom"
                            className="icon"
                          >
                            <svg
                              width={18}
                              height={18}
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5.25 16.5L1.5 12.75M1.5 12.75L5.25 9M1.5 12.75H12.75M12.75 1.5L16.5 5.25M16.5 5.25L12.75 9M16.5 5.25H5.25"
                                stroke="CurrentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        </li>
                        <li className="box-icon w-32">
                          <Link href={`/my-favorite`} className="icon">
                            <svg
                              width={18}
                              height={16}
                              viewBox="0 0 18 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16.5 4.875C16.5 2.80417 14.7508 1.125 12.5933 1.125C10.9808 1.125 9.59583 2.06333 9 3.4025C8.40417 2.06333 7.01917 1.125 5.40583 1.125C3.25 1.125 1.5 2.80417 1.5 4.875C1.5 10.8917 9 14.875 9 14.875C9 14.875 16.5 10.8917 16.5 4.875Z"
                                stroke="CurrentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </li>
                      </ul>
                      <div className="img-style">
                        {/* Same guard as Cars.jsx and Recommended.jsx — a
                            photo-less listing must render a box, not an
                            <Image> with no src. */}
                        {car.imgSrc ? (
                          <Image
                            className="lazyload"
                            alt={car.imageAlt || car.title || ""}
                            src={car.imgSrc}
                            width={450}
                            height={338}
                            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="asq-card__img asq-card__img--none" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                    {/* Order: identity -> price -> disclosures -> wear -> place ->
                        contact. Price sat under the spec row, and the spec disclosure
                        NICHE.md says is shown "always" was absent from this card
                        entirely, as was the one-tap WhatsApp contact. */}
                    <div className="content">
                      <h5 className="link-style-1">
                        <Link href={listingPath(car)}>
                          {car.title}
                        </Link>
                      </h5>
                      {/*
                      Same treatment as the browse card's price.
                    
                      Measured on the same car: 20px/500 in terracotta here
                      against 23px/700 in ink on /used-cars. Two cards for one
                      marketplace disagreeing about how to write the one number a
                      buyer came to read — and terracotta is the accent this
                      codebase reserves for ACTIONS, so a price wearing it reads
                      as something to tap.
                    
                      The real fix is one card component; this is the divergence
                      that actually shows, fixed without a refactor.
                      */}
                      <div className="money asq-price-strong">
                        {formatPrice(car.price, car.currency, locale)}
                      </div>
                      {/* `locale` was missing here, and ListingSignals
                          defaults to DEFAULT_LOCALE ("ar") — so /en/about-us
                          rendered the Arabic pills خليجي and وارد أمريكي beside
                          English copy. Every other card call site threads it. */}
                      <ListingSignals
                        car={car}
                        locale={locale}
                        className="mt-2"
                      />
                      <div className="icon-box flex flex-wrap mt-2">
                        <div className="icons flex-three">
                          <i className="icon-autodeal-km1" />
                          <span>
                            {Number.isFinite(car.km)
                              ? formatKm(car.km, locale)
                              : t("kmUnstated")}
                          </span>
                        </div>
                        {car.transmission && (
                          <div className="icons flex-three">
                            <i className="icon-autodeal-automatic" />
                            <span>{car.transmission}</span>
                          </div>
                        )}
                        {car.location && (
                          <div className="icons flex-three">
                            <i className="icon-autodeal-city" aria-hidden="true" />
                            <span>{car.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <WhatsAppButton car={car} />
                      </div>
                      {/* The author row was bound to authorName / authorImage,
                          null on every record by deliberate policy, so it rendered
                          an empty box on every card. */}
                      <div className="days-box flex justify-space align-center">
                        <Link
                          href={listingPath(car)}
                          className="view-car"
                        >
                          {t("view")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              <div className="swiper-pagination5 spd9 pb-1"></div>
            </Swiper>
            <div className="swiper-button-next style-1 snbn6" />
            <div className="swiper-button-prev style-1 snbp6" />
          </div>
        </div>
      </div>
    </section>
  );
}
