import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { chapterPages, chapters, series } from "@/db/schema";
import { isPubliclyReadable } from "@/lib/permissions";
import { publisherIsLive } from "@/lib/moderation";
import { recordRead } from "@/lib/library";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

async function load(slug, number) {
  const n = Number.parseInt(number, 10);
  if (!Number.isInteger(n)) return null;
  const [s] = await db.select().from(series).where(eq(series.slug, slug)).limit(1);
  if (!s || !(await publisherIsLive(s.publisherId))) return null;
  const [c] = await db.select().from(chapters).where(and(eq(chapters.seriesId, s.id), eq(chapters.number, n))).limit(1);
  if (!isPubliclyReadable(c, s)) return null;
  const pages = await db.select().from(chapterPages).where(eq(chapterPages.chapterId, c.id)).orderBy(asc(chapterPages.position));
  const all = await db.select({ number: chapters.number }).from(chapters).where(and(eq(chapters.seriesId, s.id), eq(chapters.status, "published"), lte(chapters.publishedAt, new Date()))).orderBy(asc(chapters.number));
  const nums = all.map((x) => x.number), i = nums.indexOf(n);
  return { s, c, pages, prev: nums[i - 1], next: nums[i + 1] };
}
export async function generateMetadata({ params }) {
  const { slug, number } = await params;
  const d = await load(slug, number);
  return d ? { title: `${d.s.title}, Chapter ${d.c.number}` } : {};
}

export default async function Reader({ params }) {
  const { slug, number } = await params;
  const d = await load(slug, number);
  if (!d) notFound();
  const viewer = await getCurrentUser();
  if (viewer) await recordRead(viewer, d.c.id);
  const nav = (
    <nav aria-label="Chapter navigation" className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-head font-bold">
      {d.prev ? <Link href={`/comics/${slug}/${d.prev}`} className="text-sun">Previous</Link> : <span />}
      <Link href={`/comics/${slug}`} className="text-mist hover:text-sun">{d.s.title}</Link>
      {d.next ? <Link href={`/comics/${slug}/${d.next}`} className="text-sun">Next</Link> : <span />}
    </nav>
  );
  return (
    <article className="pt-20">
      {nav}
      <h1 className="px-5 pb-4 text-center font-display text-3xl">Chapter {d.c.number}: {d.c.title}</h1>
      <div className="mx-auto max-w-[720px] bg-black">
        {d.pages.map((p, i) => (
          <Image key={p.id} src={p.url} alt={`${d.s.title}, chapter ${d.c.number}, page ${i + 1}`} width={p.width} height={p.height}
            sizes="(max-width: 720px) 100vw, 720px" priority={i === 0} loading={i === 0 ? undefined : "lazy"} className="block h-auto w-full" />
        ))}
      </div>
      {nav}
      {d.next && <p className="pb-16 text-center"><Link href={`/comics/${slug}/${d.next}`} className="inline-block rounded-sm bg-sun px-8 py-4 font-head font-bold text-night">Continue to next chapter</Link></p>}
    </article>
  );
}
