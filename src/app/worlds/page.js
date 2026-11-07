import PageHeader from "@/components/PageHeader";
import Filterable from "@/components/Filterable";
import { projects } from "@/data/site";
export const metadata = { title: "Worlds", description: "Original comics, graphic novels and animation from FIRST LIGHT STUDIO." };
export default function Worlds() {
  const items = projects.map((p) => ({ href: `/worlds/${p.slug}`, title: p.title, label: p.format, summary: p.summary, demo: p.demo }));
  return (<><PageHeader title="Worlds" intro="Projects in the studio. Items marked demo content are placeholders." /><Filterable items={items} /></>);
}
