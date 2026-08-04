import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header2 from "@/components/headers/Header2";
import SiteFooter from "@/components/footers/SiteFooter";
import ListingCard from "@/components/carsListings/ListingCard";
import { getShowroom, getShowroomListings } from "@/lib/strapi";
import { pageMetadata } from "@/lib/seo";

/**
 * A showroom's public page.
 *
 * The last piece of the showroom feature. Until now the badge on a car detail
 * page named the business and linked nowhere, which is the wrong half of a
 * trust signal: it told a buyer "a dealer filed this" and gave them no way to
 * see what else that dealer has, or whether they look like a going concern.
 * Being able to check is most of what the badge is worth.
 *
 * Only approved showrooms resolve. lib/strapi's getShowroom reads the LIST
 * endpoint, whose controller clamps `state` to `approved` — so a pending or
 * declined application 404s here even if someone knows its slug exactly. That
 * matters: an application is a record of who applied and, sometimes, who was
 * turned down.
 */

// Thirty seconds, like the rest of the CMS-backed pages. A showroom that adds a
// car should see it here without a deploy, and a page that is wrong for half a
// minute costs less than rendering this per request for every crawler.
export const revalidate = 30;

// Showrooms are approved one at a time by a person, so there is no useful set
// to prerender at build time — and hardcoding one would mean a newly approved
// showroom 404s until the next deploy.
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const showroom = await getShowroom(slug, locale);
  const t = await getTranslations({ locale, namespace: "showroomPage" });

  if (!showroom) {
    /*
     * noindex on the not-found branch.
     *
     * getShowroom returns null both for "no such showroom" and for "the CMS did
     * not answer", and the second is transient. Without this, a thirty-second
     * CMS restart could get a real showroom's URL indexed as a 404 page — the
     * same failure mode the listings fetcher was rewritten to avoid.
     */
    return { title: t("notFound.title"), robots: { index: false, follow: false } };
  }

  /*
   * Two whole sentences rather than one with an optional fragment in it.
   *
   * The first version interpolated a `{where}` that was "" for a showroom with
   * no city, which left "on Autosouq.om ." — a space before the full stop, in
   * the meta description, which is the one string a search result shows. A
   * .trim() does not reach inside a sentence. Two keys cost one branch and
   * cannot produce a broken sentence in either language.
   */
  const description = showroom.city
    ? t("metaDescriptionCity", { name: showroom.name, city: showroom.city })
    : t("metaDescription", { name: showroom.name });

  return pageMetadata({
    title: t("metaTitle", { name: showroom.name }),
    description,
    path: `/showrooms/${slug}`,
    locale,
    // A dealer is an organisation, not an article or a product.
    type: "profile",
  });
}

export default async function Page({ params }) {
  const { locale, slug } = await params;

  const [showroom, t, crumb] = await Promise.all([
    getShowroom(slug, locale),
    getTranslations({ locale, namespace: "showroomPage" }),
    getTranslations({ locale, namespace: "breadcrumb" }),
  ]);

  if (!showroom) notFound();

  // Fetched after the showroom resolves rather than alongside it: a 404 should
  // not also cost a full listings query.
  const cars = await getShowroomListings(slug, locale);

  /*
   * Arabic uses its own comma (U+060C). Joining with a Latin one on the Arabic
   * page is the kind of detail that reads as machine-made to a native speaker,
   * and it costs one conditional to get right.
   */
  const place = [showroom.area, showroom.city]
    .filter(Boolean)
    .join(locale === "ar" ? "\u060C " : ", ");

  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>

      <section className="flat-title mb-40">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="title-inner style">
                <div className="title-group fs-12">
                  <Link className="home fw-6 text-color-3" href="/">
                    {crumb("home")}
                  </Link>
                  <Link className="fw-6 text-color-3" href="/used-cars">
                    {crumb("usedCars")}
                  </Link>
                  <span>{showroom.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tf-section3">
        <div className="container">
          {/* ---- who they are ------------------------------------------ */}
          <div className="asq-showroom-head">
            {showroom.logo ? (
              <Image
                className="asq-showroom-logo"
                src={showroom.logo}
                alt={showroom.name}
                width={96}
                height={96}
                unoptimized
              />
            ) : null}
            <div>
              <h1 className="asq-showroom-name">{showroom.name}</h1>
              {/*
                The Latin name under the Arabic one, when they differ. A buyer
                checking a business against its signage or its commercial
                registration is looking for the registered spelling, and on the
                Arabic page that is the one thing the heading does not give
                them. `dir="ltr"` so it does not reorder inside an RTL block.
              */}
              {showroom.nameLatin && showroom.nameLatin !== showroom.name ? (
                <p className="asq-showroom-alt" dir="ltr">
                  {showroom.nameLatin}
                </p>
              ) : null}
              <p className="asq-showroom-meta">
                {/* The badge, restated as a sentence. It is the reason this
                    page is worth reading, so it should not be a bare word. */}
                <span className="asq-showroom-verified">{t("verified")}</span>
                {place ? <span className="asq-showroom-dot">{place}</span> : null}
              </p>
            </div>
          </div>

          {showroom.about ? (
            <p className="asq-showroom-about">{showroom.about}</p>
          ) : null}

          {/*
            No phone number and no WhatsApp button here.

            Deliberate. Contact belongs on a car — the buyer is asking about a
            specific vehicle at a specific price, and every enquiry route the
            site has is built around one listing. A bare number on a business
            page produces "do you have anything for 2,000?" calls, which is the
            conversation the listings below are meant to have already had.
          */}

          {/* ---- what they have ---------------------------------------- */}
          <h2 className="asq-showroom-cars-title">
            {t("carsTitle", { count: cars.length })}
          </h2>

          {cars.length === 0 ? (
            <p className="tfcl-hint">{t("noCars")}</p>
          ) : (
            <div className="row">
              {cars.map((car) => (
                <div key={car.id ?? car.slug} className="col-lg-4 col-md-6 col-12">
                  <ListingCard car={car} locale={locale} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter locale={locale} />
    </>
  );
}
