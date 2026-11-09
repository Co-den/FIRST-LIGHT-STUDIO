import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapterPages, chapters, publishers, series } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import ChapterEditor from "@/components/ChapterEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Chapter", robots: { index: false } };

export default async function ChapterAdmin({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");
  const [row] = await db.select({ c: chapters, s: series, p: publishers }).from(chapters)
    .innerJoin(series, eq(chapters.seriesId, series.id)).innerJoin(publishers, eq(series.publisherId, publishers.id)).where(eq(chapters.id, id)).limit(1);
  if (!row || row.p.kind !== "official") notFound();
  const pages = await db.select().from(chapterPages).where(eq(chapterPages.chapterId, id)).orderBy(asc(chapterPages.position));
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <Link href={`/admin/series/${row.s.id}`} className="text-sm text-sun">Back to {row.s.title}</Link>
      <h1 className="mt-2 font-display text-5xl">Ch. {row.c.number}: {row.c.title}</h1>
      <ChapterEditor chapterId={id} publisherId={row.p.id} initialStatus={row.c.status}
        initialPages={pages.map((p) => ({ url: p.url, storageKey: p.storageKey, width: p.width, height: p.height, bytes: p.bytes }))} />
    </section>
  );
}
