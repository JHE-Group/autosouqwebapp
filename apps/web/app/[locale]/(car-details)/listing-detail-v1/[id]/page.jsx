import { resolveListing } from "@/lib/resolveListing";
import { listingPath } from "@/lib/seo";
import { notFound, permanentRedirect } from "next/navigation";

/**
 * Legacy theme URL. Permanently redirects to the keyword `/car/{slug}` path.
 */

export async function generateMetadata() {
  return { robots: { index: false, follow: true } };
}

export default async function page({ params }) {
  const { id, locale } = await params;
  const car = await resolveListing(id, locale);
  if (!car) notFound();
  permanentRedirect(listingPath(car, locale));
}
