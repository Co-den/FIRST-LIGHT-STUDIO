import test from "node:test";
import assert from "node:assert/strict";
import { canPublish, canManagePublisherContent, subscriptionIsActive, isPubliclyReadable, canModerate } from "../src/lib/permissions.js";

const now = new Date("2026-11-08");
const future = new Date("2026-12-08"), past = new Date("2026-10-08");
const admin = { id: "a", role: "admin", status: "active" };
const c1 = { id: "c1", role: "creator", status: "active" };
const c2 = { id: "c2", role: "creator", status: "active" };
const official = { kind: "official", ownerUserId: "a", feeExempt: true };
const T = { termsAccepted: true };
const pub1 = { kind: "independent", ownerUserId: "c1" };
const active = { status: "active", currentPeriodEnd: future };
const expired = { status: "expired", currentPeriodEnd: past };

test("official studio publishes with no subscription", () => assert.equal(canPublish(admin, official, null, now).allowed, true));
test("creator cannot publish official content", () => assert.equal(canPublish(c1, official, active, now).allowed, false));
test("creator without subscription cannot publish", () => assert.equal(canPublish(c1, pub1, null, now).reason, "subscription_required"));
test("creator with active subscription can publish", () => assert.equal(canPublish(c1, pub1, active, now, T).allowed, true));
test("expired subscription blocks publishing", () => assert.equal(canPublish(c1, pub1, expired, now).allowed, false));
test("active status with elapsed period is not active", () => assert.equal(subscriptionIsActive({ status: "active", currentPeriodEnd: past }, now), false));
test("cancelled plan works until period end", () => assert.equal(subscriptionIsActive({ status: "cancelled", currentPeriodEnd: future }, now), true));
test("past_due does not grant access", () => assert.equal(subscriptionIsActive({ status: "past_due", currentPeriodEnd: future }, now), false));
test("creator cannot manage another creator's content", () => assert.equal(canManagePublisherContent(c2, pub1), false));
test("creator cannot publish to another creator's publisher", () => assert.equal(canPublish(c2, pub1, active, now).allowed, false));
test("lapsed creator can still edit drafts and metadata", () => assert.equal(canManagePublisherContent(c1, pub1), true));
test("reader role cannot publish", () => assert.equal(canPublish({ id: "c1", role: "reader", status: "active" }, pub1, active, now).allowed, false));
test("suspended creator cannot publish or edit", () => {
  const s = { ...c1, status: "suspended" };
  assert.equal(canPublish(s, pub1, active, now).allowed, false);
  assert.equal(canManagePublisherContent(s, pub1), false);
});
test("published chapters stay readable after expiry", () => {
  const ch = { status: "published", publishedAt: past }, se = { status: "ongoing" };
  assert.equal(isPubliclyReadable(ch, se, now), true);
});
test("drafts, scheduled-in-future and removed series are not readable", () => {
  assert.equal(isPubliclyReadable({ status: "draft" }, { status: "ongoing" }, now), false);
  assert.equal(isPubliclyReadable({ status: "published", publishedAt: future }, { status: "ongoing" }, now), false);
  assert.equal(isPubliclyReadable({ status: "published", publishedAt: past }, { status: "removed" }, now), false);
});
test("only admins moderate", () => { assert.equal(canModerate(admin), true); assert.equal(canModerate(c1), false); });

test("creator with active plan but no accepted terms cannot publish", () => assert.equal(canPublish(c1, pub1, active, now).reason, "terms_required"));
test("official publisher without the explicit entitlement is not exempt", () => assert.equal(canPublish(admin, { ...official, feeExempt: false }, null, now).allowed, false));
test("fee exemption does not skip the terms requirement for independent creators", () => assert.equal(canPublish(c1, { ...pub1, feeExempt: true }, null, now).reason, "terms_required"));
test("granted exemption lets an accepted creator publish without a plan", () => assert.equal(canPublish(c1, { ...pub1, feeExempt: true }, null, now, T).allowed, true));
