import { and, asc, countDistinct, desc, eq, ilike, inArray, lte, max } from "drizzle-orm";
import { db } from "@/db";
import { chapters, publishers, series, users } from "@/db/schema";

const LIVE = ["ongoing", "completed", "hiatus"];
const esc = (q) => q.replace(/[%_\\]/g, "\\$&");

/** Public, readable series only: published chapter exists, not removed, owner not suspended. */
export async function listPublic({ q = "", kind, sort = "latest", limit = 48, featured = false } = {}) {
  const last = max(chapters.publishedAt), latest = max(chapters.number);
  const conds = [eq(users.status, "active"), eq(chapters.status, "published"), lte(chapters.publishedAt, new Date()), inArray(series.status, LIVE)];
  if (q) conds.push(ilike(series.title, `%${esc(q)}%`));
  if (kind) conds.push(eq(publishers.kind, kind));
  if (featured) conds.push(eq(series.featured, true));
  return db.select({ s: series, p: publishers, last, latest }).from(series)
    .innerJoin(chapters, eq(chapters.seriesId, series.id)).innerJoin(publishers, eq(series.publisherId, publishers.id)).innerJoin(users, eq(publishers.ownerUserId, users.id))
    .where(and(...conds)).groupBy(series.id, publishers.id).orderBy(sort === "title" ? asc(series.title) : desc(last)).limit(limit);
}

export async function listCreators() {
  return db.select({ p: publishers, n: countDistinct(series.id) }).from(publishers)
    .innerJoin(users, eq(publishers.ownerUserId, users.id)).innerJoin(series, eq(series.publisherId, publishers.id)).innerJoin(chapters, eq(chapters.seriesId, series.id))
    .where(and(eq(users.status, "active"), eq(chapters.status, "published"), lte(chapters.publishedAt, new Date()), inArray(series.status, LIVE)))
    .groupBy(publishers.id).orderBy(asc(publishers.displayName));
}
