import Link from "next/link";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { publishers, users } from "@/db/schema";
import { requireAdmin } from "@/lib/guards";
import { getCurrentUser } from "@/lib/session";
import { setUserStatus } from "@/lib/moderation";
import { getLatestSubscription } from "@/lib/billing";
import { subscriptionIsActive } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creators", robots: { index: false } };

export default async function Creators() {
  await requireAdmin();
  const rows = await db.select({ u: users, p: publishers }).from(publishers).innerJoin(users, eq(publishers.ownerUserId, users.id)).where(eq(publishers.kind, "independent")).orderBy(desc(users.createdAt)).limit(100);
  const subs = await Promise.all(rows.map((r) => getLatestSubscription(r.p.id)));
  async function act(fd) {
    "use server";
    try { await setUserStatus(await getCurrentUser(), String(fd.get("id")), String(fd.get("status"))); } catch (e) { console.error(e.message); }
    revalidatePath("/admin/creators");
  }
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">Creators</h1>
      {rows.length === 0 ? <p className="mt-6 text-mist">No creators yet.</p> : (
        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">{rows.map(({ u, p }, i) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>{p.displayName} <span className="block text-sm text-mist">{u.email} · account {u.status} · {subscriptionIsActive(subs[i]) ? `subscribed until ${new Date(subs[i].currentPeriodEnd).toLocaleDateString("en-NG")}` : "no active subscription"}</span></span>
            <form action={act}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value={u.status === "active" ? "suspended" : "active"} />
              <button className={`border px-3 py-1 text-sm ${u.status === "active" ? "border-red-300/60 text-red-300" : "border-white/30"}`}>{u.status === "active" ? "Suspend" : "Reactivate"}</button></form>
          </li>))}</ul>
      )}
    </section>
  );
}
