import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { follows, readingHistory, series } from "@/db/schema";

export async function isFollowingSeries(user, seriesId) {
  if (!user) return false;
  const [r] = await db.select({ u: follows.userId }).from(follows).where(and(eq(follows.userId, user.id), eq(follows.seriesId, seriesId))).limit(1);
  return !!r;
}
export async function isFollowingPublisher(user, publisherId) {
  if (!user) return false;
  const [r] = await db.select({ u: follows.userId }).from(follows).where(and(eq(follows.userId, user.id), eq(follows.publisherId, publisherId))).limit(1);
  return !!r;
}
export async function toggleFollowSeries(user, seriesId) {
  if (!user) throw new Error("Sign in required.");
  const [s] = await db.select({ status: series.status }).from(series).where(eq(series.id, seriesId)).limit(1);
  if (!s || s.status === "draft" || s.status === "removed") throw new Error("Not found.");
  if (await isFollowingSeries(user, seriesId)) await db.delete(follows).where(and(eq(follows.userId, user.id), eq(follows.seriesId, seriesId)));
  else await db.insert(follows).values({ userId: user.id, seriesId }).onConflictDoNothing();
}
export async function toggleFollowPublisher(user, publisherId) {
  if (!user) throw new Error("Sign in required.");
  if (await isFollowingPublisher(user, publisherId)) await db.delete(follows).where(and(eq(follows.userId, user.id), eq(follows.publisherId, publisherId)));
  else await db.insert(follows).values({ userId: user.id, publisherId }).onConflictDoNothing();
}
export async function recordRead(user, chapterId) {
  await db.insert(readingHistory).values({ userId: user.id, chapterId }).onConflictDoUpdate({ target: [readingHistory.userId, readingHistory.chapterId], set: { readAt: new Date() } });
}
