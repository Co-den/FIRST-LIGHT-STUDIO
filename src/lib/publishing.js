import { and, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { publishers, series, chapters, chapterPages } from "@/db/schema";
import { getLatestSubscription } from "./billing";
import { getLimits, usedBytes } from "./quota";
import { checkQuota } from "./quota-utils";
import { hasAcceptedTerms } from "./terms";
import { audit } from "./audit";
import { canManagePublisherContent, canPublish, canModerate, PUBLISH_REASONS } from "./permissions";

export class PublishError extends Error {
  constructor(code, message) { super(message || code); this.code = code; }
}
const slugify = (t) => t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const CLOUD_PREFIX = () => `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
export const LIMITS = { maxPages: 100, maxBytes: 10 * 1024 * 1024, maxWidth: 4000, maxHeight: 12000 };

async function loadPublisher(id) {
  const [p] = await db.select().from(publishers).where(eq(publishers.id, id)).limit(1);
  return p;
}
async function loadChapterContext(chapterId) {
  const [row] = await db.select({ chapter: chapters, series, publisher: publishers }).from(chapters)
    .innerJoin(series, eq(chapters.seriesId, series.id)).innerJoin(publishers, eq(series.publisherId, publishers.id))
    .where(eq(chapters.id, chapterId)).limit(1);
  return row;
}

export async function createSeries(user, publisherId, input) {
  const publisher = await loadPublisher(publisherId);
  if (!canManagePublisherContent(user, publisher)) throw new PublishError("forbidden");
  const title = String(input.title || "").trim();
  if (title.length < 2 || title.length > 120) throw new PublishError("invalid", "Title must be 2 to 120 characters.");
  const limits = await getLimits(publisher);
  if (limits.maxSeries != null) {
    const [{ n }] = await db.select({ n: count() }).from(series).where(eq(series.publisherId, publisherId));
    if (n >= limits.maxSeries) throw new PublishError("quota", `Series limit reached (${limits.maxSeries}). Move to a plan with a higher limit. Nothing has been deleted.`);
  }
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(series).values({
    publisherId, slug, title, synopsis: String(input.synopsis || "").slice(0, 500),
    mode: input.mode === "paged" ? "paged" : "vertical",
  }).returning();
  return row;
}

export async function createChapter(user, seriesId, input) {
  const [s] = await db.select().from(series).where(eq(series.id, seriesId)).limit(1);
  const publisher = s && (await loadPublisher(s.publisherId));
  if (!canManagePublisherContent(user, publisher)) throw new PublishError("forbidden");
  const [{ n }] = await db.select({ n: max(chapters.number) }).from(chapters).where(eq(chapters.seriesId, seriesId));
  const title = String(input.title || "").trim();
  if (!title) throw new PublishError("invalid", "Chapter title is required.");
  const [row] = await db.insert(chapters).values({ seriesId, number: (n ?? 0) + 1, title }).returning();
  return row;
}

/** pages: [{ url, storageKey, width, height, bytes }] in reading order. Replaces the chapter's pages. */
export async function setChapterPages(user, chapterId, pages) {
  const ctx = await loadChapterContext(chapterId);
  if (!ctx || !canManagePublisherContent(user, ctx.publisher)) throw new PublishError("forbidden");
  if (!Array.isArray(pages) || pages.length === 0 || pages.length > LIMITS.maxPages) throw new PublishError("invalid", `Provide 1 to ${LIMITS.maxPages} pages.`);
  const folder = `flstudio/${ctx.publisher.id}/`;
  for (const p of pages) {
    const ok = typeof p.url === "string" && p.url.startsWith(CLOUD_PREFIX()) && typeof p.storageKey === "string" && p.storageKey.startsWith(folder)
      && p.bytes > 0 && p.bytes <= LIMITS.maxBytes && p.width > 0 && p.width <= LIMITS.maxWidth && p.height > 0 && p.height <= LIMITS.maxHeight;
    if (!ok) throw new PublishError("invalid", "A page failed validation (host, folder, size or dimensions).");
  }
  const quota = checkQuota({ usedBytes: await usedBytes(ctx.publisher.id, chapterId), newBytes: pages.reduce((n, p) => n + p.bytes, 0), quotaMb: (await getLimits(ctx.publisher)).storageQuotaMb });
  if (!quota.ok) throw new PublishError("quota", quota.message);
  await db.delete(chapterPages).where(eq(chapterPages.chapterId, chapterId));
  await db.insert(chapterPages).values(pages.map((p, i) => ({ chapterId, position: i + 1, url: p.url, storageKey: p.storageKey, width: p.width, height: p.height, bytes: p.bytes })));
}

/** The only path to published or scheduled. Subscription is checked here, on the server, every time. */
export async function setChapterStatus(user, chapterId, status, publishAt) {
  const ctx = await loadChapterContext(chapterId);
  if (!ctx) throw new PublishError("not_found");
  if (status === "unpublished") {
    if (!canManagePublisherContent(user, ctx.publisher) && !canModerate(user)) throw new PublishError("forbidden");
    await db.update(chapters).set({ status, updatedAt: new Date() }).where(eq(chapters.id, chapterId));
    await audit({ actorId: user.id, action: "chapter.unpublished", targetType: "chapter", targetId: chapterId, details: { byOwner: canManagePublisherContent(user, ctx.publisher) } });
    return;
  }
  if (status !== "published" && status !== "scheduled") throw new PublishError("invalid", "Unsupported status.");
  const sub = await getLatestSubscription(ctx.publisher.id);
  const verdict = canPublish(user, ctx.publisher, sub, new Date(), { termsAccepted: await hasAcceptedTerms(user.id) });
  if (!verdict.allowed) throw new PublishError(verdict.reason, PUBLISH_REASONS[verdict.reason]);
  const pages = await db.select({ id: chapterPages.id }).from(chapterPages).where(eq(chapterPages.chapterId, chapterId)).limit(1);
  if (pages.length === 0) throw new PublishError("invalid", "Upload at least one page first.");
  const when = status === "scheduled" ? new Date(publishAt) : new Date();
  if (status === "scheduled" && !(when > new Date())) throw new PublishError("invalid", "Schedule a future date.");
  await db.update(chapters).set({ status, publishAt: status === "scheduled" ? when : null, publishedAt: status === "published" ? when : null, updatedAt: new Date() }).where(eq(chapters.id, chapterId));
  if (status === "published") await db.update(series).set({ status: "ongoing" }).where(and(eq(series.id, ctx.series.id), eq(series.status, "draft")));
  await audit({ actorId: user.id, action: `chapter.${status}`, targetType: "chapter", targetId: chapterId });
}
