import React from "react";
import InfoShell from "../_components/InfoShell";
import { InfoBody } from "../_content";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.sellYourCar" });
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/sell-your-car",
    locale,
  });
}

export default async function page({ params }) {
  const { locale } = await params;
  return (
    <InfoShell breadcrumb="sellYourCar" locale={locale}>
      <InfoBody page="sell-your-car" locale={locale} />
    </InfoShell>
  );
}
