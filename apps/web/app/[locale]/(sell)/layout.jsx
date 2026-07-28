import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * The sell form is not a dashboard screen.
 *
 * `/add-listing` used to live in the `(dashboard)` group, so it rendered
 * `DashboardShell` — the account sidebar, the drawer toggle, and a header
 * dropdown offering *Dashboard, My listings, Saved cars, Messages, Reviews,
 * Profile, Change password*. Every one of those screens persists nothing;
 * there is no account system at all (see lib/submitListing.js, which explains
 * why submission is a WhatsApp handoff to a human rather than a POST).
 *
 * So a seller arriving from the homepage CTA met a form wrapped in the
 * furniture of an account they had never created, including a "Change
 * password" link for a password that does not exist. That is a poor trade
 * anywhere; on the one page where we ask a stranger for their car and their
 * phone number, on a site whose entire argument is that it is the trustworthy
 * end of this market, it is the wrong first impression.
 *
 * This group gives the form the ordinary site chrome instead. The URL is
 * unchanged — route groups do not appear in the path — so every existing link
 * to `/add-listing` still resolves.
 *
 * When accounts do exist, the honest move is to bring the form back under a
 * real authenticated shell, not to restore this one.
 */
export const metadata = {
  /**
   * `noindex, follow` — and this tag is now the *only* thing keeping the form
   * out of the index.
   *
   * `/sell-your-car` is the page that explains selling and is the one we want
   * ranked; this is the form behind it, and it has nothing to rank for. But it
   * is genuinely public and linked sitewide — the homepage hero CTA, the
   * homepage empty state, four blog posts across both locales — so it must
   * stay crawlable. app/robots.js used to Disallow it, which meant a crawler
   * was told to follow those links and then forbidden from fetching what they
   * point at, so it could never read this directive. That is the recipe for
   * "Indexed, though blocked by robots.txt": listed as a bare URL with no
   * snippet, which is worse than either indexing it properly or excluding it.
   *
   * `follow` is deliberate too: the links out of this page (back to
   * /sell-your-car, the guides) should still pass.
   */
  robots: { index: false, follow: true },
};

export default async function SellLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider messages={await pickMessages("addListing")}>
      {children}
    </NextIntlClientProvider>
  );
}
