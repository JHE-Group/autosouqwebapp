import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import ListingSignals from "@/components/common/ListingSignals";
import PlaceholderPhotoTag from "@/components/common/PlaceholderPhotoTag";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import Image from "next/image";
import { cars } from "@/data/cars";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The listings section of the home page.
 *
 * Changes from the template version, and why:
 *
 * - **The body-type tabs are gone.** "All / SUV / Hatchback / Sedan" is a
 *   control built for a catalogue of hundreds. Against ~10 listings, tapping
 *   "Hatchback" can return one card or none — and there was no empty branch, so
 *   it rendered a blank grid with no explanation. A filter that can silently
 *   empty the page is worse than no filter; the browse page is where filtering
 *   belongs. Removing it also removes the last reason for this to be a client
 *   component, so the home page's listing grid now ships no JavaScript at all
 *   beyond the WhatsApp anchors.
 *
 * - **Six cards, not eight.** Six tiles cleanly, with no ragged last row, at
 *   every column count this grid uses (1 / 2 / 3). Eight left an orphan at
 *   three columns, which is exactly how a thin catalogue starts to look broken.
 *
 * - **The dead icons are gone.** The compare link pointed at
 *   `#offcanvasBottom`, which this page does not render, and the heart pointed
 *   at a dashboard route behind an account system that does not exist yet. Two
 *   controls that do nothing, on a site whose proposition is that things are
 *   what they say they are.
 *
 * - **`locale` is threaded through.** `ListingSignals` and `WhatsAppButton`
 *   both take a locale and both defaulted to English here, so `/ar` rendered
 *   English spec pills and an English WhatsApp message inside an RTL document.
 *
 * - **An empty state.** `getListings()` falls back to `[]` when Strapi is
 *   unreachable and the demo array covers that today, but the section should
 *   never render a heading over nothing.
 */
export default function Cars({
  parentClass = "hp-section",
  listings,
  locale = DEFAULT_LOCALE,
  limit = 6,
}) {
  // Strapi listings when the CMS has them, the theme demo data otherwise —
  // the same idiom as carsListings/Cars1.
  const source = listings?.length ? listings : cars;
  const shown = source.slice(0, limit);

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="hp-section-head">
          <div>
            <h2 className="hp-section-title">Cars listed right now</h2>
            <p className="hp-section-lede">
              Every one of them between OMR 1,500 and 6,000, with its spec and
              its check status on the card.
            </p>
          </div>
          <Link href="/listing-grid" className="hp-link hp-link--btn">
            Browse all cars
          </Link>
        </div>

        {shown.length === 0 ? (
          <p className="hp-empty">
            No cars are listed at the moment. New ones go up as soon as they are
            checked —{" "}
            <Link href="/sell-your-car" className="hp-link">
              list yours
            </Link>
            .
          </p>
        ) : (
          <div className="hp-cars__grid">
            {shown.map((car) => (
              // Not `.hv-one`: that hover state exists to reveal the compare
              // and favourite icons, and with those gone it only dropped a 60%
              // black wash over the photograph — on top of the "No photos yet"
              // tag, which sits below it in the stacking order.
              <article key={car.id} className="box-car-list hp-card">
                <div className="image-group relative">
                  <div className="top flex-two">
                    <ul className="d-flex gap-8">
                      {car?.featured && (
                        <li className="flag-tag success">Featured</li>
                      )}
                      {/* Only when there is a number to show. The template
                          rendered the camera icon with an empty count for
                          every listing that had no gallery. */}
                      {car?.images?.length > 0 && (
                        <li className="flag-tag style-1">
                          <PhotoCountIcon />
                          {car.images.length}
                        </li>
                      )}
                    </ul>
                    <div className="year flag-tag">{car.year}</div>
                  </div>
                  <div className="img-style">
                    <Image
                      alt={car.images?.[0]?.alt || car.title || ""}
                      src={car.imgSrc}
                      width={450}
                      height={338}
                      sizes="(max-width: 639px) 100vw, (max-width: 991px) 50vw, 33vw"
                    />
                  </div>
                  <PlaceholderPhotoTag car={car} locale={locale} />
                </div>

                {/* Order: identity -> price -> disclosures -> wear -> place ->
                    contact. Price sits directly under the title because price
                    is the entry criterion on a price-banded site. */}
                <div className="content">
                  <h3 className="link-style-1 hp-card__title">
                    <Link href={`/listing-detail-v1/${car.id}`}>
                      {car.title}
                    </Link>
                  </h3>
                  <div className="money fs-20 fw-5 lh-25 text-color-3">
                    {formatPrice(car.price, car.currency)}
                  </div>
                  <ListingSignals car={car} locale={locale} className="mt-2" />
                  <div className="icon-box flex flex-wrap mt-2">
                    <div className="icons flex-three">
                      <i className="icon-autodeal-km1" />
                      <span>
                        {Number.isFinite(car.km)
                          ? `${car.km.toLocaleString("en-US")} km`
                          : "km not stated"}
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
                        <i className="icon-autodeal-location" />
                        <span>{car.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <WhatsAppButton car={car} locale={locale} />
                  </div>
                  {/* The author row was bound to authorName / authorImage,
                      null on every record by deliberate policy, so it rendered
                      an empty box on every card. */}
                  <div className="days-box flex justify-space align-center">
                    <Link
                      href={`/listing-detail-v1/${car.id}`}
                      className="view-car"
                    >
                      View car
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PhotoCountIcon() {
  return (
    <div className="icon">
      <svg
        width={16}
        height={13}
        viewBox="0 0 16 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
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
  );
}
