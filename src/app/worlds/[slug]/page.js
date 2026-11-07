import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { projects, characters } from "@/data/site";

export const dynamicParams = false;
export function generateStaticParams() { return projects.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary } : {};
}
export default async function Project({ params }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  const cast = characters.filter((c) => c.project === p.slug);
  const related = projects.filter((x) => x.slug !== p.slug);
  return (
    <>
      <PageHeader title={p.title} intro={`${p.format} · ${p.demo ? "Demo content, not a published property" : p.status}`} />
      <div className="mx-auto max-w-3xl px-5 pb-24">
        <p className="text-lg leading-relaxed">{p.summary}</p>
        <h2 className="mt-12 font-display text-4xl">Main characters</h2>
        {cast.length ? <ul className="mt-4 grid gap-2">{cast.map((c) => <li key={c.slug}><Link className="text-sun hover:underline" href="/characters">{c.name}</Link></li>)}</ul> : <p className="mt-4 text-mist">No characters listed yet.</p>}
        <h2 className="mt-12 font-display text-4xl">Related projects</h2>
        {related.length ? <ul className="mt-4 grid gap-2">{related.map((r) => <li key={r.slug}><Link className="text-sun hover:underline" href={`/worlds/${r.slug}`}>{r.title}</Link></li>)}</ul> : <p className="mt-4 text-mist">None yet.</p>}
      </div>
    </>
  );
}
