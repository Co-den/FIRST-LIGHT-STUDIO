import PageHeader from "@/components/PageHeader";
export const metadata = { title: "About", description: "About FIRST LIGHT STUDIO LTD, a Nigerian creative studio for original stories." };
const values = ["Original stories first", "African creativity with a global audience", "Craft over shortcuts", "Honest, professional collaboration"];
export default function About() {
  return (
    <>
      <PageHeader title="About the studio" intro="FIRST LIGHT STUDIO LTD is a Nigerian creative studio focused on original comics, graphic novels, animation and intellectual property." />
      <div className="mx-auto grid max-w-4xl gap-12 px-5 pb-24">
        <section><h2 className="font-display text-4xl">Mission</h2><p className="mt-3 text-mist">To develop original stories and characters into properties that can grow across comics, animation, merchandise and other media.</p></section>
        <section><h2 className="font-display text-4xl">Values</h2><ul className="mt-3 grid gap-2 text-mist">{values.map((v) => <li key={v}>{v}</li>)}</ul></section>
        <section><h2 className="font-display text-4xl">Studio timeline</h2><p className="mt-3 text-mist">Milestones will appear here once the studio supplies them.</p></section>
      </div>
    </>
  );
}
