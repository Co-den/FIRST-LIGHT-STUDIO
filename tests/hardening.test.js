import test from "node:test";
import assert from "node:assert/strict";
import { hashToken, newToken } from "../src/lib/tokens.js";
import { clientIp } from "../src/lib/ratelimit-utils.js";
import { validateAsset } from "../src/lib/assets.js";

test("tokens are unique, long, and stored only as a hash", () => {
  const a = newToken(), b = newToken();
  assert.notEqual(a.token, b.token);
  assert.equal(a.token.length, 64);
  assert.notEqual(a.token, a.hash);
  assert.equal(hashToken(a.token), a.hash);
});
test("clientIp uses the first forwarded address", () => {
  const h = (m) => ({ get: (k) => m[k] });
  assert.equal(clientIp(h({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })), "1.2.3.4");
  assert.equal(clientIp(h({ "x-real-ip": "9.9.9.9" })), "9.9.9.9");
  assert.equal(clientIp(undefined), "unknown");
});
test("assets must be our host, our folder, and within limits", () => {
  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  const ok = { url: "https://res.cloudinary.com/demo/image/upload/x.jpg", storageKey: "flstudio/p1/x", width: 800, height: 1200, bytes: 1000 };
  assert.equal(validateAsset(ok, "p1"), true);
  assert.equal(validateAsset({ ...ok, url: "https://evil.com/x.jpg" }, "p1"), false);
  assert.equal(validateAsset(ok, "p2"), false);
  assert.equal(validateAsset({ ...ok, bytes: 6 * 1024 * 1024 }, "p1"), false);
  assert.equal(validateAsset(null, "p1"), false);
});
