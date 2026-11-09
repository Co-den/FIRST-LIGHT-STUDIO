import { site, nav, moreNav, projects, journal } from "@/data/site";
export default function sitemap() {
  if (!site.url) return [];
  const paths = [...[...nav, ...moreNav].map((n) => n.href), ...projects.map((p) => `/worlds/${p.slug}`), ...journal.map((a) => `/journal/${a.slug}`)];
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date() }));
}
