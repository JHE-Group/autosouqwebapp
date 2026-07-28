import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * The browse surfaces are almost entirely Client Components — the filter panel,
 * the results toolbar, the cards and the empty state all hold state — so they
 * need their strings in the browser. This adds `browse` on top of the chrome
 * the root layout already provides, and nothing else: the seller form and the
 * dashboard are 15 KB of JSON a buyer here will never read.
 */
/**
 * `setRequestLocale` is required in **every** layout and page that should stay
 * static, not just the root one.
 *
 * Without it, `pickMessages` → `getMessages()` reads the request locale, which
 * opts this whole subtree out of static rendering. Confirmed from the build's
 * prerender manifest: the route groups that have a layout calling
 * `pickMessages` — this one, (car-details), (other-pages), (dashboard) — were
 * the exact set that failed to prerender, while (blog), (guides), (info) and
 * the homepage, which have no group layout, all prerendered fine.
 *
 * The cost landed on the pages that can least afford it: /used-cars and every
 * /used-cars/{facet} lander were server-rendered per request, which also made
 * the `revalidate: 30` on strapiFetch pointless and put a full render in front
 * of first byte for an audience on metered mobile data.
 */
export default async function CarListingsLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider messages={await pickMessages("browse")}>
      {children}
    </NextIntlClientProvider>
  );
}
