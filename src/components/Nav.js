"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { nav } from "@/data/site";

const linkCls = "text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:text-sun";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [acct, setAcct] = useState(false);
  const [solid, setSolid] = useState(false);
  const [me, setMe] = useState(undefined);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); setAcct(false); }, [pathname]);
  useEffect(() => {
    let on = true;
    fetch("/api/me", { cache: "no-store" }).then((r) => r.json()).then((d) => on && setMe(d.user)).catch(() => on && setMe(null));
    return () => { on = false; };
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const dash = me?.role === "admin" ? { label: "Studio dashboard", href: "/admin" } : { label: me?.role === "creator" ? "Creator dashboard" : "Publish your comic", href: "/creator" };
  const accountLinks = me ? [dash, { label: "My library", href: "/library" }] : [];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${solid || open ? "border-line bg-night/90 backdrop-blur" : "border-transparent bg-gradient-to-b from-night/70 to-transparent"}`}>
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="FIRST LIGHT STUDIO home"><Logo /></Link>
        <ul className="hidden items-center gap-9 lg:flex">
          {nav.map((n) => (
            <li key={n.href}><Link href={n.href} aria-current={pathname === n.href ? "page" : undefined} className={`${linkCls} ${pathname === n.href ? "text-sun" : "text-white/85"}`}>{n.label}</Link></li>
          ))}
          <li className="relative">
            {me === undefined ? <span className="inline-block w-16" /> : me ? (
              <>
                <button onClick={() => setAcct((v) => !v)} aria-expanded={acct} aria-haspopup="true" className={`${linkCls} text-white/85`}>Account</button>
                {acct && (
                  <ul className="absolute right-0 top-full mt-4 w-52 border border-line bg-night/95 p-2 backdrop-blur">
                    {accountLinks.map((l) => <li key={l.href}><Link href={l.href} className="block px-3 py-2.5 text-sm hover:text-sun">{l.label}</Link></li>)}
                  </ul>
                )}
              </>
            ) : <Link href="/login" className="btn !px-5 !py-2.5">Sign in</Link>}
          </li>
        </ul>
        <button className="p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100dvh-5rem)] overflow-y-auto bg-night px-5 pb-10 lg:hidden">
            <ul className="flex flex-col">
              {[...nav, ...accountLinks, ...(me === null ? [{ label: "Sign in", href: "/login" }] : [])].map((n) => (
                <li key={n.href} className="border-b border-line"><Link href={n.href} className="block py-5 text-2xl font-semibold hover:text-sun">{n.label}</Link></li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
