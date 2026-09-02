import { Database } from 'lucide-react';

/** Aviso visible solo mientras no estén configuradas las claves de Supabase. */
export function DemoBanner() {
  return (
    <div className="fixed bottom-4 left-4 right-24 z-30 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-100 backdrop-blur-xl sm:right-auto sm:max-w-sm">
      <p className="flex items-start gap-2 text-left">
        <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Modo demostración: estás viendo datos de ejemplo. Configura Supabase en{' '}
          <code className="rounded bg-black/30 px-1">.env.local</code> para usar tu base real.
        </span>
      </p>
    </div>
  );
}
