"use client";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "35%"]);
  const line = (d) => (reduce ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d, ease: "easeOut" } });

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden bg-night pb-20 pt-32">
      {/* Rising sun: art-directed placeholder. Swap for hero artwork at /images/hero/hero.jpg */}
      <motion.div aria-hidden="true" style={{ y: sunY }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%]">
        <div className="absolute left-1/2 top-[18%] aspect-square w-[130vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,184,46,.55)_0%,rgba(201,138,18,.18)_40%,transparent_68%)]" />
        <div className="absolute left-1/2 top-[34%] aspect-square w-[46vmin] -translate-x-1/2 rounded-full bg-sun" />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[34%] bg-night [clip-path:polygon(0_45%,12%_30%,24%_52%,38%_22%,52%_48%,66%_18%,80%_46%,92%_28%,100%_40%,100%_100%,0_100%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8">
        <motion.h1 {...line(0.1)} className="max-w-4xl font-display text-6xl leading-[0.95] tracking-wide sm:text-7xl lg:text-8xl">
          EVERY GREAT WORLD BEGINS WITH A STORY.
        </motion.h1>
        <motion.p {...line(0.35)} className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
          FIRST LIGHT STUDIO creates original stories, compelling characters, comics, and visual worlds.
        </motion.p>
        <motion.div {...line(0.55)} className="mt-9 flex flex-wrap gap-4">
          <Link href="/worlds" className="rounded-sm bg-sun px-7 py-3.5 font-head font-bold text-night transition hover:bg-white active:scale-95">EXPLORE OUR WORLDS</Link>
          <Link href="/about" className="rounded-sm border border-white/60 px-7 py-3.5 font-head font-bold transition hover:border-sun hover:text-sun active:scale-95">ABOUT THE STUDIO</Link>
        </motion.div>
      </div>
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-sun to-transparent" />
    </section>
  );
}
