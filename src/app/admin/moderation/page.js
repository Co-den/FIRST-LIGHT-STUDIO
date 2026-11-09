import Link from "next/link";
import { revalidatePath } from "next/cache";
import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { reports, series } from "@/db/schema";
import { requireAdmin } from "@/lib/guards";
import { getCurrentUser } from "@/lib/session";
import { resolveReport } from "@/lib/moderation";
import { inputCls } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports", robots: { index: false } };

export default async function Moderation() {
  await requireAdmin();
  const open = await db.select({ r: reports, s: series }).from(reports).innerJoin(series, eq(reports.seriesId, series.id)).where(isNull(reports.resolvedAt)).orderBy(asc(reports.createdAt)).limit(100);
  async function resolve(fd) {
    "use server";
    try { await resolveReport(await getCurrentUser(), String(fd.get("id")), String(fd.get("action")), fd.get("note")); } catch (e) { console.error(e.message); }
    revalidatePath("/admin/moderation");
  }
  const actions = [["dismiss", "Dismiss"], ["remove_series", "Remove comic"], ["suspend_creator", "Suspend creator"]];
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">Reports</h1>
      {open.length === 0 ? <p className="mt-6 text-mist">No open reports.</p> : (
        <ul className="mt-6 grid gap-4">{open.map(({ r, s }) => (
          <li key={r.id} className="border border-white/15 bg-midnight p-4">
            <p className="font-head font-bold">{s.title} <span className="text-sm font-normal text-mist">· {s.status} · {r.kind}</span></p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{r.reason}</p>
            <form action={resolve} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={r.id} />
              <label className="text-sm">Note (optional)<input name="note" maxLength={300} className={inputCls} /></label>
              <div className="flex flex-wrap gap-2">{actions.map(([v, l]) => <button key={v} name="action" value={v} className={`px-4 py-2 text-sm font-bold ${v === "dismiss" ? "border border-white/40" : "border border-red-300/60 text-red-300"}`}>{l}</button>)}</div>
            </form>
          </li>))}</ul>
      )}
    </section>
  );
}
