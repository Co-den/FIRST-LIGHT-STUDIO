import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/ratelimit-utils";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export const metadata = { title: "Register" };
const msgs = { invalid: "Enter a valid email and a password of at least 10 characters.", exists: "That email is already registered.", rate: "Too many sign-ups from this network. Try again later." };

export default async function Register({ searchParams }) {
  const { error } = await searchParams;
  async function action(fd) {
    "use server";
    if (!(await rateLimit(`register:ip:${clientIp(await headers())}`, 10, 3600)).ok) redirect("/register?error=rate");
    const email = String(fd.get("email") || "").trim().toLowerCase();
    const password = String(fd.get("password") || "");
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10 || password.length > 200) redirect("/register?error=invalid");
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) redirect("/register?error=exists");
    // Always a plain reader. Roles are never accepted from the form.
    await db.insert(users).values({ email, name: String(fd.get("name") || "").trim().slice(0, 80) || null, passwordHash: await bcrypt.hash(password, 12) });
    await signIn("credentials", { email, password, redirectTo: "/" });
  }
  return (
    <section className="mx-auto max-w-md px-5 pb-24 pt-36">
      <h1 className="font-display text-5xl">Register</h1>
      {error && <p role="alert" className="mt-4 text-red-300">{msgs[error] || "Something went wrong."}</p>}
      <form action={action} className="mt-8 grid gap-5">
        <label className="font-head font-bold">Name<input name="name" autoComplete="name" className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
        <label className="font-head font-bold">Email<input name="email" type="email" required autoComplete="email" className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
        <label className="font-head font-bold">Password (10+ characters)<input name="password" type="password" required minLength={10} autoComplete="new-password" className="mt-2 w-full border border-white/25 bg-midnight px-4 py-3 font-body font-normal" /></label>
        <button className="rounded-sm bg-sun px-6 py-3 font-head font-bold text-night">Create account</button>
      </form>
      <p className="mt-6 text-mist">Already registered? <Link href="/login" className="text-sun underline">Sign in</Link></p>
    </section>
  );
}
