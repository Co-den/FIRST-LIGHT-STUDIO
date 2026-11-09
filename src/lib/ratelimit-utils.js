/** First hop of x-forwarded-for (set by the hosting platform), else x-real-ip. */
export function clientIp(h) {
  const xff = h?.get?.("x-forwarded-for");
  return (xff ? xff.split(",")[0].trim() : h?.get?.("x-real-ip")) || "unknown";
}
