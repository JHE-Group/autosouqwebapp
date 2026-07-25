import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * The browse surfaces are almost entirely Client Components — the filter panel,
 * the results toolbar, the cards and the empty state all hold state — so they
 * need their strings in the browser. This adds `browse` on top of the chrome
 * the root layout already provides, and nothing else: the seller form and the
 * dashboard are 15 KB of JSON a buyer here will never read.
 */
export default async function CarListingsLayout({ children }) {
  return (
    <NextIntlClientProvider messages={await pickMessages("browse")}>
      {children}
    </NextIntlClientProvider>
  );
}
