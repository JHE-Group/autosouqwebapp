"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const RULES = [
  { id: "number", test: (v) => /\d/.test(v) },
  { id: "lower", test: (v) => /[a-z]/.test(v) },
  { id: "upper", test: (v) => /[A-Z]/.test(v) },
  { id: "length", test: (v) => v.length >= 8 },
];

export default function ChangePass() {
  const t = useTranslations("dashboard");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  const met = RULES.filter((rule) => rule.test(next));
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit =
    met.length === RULES.length &&
    confirm === next &&
    !!next &&
    !!current &&
    state !== "saving";

  /**
   * The CMS owns the check on the current password — this only proxies. Codes
   * rather than the CMS's own English, because Strapi's messages are
   * unlocalised and occasionally describe its internals.
   */
  const submit = async () => {
    if (!canSubmit) return;
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          password: next,
          passwordConfirmation: confirm,
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok) {
        setState("done");
        setCurrent("");
        setNext("");
        setConfirm("");
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
                <h1 className="admin-title mb-3">{t("page.changePassword")}</h1>
                <div className="tfcl-notice" role="note">
                  {t("notice.noRecovery")}
                </div>
                <div className="tfcl-add-listing profile-inner">
                  {/* No submit path exists — there is no auth backend, so this
                      form validates but does not post. */}
                  <div className="tfcl-add-listing profile-password">
                    <div className="form-group">
                      <label htmlFor="old_password">{t("password.current")}</label>
                      {/* Was type="text" — the password was typed in the clear
                          and left visible on screen. */}
                      <input
                        id="old_password"
                        type="password"
                        autoComplete="current-password"
                        className="form-control"
                        name="old_password"
                        placeholder={t("password.current")}
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new_password">{t("password.new")}</label>
                      <input
                        id="new_password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        name="new_password"
                        placeholder={t("password.new")}
                        value={next}
                        onChange={(e) => setNext(e.target.value)}
                      />
                    </div>
                    {/* The template hardcoded the first rule as satisfied and
                        the rest as unmet, whatever you typed. These follow the
                        field. */}
                    <ul className="list-check-req mb-3">
                      {RULES.map((rule) => (
                        <li
                          key={rule.id}
                          className={rule.test(next) ? "check" : ""}
                        >
                          <span>{t(`password.rule.${rule.id}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="form-group">
                      <label htmlFor="confirm_password">{t("password.confirm")}</label>
                      <input
                        id="confirm_password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        name="confirm_password"
                        placeholder={t("password.confirm")}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        aria-invalid={mismatch}
                      />
                      {mismatch ? (
                        <p className="tfcl-amber" role="alert">
                          {t("password.mismatch")}
                        </p>
                      ) : null}
                    </div>
                    <div className="group-button-submit left mb-0">
                      <button
                        type="button"
                        className="pre-btn"
                        onClick={submit}
                        disabled={!canSubmit}
                        style={canSubmit ? undefined : DISABLED}
                      >
                        {state === "saving"
                          ? t("password.saving")
                          : t("page.changePassword")}
                      </button>
                    </div>
                    {state === "done" ? (
                      <p className="tfcl-notice" role="status">
                        {t("password.changed")}
                      </p>
                    ) : null}
                    {state === "failed" ? (
                      <p className="tfcl-amber" role="alert">
                        {t(`password.error.${error === "bad_current_password" ? "badCurrent" : error === "unavailable" ? "unavailable" : "failed"}`)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

// Amber, never red — .tfcl-amber is $color-10 #B45309 on white = 4.73:1.
const DISABLED = { opacity: 0.5, cursor: "not-allowed" };
