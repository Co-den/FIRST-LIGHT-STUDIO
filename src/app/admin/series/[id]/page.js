import Link from "next/link";
import ImageField from "@/components/ImageField";
import { saveCover } from "@/app/media-actions";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, publishers, series } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { createChapter } from "@/lib/publishing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Series", robots: { index: false } };

export default async function SeriesAdmin({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");
  const [row] = await db.select({ s: series, p: publishers }).from(series).innerJoin(publishers, eq(series.publisherId, publishers.id)).where(eq(series.id, id)).limit(1);
  if (!row || row.p.kind !== "official") notFound();
  const list = await db.select().from(chapters).where(eq(chapters.seriesId, id)).orderBy(asc(chapters.number));

  async function add(fd) {
    "use server";
    await createChapter(await getCurrentUser(), id, { title: fd.get("title") });
    revalidatePath(`/admin/series/${id}`);
  }
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">{row.s.title}</h1>
      <ImageField label="Cover image" publisherId={row.p.id} current={row.s.coverUrl} action={saveCover.bind(null, id)} />
      <h2 className="mt-10 font-display text-3xl">Chapters</h2>
      {list.length === 0 ? <p className="mt-3 text-mist">No chapters yet.</p> : (
        <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
          {list.map((c) => <li key={c.id} className="py-3"><Link href={`/admin/chapters/${c.id}`} className="text-sun hover:underline">Ch. {c.number}: {c.title}</Link> <span className="text-sm text-mist">· {c.status}</span></li>)}
        </ul>
      )}
      <form action={add} className="mt-8 flex flex-wrap items-end gap-3">
        <label className="font-head font-bold">New chapter title<input name="title" required className="mt-2 block w-72 border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
        <button className="rounded-sm bg-sun px-6 py-3 font-head font-bold text-night">Add chapter</button>
      </form>
    </section>
  );
}
