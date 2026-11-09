import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapterPages, chapters, plans, series } from "@/db/schema";
import { getLatestSubscription } from "./billing";

const num = (v, d) => (v === undefined || v === "" || Number.isNaN(Number(v)) ? d : Number(v));

/** null = unlimited. Official publisher is unlimited. Others follow their plan, else configured defaults. */
export async function getLimits(publisher) {
  if (publisher.kind === "official") return { maxSeries: null, storageQuotaMb: null };
  const sub = await getLatestSubscription(publisher.id);
  if (sub) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, sub.planId)).limit(1);
    if (plan) return { maxSeries: plan.maxSeries, storageQuotaMb: plan.storageQuotaMb };
  }
  return { maxSeries: num(process.env.FREE_DRAFT_MAX_SERIES, 3), storageQuotaMb: num(process.env.FREE_DRAFT_STORAGE_MB, 100) };
}

export async function usedBytes(publisherId, excludeChapterId) {
  const [r] = await db.select({ b: sql`coalesce(sum(${chapterPages.bytes}), 0)` }).from(chapterPages)
    .innerJoin(chapters, eq(chapterPages.chapterId, chapters.id)).innerJoin(series, eq(chapters.seriesId, series.id))
    .where(and(eq(series.publisherId, publisherId), excludeChapterId ? ne(chapters.id, excludeChapterId) : undefined));
  return Number(r.b);
}
