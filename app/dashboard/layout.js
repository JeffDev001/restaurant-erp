import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return children;
}