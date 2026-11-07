import PageHeader from "@/components/PageHeader";
import { characters, projects } from "@/data/site";
export const metadata = { title: "Characters", description: "Character profiles from FIRST LIGHT STUDIO worlds." };
export default function Characters() {
  return (
    <>
      <PageHeader title="Characters" intro="Profiles are demo content until real characters are supplied." />
      <ul className="mx-auto grid max-w-7xl gap-6 px-5 pb-24 md:grid-cols-2 lg:px-8">
        {characters.map((c) => (
          <li key={c.slug} className="border border-white/15 bg-midnight p-6">
            <p className="font-head text-xs font-bold text-sun">{c.role}{c.demo ? " · Demo content" : ""}</p>
            <h2 className="mt-2 font-display text-4xl">{c.name}</h2>
            <p className="mt-3 text-mist">{c.bio}</p>
            <dl className="mt-4 grid gap-1 text-sm">
              <div><dt className="inline font-bold">Origin: </dt><dd className="inline text-mist">{c.origin}</dd></div>
              <div><dt className="inline font-bold">Abilities: </dt><dd className="inline text-mist">{c.abilities.join(", ")}</dd></div>
              <div><dt className="inline font-bold">Affiliation: </dt><dd className="inline text-mist">{c.affiliation}</dd></div>
              <div><dt className="inline font-bold">Universe: </dt><dd className="inline text-mist">{projects.find((p) => p.slug === c.project)?.title}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
