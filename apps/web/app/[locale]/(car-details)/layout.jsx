import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * The listing detail page is server-rendered apart from `StickyContactBar`,
 * which reads `listing.trust`. `browse` rides along because `ListingCard` is
 * reused for the "other cars on Autosouq" rail at the bottom of the page.
 */
export default async function CarDetailsLayout({ children }) {
  return (
    <NextIntlClientProvider messages={await pickMessages("listing", "browse")}>
      {children}
    </NextIntlClientProvider>
  );
}
