import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * The four promises from NICHE.md, given the weight of a proposition rather
 * than the weight of a template feature row. The OMR band sits in the section
 * lede so the home restates what the footer already says — without a fifth card.
 */

const PROMISE_KEYS = [
  {
    titleKey: "priceTitle",
    bodyKey: "priceBody",
  },
  {
    titleKey: "verifiedTitle",
    bodyKey: "verifiedBody",
  },
  {
    titleKey: "specTitle",
    bodyKey: "specBody",
  },
  {
    titleKey: "whatsappTitle",
    bodyKey: "whatsappBody",
  },
];

export default async function TrustPromises() {
  const t = await getTranslations("brand");
  const tPromise = await getTranslations("brand.promises");

  return (
    <section className="hp-band hp-band--cream hp-promises">
      <div className="container">
        <div className="hp-promises__head">
          <h2 className="hp-section-title">{t("promisesTitle")}</h2>
          <p className="hp-section-lede">{t("promisesLede")}</p>
        </div>

        <ol className="hp-promises__list">
          {PROMISE_KEYS.map((promise, i) => (
            <li key={promise.titleKey} className="hp-promise">
              <span className="hp-promise__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="hp-promise__title">{tPromise(promise.titleKey)}</h3>
              <p className="hp-promise__body">{tPromise(promise.bodyKey)}</p>
            </li>
          ))}
        </ol>

        <p className="hp-promises__foot">
          <Link href="/how-it-works" className="hp-link">
            {t("howWeCheck")}
          </Link>
        </p>
      </div>
    </section>
  );
}
