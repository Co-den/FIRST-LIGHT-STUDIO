import Link from "next/link";
import Hero from "@/components/Hero";
import { capabilities, projects } from "@/data/site";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" aria-labelledby="worlds-h">
        <h2 id="worlds-h" className="font-display text-5xl tracking-wide sm:text-6xl">Featured worlds</h2>
        <p className="mt-3 max-w-xl text-mist">Demonstration content. Replace with real studio projects in src/data/site.js.</p>
        <ul className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          {projects.map((p) => (
            <li key={p.slug} className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden bg-midnight p-6">
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-midnight to-amber/20 transition-transform duration-500 group-hover:scale-105" />
              <div className="relative">
                <p className="font-head text-xs font-bold text-sun">{p.format} · {p.demo ? "Demo content" : p.status}</p>
                <h3 className="mt-2 font-display text-4xl tracking-wide">{p.title}</h3>
                <p className="mt-2 max-w-md text-sm text-mist">{p.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="bg-midnight py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <h2 className="font-display text-5xl tracking-wide sm:text-6xl">One spark. A whole universe.</h2>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {capabilities.map((c) => <li key={c} className="py-4 font-head text-lg font-bold">{c}</li>)}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-28 text-center">
        <h2 className="font-display text-5xl tracking-wide sm:text-6xl">Readers, artists, publishers, partners.</h2>
        <p className="mx-auto mt-5 max-w-xl text-mist">If you want to build something original with us, start here.</p>
        <Link href="/contact" className="mt-8 inline-block rounded-sm bg-sun px-8 py-4 font-head font-bold text-night transition hover:bg-white active:scale-95">Contact the studio</Link>
      </section>
    </>
  );
}
