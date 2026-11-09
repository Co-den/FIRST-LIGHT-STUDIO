import { createHash, randomBytes } from "node:crypto";
export const hashToken = (t) => createHash("sha256").update(String(t)).digest("hex");
export function newToken() { const token = randomBytes(32).toString("hex"); return { token, hash: hashToken(token) }; }
