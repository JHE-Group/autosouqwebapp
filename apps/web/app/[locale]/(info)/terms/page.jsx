import React from "react";
import InfoShell from "../_components/InfoShell";
import { InfoBody } from "../_content";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.terms" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/terms",
    locale,
    // noindex until counsel signs this off. Remove with the bracketed details.
    robots: { index: false, follow: true },
  });
}

export default async function page({ params }) {
  const { locale } = await params;
  return (
    <InfoShell breadcrumb="terms" locale={locale}>
      <InfoBody page="terms" locale={locale} />
    </InfoShell>
  );
}
