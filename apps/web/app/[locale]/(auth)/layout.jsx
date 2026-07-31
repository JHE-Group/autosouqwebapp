import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * Put the `auth` namespace in the client bundle.
 *
 * Without this the sign-in and sign-up forms render their key paths — a live
 * seller saw fields labelled `auth.fullName`, `auth.email`, `auth.password`.
 *
 * The failure is easy to ship because it is half-invisible. Each page's `<h1>`
 * and lead come from `getTranslations` on the server and were correct, so the
 * page looked translated; only `SellerAuthForm` is a client component, and
 * `useTranslations` there reads whatever `NextIntlClientProvider` was given.
 * The root provider hands over `pickMessages()`'s CHROME set — nav, common,
 * footer — and nothing else. Every route group that renders client text needs
 * its own provider; see (dashboard)/layout.jsx, which does exactly this for
 * `dashboard` and `addListing`.
 *
 * Scoped to `auth` on purpose. That is 27 short keys, well under a kilobyte in
 * the RSC payload — a buyer browsing listings should not download the seller
 * signup strings, which is the same reasoning i18n/clientMessages.js documents
 * for keeping `addListing` out of the site-wide set.
 *
 * No `metadata` export here: both pages set their own `robots: noindex` in
 * `generateMetadata`, and a layout-level export would not override it.
 */
export default async function AuthLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider messages={await pickMessages("auth")}>
      {children}
    </NextIntlClientProvider>
  );
}
