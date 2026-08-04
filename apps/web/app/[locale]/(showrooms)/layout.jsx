import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/clientMessages";

/**
 * /showrooms/{slug}.
 *
 * `browse` ships because the page renders ListingCard, which reads
 * `browse.card` in the browser. `showroomPage` is the page's own copy. Nothing
 * else — per i18n/clientMessages.js, a namespace sent to a page that does not
 * read it is bytes a buyer on metered data pays for.
 *
 * `setRequestLocale` keeps the subtree statically renderable; without it the
 * pickMessages call reads the request locale and forces per-request rendering
 * for the whole group. See (car-listings)/layout.jsx for the evidence.
 */
export default async function ShowroomsLayout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider messages={await pickMessages("browse", "showroomPage")}>
      {children}
    </NextIntlClientProvider>
  );
}
