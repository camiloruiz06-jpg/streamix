'use client';

import { useActionState, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
import { guardarRegistro, borrarRegistro, venderCuenta, type EstadoAccion } from '@/lib/actions';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------- tipos ---- */

export type TipoCampo = 'texto' | 'numero' | 'fecha' | 'select' | 'textarea' | 'switch' | 'tel' | 'email';

export interface Campo {
  name: string;
  label: string;
  tipo?: TipoCampo;
  requerido?: boolean;
  placeholder?: string;
  ayuda?: string;
  opciones?: { value: string; label: string }[];
  valor?: string | number | boolean | null;
  /** Ocupa toda la fila en vez de media */
  ancho?: 'full' | 'half';
  /** Solo para 'numero': prefijo visual */
  prefijo?: string;
}

const vacio: EstadoAccion = {};

/* ------------------------------------------------------------ un campo -- */

function CampoForm({ campo }: { campo: Campo }) {
  const tipo = campo.tipo ?? 'texto';
  const id = `campo-${campo.name}`;

  if (tipo === 'switch') {
    return (
      <div className={cn('flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5', campo.ancho === 'half' ? 'sm:col-span-1' : 'sm:col-span-2')}>
        {/* marca que este campo es una casilla, para leerlo bien en el servidor */}
        <input type="hidden" name={`__bool_${campo.name}`} value="1" />
        <input
          id={id}
          name={campo.name}
          type="checkbox"
          defaultChecked={Boolean(campo.valor)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#a855f7]"
        />
        <label htmlFor={id} className="cursor-pointer text-sm text-white/80">
          {campo.label}
          {campo.ayuda && <span className="mt-0.5 block text-xs text-white/40">{campo.ayuda}</span>}
        </label>
      </div>
    );
  }

  return (
    <div className={campo.ancho === 'full' ? 'sm:col-span-2' : 'sm:col-span-1'}>
      <label htmlFor={id} className="label">
        {campo.label}
        {campo.requerido && <span className="ml-1 text-brand-400">*</span>}
      </label>

      {tipo === 'select' ? (
        <select
          id={id}
          name={campo.name}
          defaultValue={campo.valor != null ? String(campo.valor) : ''}
          required={campo.requerido}
          className="field cursor-pointer"
        >
          <option value="" className="bg-ink-900">
            {campo.placeholder ?? '— elegir —'}
          </option>
          {campo.opciones?.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-900">
              {o.label}
            </option>
          ))}
        </select>
      ) : tipo === 'textarea' ? (
        <textarea
          id={id}
          name={campo.name}
          rows={3}
          defaultValue={campo.valor != null ? String(campo.valor) : ''}
          placeholder={campo.placeholder}
          required={campo.requerido}
          className="field resize-y"
        />
      ) : (
        <div className="relative">
          {campo.prefijo && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">
              {campo.prefijo}
            </span>
          )}
          <input
            id={id}
            name={campo.name}
            type={tipo === 'numero' ? 'number' : tipo === 'fecha' ? 'date' : tipo === 'email' ? 'email' : tipo === 'tel' ? 'tel' : 'text'}
            inputMode={tipo === 'numero' ? 'numeric' : undefined}
            step={tipo === 'numero' ? '1' : undefined}
            min={tipo === 'numero' ? '0' : undefined}
            defaultValue={campo.valor != null ? String(campo.valor) : ''}
            placeholder={campo.placeholder}
            required={campo.requerido}
            className={cn('field', campo.prefijo && 'pl-7')}
          />
        </div>
      )}

      {campo.ayuda && <p className="mt-1.5 text-xs text-white/35">{campo.ayuda}</p>}
    </div>
  );
}

/* --------------------------------------------------------- el formulario */

export function RecordForm({
  tabla,
  id,
  campos,
  titulo,
  descripcion,
  botonLabel,
  botonClase = 'btn-primary btn-sm',
  botonIcono,
  accion = 'guardar',
  permiteBorrar = false,
}: {
  tabla: string;
  id?: string;
  campos: Campo[];
  titulo: string;
  descripcion?: string;
  botonLabel: string;
  botonClase?: string;
  botonIcono?: React.ReactNode;
  /** 'guardar' usa la tabla; 'vender' entrega la cuenta y registra la venta */
  accion?: 'guardar' | 'vender';
  permiteBorrar?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const router = useRouter();

  // El modal se dibuja pegado al <body>. Si no, cualquier contenedor con
  // backdrop-blur o transform lo atrapa adentro y sale recortado.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const fn = accion === 'vender' ? venderCuenta : guardarRegistro;
  const [estado, enviar, pendiente] = useActionState(fn, vacio);
  const [estadoBorrado, borrar, borrando] = useActionState(borrarRegistro, vacio);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  // Al terminar bien, cerramos y refrescamos los datos de la página
  useEffect(() => {
    if (estado.ok || estadoBorrado.ok) {
      const t = setTimeout(() => {
        setAbierto(false);
        setConfirmarBorrado(false);
        router.refresh();
      }, 700);
      return () => clearTimeout(t);
    }
  }, [estado.ok, estadoBorrado.ok, router]);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto]);

  const resultado = estado.ok || estado.error ? estado : estadoBorrado;

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={botonClase}>
        {botonIcono}
        {botonLabel}
      </button>

      {montado &&
        createPortal(
        <AnimatePresence>
          {abierto && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAbierto(false)}
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/12 bg-ink-900 shadow-glow-lg sm:inset-y-0 sm:my-auto sm:h-fit sm:rounded-3xl"
              >
                {/* encabezado */}
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-ink-900/95 px-5 py-4 backdrop-blur sm:px-6">
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">{titulo}</h2>
                    {descripcion && <p className="mt-0.5 text-xs text-white/45">{descripcion}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAbierto(false)}
                    aria-label="Cerrar"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form action={enviar} className="px-5 py-5 sm:px-6">
                  <input type="hidden" name="__tabla" value={tabla} />
                  {id && <input type="hidden" name="__id" value={id} />}

                  <div className="grid gap-4 sm:grid-cols-2">
                    {campos.map((c) => (
                      <CampoForm key={c.name} campo={c} />
                    ))}
                  </div>

                  <AnimatePresence>
                    {resultado.error && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {resultado.error}
                      </motion.p>
                    )}
                    {resultado.ok && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-200"
                      >
                        <Check className="h-4 w-4 shrink-0" />
                        {resultado.mensaje}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {permiteBorrar && id ? (
                      confirmarBorrado ? (
                        <span className="flex items-center gap-2 text-xs text-white/60">
                          ¿Seguro?
                          <button
                            type="button"
                            disabled={borrando}
                            onClick={() => {
                              const fd = new FormData();
                              fd.set('__tabla', tabla);
                              fd.set('__id', id);
                              borrar(fd);
                            }}
                            className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-2.5 py-1.5 font-semibold text-rose-200 transition hover:bg-rose-500/25"
                          >
                            {borrando ? 'Borrando…' : 'Sí, borrar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmarBorrado(false)}
                            className="rounded-lg px-2 py-1.5 text-white/50 hover:text-white"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmarBorrado(true)}
                          className="text-xs font-medium text-rose-300/70 transition hover:text-rose-200"
                        >
                          Eliminar
                        </button>
                      )
                    ) : (
                      <span />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAbierto(false)}
                        className="btn-ghost btn-sm flex-1 sm:flex-none"
                      >
                        Cancelar
                      </button>
                      <button type="submit" disabled={pendiente} className="btn-primary btn-sm flex-1 sm:flex-none">
                        {pendiente ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando…
                          </>
                        ) : (
                          'Guardar'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
