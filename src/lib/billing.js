import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { payments, plans, publishers, subscriptions, users } from "@/db/schema";
import { chargeMatchesPlan, periodEnd } from "./billing-utils";
import { rateLimit } from "./ratelimit";
import { audit } from "./audit";

const PAYSTACK = "https://api.paystack.co";
const auth = () => ({ Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" });
const SETTLED = ["active", "cancelled", "past_due", "expired"];

/** Latest non-pending subscription. Nulls last so a pending checkout never hides a paid plan. */
export async function getLatestSubscription(publisherId) {
  const [s] = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.publisherId, publisherId), inArray(subscriptions.status, SETTLED)))
    .orderBy(sql`${subscriptions.currentPeriodEnd} desc nulls last`).limit(1);
  return s || null;
}

export async function startCheckout(user, publisher, planId) {
  if (!user || !publisher || publisher.ownerUserId !== user.id || publisher.kind !== "independent") throw new Error("forbidden");
  if (!(await rateLimit(`checkout:${user.id}`, 10, 3600)).ok) throw new Error("Too many attempts.");
  const [plan] = await db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.active, true))).limit(1);
  if (!plan) throw new Error("That plan is not available.");
  const reference = `fl_${randomUUID()}`;
  await db.insert(subscriptions).values({ publisherId: publisher.id, planId: plan.id, status: "pending", providerRef: reference });
  const body = { email: user.email, amount: plan.amountMinor, currency: plan.currency, reference, metadata: { publisherId: publisher.id, planId: plan.id },
    ...(plan.providerPlanCode && { plan: plan.providerPlanCode }),
    ...(process.env.NEXT_PUBLIC_SITE_URL && { callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/billing` }) };
  const res = await fetch(`${PAYSTACK}/transaction/initialize`, { method: "POST", headers: auth(), body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) throw new Error("Could not start checkout.");
  return json.data.authorization_url;
}

async function findSubscriptionForCustomer(email, planCode) {
  const rows = await db.select({ s: subscriptions, plan: plans }).from(users)
    .innerJoin(publishers, eq(publishers.ownerUserId, users.id)).innerJoin(subscriptions, eq(subscriptions.publisherId, publishers.id))
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(and(eq(users.email, String(email).toLowerCase()), eq(plans.providerPlanCode, planCode), inArray(subscriptions.status, SETTLED)))
    .orderBy(desc(subscriptions.createdAt)).limit(1);
  return rows[0] || null;
}

async function onChargeSuccess(d) {
  // Never trust the webhook body alone: confirm the transaction with Paystack.
  const res = await fetch(`${PAYSTACK}/transaction/verify/${encodeURIComponent(d.reference)}`, { headers: auth() });
  const v = (await res.json().catch(() => null))?.data;
  if (!res.ok || v?.status !== "success" || v.amount !== d.amount) { console.error("paystack verify mismatch", d.reference); return; }

  let found;
  const [pending] = await db.select({ s: subscriptions, plan: plans }).from(subscriptions).innerJoin(plans, eq(subscriptions.planId, plans.id)).where(eq(subscriptions.providerRef, d.reference)).limit(1);
  found = pending || (d.plan?.plan_code && d.customer?.email ? await findSubscriptionForCustomer(d.customer.email, d.plan.plan_code) : null);
  if (!found) { console.error("no subscription for charge", d.reference); return; }
  const { s, plan } = found;
  if (!chargeMatchesPlan(v, plan)) { console.error("amount or currency mismatch", d.reference); return; }

  const inserted = await db.insert(payments).values({ subscriptionId: s.id, publisherId: s.publisherId, reference: d.reference, amountMinor: v.amount, currency: v.currency, feesMinor: typeof v.fees === "number" ? v.fees : null, status: "success", paidAt: new Date(v.paid_at || Date.now()) })
    .onConflictDoNothing({ target: payments.reference }).returning({ id: payments.id });
  if (inserted.length === 0) return; // already processed, webhook retries are safe

  const now = new Date();
  const base = s.currentPeriodEnd && new Date(s.currentPeriodEnd) > now ? new Date(s.currentPeriodEnd) : now;
  await db.update(subscriptions).set({ status: "active", startedAt: s.startedAt || now, currentPeriodEnd: periodEnd(base, plan.interval), cancelledAt: null, updatedAt: now }).where(eq(subscriptions.id, s.id));
  await audit({ action: "subscription.activated", targetType: "subscription", targetId: s.id, details: { reference: d.reference, amountMinor: v.amount, source: "paystack_webhook" } });
}

async function setCustomerStatus(d, status) {
  const code = d.plan?.plan_code, email = d.customer?.email;
  if (!code || !email) return;
  const found = await findSubscriptionForCustomer(email, code);
  if (!found) return;
  await db.update(subscriptions).set({ status, cancelledAt: status === "cancelled" ? new Date() : null, updatedAt: new Date() }).where(eq(subscriptions.id, found.s.id));
  await audit({ action: `subscription.${status}`, targetType: "subscription", targetId: found.s.id, details: { source: "paystack_webhook" } });
}

/** Only called after the webhook signature has been verified. */
export async function handlePaystackEvent(evt) {
  const d = evt?.data;
  if (!d) return;
  if (evt.event === "charge.success") return onChargeSuccess(d);
  if (evt.event === "subscription.disable" || evt.event === "subscription.not_renew") return setCustomerStatus(d, "cancelled");
  if (evt.event === "invoice.payment_failed") return setCustomerStatus(d, "past_due");
}
