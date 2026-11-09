import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/ratelimit-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c, req) {
        const email = String(c?.email || "").trim().toLowerCase();
        const byIp = await rateLimit(`login:ip:${clientIp(req?.headers)}`, 30, 900), byEmail = await rateLimit(`login:email:${email}`, 8, 900);
        if (!byIp.ok || !byEmail.ok) return null; // throttled attempts fail like a wrong password
        const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!u || !u.passwordHash || u.status !== "active") return null;
        const ok = await bcrypt.compare(String(c.password || ""), u.passwordHash);
        return ok ? { id: u.id, email: u.email, name: u.name } : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) { if (user) token.uid = user.id; return token; },
    session({ session, token }) { session.user.id = token.uid; return session; },
  },
});
