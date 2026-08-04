"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import ShowroomApplication from "./ShowroomApplication";

/**
 * The seller's own details.
 *
 * This page used to render a seven-field form, an avatar uploader and a "Save
 * changes" button, none of which posted anywhere — under a notice reading
 * "Accounts are not switched on yet, so nothing on this page is saved".
 * Accounts had been switched on for weeks. The old comment above the notice
 * argued the case for saying so out loud rather than faking a save, and it was
 * right; what it could not anticipate is that the reason would stop being true
 * and the screen would keep asserting it.
 *
 * It now saves, and it asks only for what there is somewhere to put.
 *
 * **Four fields and the avatar are left out — and not because they are
 * missing.** An earlier version of this comment said phone, city, area and an
 * "about" paragraph "do not exist on the user content type", and that the
 * avatar had "no image field". Both were false when written. All five are
 * declared on the users-permissions User (see the extension's schema.json) and
 * all five are real columns on `up_users`; they were added in d4e1246. The
 * correction is recorded here rather than quietly fixed, because the next
 * reader who checks the schema would otherwise conclude the fields had been
 * dropped by accident and helpfully restore them.
 *
 * The decision was right for a different reason, and that reason still holds:
 * **nothing reads them.** `seller` is `private: true` on the listing, so the
 * public API will not populate it at all — it answers a `populate[seller]`
 * with "Invalid key seller" — and there is no /seller/:id page for the values
 * to appear on. Wiring them would give a seller a form that writes to columns
 * no buyer can ever reach, which is the same "complete-looking control that
 * quietly discards what you give it" this file exists to correct, only subtler.
 *
 * The buyer-facing version of these fields already exists elsewhere: about,
 * city, area and a logo live on api::showroom, which /showrooms/[slug]
 * actually renders. That is the thing to reach for if a public seller profile
 * is ever wanted — not four columns bolted onto the account.
 *
 * **Email is shown and not editable.** It is the sign-in identity, so changing
 * it is a re-verification flow rather than a text field, and there is no
 * verification email yet. Better to show what the account is than to offer an
 * edit that would silently do nothing — which is the mistake this whole file is
 * a correction of.
 */
export default function MyProfile({ session = null, showroom = null }) {
  const t = useTranslations("dashboard.profile");
  const [fullName, setFullName] = useState(session?.fullName ?? "");
  const [whatsapp, setWhatsapp] = useState(session?.whatsapp ?? "");
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  const dirty =
    fullName !== (session?.fullName ?? "") ||
    whatsapp !== (session?.whatsapp ?? "");
  const canSave = dirty && fullName.trim().length > 0 && state !== "saving";

  const save = async () => {
    if (!canSave) return;
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), whatsapp: whatsapp.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setState("done");
        return;
      }
      setState("failed");
      setError(data?.code ?? "failed");
    } catch {
      setState("failed");
      setError("unavailable");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{t("title")}</h1>
                <div className="tfcl-notice" role="note">
                  {t("notice")}
                </div>
                <div className="tfcl-add-listing profile-inner">
                  <div className="form-group">
                    <label htmlFor="profile_name">{t("fullName")}</label>
                    <input
                      id="profile_name"
                      type="text"
                      name="full_name"
                      className="form-control"
                      autoComplete="name"
                      placeholder={t("fullNamePlaceholder")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile_whatsapp">{t("whatsapp")}</label>
                    <input
                      id="profile_whatsapp"
                      type="tel"
                      // A phone number reads left-to-right in any language;
                      // without this the +968 and the digit groups reorder
                      // under RTL and the seller cannot check what they typed.
                      dir="ltr"
                      inputMode="tel"
                      name="whatsapp"
                      className="form-control"
                      autoComplete="tel"
                      placeholder="+968 9XXX XXXX"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                    <p className="tfcl-hint">{t("whatsappHint")}</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile_email">{t("email")}</label>
                    <input
                      id="profile_email"
                      type="email"
                      name="email"
                      className="form-control"
                      value={session?.email ?? ""}
                      readOnly
                      aria-describedby="profile_email_hint"
                    />
                    <p className="tfcl-hint" id="profile_email_hint">
                      {t("emailFixed")}
                    </p>
                  </div>

                  <div className="group-button-submit left mb-3">
                    <button
                      type="button"
                      className="pre-btn"
                      onClick={save}
                      disabled={!canSave}
                    >
                      {state === "saving" ? t("saving") : t("save")}
                    </button>
                  </div>

                  {state === "done" ? (
                    <p className="tfcl-notice" role="status">
                      {t("saved")}
                    </p>
                  ) : null}
                  {state === "failed" ? (
                    <p className="tfcl-amber" role="alert">
                      {t(
                        `error.${error === "invalid_profile" ? "invalid" : error === "unavailable" ? "unavailable" : "failed"}`,
                      )}
                    </p>
                  ) : null}

                  <h3>{t("password")}</h3>
                  {/* Was a second, duplicate copy of the change-password form.
                      One form, one route. */}
                  <p className="tfcl-hint">{t("passwordHint")}</p>
                  <div className="group-button-submit left mb-0">
                    <Link href="/change-password" className="second-btn">
                      {t("changePassword")}
                    </Link>
                  </div>

                  {/* The upgrade path. Until this existed an account's type was
                      fixed at signup, so a dealer who started as a private
                      seller had to abandon the account and its listings. */}
                  <ShowroomApplication showroom={showroom} />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
