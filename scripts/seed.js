// Creates the admin user and the single official publisher. Safe to re-run.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users, publishers, auditLog } from "../src/db/schema.js";

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in .env.local");
  process.exit(1);
}
const db = drizzle(neon(DATABASE_URL));
const email = ADMIN_EMAIL.toLowerCase();
let [admin] = await db.select().from(users).where(eq(users.email, email)).limit(1);
if (!admin) {
  [admin] = await db.insert(users).values({ email, name: "FIRST LIGHT STUDIO", role: "admin", passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) }).returning();
} else if (admin.role !== "admin") {
  [admin] = await db.update(users).set({ role: "admin" }).where(eq(users.id, admin.id)).returning();
}
const [official] = await db.select().from(publishers).where(eq(publishers.kind, "official")).limit(1);
if (!official) {
  await db.insert(publishers).values({ kind: "official", ownerUserId: admin.id, slug: "first-light-studio", displayName: "FIRST LIGHT STUDIO", feeExempt: true });
  await db.insert(auditLog).values({ actorId: admin.id, action: "publisher.fee_exempt_granted", targetType: "publisher", details: { via: "seed" } });
} else if (!official.feeExempt) {
  await db.update(publishers).set({ feeExempt: true }).where(eq(publishers.id, official.id));
  await db.insert(auditLog).values({ actorId: admin.id, action: "publisher.fee_exempt_granted", targetType: "publisher", targetId: official.id, details: { via: "seed" } });
}
console.log("Seed complete.");
process.exit(0);
