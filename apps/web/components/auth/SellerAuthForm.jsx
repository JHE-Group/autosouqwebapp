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
        ? { fullName: (form.get("fullName") ?? "").toString().trim() }
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

  /*
   * No `noValidate` on the form below.
   *
   * The inputs already declare `required`, `type="email"` and `minLength`, and
   * that attribute made every one of them inert. Without it the browser blocks
   * the submit, focuses and scrolls to the offending field, and says why in the
   * user's own language — free, offline, and on metered data, which matters for
   * this audience. It also survives the phone-OTP swap untouched.
   */
  return (
    <form className="comment-form form-submit" onSubmit={onSubmit}>
      {error ? (
        // `alert` so a screen reader announces it: a sighted user sees the
        // message appear, and without this nobody else is told anything.
        // `lang`/`dir`: every message reaching here is English — the route
        // handlers and the CMS both hardcode them — so an Arabic-configured
        // screen reader would otherwise voice it with Arabic phonemes (WCAG
        // 3.1.2), and _arabic.scss would set it in Cairo's Latin stub rather
        // than Inter. A stopgap until the errors themselves are translated.
        <div
          className="tfcl-notice"
          role="alert"
          lang="en"
          dir="ltr"
          style={{ marginBottom: 16 }}
        >
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
          // Always Latin, so it stays LTR even on the Arabic page. `fullName`
          // deliberately does not get this — it takes Arabic names.
          dir="ltr"
          className="tb-my-input"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </fieldset>

      {/*
        The WhatsApp field is gone, deliberately.

        It was labelled optional and was not: a malformed number fails
        registration outright in seller-auth.ts, so "optional" meant "optional
        unless you get it wrong, in which case your account is refused". It also
        set `inputMode="numeric"`, a keypad with no `+`, and its placeholder
        "9123 4567" reverses under RTL — two Latin runs either side of a space
        resolve right-to-left, so an Arabic seller was shown "4567 9123".

        None of that was worth fixing, because AddListing already collects the
        same number properly: `inputMode="tel"`, `normalizeOmaniMsisdn`
        validation, and live confirmation of what buyers will see. Asking twice
        for one datum, in the worse place, on the highest-friction screen in the
        funnel, to store something nothing reads back.

        lib/auth.js spreads it conditionally, so dropping it needs no server
        change — and it leaves the form at the three fields phone OTP will
        replace anyway.
      */}

      <fieldset className="phone-wrap style-text">
        <label className="font-1 fs-14 fw-5" htmlFor="auth-password">
          {t("password")}
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          dir="ltr"
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

      {/*
        `sc-button`, not `tf-btn` — the latter is not defined anywhere in
        scss/ or css/, so this button rendered as Bootstrap Reboot's bare
        default. The inner <span> is load-bearing rather than decorative:
        _button.scss puts `color: $color-on-accent` and the type-label mixin
        on the child, so text placed directly in the button gets neither.
        `--block` makes it full width, which is what a single primary action
        on a narrow form wants.
      */}
      <button
        type="submit"
        className="sc-button sc-button--block"
        disabled={pending}
      >
        <span>
          {pending
            ? t("working")
            : isSignUp
              ? t("createAccount")
              : t("signIn")}
        </span>
      </button>

      <p style={{ marginTop: 16 }}>
        {isSignUp ? t("haveAccount") : t("noAccount")}{" "}
        {/* Carry `next` across: without it, a seller who clicks "sign in
            instead" is sent to /add-listing afterwards rather than back to
            wherever they were heading. safeNext has already sanitised it. */}
        <Link
          href={{
            pathname: isSignUp ? "/sign-in" : "/sign-up",
            query: next ? { next } : undefined,
          }}
        >
          {isSignUp ? t("signIn") : t("createAccount")}
        </Link>
      </p>
    </form>
  );
}
