import { site } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Isotipo de la marca. Se usa en el navbar, el pie de página, el panel y el
 * login, así que cambiando `public/brand/streamix.png` se actualiza en todos
 * lados a la vez.
 */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('relative grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl opacity-70 blur-lg"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,.55), transparent 70%)' }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/streamix.png"
        alt={site.name}
        width={size}
        height={size}
        className="relative h-full w-full object-contain"
      />
    </span>
  );
}

/** Isotipo + nombre. */
export function BrandLockup({
  size = 36,
  className,
  compact = false,
}: {
  size?: number;
  className?: string;
  compact?: boolean;
}) {
  const [a, b] = site.nameParts;
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={size} className="transition-transform duration-300 group-hover:scale-110" />
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          <span className="text-white">{a}</span>
          <span className="text-brand-gradient">{b}</span>
        </span>
      )}
    </span>
  );
}
