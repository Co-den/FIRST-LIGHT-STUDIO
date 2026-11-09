import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { chapters, publishers, series } from "@/db/schema";
import PageHeader from "@/components/PageHeader";
import { publisherLabel } from "@/lib/publisher-label";
import { getCurrentUser } from "@/lib/session";
import { publisherIsLive, submitReport, ModerationError } from "@/lib/moderation";
import { isFollowingSeries, toggleFollowSeries } from "@/lib/library";
import { inputCls } from "@/lib/ui";

export const dynamic = "force-dynamic";

async function load(slug) {
  const [row] = await db.select({ s: series, p: publishers }).from(series).innerJoin(publishers, eq(series.publisherId, publishers.id)).where(eq(series.slug, slug)).limit(1);
  if (!row || row.s.status === "draft" || row.s.status === "removed" || !(await publisherIsLive(row.p.id))) return null;
  const list = await db.select().from(chapters).where(and(eq(chapters.seriesId, row.s.id), eq(chapters.status, "published"), lte(chapters.publishedAt, new Date()))).orderBy(asc(chapters.number));
  return { ...row, list };
}
export async function generateMetadata({ params }) {
  const d = await load((await params).slug);
  return d ? { title: d.s.title, description: d.s.synopsis || undefined } : {};
}
export default async function ComicPage({ params, searchParams }) {
  const d = await load((await params).slug);
  if (!d) notFound();
  const { reported, rerror } = await searchParams;
  const user = await getCurrentUser();
  const following = await isFollowingSeries(user, d.s.id);
  const back = `/comics/${d.s.slug}`;

  async function follow() {
    "use server";
    await toggleFollowSeries(await getCurrentUser(), d.s.id);
    revalidatePath(back);
  }
  async function report(fd) {
    "use server";
    try { await submitReport(await getCurrentUser(), d.s.id, fd.get("reason")); }
    catch (e) { if (e instanceof ModerationError) redirect(`${back}?rerror=${encodeURIComponent(e.message)}`); throw e; }
    redirect(`${back}?reported=1`);
  }
  return (
    <>
      <PageHeader title={d.s.title} intro={publisherLabel(d.p)} />
      <div className="mx-auto max-w-3xl px-5 pb-24">
        {d.s.coverUrl && <Image src={d.s.coverUrl} alt={`Cover of ${d.s.title}`} width={300} height={450} priority className="mb-6 h-auto w-48 object-cover sm:w-60" />}
        <p className="text-sm"><Link href={`/creators/${d.p.slug}`} className="text-sun underline">View {d.p.displayName}</Link></p>
        {d.s.synopsis && <p className="mt-4 text-lg leading-relaxed">{d.s.synopsis}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {d.list.length > 0 && <Link href={`${back}/${d.list[0].number}`} className="rounded-sm bg-sun px-8 py-4 font-head font-bold text-night hover:bg-white">Start reading</Link>}
          {user ? <form action={follow}><button className="border border-white/40 px-5 py-4 font-head font-bold">{following ? "In your library" : "Add to library"}</button></form>
            : <Link href="/login" className="text-sm text-sun underline">Sign in to save to your library</Link>}
        </div>
        {d.list.length === 0 ? <p className="mt-8 text-mist">No chapters published yet.</p> : (
          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {d.list.map((c) => <li key={c.id}><Link href={`${back}/${c.number}`} className="block py-4 hover:text-sun">Chapter {c.number}: {c.title}</Link></li>)}
          </ul>
        )}
        <details className="mt-12 text-sm">
          <summary className="cursor-pointer text-mist">Report this comic</summary>
          {user ? (
            <form action={report} className="mt-3 grid gap-3">
              <label className="font-head font-bold">What is wrong?<textarea name="reason" rows={3} required minLength={10} maxLength={1000} className={inputCls} /></label>
              <button className="justify-self-start border border-white/40 px-4 py-2 font-head font-bold">Send report</button>
            </form>
          ) : <p className="mt-3"><Link href="/login" className="text-sun underline">Sign in</Link> to report content.</p>}
        </details>
        {reported && <p role="status" className="mt-4 text-sun">Thanks. Your report was sent to the studio team.</p>}
        {rerror && <p role="alert" className="mt-4 text-red-300">{rerror}</p>}
      </div>
    </>
  );
}
