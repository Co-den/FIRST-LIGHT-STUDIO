/** Parses lines like "Instagram | https://instagram.com/name". https only, max 5. */
export function parseSocialLinks(text) {
  const links = [];
  for (const line of String(text || "").split("\n").map((l) => l.trim()).filter(Boolean)) {
    const [label, url] = line.split("|").map((x) => x?.trim());
    if (!label || label.length > 30 || !url) return { error: `Use "Label | https://link" on each line.` };
    let u;
    try { u = new URL(url); } catch { return { error: `"${url}" is not a valid link.` }; }
    if (u.protocol !== "https:") return { error: "Links must start with https://" };
    links.push({ label, href: u.href });
  }
  return links.length > 5 ? { error: "Add at most 5 links." } : { links };
}
