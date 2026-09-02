import { site, waTemplates } from '@/config/site';
import { formatMoney } from '@/lib/format';

/** Construye un enlace wa.me con el mensaje ya prellenado. */
export function waLink(mensaje: string, numero: string = site.whatsapp): string {
  const limpio = numero.replace(/[^0-9]/g, '');
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}

export const waGeneral = () => waLink(waTemplates.general());
export const waSoporte = () => waLink(waTemplates.soporte());
export const waServicio = (servicio: string) => waLink(waTemplates.servicio(servicio));
export const waRenovacion = (servicio: string) => waLink(waTemplates.renovacion(servicio));

export function waCompra(
  servicio: string,
  plan: string,
  dias: number,
  precio: number,
): string {
  return waLink(waTemplates.compra(servicio, plan, dias, formatMoney(precio)));
}

/** Recordatorio de vencimiento, se abre desde el panel hacia el cliente. */
export function waRecordatorio(
  clienteNumero: string,
  cliente: string,
  servicio: string,
  dias: number,
): string {
  return waLink(waTemplates.recordatorio(cliente, servicio, dias), clienteNumero);
}
