import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
export const dynamic = "force-dynamic";

export default async function MenuLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!["ADMIN", "MANAGER"].includes(user.role)) {
    redirect("/dashboard");
  }

  return children;
}