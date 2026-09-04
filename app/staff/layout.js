import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return children;
}