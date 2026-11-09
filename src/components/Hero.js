"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// Placeholder composition shown until real artwork is supplied (NEXT_PUBLIC_HERO_IMAGE).
function ForestPlaceholder() {
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1118" /><stop offset="1" stopColor="#10262b" /></linearGradient>
        <radialGradient id="glow" cx="0.3" cy="0.55" r="0.5"><stop offset="0" stopColor="#6fb7b0" stopOpacity="0.28" /><stop offset="1" stopColor="#6fb7b0" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#sky)" />
      <rect width="1200" height="800" fill="url(#glow)" />
      <g fill="#12292f"><rect x="90" width="70" height="800" /><rect x="330" width="46" height="800" /><rect x="520" width="90" height="800" /><rect x="880" width="60" height="800" /></g>
      <g fill="#0a171c"><rect x="20" width="110" height="800" /><rect x="430" width="64" height="800" /><rect x="700" width="130" height="800" /><rect x="1040" width="150" height="800" /></g>
      <g fill="#070e13"><path d="M700 0h300c-40 90-30 150-120 200-60 30-110 20-180 80-30-110-60-180-0-280Z" /><path d="M0 0h260c-20 80-90 110-140 170C70 130 30 90 0 80Z" /><ellipse cx="260" cy="790" rx="360" ry="70" /><ellipse cx="900" cy="800" rx="420" ry="90" /></g>
    </svg>
  );
}

export default function Hero({ image }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const rise = (d) => (reduce ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: d, ease: [0.22, 1, 0.36, 1] } });

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-night px-5 pb-16 pt-28 text-center">
      <motion.div aria-hidden="true" style={{ y }} className="absolute -inset-y-[8%] inset-x-0 -z-20">
        {image ? <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" /> : <ForestPlaceholder />}
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-night/55 via-night/35 to-night" />
      <div className="max-w-3xl">
        <motion.p {...rise(0.1)} className="eyebrow">First Light Studio</motion.p>
        <motion.h1 {...rise(0.25)} className="mt-5 text-5xl sm:text-6xl lg:text-7xl">Every great world begins with a story.</motion.h1>
        <motion.p {...rise(0.45)} className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-white/80">Original comics, graphic novels and animated worlds from an African studio, and a home for independent creators to publish their own.</motion.p>
        <motion.div {...rise(0.65)} className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/comics" className="btn btn-primary">Explore comics</Link>
          <Link href="/about" className="btn">About the studio</Link>
        </motion.div>
      </div>
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-white/60 to-transparent" />
    </section>
  );
}
