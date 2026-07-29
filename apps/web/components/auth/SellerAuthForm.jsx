"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

/**
 * Sign in and sign up, in one component.
 *
 * The two forms differ by three fields and one endpoint, and every other line —
 * error handling, the pending state, the redirect back to wherever the seller
 * was heading — is identical. Two components would be two places to fix the
 * next thing either of them gets wrong.
 *
 * It knows nothing about how authentication works. It posts to /api/auth/* and
 * reads `{ ok, error }`. When phone OTP replaces email and password, the fields
 * here change and nothing else does: no token ever reaches this file, because
 * the CSP forbids the browser talking to the CMS and the session lives in an
 * httpOnly cookie the route handler sets.
 */
export default function SellerAuthForm({ mode = "signin", next }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const isSignUp = mode === "signup";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(event) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      email: (form.get("email") ?? "").toString().trim(),
      password: (form.get("password") ?? "").toString(),
      ...(isSignUp
        ? {
            fullName: (form.get("fullName") ?? "").toString().trim(),
            whatsapp: (form.get("whatsapp") ?? "").toString().trim(),
          }
        : {}),
    };

    setPending(true);
    setError(null);

    try {
      const res = await fetch(
        isSignUp ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? t("genericError"));
        setPending(false);
        return;
      }

      /**
       * `refresh()` before navigating.
       *
       * The session is a cookie the server reads, so every server component
       * already rendered in this browser still believes nobody is signed in.
       * Without this the seller lands on a protected page that redirects them
       * straight back here, which reads as the login having failed.
       */
      router.refresh();
      router.push(next || "/add-listing");
    } catch {
      setError(t("networkError"));
      setPending(false);
    }
  }

  return (
    <form className="comment-form form-submit" onSubmit={onSubmit} noValidate>
      {error ? (
        // `alert` so a screen reader announces it: a sighted user sees the
        // message appear, and without this nobody else is told anything.
        <div className="tfcl-notice" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      {isSignUp ? (
        <fieldset className="email-wrap style-text">
          <label className="font-1 fs-14 fw-5" htmlFor="auth-fullname">
            {t("fullName")}
          </label>
          <input
            id="auth-fullname"
            name="fullName"
            type="text"
            className="tb-my-input"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder={t("fullNamePlaceholder")}
          />
        </fieldset>
      ) : null}

      <fieldset className="email-wrap style-text">
        <label className="font-1 fs-14 fw-5" htmlFor="auth-email">
          {t("email")}
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          className="tb-my-input"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </fieldset>

      {isSignUp ? (
        <fieldset className="phone-wrap style-text">
          <label className="font-1 fs-14 fw-5" htmlFor="auth-whatsapp">
            {t("whatsapp")}{" "}
            <span className="tfcl-hint">{t("optional")}</span>
          </label>
          <input
            id="auth-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            className="tb-my-input"
            autoComplete="tel"
            placeholder={t("whatsappPlaceholder")}
          />
        </fieldset>
      ) : null}

      <fieldset className="phone-wrap style-text">
        <label className="font-1 fs-14 fw-5" htmlFor="auth-password">
          {t("password")}
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          className="tb-my-input"
          // `new-password` on signup stops a manager offering the password the
          // seller uses elsewhere, and prompts it to store the new one.
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          placeholder={t("passwordPlaceholder")}
        />
        {isSignUp ? (
          <p className="tfcl-hint">{t("passwordHint")}</p>
        ) : null}
      </fieldset>

      <button type="submit" className="tf-btn" disabled={pending}>
        {pending
          ? t("working")
          : isSignUp
            ? t("createAccount")
            : t("signIn")}
      </button>

      <p style={{ marginTop: 16 }}>
        {isSignUp ? t("haveAccount") : t("noAccount")}{" "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
          {isSignUp ? t("signIn") : t("createAccount")}
        </Link>
      </p>
    </form>
  );
}
