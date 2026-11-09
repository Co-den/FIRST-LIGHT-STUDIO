import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { publishers, series } from "@/db/schema";
import { requireAdmin } from "@/lib/guards";
import { getCurrentUser } from "@/lib/session";
import { setFeatured, setSeriesRemoved } from "@/lib/moderation";
import { publisherLabel } from "@/lib/publisher-label";

export const dynamic = "force-dynamic";
export const metadata = { title: "All series", robots: { index: false } };

export default async function Catalog() {
  await requireAdmin();
  const rows = await db.select({ s: series, p: publishers }).from(series).innerJoin(publishers, eq(series.publisherId, publishers.id)).orderBy(desc(series.createdAt)).limit(200);
  async function act(fd) {
    "use server";
    const u = await getCurrentUser(), id = String(fd.get("id")), on = fd.get("value") === "true";
    try { if (fd.get("kind") === "feature") await setFeatured(u, id, on); else await setSeriesRemoved(u, id, on); } catch (e) { console.error(e.message); }
    revalidatePath("/admin/catalog");
  }
  const btn = "border border-white/30 px-3 py-1 text-sm";
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">All series</h1>
      {rows.length === 0 ? <p className="mt-6 text-mist">No series yet.</p> : (
        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">{rows.map(({ s, p }) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>{s.title} <span className="block text-sm text-mist">{publisherLabel(p)} · {s.status}{s.featured ? " · featured" : ""}</span></span>
            <span className="flex gap-2">
              <form action={act}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="kind" value="feature" /><input type="hidden" name="value" value={String(!s.featured)} /><button className={btn}>{s.featured ? "Unfeature" : "Feature"}</button></form>
              <form action={act}><input type="hidden" name="id" value={s.id} /><input type="hidden" name="kind" value="remove" /><input type="hidden" name="value" value={String(s.status !== "removed")} /><button className={`${btn} ${s.status === "removed" ? "" : "text-red-300"}`}>{s.status === "removed" ? "Restore" : "Remove"}</button></form>
            </span>
          </li>))}</ul>
      )}
    </section>
  );
}
