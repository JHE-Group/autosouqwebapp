import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * The listing detail page is server-rendered apart from `StickyContactBar`,
 * which reads `listing.trust`. `browse` rides along because `ListingCard` is
 * reused for the "other cars on Autosouq" rail at the bottom of the page.
 */
/**
 * `setRequestLocale` keeps this subtree statically renderable — it is
 * required in every layout, not only the root one. Without it the
 * `pickMessages` call below reads the request locale and forces the whole
 * group to render per request. See (car-listings)/layout.jsx for the
 * evidence from the build's prerender manifest.
 */
export default async function CarDetailsLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider messages={await pickMessages("listing", "browse")}>
      {children}
    </NextIntlClientProvider>
  );
}
