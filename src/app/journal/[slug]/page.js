import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { journal } from "@/data/site";

export const dynamicParams = false;
export function generateStaticParams() { return journal.map((a) => ({ slug: a.slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = journal.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.summary } : {};
}
export default async function Article({ params }) {
  const { slug } = await params;
  const a = journal.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <>
      <PageHeader title={a.title} intro={`${a.category}${a.demo ? " · Demo content" : ""}`} />
      <article className="mx-auto max-w-2xl px-5 pb-24 text-lg leading-relaxed">{a.body.map((p, i) => <p key={i} className="mb-5">{p}</p>)}</article>
    </>
  );
}
