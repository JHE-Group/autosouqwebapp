"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

/**
 * Error boundary for everything under `/[locale]`.
 *
 * With no `error.jsx`, any render error unwound to Next's stock error page for
 * the whole route — English, unstyled, no `lang`/`dir`, no way back. This has
 * already happened once on this codebase: ListingCard.jsx carries a note about
 * a single listing with a null or string `mileage` blanking the entirety of
 * /used-cars, because there was no boundary to contain it.
 *
 * The catalogue is seller-entered and mapped from a CMS whose fields can be
 * null, so "one bad row takes down the page" is a live risk, not a theoretical
 * one. Containing it to a panel with a retry keeps the header, footer and
 * navigation intact.
 *
 * `reset()` re-renders the segment — worth offering, because a transient CMS
 * timeout is a common cause here and usually succeeds on a second attempt.
 *
 * Deliberately does not render `error.message`: it can carry upstream detail,
 * and this is a public marketplace. The digest is the handle for correlating
 * with server logs.
 */
export default function Error({ error, reset }) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="tf-section3">
      <div className="container">
        <div className="text-center" style={{ padding: "4rem 0" }}>
          <h1 className="fs-32 fw-6 mb-3">{t("title")}</h1>
          <p className="font-2 fs-16 lh-26 mb-4">{t("body")}</p>
          <button type="button" onClick={reset} className="tf-btn bg-color-primary">
            {t("retry")}
          </button>
          {error?.digest ? (
            <p className="font-2 fs-14 mt-3 op-06">
              <bdi dir="ltr">{error.digest}</bdi>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
