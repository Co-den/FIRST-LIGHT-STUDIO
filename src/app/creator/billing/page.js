import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, plans } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { getOwnPublisher } from "@/lib/creators";
import { getLatestSubscription, startCheckout } from "@/lib/billing";
import { subscriptionIsActive } from "@/lib/permissions";
import { primaryBtn } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing", robots: { index: false } };
const money = (minor, cur) => new Intl.NumberFormat("en-NG", { style: "currency", currency: cur }).format(minor / 100);

export default async function Billing({ searchParams }) {
  const { reference, error } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const publisher = await getOwnPublisher(user.id);
  if (!publisher) redirect("/creator");
  const sub = await getLatestSubscription(publisher.id);
  const active = subscriptionIsActive(sub);
  const planList = await db.select().from(plans).where(eq(plans.active, true));
  const history = await db.select().from(payments).where(eq(payments.publisherId, publisher.id)).orderBy(desc(payments.createdAt)).limit(24);

  async function subscribe(fd) {
    "use server";
    const u = await getCurrentUser();
    let url;
    try { url = await startCheckout(u, await getOwnPublisher(u.id), String(fd.get("planId"))); }
    catch { redirect("/creator/billing?error=1"); }
    redirect(url);
  }
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <Link href="/creator" className="text-sm text-sun">Back to dashboard</Link>
      <h1 className="mt-2 font-display text-5xl">Billing</h1>
      {reference && !active && <p role="status" className="mt-4 border border-sun/50 p-3">Payment received by the provider is being confirmed. This page will show your plan once confirmation arrives. Refresh in a minute.</p>}
      {error && <p role="alert" className="mt-4 text-red-300">Could not start checkout. Try again.</p>}
      <p className="mt-6">{active ? <>Status: <strong>active</strong>, paid until {new Date(sub.currentPeriodEnd).toLocaleDateString("en-NG")}{sub.status === "cancelled" ? " (will not renew)" : ""}.</>
        : sub ? <>Status: <strong>{sub.status === "past_due" ? "payment failed" : "expired"}</strong>. Renew to publish again.</> : <>No subscription yet.</>}</p>
      <h2 className="mt-10 font-display text-3xl">Plans</h2>
      {planList.length === 0 ? <p className="mt-3 text-mist">No plans are available yet.</p> : (
        <ul className="mt-3 grid gap-4">{planList.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 border border-white/15 bg-midnight p-4">
            <span><strong className="font-head">{p.name}</strong> <span className="text-mist">{money(p.amountMinor, p.currency)} / {p.interval === "annual" ? "year" : "month"}</span>
              {Array.isArray(p.benefits) && p.benefits.length > 0 && <span className="block text-sm text-mist">{p.benefits.join(" · ")}</span>}</span>
            <form action={subscribe}><input type="hidden" name="planId" value={p.id} /><button className={primaryBtn}>{active ? "Renew" : "Subscribe"}</button></form>
          </li>))}</ul>
      )}
      <h2 className="mt-10 font-display text-3xl">Payment history</h2>
      {history.length === 0 ? <p className="mt-3 text-mist">No payments yet.</p> : (
        <ul className="mt-3 divide-y divide-white/10 border-y border-white/10 text-sm">{history.map((h) => <li key={h.id} className="flex justify-between py-3"><span>{new Date(h.paidAt || h.createdAt).toLocaleDateString("en-NG")} · {h.reference}</span><span>{money(h.amountMinor, h.currency)} · {h.status}</span></li>)}</ul>
      )}
    </section>
  );
}
