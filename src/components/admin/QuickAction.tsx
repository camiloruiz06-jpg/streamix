'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { actualizarVencimientos, type EstadoAccion } from '@/lib/actions';

const vacio: EstadoAccion = {};

/** Botón que recalcula los estados de vencimiento según la fecha de hoy. */
export function BotonActualizarVencimientos() {
  const router = useRouter();
  const [estado, ejecutar, pendiente] = useActionState(
    async () => actualizarVencimientos(),
    vacio,
  );

  useEffect(() => {
    if (estado.ok) router.refresh();
  }, [estado.ok, router]);

  return (
    <form action={ejecutar} className="flex items-center gap-3">
      <button type="submit" disabled={pendiente} className="btn-ghost btn-sm">
        {pendiente ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Actualizando…
          </>
        ) : (
          'Actualizar estados'
        )}
      </button>
      {estado.mensaje && <span className="text-xs text-emerald-300">{estado.mensaje}</span>}
      {estado.error && <span className="text-xs text-rose-300">{estado.error}</span>}
    </form>
  );
}
