import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { services } from "@/data/site";
export const metadata = { title: "Services", description: "Creative capabilities of FIRST LIGHT STUDIO LTD." };
export default function Services() {
  return (
    <>
      <PageHeader title="Services" intro="Capabilities the studio is building toward. Availability is confirmed per inquiry." />
      <ol className="mx-auto max-w-4xl divide-y divide-white/10 border-y border-white/10 px-5">
        {services.map((s) => (
          <li key={s.title} className="grid gap-2 py-6 md:grid-cols-[1fr_1.4fr]">
            <h2 className="font-head text-xl font-bold">{s.title}</h2>
            <p className="text-mist">{s.what} <span className="text-white/80">Suited to: {s.who}</span></p>
          </li>
        ))}
      </ol>
      <p className="py-16 text-center"><Link href="/contact" className="rounded-sm bg-sun px-8 py-4 font-head font-bold text-night hover:bg-white">Start a project inquiry</Link></p>
    </>
  );
}
