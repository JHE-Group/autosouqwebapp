import React from "react";
import { Link } from "@/i18n/navigation";

/**
 * The honest empty state.
 *
 * The AutoDeal template shipped this dashboard full of invented people —
 * named reviewers, stock avatars, whole message threads written in lorem
 * ipsum. On a marketplace whose entire differentiator is trust (NICHE.md:
 * "the price you see is the real price, listings are verified"), inventing
 * users on the seller's own dashboard is precisely what the business exists
 * to oppose. Replacing them with *better* fakes would be the same lie told
 * more carefully, so these screens now show nothing until there is something
 * real to show. Empty is what a new seller actually sees, and it is true.
 *
 * Which makes the empty state a designed screen rather than a fallback. Every
 * one of these carries the same three things in the same order:
 *
 *   1. what is true right now, phrased as a state and not an error
 *   2. what happens next, in the seller's own terms
 *   3. exactly one thing to do about it
 *
 * `steps` is where (2) lives. It is deliberately a short ordered list rather
 * than a paragraph: this audience is reading on a phone, often in a second
 * language, and a numbered list survives skimming where prose does not.
 *
 * Renders in the page's language, not both at once. It used to take
 * `titleAr`/`titleEn` pairs and stack them, so an English reader on /en met an
 * Arabic heading above an English one (and vice versa) — which reads as an
 * unfinished page rather than as bilingual courtesy. The language choice is the
 * locale's job; the strings live in messages/ under `dashboard`.
 */
export default function EmptyState({
  icon,
  title,
  body,
  steps,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  tone = "default",
}) {
  return (
    <div className={`tfcl-empty-state tfcl-empty-state--${tone}`}>
      {icon ? (
        <div className="tfcl-empty-state__icon" aria-hidden="true">
          <EmptyIcon name={icon} />
        </div>
      ) : null}

      {/* Ink #231F20 on white = 16.30:1 */}
      <div className="tfcl-empty-state__title">{title}</div>

      {body ? <p className="tfcl-empty-state__body">{body}</p> : null}

      {steps?.length ? (
        <ol className="tfcl-empty-state__steps">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}

      {actionHref ? (
        <div className="tfcl-empty-state__actions">
          <Link href={actionHref} className="pre-btn">
            {actionLabel}
          </Link>
          {secondaryHref ? (
            <Link href={secondaryHref} className="tfcl-empty-state__secondary">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ icons -- */

/**
 * Line icons, not illustrations. An illustration of a cheerful empty garage
 * would be another image to download on a metered connection and would make a
 * true statement look like a marketing screen. `currentColor` picks up
 * $color-5 from the stylesheet, so the icon reads as a mark and never competes
 * with the sentence under it.
 */
const EMPTY_PATHS = {
  car: [
    "M8 34h32M12 34v4M36 34v4M10 26l3-9a4 4 0 0 1 3.8-2.7h14.4A4 4 0 0 1 35 17l3 9",
    "M8 26h32a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z",
    "M13 30h3M32 30h3",
  ],
  heart: [
    "M24 38S9 29.5 9 19.8A7.8 7.8 0 0 1 24 16a7.8 7.8 0 0 1 15 3.8C39 29.5 24 38 24 38Z",
  ],
  chat: [
    "M40 24c0 7.7-7.2 14-16 14a18 18 0 0 1-5.3-.8L9 40l2.6-7.3A13 13 0 0 1 8 24c0-7.7 7.2-14 16-14s16 6.3 16 14Z",
    "M17 24h.02M24 24h.02M31 24h.02",
  ],
  star: [
    "M24 10l4.3 8.8 9.7 1.4-7 6.8 1.7 9.6-8.7-4.6-8.7 4.6 1.7-9.6-7-6.8 9.7-1.4L24 10Z",
  ],
};

function EmptyIcon({ name }) {
  const paths = EMPTY_PATHS[name];
  if (!paths) return null;
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
