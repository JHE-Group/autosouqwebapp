"use client";
import { useLocale, useTranslations } from "next-intl";
import { canSubmitListing, submitListing } from "@/lib/submitListing";
import Image from "next/image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Link } from "@/i18n/navigation";
import { featureOptions } from "@/data/filterOptions";
import { formatPrice } from "@/lib/format";
import { normalizeOmaniMsisdn } from "@/lib/whatsapp";
import { IMPORT_ORIGIN, SOLD_AS_IS, SOLD_AS_IS_STYLE } from "@/lib/listingLabels";

/**
 * ============================================================================
 * SUBMIT PATH — WhatsApp handoff today (see lib/submitListing.js).
 * ============================================================================
 *
 * There is no authenticated listing POST yet, so "Publish listing" opens
 * WhatsApp to the ops number (`NEXT_PUBLIC_AUTOSOUQ_WHATSAPP`) with the
 * seller's answers as a message. Nothing goes live until a human enters it.
 * Without that env var the publish controls stay disabled and say so.
 *
 * Also honest today:
 *   - every field is kept in React state and mirrored to localStorage, so an
 *     interrupted seller does not lose twenty minutes of typing. That draft is
 *     on their phone and nowhere else, and the UI says so in those words.
 *   - photos are downscaled and previewed in the browser. They are NOT saved to
 *     the draft (a handful of phone photos would blow the ~5 MB localStorage
 *     quota) and the photo step says so before the seller starts.
 *
 * When the authenticated API lands:
 *   - BAND below must still be enforced server-side. Client validation is a
 *     courtesy to the seller, never the guard — apps/cms/.../listing/
 *     lifecycles.ts is the guard.
 *   - `mulkiyaExpiry`, `underLien`, `knownFaults`, `reasonForSelling` and
 *     `recentWork` do not exist on the CMS listing content type yet. They are
 *     collected here because they are the Omani analogue of the MOT/finance
 *     checks a buyer at this price band cannot otherwise make, and they must be
 *     rendered to buyers as SELLER-DECLARED — the `stated` convention in
 *     lib/listingLabels.js — never as anything Autosouq has verified.
 * ============================================================================
 */

/**
 * The price band, mirrored from the CMS.
 *
 * Source of truth: apps/cms/src/api/listing/content-types/listing/lifecycles.ts
 * (and the min/max on `price` in that content type's schema.json). Those hooks
 * reject the listing server-side; this form must reject it in the browser too,
 * because a seller who fills in twenty fields and only then learns that OMR
 * 12,000 is not allowed has been wasted, and on a metered connection has paid
 * for the privilege.
 *
 * Keep these four numbers identical to BAND in lifecycles.ts. NICHE.md calls
 * the band "the entire identity of the business", not a preference.
 */
// Moved to lib/priceBand.js so the homepage budget bands can partition exactly
// this range without a second copy of the numbers. check-price-band.mjs now
// reads that file for the web side.
//
// `import`, not `export … from`: a re-export forwards the names to this
// module's consumers without binding them locally, so every `BAND.MAX` below
// was a ReferenceError. Caught by the `no-undef` rule, which exists because
// exactly this class of mistake once shipped in ListingCard.jsx.
import { BAND, CURRENCY } from "@/lib/priceBand";

const money = (n) => `${CURRENCY} ${n.toLocaleString("en-US")}`;

/**
 * Same decision the CMS makes, in the same order, so the two can never
 * disagree about a given number. `soldAsIs` is derived from the price and never
 * chosen by the seller — exactly as `applyBand()` derives it server-side.
 */
function checkPrice(raw) {
  const trimmed = String(raw).trim();
  if (trimmed === "") return { state: "empty" };

  /**
   * Returns a `reason` code, not a sentence.
   *
   * These three messages were English template literals built right here, so
   * the moment the site enforces its defining rule — the OMR 1,500–6,000 band,
   * the thing the whole product is — it explained itself in a language the
   * seller may not read. A pure function is also the wrong place to hold copy:
   * it has no locale and cannot get one without becoming a hook. So it reports
   * *what* failed and with which numbers, and the component renders it through
   * `addListing.priceCheck`.
   */
  const price = Number(trimmed);
  if (!Number.isFinite(price)) {
    return { state: "invalid", reason: "notNumber" };
  }

  if (price > BAND.MAX) {
    return {
      state: "invalid",
      reason: "aboveBand",
      values: { max: money(BAND.MAX), value: money(price) },
    };
  }

  if (price < BAND.ASIS_MIN) {
    return {
      state: "invalid",
      reason: "belowBand",
      values: { min: money(BAND.ASIS_MIN), value: money(price) },
    };
  }

  if (price <= BAND.ASIS_MAX) {
    return { state: "as-is", soldAsIs: true };
  }

  return { state: "ok", soldAsIs: false };
}

const IMPORT_SPEC_OPTIONS = Object.entries(IMPORT_ORIGIN).map(
  ([value, label]) => ({ value, label: `${label.en} — ${label.ar}` }),
);

/**
 * Step order, and why it is this order.
 *
 * AutoTrader's seller flow asks for effort in ascending order of cost and puts
 * the expensive step last; the theme did the exact opposite and opened with
 * photos, which is the highest-friction step on a phone (camera, upload,
 * metered data) and therefore the highest-abandonment one. Here the seller
 * answers five cheap dropdown-shaped questions first, learns whether their
 * price is even inside the band before they photograph anything, and only then
 * is asked for the camera.
 *
 * Everything not in these six steps — VIN, body, fuel, drive type, engine,
 * cylinders, doors, seats, colour, features, video, documents — is behind
 * "Add more details" on the review step. None of it is a first-order question
 * for a buyer at OMR 1,500–6,000, and each one is a chance to abandon.
 */
const STEPS = [
  { id: "car" },
  { id: "spec" },
  { id: "price" },
  { id: "photos" },
  { id: "contact" },
  { id: "review" },
];

const EMPTY_FORM = {
  make: "",
  model: "",
  year: "",
  km: "",
  transmission: "",
  importSpec: "",
  condition: "",
  mulkiyaExpiry: "",
  underLien: "",
  noKnownFaults: false,
  knownFaults: "",
  reasonForSelling: "",
  recentWork: "",
  price: "",
  city: "",
  area: "",
  whatsapp: "",
  phone: "",
  // Optional extras, all behind the disclosure on the review step.
  vin: "",
  body: "",
  fuelType: "",
  driveType: "",
  engineSize: "",
  cylinders: "",
  doors: "",
  seats: "",
  color: "",
  features: [],
  videoUrl: "",
};

const DRAFT_KEY = "autosouq:listing-draft:v1";

/**
 * localStorage read through the external-store hook.
 *
 * The subscription is only the cross-tab `storage` event; a same-tab write does
 * not need to notify anything, because the component doing the writing already
 * holds the value in React state. `readDraft` returns the raw string, so React
 * can compare snapshots by value and never re-render on an identical read.
 */
function subscribeToDraft(onChange) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readDraft() {
  try {
    return window.localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

const isDirty = (form) =>
  Object.keys(EMPTY_FORM).some((key) =>
    Array.isArray(EMPTY_FORM[key])
      ? form[key].length > 0
      : form[key] !== EMPTY_FORM[key],
  );

export default function AddListing() {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const t = useTranslations("addListing");
  /**
   * Which section is expanded — not which step the seller is "on".
   *
   * The six steps are now six disclosure panels on one page. The seller sees the
   * whole shape of the job before starting, can open any part in any order, and
   * never loses the page they were on. One open at a time, because six expanded
   * panels on a 360px phone is a scroll bar, not a form.
   *
   * `null` is a legal value: every panel closed, which is what the seller gets
   * after finishing the last one. The order is unchanged and still matters —
   * see the STEPS comment. Photos is fourth and CLOSED until reached, so the
   * camera is still not the first thing a seller meets.
   */
  const [openSection, setOpenSection] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draftHandled, setDraftHandled] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  // One ref per section heading, so opening a panel can move focus to it. A
  // single `headingRef` worked when only one step was ever mounted; six panels
  // need six targets.
  const headingRefs = useRef({});

  const set = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  /* ------------------------------------------------------------- draft -- */

  // localStorage is an external store, so it is read through the hook built for
  // external stores. The server snapshot is null, which is the truth on the
  // server, so hydration matches and the offer to restore appears only once the
  // browser has actually looked.
  const storedDraft = useSyncExternalStore(
    subscribeToDraft,
    readDraft,
    () => null,
  );

  const dirty = isDirty(form);
  // Restoring is a decision the seller makes, not something that happens to
  // them. Silently refilling a form from a draft they had forgotten about is
  // how a stale price ends up published.
  const offerRestore = !draftHandled && !dirty && storedDraft !== null;

  useEffect(() => {
    if (!dirty) return undefined;
    const timer = window.setTimeout(() => {
      try {
        // Photos are deliberately not in the draft — see the SUBMIT GAP note.
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form }));
      } catch {
        // Quota or private mode. The form still works; only the draft is lost.
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [form, dirty]);

  const restoreDraft = () => {
    try {
      const saved = JSON.parse(storedDraft);
      setForm({ ...EMPTY_FORM, ...saved.form });
    } catch {
      // A corrupt store is not worth interrupting the seller over.
    }
    setDraftHandled(true);
  };

  const discardDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* nothing to clear */
    }
    setForm(EMPTY_FORM);
    setImages([]);
    setAttachments([]);
    setDraftHandled(true);
    setOpenSection(0);
  };

  /* ------------------------------------------------------------ photos -- */

  const addFiles = useCallback(
    async (fileList) => {
      const room = MAX_PHOTOS - images.length;
      if (room <= 0) return;
      const files = Array.from(fileList)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, room);
      const encoded = await Promise.all(files.map(downscaleToDataUrl));
      setImages((prev) => [...prev, ...encoded.filter(Boolean)].slice(0, MAX_PHOTOS));
    },
    [images.length],
  );

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setAttachments((prev) => [...prev, { name: file.name, src: reader.result }]);
    reader.readAsDataURL(file);
  };

  /* -------------------------------------------------------- validation -- */

  const priceCheck = checkPrice(form.price);
  const priceOk = priceCheck.state === "ok" || priceCheck.state === "as-is";
  const msisdn = normalizeOmaniMsisdn(form.whatsapp);

  // Named so the review step can send the seller straight back to the step that
  // is short of something, rather than saying "some fields are missing".
  // Carries a `key`, not a label: the list is built here but read in the review
  // step, and an English literal baked in at build time is a string no
  // translation can reach. Resolved through `addListing.missing` at render.
  const missing = useMemo(() => {
    const list = [];
    if (!form.make.trim()) list.push({ step: 0, key: "make" });
    if (!form.model.trim()) list.push({ step: 0, key: "model" });
    if (!form.year) list.push({ step: 0, key: "year" });
    if (!form.km) list.push({ step: 0, key: "km" });
    // Spec is required: NICHE.md makes "GCC-spec vs US-import is always shown
    // honestly" one of the four promises the marketplace is built on.
    if (!form.importSpec) list.push({ step: 1, key: "spec" });
    if (!priceOk) list.push({ step: 2, key: "price" });
    if (!form.city) list.push({ step: 4, key: "city" });
    if (!msisdn) list.push({ step: 4, key: "whatsapp" });
    return list;
  }, [form, priceOk, msisdn]);

  const canPublish = missing.length === 0;

  // null = nothing attempted. "sent" / "failed" / "not-configured" after.
  const [submitState, setSubmitState] = useState(null);
  const submitAvailable = canSubmitListing();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Async since the API path landed.
   *
   * `submitListing` used to be synchronous — the WhatsApp path just opened a
   * window — and this handler read `result.ok` directly. Under SUBMIT_MODE
   * "api" it returns a Promise, so that read would have been `undefined` and
   * every successful submission would have reported failure. Both paths still
   * return the same shape; only the awaiting is new.
   */
  const handlePublish = async () => {
    if (!canPublish || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitListing(form, {
      locale,
      title: derivedTitle,
      images,
    });

    setSubmitting(false);

    if (result.ok) {
      setSubmitState("sent");
      // The draft is deliberately NOT cleared: nothing is published yet, and a
      // seller whose submission failed downstream would otherwise lose
      // everything they typed.
      return;
    }

    // The CMS owns the useful rejections — the price band above all, which
    // names the limit. Showing it beats a generic failure the seller cannot act
    // on. `signed-out` is called out separately because retyping the form is
    // not the fix for it.
    setSubmitError(result.error ?? null);
    setSubmitState(
      result.reason === "not-configured"
        ? "not-configured"
        : result.reason === "signed-out"
          ? "signed-out"
          : "failed",
    );
  };

  /* ----------------------------------------------------------- stepping -- */

  /**
   * Open a section, closing whatever was open.
   *
   * Still called `goTo` and still takes an index, because `missing` carries one
   * and StepReview sends the seller back with it. What changed is that nothing
   * unmounts: the other five panels are still on the page, collapsed.
   *
   * Focus moves to the opened panel's heading for the same reason it used to
   * move to the step heading — a screen-reader user and a keyboard user both
   * need to land at the top of what just changed, and a phone needs to scroll
   * there rather than leaving the seller looking at a panel that just closed.
   */
  const goTo = useCallback((index) => {
    const next = Math.min(Math.max(index, 0), STEPS.length - 1);
    setOpenSection(next);
    window.requestAnimationFrame(() => {
      const node = headingRefs.current[next];
      node?.focus();
      // `block: "start"` rather than the default centring: a panel that opens
      // half off the top of a 360px screen reads as nothing having happened.
      node?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }, []);

  /** Toggle a panel. Closing the open one leaves every panel closed, which is
   *  a legal state and the one the seller lands in after the last section. */
  const toggleSection = useCallback(
    (index) => {
      if (openSection === index) {
        setOpenSection(null);
        return;
      }
      goTo(index);
    },
    [openSection, goTo],
  );

  /**
   * The listing title is derived, not typed.
   *
   * Asking for a title is asking for "2015 COROLLA GCC FULL OPTION ORIGINAL
   * PAINT!!!" — the OpenSooq texture NICHE.md exists to escape — and it is one
   * more field to type on a phone for information already collected three
   * fields earlier.
   */
  /*
   * Make, model, year — not year first.
   *
   * The catalogue's own convention is "Toyota Corolla 2015 XLI", and it is not
   * only cosmetic. The CMS slug is derived from the title, and a title starting
   * with a year produces a slug starting with digits — which lib/resolveListing
   * matches as a numeric id via `/^(\d+)(?:-|$)/`, looks up listing #2015, finds
   * nothing, and 404s. Every seller-created listing was unreachable because of
   * the word order in this line.
   */
  const derivedTitle = [form.make.trim(), form.model.trim(), form.year]
    .filter(Boolean)
    .join(" ");

  /**
   * What each section still needs, keyed by section index.
   *
   * Derived from the same `missing` list the review section and the publish
   * button already use, so a section header can never disagree with the button
   * about whether the form is done. One source, three readers.
   */
  const missingBySection = useMemo(() => {
    const map = {};
    for (const item of missing) (map[item.step] ??= []).push(item.key);
    return map;
  }, [missing]);

  /**
   * Sections that can be complete, and sections that are simply optional.
   *
   * Photos and review have no required field, so scoring them "done" the moment
   * the page loads would be a tick against work nobody has done. They get a
   * count or nothing instead — an honest status beats a reassuring one.
   */
  const REQUIRED_SECTIONS = new Set([0, 1, 2, 4]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div
                className="tfcl-dashboard tfcl-add-listing-flow"
                data-open-section={openSection ?? "none"}
              >
                <h1 className="admin-title mb-3">{t("title")}</h1>

                {/* The band, stated once at the top before anything is typed,
                    rather than sprung on the seller at the price field. */}
                <div className="tfcl-band-note">
                  {t("bandNote", {
                    stdMin: money(BAND.STANDARD_MIN),
                    max: money(BAND.MAX),
                    asisMin: money(BAND.ASIS_MIN),
                    asisMax: money(BAND.ASIS_MAX),
                    label: tCommon("soldAsIs"),
                  })}
                </div>

                {!submitAvailable ? (
                  <div className="tfcl-notice tfcl-notice--action" role="status">
                    <span>{t("notConfigured")}</span>
                  </div>
                ) : null}

                {offerRestore ? (
                  <div className="tfcl-notice tfcl-notice--action" role="status">
                    <span>
                      {t("draftFound")}
                    </span>
                    <span className="tfcl-notice__buttons">
                      <button
                        type="button"
                        className="second-btn"
                        onClick={restoreDraft}
                      >
                        {t("resume")}
                      </button>
                      <button
                        type="button"
                        className="tfcl-linkish"
                        onClick={discardDraft}
                      >
                        {t("startAgain")}
                      </button>
                    </span>
                  </div>
                ) : null}

                {/*
                  Counted over the sections that can actually be incomplete.
                  Measuring against all six scored photos and review as "done"
                  the moment the page loaded — because neither requires anything
                  — so an untouched form opened on "2 / 6". A progress meter that
                  starts two-sixths full is worse than none: it is the form
                  telling the seller they have already done something.
                */}
                <SectionProgress
                  done={
                    [...REQUIRED_SECTIONS].filter((i) => !missingBySection[i])
                      .length
                  }
                  total={REQUIRED_SECTIONS.size}
                  missingCount={missing.length}
                />

                <ol className="tfcl-sections">
                  {STEPS.map((item, index) => {
                    const isOpen = openSection === index;
                    const gaps = missingBySection[index] ?? [];
                    return (
                      <li key={item.id} className="tfcl-sections__item">
                        <SectionHeader
                          index={index}
                          id={item.id}
                          isOpen={isOpen}
                          gaps={gaps}
                          required={REQUIRED_SECTIONS.has(index)}
                          photoCount={index === 3 ? images.length : null}
                          onToggle={() => toggleSection(index)}
                          headingRef={(node) => {
                            headingRefs.current[index] = node;
                          }}
                        />
                        {/*
                          `hidden` rather than unmounting.
                          Every panel stays mounted so a half-typed answer
                          survives collapsing the section — the wizard could
                          unmount freely because state lived in the parent, but
                          uncontrolled bits (the file input, scroll position,
                          an open native select) did not survive it. It also
                          means the browser can find and autofill a field the
                          seller cannot currently see.
                        */}
                        <div
                          id={`listing-panel-${item.id}`}
                          role="region"
                          aria-labelledby={`listing-section-${item.id}`}
                          className="tfcl-sections__panel"
                          hidden={!isOpen}
                        >
                          {index === 0 ? (
                            <StepCar form={form} set={set} derivedTitle={derivedTitle} />
                          ) : null}
                          {index === 1 ? <StepSpec form={form} set={set} /> : null}
                          {index === 2 ? (
                            <StepPrice form={form} set={set} priceCheck={priceCheck} />
                          ) : null}
                          {index === 3 ? (
                            <StepPhotos
                              images={images}
                              setImages={setImages}
                              addFiles={addFiles}
                              isDragging={isDragging}
                              setIsDragging={setIsDragging}
                              onDrop={handleDrop}
                            />
                          ) : null}
                          {index === 4 ? (
                            <StepContact form={form} set={set} msisdn={msisdn} />
                          ) : null}
                          {index === 5 ? (
                            <StepReview
                              form={form}
                              set={set}
                              images={images}
                              attachments={attachments}
                              setAttachments={setAttachments}
                              onAttachmentChange={handleAttachmentChange}
                              derivedTitle={derivedTitle}
                              priceCheck={priceCheck}
                              missing={missing}
                              canPublish={canPublish}
                              showExtras={showExtras}
                              setShowExtras={setShowExtras}
                              onGoTo={goTo}
                              onPublish={handlePublish}
                              submitState={submitState}
                              submitting={submitting}
                              submitError={submitError}
                              submitAvailable={submitAvailable}
                            />
                          ) : null}

                          {/*
                            Kept, and kept as `listing-next`.
                            The wizard's Next button was the only way forward;
                            here it is a shortcut — the seller can also just open
                            the next header. It stays because closing the section
                            you finished and opening the next one is still the
                            common path, and because it gives a thumb one large
                            target at the bottom of a long panel rather than a
                            scroll back up to the headers.
                          */}
                          {/*
                            Rendered only while this panel is open, not merely
                            hidden with it. Six mounted-but-hidden copies would
                            all carry `data-testid="listing-next"`, and a
                            Playwright locator matching six elements is a strict
                            -mode failure, not a first-match. Keeping exactly one
                            in the DOM also means assistive tech is never offered
                            five "Next" buttons it cannot reach.
                          */}
                          {isOpen && index < STEPS.length - 1 ? (
                            <div className="tfcl-sections__advance">
                              <button
                                type="button"
                                className="pre-btn"
                                onClick={() => goTo(index + 1)}
                                data-testid="listing-next"
                              >
                                {t("nav.next")}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/*
                  Publish lives outside the sections now.
                  In the wizard it was reachable only from step 6, so a seller
                  who had answered everything by step 3 still had to walk the
                  remaining panels to find it. Here it is always on screen and
                  states, in the same breath, what is still stopping it.
                */}
                <PublishBar
                  missing={missing}
                  canPublish={canPublish}
                  submitAvailable={submitAvailable}
                  submitting={submitting}
                  onPublish={handlePublish}
                  onGoTo={goTo}
                />

                <DraftStatus dirty={dirty} onDiscard={discardDraft} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- section chrome -- */

/**
 * Progress, stated as work remaining rather than distance travelled.
 *
 * The wizard's bar measured which step you were standing on, which is a fact
 * about the UI and not about the seller's car — you could be on step 6 of 6 with
 * four fields empty and watch a full bar tell you so. This counts sections that
 * have nothing outstanding, so it only fills as the listing actually becomes
 * publishable.
 */
function SectionProgress({ done, total, missingCount }) {
  const t = useTranslations("addListing");
  const pct = Math.round((done / total) * 100);
  return (
    <div className="tfcl-sections__progress">
      <p className="tfcl-stepper__progress" aria-hidden="true">
        {/* <bdi> for the same reason the old step counter needed it: a neutral
            separator between two Latin numerals reverses under RTL, so "2 / 6"
            renders as "6 / 2" on the Arabic page. */}
        <bdi>
          {done} / {total}
        </bdi>
      </p>
      <div className="tfcl-stepper__bar" aria-hidden="true">
        <span style={{ inlineSize: `${pct}%` }} />
      </div>
      {/* The only announced copy here. The bar and the fraction are decorative
          duplicates of it, so they stay aria-hidden and this carries the meaning.
          Short keys of its own: `readyNotice` is the review step's paragraph
          explaining that publishing queues the car for a human, which is the
          right words in the wrong place for a progress line. */}
      <p className="tfcl-sections__progress-text" role="status">
        {missingCount === 0
          ? t("progressReady")
          : t("progressRemaining", { count: missingCount })}
      </p>
    </div>
  );
}

/**
 * One accordion header.
 *
 * A real `<button aria-expanded aria-controls>` rather than `<details>/<summary>`:
 * summary elements cannot hold the status chip's markup reliably across
 * browsers, and the open state has to be controlled anyway so that opening one
 * panel closes the rest.
 */
function SectionHeader({
  index,
  id,
  isOpen,
  gaps,
  required,
  photoCount,
  onToggle,
  headingRef,
}) {
  const t = useTranslations("addListing");

  // Status is deliberately three-valued, not two. "Nothing outstanding" is not
  // the same claim as "you have done this", and photos/review can never be the
  // former because they require nothing.
  let status = null;
  if (gaps.length) {
    status = { tone: "needs", text: t("sectionNeeds", { count: gaps.length }) };
  } else if (required) {
    status = { tone: "done", text: t("sectionDone") };
  } else if (photoCount !== null && photoCount > 0) {
    status = { tone: "done", text: t("sectionPhotos", { count: photoCount }) };
  } else if (photoCount !== null) {
    status = { tone: "optional", text: t("sectionOptional") };
  }

  return (
    <h2 className="tfcl-sections__heading">
      <button
        type="button"
        id={`listing-section-${id}`}
        className={`tfcl-sections__toggle ${isOpen ? "is-open" : ""}`}
        aria-expanded={isOpen}
        aria-controls={`listing-panel-${id}`}
        onClick={onToggle}
        // Focus target for goTo(). On the heading's button rather than the
        // heading itself so that a keyboard user lands somewhere they can act,
        // and Enter re-collapses what they just opened.
        ref={headingRef}
        data-testid={`listing-section-${id}`}
      >
        <span className="tfcl-stepper__num" aria-hidden="true">
          {index + 1}
        </span>
        {/* Class retained from the wizard: the sell-flow smoke test locates
            steps by `.tfcl-step-heading`, and the copy is unchanged. */}
        <span className="tfcl-step-heading tfcl-sections__title">
          {t(`step.${id}`)}
        </span>
        {status ? (
          <span className={`tfcl-sections__status is-${status.tone}`}>
            {status.text}
          </span>
        ) : null}
        <span className="tfcl-sections__chevron" aria-hidden="true" />
      </button>
    </h2>
  );
}

/**
 * The publish control, lifted out of the last section.
 *
 * In the wizard this lived on step 6, so a seller who had answered everything
 * by step 3 still had to page through photos and contact to reach it. Here it
 * sits below the sections and names what is outstanding, each item a link
 * straight to the panel that holds it.
 */
function PublishBar({
  missing,
  canPublish,
  submitAvailable,
  submitting,
  onPublish,
  onGoTo,
}) {
  const t = useTranslations("addListing");
  return (
    <div className="tfcl-publish-bar">
      <div className="tfcl-publish-bar__status" role="status">
        {missing.length ? (
          <>
            <p className="tfcl-amber">{t("stillNeeded")}</p>
            <ul className="tfcl-missing">
              {missing.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className="tfcl-linkish"
                    onClick={() => onGoTo(item.step)}
                  >
                    {t(`missing.${item.key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="tfcl-hint">{t("readyNotice")}</p>
        )}
      </div>
      <button
        type="button"
        className="pre-btn"
        onClick={onPublish}
        disabled={!canPublish || !submitAvailable || submitting}
        data-testid="listing-publish"
        title={
          canPublish
            ? submitAvailable
              ? t("publishHint")
              : t("notConfigured")
            : t("stillNeeded")
        }
      >
        {submitting ? t("submitting") : t("publish")}
      </button>
    </div>
  );
}

function DraftStatus({ dirty, onDiscard }) {
  const t = useTranslations("addListing");
  if (!dirty) return null;
  return (
    <p className="tfcl-draft-status" role="status">
      {/* Precise about where the draft is, because "saved" on a marketplace
          screen normally means "saved to your account", and this is not that. */}
      {t("draftStatus")}{" "}
      <button type="button" className="tfcl-linkish" onClick={onDiscard}>
        {t("discard")}
      </button>
    </p>
  );
}

/* ------------------------------------------------------------- step 1 -- */

function StepCar({ form, set, derivedTitle }) {
  const t = useTranslations("addListing.car");
  const tc = useTranslations("addListing");
  const tOptions = useTranslations("addListing.options");

  return (
    <div className="tfcl-add-listing">
      <p className="tfcl-step-intro">
        {t("intro")}
      </p>
      <div className="form-group-2">
        <Field label={t("make")} id="listing_make">
          {/* Make and model are CMS relations; until the listing API is wired
              up they stay free text rather than a dropdown of options we would
              have to invent. */}
          <input
            id="listing_make"
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={t("makePlaceholder")}
            value={form.make}
            onChange={(e) => set("make", e.target.value)}
          />
        </Field>
        <Field label={t("model")} id="listing_model">
          <input
            id="listing_model"
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={t("modelPlaceholder")}
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
          />
        </Field>
      </div>

      <div className="form-group-2">
        <Field label={t("year")} id="listing_year">
          <input
            id="listing_year"
            type="number"
            inputMode="numeric"
            className="form-control"
            min={1980}
            max={new Date().getFullYear() + 1}
            placeholder={t("yearPlaceholder")}
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </Field>
        <Field
          label={t("km")}
          id="listing_km"
          hint={t("kmHint")}
        >
          <input
            id="listing_km"
            type="number"
            inputMode="numeric"
            className="form-control"
            min={0}
            step={1000}
            placeholder={t("kmPlaceholder")}
            value={form.km}
            onChange={(e) => set("km", e.target.value)}
          />
        </Field>
      </div>

      <Field label={t("transmission")} id="listing_transmission">
        <select
          id="listing_transmission"
          className="form-control"
          value={form.transmission}
          onChange={(e) => set("transmission", e.target.value)}
        >
          <option value="">{tc("select")}</option>
          {TRANSMISSION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {tOptions(`transmission.${option.key}`)}
            </option>
          ))}
        </select>
      </Field>

      {derivedTitle ? (
        <p className="tfcl-derived" role="status">
          {t("derivedLead")} <strong>{derivedTitle}</strong>. {t("derivedTail")}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- step 2 -- */

function StepSpec({ form, set }) {
  const t = useTranslations("addListing.spec");
  const tc = useTranslations("addListing");
  const tOptions = useTranslations("addListing.options");

  return (
    <>
      <div className="tfcl-add-listing">
        <h3>{t("heading")}</h3>
        {/* Import spec is a first-class field, not an afterthought in the
            description — it is one of NICHE.md's four promises. */}
        <Field
          label={t("origin")}
          id="listing_spec"
          hint={t("originHint")}
        >
          <select
            id="listing_spec"
            className="form-control"
            value={form.importSpec}
            onChange={(e) => set("importSpec", e.target.value)}
            aria-describedby="spec-required"
          >
            <option value="">{t("originSelect")}</option>
            {IMPORT_SPEC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        {form.importSpec === "" ? (
          <p className="tfcl-amber" id="spec-required" role="status">
            {t("originRequired")}
          </p>
        ) : null}

        <div className="form-group-2">
          <Field label={t("condition")} id="listing_condition">
            <select
              id="listing_condition"
              className="form-control"
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
            >
              <option value="">{tc("select")}</option>
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {tOptions(`condition.${option.key}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label={t("mulkiya")}
            id="listing_mulkiya"
            hint={t("mulkiyaHint")}
          >
            <input
              id="listing_mulkiya"
              type="month"
              className="form-control"
              value={form.mulkiyaExpiry}
              onChange={(e) => set("mulkiyaExpiry", e.target.value)}
            />
          </Field>
        </div>

        <fieldset className="tfcl-fieldset">
          <legend>{t("lienLegend")}</legend>
          <p className="tfcl-hint">{t("lienHint")}</p>
          <div className="tfcl-radio-row">
            {LIEN_OPTIONS.map((option) => (
              <label key={option.value} className="tfcl-radio">
                <input
                  type="radio"
                  name="underLien"
                  value={option.value}
                  checked={form.underLien === option.value}
                  onChange={(e) => set("underLien", e.target.value)}
                />
                <span>{tOptions(`lien.${option.key}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="tfcl-add-listing">
        <h3>{t("askNext")}</h3>
        {/* One blank textarea produces either nothing or "car for sale good
            condition". Three short prompts produce the three things a buyer at
            this price band actually wants, and the third one — faults — is the
            honesty promise implemented as a data field rather than asserted in
            marketing. */}
        <Field label={t("reason")} id="listing_reason">
          <textarea
            id="listing_reason"
            placeholder={t("reasonPlaceholder")}
            value={form.reasonForSelling}
            onChange={(e) => set("reasonForSelling", e.target.value)}
          />
        </Field>
        <Field
          label={t("work")}
          id="listing_work"
        >
          <textarea
            id="listing_work"
            placeholder={t("workPlaceholder")}
            value={form.recentWork}
            onChange={(e) => set("recentWork", e.target.value)}
          />
        </Field>

        <Field label={t("faults")} id="listing_faults">
          <textarea
            id="listing_faults"
            placeholder={t("faultsPlaceholder")}
            value={form.knownFaults}
            disabled={form.noKnownFaults}
            onChange={(e) => set("knownFaults", e.target.value)}
          />
        </Field>
        <label className="tfcl-checkbox">
          <input
            type="checkbox"
            checked={form.noKnownFaults}
            onChange={(e) => {
              set("noKnownFaults", e.target.checked);
              if (e.target.checked) set("knownFaults", "");
            }}
          />
          <span>{t("noFaults")}</span>
        </label>
        <p className="tfcl-hint">
          {t("faultsHint")}
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- step 3 -- */

function StepPrice({ form, set, priceCheck }) {
  const tCommon = useTranslations("common");
  const t = useTranslations("addListing.price");
  const tCheck = useTranslations("addListing.priceCheck");

  return (
    <div className="tfcl-add-listing">
      <Field label={t("label", { currency: CURRENCY })} id="listing_price">
        <input
          id="listing_price"
          type="number"
          inputMode="numeric"
          className="form-control"
          min={BAND.ASIS_MIN}
          max={BAND.MAX}
          step={10}
          placeholder={t("placeholder", {
            min: BAND.ASIS_MIN.toLocaleString("en-US"),
            max: BAND.MAX.toLocaleString("en-US"),
          })}
          value={form.price}
          onChange={(e) => set("price", e.target.value)}
          aria-invalid={priceCheck.state === "invalid"}
          aria-describedby="price-feedback"
        />
      </Field>

      <div id="price-feedback" aria-live="polite">
        {priceCheck.state === "invalid" ? (
          <p className="tfcl-amber" role="alert">
            {tCheck(priceCheck.reason, priceCheck.values)}
          </p>
        ) : null}

        {priceCheck.state === "as-is" ? (
          <div className="mt-2">
            <span style={SOLD_AS_IS_STYLE}>{tCommon("soldAsIs")}</span>
            <p className="tfcl-amber">
              {t("asIs", {
                threshold: money(BAND.STANDARD_MIN),
                label: tCommon("soldAsIs"),
              })}
            </p>
          </div>
        ) : null}

        {priceCheck.state === "ok" ? (
          <p className="tfcl-hint">
            {t("ok")}
          </p>
        ) : null}

        {priceCheck.state === "empty" ? (
          <p className="tfcl-hint">
            {t("empty", {
              asisMin: money(BAND.ASIS_MIN),
              asisMax: money(BAND.ASIS_MAX),
              label: tCommon("soldAsIs"),
              stdMin: money(BAND.STANDARD_MIN),
              max: money(BAND.MAX),
            })}
          </p>
        ) : null}
      </div>

      {/*
        Not a valuation. Autosouq has no completed-sale dataset and will not
        invent one — AutoTrader, with millions of transactions, still declines
        to price-rate old, imported, privately-sold cars, which is this entire
        catalogue. What we can honestly do is show the seller the same evidence
        the buyer sees.

        TODO once URL filter state lands (see design/research §1.3): append the
        make/model/year already collected so this lands on comparable cars
        rather than the whole grid.
      */}
      <p className="tfcl-hint">
        <Link href="/used-cars" className="tfcl-linkish">
          {t("compareLink")}
        </Link>{" "}
        {t("compareTail")}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- step 4 -- */

const MAX_PHOTOS = 10;

/**
 * Named shots, not a photo count.
 *
 * At this price band the photos are the only condition evidence there is —
 * there is no MOT history, no HPI, no write-off register in Oman. AutoTrader
 * asks for twenty photos because UK sellers have unmetered data; ten specific
 * ones beat twenty unguided ones for a seller paying by the megabyte. The
 * odometer shot is the cheapest anti-tampering signal on the list and costs the
 * seller one tap. The eight shots live in messages under `addListing.photos`.
 */

function StepPhotos({ images, setImages, addFiles, isDragging, setIsDragging, onDrop }) {
  const t = useTranslations("addListing.photos");
  const SHOT_LIST = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => t(`shot${n}`));

  return (
    <div className="tfcl-add-listing upload-photo">
      <p className="tfcl-step-intro">
        {t("intro")}
      </p>

      <div
        className={`upload-media ${isDragging ? "is-dragging" : ""}`}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="inner">
          {/* Stays an <a> because the theme styles this button with the element
              selector `.upload-media a`. It carries no href — the invisible
              .ip-file input below covers it and is the real control. */}
          <a className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={14}
              viewBox="0 0 18 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M0.875 10.125L5.17417 5.82583C5.34828 5.65172 5.55498 5.51361 5.78246 5.41938C6.00995 5.32515 6.25377 5.27665 6.5 5.27665C6.74623 5.27665 6.99005 5.32515 7.21754 5.41938C7.44502 5.51361 7.65172 5.65172 7.82583 5.82583L12.125 10.125M10.875 8.875L12.0492 7.70083C12.2233 7.52672 12.43 7.38861 12.6575 7.29438C12.885 7.20015 13.1288 7.15165 13.375 7.15165C13.6212 7.15165 13.865 7.20015 14.0925 7.29438C14.32 7.38861 14.5267 7.52672 14.7008 7.70083L17.125 10.125M2.125 13.25H15.875C16.2065 13.25 16.5245 13.1183 16.7589 12.8839C16.9933 12.6495 17.125 12.3315 17.125 12V2C17.125 1.66848 16.9933 1.35054 16.7589 1.11612C16.5245 0.881696 16.2065 0.75 15.875 0.75H2.125C1.79348 0.75 1.47554 0.881696 1.24112 1.11612C1.0067 1.35054 0.875 1.66848 0.875 2V12C0.875 12.3315 1.0067 12.6495 1.24112 12.8839C1.47554 13.1183 1.79348 13.25 2.125 13.25ZM10.875 3.875H10.8817V3.88167H10.875V3.875ZM11.1875 3.875C11.1875 3.95788 11.1546 4.03737 11.096 4.09597C11.0374 4.15458 10.9579 4.1875 10.875 4.1875C10.7921 4.1875 10.7126 4.15458 10.654 4.09597C10.5954 4.03737 10.5625 3.95788 10.5625 3.875C10.5625 3.79212 10.5954 3.71263 10.654 3.65403C10.7126 3.59542 10.7921 3.5625 10.875 3.5625C10.9579 3.5625 11.0374 3.59542 11.096 3.65403C11.1546 3.71263 11.1875 3.79212 11.1875 3.875Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("choose")}
            <input
              type="file"
              className="ip-file"
              accept="image/*"
              multiple
              aria-label={t("choose")}
              onChange={(e) => addFiles(e.target.files)}
            />
          </a>
          <div className="desc">
            {t("drag")} <br />
            <span>{t("added", { count: images.length, max: MAX_PHOTOS })}</span>
          </div>
        </div>
      </div>

      <p className="tfcl-hint">
        {t("shrinkHint")}
      </p>

      {/* The gap, said plainly rather than implied by a button that does
          nothing. */}
      <p className="tfcl-amber" role="note">
        {t("notSwitchedOn")}
      </p>

      <h3 className="mt-3">{t("asItIs")}</h3>
      <p className="tfcl-hint">
        {t("asItIsHint")}
      </p>
      <ul className="tfcl-shotlist">
        {SHOT_LIST.map((shot) => (
          <li key={shot}>{shot}</li>
        ))}
      </ul>

      {images.length ? (
        <div className="thumbnail-media">
          {images.map((src, index) => (
            <div key={src.slice(-32) + index} className="item">
              <Image
                alt={t("photoAlt", { n: index + 1 })}
                src={src}
                width={615}
                height={405}
                unoptimized
              />
              <button
                type="button"
                onClick={() =>
                  setImages((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label={t("removePhoto", { n: index + 1 })}
                className="tfcl-thumb-remove"
              >
                <TrashIcon />
              </button>
              {index === 0 ? (
                <span className="tfcl-thumb-flag">{t("mainPhoto")}</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------- step 5 -- */

function StepContact({ form, set, msisdn }) {
  const t = useTranslations("addListing.contact");

  return (
    <>
      <div className="tfcl-add-listing">
        <h3>{t("where")}</h3>
        {/*
          The theme put a Google map here, centred on a fixed point regardless
          of anything the seller typed. It told the seller nothing, and cost a
          third-party tile load on a metered connection. The city is what a
          buyer filters on; a map of a place the seller did not choose is not.
        */}
        <div className="form-group-2">
          <Field label={t("city")} id="listing_city">
            <select
              id="listing_city"
              className="form-control"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            >
              <option value="">{t("citySelect")}</option>
              {OMAN_CITIES.map((city) => (
                <option key={city.en} value={city.en}>
                  {city.en} — {city.ar}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("area")} id="listing_address">
            <input
              id="listing_address"
              type="text"
              className="form-control"
              placeholder={t("areaPlaceholder")}
              value={form.area}
              onChange={(e) => set("area", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="tfcl-add-listing">
        <h3>{t("reach")}</h3>
        {/*
          Told before the field, not after it. AutoTrader offers private sellers
          a number-masking relay; we deliberately do not, because "one WhatsApp
          tap to the seller" is the promise the site is built on and a relay
          breaks it. The honest version of the same duty of care is to say
          plainly what will be public, before the seller types it.
        */}
        <div className="tfcl-notice">{t("notice")}</div>

        <div className="form-group-2">
          <Field
            label={t("whatsapp")}
            id="listing_whatsapp"
            hint={t("whatsappHint")}
          >
            <input
              id="listing_whatsapp"
              type="tel"
              inputMode="tel"
              className="form-control"
              placeholder="+968 9XXX XXXX"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              aria-invalid={form.whatsapp !== "" && !msisdn}
              aria-describedby="whatsapp-feedback"
            />
          </Field>
          <Field label={t("otherPhone")} id="listing_phone">
            <input
              id="listing_phone"
              type="tel"
              inputMode="tel"
              className="form-control"
              placeholder="+968 …"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
        </div>
        <div id="whatsapp-feedback" aria-live="polite">
          {form.whatsapp !== "" && !msisdn ? (
            <p className="tfcl-amber" role="alert">
              {t("invalid")}
            </p>
          ) : null}
          {msisdn ? (
            <p className="tfcl-hint">
              {t("willMessage", { msisdn })}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- step 6 -- */

function StepReview({
  form,
  set,
  images,
  attachments,
  setAttachments,
  onAttachmentChange,
  derivedTitle,
  priceCheck,
  missing,
  canPublish,
  showExtras,
  setShowExtras,
  onGoTo,
  onPublish,
  submitState,
  submitting,
  submitError,
  submitAvailable,
}) {
  const tCommon = useTranslations("common");
  const t = useTranslations("addListing.review");
  // The review step showed "2,700 OMR" to a seller reading Arabic.
  const locale = useLocale();
  const tc = useTranslations("addListing");
  const tRow = useTranslations("addListing.reviewRow");
  const tOptions = useTranslations("addListing.options");
  // Stored value -> the label the seller actually picked it by, in their
  // language. `form.transmission` holds "Automatic", not "أوتوماتيك".
  const optionLabel = (list, value, group) => {
    const hit = list.find((o) => o.value === value);
    return hit ? tOptions(`${group}.${hit.key}`) : null;
  };
  const spec = IMPORT_SPEC_OPTIONS.find((o) => o.value === form.importSpec);
  /**
   * The last screen before publishing, and it was entirely in English.
   *
   * Both halves needed translating, not just the labels: the stored values are
   * the CMS vocabulary, so echoing them raw would have left English answers
   * under Arabic labels. They resolve back through `addListing.options`, the
   * same catalogue the pickers that set them read from.
   */
  const rows = [
    [tRow("title"), derivedTitle || null],
    [tRow("km"), form.km ? `${Number(form.km).toLocaleString("en-US")} km` : null],
    [
      tRow("transmission"),
      optionLabel(TRANSMISSION_OPTIONS, form.transmission, "transmission"),
    ],
    [tRow("spec"), spec?.label ?? null],
    [tRow("condition"), optionLabel(CONDITION_OPTIONS, form.condition, "condition")],
    [tRow("mulkiya"), form.mulkiyaExpiry || null],
    [tRow("lien"), optionLabel(LIEN_OPTIONS, form.underLien, "lien")],
    [
      tRow("faults"),
      form.noKnownFaults ? tRow("noFaults") : form.knownFaults || null,
    ],
    [tRow("price"), priceCheck.state === "empty" ? null : formatPrice(form.price, undefined, locale)],
    [tRow("city"), form.city || null],
    [tRow("photos"), images.length ? tRow("photosAdded", { count: images.length }) : null],
  ];

  return (
    <>
      <div className="tfcl-add-listing">
        <h3>{t("heading")}</h3>
        <dl className="tfcl-review">
          {rows.map(([label, value]) => (
            <div key={label} className="tfcl-review__row">
              <dt>{label}</dt>
              {/* An em dash, not a blank: blank is ambiguous about whether the
                  seller left it out or the site failed to show it. */}
              <dd className={value ? "" : "is-empty"}>{value ?? "—"}</dd>
            </div>
          ))}
        </dl>
        {priceCheck.state === "as-is" ? (
          <p className="tfcl-amber">
            {tc("asIsNotice", { label: tCommon("soldAsIs") })}
          </p>
        ) : null}
        <p className="tfcl-hint">
          {tc("reviewNotice")}
        </p>
      </div>

      <div className="tfcl-add-listing">
        <button
          type="button"
          className="tfcl-disclosure"
          aria-expanded={showExtras}
          onClick={() => setShowExtras(!showExtras)}
        >
          <span>{t("more")}</span>
          <span aria-hidden="true">{showExtras ? "−" : "+"}</span>
        </button>
        <p className="tfcl-hint">
          {t("moreHint")}
        </p>

        {showExtras ? (
          <div className="tfcl-disclosure__panel">
            <div className="form-group-2">
              <Field
                label={t("vin")}
                id="listing_vin"
                hint={t("vinHint")}
              >
                <input
                  id="listing_vin"
                  type="text"
                  className="form-control"
                  maxLength={17}
                  placeholder={t("vinPlaceholder")}
                  value={form.vin}
                  onChange={(e) => set("vin", e.target.value.toUpperCase())}
                />
              </Field>
              <Field label={t("colour")} id="listing_color">
                <input
                  id="listing_color"
                  type="text"
                  className="form-control"
                  placeholder={t("colourPlaceholder")}
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </Field>
            </div>

            <div className="form-group-4">
              <Select
                label={t("body")}
                id="listing_body"
                value={form.body}
                options={BODY_OPTIONS}
                group="body"
                onChange={(v) => set("body", v)}
              />
              <Select
                label={t("fuel")}
                id="listing_fuel"
                value={form.fuelType}
                options={FUEL_OPTIONS}
                group="fuel"
                onChange={(v) => set("fuelType", v)}
              />
              <Select
                label={t("drive")}
                id="listing_drive"
                value={form.driveType}
                options={DRIVE_OPTIONS}
                group="drive"
                onChange={(v) => set("driveType", v)}
              />
              <Select
                label={t("cylinders")}
                id="listing_cylinders"
                value={form.cylinders}
                options={CYLINDER_OPTIONS}
                onChange={(v) => set("cylinders", v)}
              />
            </div>

            <div className="form-group-4">
              <Field label={t("engineSize")} id="listing_engine">
                <input
                  id="listing_engine"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={0.6}
                  max={8}
                  className="form-control"
                  placeholder={t("enginePlaceholder")}
                  value={form.engineSize}
                  onChange={(e) => set("engineSize", e.target.value)}
                />
              </Field>
              <Select
                label={t("doors")}
                id="listing_doors"
                value={form.doors}
                options={DOOR_OPTIONS}
                onChange={(v) => set("doors", v)}
              />
              <Select
                label={t("seats")}
                id="listing_seats"
                value={form.seats}
                options={SEAT_OPTIONS}
                onChange={(v) => set("seats", v)}
              />
              <Field label={t("videoUrl")} id="listing_video">
                <input
                  id="listing_video"
                  type="url"
                  className="form-control"
                  placeholder={t("videoPlaceholder")}
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                />
              </Field>
            </div>

            <fieldset className="tfcl-fieldset">
              <legend>{t("features")}</legend>
              {/* Was five invented columns including "Mini bar", "Premium
                  leather seats" and "Rear seat ventilation system" — options for
                  a car that costs ten times the ceiling of this site. The list
                  now comes from the same source the search filters use, so a
                  seller can only tick something a buyer can actually filter
                  for. */}
              <div className="tfcl-feature-grid">
                {featureOptions.map((feature) => (
                  <label className="tfcl-checkbox" key={feature}>
                    <input
                      type="checkbox"
                      value={feature}
                      checked={form.features.includes(feature)}
                      onChange={(e) =>
                        set(
                          "features",
                          e.target.checked
                            ? [...form.features, feature]
                            : form.features.filter((f) => f !== feature),
                        )
                      }
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <h4 className="mt-3">{t("documents")}</h4>
            <p className="tfcl-hint">
              {tc("documentsHint")}
            </p>
            <ul className="list-attrach">
              {attachments.map((file, index) => (
                <li className="item" key={file.name + index}>
                  <PdfIcon />
                  <span className="tfcl-attach-name">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    aria-label={`Remove ${file.name}`}
                    className="tfcl-thumb-remove"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
              <li className="item upload">
                <label className="inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={30}
                    height={30}
                    viewBox="0 0 30 30"
                    fill="none"
                    aria-hidden="true"
                  >
                    {/* Brand terracotta, 700 step (#C9502E = $brand-terracotta-dark).
                        Was the AutoDeal template's orange. The 500 step #E97451 is
                        only 2.97:1 on this white panel and misses the 3:1 WCAG
                        minimum for a meaningful icon; #C9502E is 4.50:1. */}
                    <path
                      d="M15 20.625V12.1875M15 12.1875L18.75 15.9375M15 12.1875L11.25 15.9375M8.43751 24.375C7.0993 24.3765 5.80441 23.9008 4.78539 23.0334C3.76636 22.166 3.08995 20.9637 2.87765 19.6424C2.66534 18.3212 2.93104 16.9675 3.62704 15.8245C4.32303 14.6815 5.40371 13.8241 6.67501 13.4063C6.34839 11.7327 6.68596 9.99778 7.61624 8.5688C8.54653 7.13981 9.99647 6.12902 11.659 5.75046C13.3216 5.37191 15.0662 5.65531 16.5235 6.54067C17.9807 7.42602 19.0361 8.8438 19.4663 10.4938C20.1313 10.2775 20.8435 10.2515 21.5225 10.4186C22.2016 10.5858 22.8203 10.9395 23.3089 11.4398C23.7975 11.9401 24.1365 12.5671 24.2875 13.2499C24.4386 13.9326 24.3957 14.6441 24.1638 15.3038C25.1871 15.6947 26.0413 16.4314 26.5782 17.3862C27.1151 18.341 27.3009 19.4537 27.1033 20.5311C26.9057 21.6086 26.3372 22.5829 25.4963 23.285C24.6555 23.9871 23.5954 24.3727 22.5 24.375H8.43751Z"
                      stroke="#C9502E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="upload">
                    {t("uploadFile")}
                    <input
                      type="file"
                      className="ip-file"
                      accept="application/pdf"
                      onChange={onAttachmentChange}
                    />
                  </div>
                </label>
              </li>
            </ul>
          </div>
        ) : null}
      </div>

      <div className="tfcl-add-listing">
        <h3>{tc("publishShort")}</h3>
        {missing.length ? (
          <div role="status">
            <p className="tfcl-amber">{tc("stillNeeded")}</p>
            <ul className="tfcl-missing">
              {missing.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className="tfcl-linkish"
                    onClick={() => onGoTo(item.step)}
                  >
                    {tc(`missing.${item.key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="tfcl-hint">
            {tc("readyNotice")}
          </p>
        )}

        {/* Posts to /api/listings as the signed-in seller — see
            lib/submitListing.js. type="button" so it cannot half-submit a form
            POST that does not exist. */}
        <div className="group-button-submit left">
          <button
            type="button"
            className="pre-btn"
            onClick={onPublish}
            // Also disabled while in flight: this is a network round trip now,
            // not a window.open, and a double tap on a slow phone connection
            // would otherwise file the same car twice.
            disabled={!canPublish || !submitAvailable || submitting}
            title={submitAvailable ? tc("publishHint") : tc("notConfigured")}
          >
            {submitting ? tc("submitting") : tc("publish")}
          </button>
        </div>

        {/* One live region for the outcome. Nothing is claimed until the
            handoff has actually happened. */}
        <div aria-live="polite">
          {submitState === "sent" && (
            <div className="tfcl-notice" role="status">
              <strong>{tc("submitted")}</strong>
              <br />
              {tc("submittedBody")}
            </div>
          )}
          {submitState === "signed-out" && (
            <p className="tfcl-amber" role="alert">
              {tc("submitSignedOut")}
            </p>
          )}
          {submitState === "failed" && (
            <p className="tfcl-amber" role="alert">
              {/* The CMS's own words when it gave any — the price-band
                  rejection names the limit, which is the one message a seller
                  can actually act on. Generic text only as a fallback. */}
              {submitError || tc("submitFailed")}
            </p>
          )}
        </div>

        {!submitAvailable && (
          <p className="tfcl-amber" role="note">
            {tc("notConfigured")}
          </p>
        )}
        {submitAvailable && submitState === null && (
          <p className="tfcl-hint">{tc("publishHint")}</p>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------- fields -- */

function Field({ label, id, hint, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="tfcl-hint">{hint}</p> : null}
    </div>
  );
}

function Select({ label, id, value, options, group, onChange }) {
  const tc = useTranslations("addListing");
  /**
   * Two option shapes, deliberately.
   *
   * Word options are `{ value, key }` — `value` is the CMS vocabulary that gets
   * stored, `key` resolves under `addListing.options.<group>` for display, so an
   * Arabic seller reads "بنزين" and the listing still stores "Petrol".
   *
   * Numeric options (cylinders, doors, seats) stay plain strings: they are
   * digits, they are identical in both languages, and inventing catalogue keys
   * for "4" would be ceremony with no reader on the other end.
   */
  const tOptions = useTranslations("addListing.options");
  const labelFor = (option) =>
    typeof option === "string" ? option : tOptions(`${group}.${option.key}`);
  const valueOf = (option) => (typeof option === "string" ? option : option.value);
  return (
    <Field label={label} id={id}>
      {/* Native <select> throughout, not the theme's div-based nice-select: on
          a budget Android this opens the OS picker, which is a bigger and more
          reliable target than a custom list and needs no JavaScript to open. */}
      <select
        id={id}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{tc("select")}</option>
        {options.map((option) => (
          <option key={valueOf(option)} value={valueOf(option)}>
            {labelFor(option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* ---------------------------------------------------------------- utils -- */

/**
 * Shrink a photo in the browser before it is previewed or (one day) uploaded.
 *
 * NICHE.md's audience is on budget Android over metered data. A modern phone
 * camera produces 4–8 MB per shot; ten of those is a bill the seller pays to
 * list a car. 1,600px on the long edge is larger than any surface the site
 * renders a listing photo at, so nothing visible is lost.
 *
 * Falls back to the untouched file if createImageBitmap or canvas is
 * unavailable — an older WebView should still be able to list a car.
 */
async function downscaleToDataUrl(file, maxEdge = 1600, quality = 0.82) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }
}

/* ---------------------------------------------------------------- options -- */

/**
 * Option lists: a stable English **value** plus a catalogue key for the label.
 *
 * These used to be plain string arrays, where the same English string was the
 * value stored on the listing *and* the text the seller read. That made them
 * untranslatable without changing the data: localising the array would have
 * written "ممتازة" into the `condition` field that the CMS, the filters and
 * `data/cars.js` all expect to read "Excellent".
 *
 * Splitting the two is the whole fix. `value` is the CMS vocabulary and never
 * moves; `key` resolves through `addListing.options.*` so an Arabic seller
 * picks "ممتازة" and the listing still stores "Excellent". Same shape as
 * IMPORT_SPEC_OPTIONS above, which already got this right.
 */
const CONDITION_OPTIONS = [
  { value: "Excellent", key: "excellent" },
  { value: "Good", key: "good" },
  { value: "Fair", key: "fair" },
  { value: "Needs work", key: "needsWork" },
];
const TRANSMISSION_OPTIONS = [
  { value: "Automatic", key: "automatic" },
  { value: "Manual", key: "manual" },
];
const FUEL_OPTIONS = [
  { value: "Petrol", key: "petrol" },
  { value: "Diesel", key: "diesel" },
  { value: "Hybrid", key: "hybrid" },
  { value: "Electric", key: "electric" },
];
const BODY_OPTIONS = [
  { value: "Sedan", key: "sedan" },
  { value: "Hatchback", key: "hatchback" },
  { value: "SUV", key: "suv" },
  { value: "Crossover", key: "crossover" },
  { value: "Pick-up", key: "pickup" },
  { value: "Van", key: "van" },
  { value: "Coupe", key: "coupe" },
  { value: "Wagon", key: "wagon" },
];
// Values match the CMS `driveType` enum (fwd / rwd / awd / four_wd).
const DRIVE_OPTIONS = [
  { value: "Front-wheel drive (FWD)", key: "fwd" },
  { value: "Rear-wheel drive (RWD)", key: "rwd" },
  { value: "All-wheel drive (AWD)", key: "awd" },
  { value: "Four-wheel drive (4WD)", key: "fourWd" },
];
// Ranges match the min/max on the CMS content type.
const CYLINDER_OPTIONS = ["3", "4", "5", "6", "8"];
const DOOR_OPTIONS = ["2", "3", "4", "5"];
const SEAT_OPTIONS = ["2", "4", "5", "7", "8", "9"];

// "Not sure" is a real answer and a common one — a seller who inherited the
// loan paperwork from a spouse genuinely may not know. Forcing a yes/no would
// produce a confident wrong answer, which is worse than an honest gap.
const LIEN_OPTIONS = [
  { value: "no", key: "no" },
  { value: "yes", key: "yes" },
  { value: "unsure", key: "unsure" },
];

const OMAN_CITIES = [
  // Muscat Governorate first — highest listing volume (seo-research §3.5).
  { en: "Muscat", ar: "مسقط" },
  { en: "Seeb", ar: "السيب" },
  { en: "Bawshar", ar: "بوشر" },
  { en: "Muttrah", ar: "مطرح" },
  { en: "Al Amarat", ar: "العامرات" },
  { en: "Al Khuwair", ar: "الخوير" },
  { en: "Al Ghubrah", ar: "الغبرة" },
  { en: "Azaiba", ar: "العذيبة" },
  { en: "Ruwi", ar: "روي" },
  { en: "Qurum", ar: "القرم" },
  { en: "Al Mawaleh", ar: "الموالح" },
  { en: "Al Khoud", ar: "الخوض" },
  { en: "Al Maabilah", ar: "المعبيلة" },
  { en: "Quriyat", ar: "قريات" },
  // Rest of Oman
  { en: "Sohar", ar: "صحار" },
  { en: "Barka", ar: "بركاء" },
  { en: "Salalah", ar: "صلالة" },
  { en: "Nizwa", ar: "نزوى" },
  { en: "Sur", ar: "صور" },
  { en: "Ibri", ar: "عبري" },
  { en: "Rustaq", ar: "الرستاق" },
  { en: "Ibra", ar: "إبراء" },
  { en: "Buraimi", ar: "البريمي" },
  { en: "Khasab", ar: "خصب" },
];

/* ------------------------------------------------------------- fragments -- */

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={44}
      height={44}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M53.625 4.40731V55.5926C53.625 56.2947 53.3461 56.9679 52.8497 57.4644C52.3533 57.9608 51.68 58.2397 50.9779 58.2397H9.02206C8.32002 58.2397 7.64673 57.9608 7.15031 57.4644C6.65389 56.9679 6.375 56.2947 6.375 55.5926V12.3838H14.3603C15.0623 12.3838 15.7356 12.1049 16.232 11.6085C16.7285 11.1121 17.0074 10.4388 17.0074 9.73672V1.76025H50.9779C51.68 1.76025 52.3533 2.03914 52.8497 2.53556C53.3461 3.03198 53.625 3.70527 53.625 4.40731Z"
        fill="#E9EDF4"
      />
      <path
        d="M6.375 12.3838H14.3603C15.0623 12.3838 15.7356 12.1049 16.232 11.6085C16.7285 11.1121 17.0074 10.4388 17.0074 9.73672V1.76025L6.375 12.3838Z"
        fill="#D2DBEA"
      />
      {/* Brand terracotta 700 step (#C9502E = $brand-terracotta-dark), was the
          AutoDeal template's orange. The white "PDF" lettering sits on this fill:
          white on #E97451 is 2.97:1 and fails AA, white on #C9502E is 4.50:1
          and passes. */}
      <path
        d="M56.4706 34.5776V46.86C56.4706 47.562 56.1917 48.2353 55.6953 48.7317C55.1989 49.2281 54.5256 49.507 53.8235 49.507H6.17648C5.47443 49.507 4.80114 49.2281 4.30472 48.7317C3.8083 48.2353 3.52942 47.562 3.52942 46.86V34.5776C3.52942 33.8756 3.8083 33.2023 4.30472 32.7058C4.80114 32.2094 5.47443 31.9305 6.17648 31.9305H53.8235C54.5256 31.9305 55.1989 32.2094 55.6953 32.7058C56.1917 33.2023 56.4706 33.8756 56.4706 34.5776Z"
        fill="#C9502E"
      />
      <path
        d="M18.7748 44.9179C18.7223 44.8663 18.6809 44.8044 18.6533 44.7361C18.6257 44.6678 18.6123 44.5945 18.6142 44.5209V36.9335C18.6142 36.7773 18.6671 36.6423 18.7748 36.5312C18.8254 36.4769 18.887 36.4338 18.9554 36.405C19.0238 36.3761 19.0976 36.3619 19.1718 36.3635H21.998C22.7833 36.3635 23.4239 36.4959 23.9189 36.7606C24.4157 37.0253 24.7704 37.3641 24.9865 37.777C25.2001 38.19 25.3086 38.6365 25.3086 39.1156C25.3086 39.5947 25.2001 40.042 24.9857 40.455C24.7704 40.8679 24.4157 41.2068 23.9189 41.4715C23.4239 41.7362 22.7824 41.8685 21.998 41.8685H19.7418V44.5209C19.7433 44.5951 19.7291 44.6688 19.7002 44.7372C19.6714 44.8056 19.6284 44.8672 19.5742 44.9179C19.463 45.0247 19.328 45.0785 19.1709 45.0785C19.0139 45.0785 18.8815 45.0256 18.7748 44.9179ZM21.8868 40.8018C22.7295 40.8018 23.3224 40.6403 23.6648 40.3182C24.008 39.9962 24.1792 39.5947 24.1792 39.1156C24.1792 38.6365 24.008 38.235 23.6648 37.9129C23.3224 37.5909 22.7295 37.4294 21.8868 37.4294H19.7418V40.8018H21.8868Z"
        fill="white"
      />
      <path
        d="M27.1059 44.8552C27.0533 44.8036 27.0117 44.7418 26.984 44.6735C26.9562 44.6052 26.9427 44.5319 26.9445 44.4582V36.9335C26.9445 36.7773 26.9974 36.6423 27.1059 36.5311C27.1565 36.4769 27.2179 36.434 27.2862 36.4051C27.3544 36.3762 27.428 36.362 27.5021 36.3635H29.9939C30.9353 36.3635 31.7356 36.5726 32.393 36.9899C33.0266 37.382 33.5394 37.9417 33.8745 38.6073C34.2045 39.269 34.3695 39.9626 34.3695 40.6896C34.3695 41.4167 34.2045 42.1111 33.8745 42.7729C33.5392 43.4385 33.0261 43.9983 32.3921 44.3902C31.7356 44.8085 30.9362 45.0167 29.9939 45.0167H27.503C27.4293 45.0184 27.356 45.005 27.2877 44.9772C27.2194 44.9494 27.1575 44.9079 27.1059 44.8552ZM29.858 43.9632C30.5348 43.9632 31.1295 43.8246 31.6421 43.5476C32.1408 43.2846 32.5538 42.8844 32.8324 42.3943C33.113 41.9029 33.2542 41.3355 33.2542 40.6905C33.2542 40.0455 33.113 39.4773 32.8324 38.9858C32.5535 38.4959 32.1406 38.0958 31.6421 37.8326C31.1303 37.5555 30.5348 37.4179 29.858 37.4179H28.0721V43.9632H29.858Z"
        fill="white"
      />
      <path
        d="M36.4156 44.9179C36.3631 44.8662 36.3218 44.8043 36.2941 44.736C36.2665 44.6677 36.2532 44.5945 36.255 44.5208V36.9335C36.255 36.7773 36.308 36.6423 36.4156 36.5311C36.4663 36.4768 36.5278 36.4338 36.5963 36.4049C36.6647 36.376 36.7384 36.3619 36.8127 36.3635H41.6348C41.783 36.3635 41.9092 36.4155 42.0124 36.5188C42.1156 36.622 42.1677 36.7482 42.1677 36.8964C42.1677 37.0446 42.1156 37.1699 42.0124 37.2688C41.9092 37.3676 41.783 37.417 41.6348 37.417H37.3827V40.1567H41.2006C41.3506 40.1567 41.4759 40.2096 41.5792 40.312C41.6824 40.4152 41.7345 40.5414 41.7345 40.6905C41.7345 40.8388 41.6824 40.9632 41.5792 41.062C41.4759 41.1608 41.3497 41.2102 41.2006 41.2102H37.3827V44.5208C37.3842 44.5951 37.37 44.6688 37.3411 44.7372C37.3122 44.8056 37.2693 44.8672 37.215 44.9179C37.1039 45.0246 36.9689 45.0785 36.8127 45.0785C36.6565 45.0785 36.5233 45.0255 36.4156 44.9179Z"
        fill="white"
      />
    </svg>
  );
}
