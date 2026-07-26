import { useTranslations } from "next-intl";
import React from "react";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { importOriginLabel, SOLD_AS_IS_DETAIL } from "@/lib/listingLabels";
import { toTelHref } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import SpecChips from "./SpecChips";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * The trust block — the whole reason this page exists.
 *
 * NICHE.md names four promises: the price you see is the real price, listings
 * are verified, GCC-spec vs import is always shown honestly, and contacting a
 * seller is one WhatsApp tap. Until now those four lived in three different
 * components (`CarInfo` price + `ListingSignals` pills, `ProfileInfo` badge and
 * button, `StickyContactBar` pills again) and read on screen as a scatter of
 * grey chips — the same texture as the sites we exist to be better than. A
 * promise stated four times in four voices is not stated at all.
 *
 * So they are one block now, in one order, said once:
 *
 *   price  ->  what we checked  ->  where the car came from  ->  the tap
 *
 * Three rules govern the styling:
 *
 * 1. **Colour is never the message.** Every row's sentence is brand ink on
 *    white (16.30:1). The green/amber tint lives only in the 28px icon chip,
 *    as a second, redundant cue. The previous version put the verification
 *    state in coloured text alone, which disappears for a red/green colour-blind
 *    buyer and washes out on a cheap Android screen in Omani daylight.
 * 2. **Missing information is the loudest row, not the quietest.** A null
 *    `importOrigin` renders "Spec not stated by seller" in amber with a
 *    sentence telling the buyer what to do about it. Hiding the gap would make
 *    a half-described car look as complete as a fully described one, which is
 *    exactly the OpenSooq failure mode.
 * 3. **Never claim more than we did.** A stated origin is captioned "Stated by
 *    the seller — we have not verified it", because /how-it-works says we check
 *    that the origin *is stated*, not that it is true. The verification badge
 *    links to that page so the claim is inspectable at the moment of doubt.
 */


// Row tints. Each pair is the icon chip only — the sentence beside it is
// always ink, so none of these carries meaning on its own.
//   #0B7A44 on #ECFDF3 = 5.13:1   (positive)
//   #B45309 on #FFF7ED = 4.73:1   (information the buyer is missing)
//   #5C6368 on #F8F8F9 = 5.75:1   (neutral fact)
const TONE = {
  good: { fg: "#0B7A44", bg: "#ECFDF3", border: "rgba(11, 122, 68, 0.25)" },
  missing: { fg: "#B45309", bg: "#FFF7ED", border: "rgba(180, 83, 9, 0.25)" },
  neutral: { fg: "#5C6368", bg: "#F8F8F9", border: "#EDEDED" },
};

const INK = "#231F20"; // 16.30:1 on white
const MUTED = "#5C6368"; // 6.11:1 on white
const ACCENT_TEXT = "#BD4B2B"; // $color-3-text, 4.99:1 on white

function CheckGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 14 15" fill="none" aria-hidden="true">
      <path
        d="M5 8.00024L6.5 9.50024L9 6.00024M7 1.30957C5.49049 2.74306 3.48018 3.52929 1.39867 3.50024C1.13389 4.30689 0.999317 5.15057 1 5.99957C1 9.72757 3.54934 12.8596 7 13.7482C10.4507 12.8602 13 9.72824 13 6.00024C13 5.1269 12.86 4.28624 12.6013 3.49957H12.5C10.3693 3.49957 8.43334 2.66757 7 1.30957Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QueryGlyph() {
  // A question, not a warning. No triangle, no exclamation mark: a seller who
  // has not filled a field has done nothing wrong, and the moment disclosure
  // looks like an accusation sellers stop disclosing.
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.4 6.2a1.65 1.65 0 1 1 2.2 1.55c-.37.14-.6.5-.6.9v.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.4" r="0.85" fill="currentColor" />
    </svg>
  );
}

function GlobeGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M1.75 8h12.5M8 1.75c1.6 1.7 2.5 3.9 2.5 6.25S9.6 12.55 8 14.25c-1.6-1.7-2.5-3.9-2.5-6.25S6.4 3.45 8 1.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** One trust statement: tinted chip, ink sentence, optional caption. */
function TrustRow({ tone, glyph, children, caption }) {
  return (
    <li className="d-flex" style={{ gap: 12, alignItems: "flex-start" }}>
      <span
        aria-hidden="true"
        className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          color: tone.fg,
          background: tone.bg,
          border: `1px solid ${tone.border}`,
        }}
      >
        {glyph}
      </span>
      <span className="d-block" style={{ minWidth: 0 }}>
        <span
          className="d-block"
          style={{ color: INK, fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}
        >
          {children}
        </span>
        {caption && (
          <span
            className="d-block mt-1"
            style={{ color: MUTED, fontSize: 12, lineHeight: 1.5 }}
          >
            {caption}
          </span>
        )}
      </span>
    </li>
  );
}

export default function TrustBlock({ carItem, locale = DEFAULT_LOCALE }) {
  // Before the `!carItem` guard: hooks have to run in the same order on every
  // render, and an early return above this one makes that conditional.
  const t = useTranslations("listing.trust");

  if (!carItem) return null;

  const origin = importOriginLabel(carItem.importOrigin, locale);
  const telHref = toTelHref(carItem.phone ?? carItem.whatsapp);
  const isSold = carItem.listingStatus === "sold";
  const isReserved = carItem.listingStatus === "reserved";
  // WhatsAppButton returns null for a sold car and for an unusable number, so
  // the two states below have to be derived here rather than assumed.
  const canContact = Boolean(carItem.whatsapp) && !isSold;

  return (
    <div>
      <SpecChips carItem={carItem} locale={locale} />

      {/* ---- the price ------------------------------------------------ */}
      <p
        className="mb-1"
        style={{
          color: MUTED,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {t("askingPrice")}
      </p>
      <div
        // Was $color-3-text terracotta at 4.99:1 while the sticky bar showed
        // the same number in ink — two colours for one fact. Ink wins: it is
        // 16.30:1, it matches the bar, and the price is evidence, not a promo.
        className="money font"
        style={{ color: INK, marginBottom: 8 }}
      >
        {formatPrice(carItem.price, carItem.currency)}
      </div>
      <p className="mb-0" style={{ color: MUTED, fontSize: 12, lineHeight: 1.5 }}>
        {t("priceNote")}
      </p>
      <p className="mb-0 mt-1" style={{ color: MUTED, fontSize: 12, lineHeight: 1.5 }}>
        {t("bandCaption")}
      </p>

      {(isSold || isReserved) && (
        <p
          className="mt-3 mb-0"
          // #2B2F33 on #E9EAEB is 11.20:1 — the loudest neutral we have.
          // Availability is a fact, never a red warning about the car.
          style={{
            color: "#2B2F33",
            background: "#E9EAEB",
            border: "1px solid #DCDDDE",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {isSold ? t("sold") : t("reserved")}
        </p>
      )}

      {carItem.soldAsIs && (
        <p
          className="mt-3 mb-0"
          // Amber #B45309 on #FFF7ED is 4.73:1. The one place on the site a
          // buyer is told what "sold as-is" actually costs them, so it sits
          // against the price it explains.
          style={{
            color: "#B45309",
            background: "#FFF7ED",
            border: "1px solid rgba(180, 83, 9, 0.25)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {SOLD_AS_IS_DETAIL[locale] ?? SOLD_AS_IS_DETAIL.ar}
        </p>
      )}

      {/* ---- what we know, and how we know it ------------------------- */}
      <ul
        className="list-unstyled mb-0"
        style={{
          display: "grid",
          gap: 16,
          margin: "20px 0 0",
          padding: "20px 0 0",
          borderTop: "1px solid #EDEDED",
        }}
      >
        <TrustRow
          tone={carItem.verified ? TONE.good : TONE.missing}
          glyph={carItem.verified ? <CheckGlyph /> : <QueryGlyph />}
          caption={
            carItem.verified ? (
              <Link
                href="/how-it-works"
                style={{ color: ACCENT_TEXT, fontWeight: 600 }}
              >
                {t("verifiedNote")}
              </Link>
            ) : (
              t("unverifiedNote")
            )
          }
        >
          {carItem.verified ? t("verified") : t("unverified")}
        </TrustRow>

        <TrustRow
          tone={origin.stated ? TONE.neutral : TONE.missing}
          glyph={origin.stated ? <GlobeGlyph /> : <QueryGlyph />}
          caption={origin.stated ? t("originStated") : t("originMissing")}
        >
          {origin.text}
        </TrustRow>
      </ul>

      {/* ---- the tap -------------------------------------------------- */}
      <div style={{ marginTop: 20 }}>
        {canContact ? (
          <>
            <div className="d-flex gap-2">
              <WhatsAppButton car={carItem} locale={locale} />
              {telHref && (
                <a
                  href={telHref}
                  className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ minHeight: 48, minWidth: 48, borderRadius: 10 }}
                  aria-label={t("call")}
                  title={t("call")}
                >
                  <i className="icon-autodeal-phone2" aria-hidden="true" />
                </a>
              )}
            </div>
            {/* Say what the button does before it is tapped. In a market
                defined by scam anxiety this is worth more than any badge, and
                it costs one string. Deliberately NOT repeated in
                StickyContactBar — a sticky bar carries action only. */}
            <p
              className="mt-2 mb-0"
              style={{ color: MUTED, fontSize: 12, lineHeight: 1.5 }}
            >
              {t("disclosure")}
            </p>
          </>
        ) : (
          !isSold && (
            <p
              className="mb-0"
              style={{
                color: "#B45309",
                background: "#FFF7ED",
                border: "1px solid rgba(180, 83, 9, 0.25)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {t("noContact")}
            </p>
          )
        )}
      </div>
    </div>
  );
}
