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
    title: t("signUpTitle"),
    description: t("signUpDescription"),
    path: "/sign-up",
    locale,
    // Not indexable, for the same reason as sign-in.
    robots: { index: false, follow: true },
  });
}

export default async function SignUpPage({ params, searchParams }) {
  const { locale } = await params;
  const { next } = (await searchParams) ?? {};

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
            {/* mx-auto, not offset-lg-3: Bootstrap's offset is margin-left,
                which the four-entry RTL shim in style.scss does not cover, so the
                Arabic page — the default locale — sat off-centre. */}
            <div className="col-lg-6 mx-auto">
              <div className="tfcl-card">
                <h1 className="fs-26 fw-6">{t("signUpHeading")}</h1>
                <p className="tfcl-hint" style={{ marginBottom: 24 }}>
                  {t("signUpLead")}
                </p>
                <SellerAuthForm mode="signup" next={safeNext(next)} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
