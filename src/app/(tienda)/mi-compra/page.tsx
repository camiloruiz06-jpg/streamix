import type { Metadata } from 'next';
import { Search, MessageCircle, PackageOpen } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SemaforoBadge } from '@/components/ui/Badge';
import { getPurchasesByWhatsapp } from '@/lib/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { waRenovacion, waSoporte } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Consultar mi compra',
  description: 'Consulta el estado y la fecha de vencimiento de los servicios que compraste.',
};

export const dynamic = 'force-dynamic';

export default async function MiCompraPage({
  searchParams,
}: {
  searchParams: Promise<{ tel?: string }>;
}) {
  const { tel } = await searchParams;
  const consultado = Boolean(tel && tel.trim());
  const resultados = consultado ? await getPurchasesByWhatsapp(tel!) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <Reveal className="text-center">
        <span className="eyebrow">Autoconsulta</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Consulta tu compra</span>
        </h1>
        <p className="mt-4 text-white/55">
          Escribe el número de WhatsApp con el que compraste y te mostramos el estado de tus
          servicios y cuándo vencen.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <form method="get" className="mt-10 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="tel"
              name="tel"
              defaultValue={tel ?? ''}
              placeholder="Ej. 3015551122"
              inputMode="numeric"
              className="field py-3.5 pl-10"
              required
            />
          </div>
          <button type="submit" className="btn-primary sm:w-auto">
            Consultar
          </button>
        </form>
      </Reveal>

      {consultado && (
        <div className="mt-10">
          {resultados.length === 0 ? (
            <Reveal>
              <div className="rounded-2xl border border-dashed border-white/12 py-16 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-white/25" />
                <p className="mt-4 font-display text-lg font-semibold text-white">
                  No encontramos compras con ese número
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">
                  Verifica que sea el mismo WhatsApp con el que hiciste el pedido. Si crees que es
                  un error, escríbenos y lo revisamos contigo.
                </p>
                <a
                  href={waSoporte()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-sm mt-6"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Escribir a soporte
                </a>
              </div>
            </Reveal>
          ) : (
            <>
              <p className="mb-4 text-sm text-white/45">
                {resultados.length} servicio{resultados.length === 1 ? '' : 's'} encontrado
                {resultados.length === 1 ? '' : 's'}
              </p>
              <div className="space-y-3">
                {resultados.map((r, i) => (
                  <Reveal key={r.account_id} delay={i * 0.05}>
                    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display font-bold text-white">{r.servicio}</h2>
                          <SemaforoBadge semaforo={r.semaforo} />
                        </div>
                        <p className="mt-1 text-sm text-white/50">
                          {r.plan} · Vence el {formatDate(r.fecha_vencimiento)}
                          {r.dias_restantes !== null && r.dias_restantes >= 0 && (
                            <span className="text-white/35"> ({r.dias_restantes} días)</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-white/35">
                          Valor pagado: {formatMoney(r.precio_venta)}
                        </p>
                      </div>
                      <a
                        href={waRenovacion(r.servicio ?? '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp btn-sm shrink-0"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Renovar
                      </a>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-12 text-center text-xs leading-relaxed text-white/30">
        Por seguridad, esta consulta solo muestra el estado y la fecha de vencimiento. Los datos de
        acceso se envían únicamente por WhatsApp al número registrado en la compra.
      </p>
    </div>
  );
}
