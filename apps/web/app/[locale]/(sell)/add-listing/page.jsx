import AddListing from "@/components/dashboard/AddListing";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

/**
 * The sell form, with the site's own chrome rather than the dashboard's.
 *
 * See the note in ../layout.jsx for why this moved out of the (dashboard)
 * group. The header here is the same `Header2` every public page uses, and the
 * breadcrumb points back at /sell-your-car — which is the page that explains
 * what happens after you press publish, and the one a seller most likely came
 * from.
 */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "addListing" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });

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
                  <Link className="fw-6 text-color-3" href="/sell-your-car">
                    {crumb("sellYourCar")}
                  </Link>
                  <span>{crumb("addListing")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="tf-section3">
        <div className="container">
          <AddListing />
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
