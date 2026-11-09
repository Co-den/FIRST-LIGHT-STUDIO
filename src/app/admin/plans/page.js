import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";
const intOrNull = (v) => (String(v ?? "").trim() === "" || !(Number(v) >= 0) ? null : Math.floor(Number(v)));
import { inputCls, primaryBtn } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plans", robots: { index: false } };

export default async function Plans() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");
  const list = await db.select().from(plans).orderBy(asc(plans.code));

  async function create(fd) {
    "use server";
    const u = await getCurrentUser();
    if (!isAdmin(u)) return;
    const naira = Number(fd.get("price"));
    const interval = fd.get("interval") === "annual" ? "annual" : "monthly";
    const code = String(fd.get("code") || "").trim().toLowerCase();
    if (!/^[a-z0-9-]{2,30}$/.test(code) || !(naira > 0)) return;
    await db.insert(plans).values({ code, name: String(fd.get("name") || code).slice(0, 60), interval, amountMinor: Math.round(naira * 100), currency: "NGN",
      providerPlanCode: String(fd.get("providerPlanCode") || "").trim() || null, benefits: String(fd.get("benefits") || "").split("\n").map((b) => b.trim()).filter(Boolean), maxSeries: intOrNull(fd.get("maxSeries")), storageQuotaMb: intOrNull(fd.get("storageMb")) }).onConflictDoNothing();
    await audit({ actorId: u.id, action: "plan.created", targetType: "plan", details: { code, naira } });
    revalidatePath("/admin/plans");
  }
  async function toggle(fd) {
    "use server";
    if (!isAdmin(await getCurrentUser())) return;
    await db.update(plans).set({ active: fd.get("active") === "true" }).where(eq(plans.id, String(fd.get("id"))));
    await audit({ actorId: (await getCurrentUser()).id, action: "plan.toggled", targetType: "plan", targetId: String(fd.get("id")), details: { active: fd.get("active") } });
    revalidatePath("/admin/plans");
  }
  async function edit(fd) {
    "use server";
    const u = await getCurrentUser();
    if (!isAdmin(u)) return;
    const id = String(fd.get("id"));
    await db.update(plans).set({ name: String(fd.get("name") || "").slice(0, 60) || "Plan", benefits: String(fd.get("benefits") || "").split("\n").map((b) => b.trim()).filter(Boolean), maxSeries: intOrNull(fd.get("maxSeries")), storageQuotaMb: intOrNull(fd.get("storageMb")) }).where(eq(plans.id, id));
    await audit({ actorId: u.id, action: "plan.edited", targetType: "plan", targetId: id });
    revalidatePath("/admin/plans");
  }
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">Creator plans</h1>
      <p className="mt-3 text-mist">Prices are in naira. Existing plans are changed by deactivating and adding a new one, so past payments stay accurate.</p>
      {list.length === 0 ? <p className="mt-6 text-mist">No plans yet.</p> : (
        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">{list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>{p.name} <span className="text-sm text-mist">· {p.code} · {(p.amountMinor / 100).toLocaleString("en-NG")} {p.currency} / {p.interval} · {p.active ? "active" : "inactive"} · series {p.maxSeries ?? "unlimited"} · storage {p.storageQuotaMb != null ? `${p.storageQuotaMb} MB` : "unlimited"}</span></span>
            <form action={toggle}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="active" value={String(!p.active)} /><button className="border border-white/30 px-3 py-1 text-sm">{p.active ? "Deactivate" : "Activate"}</button></form>
            <details className="w-full text-sm"><summary className="cursor-pointer text-mist">Edit name, benefits, limits</summary>
              <form action={edit} className="mt-3 grid gap-3"><input type="hidden" name="id" value={p.id} />
                <input name="name" defaultValue={p.name} aria-label="Name" className={inputCls} />
                <textarea name="benefits" rows={2} defaultValue={(p.benefits || []).join("\n")} aria-label="Benefits" className={inputCls} />
                <input name="maxSeries" type="number" min="0" defaultValue={p.maxSeries ?? ""} placeholder="Max series (blank = unlimited)" className={inputCls} />
                <input name="storageMb" type="number" min="0" defaultValue={p.storageQuotaMb ?? ""} placeholder="Storage MB (blank = unlimited)" className={inputCls} />
                <button className="justify-self-start border border-white/30 px-3 py-1">Save changes</button></form></details>
          </li>))}</ul>
      )}
      <form action={create} className="mt-8 grid gap-4">
        <label className="font-head font-bold">Code (a-z, 0-9, dash)<input name="code" required className={inputCls} /></label>
        <label className="font-head font-bold">Name<input name="name" required className={inputCls} /></label>
        <label className="font-head font-bold">Price in naira<input name="price" type="number" min="1" step="any" required className={inputCls} /></label>
        <label className="font-head font-bold">Interval<select name="interval" className={inputCls}><option value="monthly">Monthly</option><option value="annual">Annual</option></select></label>
        <label className="font-head font-bold">Paystack plan code (optional, enables auto-renewal)<input name="providerPlanCode" className={inputCls} /></label>
        <label className="font-head font-bold">Max series (blank = unlimited)<input name="maxSeries" type="number" min="0" className={inputCls} /></label>
        <label className="font-head font-bold">Storage in MB (blank = unlimited)<input name="storageMb" type="number" min="0" className={inputCls} /></label>
        <label className="font-head font-bold">Benefits (one per line)<textarea name="benefits" rows={3} className={inputCls} /></label>
        <button className={`${primaryBtn} justify-self-start`}>Add plan</button>
      </form>
    </section>
  );
}
