export default function PageHeader({ title, intro }) {
  return (
    <header className="mx-auto max-w-7xl px-5 pb-12 pt-36 lg:px-8">
      <h1 className="font-display text-6xl tracking-wide sm:text-7xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg text-mist">{intro}</p>}
    </header>
  );
}
