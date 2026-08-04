"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Apply to become a showroom, from an account that started as a private one.
 *
 * The gap this closes: the showroom checkbox exists only on /sign-up, so an
 * account's type was decided in the first thirty seconds and could never be
 * changed. That does not match how a dealer actually arrives. They hear about
 * the site, list one car to see whether anyone calls, and only then want the
 * badge — and until now the only route to it was a second account, which
 * strands the listings filed under the first.
 *
 * It lives on /my-profile rather than behind its own menu row because it is a
 * fact about the account, and because a sidebar item that most sellers should
 * ignore costs every seller a decision.
 *
 * Three states, and the middle one is the one worth getting right:
 *
 * - no application: the form
 * - pending: told plainly that a person reviews it, with no fake progress bar
 *   and no estimate we cannot keep
 * - approved / declined: the outcome, and for a decline the moderator's note,
 *   because a rejection with no reason is the thing that makes someone give up
 *   on a marketplace rather than fix their paperwork
 */
export default function ShowroomApplication({ showroom = null }) {
  const t = useTranslations("dashboard.showroom");
  const [name, setName] = useState("");
  const [cr, setCr] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(showroom);

  const canSend =
    name.trim().length >= 2 && cr.trim().length >= 4 && state !== "sending";

  const send = async () => {
    if (!canSend) return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/seller/showroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: name.trim(),
          crNumber: cr.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        // Straight to the pending panel. No "sent!" toast that disappears and
        // leaves the form sitting there looking unsubmitted.
        setApplied({ name: name.trim(), state: "pending" });
        return;
      }
      setState("failed");
      setError(data?.code ?? "failed");
    } catch {
      setState("failed");
      setError("unavailable");
    }
  };

  if (applied) {
    const s = applied.state === "approved" ? "approved" : applied.state === "declined" ? "declined" : "pending";
    return (
      <section className="mt-4" aria-labelledby="showroom_heading">
        <h3 id="showroom_heading">{t("title")}</h3>
        <div
          className={s === "declined" ? "tfcl-amber" : "tfcl-notice"}
          role="status"
        >
          <strong>{t(`state.${s}.title`)}</strong>
          <p className="mb-0">{t(`state.${s}.body`, { name: applied.name })}</p>
          {/* The moderator's reason, when there is one. Shown for an approval
              too — a note there is usually a condition, not a criticism. */}
          {applied.reviewNote ? (
            <p className="tfcl-hint mb-0 mt-2">{applied.reviewNote}</p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-4" aria-labelledby="showroom_heading">
      <h3 id="showroom_heading">{t("title")}</h3>
      <p className="tfcl-hint">{t("intro")}</p>

      <div className="form-group">
        <label htmlFor="showroom_name">{t("businessName")}</label>
        <input
          id="showroom_name"
          type="text"
          className="form-control"
          autoComplete="organization"
          placeholder={t("businessNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="form-group">
        <label htmlFor="showroom_cr">{t("crNumber")}</label>
        <input
          id="showroom_cr"
          type="text"
          // A registration number is digits and reads left-to-right whatever
          // the page language is — same reason the WhatsApp field is isolated.
          dir="ltr"
          inputMode="numeric"
          className="form-control"
          value={cr}
          onChange={(e) => setCr(e.target.value)}
          maxLength={20}
          aria-describedby="showroom_cr_hint"
        />
        <p className="tfcl-hint" id="showroom_cr_hint">
          {t("crHint")}
        </p>
      </div>

      <div className="group-button-submit left mb-0">
        <button
          type="button"
          className="second-btn"
          onClick={send}
          disabled={!canSend}
        >
          {state === "sending" ? t("sending") : t("send")}
        </button>
      </div>

      {state === "failed" ? (
        <p className="tfcl-amber mt-3" role="alert">
          {t(
            `error.${error === "already_applied" ? "already" : error === "unavailable" ? "unavailable" : "failed"}`,
          )}
        </p>
      ) : null}
    </section>
  );
}
