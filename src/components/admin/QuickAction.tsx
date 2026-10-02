'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  actualizarVencimientos,
  limpiarCuentasMuertas,
  limpiarSuscripcionesVencidas,
  type EstadoAccion,
} from '@/lib/actions';

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

function BotonLimpieza({
  accion,
  etiqueta,
  confirmacion,
  disabled,
}: {
  accion: () => Promise<EstadoAccion>;
  etiqueta: string;
  confirmacion: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState(false);
  const [estado, ejecutar, pendiente] = useActionState(async () => accion(), vacio);

  useEffect(() => {
    if (estado.ok) {
      setConfirmar(false);
      router.refresh();
    }
  }, [estado.ok, router]);

  if (disabled) return null;

  if (!confirmar) {
    return (
      <button type="button" onClick={() => setConfirmar(true)} className="btn-ghost btn-sm">
        {etiqueta}
      </button>
    );
  }

  return (
    <form action={ejecutar} className="flex flex-wrap items-center gap-2">
      <span className="max-w-[220px] text-xs leading-snug text-white/50">{confirmacion}</span>
      <button type="submit" disabled={pendiente} className="btn-ghost btn-sm border-rose-400/40 text-rose-200">
        {pendiente ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Limpiando…
          </>
        ) : (
          'Sí, limpiar'
        )}
      </button>
      <button type="button" onClick={() => setConfirmar(false)} className="text-xs text-white/40 hover:text-white">
        Cancelar
      </button>
      {estado.error && <span className="text-xs text-rose-300">{estado.error}</span>}
    </form>
  );
}

export function BotonLimpiarCuentasMuertas({ cuantas }: { cuantas: number }) {
  return (
    <BotonLimpieza
      accion={() => limpiarCuentasMuertas()}
      etiqueta={`Limpiar ${cuantas} vencida${cuantas === 1 ? '' : 's'}/cancelada${cuantas === 1 ? '' : 's'}`}
      confirmacion="Se quitan del inventario. Las ventas y la ganancia se quedan."
      disabled={cuantas <= 0}
    />
  );
}

export function BotonLimpiarVencimientos({ cuantos }: { cuantos: number }) {
  return (
    <BotonLimpieza
      accion={() => limpiarSuscripcionesVencidas()}
      etiqueta={`Quitar ${cuantos} vencido${cuantos === 1 ? '' : 's'} sin renovar`}
      confirmacion="Salen de esta lista. La venta y la ganancia no se borran."
      disabled={cuantos <= 0}
    />
  );
}
