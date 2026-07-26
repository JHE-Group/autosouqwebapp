import { getTranslations } from "next-intl/server";

/**
 * Cream catalogue note — same voice as the sell-flow `.tfcl-band-note`.
 * Guidance, not a rejection banner: indigo on cream is 11.19:1.
 */
export default async function PriceBandNote({
  className = "",
  messageKey = "catalogueNote",
}) {
  const t = await getTranslations("brand");

  return (
    <p className={`asq-band-note ${className}`.trim()}>{t(messageKey)}</p>
  );
}
