import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Logo del servicio.
 *
 * - Si hay una imagen en `public/logos/<slug>.svg|png|webp|jpg`, la muestra
 *   sobre una placa con el color de la marca.
 * - Si no hay imagen, muestra un monograma elegante con ese mismo color, de
 *   forma que ninguna tarjeta se vea rota ni vacía.
 *
 * Para agregar logos: deja el archivo en `public/logos` con el nombre del slug
 * del servicio y ejecuta `python3 scripts/build-catalog.py`.
 */
export function ServiceLogo({
  nombre,
  logoUrl,
  color = '#a855f7',
  size = 56,
  className,
}: {
  nombre: string;
  logoUrl?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
}) {
  const c = color || '#a855f7';

  const placa = {
    width: size,
    height: size,
    borderColor: `${c}55`,
    background: `radial-gradient(120% 120% at 30% 0%, ${c}55, ${c}18 55%, transparent), rgba(255,255,255,.03)`,
    boxShadow: `0 10px 30px -12px ${c}aa, inset 0 1px 0 rgba(255,255,255,.12)`,
  };

  // Imagen real (png/jpg/webp): ocupa toda la placa, estilo icono de app.
  if (logoUrl && !logoUrl.endsWith('.svg')) {
    return (
      <div
        className={cn('relative shrink-0 overflow-hidden rounded-2xl', className)}
        style={{
          width: size,
          height: size,
          boxShadow: `0 10px 30px -12px ${c}aa, inset 0 0 0 1px rgba(255,255,255,.14)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={nombre}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Icono monocromo (svg): glifo blanco centrado sobre la placa de color.
  if (logoUrl) {
    return (
      <div
        className={cn('relative grid shrink-0 place-items-center rounded-2xl border', className)}
        style={placa}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={nombre}
          width={Math.round(size * 0.52)}
          height={Math.round(size * 0.52)}
          className="object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,.45)]"
          style={{ width: size * 0.52, height: size * 0.52 }}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center rounded-2xl border font-display font-bold tracking-tight text-white',
        className,
      )}
      style={{ ...placa, fontSize: size * 0.34 }}
      aria-hidden
    >
      {initials(nombre)}
    </div>
  );
}
