import MyProfile from "@/components/dashboard/MyProfile";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "My profile",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};

// The sidebar, header and mobile menu toggle live in the route group's
// layout.jsx — see components/dashboard/DashboardShell.jsx.
export default async function Page() {
  // The group layout already redirected anyone without one.
  const session = await getSession();
  return <MyProfile session={session} />;
}
