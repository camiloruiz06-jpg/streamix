import { site } from '@/config/site';

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: site.currency,
  maximumFractionDigits: 0,
});

/** $ 14.000 */
export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return cop.format(value).replace(/\s/g, ' ');
}

/** 14.000 (sin símbolo) */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** YYYY-MM-DD en hora de Colombia, no en UTC del servidor. */
export function fechaLocalISO(fecha?: Date | string | null): string {
  const d = !fecha
    ? new Date()
    : typeof fecha === 'string'
      ? new Date(`${fecha}T12:00:00-05:00`)
      : fecha;
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

/** Suma días a una fecha (o a hoy) y devuelve YYYY-MM-DD en hora de Colombia. */
export function sumarDiasISO(dias: number, desde?: string | null): string {
  const base = desde ?? fechaLocalISO();
  const [y, m, d] = base.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + dias));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** ¿Este cliente coincide con lo que se está buscando? */
export function coincideCliente(
  c: { nombre?: string | null; usuario?: string | null; whatsapp?: string | null },
  q: string,
): boolean {
  const t = q.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!t) return true;
  const nombre = (c.nombre ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const usuario = (c.usuario ?? '').replace(/^@/, '').toLowerCase();
  const wa = (c.whatsapp ?? '').replace(/[^0-9]/g, '');
  const digitos = t.replace(/[^0-9]/g, '');
  if (nombre.includes(t)) return true;
  if (usuario.includes(t.replace(/^@/, ''))) return true;
  if (digitos.length >= 3 && wa.includes(digitos)) return true;
  return false;
}

/** 12 de marzo de 2026 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(d);
}

/** 12/03/2026 */
export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

/** 12/03/2026, 3:40 p.m. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

/** mar 2026 */
export function formatMonth(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' }).format(d);
}

/** Días entre hoy y una fecha (negativo = ya pasó) */
export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** "30 días" · "1 mes" · "3 meses" */
export function formatDuration(dias: number): string {
  if (dias % 30 === 0 && dias >= 30) {
    const meses = dias / 30;
    return meses === 1 ? '1 mes' : `${meses} meses`;
  }
  return `${dias} día${dias === 1 ? '' : 's'}`;
}

export function initials(text: string, max = 2): string {
  return text
    .replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Cómo se muestra un cliente: su nombre si lo pusiste; si no, el @usuario de
 * WhatsApp; si no, el número. WhatsApp permite las dos cosas a la vez.
 */
export function etiquetaCliente(c: {
  nombre?: string | null;
  usuario?: string | null;
  whatsapp?: string | null;
}): string {
  const nombre = c.nombre?.trim();
  if (nombre) return nombre;
  const usuario = c.usuario?.trim();
  if (usuario) return `@${usuario.replace(/^@/, '')}`;
  const wa = c.whatsapp?.trim();
  if (wa) return wa;
  return 'Sin identificar';
}

/** El contacto secundario, para mostrarlo debajo del nombre. */
export function contactoCliente(c: {
  nombre?: string | null;
  usuario?: string | null;
  whatsapp?: string | null;
}): string | null {
  const partes: string[] = [];
  if (c.usuario?.trim()) partes.push(`@${c.usuario.trim().replace(/^@/, '')}`);
  if (c.whatsapp?.trim()) partes.push(c.whatsapp.trim());
  // Si no hay nombre, el primero ya se usó como título
  if (!c.nombre?.trim()) partes.shift();
  return partes.length ? partes.join(' · ') : null;
}
