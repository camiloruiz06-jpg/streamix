'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, AlertTriangle, Check, Loader2, PackageCheck, ShoppingCart,
  Sparkles, TrendingDown, UserPlus, Users, Wallet,
} from 'lucide-react';
import { registrarVenta, type EstadoAccion } from '@/lib/actions';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AccountSlotRow, ProviderOptionRow, Service } from '@/lib/types';

const vacio: EstadoAccion = {};

const METODOS = [
  ['llaves', 'Llaves (Bre-B)'], ['nequi', 'Nequi'], ['bancolombia', 'Bancolombia'],
  ['paypal', 'PayPal'], ['transferencia', 'Transferencia'], ['efectivo', 'Efectivo'], ['otro', 'Otro'],
] as const;

const hoyMas = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};

function Seccion({ n, titulo, hint, children }: {
  n: number; titulo: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-900/50 p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-500/20 font-display text-sm font-bold text-brand-200">
          {n}
        </span>
        <div>
          <h2 className="font-display font-bold text-white">{titulo}</h2>
          {hint && <p className="mt-0.5 text-xs text-white/45">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function NuevaVenta({
  clientes, servicios, cuentas, proveedores,
}: {
  clientes: { id: string; nombre: string; whatsapp: string }[];
  servicios: Service[];
  cuentas: AccountSlotRow[];
  proveedores: ProviderOptionRow[];
}) {
  const router = useRouter();
  const [estado, enviar, pendiente] = useActionState(registrarVenta, vacio);

  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [planId, setPlanId] = useState('');
  const [modo, setModo] = useState<'existente' | 'nueva'>('existente');
  const [accountId, setAccountId] = useState('');
  const [priceId, setPriceId] = useState('');
  const [dias, setDias] = useState(30);
  const [precio, setPrecio] = useState(0);
  const [costo, setCosto] = useState(0);
  const [plazas, setPlazas] = useState(1);

  const servicio = servicios.find((s) => s.id === serviceId);
  const planes = useMemo(
    () => (servicio?.service_plans ?? []).slice().sort((a, b) => a.orden - b.orden),
    [servicio],
  );
  const plan = planes.find((p) => p.id === planId);

  // Cuentas mías con plaza libre para este servicio, la que más días le queden primero
  const disponibles = useMemo(
    () =>
      cuentas
        .filter((c) => c.service_id === serviceId && c.plazas_libres > 0)
        .filter((c) => c.dias_cuenta === null || c.dias_cuenta >= 0)
        .filter((c) => !planId || c.plan_id === planId || c.plan_id === null)
        .sort((a, b) => (b.dias_cuenta ?? -999) - (a.dias_cuenta ?? -999)),
    [cuentas, serviceId, planId],
  );

  // Proveedores para este servicio/plan, el más barato de primero
  const ofertas = useMemo(
    () =>
      proveedores
        .filter((p) => p.service_id === serviceId)
        .filter((p) => !planId || p.plan_id === planId || p.plan_id === null)
        .sort((a, b) => a.costo - b.costo),
    [proveedores, serviceId, planId],
  );

  const oferta = ofertas.find((o) => o.price_id === priceId);

  // Al cambiar de servicio: elegimos plan, y el camino que más le conviene
  useEffect(() => {
    if (!servicio) return;
    const primero = planes[0];
    setPlanId(primero?.id ?? '');
    setAccountId('');
    setPriceId('');
  }, [serviceId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (plan?.duracion_dias) setDias(plan.duracion_dias);
    if (plan?.precio_venta) setPrecio(Number(plan.precio_descuento ?? plan.precio_venta));
  }, [planId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si hay cuenta con plaza libre, ese es el camino por defecto (no gastas nada)
  useEffect(() => {
    if (!serviceId) return;
    if (disponibles.length > 0) {
      setModo('existente');
      setAccountId(disponibles[0].account_id);
      setCosto(0); // la cuenta ya está pagada: esta plaza no cuesta nada nuevo
    } else {
      setModo('nueva');
      const barata = ofertas[0];
      if (barata) {
        setPriceId(barata.price_id);
        setCosto(barata.costo);
        setPrecio(barata.precio_sugerido);
      }
    }
  }, [serviceId, planId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (estado.ok) {
      const t = setTimeout(() => {
        router.push('/admin/vencimientos');
        router.refresh();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [estado.ok, router]);

  const ganancia = precio - costo;

  // Aviso: la cuenta elegida se muere antes de que se le acaben los días al cliente
  const cuentaElegida = disponibles.find((c) => c.account_id === accountId);
  const noAlcanza =
    modo === 'existente' &&
    cuentaElegida?.dias_cuenta !== null &&
    cuentaElegida?.dias_cuenta !== undefined &&
    cuentaElegida.dias_cuenta < dias;

  return (
    <form action={enviar} className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
      <input type="hidden" name="modo" value={modo} />
      <input type="hidden" name="account_id" value={modo === 'existente' ? accountId : ''} />
      <input type="hidden" name="provider_id" value={oferta?.provider_id ?? ''} />
      <input type="hidden" name="costo" value={costo} />

      <div className="space-y-5">
        {/* 1 · Quién y qué ------------------------------------------------ */}
        <Seccion n={1} titulo="¿Quién compra y qué quiere?" hint="Lo que te acaba de llegar por WhatsApp.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="v-cliente">Cliente <span className="text-brand-400">*</span></label>
              <select
                id="v-cliente" name="customer_id" required className="field cursor-pointer"
                value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="" className="bg-ink-900">— elegir cliente —</option>
                <option value="nuevo" className="bg-ink-900">➕ Cliente nuevo (lo creo aquí)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-900">
                    {c.nombre} · {c.whatsapp}
                  </option>
                ))}
              </select>
            </div>

            {customerId === 'nuevo' && (
              <div className="grid gap-4 rounded-xl border border-brand-400/25 bg-brand-500/[0.06] p-4 sm:col-span-2 sm:grid-cols-2">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-200 sm:col-span-2">
                  <UserPlus className="h-3.5 w-3.5" /> Datos del cliente nuevo
                </p>
                <div>
                  <label className="label" htmlFor="v-cnombre">
                    Nombre <span className="text-brand-400">*</span>
                  </label>
                  <input id="v-cnombre" name="cliente_nombre" required className="field" placeholder="Juan Pérez" />
                </div>
                <div>
                  <label className="label" htmlFor="v-cwa">
                    WhatsApp <span className="text-brand-400">*</span>
                  </label>
                  <input
                    id="v-cwa" name="cliente_whatsapp" type="tel" required inputMode="numeric"
                    className="field" placeholder="573015551122"
                  />
                  <p className="mt-1.5 text-xs text-white/35">Con el 57 adelante, sin + ni espacios.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="v-cmail">Correo</label>
                  <input id="v-cmail" name="cliente_email" type="email" className="field" placeholder="opcional" />
                </div>
                <p className="text-xs leading-relaxed text-white/40 sm:col-span-2">
                  Si ese WhatsApp ya está registrado se usa el cliente que existe, no se duplica.
                </p>
              </div>
            )}

            <div>
              <label className="label" htmlFor="v-servicio">Servicio <span className="text-brand-400">*</span></label>
              <select
                id="v-servicio" name="service_id" required className="field cursor-pointer"
                value={serviceId} onChange={(e) => setServiceId(e.target.value)}
              >
                <option value="" className="bg-ink-900">— elegir servicio —</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id} className="bg-ink-900">{s.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="v-plan">Plan</label>
              <select
                id="v-plan" name="plan_id" className="field cursor-pointer"
                value={planId} onChange={(e) => setPlanId(e.target.value)}
                disabled={!servicio}
              >
                <option value="" className="bg-ink-900">— sin plan —</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id} className="bg-ink-900">
                    {p.nombre} ({p.duracion_dias} d.)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Seccion>

        {/* 2 · De dónde sale la cuenta ------------------------------------ */}
        {serviceId && (
          <Seccion
            n={2}
            titulo="¿De dónde sale la cuenta?"
            hint="Primero mira si ya tienes una con plaza libre: eso no te cuesta nada."
          >
            {/* --- Cuentas propias --- */}
            <div className="mb-5">
              <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                <PackageCheck className="h-3.5 w-3.5 text-emerald-400" />
                Cuentas tuyas con plaza libre
              </p>

              {disponibles.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/12 py-4 text-center text-xs text-white/35">
                  No tienes ninguna cuenta de este servicio con plazas libres.
                </p>
              ) : (
                <div className="space-y-2">
                  {disponibles.map((c) => {
                    const sel = modo === 'existente' && accountId === c.account_id;
                    return (
                      <button
                        type="button"
                        key={c.account_id}
                        onClick={() => {
                          setModo('existente');
                          setAccountId(c.account_id);
                          setCosto(0);
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition',
                          sel
                            ? 'border-emerald-400/50 bg-emerald-500/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25',
                        )}
                      >
                        <span className={cn(
                          'grid h-4 w-4 shrink-0 place-items-center rounded-full border-2',
                          sel ? 'border-emerald-400 bg-emerald-400' : 'border-white/25',
                        )}>
                          {sel && <Check className="h-2.5 w-2.5 text-ink-950" strokeWidth={4} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-white">
                            {c.credencial_usuario ?? 'Cuenta sin correo'}
                          </span>
                          <span className="block text-xs text-white/40">
                            {c.proveedor ?? 'sin proveedor'} · ya la pagaste ({formatMoney(c.costo_adquisicion)}),
                            esta plaza no te cuesta nada extra
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-xs font-semibold text-emerald-300">
                            {c.plazas_libres} de {c.plazas_totales} libres
                          </span>
                          <span className="block text-xs text-white/40">
                            {c.dias_cuenta === null
                              ? 'sin fecha'
                              : c.dias_cuenta < 0
                                ? 'vencida'
                                : `le quedan ${c.dias_cuenta} d.`}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* --- Comprar nueva --- */}
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                <ShoppingCart className="h-3.5 w-3.5 text-brand-400" />
                Comprar una cuenta nueva · del más barato al más caro
              </p>

              {ofertas.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/12 py-4 text-center text-xs text-white/35">
                  No tienes precios cargados de este servicio. Agrégalos en Proveedores.
                </p>
              ) : (
                <div className="space-y-2">
                  {ofertas.map((o, i) => {
                    const sel = modo === 'nueva' && priceId === o.price_id;
                    return (
                      <button
                        type="button"
                        key={o.price_id}
                        onClick={() => {
                          setModo('nueva');
                          setPriceId(o.price_id);
                          setCosto(o.costo);
                          setPrecio(o.precio_sugerido);
                          if (o.duracion_dias) setDias(o.duracion_dias);
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition',
                          sel
                            ? 'border-brand-400/60 bg-brand-500/12'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25',
                        )}
                      >
                        <span className={cn(
                          'grid h-4 w-4 shrink-0 place-items-center rounded-full border-2',
                          sel ? 'border-brand-400 bg-brand-400' : 'border-white/25',
                        )}>
                          {sel && <Check className="h-2.5 w-2.5 text-ink-950" strokeWidth={4} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-white">{o.proveedor}</span>
                            {i === 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                                <TrendingDown className="h-3 w-3" /> más barato
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-white/40">
                            {o.plan ?? o.etiqueta ?? 'plan único'}
                            {o.duracion_dias ? ` · ${o.duracion_dias} días` : ''}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-sm font-bold tabular-nums text-white">
                            {formatMoney(o.costo)}
                          </span>
                          <span className="block text-xs text-emerald-300/80">
                            véndelo en {formatMoney(o.precio_sugerido)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Seccion>
        )}

        {/* 3 · Datos de la cuenta nueva ----------------------------------- */}
        {serviceId && modo === 'nueva' && (
          <Seccion
            n={3}
            titulo="Datos de la cuenta que te mandó el proveedor"
            hint="Puedes dejarlos vacíos y completarlos después desde Cuentas."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="v-user">Correo o usuario</label>
                <input id="v-user" name="credencial_usuario" className="field" placeholder="cuenta@correo.com" />
              </div>
              <div>
                <label className="label" htmlFor="v-plazas">
                  Plazas de esta cuenta <span className="text-brand-400">*</span>
                </label>
                <input
                  id="v-plazas" name="plazas_totales" type="number" min={1} max={50} required
                  className="field" value={plazas}
                  onChange={(e) => setPlazas(Math.max(1, Number(e.target.value) || 1))}
                />
                <p className="mt-1.5 text-xs text-white/35">
                  A cuántos clientes le puedes vender esta misma cuenta.
                </p>
              </div>
              <div>
                <label className="label" htmlFor="v-pin">PIN</label>
                <input id="v-pin" name="pin" className="field" placeholder="opcional" />
              </div>
              <div>
                <label className="label" htmlFor="v-cvence">La cuenta se vence el</label>
                <input
                  id="v-cvence" name="cuenta_vence" type="date" className="field"
                  defaultValue={hoyMas(dias)}
                />
                <p className="mt-1.5 text-xs text-white/35">
                  Si vence antes que los días del cliente, el panel te avisa.
                </p>
              </div>
            </div>
          </Seccion>
        )}

        {/* 4 · Cobro ------------------------------------------------------ */}
        {serviceId && (
          <Seccion n={serviceId && modo === 'nueva' ? 4 : 3} titulo="El cobro" hint="Lo que le entregas y lo que te paga.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="v-dias">
                  Días que le vendes <span className="text-brand-400">*</span>
                </label>
                <input
                  id="v-dias" name="dias" type="number" min={1} required className="field"
                  value={dias} onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))}
                />
                <p className="mt-1.5 text-xs text-white/35">Su servicio vence el {hoyMas(dias)}.</p>
              </div>
              <div>
                <label className="label" htmlFor="v-precio">
                  Precio cobrado <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">$</span>
                  <input
                    id="v-precio" name="precio" type="number" min={0} required className="field pl-7"
                    value={precio} onChange={(e) => setPrecio(Number(e.target.value) || 0)}
                  />
                </div>
                {oferta && precio !== oferta.precio_sugerido && (
                  <button
                    type="button"
                    onClick={() => setPrecio(oferta.precio_sugerido)}
                    className="mt-1.5 text-xs text-brand-300 underline"
                  >
                    Usar el sugerido: {formatMoney(oferta.precio_sugerido)} (costo + $2.000)
                  </button>
                )}
              </div>
              <div>
                <label className="label" htmlFor="v-metodo">Método de pago</label>
                <select id="v-metodo" name="metodo_pago" className="field cursor-pointer" defaultValue="llaves">
                  {METODOS.map(([v, l]) => (
                    <option key={v} value={v} className="bg-ink-900">{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="v-perfil">Perfil que le asignas</label>
                <input id="v-perfil" name="perfil" className="field" placeholder="Perfil 1" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="v-notas">Notas</label>
                <textarea id="v-notas" name="notas" rows={2} className="field resize-y" />
              </div>
            </div>
          </Seccion>
        )}
      </div>

      {/* Resumen pegajoso ------------------------------------------------- */}
      <aside className="lg:sticky lg:top-6">
        <div className="rounded-2xl border border-white/12 bg-ink-900/70 p-5 shadow-glow">
          <p className="mb-4 flex items-center gap-2 font-display font-bold text-white">
            <Sparkles className="h-4 w-4 text-brand-300" /> Resumen
          </p>

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Cliente</dt>
              <dd className="truncate text-right text-white/80">
                {customerId === 'nuevo'
                  ? 'Cliente nuevo'
                  : clientes.find((c) => c.id === customerId)?.nombre ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Servicio</dt>
              <dd className="truncate text-right text-white/80">{servicio?.nombre ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Origen</dt>
              <dd className="text-right text-white/80">
                {!serviceId ? '—' : modo === 'existente' ? 'Cuenta que ya tienes' : `Compra a ${oferta?.proveedor ?? '—'}`}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-white/45">Vence</dt>
              <dd className="text-right tabular-nums text-white/80">{hoyMas(dias)}</dd>
            </div>

            <div className="!mt-4 space-y-2.5 border-t border-white/10 pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Te cuesta</dt>
                <dd className="text-right tabular-nums text-white/80">{formatMoney(Math.round(costo))}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/45">Te pagan</dt>
                <dd className="text-right tabular-nums text-white/80">{formatMoney(precio)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-white">Ganancia</dt>
                <dd className={cn(
                  'text-right font-display text-lg font-bold tabular-nums',
                  ganancia > 0 ? 'text-emerald-300' : ganancia < 0 ? 'text-rose-300' : 'text-white/60',
                )}>
                  {formatMoney(Math.round(ganancia))}
                </dd>
              </div>
            </div>
          </dl>

          {modo === 'existente' && accountId && !noAlcanza && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-200">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Esta plaza ya está pagada, así que los {formatMoney(precio)} son ganancia limpia.
            </p>
          )}
          {noAlcanza && cuentaElegida && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Ojo: a esa cuenta le quedan {cuentaElegida.dias_cuenta} días y le estás vendiendo{' '}
              {dias}. Puedes venderla igual — el panel te va a avisar para pasarlo a otra cuenta
              antes de que se acabe.
            </p>
          )}
          {modo === 'nueva' && oferta && ofertas[0] && oferta.costo > ofertas[0].costo && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
              <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {ofertas[0].proveedor} te la deja en {formatMoney(ofertas[0].costo)},{' '}
              {formatMoney(oferta.costo - ofertas[0].costo)} más barato.
            </p>
          )}

          <AnimatePresence>
            {estado.error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {estado.error}
              </motion.p>
            )}
            {estado.ok && (
              <motion.p
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-200"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {estado.mensaje}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={pendiente || !customerId || !serviceId || precio <= 0}
            className="btn-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pendiente ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Registrando…</>
            ) : modo === 'nueva' ? 'Registrar cuenta y venta' : 'Entregar y registrar venta'}
          </button>
        </div>
      </aside>
    </form>
  );
}
