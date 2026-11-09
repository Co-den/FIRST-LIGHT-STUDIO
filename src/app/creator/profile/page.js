import Link from "next/link";
import ImageField from "@/components/ImageField";
import { saveProfileImage } from "@/app/media-actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { getOwnPublisher, updateProfile } from "@/lib/creators";
import { inputCls, primaryBtn } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creator profile", robots: { index: false } };

export default async function Profile({ searchParams }) {
  const { saved, error } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const p = await getOwnPublisher(user.id);
  if (!p) redirect("/creator");
  async function save(fd) {
    "use server";
    const r = await updateProfile(await getCurrentUser(), { bio: fd.get("bio"), links: fd.get("links") });
    revalidatePath(`/creators/${p.slug}`);
    redirect(r.error ? `/creator/profile?error=${encodeURIComponent(r.error)}` : "/creator/profile?saved=1");
  }
  const links = (p.socialLinks || []).map((l) => `${l.label} | ${l.href}`).join("\n");
  return (
    <section className="mx-auto max-w-xl px-5 pb-24 pt-36">
      <Link href="/creator" className="text-sm text-sun">Back to dashboard</Link>
      <h1 className="mt-2 font-display text-5xl">Profile</h1>
      <p className="mt-2 text-sm text-mist">Public page: <Link className="text-sun underline" href={`/creators/${p.slug}`}>/creators/{p.slug}</Link></p>
      {saved && <p role="status" className="mt-4 text-sun">Profile saved.</p>}
      {error && <p role="alert" className="mt-4 text-red-300">{error}</p>}
      <ImageField label="Profile picture" publisherId={p.id} current={p.avatarUrl} action={saveProfileImage.bind(null, "avatar")} w={96} h={96} />
      <ImageField label="Banner" publisherId={p.id} current={p.bannerUrl} action={saveProfileImage.bind(null, "banner")} w={240} h={60} />
      <form action={save} className="mt-8 grid gap-4">
        <label className="font-head font-bold">Bio (max 500 characters)<textarea name="bio" rows={5} maxLength={500} defaultValue={p.bio || ""} className={inputCls} /></label>
        <label className="font-head font-bold">Links, one per line as Label | https://link (max 5)<textarea name="links" rows={4} defaultValue={links} className={inputCls} /></label>
        <button className={`${primaryBtn} justify-self-start`}>Save profile</button>
      </form>
    </section>
  );
}
