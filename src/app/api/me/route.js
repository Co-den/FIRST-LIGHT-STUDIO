import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
/** Minimal, non-sensitive session info for the navigation. No email or id is exposed. */
export async function GET() {
  const u = await getCurrentUser();
  return Response.json({ user: u ? { role: u.role, name: u.name } : null }, { headers: { "Cache-Control": "no-store" } });
}
