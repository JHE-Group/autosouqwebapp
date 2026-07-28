import { Link } from "@/i18n/navigation";
import React from "react";
import { getTranslations } from "next-intl/server";

/**
 * Draft-status banner for the two legal pages.
 *
 * These texts were written by a non-lawyer to describe honestly what the
 * service does. They are NOT legal advice and are NOT in force. This banner
 * sits directly under the h1 and must stay there until counsel has reviewed
 * and signed off the wording — deleting it is a launch-blocking change.
 *
 * bg-1 is the existing terracotta 6% tint token; body text on it is ink
 * (white on terracotta is 2.97:1 and fails AA — see _variables.scss).
 */
export default async function DraftNotice() {
  const t = await getTranslations("legal.draftNotice");
  return (
    <div className="bg-1 border rounded-3 p-4 mb-40" role="note">
      <p className="fs-16 fw-7 text-color-2 mb-2">{t("title")}</p>
      <p className="font-2 fs-14 lh-24 mb-0">
        {t("body")}{" "}
        <Link className="fw-6" href="/contact">
          {t("contactUs")}
        </Link>{" "}
        {t("tail")}
      </p>
    </div>
  );
}
