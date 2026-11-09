import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { listCreators } from "@/lib/catalog";
import { publisherLabel } from "@/lib/publisher-label";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creators", description: "Creators publishing on FIRST LIGHT STUDIO." };

export default async function Creators() {
  let rows = [], failed = false;
  try { rows = await listCreators(); } catch (e) { console.error("creators query failed", e); failed = true; }
  return (
    <>
      <PageHeader title="Creators" intro="Everyone with published work on the platform." />
      <div className="mx-auto max-w-4xl px-5 pb-24">
        {failed ? <p role="alert" className="text-red-300">Creators could not be loaded right now.</p>
          : rows.length === 0 ? <p className="text-mist">No creators have published yet.</p>
          : <ul className="divide-y divide-line border-y border-line">{rows.map(({ p, n }) => (
              <li key={p.id}><Link href={`/creators/${p.slug}`} className="flex flex-wrap items-baseline justify-between gap-2 py-5 hover:text-sun"><span className="text-xl font-semibold">{p.displayName}</span><span className="text-sm text-mist">{publisherLabel(p)} · {n} {n === 1 ? "comic" : "comics"}</span></Link></li>))}</ul>}
        <p className="mt-10 text-mist">Want to publish here? <Link href="/creator" className="text-sun underline">Create a creator profile</Link>.</p>
      </div>
    </>
  );
}
