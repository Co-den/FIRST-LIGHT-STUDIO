import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requestReset } from "@/lib/password-reset";
import { clientIp } from "@/lib/ratelimit-utils";
import { inputCls, primaryBtn } from "@/lib/ui";

export const metadata = { title: "Forgot password" };
export default async function Forgot({ searchParams }) {
  const { sent } = await searchParams;
  async function action(fd) {
    "use server";
    try { await requestReset(fd.get("email"), clientIp(await headers())); } catch (e) { console.error("reset request failed", e.message); }
    redirect("/forgot-password?sent=1"); // same response whether or not the account exists
  }
  return (
    <section className="mx-auto max-w-md px-5 pb-24 pt-36">
      <h1 className="font-display text-5xl">Forgot password</h1>
      {sent ? <p role="status" className="mt-6">If that email has an account, a reset link is on its way. It expires in one hour.</p> : (
        <form action={action} className="mt-8 grid gap-5">
          <label className="font-head font-bold">Email<input name="email" type="email" required autoComplete="email" className={inputCls} /></label>
          <button className={`${primaryBtn} justify-self-start`}>Send reset link</button>
        </form>
      )}
      <p className="mt-6"><Link href="/login" className="text-sun underline">Back to sign in</Link></p>
    </section>
  );
}
