import { site, nav } from "@/data/site";
export default function sitemap() {
  if (!site.url) return [];
  return [...nav, { href: "/contact" }].map((n) => ({ url: `${site.url}${n.href}`, lastModified: new Date() }));
}
