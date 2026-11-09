import { db } from "@/db";
import { auditLog } from "@/db/schema";

/** Append-only record of sensitive actions. actorId null means the system (for example a verified webhook). */
export async function audit({ actorId = null, action, targetType, targetId = null, details = {} }) {
  try {
    await db.insert(auditLog).values({ actorId, action, targetType, targetId: targetId ? String(targetId) : null, details });
  } catch (e) { console.error("audit write failed", action, e); }
}
