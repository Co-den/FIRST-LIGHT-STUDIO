"use client";
export default function Error({ reset }) {
  return (<section className="px-5 py-40 text-center"><h1 className="font-display text-6xl">Something went wrong</h1><button onClick={reset} className="mt-8 rounded-sm bg-sun px-6 py-3 font-head font-bold text-night">Try again</button></section>);
}
