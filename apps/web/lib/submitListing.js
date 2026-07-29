import { importOriginLabel } from "./listingLabels";
import { buildWhatsAppUrl, normalizeOmaniMsisdn, toTelHref } from "./whatsapp";

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

/**
 * "api" since sellers have accounts.
 *
 * The WhatsApp path below is kept, unused, for one reason: it is the fallback
 * if the API route has to be switched off in a hurry. Flipping this constant is
 * a one-line change that needs no other edit, because both paths return the
 * same shape and no step component knows which one ran.
 */
const SUBMIT_MODE = "api";

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
  const lang = locale === "en" ? "en" : "ar";
  const t = LABELS[lang] ?? LABELS.ar;
  const km = Number(form.km);
  const origin = form.importSpec
    ? importOriginLabel(form.importSpec, lang)
    : null;
  // Prefer a readable bilingual label; fall back to the raw key only if the
  // form somehow holds a value we do not recognise.
  const specText = origin?.stated
    ? origin.text
    : form.importSpec || "";
  const contact =
    toTelHref(form.whatsapp) ||
    (form.whatsapp ? String(form.whatsapp).trim() : "");

  return [
    t.intro,
    "",
    line(t.title, title || [form.year, form.make, form.model].filter(Boolean).join(" ")),
    line(t.price, form.price ? `OMR ${Number(form.price).toLocaleString("en-US")}` : ""),
    line(t.km, Number.isFinite(km) && km > 0 ? km.toLocaleString("en-US") : ""),
    line(t.spec, specText),
    line(t.condition, form.condition),
    line(t.mulkiya, form.mulkiyaExpiry),
    line(t.lien, form.underLien),
    line(t.where, [form.city, form.area].filter(Boolean).join(" — ")),
    line(t.contact, contact),
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
 * The real path: post the listing as the signed-in seller.
 *
 * Goes to our own route handler, never to the CMS. `connect-src 'self'` blocks
 * the direct call, and the token lives in an httpOnly cookie this code cannot
 * read — which is the point. /api/listings reads the session, attributes the
 * listing and forwards it.
 *
 * Nothing here says anything about ownership or publish state. Both are decided
 * in the CMS controller, which stamps the seller from the token and forces the
 * draft. A submission therefore lands in the review queue by construction
 * rather than by this function remembering to ask for it.
 *
 * Photos are still missing. The form collects them and this sends none: media
 * needs a multipart upload to /api/upload and then a relation on the listing,
 * which is its own commit. A draft with no gallery is one a human is going to
 * open anyway — every draft is — so this loses nothing that was not already
 * going to be a conversation.
 */
async function submitViaApi(form, { locale, title } = {}) {
  try {
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, title }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      // The session went away mid-form. Say so specifically: "something went
      // wrong" would have them retyping a listing that was never the problem.
      return { ok: false, reason: "signed-out", error: data?.error };
    }

    if (!res.ok || !data?.ok) {
      return { ok: false, reason: "rejected", error: data?.error };
    }

    return { ok: true, mode: "api", status: data.status ?? "pending-review" };
  } catch {
    return { ok: false, reason: "network" };
  }
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
