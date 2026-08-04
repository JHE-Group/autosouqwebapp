"use client";

import { useLocale, useTranslations } from "next-intl";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ListingSignals from "@/components/common/ListingSignals";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import PlaceholderPhotoTag from "@/components/common/PlaceholderPhotoTag";
import { formatPrice } from "@/lib/format";
import { listingPath } from "@/lib/seo";

/**
 * The one listing card.
 *
 * The same ~140 lines of card markup were pasted into Cars1–Cars5, and they had
 * already drifted: Cars5 used a raw <img>, Cars4 repeated one photo three times
 * as a "gallery", the badge row differed, and only some of them carried the
 * placeholder disclosure. Every improvement below would otherwise have to be
 * made five times, which is exactly how the drift happened.
 *
 * Field order is fixed and deliberate — photo → identity → price → disclosures
 * → wear → place → contact — because a buyer comparing ten cards is scanning
 * the same position on each one. Price sits directly under the title: on a site
 * that IS a price band, burying it under a spec row inverts the hierarchy.
 *
 * The card owns no theme classes. It used to be `box-car-list style-2 hv-one`,
 * whose appearance was decided across _widget.scss, _side-bar.scss,
 * _section.scss and responsive.scss at four different specificities — which is
 * why the five layouts could not be reconciled. Everything visual now lives in
 * one block of _widget.scss under `.asq-card`.
 */

/**
 * Folders holding stand-in artwork rather than photographs of the car for sale.
 * `/listings` is AI-generated — see that folder's README.
 *
 * `/car-list` used to be listed here too, as "the purchased theme's stock
 * photography". It is not photography: every file in it is a single flat
 * #D2D6E2 rectangle, the theme's unfilled placeholder. data/cars.js now emits
 * `imgSrc: null` for the 19 demo cars that pointed at it, so the directory is
 * unreferenced and the entry is gone.
 *
 * Strapi-backed listings always carry an explicit `hasPlaceholderImage` from
 * `toCar()`, so this path fallback only ever classifies the pre-launch demo
 * catalogue — a real listing is never mislabelled by it.
 */
const STAND_IN_DIRS = ["/assets/images/listings/"];

/** Is this picture a stand-in rather than a photograph of this car? */
export function isPlaceholderPhoto(car) {
  if (typeof car?.hasPlaceholderImage === "boolean") {
    return car.hasPlaceholderImage;
  }
  if (!car?.imgSrc) return true;
  return STAND_IN_DIRS.some((dir) => String(car.imgSrc).startsWith(dir));
}

// PlaceholderPhotoTag lives in components/common and keys off this one flag.
// A module-level sentinel avoids rebuilding a car object on every render.
const PLACEHOLDER_SENTINEL = { hasPlaceholderImage: true };

/** Photos we can honestly claim. A stand-in is not a photo of this car. */
function realPhotoCount(car) {
  if (isPlaceholderPhoto(car)) return 0;
  return car?.images?.length ?? 0;
}

function CameraIcon() {
  return (
    <svg
      width={14}
      height={12}
      viewBox="0 0 16 13"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1.5 9L4.93933 5.56067C5.07862 5.42138 5.24398 5.31089 5.42597 5.2355C5.60796 5.16012 5.80302 5.12132 6 5.12132C6.19698 5.12132 6.39204 5.16012 6.57403 5.2355C6.75602 5.31089 6.92138 5.42138 7.06067 5.56067L10.5 9M9.5 8L10.4393 7.06067C10.5786 6.92138 10.744 6.81089 10.926 6.7355C11.108 6.66012 11.303 6.62132 11.5 6.62132C11.697 6.62132 11.892 6.66012 12.074 6.7355C12.256 6.81089 12.4214 6.92138 12.5607 7.06067L14.5 9M2.5 11.5H13.5C13.7652 11.5 14.0196 11.3946 14.2071 11.2071C14.3946 11.0196 14.5 10.7652 14.5 10.5V2.5C14.5 2.23478 14.3946 1.98043 14.2071 1.79289C14.0196 1.60536 13.7652 1.5 13.5 1.5H2.5C2.23478 1.5 1.98043 1.60536 1.79289 1.79289C1.60536 1.98043 1.5 2.23478 1.5 2.5V10.5C1.5 10.7652 1.60536 11.0196 1.79289 11.2071C1.98043 11.3946 2.23478 11.5 2.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {object}   props.car          a listing, in the shape lib/strapi.js#toCar returns
 * @param {"grid"|"list"} props.variant "list" is the wide row; "grid" the column
 * @param {string}   props.detailHref   the route this card links to
 * @param {string}   props.sizes        responsive `sizes` for the photo — required:
 *                                      without it every card ships a desktop-width
 *                                      image to a ~360px phone on metered data
 */
export default function ListingCard({
  car,
  variant = "grid",
  detailHref,
  sizes = "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw",
  locale: localeProp,
  className = "",
}) {
  const t = useTranslations("browse.card");
  const routeLocale = useLocale();
  const locale = localeProp ?? routeLocale;

  if (!car) return null;

  const href = detailHref ?? listingPath(car);
  const placeholder = isPlaceholderPhoto(car);
  const photos = realPhotoCount(car);
  const sold = car.listingStatus === "sold";
  const alt = car.imageAlt || car.title || "";

  return (
    <article
      className={`asq-card asq-card--${variant}${sold ? " asq-card--sold" : ""} ${className}`.trim()}
    >
      <div className="asq-card__media">
        {car.imgSrc ? (
          <Link
            href={href}
            className="asq-card__media-link"
            // The title below is the same destination; announcing it twice adds
            // nothing for a screen reader and one more tab stop per card.
            aria-hidden="true"
            tabIndex={-1}
          >
            <Image
              className="asq-card__img"
              alt={alt}
              src={car.imgSrc}
              width={615}
              height={462}
              sizes={sizes}
            />
          </Link>
        ) : (
          <div className="asq-card__img asq-card__img--none" aria-hidden="true" />
        )}

        <div className="asq-card__badges">
          {car.featured && (
            <span className="asq-card__badge asq-card__badge--accent">
              {t("featured")}
            </span>
          )}
          {/* Was `{car?.images?.length || ""}` — which rendered a camera icon
              with no number on a one-photo listing, and counted stand-ins as
              photographs. A count is only shown when there is a real gallery
              to count. */}
          {photos > 1 && (
            <span className="asq-card__badge">
              <CameraIcon />
              <span>{photos}</span>
              <span className="asq-sr-only"> {t("photos")}</span>
            </span>
          )}
        </div>

        {Number.isFinite(Number(car.year)) && (
          <span className="asq-card__badge asq-card__year">{car.year}</span>
        )}

        {/* Full-width, not a corner chip: at OMR 1,500–6,000 the photo is the
            primary condition evidence, so a stand-in mistaken for a photograph
            is the most misleading thing this card can do. */}
        {placeholder && (
          <div className="asq-card__standin">
            <PlaceholderPhotoTag car={PLACEHOLDER_SENTINEL} locale={locale} />
          </div>
        )}
      </div>

      {/* Identity → price → disclosures → wear → place → contact. */}
      <div className="asq-card__body">
        <h3 className="asq-card__title">
          <Link href={href}>{car.title}</Link>
        </h3>

        <p className="asq-card__price">{formatPrice(car.price, car.currency, locale)}</p>

        {/* Spec origin on every card, "not stated" shown rather than hidden,
            plus as-is and verification — NICHE.md requires all of them. */}
        <ListingSignals car={car} locale={locale} className="asq-card__signals" />

        <p className="asq-card__specs">
          <span className="asq-card__km">
            {/* `pick(COPY.kmUnstated, locale)` — neither identifier exists in
                this file or anywhere in the repo. It was the remnant of a
                half-finished move from a local copy object to the message
                catalogue: the key landed in both catalogues, the call site did
                not. Reaching this branch threw `ReferenceError: COPY is not
                defined` from a Client Component, and with no error boundary in
                app/ that unwinds to Next's stock error page — so one listing
                with a null or string `mileage` blanked the whole of
                /used-cars and every facet lander, not one card. */}
            {/* The unit comes from the catalogue. It was the literal "km" —
                the only Latin word on an otherwise fully Arabic card, while
                the detail page for the same car said "كم". */}
            {Number.isFinite(car.km)
              ? `${car.km.toLocaleString("en-US")} ${t("kmUnit")}`
              : t("kmUnstated")}
          </span>
          {car.transmission && (
            <>
              <span className="asq-card__sep" aria-hidden="true">
                ·
              </span>
              <span>{car.transmission}</span>
            </>
          )}
          {car.location && (
            <>
              <span className="asq-card__sep" aria-hidden="true">
                ·
              </span>
              <span>{car.location}</span>
            </>
          )}
        </p>

        <div className="asq-card__actions">
          {/* WhatsAppButton carries `w-100`, and bootstrap.css loads after the
              component styles, so the width has to be governed by a wrapper
              rather than by the anchor. The wrapper collapses when the button
              renders nothing — a sold car, or a number we cannot dial. */}
          <div className="asq-card__whatsapp">
            <WhatsAppButton car={car} locale={locale} />
          </div>
          <Link href={href} className="asq-card__cta">
            {t("view")}
          </Link>
        </div>
      </div>
    </article>
  );
}
