"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

const RULES = [
  { id: "number", labelEn: "One number", test: (v) => /\d/.test(v) },
  {
    id: "lower",
    labelEn: "One lowercase character",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "upper",
    labelEn: "One uppercase character",
    test: (v) => /[A-Z]/.test(v),
  },
  { id: "length", labelEn: "8 characters minimum", test: (v) => v.length >= 8 },
];

export default function ChangePass() {
  const t = useTranslations("dashboard");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const met = RULES.filter((rule) => rule.test(next));
  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = met.length === RULES.length && confirm === next && !!next;

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">{t("page.changePassword")}</h1>
                <div className="tfcl-notice" role="note">
                  {t("notice.noAccounts")}
                </div>
                <div className="tfcl-add-listing profile-inner">
                  {/* No submit path exists — there is no auth backend, so this
                      form validates but does not post. */}
                  <div className="tfcl-add-listing profile-password">
                    <div className="form-group">
                      <label htmlFor="old_password">Current password</label>
                      {/* Was type="text" — the password was typed in the clear
                          and left visible on screen. */}
                      <input
                        id="old_password"
                        type="password"
                        autoComplete="current-password"
                        className="form-control"
                        name="old_password"
                        placeholder="Current password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new_password">New password</label>
                      <input
                        id="new_password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        name="new_password"
                        placeholder="New password"
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
                          <span>{rule.labelEn}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="form-group">
                      <label htmlFor="confirm_password">Confirm password</label>
                      <input
                        id="confirm_password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        name="confirm_password"
                        placeholder="Confirm password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        aria-invalid={mismatch}
                      />
                      {mismatch ? (
                        <p className="tfcl-amber" role="alert">
                          The two passwords do not match.
                        </p>
                      ) : null}
                    </div>
                    <div className="group-button-submit left mb-0">
                      <button
                        type="button"
                        className="pre-btn"
                        disabled={!canSubmit}
                        style={canSubmit ? undefined : DISABLED}
                      >
                        Change password
                      </button>
                    </div>
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
