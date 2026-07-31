"use client";

import React, { useRef, useState } from "react";
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
export default function SellerAuthForm({
  mode = "signin",
  next,
  notice = null,
  defaultEmail = "",
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const isSignUp = mode === "signup";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

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
        /*
         * The account exists; only the follow-up sign-in failed.
         *
         * Showing this in the error banner tells the seller registration
         * failed. If they then do the obvious thing and submit again, they meet
         * "That email cannot be used" with a real account already in the CMS —
         * a dead end built out of two correct-looking messages. Send them to
         * sign-in with the address prefilled instead.
         */
        if (data?.code === "account_created_login_failed") {
          router.push({
            pathname: "/sign-in",
            query: {
              ...(next ? { next } : {}),
              email: payload.email,
              notice: "account_created",
            },
          });
          return;
        }

        /*
         * Translate the code; fall back to the server's English.
         *
         * Arabic is the default locale, and every error reachable here used to
         * be an English sentence assembled in the CMS. The server still decides
         * WHICH thing went wrong — it keeps the prose as its log line — and the
         * client decides how that is said, in the reader's language.
         *
         * `t.has()` rather than trusting a fallback string: next-intl returns
         * the key path for a miss, so without the check an unmapped code would
         * render "auth.errors.something" to a seller. Falling back to the
         * server's English is the wrong language; falling back to a key path is
         * no message at all.
         */
        const code = data?.code;
        setError(
          code && t.has(`errors.${code}`)
            ? t(`errors.${code}`)
            : (data?.error ?? t("genericError")),
        );
        setPending(false);
        // On sign-up at 360px the button sits below four fields and the banner
        // mounts above the fold, so the only visible result of a failed submit
        // was the label reverting. Focusing scrolls it into view and moves the
        // caret in one step — the pattern AddListing already uses for its step
        // headings. It also compensates for `disabled` blurring the button.
        requestAnimationFrame(() => errorRef.current?.focus());
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
      requestAnimationFrame(() => errorRef.current?.focus());
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
    <form className="tfcl-auth__form" onSubmit={onSubmit}>
      {/*
        The region is present at page load even when empty.

        iOS VoiceOver and TalkBack are unreliable announcing a `role="alert"`
        node INSERTED into the DOM, versus text placed into a region already
        there. AddListing and Contact both use this persistent-wrapper shape.

        `--error` distinguishes a failure from the informational notices that
        share `.tfcl-notice`.

        The `lang="en" dir="ltr"` stopgap is gone: messages are now selected by
        machine code from the locale catalogue, so what renders here is in the
        reader's language and marking it English would be a lie.
      */}
      {/*
        A success, so `role="status"` and the plain notice — not `--error`.
        This is the "your account was created, now sign in" handoff, and putting
        it in the failure banner is what made that path read as a failure.
      */}
      {notice ? (
        <div className="tfcl-notice" role="status">
          {t(notice)}
        </div>
      ) : null}

      <div
        className="tfcl-auth__feedback"
        aria-live="assertive"
        aria-atomic="true"
      >
        {error ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="tfcl-notice tfcl-notice--error"
            role="alert"
          >
            {error}
          </div>
        ) : null}
      </div>

      {isSignUp ? (
        <div className="tfcl-auth__field">
          <label htmlFor="auth-fullname">
            {t("fullName")}
          </label>
          <input
            id="auth-fullname"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            placeholder={t("fullNamePlaceholder")}
          />
        </div>
      ) : null}

      <div className="tfcl-auth__field">
        <label htmlFor="auth-email">
          {t("email")}
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          // Prefilled when arriving from the sign-up handoff, so the seller
          // does not retype the address they chose thirty seconds ago.
          defaultValue={defaultEmail}
          // Always Latin, so it stays LTR even on the Arabic page. `fullName`
          // deliberately does not get this — it takes Arabic names.
          dir="ltr"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </div>

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

      <div className="tfcl-auth__field">
        <label htmlFor="auth-password">
          {t("password")}
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          dir="ltr"
          // `new-password` on signup stops a manager offering the password the
          // seller uses elsewhere, and prompts it to store the new one.
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          // No placeholder: it was `passwordHint` minus a full stop, rendered
          // 8px below the hint itself — and a placeholder disappears exactly
          // when the rule starts mattering, as you type.
          aria-describedby={isSignUp ? "auth-password-hint" : undefined}
        />
        {isSignUp ? (
          <p className="tfcl-hint" id="auth-password-hint">
            {t("passwordHint")}
          </p>
        ) : null}
      </div>

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

      <p className="tfcl-auth__alt">
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
