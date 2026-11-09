import { verifyPaystackSignature } from "@/lib/billing-utils";
import { handlePaystackEvent } from "@/lib/billing";

export async function POST(req) {
  const raw = await req.text();
  if (!verifyPaystackSignature(raw, req.headers.get("x-paystack-signature"), process.env.PAYSTACK_SECRET_KEY)) {
    return new Response("Invalid signature", { status: 401 });
  }
  let evt;
  try { evt = JSON.parse(raw); } catch { return new Response("Bad request", { status: 400 }); }
  try { await handlePaystackEvent(evt); } catch (e) { console.error("webhook failed", e); return new Response("Error", { status: 500 }); } // 500 makes Paystack retry
  return new Response("ok");
}
