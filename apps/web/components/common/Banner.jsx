import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

/**
 * The two jobs, at the foot of the page: buy one, or sell one.
 *
 * Three fixes here:
 *
 * - **A live contrast failure.** `.tf-image-box.bg-orange` fills with
 *   terracotta `$color-3`, and both the heading and the paragraph carried
 *   `.text-color-1` (white). White on terracotta is 2.97:1 and fails AA at
 *   every size — the palette notes in `abstracts/_variables.scss` say so
 *   explicitly. Filled accent surfaces take ink instead: #231F20 on #E97451 is
 *   5.50:1. The indigo card keeps white, which is 14.12:1.
 *
 * - **Two blank grey rectangles.** `find-car-1.png` and `find-car-2.png` are
 *   the theme's unfilled placeholders — solid #D3D7E0, no illustration in them
 *   — shipped with `alt="images"`. Two requests and two decorative boxes that
 *   depict nothing. Removed; the copy gets the room instead.
 *
 * - **No vertical space.** The section wore `.tf-section-banner`, a class that
 *   is not defined anywhere in the stylesheet, so it had zero padding and
 *   collided with whatever preceded it.
 */
export default async function Banner() {
  const t = await getTranslations("homeBanner");
  return (
    <section className="hp-section hp-banner">
      <div className="container">
        <div className="row hp-banner__row">
          <div className="col-lg-6">
            <div className="tf-image-box style1 bg-orange hp-banner__card">
              <div className="content">
                <h2 className="text-color-2 hp-banner__title">
                  <Link href="/used-cars">{t("buyEyebrow")}</Link>
                </h2>
                <p className="text-color-2">
                  {t("buyBody")}
                </p>
                <Link href="/used-cars" className="find-cars">
                  <span>{t("buyCta")}</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            {/* Not `.bg-black`: `_widget.scss` sets that to $brand-indigo, but
                Bootstrap ships a `.bg-black { background: #000 !important }`
                utility that wins, so this card has been rendering pure black
                rather than the brand indigo. */}
            <div className="tf-image-box style1 hp-banner__card hp-banner__card--indigo">
              <div className="content">
                <h2 className="text-color-1 hp-banner__title">
                  <Link href="/sell-your-car">{t("sellEyebrow")}</Link>
                </h2>
                <p className="text-color-1">
                  {t("sellBody")}
                </p>
                <Link href="/add-listing" className="find-cars">
                  <span>{t("sellCta")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
