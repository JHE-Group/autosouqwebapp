import { PLACEHOLDER_NOTICE_STYLE } from "@/components/carDetails/sliders/gallery";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The card-sized version of the detail page's "illustrative image" notice.
 *
 * The detail page already tells a buyer when the picture is a stand-in rather
 * than a photograph of the actual car. On the results grid it did not, so a
 * buyer scanning twelve cards saw what looked like twelve photographs. At OMR
 * 1,500–6,000 the photo is the primary condition evidence, which makes an
 * unlabelled stand-in the most misleading thing a card can show.
 *
 * Renders nothing when the listing has real photos.
 */
export default function PlaceholderPhotoTag({ car, locale = DEFAULT_LOCALE }) {
  if (!car?.hasPlaceholderImage) return null;

  const text = locale === "ar" ? "لا توجد صور بعد" : "No photos yet";

  return (
    <span
      // Amber #B45309 on #FFF7ED is 4.76:1 — the same "information you are
      // missing" family as the spec-not-stated pill, deliberately not red.
      style={{
        ...PLACEHOLDER_NOTICE_STYLE,
        position: "absolute",
        // Logical, so the tag stays on the reading-start edge of the photo in
        // both `dir="ltr"` and `dir="rtl"`.
        insetInlineStart: 12,
        bottom: 12,
        zIndex: 2,
        fontSize: 11,
        padding: "4px 8px",
      }}
    >
      {text}
    </span>
  );
}
