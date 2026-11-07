import { site, nav, projects, journal } from "@/data/site";
export default function sitemap() {
  if (!site.url) return [];
  const paths = [...nav.map((n) => n.href), "/contact", ...projects.map((p) => `/worlds/${p.slug}`), ...journal.map((a) => `/journal/${a.slug}`)];
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date() }));
}
