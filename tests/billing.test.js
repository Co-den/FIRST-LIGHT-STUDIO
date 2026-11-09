import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyPaystackSignature, periodEnd, chargeMatchesPlan } from "../src/lib/billing-utils.js";

const secret = "sk_test_secret", body = '{"event":"charge.success","data":{"reference":"r1"}}';
const sign = (b, s) => createHmac("sha512", s).update(b).digest("hex");

test("valid signature is accepted", () => assert.equal(verifyPaystackSignature(body, sign(body, secret), secret), true));
test("signature from another secret is rejected", () => assert.equal(verifyPaystackSignature(body, sign(body, "other"), secret), false));
test("tampered body is rejected", () => assert.equal(verifyPaystackSignature(body.replace("r1", "r2"), sign(body, secret), secret), false));
test("missing signature, body or secret is rejected", () => {
  assert.equal(verifyPaystackSignature(body, null, secret), false);
  assert.equal(verifyPaystackSignature("", sign(body, secret), secret), false);
  assert.equal(verifyPaystackSignature(body, sign(body, secret), ""), false);
});
test("garbage or short signature is rejected", () => { assert.equal(verifyPaystackSignature(body, "zz", secret), false); assert.equal(verifyPaystackSignature(body, "abcd", secret), false); });
test("monthly and annual period ends", () => {
  assert.equal(periodEnd("2026-11-08T00:00:00Z", "monthly").toISOString(), "2026-12-08T00:00:00.000Z");
  assert.equal(periodEnd("2026-11-08T00:00:00Z", "annual").toISOString(), "2027-11-08T00:00:00.000Z");
});
test("unknown interval throws", () => assert.throws(() => periodEnd(new Date(), "weekly")));
test("charge must match plan amount and currency", () => {
  const plan = { amountMinor: 500000, currency: "NGN" };
  assert.equal(chargeMatchesPlan({ amount: 500000, currency: "NGN" }, plan), true);
  assert.equal(chargeMatchesPlan({ amount: 100, currency: "NGN" }, plan), false);
  assert.equal(chargeMatchesPlan({ amount: 500000, currency: "USD" }, plan), false);
});
