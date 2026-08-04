/**
 * The places a seller can choose, and what the CMS can actually store.
 *
 * These are not the same list, and the gap was silent. The form offers 24
 * places; apps/cms/src/index.ts seeds six city rows — Muscat, Salalah, Sohar,
 * Nizwa, Sur, Barka. `pickTaxonomy` missed on the other 18, `resolveRelations`
 * logged a warning and filed the listing anyway by design, and the seller was
 * never told their answer had gone.
 *
 * The cost was not only a missing field. The city relation composes the public
 * URL and decides facet membership, so a seller in Ruwi or Al Khuwair — which
 * is most sellers, this being where the cars are — produced a listing that
 * joined no city facet at all. `/used-cars/muscat` needs MIN_LISTINGS_FOR_FACET
 * behind it before it exists, and the sellers most likely to unlock it were the
 * ones being dropped.
 *
 * So `parent` rather than 18 new taxonomy rows. Seeb, Bawshar, Muttrah, Al
 * Amarat and Quriyat are wilayats of Muscat Governorate; Al Khuwair, Ruwi,
 * Qurum and the rest are neighbourhoods inside them. Making each a peer of
 * Muscat would split one facet nine ways and leave every part below the gate.
 * Relating them to Muscat concentrates it, which is both what the geography
 * says and what the site needs.
 *
 * Nothing the seller said is lost: buildDescription already writes
 * `Location: {city} — {area}` into the listing prose, so "Ruwi" survives as
 * text on the page while the relation says Muscat.
 *
 * Five places have no parent and no CMS row — Ibri, Rustaq, Ibra, Buraimi,
 * Khasab. They are genuinely separate cities in other governorates and want
 * their own rows, which is a CMS-branch change. Until then they resolve to
 * nothing, exactly as before, and the seller's answer still reaches the
 * description.
 */

const MUSCAT = "Muscat";

export const OMAN_CITIES = [
  // Muscat Governorate first — highest listing volume (seo-research §3.5).
  { en: "Muscat", ar: "مسقط" },
  { en: "Seeb", ar: "السيب", parent: MUSCAT },
  { en: "Bawshar", ar: "بوشر", parent: MUSCAT },
  { en: "Muttrah", ar: "مطرح", parent: MUSCAT },
  { en: "Al Amarat", ar: "العامرات", parent: MUSCAT },
  { en: "Al Khuwair", ar: "الخوير", parent: MUSCAT },
  { en: "Al Ghubrah", ar: "الغبرة", parent: MUSCAT },
  { en: "Azaiba", ar: "العذيبة", parent: MUSCAT },
  { en: "Ruwi", ar: "روي", parent: MUSCAT },
  { en: "Qurum", ar: "القرم", parent: MUSCAT },
  { en: "Al Mawaleh", ar: "الموالح", parent: MUSCAT },
  { en: "Al Khoud", ar: "الخوض", parent: MUSCAT },
  { en: "Al Maabilah", ar: "المعبيلة", parent: MUSCAT },
  { en: "Quriyat", ar: "قريات", parent: MUSCAT },
  // Rest of Oman
  { en: "Sohar", ar: "صحار" },
  { en: "Barka", ar: "بركاء" },
  { en: "Salalah", ar: "صلالة" },
  { en: "Nizwa", ar: "نزوى" },
  { en: "Sur", ar: "صور" },
  { en: "Ibri", ar: "عبري" },
  { en: "Rustaq", ar: "الرستاق" },
  { en: "Ibra", ar: "إبراء" },
  { en: "Buraimi", ar: "البريمي" },
  { en: "Khasab", ar: "خصب" },
];

/**
 * The city a place should be filed under, or null if it is already one.
 *
 * Matches on either language, because the form stores whichever label the
 * seller picked and Arabic is the default locale.
 */
export function cityParent(value) {
  const wanted = String(value ?? "").trim().toLowerCase();
  if (!wanted) return null;
  const hit = OMAN_CITIES.find(
    (city) =>
      city.en.toLowerCase() === wanted || city.ar === String(value).trim(),
  );
  return hit?.parent ?? null;
}
