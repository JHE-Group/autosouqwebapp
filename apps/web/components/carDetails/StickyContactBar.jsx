"use client";

import { formatPrice } from "@/lib/format";
import { toTelHref } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import ListingSignals from "@/components/common/ListingSignals";

/**
 * Mobile-only sticky contact bar.
 *
 * Two jobs. It puts the primary action in the thumb zone — ~49% of users are
 * one-handed — and it keeps the price on screen permanently, so the number the
 * buyer saw can never quietly become a different number further down the page.
 */
export default function StickyContactBar({ car, locale = "ar" }) {
  if (!car) return null;

  const telHref = toTelHref(car.phone ?? car.whatsapp);

  return (
    <div
      className="autosouq-sticky-contact d-lg-none position-fixed bottom-0 start-0 end-0 bg-white border-top px-3 pt-2"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        zIndex: 1030,
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
        <span className="fw-bold fs-5" style={{ color: "#24272C" }}>
          {formatPrice(car.price, car.currency)}
        </span>
        <ListingSignals car={car} locale={locale} />
      </div>

      <div className="d-flex gap-2">
        <WhatsAppButton car={car} locale={locale} />
        {telHref && (
          <a
            href={telHref}
            className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center"
            style={{ minHeight: 48, minWidth: 48, borderRadius: 10 }}
            aria-label={locale === "ar" ? "اتصال هاتفي" : "Phone call"}
          >
            {/* Non-directional icon — not mirrored in RTL. */}
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
