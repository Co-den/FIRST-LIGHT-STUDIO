import Link from "next/link";
export default function NotFound() {
  return (<section className="px-5 py-40 text-center"><h1 className="font-display text-6xl">Page not found</h1><p className="mt-4 text-mist">That page does not exist.</p><Link href="/" className="mt-8 inline-block text-sun underline">Back to home</Link></section>);
}
