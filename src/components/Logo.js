// Temporary mark: a light source rising over a horizon. Replace with the approved logo file.
export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg width="34" height="24" viewBox="0 0 44 30" aria-hidden="true" className="text-sun">
        <path d="M6 24a16 16 0 0 1 32 0Z" fill="currentColor" />
        <path d="M0 27h44" stroke="#fff" strokeWidth="2" />
      </svg>
      <span className="leading-none">
        <span className="block text-base font-semibold tracking-[0.24em] text-white">FIRST LIGHT</span>
        <span className="mt-1 block text-[9px] font-medium tracking-[0.55em] text-mist">STUDIO</span>
      </span>
    </span>
  );
}
