import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { slides } from "@/data/heroSlides";

/**
 * The homepage hero.
 *
 * Brand test: with the nav logo removed, the first viewport must still read as
 * Autosouq — the product name is the display line, the OMR band sits in the
 * one headline, then one lede, facts, and CTAs over a full-bleed photo.
 */
export default async function Hero() {
  const t = await getTranslations("brand");
  const slide = slides[0];

  return (
    <section className="hp-hero">
      <div className="hp-hero__media">
        {/* Alt text is content, not chrome: this was a hardcoded English
            sentence describing the LCP image of the *Arabic* homepage.

            The homepage LCP element. `priority` emits fetchpriority=high and a
            preload and cancels the lazy default; without it the browser waits
            for HTML -> CSS -> layout before even requesting it. Dimensions
            match the actual file (2560x1280). */}
        <Image
          className="hp-hero__img"
          alt={t("heroImageAlt")}
          src={slide.imgSrc}
          width={2560}
          height={1280}
          sizes="100vw"
          priority
        />
      </div>

      <div className="container hp-hero__container">
        <div className="hp-hero__panel">
          {/*
            The brand name is the *display* line, not the heading.

            These two were the other way round, which put `Autosouq.om` — a
            Latin string, identical in both languages — in the `<h1>` of the
            site's highest-authority page. On /ar that meant the one heading on
            the x-default, priority-1.0 URL supported none of its own <title>
            ("سيارات مستعملة بأسعار في المتناول في عُمان"), while the Arabic
            text that does carry the query sat in a <p> underneath it.

            Only the tags swap. Both classes set their own font-size,
            line-height and margin (scss/component/_slider.scss:1864-1882), so
            the hero renders pixel-identically; what changes is which line the
            document outline and a screen reader's heading list call the page.
          */}
          <p className="hp-hero__title">{t("name")}</p>
          <h1 className="hp-hero__headline">{t("heroHeadline")}</h1>
          <p className="hp-hero__lede">{t("heroLede")}</p>

          <ul className="hp-hero__facts">
            <li>{t("heroFactPrices")}</li>
            <li>{t("heroFactSpec")}</li>
            <li>{t("heroFactWhatsapp")}</li>
          </ul>

          <div className="hp-hero__actions">
            <Link href="/used-cars" className="hp-hero__cta">
              {t("browseCars")}
            </Link>
            <Link href="/add-listing" className="hp-hero__cta hp-hero__cta--ghost">
              {t("sellYourCar")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
