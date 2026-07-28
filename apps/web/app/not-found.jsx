import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * Unknown probe URLs currently hit this root not-found page outside the locale
 * middleware. Next 16 may need request headers while resolving that unmatched
 * request, so keeping the page static turns scanner traffic like `/wp-login.php`
 * into a 500 (`app-static-to-dynamic-error`) instead of a real 404.
 */
export const dynamic = "force-dynamic";

/**
 * The last-resort 404, for URLs that never reach a locale segment.
 *
 * `app/[locale]/not-found.jsx` handles `notFound()` thrown *inside* the locale
 * tree — a stale `/ar/car/{slug}`, which is the common case and the one worth
 * making pretty. It does not handle two others:
 *
 *   - a path that matches no route at all (`/ar/does-not-exist`, `/nonsense`)
 *   - a `dynamicParams: false` miss, e.g. `/ar/used-cars/{unknown-facet}`
 *
 * Both resolve here. Before this file they fell through to Next's built-in
 * page: `<html>` with no `lang` and no `dir`, the English string "404: This
 * page could not be found.", no styling and no way back.
 *
 * Two constraints shape what this file can do, and both are worth stating
 * because they look like omissions otherwise:
 *
 * 1. **It renders its own `<html>`/`<body>`.** There is no root layout in this
 *    app — every route lives under `app/[locale]/`, whose layout is the root.
 *    A root-level not-found therefore has nothing wrapping it and must supply
 *    the document shell itself.
 *
 * 2. **It cannot know the locale.** There is no request locale outside the
 *    `[locale]` segment, so next-intl has nothing to read and `useTranslations`
 *    would throw. Rather than guess — and rather than show an Arabic-only page
 *    to an English visitor or vice versa — it says the same thing in both
 *    languages and offers a way into each tree. `lang`/`dir` follow the site
 *    default; the English block is marked `lang="en" dir="ltr"` so screen
 *    readers switch correctly mid-page.
 *
 * Styles are inline for the same reason: the global stylesheet is imported by
 * the locale layout, which does not wrap this file.
 */
export default function RootNotFound() {
  return (
    <html lang={DEFAULT_LOCALE} dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0d1117",
          color: "#e6edf3",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "34rem", textAlign: "center" }}>
          <p style={{ fontSize: "3rem", margin: "0 0 1rem", opacity: 0.5 }}>404</p>

          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>
            لم نتمكّن من العثور على هذه الصفحة
          </h1>
          <p style={{ margin: "0 0 1.5rem", lineHeight: 1.7, opacity: 0.85 }}>
            ربما بيعت السيارة، أو أن الرابط لم يعد صالحاً.
          </p>

          <h2
            lang="en"
            dir="ltr"
            style={{ fontSize: "1.25rem", margin: "0 0 0.5rem", fontWeight: 600 }}
          >
            We couldn&rsquo;t find that page
          </h2>
          <p
            lang="en"
            dir="ltr"
            style={{ margin: "0 0 2rem", lineHeight: 1.7, opacity: 0.85 }}
          >
            The car may have sold, or the link may be out of date.
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/ar/used-cars"
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: "0.5rem",
                background: "#e63946",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              تصفّح السيارات
            </Link>
            <Link
              href="/en/used-cars"
              lang="en"
              dir="ltr"
              style={{
                padding: "0.7rem 1.4rem",
                borderRadius: "0.5rem",
                border: "1px solid #30363d",
                color: "#e6edf3",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Browse cars
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
