'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatMoney, formatMonth } from '@/lib/format';
import type { MonthlyFinanceRow, ServiceFinanceRow } from '@/lib/types';

/* ---------------------------------------------------------------------------
 * Paleta de la visualización
 * Validada para superficie oscura (banda de luminosidad, croma, separación para
 * daltonismo y contraste). No cambies estos valores sin volver a validarlos.
 * ------------------------------------------------------------------------- */
const VIZ = {
  serie1: '#9085e9', // violeta  · ingresos / ganancia por servicio
  serie2: '#c98500', // ámbar    · costos
  serie3: '#199e70', // verde    · ganancia
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.35)',
  surface: '#0b0a14',
};

const ejeComun = {
  stroke: VIZ.axis,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const compacto = (v: number) =>
  new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(v);

/* ------------------------------------------------------------------ tooltip */

function TooltipCaja({
  active,
  payload,
  label,
  titulo,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; payload?: Record<string, unknown> }[];
  label?: string | number;
  titulo?: (label: string | number | undefined) => string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((a, p) => a + (p.value ?? 0), 0);

  return (
    <div className="rounded-xl border border-white/12 bg-ink-950/95 px-3.5 py-2.5 shadow-glow backdrop-blur-xl">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
        {titulo ? titulo(label) : label}
      </p>
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-5 text-xs">
            <span className="flex items-center gap-2 text-white/65">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-white">{formatMoney(p.value ?? 0)}</span>
          </li>
        ))}
        {payload.length > 1 && (
          <li className="flex items-center justify-between gap-5 border-t border-white/10 pt-1.5 text-xs">
            <span className="text-white/45">Ingresos</span>
            <span className="font-semibold tabular-nums text-white">{formatMoney(total)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------- evolución mensual */

/**
 * Área apilada: costos + ganancia = ingresos.
 * Una sola escala en el eje Y (nunca doble eje).
 */
export function FinanzasMensuales({ data }: { data: MonthlyFinanceRow[] }) {
  const rows = data.map((d) => ({ ...d, mesLabel: formatMonth(d.mes) }));

  return (
    <div>
      {/* leyenda */}
      <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/55">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: VIZ.serie3 }} />
          Ganancia
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: VIZ.serie2 }} />
          Costos
        </li>
        <li className="text-white/30">· la suma de ambos es el ingreso del mes</li>
      </ul>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGanancia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VIZ.serie3} stopOpacity={0.5} />
                <stop offset="100%" stopColor={VIZ.serie3} stopOpacity={0.06} />
              </linearGradient>
              <linearGradient id="gradCostos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VIZ.serie2} stopOpacity={0.45} />
                <stop offset="100%" stopColor={VIZ.serie2} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={VIZ.grid} vertical={false} />
            <XAxis dataKey="mesLabel" {...ejeComun} dy={6} />
            <YAxis {...ejeComun} width={52} tickFormatter={compacto} />
            <Tooltip
              content={<TooltipCaja />}
              cursor={{ stroke: 'rgba(255,255,255,.18)', strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="costos"
              name="Costos"
              stackId="1"
              stroke={VIZ.serie2}
              strokeWidth={2}
              fill="url(#gradCostos)"
            />
            <Area
              type="monotone"
              dataKey="ganancia"
              name="Ganancia"
              stackId="1"
              stroke={VIZ.serie3}
              strokeWidth={2}
              fill="url(#gradGanancia)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --------------------------------------------------- ganancia por servicio */

/** Serie única → un solo tono; el título nombra la métrica, no hace falta leyenda. */
export function GananciaPorServicio({ data }: { data: ServiceFinanceRow[] }) {
  const rows = data
    .filter((d) => d.ganancia > 0)
    .slice(0, 8)
    .map((d) => ({ ...d, servicioCorto: d.servicio.length > 14 ? `${d.servicio.slice(0, 13)}…` : d.servicio }));

  if (rows.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-white/35">
        Aún no hay ventas registradas.
      </div>
    );
  }

  const max = Math.max(...rows.map((r) => r.ganancia));

  return (
    <div className="w-full" style={{ height: Math.max(220, rows.length * 44) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 104, left: 4, bottom: 4 }}
          barCategoryGap={10}
        >
          <CartesianGrid stroke={VIZ.grid} horizontal={false} />
          <XAxis type="number" hide domain={[0, max * 1.02]} />
          <YAxis
            type="category"
            dataKey="servicioCorto"
            {...ejeComun}
            width={104}
          />
          <Tooltip
            content={<TooltipCaja />}
            cursor={{ fill: 'rgba(255,255,255,.04)' }}
          />
          <Bar dataKey="ganancia" name="Ganancia" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {rows.map((r) => (
              <Cell key={r.service_id} fill={VIZ.serie1} />
            ))}
            <LabelList
              dataKey="ganancia"
              position="right"
              offset={10}
              formatter={(v: number) => formatMoney(v)}
              style={{
                fill: 'rgba(255,255,255,.72)',
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------- ventas por mes (mini) */

export function VentasSparkline({ data }: { data: MonthlyFinanceRow[] }) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={VIZ.serie1} stopOpacity={0.45} />
              <stop offset="100%" stopColor={VIZ.serie1} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke={VIZ.serie1}
            strokeWidth={2}
            fill="url(#gradSpark)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
