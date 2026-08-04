import { formatPrice, formatKm } from "@/lib/format";
import { listingPath } from "@/lib/seo";
import ListingCard from "@/components/carsListings/ListingCard";
import { Link } from "@/i18n/navigation";
import ListingSignals from "@/components/common/ListingSignals";
import PlaceholderPhotoTag from "@/components/common/PlaceholderPhotoTag";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import Image from "next/image";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { getTranslations } from "next-intl/server";

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
export default async function Cars({
  parentClass = "hp-section",
  listings,
  locale = DEFAULT_LOCALE,
  limit = 6,
}) {
  const t = await getTranslations({ locale, namespace: "homeCars" });
  const tCard = await getTranslations({ locale, namespace: "browse.card" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  /**
   * Render exactly what the server resolved — never a local fallback.
   *
   * This used to read `listings?.length ? listings : cars`, substituting the
   * `data/cars.js` demo array back in whenever the CMS returned nothing. That
   * is the same defect `carsListings/useCarFilters.js` was fixed for, and it
   * silently overrode the one gate that decides whether invented inventory may
   * be shown at all: `getBrowseData()` correctly returns `[]` in production
   * with the demo flag off, and this line put six fabricated cars back on the
   * home page anyway — `index, follow`, with prices, above a ShopByBudget
   * panel that read the CMS directly and truthfully printed "None right now"
   * in all four bands.
   *
   * The decision belongs to `lib/listingSource.js` and nowhere else. If the
   * demo catalogue is wanted, that gate is what turns it on.
   */
  const source = listings ?? [];

  /*
   * Available cars first, and sold ones only as backfill.
   *
   * This section is headed «سيارات معروضة الآن» — "cars available now" — and
   * it was showing three sold cars out of six, struck-through and with no
   * WhatsApp button. The heading was simply not true, on the home page, above
   * the fold, which is the worst place on the site to be caught overstating
   * something when the whole proposition is trustworthiness.
   *
   * Sold cars are not dropped outright: with production inventory at zero and
   * a catalogue this small, six available cars may not exist, and an empty row
   * says less than a short one. They fill from the back only if there is room,
   * and the sold pill on the card keeps them honest wherever they land.
   */
  const available = source.filter((car) => car?.listingStatus !== "sold");
  const soldOnes = source.filter((car) => car?.listingStatus === "sold");
  const shown = [...available, ...soldOnes].slice(0, limit);

  return (
    <section className={parentClass}>
      <div className="container">
        <div className="hp-section-head">
          <div>
            <h2 className="hp-section-title">{t("title")}</h2>
            <p className="hp-section-lede">
              {t("lede")}
            </p>
          </div>
          <Link href="/used-cars" className="hp-link hp-link--btn">
            {tCommon("browseAll")}
          </Link>
        </div>

        {shown.length === 0 ? (
          <p className="hp-empty">
            {t.rich("empty", {
              cta: (chunks) => (
                <Link href="/add-listing" className="hp-link">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        ) : (
          <div className="hp-cars__grid">
            {shown.map((car) => (
              /*
                One card component, not two.
                
                This was 104 lines of bespoke markup that rendered the same car
                differently from the browse grid — its own price treatment, its
                own signals row, its own photo handling. ListingCard is the one
                the browse page uses and the one that gets fixed when a card bug
                is found, so the home row now uses it too and the two cannot
                drift again.
                
                `sizes` is narrower than the browse default because this row is
                at most three across on a desktop and one on a phone; the browse
                grid goes four.
              */
              <ListingCard
                key={car.id}
                car={car}
                variant="grid"
                locale={locale}
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              />
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
