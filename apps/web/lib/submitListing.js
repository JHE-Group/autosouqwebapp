import { buildWhatsAppUrl, normalizeOmaniMsisdn } from "./whatsapp";

/**
 * How a completed listing leaves the browser.
 *
 * ## Why this is a WhatsApp handoff and not a POST
 *
 * There is no account system, so there is nobody to attribute a listing to,
 * and the public Strapi role is read-only by design — `PUBLIC_ACTIONS` in
 * apps/cms/src/index.ts grants `find`/`findOne` and nothing else, so
 * `POST /api/listings` answers 403. Granting public `create` would open an
 * unauthenticated write endpoint on a site whose whole proposition is being
 * the trustworthy end of this market; the first thing that reaches it would be
 * spam, and there is no moderator queue to catch it.
 *
 * So the listing goes where NICHE.md already says every conversation goes: one
 * WhatsApp tap. The seller sends us their car, a human reads it, and it is
 * entered and verified before it appears. At this catalogue size that is not a
 * stopgap — it is the same manual verification the Verified badge claims.
 * `ReportListing` and the empty-results alert already work exactly this way.
 *
 * ## Swapping in the real API later
 *
 * `submitListing()` is the only seam the form knows about. When auth exists,
 * replace the body of `submitViaApi()` below and flip `SUBMIT_MODE` — no step
 * component changes, because none of them know how submission works. Both
 * paths return the same shape, so the caller's handling of success, failure
 * and "not configured" is already written.
 */

const OPS_WHATSAPP = process.env.NEXT_PUBLIC_AUTOSOUQ_WHATSAPP;

/** "whatsapp" today. Flip to "api" once listings can be created server-side. */
const SUBMIT_MODE = "whatsapp";

const LABELS = {
  en: {
    intro: "Hello, I'd like to list this car on Autosouq:",
    title: "Car",
    price: "Asking price",
    km: "Kilometres",
    spec: "Spec / import",
    condition: "Condition",
    mulkiya: "Mulkiya valid until",
    lien: "Under bank lien",
    faults: "Needs attention",
    noFaults: "Nothing that I know of",
    work: "Recently replaced or repaired",
    reason: "Reason for selling",
    where: "Where the car is",
    contact: "My WhatsApp",
    photos: "I will send the photos in this chat.",
    outro:
      "Please check it and let me know if you need anything else before it goes live.",
  },
  ar: {
    intro: "السلام عليكم، أودّ عرض هذه السيارة على أوتوسوق:",
    title: "السيارة",
    price: "السعر المطلوب",
    km: "الكيلومترات",
    spec: "المواصفات / الاستيراد",
    condition: "الحالة",
    mulkiya: "بطاقة الملكية سارية حتى",
    lien: "مرهونة لبنك",
    faults: "ما يحتاج إلى انتباه",
    noFaults: "لا شيء على حد علمي",
    work: "ما جرى تغييره أو إصلاحه مؤخراً",
    reason: "سبب البيع",
    where: "موقع السيارة",
    contact: "رقم واتساب الخاص بي",
    photos: "سأرسل الصور في هذه المحادثة.",
    outro: "أرجو مراجعتها وإخباري إن كنتم تحتاجون أي شيء آخر قبل نشرها.",
  },
};

const line = (label, value) =>
  value === undefined || value === null || value === "" ? null : `${label}: ${value}`;

/**
 * The message the seller sends. Deliberately readable as plain text rather
 * than a machine format: a person reads this, and the seller can see exactly
 * what they are sending under their own name before they send it.
 */
export function listingSubmissionMessage(form, { locale = "ar", title } = {}) {
  const t = LABELS[locale] ?? LABELS.ar;
  const km = Number(form.km);

  return [
    t.intro,
    "",
    line(t.title, title || [form.year, form.make, form.model].filter(Boolean).join(" ")),
    line(t.price, form.price ? `OMR ${Number(form.price).toLocaleString("en-US")}` : ""),
    line(t.km, Number.isFinite(km) && km > 0 ? km.toLocaleString("en-US") : ""),
    line(t.spec, form.importSpec),
    line(t.condition, form.condition),
    line(t.mulkiya, form.mulkiyaExpiry),
    line(t.lien, form.underLien),
    line(t.where, [form.city, form.area].filter(Boolean).join(" — ")),
    line(t.contact, form.whatsapp),
    "",
    line(t.faults, form.noKnownFaults ? t.noFaults : form.knownFaults),
    line(t.work, form.recentWork),
    line(t.reason, form.reasonForSelling),
    "",
    t.photos,
    t.outro,
  ]
    .filter((l) => l !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Today's path: hand the listing to a human over WhatsApp. */
function submitViaWhatsApp(form, { locale, title }) {
  const ops = normalizeOmaniMsisdn(OPS_WHATSAPP) ?? OPS_WHATSAPP;
  const href = buildWhatsAppUrl(ops, listingSubmissionMessage(form, { locale, title }));

  // No number configured means there is genuinely nowhere for this to go. Say
  // so; do not open a broken link and call it success.
  if (!href) return { ok: false, reason: "not-configured" };

  window.open(href, "_blank", "noopener,noreferrer");
  return { ok: true, mode: "whatsapp" };
}

/**
 * Tomorrow's path. Left unimplemented on purpose rather than written blind:
 * it needs an auth token to attribute the listing, a media upload for the
 * photos, and `publishedAt: null` so a submission lands as a draft for review
 * instead of going straight live.
 */
async function submitViaApi() {
  throw new Error(
    "submitViaApi() is not implemented — listings cannot be created without auth. See lib/submitListing.js.",
  );
}

/** True when a submission can actually be delivered right now. */
export function canSubmitListing() {
  return SUBMIT_MODE === "whatsapp" ? Boolean(OPS_WHATSAPP) : true;
}

/**
 * @returns {{ok: boolean, mode?: string, reason?: string}}
 *   ok:false + reason:"not-configured" means nothing was sent and the caller
 *   must tell the seller so, rather than clearing the form.
 */
export function submitListing(form, { locale = "ar", title } = {}) {
  if (SUBMIT_MODE === "api") return submitViaApi(form, { locale, title });
  return submitViaWhatsApp(form, { locale, title });
}
