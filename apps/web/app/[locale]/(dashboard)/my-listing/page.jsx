import MyListings from "@/components/dashboard/MyListings";
import { getMyListings } from "@/lib/auth";

export const metadata = {
  title: "My listings",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};

/**
 * The seller's own cars, drafts included.
 *
 * Fetched here rather than inside the component so the table has real rows on
 * the first paint — no spinner, and no flash of the empty state for someone who
 * does have listings.
 *
 * The session check lives in the route group's layout.jsx, shared by every
 * dashboard page, as do the sidebar, header and mobile menu toggle — see
 * components/dashboard/DashboardShell.jsx.
 */
export default async function Page() {
  const listings = await getMyListings();
  return <MyListings listings={listings} />;
}
