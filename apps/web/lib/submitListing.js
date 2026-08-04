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
 * Turn one of the form's downscaled data URLs back into a file.
 *
 * The photo step already resizes to a 1600px edge at JPEG q0.82 so a preview
 * can live in component state, which means the bytes are upload-ready by the
 * time they get here — nothing is re-encoded.
 *
 * Sent as multipart rather than as the data URLs themselves: base64 is a third
 * larger, and ten photos from a phone camera is exactly the payload where a
 * third matters most, on exactly the connection least able to spare it.
 */
/**
 * Vercel caps a serverless function's request body at 4.5 MB and rejects it at
 * the edge — FUNCTION_PAYLOAD_TOO_LARGE, before the handler runs. So
 * api/listings' own limits (MAX_PHOTOS 10, MAX_PHOTO_BYTES 6 MB) describe a
 * request that can never arrive, and none of its careful named errors execute.
 *
 * Ten photos at a 1600px edge and q0.82 are roughly 300-600 KB each. That is
 * 3-6 MB: under the cap for a modest phone camera, over it for a good one. The
 * seller with the better photos is the one who loses the submission, and what
 * they saw was a generic failure — a 413 is not JSON, so `data` came back null
 * and the reason was reported as "rejected" with no message at all.
 *
 * Rather than fail, fit. Re-encode at descending quality until the batch is
 * under budget, worst-offender first. Quality drops before dimensions do,
 * because a 1600px photo at q0.6 still reads as the same car while a 900px one
 * stops showing the panel gap the buyer is looking for.
 */
const PAYLOAD_BUDGET = 3.9 * 1024 * 1024; // 4.5 MB cap, less form fields and
                                          // multipart boundaries.

async function reencode(dataUrl, quality) {
  if (typeof document === "undefined") return dataUrl;
  const img = new Image();
  img.src = dataUrl;
  try {
    await img.decode();
  } catch {
    return dataUrl;
  }
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d").drawImage(img, 0, 0);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Rough byte count of a data URL without allocating the bytes. */
function dataUrlBytes(dataUrl) {
  const encoded = String(dataUrl).split(",")[1] ?? "";
  return Math.floor((encoded.length * 3) / 4);
}

export async function fitPhotoBudget(images, budget = PAYLOAD_BUDGET) {
  let current = [...images];
  let total = current.reduce((n, d) => n + dataUrlBytes(d), 0);
  if (total <= budget) return current;

  for (const quality of [0.72, 0.62, 0.52, 0.42]) {
    current = await Promise.all(current.map((d) => reencode(d, quality)));
    total = current.reduce((n, d) => n + dataUrlBytes(d), 0);
    if (total <= budget) return current;
  }
  // Still over after the lowest quality worth shipping: the caller decides
  // whether to drop photos or tell the seller. Returning what we have keeps
  // this function honest about what it did.
  return current;
}

function dataUrlToFile(dataUrl, index) {
  const [header, encoded] = String(dataUrl).split(",");
  if (!encoded) return null;

  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/jpeg";

  /*
   * The extension has to follow the MIME, not the happy path.
   *
   * downscaleToDataUrl falls back to the untouched original when
   * createImageBitmap or canvas is unavailable — an older WebView, or an HEIC
   * an iPhone handed over that the browser cannot decode. That fallback is
   * deliberate and worth keeping: a seller on an old phone should still be able
   * to list a car. But every file was then named `photo-N.jpg` regardless, so
   * an HEIC reached Strapi under a filename asserting it was a JPEG, and any
   * browser that cannot render HEIC showed a broken image on the listing.
   */
  const subtype = String(mime).split("/")[1] ?? "jpeg";
  const ext = subtype === "jpeg" ? "jpg" : subtype.replace(/[^a-z0-9]/g, "") || "bin";
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  return new File([bytes], `photo-${index + 1}.${ext}`, { type: mime });
}

/**
 * The real path: post the listing as the signed-in seller.
 *
 * Goes to our own route handler, never to the CMS. `connect-src 'self'` blocks
 * the direct call, and the token lives in an httpOnly cookie this code cannot
 * read — which is the point. /api/listings reads the session, uploads the
 * photos, attributes the listing and forwards it.
 *
 * Nothing here says anything about ownership or publish state. Both are decided
 * in the CMS controller, which stamps the seller from the token and forces the
 * draft. A submission lands in the review queue by construction rather than by
 * this function remembering to ask for it.
 */
async function submitViaApi(form, { locale, title, images = [] } = {}) {
  try {
    const body = new FormData();
    body.append("payload", JSON.stringify({ ...form, title }));

    // Shrink to fit before sending, not after being rejected.
    const fitted = await fitPhotoBudget(images);

    fitted.forEach((dataUrl, index) => {
      const file = dataUrlToFile(dataUrl, index);
      if (file) body.append("photos", file);
    });

    // No Content-Type header: the browser has to set it, because only it knows
    // the multipart boundary it just generated.
    const res = await fetch("/api/listings", { method: "POST", body });

    const data = await res.json().catch(() => null);

    if (res.status === 401) {
      // The session went away mid-form. Say so specifically: "something went
      // wrong" would have them retyping a listing that was never the problem.
      return { ok: false, reason: "signed-out", error: data?.error };
    }

    // A 413 comes from the platform, not the route, so it is not JSON and
    // `data` is null. Without this the seller was told nothing at all after
    // filling the entire form and waiting out the upload.
    if (res.status === 413) {
      return { ok: false, reason: "too-large", error: data?.error };
    }

    if (!res.ok || !data?.ok) {
      return { ok: false, reason: "rejected", code: data?.code, error: data?.error };
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
export function submitListing(form, { locale = "ar", title, images = [] } = {}) {
  if (SUBMIT_MODE === "api") return submitViaApi(form, { locale, title, images });
  // The WhatsApp path never carried photos — it asks the seller to attach them
  // in the chat — so `images` is deliberately not threaded into it.
  return submitViaWhatsApp(form, { locale, title });
}
