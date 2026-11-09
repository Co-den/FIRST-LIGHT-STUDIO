import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export const metadata = { title: "Sign in" };
export default async function Login({ searchParams }) {
  const { error, reset } = await searchParams;
  async function action(fd) {
    "use server";
    try { await signIn("credentials", { email: fd.get("email"), password: fd.get("password"), redirectTo: "/admin" }); }
    catch (e) { if (e instanceof AuthError) redirect("/login?error=1"); throw e; }
  }
  return (
    <section className="mx-auto max-w-md px-5 pb-24 pt-36">
      <h1 className="font-display text-5xl">Sign in</h1>
      {reset && <p role="status" className="mt-4 text-sun">Password updated. Sign in with your new password.</p>}
      {error && <p role="alert" className="mt-4 text-red-300">Email or password is incorrect.</p>}
      <form action={action} className="mt-8 grid gap-5">
        <label className="font-head font-bold">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
        <label className="font-head font-bold">Password<input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
        <button className="rounded-sm bg-sun px-6 py-3 font-head font-bold text-night">Sign in</button>
      </form>
      <p className="mt-6 text-mist"><Link href="/forgot-password" className="text-sun underline">Forgot password?</Link></p>
      <p className="mt-2 text-mist">No account? <Link href="/register" className="text-sun underline">Register</Link></p>
    </section>
  );
}
