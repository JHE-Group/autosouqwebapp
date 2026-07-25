import ChangePass from "@/components/dashboard/ChangePass";

export const metadata = {
  title: "Change password",
  description: "Buy and sell used cars in Oman — Autosouq.om",
};

// The sidebar, header and mobile menu toggle live in the route group's
// layout.jsx — see components/dashboard/DashboardShell.jsx.
export default function Page() {
  return <ChangePass />;
}
