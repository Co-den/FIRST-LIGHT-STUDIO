import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import { isAdmin } from "./permissions";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");
  return user;
}
