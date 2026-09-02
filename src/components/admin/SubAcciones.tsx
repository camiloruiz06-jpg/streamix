'use client';

import { useActionState, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeftRight, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { renovarSuscripcion, moverSuscripcion, type EstadoAccion } from '@/lib/actions';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AccountSlotRow, SubscriptionRow } from '@/lib/types';

const vacio: EstadoAccion = {};

const METODOS = [
  ['llaves', 'Llaves (Bre-B)'], ['nequi', 'Nequi'], ['bancolombia', 'Bancolombia'],
  ['paypal', 'PayPal'], ['transferencia', 'Transferencia'], ['efectivo', 'Efectivo'], ['otro', 'Otro'],
] as const;

function Modal({ abierto, cerrar, titulo, descripcion, children }: {
  abierto: boolean; cerrar: () => void; titulo: string; descripcion?: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && cerrar();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [abierto, cerrar]);

  // Pegado al <body>: si no, el panel con backdrop-blur lo recorta.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={cerrar} className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/12 bg-ink-900 shadow-glow-lg sm:inset-y-0 sm:my-auto sm:h-fit sm:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-ink-900/95 px-5 py-4 backdrop-blur">
              <div>
                <h2 className="font-display text-lg font-bold text-white">{titulo}</h2>
                {descripcion && <p className="mt-0.5 text-xs text-white/45">{descripcion}</p>}
              </div>
              <button type="button" onClick={cerrar} aria-label="Cerrar"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Aviso({ estado }: { estado: EstadoAccion }) {
  return (
    <AnimatePresence>
      {estado.error && (
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{estado.error}
        </motion.p>
      )}
      {estado.ok && (
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-200">
          <Check className="h-4 w-4 shrink-0" />{estado.mensaje}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------- renovar --- */

export function BotonRenovar({ sub, cuentas }: { sub: SubscriptionRow; cuentas: AccountSlotRow[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [estado, enviar, pendiente] = useActionState(renovarSuscripcion, vacio);
  const [dias, setDias] = useState(sub.duracion_dias ?? 30);

  useEffect(() => {
    if (!estado.ok) return;
    const t = setTimeout(() => { setAbierto(false); router.refresh(); }, 900);
    return () => clearTimeout(t);
  }, [estado.ok, router]);

  const restantes = Math.max(0, sub.dias_restantes ?? 0);
  const nuevaFecha = (() => {
    const base = new Date();
    base.setDate(base.getDate() + restantes + dias);
    return base.toISOString().slice(0, 10);
  })();

  // Cuentas del mismo servicio con plaza libre, o la que ya está usando
  const opciones = cuentas.filter(
    (c) => c.service_id === sub.service_id && (c.plazas_libres > 0 || c.account_id === sub.account_id),
  );

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className="btn-primary btn-sm">
        <RefreshCw className="h-3.5 w-3.5" /> Renovar
      </button>

      <Modal
        abierto={abierto} cerrar={() => setAbierto(false)}
        titulo={`Renovar a ${sub.cliente ?? 'el cliente'}`}
        descripcion={`${sub.servicio ?? ''} · hoy vence el ${sub.fecha_fin}`}
      >
        <form action={enviar}>
          <input type="hidden" name="subscription_id" value={sub.subscription_id} />

          {restantes > 0 && (
            <p className="mb-4 rounded-xl border border-brand-400/25 bg-brand-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-brand-100">
              Todavía le quedan <strong>{restantes} días</strong>. Los días nuevos se suman encima,
              no los pierde.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor={`r-dias-${sub.subscription_id}`}>Días a agregar</label>
              <input
                id={`r-dias-${sub.subscription_id}`} name="dias" type="number" min={1} required
                className="field" value={dias}
                onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))}
              />
              <p className="mt-1.5 text-xs text-white/35">Quedaría hasta el {nuevaFecha}.</p>
            </div>
            <div>
              <label className="label" htmlFor={`r-precio-${sub.subscription_id}`}>Precio cobrado</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">$</span>
                <input
                  id={`r-precio-${sub.subscription_id}`} name="precio" type="number" min={0} required
                  className="field pl-7" defaultValue={sub.precio || ''}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor={`r-metodo-${sub.subscription_id}`}>Método de pago</label>
              <select id={`r-metodo-${sub.subscription_id}`} name="metodo_pago" className="field cursor-pointer" defaultValue="llaves">
                {METODOS.map(([v, l]) => <option key={v} value={v} className="bg-ink-900">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor={`r-cuenta-${sub.subscription_id}`}>Cuenta</label>
              <select
                id={`r-cuenta-${sub.subscription_id}`} name="account_id"
                className="field cursor-pointer" defaultValue={sub.account_id ?? ''}
              >
                <option value="" className="bg-ink-900">— dejar la misma —</option>
                {opciones.map((c) => (
                  <option key={c.account_id} value={c.account_id} className="bg-ink-900">
                    {c.credencial_usuario ?? 'cuenta'} · {c.plazas_libres} libres
                    {c.dias_cuenta !== null ? ` · ${c.dias_cuenta} d.` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Aviso estado={estado} />

          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setAbierto(false)} className="btn-ghost btn-sm flex-1 sm:flex-none">
              Cancelar
            </button>
            <button type="submit" disabled={pendiente} className="btn-primary btn-sm flex-1 justify-center">
              {pendiente ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Renovando…</> : 'Renovar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------- cambiar cuenta --- */

export function BotonCambiarCuenta({
  sub, cuentas, resaltado = false,
}: { sub: SubscriptionRow; cuentas: AccountSlotRow[]; resaltado?: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [estado, enviar, pendiente] = useActionState(moverSuscripcion, vacio);

  useEffect(() => {
    if (!estado.ok) return;
    const t = setTimeout(() => { setAbierto(false); router.refresh(); }, 900);
    return () => clearTimeout(t);
  }, [estado.ok, router]);

  // Solo cuentas con plaza libre del mismo servicio, y que le alcancen los días
  const opciones = cuentas
    .filter((c) => c.service_id === sub.service_id && c.plazas_libres > 0 && c.account_id !== sub.account_id)
    .sort((a, b) => (b.dias_cuenta ?? -999) - (a.dias_cuenta ?? -999));

  return (
    <>
      <button
        type="button" onClick={() => setAbierto(true)}
        title="Pasarlo a otra cuenta conservando sus días"
        className={cn('btn-sm !px-2', resaltado ? 'btn-primary' : 'btn-ghost')}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        {resaltado && <span className="hidden sm:inline">Cambiar</span>}
      </button>

      <Modal
        abierto={abierto} cerrar={() => setAbierto(false)}
        titulo={`Pasar a ${sub.cliente ?? 'el cliente'} a otra cuenta`}
        descripcion="Conserva exactamente los días que le quedan."
      >
        <form action={enviar}>
          <input type="hidden" name="subscription_id" value={sub.subscription_id} />

          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3 text-xs leading-relaxed text-white/60">
            Tiene derecho hasta el <strong className="text-white">{sub.fecha_fin}</strong>
            {sub.dias_restantes !== null && ` (${sub.dias_restantes} días)`}.
            {sub.cuenta_vence && (
              <> La cuenta actual se vence el <strong className="text-white">{sub.cuenta_vence}</strong>.</>
            )}
          </div>

          {opciones.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/12 py-5 text-center text-xs text-white/40">
              No tienes otra cuenta de {sub.servicio} con plazas libres.
              <br />
              Compra una nueva desde <a href="/admin/vender" className="text-brand-300 underline">Nueva venta</a>{' '}
              o regístrala en Cuentas.
            </p>
          ) : (
            <div>
              <label className="label" htmlFor={`m-cuenta-${sub.subscription_id}`}>Nueva cuenta</label>
              <select
                id={`m-cuenta-${sub.subscription_id}`} name="account_id" required
                className="field cursor-pointer" defaultValue={opciones[0].account_id}
              >
                {opciones.map((c) => {
                  const alcanza = c.dias_cuenta !== null && sub.dias_restantes !== null
                    ? c.dias_cuenta >= sub.dias_restantes
                    : true;
                  return (
                    <option key={c.account_id} value={c.account_id} className="bg-ink-900">
                      {c.credencial_usuario ?? 'cuenta'} · {c.plazas_libres} libres ·{' '}
                      {c.dias_cuenta === null ? 'sin fecha' : `${c.dias_cuenta} d.`}
                      {alcanza ? '' : ' ⚠ no le alcanza'}
                      {` · ${formatMoney(c.costo_por_plaza)}/plaza`}
                    </option>
                  );
                })}
              </select>

              <div className="mt-4">
                <label className="label" htmlFor={`m-perfil-${sub.subscription_id}`}>Perfil</label>
                <input
                  id={`m-perfil-${sub.subscription_id}`} name="perfil" className="field"
                  defaultValue={sub.perfil ?? ''} placeholder="Perfil 1"
                />
              </div>
            </div>
          )}

          <Aviso estado={estado} />

          <div className="mt-6 flex gap-2">
            <button type="button" onClick={() => setAbierto(false)} className="btn-ghost btn-sm flex-1 sm:flex-none">
              Cancelar
            </button>
            <button
              type="submit" disabled={pendiente || opciones.length === 0}
              className="btn-primary btn-sm flex-1 justify-center disabled:opacity-40"
            >
              {pendiente ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Moviendo…</> : 'Pasarlo'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
