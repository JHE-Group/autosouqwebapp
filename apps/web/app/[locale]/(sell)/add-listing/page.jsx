import AddListing from "@/components/dashboard/AddListing";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import { Link, redirect } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth";
import { getMakeVocabulary } from "@/lib/strapi";

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

  /**
   * An account is required to list a car.
   *
   * Checked on the server, before the form renders. Hiding the form in the
   * client would be decoration — /api/listings answers 401 without a session
   * regardless, and the CMS refuses an unauthenticated create beneath that —
   * but a seller should find that out before filling in six steps, not after.
   *
   * `next` carries them back here once they are signed in, so the account is a
   * detour rather than a dead end. lib/safeNext.js is what stops that parameter
   * being turned into an off-site redirect.
   */
  const session = await getSession();
  if (!session) {
    redirect({ href: "/sign-in?next=/add-listing", locale });
  }

  const crumb = await getTranslations({ locale, namespace: "breadcrumb" });

  /*
   * Fetched here rather than in the form.
   *
   * AddListing is a client component, so a fetch inside it would run in the
   * browser — which the CSP forbids (`connect-src 'self'`, precisely so the
   * browser never talks to the CMS) and which would also mean every seller
   * waits for a round trip after the page has already painted. The server
   * already has the data by the time the form exists.
   *
   * An empty array is a legitimate answer: the fields degrade to plain text
   * inputs, which is what they were before suggestions existed.
   */
  const makes = await getMakeVocabulary();

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
          {/* The id scopes the localStorage draft. Without it a shared phone
              offers one seller the other's half-written car — see
              lib/listingDraft.js. It is an integer, never rendered. */}
          <AddListing makes={makes} sellerId={session.id} />
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
