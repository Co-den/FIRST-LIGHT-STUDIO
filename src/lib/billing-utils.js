import { createHmac, timingSafeEqual } from "node:crypto";

/** Paystack signs the raw request body with your secret key (HMAC SHA-512, hex). */
export function verifyPaystackSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest();
  let given;
  try { given = Buffer.from(String(signature), "hex"); } catch { return false; }
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** End of the paid period that starts at `from`. */
export function periodEnd(from, interval) {
  const d = new Date(from);
  if (interval === "annual" || interval === "annually") d.setUTCFullYear(d.getUTCFullYear() + 1);
  else if (interval === "monthly") d.setUTCMonth(d.getUTCMonth() + 1);
  else throw new Error(`Unsupported interval: ${interval}`);
  return d;
}

/** A charge may only activate a plan when amount and currency match what we sold. */
export const chargeMatchesPlan = (charge, plan) => !!charge && !!plan && charge.amount === plan.amountMinor && charge.currency === plan.currency;
