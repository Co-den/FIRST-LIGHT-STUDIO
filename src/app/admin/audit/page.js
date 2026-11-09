import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit log", robots: { index: false } };

export default async function Audit() {
  await requireAdmin();
  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">Audit log</h1>
      {rows.length === 0 ? <p className="mt-6 text-mist">Nothing recorded yet.</p> : (
        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">{rows.map((r) => <li key={r.id} className="py-2"><span className="text-mist">{new Date(r.createdAt).toLocaleString("en-NG")}</span> · <strong>{r.action}</strong> · {r.targetType}{r.targetId ? ` ${r.targetId.slice(0, 8)}` : ""} · {r.actorId ? `by ${r.actorId.slice(0, 8)}` : "system"}{Object.keys(r.details || {}).length ? <span className="block text-mist">{JSON.stringify(r.details)}</span> : null}</li>)}</ul>
      )}
    </section>
  );
}
