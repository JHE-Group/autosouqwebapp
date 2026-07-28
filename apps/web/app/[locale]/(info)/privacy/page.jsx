import React from "react";
import InfoShell from "../_components/InfoShell";
import { InfoBody } from "../_content";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.privacy" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/privacy",
    locale,
    // noindex until counsel signs this off. Remove with the bracketed details.
    robots: { index: false, follow: true },
  });
}

export default async function page({ params }) {
  const { locale } = await params;
  return (
    <InfoShell breadcrumb="privacy" locale={locale}>
      <InfoBody page="privacy" locale={locale} />
    </InfoShell>
  );
}
