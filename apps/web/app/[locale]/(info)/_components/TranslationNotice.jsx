import React from "react";
import { getTranslations } from "next-intl/server";

/**
 * Shown only on the Arabic legal pages, under `DraftNotice`.
 *
 * The English terms and privacy texts were drafted first; the Arabic is a
 * translation of them. On a page that will eventually govern a transaction,
 * which language was drafted and which was translated is a material fact, and
 * a reader deciding whether to rely on it is entitled to know. Saying so also
 * prevents the failure mode where a translated clause diverges from the
 * drafted one and nobody can tell which was meant.
 *
 * Delete this in the same change that has counsel sign off *both* languages.
 */
export default async function TranslationNotice() {
  const t = await getTranslations("legal.translationNotice");
  return (
    <div className="bg-1 border rounded-3 p-4 mb-40" role="note">
      <p className="fs-16 fw-7 text-color-2 mb-2">{t("title")}</p>
      <p className="font-2 fs-14 lh-24 mb-0">{t("body")}</p>
    </div>
  );
}
