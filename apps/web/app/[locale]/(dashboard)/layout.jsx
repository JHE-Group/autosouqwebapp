import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { pickMessages } from "@/i18n/clientMessages";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";

/**
 * One shell for all eight dashboard routes.
 *
 * Each page.jsx previously repeated the sidebar, the header, the empty
 * #themesflat-content div and the menu toggle itself, so a fix to the drawer
 * had to be made eight times and had already drifted. The pages now render only
 * their own content.
 *
 * The provider scopes which messages reach the browser. `addListing` is the
 * largest namespace on the site and is read by one route; it is bundled here
 * rather than site-wide so that a buyer browsing listings never downloads the
 * seller form. See i18n/clientMessages.js.
 */
export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * `setRequestLocale` keeps this subtree statically renderable — it is
 * required in every layout, not only the root one. Without it the
 * `pickMessages` call below reads the request locale and forces the whole
 * group to render per request. See (car-listings)/layout.jsx for the
 * evidence from the build's prerender manifest.
 */
export default async function DashboardLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  /**
   * One session check for all eight dashboard routes.
   *
   * Here rather than in each page: eight copies of a guard is eight chances to
   * add a ninth page and forget it, and the one that gets forgotten is the one
   * that leaks. The pages below assume a signed-in seller because this
   * guarantees one.
   *
   * `next` is not carried. Someone landing on /my-listing while signed out is
   * far more likely to have followed a stale bookmark than to be mid-task, and
   * /add-listing is where a seller with something to do is going.
   *
   * Note this defeats the `setRequestLocale` optimisation above — reading the
   * session cookie makes the whole group render per request. That is the right
   * trade: these pages are private, `robots` already says noindex, nofollow,
   * and a statically rendered dashboard would be a bug, not a saving.
   */
  const session = await getSession();
  if (!session) {
    redirect({ href: "/sign-in", locale });
  }

  return (
    <NextIntlClientProvider
      messages={await pickMessages("dashboard", "addListing", "browse")}
    >
      <DashboardShell>{children}</DashboardShell>
    </NextIntlClientProvider>
  );
}
