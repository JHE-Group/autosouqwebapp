import {
  importOriginLabel,
  SOLD_AS_IS,
  SOLD_AS_IS_STYLE,
  SPEC_PILL_STYLE,
  SPEC_UNSTATED_STYLE,
} from "@/lib/listingLabels";

/**
 * The two disclosures NICHE.md requires on every listing: whether the car is
 * sold as-is, and whether it is GCC spec or an import.
 *
 * Placed after the price, never over the photo, and never louder than the
 * neutral spec pill — an as-is car is not a worse car, it is a different deal.
 */
export default function ListingSignals({ car, locale = "ar", className = "" }) {
  if (!car) return null;

  const origin = importOriginLabel(car.importOrigin, locale);

  return (
    <div className={`d-flex flex-wrap gap-8 ${className}`} style={{ gap: 8 }}>
      <span style={origin.stated ? SPEC_PILL_STYLE : SPEC_UNSTATED_STYLE}>
        {origin.text}
      </span>
      {car.soldAsIs && (
        <span style={SOLD_AS_IS_STYLE}>
          {SOLD_AS_IS[locale] ?? SOLD_AS_IS.ar}
        </span>
      )}
    </div>
  );
}
