import test from "node:test";
import assert from "node:assert/strict";
import { canSuspend } from "../src/lib/permissions.js";
import { parseSocialLinks } from "../src/lib/profile-utils.js";

const admin = { id: "a", role: "admin", status: "active" }, admin2 = { id: "b", role: "admin", status: "active" };
const creator = { id: "c", role: "creator", status: "active" };

test("admin can suspend a creator", () => assert.equal(canSuspend(admin, creator), true));
test("admin cannot suspend themselves or another admin", () => { assert.equal(canSuspend(admin, admin), false); assert.equal(canSuspend(admin, admin2), false); });
test("creator cannot suspend anyone", () => assert.equal(canSuspend(creator, { id: "d", role: "reader" }), false));
test("suspended admin has no moderation power", () => assert.equal(canSuspend({ ...admin, status: "suspended" }, creator), false));
test("social links parse", () => assert.deepEqual(parseSocialLinks("Site | https://example.com").links, [{ label: "Site", href: "https://example.com/" }]));
test("non-https and javascript links are rejected", () => {
  assert.ok(parseSocialLinks("Site | http://example.com").error);
  assert.ok(parseSocialLinks("X | javascript:alert(1)").error);
});
test("malformed lines and more than 5 links are rejected", () => {
  assert.ok(parseSocialLinks("no separator").error);
  assert.ok(parseSocialLinks(Array.from({ length: 6 }, (_, i) => `L${i} | https://e.com/${i}`).join("\n")).error);
});
