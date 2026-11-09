import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { publishers, reports, series, users } from "@/db/schema";
import { canModerate, canSuspend } from "./permissions";
import { audit } from "./audit";

export class ModerationError extends Error {}
const need = (ok, msg = "Not allowed.") => { if (!ok) throw new ModerationError(msg); };

/** False when the publisher's owner account is suspended. Their content is hidden from readers. */
export async function publisherIsLive(publisherId) {
  const [r] = await db.select({ s: users.status }).from(publishers).innerJoin(users, eq(publishers.ownerUserId, users.id)).where(eq(publishers.id, publisherId)).limit(1);
  return r?.s === "active";
}

export async function submitReport(user, seriesId, reason) {
  need(!!user, "Sign in to report content.");
  const text = String(reason || "").trim();
  need(text.length >= 10 && text.length <= 1000, "Describe the problem in 10 to 1000 characters.");
  const [s] = await db.select({ id: series.id }).from(series).where(eq(series.id, seriesId)).limit(1);
  need(!!s, "Comic not found.");
  const open = await db.select({ id: reports.id }).from(reports).where(and(eq(reports.reporterId, user.id), isNull(reports.resolvedAt))).limit(10);
  need(open.length < 10, "You have too many open reports. Please wait for them to be reviewed.");
  await db.insert(reports).values({ reporterId: user.id, seriesId, reason: text });
}

export async function setUserStatus(admin, targetId, status) {
  const [t] = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  need(canSuspend(admin, t), "You cannot change this account.");
  need(status === "active" || status === "suspended");
  await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, targetId));
  await audit({ actorId: admin.id, action: `user.${status}`, targetType: "user", targetId });
}

export async function setSeriesRemoved(admin, seriesId, removed) {
  need(canModerate(admin));
  await db.update(series).set({ status: removed ? "removed" : "ongoing", updatedAt: new Date() }).where(eq(series.id, seriesId));
  await audit({ actorId: admin.id, action: removed ? "series.removed" : "series.restored", targetType: "series", targetId: seriesId });
}

export async function setFeatured(admin, seriesId, featured) {
  need(canModerate(admin));
  await db.update(series).set({ featured: !!featured }).where(eq(series.id, seriesId));
  await audit({ actorId: admin.id, action: featured ? "series.featured" : "series.unfeatured", targetType: "series", targetId: seriesId });
}

export async function resolveReport(admin, reportId, action, note) {
  need(canModerate(admin));
  const [r] = await db.select().from(reports).where(and(eq(reports.id, reportId), isNull(reports.resolvedAt))).limit(1);
  need(!!r, "Report already resolved.");
  if (action === "remove_series") await setSeriesRemoved(admin, r.seriesId, true);
  else if (action === "suspend_creator") {
    const [row] = await db.select({ owner: publishers.ownerUserId }).from(series).innerJoin(publishers, eq(series.publisherId, publishers.id)).where(eq(series.id, r.seriesId)).limit(1);
    await setUserStatus(admin, row.owner, "suspended");
  } else need(action === "dismiss", "Unknown action.");
  await db.update(reports).set({ resolution: `${action}${note ? `: ${String(note).slice(0, 300)}` : ""}`, resolvedBy: admin.id, resolvedAt: new Date() }).where(eq(reports.id, reportId));
  await audit({ actorId: admin.id, action: "report.resolved", targetType: "report", targetId: reportId, details: { action, kind: r.kind } });
}
