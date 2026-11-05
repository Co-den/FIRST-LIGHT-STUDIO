import { site } from "@/data/site";
export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, ...(site.url && { sitemap: `${site.url}/sitemap.xml` }) };
}
