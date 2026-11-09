/** Sends through Resend if configured. Replace this one function to use another provider. */
export async function sendEmail({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV !== "production") { console.log(`[email not configured]\nTo: ${to}\n${subject}\n${text}`); return; }
    throw new Error("Email is not configured.");
  }
  const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, subject, text }) });
  if (!res.ok) throw new Error("Email send failed.");
}
