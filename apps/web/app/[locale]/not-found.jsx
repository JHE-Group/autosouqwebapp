import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";

/**
 * The 404 for everything under `/[locale]`.
 *
 * Without this file, an unmatched URL fell through to Next's stock page:
 * `<html>` with no `lang` and no `dir`, the English string "404: This page
 * could not be found.", no header, no footer and no way back — on a site whose
 * default locale is Arabic and reads right-to-left.
 *
 * That is not an edge case here. It is the answer for every unmatched
 * `/car/{slug}` (a dynamic route with `dynamicParams: true`), every unknown
 * `/used-cars/{facet}`, and every listing link shared on WhatsApp after the car
 * sold — which, given WhatsApp is the primary channel, is the most likely way a
 * real buyer meets a 404 here.
 *
 * Living at `app/[locale]/` rather than `app/` is what fixes the language: it
 * renders inside the locale layout, so it inherits `lang`, `dir`, the
 * stylesheet and the site chrome.
 *
 * Next does not pass route params to `not-found.jsx`, so the locale comes from
 * `getLocale()` — the request locale the middleware and layout already
 * established. Passing `DEFAULT_LOCALE` instead would render an Arabic footer
 * on `/en`.
 */
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="tf-section3">
        <div className="container">
          <div className="text-center" style={{ padding: "4rem 0" }}>
            <h1 className="fs-32 fw-6 mb-3">{t("title")}</h1>
            <p className="font-2 fs-16 lh-26 mb-4">{t("body")}</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link href="/used-cars" className="tf-btn bg-color-primary">
                {tCommon("browseAll")}
              </Link>
              <Link href="/" className="tf-btn style-border">
                {t("home")}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
