import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publishers, series } from "@/db/schema";
import { canManagePublisherContent } from "./permissions";
import { validateAsset } from "./assets";
import { getOwnPublisher } from "./creators";
import { PublishError } from "./publishing";

export async function setSeriesCover(user, seriesId, asset) {
  const [row] = await db.select({ s: series, p: publishers }).from(series).innerJoin(publishers, eq(series.publisherId, publishers.id)).where(eq(series.id, seriesId)).limit(1);
  if (!row || !canManagePublisherContent(user, row.p)) throw new PublishError("forbidden");
  if (!validateAsset(asset, row.p.id)) throw new PublishError("invalid", "That image failed validation.");
  await db.update(series).set({ coverUrl: asset.url, updatedAt: new Date() }).where(eq(series.id, seriesId));
}

export async function setPublisherImage(user, kind, asset) {
  const p = user && (await getOwnPublisher(user.id));
  if (!p || !canManagePublisherContent(user, p) || (kind !== "avatar" && kind !== "banner")) throw new PublishError("forbidden");
  if (!validateAsset(asset, p.id)) throw new PublishError("invalid", "That image failed validation.");
  await db.update(publishers).set(kind === "avatar" ? { avatarUrl: asset.url, updatedAt: new Date() } : { bannerUrl: asset.url, updatedAt: new Date() }).where(eq(publishers.id, p.id));
}
