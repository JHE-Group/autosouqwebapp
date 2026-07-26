import Footer1 from "@/components/footers/Footer1";
import { buildFooterData } from "@/data/footerLinks";
import { getBrowseListings } from "@/lib/listingSource";
import { DEFAULT_LOCALE } from "@/i18n/routing";

/**
 * Server footer: Buy facet short-links only appear when inventory clears the
 * gate, so the sitewide chrome never points at a notFound facet URL.
 */
export default async function SiteFooter({ locale = DEFAULT_LOCALE }) {
  const listings = await getBrowseListings(locale);
  return <Footer1 columns={buildFooterData(listings)} />;
}
