import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BUDGET_BANDS, bandParam, countInBand } from "@/data/budgetBands";
import { CANONICAL_LISTINGS_PATH } from "@/lib/seo";

/**
 * Four budget short-links into browse — the homepage's first narrowed route
 * into the catalogue.
 *
 * ## Why links to `?price=`, and not to landing pages
 *
 * The obvious build is four indexable `/used-cars/{band}` pages. There is no
 * room for them: the facet gate needs five matched listings, and four bands
 * over a small catalogue puts two or three cars in each. Partitioning is the
 * point — every car sits in exactly one band — so the bands cannot borrow each
 * other's inventory to clear a gate the way nested "under X" pages do.
 *
 * A query param has none of that problem. `pageMetadata()` builds the canonical
 * from a fixed path, so `/ar/used-cars?price=…` already self-canonicalises to
 * `/ar/used-cars`: no new URL, no thin page, no crawl surface. And the
 * destination is the hub, which always exists — a band with two cars in it
 * shows two cars rather than a 404.
 *
 * ## Counts
 *
 * From `cms` — **real inventory** — never `listings`, which falls back to the
 * demo catalogue. That fallback holds 40 in-band cars, so a count taken from it
 * would print "24 cars" on the homepage of a site with seven. That is the exact
 * failure the theme's `Categories` block was deleted for: invented inventory
 * counts on the front page of a marketplace whose promise is that its numbers
 * are real.
 *
 * Counted with `countInBand`, the same predicate the destination filters on, so
 * the number and the page it leads to cannot disagree about what a band means.
 * They can still disagree about *when* — the count is up to ~30s stale via ISR
 * — which is why the copy says what is *listed*, and why a band that empties
 * between render and tap lands on the browse page's own empty state rather
 * than a lie.
 *
 * ## Zero
 *
 * A band with nothing in it renders as plain text, not a link. Hiding it would
 * be the wrong call: the band's existence is a fact about the product — this is
 * a OMR 1,000–6,000 marketplace — not a fact about today's stock. Telling a
 * buyer with OMR 1,200 that we do not serve them would be false.
 */
export default async function ShopByBudget({ listings = [], locale }) {
  const t = await getTranslations({ locale, namespace: "budget" });

  return (
    <section className="hp-section">
      <div className="container">
        <h2 className="hp-section-title">{t("title")}</h2>
        <p className="hp-section-lede">{t("lede")}</p>

        <ul className="hp-budget__list">
          {BUDGET_BANDS.map((band) => {
            const count = countInBand(listings, band);
            /*
             * One <bdi> around the whole numeric run, separator included.
             *
             * Under UAX#9 the en dash between two digit runs is neutral and
             * resolves to RTL inside an Arabic paragraph, which reorders the
             * numbers: "1,500–2,500" renders as "2,500–1,500". Splitting into
             * two isolates does not help — each becomes a single neutral to the
             * outer resolution and they swap for the same reason. `dir="ltr"`
             * is explicit rather than relying on `auto`, which resolves from
             * the first *strong* character and a digit run has none.
             */
            const label = t.rich("amount", {
              amount: t(`band.${band.id}`),
              // A *tag* function, not a placeholder value: `{amount}` is the
              // number, `<amt>` is what wraps it. Word order lives in the
              // catalogue — English puts the currency first, Arabic last — so
              // neither language has to fight the other's.
              amt: (chunks) => <bdi dir="ltr">{chunks}</bdi>,
            });

            const body = (
              <>
                {/* Names the band for a screen reader, which otherwise hears
                    four links called "OMR 1,500–2,500" with no subject.
                    Concatenated rather than aria-label so the visible text
                    stays a substring of the accessible name (SC 2.5.3). */}
                <span className="asq-sr-only">{t("srPrefix")} </span>
                <span className="hp-budget__label">{label}</span>
                <span className="hp-budget__count">{t("count", { count })}</span>
              </>
            );

            return (
              <li key={band.id} className="hp-budget__item">
                {count > 0 ? (
                  <Link
                    className="hp-budget__rung"
                    href={`${CANONICAL_LISTINGS_PATH}?price=${bandParam(band)}`}
                  >
                    {body}
                  </Link>
                ) : (
                  <span className="hp-budget__rung hp-budget__rung--empty">
                    {body}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
