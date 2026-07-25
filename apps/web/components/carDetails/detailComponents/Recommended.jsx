import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import ListingSignals from "@/components/common/ListingSignals";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Other cars on the marketplace.
 *
 * The theme hardcoded four demo cars here, gave every card a dead `#` link,
 * and captioned the block "Showing 26 more cars you might like" — a count
 * nobody had counted. It now renders only listings handed to it by the page,
 * links each card at the real listing, and disappears when there is nothing
 * genuine to show.
 */
export default function Recommended({ cars, locale = DEFAULT_LOCALE }) {
  const t = useTranslations("listing.section");
  const items = (Array.isArray(cars) ? cars : []).slice(0, 4);

  if (!items.length) return null;

  const heading =
    t("recommended");

  return (
    <>
      <div className="listing-header mb-30">
        <h3>{heading}</h3>
      </div>
      <div className="listing-recommended mb-30">
        {items.map((car) => (
          <div key={car.id} className="item flex">
            <div className="image">
              <Image
                className="lazyload"
                alt={car.imageAlt || car.title || ""}
                src={car.imgSrc}
                width={450}
                height={338}
                sizes="(max-width: 991px) 100vw, 120px"
              />
            </div>
            <div className="content">
              <h6>
                <Link href={`/listing-detail-v1/${car.id}`}>{car.title}</Link>
              </h6>
              <p className="fs-14 fw-7 text-color-2 font-1">
                {formatPrice(car.price, car.currency)}
              </p>
              {/* Spec disclosure travels with every card, sidebar included. */}
              <ListingSignals car={car} locale={locale} className="mt-1" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
