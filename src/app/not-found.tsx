import Link from 'next/link';
import { Home, Clapperboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <Clapperboard className="mx-auto h-14 w-14 text-brand-400/50" />
        <h1 className="mt-6 font-display text-6xl font-extrabold tracking-tight">
          <span className="text-brand-gradient">404</span>
        </h1>
        <p className="mt-4 font-display text-xl font-bold text-white">
          Esta escena no existe
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
          La página que buscas se movió o nunca estuvo aquí. Vuelve al catálogo y sigue explorando.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary"><Home className="h-4 w-4" /> Ir al inicio</Link>
          <Link href="/servicios" className="btn-ghost">Ver servicios</Link>
        </div>
      </div>
    </div>
  );
}
