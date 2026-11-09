import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray, lte, max } from "drizzle-orm";
import { db } from "@/db";
import { chapters, publishers, series } from "@/db/schema";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/session";
import { publisherIsLive } from "@/lib/moderation";
import { isFollowingPublisher, toggleFollowPublisher } from "@/lib/library";
import { publisherLabel } from "@/lib/publisher-label";

export const dynamic = "force-dynamic";

async function load(slug) {
  const [p] = await db.select().from(publishers).where(eq(publishers.slug, slug)).limit(1);
  return p && (await publisherIsLive(p.id)) ? p : null;
}
export async function generateMetadata({ params }) {
  const p = await load((await params).slug);
  return p ? { title: p.displayName, description: p.bio || undefined } : {};
}
export default async function CreatorPage({ params }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const user = await getCurrentUser();
  const following = await isFollowingPublisher(user, p.id);
  const last = max(chapters.publishedAt);
  const list = await db.select({ s: series, last }).from(series).innerJoin(chapters, eq(chapters.seriesId, series.id))
    .where(and(eq(series.publisherId, p.id), eq(chapters.status, "published"), lte(chapters.publishedAt, new Date()), inArray(series.status, ["ongoing", "completed", "hiatus"])))
    .groupBy(series.id).orderBy(desc(last));
  async function follow() {
    "use server";
    await toggleFollowPublisher(await getCurrentUser(), p.id);
    revalidatePath(`/creators/${p.slug}`);
  }
  return (
    <>
      <PageHeader title={p.displayName} intro={publisherLabel(p)} />
      <div className="mx-auto max-w-3xl px-5 pb-24">
        {p.bannerUrl && <Image src={p.bannerUrl} alt="" width={1200} height={300} priority className="mb-6 h-auto w-full object-cover" />}
        {p.avatarUrl && <Image src={p.avatarUrl} alt={`${p.displayName} profile picture`} width={96} height={96} className="mb-4 h-24 w-24 object-cover" />}
        {p.bio && <p className="text-lg leading-relaxed">{p.bio}</p>}
        {Array.isArray(p.socialLinks) && p.socialLinks.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-4">{p.socialLinks.filter((l) => l.href?.startsWith("https://")).map((l) => <li key={l.href}><a href={l.href} rel="noopener noreferrer nofollow" className="text-sun underline">{l.label}</a></li>)}</ul>
        )}
        {user ? <form action={follow} className="mt-6"><button className="border border-white/40 px-5 py-2 font-head font-bold">{following ? "Following" : "Follow creator"}</button></form>
          : <p className="mt-6 text-sm text-mist"><Link href="/login" className="text-sun underline">Sign in</Link> to follow.</p>}
        <h2 className="mt-10 font-display text-3xl">Comics</h2>
        {list.length === 0 ? <p className="mt-3 text-mist">Nothing published yet.</p> : (
          <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">{list.map(({ s }) => <li key={s.id}><Link href={`/comics/${s.slug}`} className="block py-4 hover:text-sun">{s.title}</Link></li>)}</ul>
        )}
      </div>
    </>
  );
}
