import React from "react";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { toTelHref } from "@/lib/whatsapp";

/**
 * Seller panel.
 *
 * The theme shipped this entirely fabricated: an invented dealer name, an
 * unconditional "Verified dealer" badge, a Santa Ana address and a Google Maps
 * iframe pointing at Dhaka. On a marketplace whose only differentiator is
 * trust, inventing any of that is worse than showing nothing — so every value
 * here comes from the listing, and anything we don't have is simply absent.
 */
export default function ProfileInfo({ carItem, locale = "ar" }) {
  const car = carItem ?? {};
  const telHref = toTelHref(car.phone ?? car.whatsapp);

  const hasCoords =
    Number.isFinite(car.latitude) && Number.isFinite(car.longitude);

  const t =
    locale === "ar"
      ? {
          contact: "تواصل مع البائع",
          call: "اتصال",
          // Names the actor and the act — never a bare "Verified" that reads
          // as a self-awarded seal.
          verified: "تحقّقنا من هذا الإعلان",
          unverified: "لم نتحقق من هذا الإعلان بعد",
          location: "موقع السيارة",
        }
      : {
          contact: "Contact the seller",
          call: "Call",
          verified: "Autosouq checked this listing",
          unverified: "We haven't checked this listing yet",
          location: "Where the car is",
        };

  return (
    <>
      <div className="prolile-info mb-30">
        <div
          className="verified flex-three"
          style={{ color: car.verified ? "#0B7A44" : "#B45309" }}
        >
          <div className="icon">
            <svg
              width={14}
              height={15}
              viewBox="0 0 14 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M5 8.00024L6.5 9.50024L9 6.00024M7 1.30957C5.49049 2.74306 3.48018 3.52929 1.39867 3.50024C1.13389 4.30689 0.999317 5.15057 1 5.99957C1 9.72757 3.54934 12.8596 7 13.7482C10.4507 12.8602 13 9.72824 13 6.00024C13 5.1269 12.86 4.28624 12.6013 3.49957H12.5C10.3693 3.49957 8.43334 2.66757 7 1.30957Z"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="fs-12 fw-6 lh-16">
            {car.verified ? t.verified : t.unverified}
          </span>
        </div>
      </div>

      {car.address && (
        <div className="profile-map mb-30">
          <div className="list-icon-pf gap-8 flex-three">
            <i className="far fa-map" aria-hidden="true" />
            <p className="font-1">{car.address}</p>
          </div>
          {/* Only embed a map when the listing actually carries coordinates. */}
          {hasCoords && (
            <div className="map">
              <iframe
                className="map-content"
                title={t.location}
                src={`https://www.google.com/maps?q=${car.latitude},${car.longitude}&z=14&output=embed`}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          )}
        </div>
      )}

      <div className="profile-contact">
        <h6>{t.contact}</h6>
        <div className="btn-contact d-flex gap-2 mt-2">
          <WhatsAppButton car={car} locale={locale} />
          {telHref && (
            <a
              href={telHref}
              className="btn btn-outline-dark d-inline-flex align-items-center justify-content-center"
              style={{ minHeight: 48, minWidth: 48, borderRadius: 10 }}
              aria-label={t.call}
            >
              <i className="icon-autodeal-phone2" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
