import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapterPages, chapters, publishers, series } from "@/db/schema";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Storage", robots: { index: false } };
const mb = (b) => (Number(b) / 1024 / 1024).toFixed(1);

export default async function Usage() {
  await requireAdmin();
  const rows = await db.select({ name: publishers.displayName, kind: publishers.kind, bytes: sql`coalesce(sum(${chapterPages.bytes}), 0)`, pages: count(chapterPages.id), series: sql`count(distinct ${series.id})`, chapters: sql`count(distinct ${chapters.id})` })
    .from(publishers).leftJoin(series, eq(series.publisherId, publishers.id)).leftJoin(chapters, eq(chapters.seriesId, series.id)).leftJoin(chapterPages, eq(chapterPages.chapterId, chapters.id))
    .groupBy(publishers.id).orderBy(sql`coalesce(sum(${chapterPages.bytes}), 0) desc`).limit(200);
  const total = rows.reduce((n, r) => n + Number(r.bytes), 0);
  const warn = Number(process.env.PLATFORM_STORAGE_WARN_MB);
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">Storage</h1>
      {warn > 0 && total >= warn * 1024 * 1024 * 0.8 && <p role="alert" className="mt-4 border border-red-300/60 p-3 text-red-300">Chapter page storage is at {mb(total)} MB, near your {warn} MB threshold.</p>}
      <p className="mt-3 text-sm text-mist">Chapter page sizes recorded in the database: {mb(total)} MB total. Covers, avatars, banners and Cloudinary delivery bandwidth are not counted here; check the Cloudinary dashboard for provider usage and billing.</p>
      <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">{rows.map((r) => <li key={r.name} className="flex flex-wrap justify-between gap-2 py-3"><span>{r.name} <span className="text-sm text-mist">· {r.kind}</span></span><span className="text-sm">{mb(r.bytes)} MB · {r.pages} pages · {Number(r.series)} series · {Number(r.chapters)} chapters</span></li>)}</ul>
    </section>
  );
}
