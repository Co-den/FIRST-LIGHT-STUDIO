import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { termsAcceptances } from "@/db/schema";
import { POLICY_VERSION } from "./policies";
import { audit } from "./audit";

export async function hasAcceptedTerms(userId) {
  const [r] = await db.select({ id: termsAcceptances.id }).from(termsAcceptances)
    .where(and(eq(termsAcceptances.userId, userId), eq(termsAcceptances.version, POLICY_VERSION), eq(termsAcceptances.ownershipConfirmed, true))).limit(1);
  return !!r;
}
export async function acceptTerms(user, ownership, accept) {
  if (!user) return { error: "Sign in required." };
  if (!ownership || !accept) return { error: "Tick both boxes to continue." };
  await db.insert(termsAcceptances).values({ userId: user.id, version: POLICY_VERSION, ownershipConfirmed: true });
  await audit({ actorId: user.id, action: "terms.accepted", targetType: "user", targetId: user.id, details: { version: POLICY_VERSION } });
  return { ok: true };
}
