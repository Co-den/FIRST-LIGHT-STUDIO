// Temporary SVG logo concept: sun rising over a horizon. Replace with the approved file.
export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg width="44" height="30" viewBox="0 0 44 30" aria-hidden="true">
        <path d="M6 24a16 16 0 0 1 32 0Z" fill="#f5b82e" />
        <path d="M22 1v5M7 7l3 3.5M37 7l-3 3.5M1 17h5M38 17h5" stroke="#f5b82e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M0 27h44" stroke="#fff" strokeWidth="2.5" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-2xl tracking-wide text-white">FIRST LIGHT</span>
        <span className="block font-head text-[10px] font-bold tracking-[0.35em] text-sun">STUDIO</span>
      </span>
    </span>
  );
}
