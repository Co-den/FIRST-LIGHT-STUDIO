import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { publishers, series } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/permissions";
import { createSeries } from "@/lib/publishing";

export const metadata = { title: "Studio admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");
  const [official] = await db.select().from(publishers).where(eq(publishers.kind, "official")).limit(1);
  const list = official ? await db.select().from(series).where(eq(series.publisherId, official.id)) : [];

  async function create(fd) {
    "use server";
    const u = await getCurrentUser(); // re-checked inside the action
    await createSeries(u, official.id, { title: fd.get("title"), synopsis: fd.get("synopsis"), mode: fd.get("mode") });
    revalidatePath("/admin");
  }
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <h1 className="font-display text-5xl">Studio admin</h1>
      {!official ? <p className="mt-6 text-mist">No official publisher yet. Run npm run db:seed.</p> : (
        <>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sun underline"><Link href="/admin/plans">Plans</Link><Link href="/admin/moderation">Reports</Link><Link href="/admin/catalog">All series</Link><Link href="/admin/creators">Creators</Link><Link href="/admin/finance">Finance</Link><Link href="/admin/usage">Storage</Link><Link href="/admin/audit">Audit log</Link></p>
          <h2 className="mt-10 font-display text-3xl">Official series</h2>
          {list.length === 0 ? <p className="mt-3 text-mist">No series yet.</p> : (
            <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">{list.map((s) => <li key={s.id} className="py-3"><Link href={`/admin/series/${s.id}`} className="text-sun hover:underline">{s.title}</Link> <span className="text-sm text-mist">· {s.status} · {s.mode}</span></li>)}</ul>
          )}
          <form action={create} className="mt-8 grid gap-4">
            <label className="font-head font-bold">Title<input name="title" required className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
            <label className="font-head font-bold">Synopsis<textarea name="synopsis" rows={3} className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
            <label className="font-head font-bold">Reading mode<select name="mode" className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal"><option value="vertical">Vertical scroll</option><option value="paged">Page by page</option></select></label>
            <button className="justify-self-start rounded-sm bg-sun px-6 py-3 font-head font-bold text-night">Create series</button>
          </form>
        </>
      )}
    </section>
  );
}
