import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reports, series } from "@/db/schema";
import PageHeader from "@/components/PageHeader";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/ratelimit-utils";
import { getCurrentUser } from "@/lib/session";
import { inputCls, primaryBtn } from "@/lib/ui";

export const metadata = { title: "Copyright takedown request" };
export default async function Takedown({ searchParams }) {
  const { sent, error } = await searchParams;
  async function submit(fd) {
    "use server";
    const fail = (m) => redirect(`/legal/takedown?error=${encodeURIComponent(m)}`);
    if (!(await rateLimit(`takedown:${clientIp(await headers())}`, 5, 3600)).ok) fail("Too many requests. Try again later.");
    const f = Object.fromEntries(["url", "name", "email", "work", "statement"].map((k) => [k, String(fd.get(k) || "").trim()]));
    if (!f.name || !/^\S+@\S+\.\S+$/.test(f.email) || f.work.length < 20 || fd.get("good_faith") !== "on") fail("Complete every field and confirm the statement.");
    const slug = f.url.split("?")[0].split("/").filter(Boolean).at(-1);
    const [s] = slug ? await db.select({ id: series.id }).from(series).where(eq(series.slug, slug)).limit(1) : [];
    if (!s) fail("We could not find that comic. Paste the full page address of the comic.");
    const u = await getCurrentUser();
    await db.insert(reports).values({ kind: "copyright", seriesId: s.id, reporterId: u?.id ?? null, reason: `COPYRIGHT CLAIM\nClaimant: ${f.name} <${f.email.slice(0, 200)}>\nWork claimed: ${f.work.slice(0, 800)}\nClaimant states, in good faith, that the use is not authorized.` });
    redirect("/legal/takedown?sent=1");
  }
  return (
    <>
      <PageHeader title="Copyright takedown request" intro="Reports go to an administrator for review. Content is not removed automatically." />
      <div className="mx-auto max-w-xl px-5 pb-24">
        {sent ? <p role="status" className="text-sun">Your request was received and will be reviewed.</p> : (
          <form action={submit} className="grid gap-4">
            {error && <p role="alert" className="text-red-300">{error}</p>}
            <label className="font-head font-bold">Address of the comic on this site<input name="url" required className={inputCls} /></label>
            <label className="font-head font-bold">Your name<input name="name" required className={inputCls} /></label>
            <label className="font-head font-bold">Your email<input name="email" type="email" required className={inputCls} /></label>
            <label className="font-head font-bold">The original work and why you believe it is infringed<textarea name="work" rows={5} required minLength={20} className={inputCls} /></label>
            <label className="flex gap-3 text-sm"><input type="checkbox" name="good_faith" required /> I state in good faith that this use is not authorized by the rights owner, its agent or the law.</label>
            <button className={`${primaryBtn} justify-self-start`}>Submit request</button>
          </form>
        )}
      </div>
    </>
  );
}
