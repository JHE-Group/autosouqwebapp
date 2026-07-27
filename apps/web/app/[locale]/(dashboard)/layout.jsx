import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { pickMessages } from "@/i18n/clientMessages";

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

  return (
    <NextIntlClientProvider
      messages={await pickMessages("dashboard", "addListing", "browse")}
    >
      <DashboardShell>{children}</DashboardShell>
    </NextIntlClientProvider>
  );
}
