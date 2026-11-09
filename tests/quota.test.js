import test from "node:test";
import assert from "node:assert/strict";
import { checkQuota } from "../src/lib/quota-utils.js";

const MB = 1024 * 1024;
test("null quota is unlimited", () => assert.equal(checkQuota({ usedBytes: 9e12, newBytes: 9e12, quotaMb: null }).ok, true));
test("within quota is allowed, including exactly at the limit", () => { assert.equal(checkQuota({ usedBytes: 50 * MB, newBytes: 10 * MB, quotaMb: 100 }).ok, true); assert.equal(checkQuota({ usedBytes: 90 * MB, newBytes: 10 * MB, quotaMb: 100 }).ok, true); });
test("over quota is refused with a clear, non-destructive message", () => {
  const r = checkQuota({ usedBytes: 95 * MB, newBytes: 10 * MB, quotaMb: 100 });
  assert.equal(r.ok, false);
  assert.match(r.message, /Nothing has been deleted/);
});
test("zero quota blocks any upload", () => assert.equal(checkQuota({ usedBytes: 0, newBytes: 1, quotaMb: 0 }).ok, false));
