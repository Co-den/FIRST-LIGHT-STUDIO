import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { policies } from "@/lib/policies";
export const metadata = { title: "Legal" };
export default function LegalIndex() {
  return (
    <>
      <PageHeader title="Legal" intro="Draft policies pending approval by the platform owner." />
      <ul className="mx-auto max-w-2xl divide-y divide-white/10 border-y border-white/10 px-5">
        {Object.entries(policies).map(([k, p]) => <li key={k}><Link href={`/legal/${k}`} className="block py-4 hover:text-sun">{p.title}</Link></li>)}
        <li><Link href="/legal/takedown" className="block py-4 hover:text-sun">Copyright infringement and takedown requests</Link></li>
      </ul>
    </>
  );
}
