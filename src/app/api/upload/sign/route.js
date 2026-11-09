import { v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publishers } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { canManagePublisherContent } from "@/lib/permissions";
import { rateLimit } from "@/lib/ratelimit";
import { getLimits, usedBytes } from "@/lib/quota";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (!(await rateLimit(`sign:${user.id}`, 300, 3600)).ok) return Response.json({ error: "Too many uploads." }, { status: 429 });
  const { publisherId } = await req.json().catch(() => ({}));
  const [publisher] = publisherId ? await db.select().from(publishers).where(eq(publishers.id, publisherId)).limit(1) : [];
  if (!canManagePublisherContent(user, publisher)) return Response.json({ error: "Forbidden." }, { status: 403 });
  const limits = await getLimits(publisher);
  if (limits.storageQuotaMb != null && (await usedBytes(publisher.id)) >= limits.storageQuotaMb * 1024 * 1024) {
    return Response.json({ error: "Storage limit reached. Remove unused pages or move to a plan with more storage. Nothing has been deleted." }, { status: 403 });
  }
  const params = { timestamp: Math.floor(Date.now() / 1000), folder: `flstudio/${publisher.id}`, upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  return Response.json({ ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
}
