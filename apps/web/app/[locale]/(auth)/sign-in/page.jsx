import React from "react";
import Image from "next/image";
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
  const { next, notice, email } = (await searchParams) ?? {};

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
      {/*
        `tfcl-auth`, not `flat-title`. That class is the breadcrumb bar
        (_section.scss: a bottom border plus 64px of margin), and both pages
        instantiated it EMPTY — drawing a stray full-bleed rule above the card
        and stacking `mb-40 !important` on top of its own spacing. `container2`
        is a 1750px content column, which is not what a 440px login box wants.

        `<main>` because these two pages were the only ones on the site without
        the landmark, and there is no skip link to compensate.
      */}
      <section className="tfcl-auth">
        <div className="container">
          <main className="tfcl-auth__card">
            {/*
              Decorative: the <h1> below names the page and the site header
              already names the site, so announcing the logo would be the third
              time. 164x57 preserves the 566.9x196.1 viewBox — the brand README
              warns that reusing another lockup's dimensions squashes the mark.
              `unoptimized` because /_next/image does not process SVG, by
              deliberate policy in next.config.mjs.
            */}
            <Image
              src="/assets/images/brand/logo-horizontal-om-primary.svg"
              alt=""
              aria-hidden
              width={164}
              height={57}
              unoptimized
              className="tfcl-auth__logo"
            />
            <h1 className="tfcl-auth__title">{t("signInHeading")}</h1>
            <p className="tfcl-auth__lead">{t("signInLead")}</p>
            {/*
              `notice` and `defaultEmail` arrive from the sign-up form when the
              account was created but the automatic sign-in failed. That is a
              success, so it must not appear in the error channel — and the seller
              should not retype the address they just chose.
            */}
            <SellerAuthForm
              mode="signin"
              next={safeNext(next)}
              notice={notice === "account_created" ? "accountCreatedSignIn" : null}
              defaultEmail={typeof email === "string" ? email : ""}
            />
          </main>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </>
  );
}
