import { and, eq, gt, isNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { rateLimit } from "./ratelimit";
import { hashToken, newToken } from "./tokens";
import { sendEmail } from "./email";

/** Never reveals whether the email has an account. */
export async function requestReset(email, ip) {
  const e = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e) || e.length > 200) return;
  if (!(await rateLimit(`reset:ip:${ip}`, 10, 3600)).ok || !(await rateLimit(`reset:email:${e}`, 3, 3600)).ok) return;
  const [u] = await db.select().from(users).where(eq(users.email, e)).limit(1);
  if (!u || u.status !== "active") return;
  const { token, hash } = newToken();
  await db.insert(passwordResets).values({ userId: u.id, tokenHash: hash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await sendEmail({ to: e, subject: "Reset your FIRST LIGHT STUDIO password", text: `Use this link within one hour to choose a new password:\n\n${base}/reset-password?token=${token}\n\nIf you did not ask for this, ignore this email.` });
}

export async function performReset(token, password) {
  if (typeof password !== "string" || password.length < 10 || password.length > 200) return { error: "Password must be 10 to 200 characters." };
  const [r] = await db.select().from(passwordResets).where(and(eq(passwordResets.tokenHash, hashToken(token)), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date()))).limit(1);
  if (!r) return { error: "This link is invalid or has expired." };
  const claimed = await db.update(passwordResets).set({ usedAt: new Date() }).where(and(eq(passwordResets.id, r.id), isNull(passwordResets.usedAt))).returning({ id: passwordResets.id });
  if (claimed.length === 0) return { error: "This link is invalid or has expired." }; // single use, race-safe
  await db.update(users).set({ passwordHash: await bcrypt.hash(password, 12), updatedAt: new Date() }).where(eq(users.id, r.userId));
  return { ok: true };
}
