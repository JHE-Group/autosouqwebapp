import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { guidePath, guidesInOrder } from "@/data/guides";

/**
 * Three of the buying guides, on the home page.
 * Lede ties the section to Autosouq’s affordable OMR band.
 */
export default async function Guides({ limit = 3 }) {
  const t = await getTranslations("brand");
  const shown = guidesInOrder.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <section className="hp-section hp-guides">
      <div className="container">
        <div className="hp-section-head">
          <div>
            <h2 className="hp-section-title">{t("guidesTitle")}</h2>
            <p className="hp-section-lede">{t("guidesLede")}</p>
          </div>
          <Link href="/guides" className="hp-link hp-link--btn">
            {t("guidesAll")}
          </Link>
        </div>

        <ul className="hp-guides__list">
          {shown.map((guide) => (
            <li key={guide.slug} className="hp-guide">
              <h3 className="hp-guide__title">
                <Link href={guidePath(guide.slug)}>{guide.title}</Link>
              </h3>
              <p className="hp-guide__summary">{guide.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
