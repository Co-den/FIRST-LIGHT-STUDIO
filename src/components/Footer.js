import Link from "next/link";
import Logo from "./Logo";
import { nav, moreNav, site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">{site.description}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid gap-3 text-sm">
            {[...nav, ...moreNav].map((n) => <li key={n.href}><Link className="text-mist hover:text-sun" href={n.href}>{n.label}</Link></li>)}
          </ul>
        </nav>
        <div className="text-sm text-mist">
          <Link href="/contact" className="font-head font-bold text-sun hover:text-white">Start a conversation</Link>
          <p className="mt-3"><Link href="/creator" className="hover:text-sun">Publish your comic</Link></p>
          <p className="mt-3"><Link href="/library" className="hover:text-sun">My library</Link> · <Link href="/legal" className="hover:text-sun">Legal</Link> · <Link href="/login" className="hover:text-sun">Sign in</Link></p>
          {site.contactEmail && <p className="mt-3"><a href={`mailto:${site.contactEmail}`} className="hover:text-sun">{site.contactEmail}</a></p>}
          {site.socials.length > 0 && (
            <ul className="mt-4 flex gap-4">{site.socials.map((s) => <li key={s.href}><a href={s.href} rel="noopener noreferrer" className="hover:text-sun">{s.label}</a></li>)}</ul>
          )}
        </div>
      </div>
      <p className="border-t border-white/10 px-5 py-6 text-center text-xs text-mist">
        © {new Date().getFullYear()} {site.legalName}. All rights reserved.
      </p>
    </footer>
  );
}
