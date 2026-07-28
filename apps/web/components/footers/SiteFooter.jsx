import Footer1 from "@/components/footers/Footer1";
import { buildFooterData } from "@/data/footerLinks";
import { getBrowseData } from "@/lib/listingSource";
import { DEFAULT_LOCALE } from "@/i18n/routing";

/**
 * Server footer: Buy facet short-links only appear when inventory clears the
 * gate, so the sitewide chrome never points at a notFound facet URL.
 *
 * Gated on `cms` — **real inventory** — not on `getBrowseListings`, which falls
 * back to the 40 demo cars in data/cars.js. Those clear every gate on their
 * own, while the facet routes gate on `cms` and 404. So with an empty or
 * unreachable CMS the two disagreed, and the footer on *every page in both
 * locales* advertised four URLs that all returned 404 — the exact thing the
 * paragraph above says it prevents. Verified against a build pointed at a dead
 * CMS: four footer links, four 404s.
 *
 * That state is not hypothetical: it is launch day before the first listing is
 * published, and any Strapi outage after that.
 */
export default async function SiteFooter({ locale = DEFAULT_LOCALE }) {
  const { cms } = await getBrowseData(locale);
  return <Footer1 columns={buildFooterData(cms)} />;
}
