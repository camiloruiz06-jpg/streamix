/** Capa de fondo cinematográfica: grid tenue, halos y viñeta. */
export function BackgroundFx() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* rejilla */}
      <div
        className="absolute inset-0 bg-grid-faint opacity-[0.55] mask-fade-b"
        style={{ backgroundSize: '64px 64px' }}
      />
      {/* halos */}
      <div className="absolute -left-40 -top-40 h-[46rem] w-[46rem] rounded-full bg-brand-600/20 blur-[130px] animate-pulse-glow" />
      <div className="absolute -right-32 top-20 h-[34rem] w-[34rem] rounded-full bg-fuchsia-600/12 blur-[130px] animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-[140px]" />
      {/* viñeta */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,.55) 100%)' }}
      />
    </div>
  );
}
