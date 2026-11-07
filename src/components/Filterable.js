"use client";
import Link from "next/link";
import { useState } from "react";

export default function Filterable({ items, empty = "Nothing here yet." }) {
  const cats = ["All", ...new Set(items.map((i) => i.label))];
  const [active, setActive] = useState("All");
  const shown = active === "All" ? items : items.filter((i) => i.label === active);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
      <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setActive(c)} aria-pressed={active === c}
            className={`rounded-sm border px-4 py-2 font-head text-sm font-bold transition ${active === c ? "border-sun bg-sun text-night" : "border-white/30 hover:border-sun"}`}>{c}</button>
        ))}
      </div>
      {shown.length === 0 ? <p className="mt-10 text-mist">{empty}</p> : (
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {shown.map((i, n) => (
            <li key={i.href} className={n % 3 === 0 ? "md:col-span-2" : ""}>
              <Link href={i.href} className="group relative flex min-h-[18rem] flex-col justify-end overflow-hidden bg-midnight p-6 h-full">
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night to-amber/15 transition-transform duration-500 group-hover:scale-105" />
                <span className="relative">
                  <span className="block font-head text-xs font-bold text-sun">{i.label}{i.demo ? " · Demo content" : ""}</span>
                  <span className="mt-2 block font-display text-3xl tracking-wide">{i.title}</span>
                  <span className="mt-2 block text-sm text-mist">{i.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
