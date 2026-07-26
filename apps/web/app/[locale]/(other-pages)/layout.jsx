import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * /contact, /faq and /about-us.
 *
 * `contactPage` is here because the contact form is a Client Component — it
 * holds the send/success/failure state — so its labels, placeholders and both
 * result messages have to reach the browser. `browse` is here for the
 * "Featured" flag on the recommended-cars carousel that /about-us renders.
 *
 * Nothing else: per i18n/clientMessages.js, a namespace shipped to a page that
 * does not read it is bytes a buyer on metered data pays for.
 */
export default async function OtherPagesLayout({ children }) {
  return (
    <NextIntlClientProvider messages={await pickMessages("contactPage", "browse", "aboutPage")}>
      {children}
    </NextIntlClientProvider>
  );
}
