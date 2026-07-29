import React from "react";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import SiteFooter from "@/components/footers/SiteFooter";
import Header2 from "@/components/headers/Header2";
import SellerAuthForm from "@/components/auth/SellerAuthForm";
import { getSession } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { safeNext } from "@/lib/safeNext";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return pageMetadata({
    title: t("signInTitle"),
    description: t("signInDescription"),
    path: "/sign-in",
    locale,
    /**
     * Not indexable.
     *
     * A sign-in form has nothing for a searcher and would compete with the
     * pages that do. `follow` so the links out of it still carry.
     */
    robots: { index: false, follow: true },
  });
}

export default async function SignInPage({ params, searchParams }) {
  const { locale } = await params;
  const { next } = (await searchParams) ?? {};

  // Already signed in — send them on rather than showing a form that would
  // sign them in as the person they already are.
  const session = await getSession();
  if (session) redirect({ href: safeNext(next), locale });

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <>
      <div className="header-fixed">
        <Header2 />
      </div>
      <section className="flat-title mb-40">
        <div className="container2">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="tfcl-card">
                <h1 className="fs-24 fw-6">{t("signInHeading")}</h1>
                <p className="tfcl-hint" style={{ marginBottom: 24 }}>
                  {t("signInLead")}
                </p>
                <SellerAuthForm mode="signin" next={safeNext(next)} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
