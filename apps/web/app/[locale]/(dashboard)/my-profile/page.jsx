import MyProfile from "@/components/dashboard/MyProfile";
import { getSession, getMyShowroom } from "@/lib/auth";

export const metadata = {
  title: "My profile",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};

// The sidebar, header and mobile menu toggle live in the route group's
// layout.jsx — see components/dashboard/DashboardShell.jsx.
export default async function Page() {
  // The group layout already redirected anyone without one.
  const [session, showroom] = await Promise.all([
    getSession(),
    // Read here so the page paints the right panel first time — a seller with
    // an application pending should never see the apply form, even briefly.
    getMyShowroom(),
  ]);
  return <MyProfile session={session} showroom={showroom} />;
}
