import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { POLICY_VERSION, policies } from "@/lib/policies";

export function generateStaticParams() { return Object.keys(policies).map((doc) => ({ doc })); }
export async function generateMetadata({ params }) { const p = policies[(await params).doc]; return p ? { title: p.title } : {}; }
export default async function Legal({ params }) {
  const p = policies[(await params).doc];
  if (!p) notFound();
  return (
    <>
      <PageHeader title={p.title} />
      <article className="mx-auto max-w-2xl px-5 pb-24">
        <p role="note" className="border border-sun/50 p-3 text-sm">Draft {POLICY_VERSION}. Not final legal terms until reviewed and approved by FIRST LIGHT STUDIO LTD.</p>
        {p.body.map((t, i) => <p key={i} className="mt-5 leading-relaxed">{t}</p>)}
        <p className="mt-10"><Link href="/legal" className="text-sun underline">All policies</Link></p>
      </article>
    </>
  );
}
