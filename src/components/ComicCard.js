import Image from "next/image";
import Link from "next/link";
import { publisherLabel } from "@/lib/publisher-label";

export default function ComicCard({ item, priority = false }) {
  const { s, p, latest } = item;
  const genre = Array.isArray(s.genres) && s.genres[0];
  const meta = [latest ? `Latest: chapter ${latest}` : null, s.status].filter(Boolean).join(" · ");
  return (
    <Link href={`/comics/${s.slug}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden border border-line bg-forest">
        {s.coverUrl
          ? <Image src={s.coverUrl} alt={`Cover of ${s.title}`} fill priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none" />
          : <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-forest via-midnight to-night" />}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/90 to-transparent" />
        {p.kind === "official" && <span className="absolute left-3 top-3 border border-white/40 bg-night/70 px-2 py-1 text-[10px] uppercase tracking-[0.2em]">Studio original</span>}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug transition-colors group-hover:text-sun">{s.title}</h3>
      <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-mist">{genre ? `${genre} · ` : ""}{publisherLabel(p)}</p>
      {s.synopsis && <p className="mt-2 line-clamp-2 text-sm text-mist">{s.synopsis}</p>}
      {meta && <p className="mt-2 text-xs text-mist">{meta}</p>}
    </Link>
  );
}
