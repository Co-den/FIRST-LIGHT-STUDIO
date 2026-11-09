import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { series } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { becomeCreator, getOwnPublisher } from "@/lib/creators";
import { getLatestSubscription } from "@/lib/billing";
import { subscriptionIsActive } from "@/lib/permissions";
import { createSeries } from "@/lib/publishing";
import { acceptTerms, hasAcceptedTerms } from "@/lib/terms";
import { POLICY_VERSION, policies } from "@/lib/policies";
import { inputCls, primaryBtn } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creator dashboard", robots: { index: false } };

export default async function Creator() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  const publisher = await getOwnPublisher(user.id);

  if (!publisher) {
    async function join(fd) {
      "use server";
      await becomeCreator(await getCurrentUser(), fd.get("name"));
      revalidatePath("/creator");
    }
    return (
      <section className="mx-auto max-w-xl px-5 pb-24 pt-36">
        <h1 className="font-display text-5xl">Publish your comic</h1>
        <p className="mt-4 text-mist">Create a creator profile to start drafting. Publishing chapters to readers requires an active creator subscription.</p>
        <form action={join} className="mt-8 grid gap-4">
          <label className="font-head font-bold">Creator or pen name<input name="name" required minLength={2} maxLength={60} className={inputCls} /></label>
          <button className={`${primaryBtn} justify-self-start`}>Create creator profile</button>
        </form>
      </section>
    );
  }

  const sub = await getLatestSubscription(publisher.id);
  const active = subscriptionIsActive(sub);
  const accepted = await hasAcceptedTerms(user.id);
  const list = await db.select().from(series).where(eq(series.publisherId, publisher.id));
  async function accept(fd) {
    "use server";
    await acceptTerms(await getCurrentUser(), fd.get("own") === "on", fd.get("terms") === "on");
    revalidatePath("/creator");
  }
  async function create(fd) {
    "use server";
    const u = await getCurrentUser();
    await createSeries(u, (await getOwnPublisher(u.id)).id, { title: fd.get("title"), synopsis: fd.get("synopsis"), mode: fd.get("mode") });
    revalidatePath("/creator");
  }
  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-36">
      <h1 className="font-display text-5xl">{publisher.displayName}</h1>
      {!accepted && (
        <form action={accept} className="mt-6 grid gap-3 border border-sun/50 p-4">
          <p className="font-head font-bold">Before you can publish</p>
          <label className="flex gap-3 text-sm"><input type="checkbox" name="own" required /> I confirm that I own, or am authorized to publish, all content I submit.</label>
          <label className="flex gap-3 text-sm"><input type="checkbox" name="terms" required /> I accept the <Link href="/legal/creator-terms" className="text-sun underline">Creator Terms</Link>, <Link href="/legal/content-policy" className="text-sun underline">Content Policy</Link> and <Link href="/legal/ip-policy" className="text-sun underline">IP Policy</Link> (version {POLICY_VERSION}).</label>
          <button className={`${primaryBtn} justify-self-start`}>Confirm and accept</button>
        </form>
      )}
      <div className={`mt-6 border p-4 ${active ? "border-sun/50" : "border-red-300/50"}`}>
        {active ? <p>Subscription active until {new Date(sub.currentPeriodEnd).toLocaleDateString("en-NG")}.</p>
          : <p>Publishing is unavailable without an active subscription. Your drafts and any published chapters are safe.</p>}
        <Link href="/creator/profile" className="mt-2 mr-5 inline-block text-sun underline">Edit profile</Link>
        <Link href="/creator/billing" className="mt-2 inline-block text-sun underline">{active ? "Manage billing" : "Subscribe or renew"}</Link>
      </div>
      <h2 className="mt-10 font-display text-3xl">Your series</h2>
      {list.length === 0 ? <p className="mt-3 text-mist">No series yet.</p> : (
        <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">{list.map((s) => <li key={s.id} className="py-3"><Link href={`/creator/series/${s.id}`} className="text-sun hover:underline">{s.title}</Link> <span className="text-sm text-mist">· {s.status}</span></li>)}</ul>
      )}
      <form action={create} className="mt-8 grid gap-4">
        <label className="font-head font-bold">Title<input name="title" required className={inputCls} /></label>
        <label className="font-head font-bold">Synopsis<textarea name="synopsis" rows={3} className={inputCls} /></label>
        <label className="font-head font-bold">Reading mode<select name="mode" className={inputCls}><option value="vertical">Vertical scroll</option><option value="paged">Page by page</option></select></label>
        <button className={`${primaryBtn} justify-self-start`}>Create series</button>
      </form>
    </section>
  );
}
