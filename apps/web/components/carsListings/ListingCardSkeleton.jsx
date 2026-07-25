import { useTranslations } from "next-intl";

/**
 * The waiting state for the listing surfaces.
 *
 * NICHE.md's audience is on budget Android over metered data, where the gap
 * between "the page is coming" and "the page is broken" is measured in seconds
 * and decided by whether anything is on screen. These blocks are sized from the
 * real card — same 4:3 media, same line rhythm — so nothing jumps when the data
 * lands.
 *
 * Deliberately contentless: a skeleton that hints at a price or a badge is
 * inventing data, and this catalogue's whole proposition is that it does not.
 * `aria-hidden` plus one polite live message means a screen reader hears
 * "Loading listings", not a dozen empty articles.
 */

const LINES = [
  { className: "asq-skeleton__line asq-skeleton__line--title" },
  { className: "asq-skeleton__line asq-skeleton__line--price" },
  { className: "asq-skeleton__line asq-skeleton__line--pills" },
  { className: "asq-skeleton__line asq-skeleton__line--specs" },
  { className: "asq-skeleton__line asq-skeleton__line--action" },
];

export function ListingCardSkeleton({ variant = "grid" }) {
  return (
    <div
      className={`asq-card asq-card--${variant} asq-skeleton`}
      aria-hidden="true"
    >
      <div className="asq-card__media asq-skeleton__block" />
      <div className="asq-card__body">
        {LINES.map((line, i) => (
          <div key={i} className={line.className} />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {number} count how many placeholders to draw. Keep it at or below the
 *   page size actually in use — a twelve-card skeleton that resolves to three
 *   cars is its own small dishonesty about how much inventory is coming.
 */
export default function ListingGridSkeleton({
  count = 6,
  variant = "grid",
  className = "",
  label,
}) {
  const t = useTranslations("browse.toolbar");
  return (
    <div className={className} role="status" aria-live="polite">
      <span className="asq-sr-only">{label ?? t("loading")}</span>
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
