import { DEFAULT_LOCALE } from "@/lib/locale";
/**
 * Gallery images for one listing.
 *
 * Every slider in this folder shipped with the theme's own showroom photos
 * hardcoded ("listing-detai-1.jpg" and friends), so the detail page showed
 * pictures of a car that was not the car for sale. On a marketplace whose only
 * differentiator is trust, that is the single worst thing on the page — so all
 * four sliders now read the listing's own gallery through here.
 */
export function galleryImages(carItem) {
  const images = Array.isArray(carItem?.images)
    ? carItem.images.filter((img) => img?.src)
    : [];

  if (images.length) return images;

  // `toCar()` always leaves an imgSrc — a real cover shot, or the generated
  // stand-in flagged by `hasPlaceholderImage` below.
  if (carItem?.imgSrc) {
    return [
      {
        src: carItem.imgSrc,
        alt: carItem.imageAlt || carItem.title || "",
        width: 940,
        height: 825,
      },
    ];
  }

  return [];
}

/**
 * Shown whenever the listing is still running on generated placeholder
 * imagery (see lib/strapi.js). A buyer must never mistake a stand-in for a
 * photograph of the actual car.
 */
export const PLACEHOLDER_NOTICE = {
  en: "Illustrative image — the seller has not uploaded photos of this car yet.",
  ar: "صورة توضيحية — لم يرفع البائع صور هذه السيارة بعد.",
};

export function placeholderNotice(carItem, locale = DEFAULT_LOCALE) {
  if (!carItem?.hasPlaceholderImage) return null;
  return PLACEHOLDER_NOTICE[locale] ?? PLACEHOLDER_NOTICE.ar;
}

/**
 * The four-word version, burned into the corner of the image itself.
 *
 * The sentence below the gallery is the full disclosure, but a buyer swiping a
 * phone looks at the picture and not at the caption. Most listings currently
 * run on a generated stand-in, so on most listings the largest, most
 * persuasive object on the page is an image of a car that is not for sale.
 * The label has to be on the object it is about.
 */
export const PLACEHOLDER_TAG = {
  en: "Not a photo of this car",
  ar: "ليست صورة هذه السيارة",
};

export function placeholderTag(carItem, locale = DEFAULT_LOCALE) {
  if (!carItem?.hasPlaceholderImage) return null;
  return PLACEHOLDER_TAG[locale] ?? PLACEHOLDER_TAG.ar;
}

// Amber on cream-white, same family as the other "information you are
// missing" states in lib/listingLabels.js. Never red: nothing is wrong here.
//
// Also consumed by components/common/PlaceholderPhotoTag.jsx for the results
// card — keep it a pill, and add new shapes below rather than reshaping this.
export const PLACEHOLDER_NOTICE_STYLE = {
  color: "#B45309",
  background: "#FFF7ED",
  border: "1px solid rgba(180, 83, 9, 0.25)",
  borderRadius: 5,
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 12px",
  lineHeight: 1.4,
};

/**
 * Detail-page treatment of the same disclosure.
 *
 * The pill above was the whole disclosure on the detail page, and a small
 * rounded amber chip under a large photograph reads as decoration — a "new"
 * flash, a tag, something the eye has been trained to skip. It is not
 * decoration: on most of the catalogue it is the difference between a buyer
 * believing they have seen the car and knowing they have not.
 *
 * So the detail page gets a full-bleed notice instead: sentence in brand ink
 * (#231F20 on #FFF7ED = 15.35:1, so the message does not depend on colour
 * vision), an amber rail on the reading-start edge, square top corners so it
 * reads as attached to the image above rather than floating beside it.
 * `border-inline-start` and `padding-inline` keep it correct under dir="rtl".
 */
export const PLACEHOLDER_NOTICE_BAR_STYLE = {
  color: "#231F20",
  background: "#FFF7ED",
  borderInlineStart: "4px solid #B45309",
  borderRadius: "0 0 12px 12px",
  fontSize: 13,
  lineHeight: 1.5,
  paddingBlock: "12px",
  paddingInline: "14px",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
};

// The in-image label. Solid, never translucent: at 95% over a dark photo the
// amber drops to 4.49:1, which is under AA. White on solid #B45309 is 5.02:1
// and is the same whatever is behind it.
export const PLACEHOLDER_TAG_STYLE = {
  position: "absolute",
  insetInlineStart: 12,
  insetBlockStart: 12,
  zIndex: 2,
  color: "#FFFFFF",
  background: "#B45309",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  padding: "5px 10px",
  lineHeight: 1.4,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  pointerEvents: "none",
};
