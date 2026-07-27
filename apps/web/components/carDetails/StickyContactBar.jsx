"use client";

import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/format";
import { toTelHref } from "@/lib/whatsapp";
import {
  importOriginLabel,
  SPEC_PILL_STYLE,
  SPEC_UNSTATED_STYLE,
} from "@/lib/listingLabels";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { DEFAULT_LOCALE } from "@/lib/locale";

// Brand ink ($color-2 in the SCSS tokens) — the theme's own #24272C grey was
// close enough to look right and wrong enough to be off-brand on the one
// number the buyer is here for. 16.30:1 on white.
const BRAND_INK = "#231F20";

/**
 * Mobile-only sticky contact bar.
 *
 * Two jobs. It puts the primary action in the thumb zone — ~49% of users are
 * one-handed — and it keeps the price on screen permanently, so the number the
 * buyer saw can never quietly become a different number further down the page.
 *
 * What it deliberately does NOT do:
 *
 * - **Repeat the trust block.** It used to render the whole `ListingSignals`
 *   pill row, so "Sold as-is", "Not checked yet" and the spec pill were on
 *   screen twice at once and, at 360px, wrapped the bar onto a third line that
 *   ate a fifth of the viewport. Verification and as-is are now stated once, in
 *   full, in the trust block. Only the spec origin stays, as one short pill,
 *   because NICHE.md says that one is shown always and it is the fact most
 *   likely to be scrolled past.
 * - **Carry the WhatsApp disclosure.** A sticky bar is action only; the
 *   explanation of what the button does belongs next to the button the buyer
 *   reads before tapping, not on the one they tap reflexively.
 * - **Exist on desktop.** `d-lg-none`, so the trust block's own WhatsApp button
 *   is the only CTA above 992px and the two are never on screen together.
 * - **Render with nothing to do.** `WhatsAppButton` returns null for a sold car
 *   or an unusable number; without it the bar was a blank strip covering the
 *   last line of the page for no benefit.
 *
 * Occlusion: `body:has(.autosouq-sticky-contact) #pagee` in style.scss reserves
 * 132px + safe-area on the page container below 992px. This component used to
 * render a 108px spacer of its own on top of that, reserving the space twice
 * and leaving ~240px of dead scroll under the footer. The spacer is gone; the
 * stylesheet reservation is the single source. Measured against this layout the
 * bar is ~104px (8 top + 28 pill row + 8 gap + 48 action + 12 bottom), so 132px
 * still clears it at the ~130% Android font scaling this audience runs.
 */
export default function StickyContactBar({ car, locale = DEFAULT_LOCALE }) {
  const t = useTranslations("listing.trust");
  if (!car) return null;

  const telHref = toTelHref(car.phone ?? car.whatsapp);
  const origin = importOriginLabel(car.importOrigin, locale);
  const canContact = Boolean(car.whatsapp) && car.listingStatus !== "sold";
  if (!canContact) return null;

  return (
    <div
      className="autosouq-sticky-contact d-lg-none position-fixed bottom-0 bg-white border-top px-3 pt-2"
      style={{
        /**
         * `insetInline: 0` rather than Bootstrap's `start-0 end-0`.
         *
         * The comment that used to sit here said those two utilities were
         * logical and needed no mirrored rule. They are not: we ship the LTR
         * Bootstrap build, where `.start-0` is `left: 0` and `.end-0` is
         * `right: 0`, and style.scss carries a hand-written `[dir="rtl"]` shim
         * that flips each of them. Both shim rules are `!important` at equal
         * specificity, so on an element carrying *both* classes the later one
         * simply wins each declaration: `.end-0` set `left: 0` and, fatally,
         * `right: auto` — overriding the `right: 0` that `.start-0` had just
         * set.
         *
         * A `position: fixed` box with one inset and `width: auto`
         * shrink-to-fit. So on /ar — the default, indexed tree — this bar
         * stopped spanning the viewport on phones: the white backing and
         * border-top covered part of the screen and the price/CTA row
         * collapsed against one edge. That is the primary WhatsApp CTA, on the
         * device this audience actually uses, on the language we lead with.
         *
         * The logical property needs no shim and cannot be split in half by
         * one, which is why it is the fix rather than reordering the CSS.
         */
        insetInline: 0,
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        zIndex: 1030,
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
        <span className="fw-bold fs-5 text-nowrap" style={{ color: BRAND_INK }}>
          {formatPrice(car.price, car.currency, locale)}
        </span>
        {/* One pill, never the whole signal row: "GCC spec", or the amber
            "Spec not stated by seller" when the seller withheld it. Both are
            short enough to sit beside the price at 360px without wrapping. */}
        <span
          style={{
            ...(origin.stated ? SPEC_PILL_STYLE : SPEC_UNSTATED_STYLE),
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
        >
          {origin.text}
        </span>
      </div>

      <div className="d-flex gap-2">
        <WhatsAppButton car={car} locale={locale} />
        {telHref && (
          <a
            href={telHref}
            className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{ minHeight: 48, minWidth: 48, borderRadius: 10 }}
            aria-label={t("phoneCall")}
          >
            {/* Non-directional icon — not mirrored in RTL. */}
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
