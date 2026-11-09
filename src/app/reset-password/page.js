import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { performReset } from "@/lib/password-reset";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/ratelimit-utils";
import { inputCls, primaryBtn } from "@/lib/ui";

export const metadata = { title: "Reset password", robots: { index: false } };
export default async function Reset({ searchParams }) {
  const { token = "", error } = await searchParams;
  async function action(fd) {
    "use server";
    const t = String(fd.get("token") || "");
    const back = (m) => redirect(`/reset-password?token=${encodeURIComponent(t)}&error=${encodeURIComponent(m)}`);
    if (!(await rateLimit(`reset-submit:${clientIp(await headers())}`, 20, 3600)).ok) back("Too many attempts. Try again later.");
    const r = await performReset(t, String(fd.get("password") || ""));
    if (r.error) back(r.error);
    redirect("/login?reset=1");
  }
  return (
    <section className="mx-auto max-w-md px-5 pb-24 pt-36">
      <h1 className="font-display text-5xl">Choose a new password</h1>
      {!token ? <p className="mt-6">This link is missing its token. <Link href="/forgot-password" className="text-sun underline">Request a new one</Link>.</p> : (
        <form action={action} className="mt-8 grid gap-5">
          {error && <p role="alert" className="text-red-300">{error}</p>}
          <input type="hidden" name="token" value={token} />
          <label className="font-head font-bold">New password (10+ characters)<input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputCls} /></label>
          <button className={`${primaryBtn} justify-self-start`}>Update password</button>
        </form>
      )}
    </section>
  );
}
