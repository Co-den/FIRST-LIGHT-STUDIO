import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Role and status always come from the database, never from the token. Suspended users resolve to null. */
export async function getCurrentUser() {
  const s = await auth();
  if (!s?.user?.id) return null;
  const [u] = await db.select().from(users).where(eq(users.id, s.user.id)).limit(1);
  return u && u.status === "active" ? u : null;
}
