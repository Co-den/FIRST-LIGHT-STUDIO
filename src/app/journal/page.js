import PageHeader from "@/components/PageHeader";
import Filterable from "@/components/Filterable";
import { journal } from "@/data/site";
export const metadata = { title: "Journal", description: "Studio updates, art features and worldbuilding notes." };
export default function Journal() {
  const items = journal.map((a) => ({ href: `/journal/${a.slug}`, title: a.title, label: a.category, summary: a.summary, demo: a.demo }));
  return (<><PageHeader title="Journal" intro="Sample articles are demo content." /><Filterable items={items} empty="No articles yet." /></>);
}
