import { getMessages } from "next-intl/server";

/**
 * Pick just the message namespaces a subtree ships to the browser.
 *
 * next-intl hands `NextIntlClientProvider` every message in the locale by
 * default. That was putting ~23 KB of JSON into the RSC payload of *every*
 * page: a buyer reading a listing downloaded the entire `addListing` seller
 * form, and someone on the home page downloaded all of it. For the audience
 * NICHE.md describes — budget Android, metered data — that is the wrong
 * default, and it grows with every namespace added.
 *
 * Server Components read their strings during render and ship only the output,
 * so they need nothing here. Pass only what a *Client* Component reads.
 *
 * Usage, in a route-group layout:
 *
 *     <NextIntlClientProvider messages={await pickMessages("browse")}>
 *
 * A namespace that is needed but not passed fails loudly as next-intl's
 * MISSING_MESSAGE in development, which is locatable — where shipping
 * everything hides the mistake behind a bill the reader pays in data.
 */

/** The site chrome — header, nav, language switcher, footer — is on every page. */
export const CHROME = ["nav", "common", "footer"];

export async function pickMessages(...namespaces) {
  const all = await getMessages();
  const wanted = new Set([...CHROME, ...namespaces.flat()]);
  return Object.fromEntries(
    Object.entries(all).filter(([key]) => wanted.has(key)),
  );
}
