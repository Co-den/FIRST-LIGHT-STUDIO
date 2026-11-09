import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Fixed-window limiter stored in Postgres. Fails open (and logs) if the database call itself errors. */
export async function rateLimit(key, limit, windowSecs) {
  try {
    const res = await db.execute(sql`
      insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
      on conflict (key) do update set
        count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSecs}) then 1 else rate_limits.count + 1 end,
        window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSecs}) then now() else rate_limits.window_start end
      returning count`);
    const rows = res.rows ?? res;
    return { ok: Number(rows[0]?.count) <= limit };
  } catch (e) {
    console.error("rateLimit failed", e);
    return { ok: true };
  }
}
