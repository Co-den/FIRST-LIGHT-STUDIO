import Link from "next/link";
import Hero from "@/components/Hero";
import ComicCard from "@/components/ComicCard";
import { listPublic } from "@/lib/catalog";
import { capabilities, site } from "@/data/site";

export const dynamic = "force-dynamic";

function Section({ title, eyebrow, href, items, tone = "" }) {
  if (!items.length) return null; // dynamic sections appear only when real content exists
  return (
    <section className={`px-5 py-20 lg:px-8 ${tone}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2></div>
          {href && <Link href={href} className="text-xs uppercase tracking-[0.2em] text-mist hover:text-sun">View all</Link>}
        </div>
        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{items.map((i) => <li key={i.s.id}><ComicCard item={i} /></li>)}</ul>
      </div>
    </section>
  );
}

export default async function Home() {
  const safe = (p) => p.catch((e) => { console.error("home query failed", e); return []; });
  const [featured, latest, originals, indie] = await Promise.all([
    safe(listPublic({ featured: true, limit: 4 })), safe(listPublic({ limit: 8 })),
    safe(listPublic({ kind: "official", limit: 4 })), safe(listPublic({ kind: "independent", limit: 4 })),
  ]);
  return (
    <>
      <Hero image={site.heroImage} />
      <Section eyebrow="Selected" title="Featured comics" href="/comics" items={featured} />
      <Section eyebrow="Just released" title="Latest updates" href="/comics" items={latest} tone="bg-midnight" />
      <Section eyebrow="From the studio" title="First Light Studio originals" href="/comics?by=official" items={originals} />
      <Section eyebrow="Community" title="Independent creators" href="/creators" items={indie} tone="bg-midnight" />
      <section className="px-5 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">For artists and writers</p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Publish your own comic here.</h2>
          <p className="mt-5 text-mist">Create a creator profile, prepare drafts and upload your pages. Publishing to readers needs an active creator subscription, and you keep ownership of your work.</p>
          <Link href="/creator" className="btn btn-primary mt-9">Start publishing</Link>
        </div>
      </section>
      <section className="border-t border-line bg-midnight px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The studio</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Stories, characters and worlds, built to last.</h2>
            <p className="mt-5 max-w-lg text-mist">First Light Studio develops original intellectual properties across comics, animation and merchandise, and runs a publishing platform for independent creators.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Link href="/about" className="btn">About the studio</Link><Link href="/contact" className="btn">Contact</Link></div>
            {site.contactEmail && <p className="mt-6 text-sm text-mist">Email: <a href={`mailto:${site.contactEmail}`} className="text-sun underline">{site.contactEmail}</a></p>}
          </div>
          <ul className="divide-y divide-line border-y border-line">{capabilities.map((c) => <li key={c} className="py-3.5 text-lg">{c}</li>)}</ul>
        </div>
      </section>
    </>
  );
}
