import { eq } from "drizzle-orm";
import { db } from "@/db";
import { parseSocialLinks } from "./profile-utils";
import { publishers, users } from "@/db/schema";

export async function getOwnPublisher(userId) {
  const [p] = await db.select().from(publishers).where(eq(publishers.ownerUserId, userId)).limit(1);
  return p?.kind === "independent" ? p : null;
}

/** Creates the profile only. It grants no paid publishing privilege. */
export async function becomeCreator(user, displayName) {
  if (!user || user.role === "admin") throw new Error("Not available for this account.");
  const name = String(displayName || "").trim();
  if (name.length < 2 || name.length > 60) return { error: "Display name must be 2 to 60 characters." };
  if (await getOwnPublisher(user.id)) return { ok: true };
  const slug = `${name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}-${Math.random().toString(36).slice(2, 6)}`;
  await db.insert(publishers).values({ kind: "independent", ownerUserId: user.id, slug, displayName: name });
  await db.update(users).set({ role: "creator", updatedAt: new Date() }).where(eq(users.id, user.id));
  return { ok: true };
}

export async function updateProfile(user, { bio, links }) {
  const publisher = user && (await getOwnPublisher(user.id));
  if (!publisher) throw new Error("forbidden");
  const text = String(bio || "").trim();
  if (text.length > 500) return { error: "Bio must be 500 characters or fewer." };
  const parsed = parseSocialLinks(links);
  if (parsed.error) return { error: parsed.error };
  await db.update(publishers).set({ bio: text || null, socialLinks: parsed.links, updatedAt: new Date() }).where(eq(publishers.id, publisher.id));
  return { ok: true };
}
