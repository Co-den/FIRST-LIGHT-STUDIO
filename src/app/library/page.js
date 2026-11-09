import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chapters, follows, readingHistory, series } from "@/db/schema";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/session";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "My library", robots: { index: false } };

export default async function Library() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const saved = await db.select({ s: series }).from(follows).innerJoin(series, eq(follows.seriesId, series.id)).where(eq(follows.userId, user.id)).limit(100);
  const recent = await db.select({ c: chapters, s: series, at: readingHistory.readAt }).from(readingHistory)
    .innerJoin(chapters, eq(readingHistory.chapterId, chapters.id)).innerJoin(series, eq(chapters.seriesId, series.id))
    .where(eq(readingHistory.userId, user.id)).orderBy(desc(readingHistory.readAt)).limit(20);
  const visible = (s) => s.status !== "removed" && s.status !== "draft";
  return (
    <>
      <PageHeader title="My library" intro={user.email} />
      <div className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="font-display text-3xl">Saved comics</h2>
        {saved.filter(({ s }) => visible(s)).length === 0 ? <p className="mt-3 text-mist">Nothing saved yet. Use the Add to library button on a comic page.</p> : (
          <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">{saved.filter(({ s }) => visible(s)).map(({ s }) => <li key={s.id}><Link href={`/comics/${s.slug}`} className="block py-3 hover:text-sun">{s.title}</Link></li>)}</ul>
        )}
        <h2 className="mt-10 font-display text-3xl">Recently read</h2>
        {recent.filter(({ s }) => visible(s)).length === 0 ? <p className="mt-3 text-mist">No reading history yet.</p> : (
          <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">{recent.filter(({ s }) => visible(s)).map(({ c, s, at }) => <li key={c.id}><Link href={`/comics/${s.slug}/${c.number}`} className="flex justify-between py-3 hover:text-sun"><span>{s.title}, chapter {c.number}</span><span className="text-sm text-mist">{new Date(at).toLocaleDateString("en-NG")}</span></Link></li>)}</ul>
        )}
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }} className="mt-12"><button className="border border-white/40 px-5 py-2 font-head font-bold">Sign out</button></form>
      </div>
    </>
  );
}
