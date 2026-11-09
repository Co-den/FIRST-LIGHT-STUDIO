import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { payments, publishers, subscriptions } from "@/db/schema";
import { requireAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Finance", robots: { index: false } };
const money = (m, c) => new Intl.NumberFormat("en-NG", { style: "currency", currency: c }).format((m || 0) / 100);

export default async function Finance() {
  await requireAdmin();
  const subs = await db.select({ s: subscriptions, name: publishers.displayName }).from(subscriptions).innerJoin(publishers, eq(subscriptions.publisherId, publishers.id)).orderBy(desc(subscriptions.createdAt)).limit(500);
  const now = new Date();
  const bucket = (s) => s.status === "pending" ? "pending" : s.status === "past_due" ? "past due" : s.currentPeriodEnd && new Date(s.currentPeriodEnd) <= now ? "expired" : s.status === "cancelled" ? "cancelled (paid until period end)" : "active";
  const counts = subs.reduce((a, { s }) => ({ ...a, [bucket(s)]: (a[bucket(s)] || 0) + 1 }), {});
  const totals = await db.select({ cur: payments.currency, status: payments.status, gross: sql`sum(${payments.amountMinor})`, fees: sql`sum(${payments.feesMinor})`, n: count(), withFees: sql`count(${payments.feesMinor})` }).from(payments).groupBy(payments.currency, payments.status);
  const recent = await db.select({ p: payments, name: publishers.displayName }).from(payments).innerJoin(publishers, eq(payments.publisherId, publishers.id)).orderBy(desc(payments.createdAt)).limit(100);
  return (
    <section className="mx-auto max-w-4xl px-5 pb-24 pt-36">
      <Link href="/admin" className="text-sm text-sun">Back to admin</Link>
      <h1 className="mt-2 font-display text-5xl">Finance</h1>
      <p className="mt-3 text-sm text-mist">Figures come from payments confirmed by Paystack. Refunds are not tracked, and provider fees are shown only where Paystack reported them, so net proceeds cannot be fully verified here. Failed checkout attempts are not stored; failed renewals appear as past due.</p>
      <h2 className="mt-8 font-display text-3xl">Subscriptions</h2>
      <ul className="mt-3 grid gap-1">{Object.keys(counts).length === 0 ? <li className="text-mist">None yet.</li> : Object.entries(counts).map(([k, v]) => <li key={k}>{k}: <strong>{v}</strong></li>)}</ul>
      <h2 className="mt-8 font-display text-3xl">Payments</h2>
      {totals.length === 0 ? <p className="mt-3 text-mist">No payments recorded.</p> : (
        <ul className="mt-3 grid gap-1">{totals.map((t) => <li key={`${t.cur}${t.status}`}>{t.status}: {t.n} payments, gross {money(Number(t.gross), t.cur)}{t.status === "success" && <span className="text-mist"> · provider fees reported on {Number(t.withFees)} of {t.n}: {money(Number(t.fees), t.cur)}</span>}</li>)}</ul>
      )}
      <h2 className="mt-8 font-display text-3xl">Recent transactions</h2>
      <ul className="mt-3 divide-y divide-white/10 border-y border-white/10 text-sm">{recent.map(({ p, name }) => <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2"><span>{new Date(p.paidAt || p.createdAt).toLocaleDateString("en-NG")} · {name} · {p.reference}</span><span>{money(p.amountMinor, p.currency)} · {p.status}</span></li>)}</ul>
    </section>
  );
}
