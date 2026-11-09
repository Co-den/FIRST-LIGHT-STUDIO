import ComicCard from "@/components/ComicCard";
import PageHeader from "@/components/PageHeader";
import { listPublic } from "@/lib/catalog";
import { inputCls } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comics", description: "Read comics and webtoons from FIRST LIGHT STUDIO and independent creators." };

export default async function Comics({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || "").trim().slice(0, 80);
  const by = sp.by === "official" || sp.by === "independent" ? sp.by : "";
  const sort = sp.sort === "title" ? "title" : "latest";
  let items = [], failed = false;
  try { items = await listPublic({ q, kind: by || undefined, sort }); } catch (e) { console.error("comics query failed", e); failed = true; }
  return (
    <>
      <PageHeader title="Comics" intro="Studio originals and independent creators. Search, filter and read." />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <form role="search" className="mb-10 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <label className="sr-only" htmlFor="q">Search titles</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search titles" className={`${inputCls} !mt-0`} />
          <label className="sr-only" htmlFor="by">Publisher</label>
          <select id="by" name="by" defaultValue={by} className={`${inputCls} !mt-0`}><option value="">All publishers</option><option value="official">Studio originals</option><option value="independent">Independent creators</option></select>
          <label className="sr-only" htmlFor="sort">Sort</label>
          <select id="sort" name="sort" defaultValue={sort} className={`${inputCls} !mt-0`}><option value="latest">Latest updates</option><option value="title">Title A to Z</option></select>
          <button className="btn btn-primary">Apply</button>
        </form>
        {failed ? <p role="alert" className="text-red-300">Comics could not be loaded right now. Please try again shortly.</p>
          : items.length === 0 ? <p className="text-mist">{q || by ? "No comics match those filters." : "No comics have been published yet."}</p>
          : <ul className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{items.map((i, n) => <li key={i.s.id}><ComicCard item={i} priority={n < 4} /></li>)}</ul>}
      </div>
    </>
  );
}
