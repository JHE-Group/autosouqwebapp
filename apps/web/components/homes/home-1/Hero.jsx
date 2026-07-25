import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { slides } from "@/data/heroSlides";

/**
 * The homepage hero.
 *
 * Three deliberate decisions, all of them reversals of what the theme shipped:
 *
 * 1. **No carousel, and no Swiper.** There has only ever been one slide (see
 *    data/heroSlides.js — one honest photo instead of a rotation nobody asked
 *    for). Wrapping one slide in Swiper still shipped the library on the
 *    critical path, rendered two dead prev/next arrows, and — worst — gated the
 *    headline's `.fade-item` opacity on `.swiper-slide-active`, so the H1 was
 *    invisible until JavaScript executed. On a budget Android over metered data
 *    that is a blank hero for as long as the bundle takes. This is now a server
 *    component with zero client JS: the LCP text is in the HTML.
 *
 * 2. **The scrim is CSS, not baked into the photo.** The image carries an
 *    indigo wash in its left third, which works at desktop width and disappears
 *    the moment `object-fit: cover` crops the sides on a 360px phone. The
 *    gradient in `_slider.scss` guarantees the contrast at every width and
 *    follows `dir`, so Arabic gets a scrim on the right where its text is.
 *
 * 3. **The hero now has somewhere to go.** It previously ended at three chips.
 *    Browsing is the primary act on this site and it was not offered here.
 */
export default function Hero() {
  const slide = slides[0];

  return (
    <section className="hp-hero">
      <div className="hp-hero__media">
        {/* The homepage LCP element. `priority` emits fetchpriority=high and a
            preload and cancels the lazy default; without it the browser waits
            for HTML -> CSS -> layout before even requesting it. Dimensions
            match the actual file (2560x1280). */}
        <Image
          className="hp-hero__img"
          alt="A quiet street in Muscat with an ordinary used car parked at the kerb"
          src={slide.imgSrc}
          width={2560}
          height={1280}
          sizes="100vw"
          priority
        />
      </div>

      <div className="container hp-hero__container">
        <div className="hp-hero__panel">
          <p className="hp-hero__eyebrow">Oman &middot; OMR 1,500 &ndash; 6,000</p>
          <h1 className="hp-hero__title">Affordable used cars in Oman</h1>
          <p className="hp-hero__lede">
            The price band most of the country actually buys in, and nothing
            above it. Every car is checked before it goes live.
          </p>

          {/* Three claims, each of which the site can be held to on any
              listing page. No counts, no ratings, nothing we cannot show. */}
          <ul className="hp-hero__facts">
            <li>Real asking prices</li>
            <li>GCC spec or import, stated</li>
            <li>One WhatsApp tap</li>
          </ul>

          <div className="hp-hero__actions">
            <Link href="/listing-grid" className="hp-hero__cta">
              Browse cars
            </Link>
            <Link href="/sell-your-car" className="hp-hero__cta hp-hero__cta--ghost">
              Sell your car
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
