import { DEFAULT_LOCALE } from "@/lib/locale";
// WhatsApp click-to-chat helpers for Omani numbers.
// Spec: https://www.appsflyer.com/blog/deep-linking/whatsapp-deep-link/
//
// We always use wa.me (the web format). The whatsapp:// and intent:// schemes
// are for triggering WhatsApp from inside another native app and fail here.
//
// NICHE.md: "contacting a seller is one WhatsApp tap." This module is that tap.

const OMAN_CC = "968";

/**
 * Normalise anything a seller might type into a wa.me path segment.
 * Accepts "+968 9123 4567", "0096891234567", "96891234567", "91234567".
 * Returns 11 digits, or null when it is not a valid Omani mobile — callers
 * render a disabled state rather than a broken link.
 */
export function normalizeOmaniMsisdn(raw) {
  if (!raw) return null;

  // wa.me takes digits only — no +, spaces, dashes or brackets.
  let d = String(raw).replace(/\D/g, "");

  if (d.startsWith("00")) d = d.slice(2); // 00968… → 968…
  if (d.length === 9 && d.startsWith("0")) d = d.slice(1); // 091234567 → 91234567
  if (d.length === 8) d = OMAN_CC + d;

  // Omani mobiles are 8 digits starting 7 or 9. Landlines can't use WhatsApp.
  return /^968[79]\d{7}$/.test(d) ? d : null;
}

/** E.164 for tel: links — here the leading + is wanted. */
export function toTelHref(raw) {
  const d = normalizeOmaniMsisdn(raw);
  return d ? `+${d}` : null;
}

/** Build a click-to-chat URL, or null when the number is unusable. */
export function buildWhatsAppUrl(phone, message) {
  const msisdn = normalizeOmaniMsisdn(phone);
  if (!msisdn) return null;
  const base = `https://wa.me/${msisdn}`;
  // encodeURIComponent gives correct UTF-8 percent-encoding for Arabic and
  // turns "\n" into %0A, which WhatsApp renders as a line break.
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Prefilled enquiry naming the car, the LISTED PRICE, and the listing URL.
 *
 * Putting the price in the seller's own chat log, timestamped, before any
 * negotiation starts is the cheapest enforcement we have for "the price you
 * see is the real price" — the seller has to walk it back in writing.
 */
export function listingEnquiryMessage(car, opts = {}) {
  const {
    locale = DEFAULT_LOCALE,
    // Must be absolute — a relative path is useless in the seller's chat.
    origin = process.env.NEXT_PUBLIC_SITE_URL || "https://autosouq.om",
  } = opts;
  // localePrefix is "always" — bare /listing-detail-v1/... redirects to /ar/...
  // and would land English buyers on the Arabic page after the redirect.
  const url = `${origin}/${locale}/listing-detail-v1/${car.id}`;
  const price = `${Number(car.price).toLocaleString("en-US")} ${car.currency || "OMR"}`;

  // Titles usually already carry the year ("تويوتا يارس 2016") — only prepend
  // it when it is genuinely missing, so we never say "2016 … 2016".
  const title = String(car.title ?? "");
  const name =
    car.year && !title.includes(String(car.year))
      ? `${car.year} ${title}`.trim()
      : title;

  if (locale === "ar") {
    return [
      "السلام عليكم،",
      "أنا مهتم بهذه السيارة على أوتوسوق:",
      name,
      `السعر المعروض: ${price}`,
      url,
      "",
      "هل ما زالت متوفرة؟",
    ].join("\n");
  }

  return [
    "Hello,",
    "I'm interested in this car on Autosouq:",
    name,
    `Listed price: ${price}`,
    url,
    "",
    "Is it still available?",
  ].join("\n");
}

/**
 * Button styling for every WhatsApp CTA.
 *
 * White on #25D366 is 1.98:1 — a clear WCAG failure, and these users are on
 * budget Android screens in Omani sun. Ink on the same green is 7.65:1, so we
 * keep the recognisable WhatsApp green and darken the label instead.
 */
export const WHATSAPP_BUTTON_STYLE = {
  background: "#25D366",
  color: "#24272C",
  minHeight: 48, // above the 44px AAA target; one-handed, outdoors, dusty hands
  borderRadius: 10, // design-token button radius
  fontWeight: 600,
};
