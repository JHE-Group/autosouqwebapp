import { useTranslations } from "next-intl";
import {
  importOriginLabel,
  SOLD_AS_IS,
  SOLD_AS_IS_STYLE,
  SPEC_PILL_STYLE,
  SPEC_UNSTATED_STYLE,
} from "@/lib/listingLabels";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The disclosures NICHE.md requires on every listing: whether the car is sold
 * as-is, whether it is GCC spec or an import, whether we have actually checked
 * the listing, and whether it is still for sale.
 *
 * Placed after the price, never over the photo, and never louder than the
 * neutral spec pill — an as-is car is not a worse car, it is a different deal.
 *
 * Spec and verification were previously card-absent on most surfaces while
 * NICHE.md says spec disclosure is shown "always" and verification is the
 * whole proposition; both now travel with this one component so a buyer
 * scanning a grid sees what a buyer on a detail page sees.
 */




/**
 * Compact wording for dense card layouts.
 *
 * Shorter, but it still names the actor: "Verified" on its own is the word the
 * incumbents have drained of meaning, and dropping "Autosouq" to save four
 * characters would give away the only thing that makes this badge worth more
 * than theirs.
 */

// #2B2F33 on #E9EAEB is 11.20:1. Sold is a fact about availability, not a
// warning about the car, so it is the loudest *neutral* we have — never red.
const STATUS_STYLE = {
  ...SPEC_PILL_STYLE,
  color: "#2B2F33",
  background: "#E9EAEB",
  border: "1px solid #DCDDDE",
};

// #0B7A44 on #ECFDF3 is 5.13:1 — the same green ProfileInfo already uses for
// the detail-page badge, so the card and the page say the same thing.
const VERIFIED_STYLE = {
  ...SPEC_PILL_STYLE,
  color: "#0B7A44",
  background: "#ECFDF3",
  border: "1px solid rgba(11, 122, 68, 0.25)",
};

export default function ListingSignals({
  car,
  locale = DEFAULT_LOCALE,
  className = "",
  // Off on the detail page, where ProfileInfo already carries the badge in
  // full. On everywhere else, because "always" is what NICHE.md says.
  showVerification = true,
  /**
   * Denser type and padding for narrow cards. An as-is US import that has not
   * been checked yet carries three pills, four with a status — at 360px that
   * is three wrapped rows at the default size.
   *
   * Compact shrinks the pills; it never *drops* one. Which disclosures appear
   * is a NICHE.md question, not a layout one, so no caller gets to trade a
   * disclosure for a tidier card.
   */
  compact = false,
}) {
  // Before the `!car` guard: hooks must run in the same order every render, and
  // an early return above this one makes the call conditional.
  const t = useTranslations("common");

  if (!car) return null;

  const origin = importOriginLabel(car.importOrigin, locale);
  const status =
    car.listingStatus === "sold" || car.listingStatus === "reserved"
      ? car.listingStatus
      : null;

  // 11px/600 still clears the 4.5:1 pairings above; only the box shrinks.
  const dense = compact ? { fontSize: 11, padding: "3px 8px" } : null;
  const style = (base) => (dense ? { ...base, ...dense } : base);

  return (
    <div
      className={`d-flex flex-wrap ${className}`}
      style={{ gap: compact ? 6 : 8 }}
    >
      {status && <span style={style(STATUS_STYLE)}>{t(status)}</span>}
      <span style={style(origin.stated ? SPEC_PILL_STYLE : SPEC_UNSTATED_STYLE)}>
        {origin.text}
      </span>
      {car.soldAsIs && (
        <span style={style(SOLD_AS_IS_STYLE)}>{t("soldAsIs")}</span>
      )}
      {showVerification && (
        <span style={style(car.verified ? VERIFIED_STYLE : SPEC_UNSTATED_STYLE)}>
          {car.verified
            ? t(compact ? "verifiedShort" : "verified")
            : t("unverified")}
        </span>
      )}
    </div>
  );
}
