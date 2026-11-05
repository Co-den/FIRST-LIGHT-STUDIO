"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { nav } from "@/data/site";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]); // close after navigation
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""; // lock scroll
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors ${solid || open ? "bg-night/95 backdrop-blur" : "bg-transparent"}`}>
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="FIRST LIGHT STUDIO home"><Logo /></Link>
        <ul className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={pathname === n.href ? "page" : undefined}
                className={`font-head text-sm font-bold transition-colors hover:text-sun ${pathname === n.href ? "text-sun" : "text-white"}`}>
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact" className="rounded-sm bg-sun px-5 py-2.5 font-head text-sm font-bold text-night transition hover:bg-white active:scale-95">Contact</Link>
          </li>
        </ul>
        <button className="p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="h-[calc(100dvh-5rem)] overflow-y-auto bg-night px-5 pb-10 lg:hidden">
            <ul className="flex flex-col">
              {[...nav, { label: "Contact", href: "/contact" }].map((n) => (
                <li key={n.href} className="border-b border-white/10">
                  <Link href={n.href} className="block py-5 font-display text-4xl tracking-wide hover:text-sun">{n.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
