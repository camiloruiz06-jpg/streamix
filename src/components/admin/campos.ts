/**
 * Definiciones de campos reutilizables para los formularios del panel.
 * Se arman en el servidor (con las opciones cargadas de la base) y se pasan
 * al formulario, que es un componente de cliente.
 */

import type { Campo } from '@/components/admin/RecordForm';
import type { Customer, Provider, Service, ServicePlan, Account, Category } from '@/lib/types';

export const ESTADOS_CLIENTE = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'moroso', label: 'Moroso' },
  { value: 'bloqueado', label: 'Bloqueado' },
];

export const ESTADOS_PROVEEDOR = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'suspendido', label: 'Suspendido' },
];

export const ESTADOS_CUENTA = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'activa', label: 'Activa' },
  { value: 'vendida', label: 'Vendida' },
  { value: 'por_vencer', label: 'Por vencer' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'suspendida', label: 'Suspendida' },
  { value: 'cancelada', label: 'Cancelada' },
];

export const ESTADOS_VENTA = [
  { value: 'pagada', label: 'Pagada' },
  { value: 'entregada', label: 'Entregada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'reembolsada', label: 'Reembolsada' },
  { value: 'cancelada', label: 'Cancelada' },
];

export const METODOS_PAGO = [
  { value: 'llaves', label: 'Llaves (Bre-B)' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'bancolombia', label: 'Bancolombia' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'otro', label: 'Otro' },
];

export const hoyISO = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------- opciones */

export const opcionesClientes = (cs: Customer[]) =>
  cs.map((c) => ({ value: c.id, label: `${c.nombre} · ${c.whatsapp}` }));

export const opcionesProveedores = (ps: Provider[]) =>
  ps.map((p) => ({ value: p.id, label: p.nombre }));

export const opcionesServicios = (ss: Service[]) =>
  ss.map((s) => ({ value: s.id, label: s.nombre }));

/** "Netflix · Premium 1 pantalla (30 días)" */
export const opcionesPlanes = (ss: Service[]) =>
  ss.flatMap((s) =>
    (s.service_plans ?? []).map((p) => ({
      value: p.id,
      label: `${s.nombre} · ${p.nombre} (${p.duracion_dias} d.)`,
    })),
  );

export const opcionesCuentasDisponibles = (as: Account[]) =>
  as
    .filter((a) => a.estado === 'disponible')
    .map((a) => ({
      value: a.id,
      label: `${a.services?.nombre ?? 'Servicio'} · ${a.service_plans?.nombre ?? ''}${
        a.perfil ? ` · ${a.perfil}` : ''
      } — costo $${a.costo_adquisicion.toLocaleString('es-CO')}`,
    }));

/* -------------------------------------------------------------- campos */

export function camposCliente(c?: Customer): Campo[] {
  return [
    { name: 'nombre', label: 'Nombre completo', requerido: true, valor: c?.nombre, placeholder: 'Juan Pérez' },
    { name: 'whatsapp', label: 'WhatsApp', tipo: 'tel', requerido: true, valor: c?.whatsapp, placeholder: '573015551122', ayuda: 'Con el 57 al inicio, sin espacios ni +' },
    { name: 'email', label: 'Correo', tipo: 'email', valor: c?.email, placeholder: 'opcional' },
    { name: 'documento', label: 'Documento', valor: c?.documento, placeholder: 'opcional' },
    { name: 'estado', label: 'Estado', tipo: 'select', opciones: ESTADOS_CLIENTE, valor: c?.estado ?? 'activo', requerido: true },
    { name: 'notas', label: 'Notas', tipo: 'textarea', ancho: 'full', valor: c?.notas, placeholder: 'Cómo llegó, preferencias de pago, etc.' },
  ];
}

export function camposProveedor(p?: Provider): Campo[] {
  return [
    { name: 'nombre', label: 'Nombre', requerido: true, valor: p?.nombre, placeholder: 'Proveedor 1' },
    { name: 'whatsapp', label: 'WhatsApp', tipo: 'tel', valor: p?.whatsapp, placeholder: '573001112233' },
    { name: 'contacto', label: 'Persona de contacto', valor: p?.contacto, placeholder: 'opcional' },
    { name: 'email', label: 'Correo', tipo: 'email', valor: p?.email, placeholder: 'opcional' },
    { name: 'estado', label: 'Estado', tipo: 'select', opciones: ESTADOS_PROVEEDOR, valor: p?.estado ?? 'activo', requerido: true },
    { name: 'condiciones', label: 'Condiciones', tipo: 'textarea', ancho: 'full', valor: p?.condiciones, placeholder: 'Garantía, tiempos de entrega, mínimos de compra…' },
    { name: 'notas', label: 'Notas internas', tipo: 'textarea', ancho: 'full', valor: p?.notas },
  ];
}

export function camposCuenta(
  a: Account | undefined,
  opts: {
    servicios: { value: string; label: string }[];
    planes: { value: string; label: string }[];
    proveedores: { value: string; label: string }[];
    clientes: { value: string; label: string }[];
  },
): Campo[] {
  return [
    { name: 'service_id', label: 'Servicio', tipo: 'select', requerido: true, opciones: opts.servicios, valor: a?.service_id },
    { name: 'plan_id', label: 'Plan', tipo: 'select', opciones: opts.planes, valor: a?.plan_id, ayuda: 'Define la duración y el precio sugerido' },
    { name: 'provider_id', label: 'Proveedor', tipo: 'select', opciones: opts.proveedores, valor: a?.provider_id },
    { name: 'estado', label: 'Estado', tipo: 'select', requerido: true, opciones: ESTADOS_CUENTA, valor: a?.estado ?? 'disponible' },
    { name: 'plazas_totales', label: 'Plazas de la cuenta', tipo: 'numero', requerido: true, valor: a?.plazas_totales ?? '', ayuda: 'A cuántos clientes le puedes vender esta misma cuenta' },
    { name: 'costo_adquisicion', label: 'Costo', tipo: 'numero', prefijo: '$', requerido: true, valor: a?.costo_adquisicion ?? '', ayuda: 'Lo que te cobró el proveedor' },
    { name: 'precio_venta', label: 'Precio de venta', tipo: 'numero', prefijo: '$', valor: a?.precio_venta ?? '', ayuda: 'Lo que le cobras al cliente' },
    { name: 'credencial_usuario', label: 'Correo / usuario de la cuenta', valor: a?.credencial_usuario, placeholder: 'cuenta@correo.com' },
    { name: 'perfil', label: 'Perfil', valor: a?.perfil, placeholder: 'Perfil 1' },
    { name: 'pin', label: 'PIN', valor: a?.pin, placeholder: 'opcional' },
    { name: 'customer_id', label: 'Cliente asignado', tipo: 'select', opciones: opts.clientes, valor: a?.customer_id, placeholder: '— sin asignar —' },
    { name: 'fecha_adquisicion', label: 'Fecha de compra', tipo: 'fecha', valor: a?.fecha_adquisicion ?? hoyISO() },
    { name: 'fecha_activacion', label: 'Fecha de activación', tipo: 'fecha', valor: a?.fecha_activacion },
    { name: 'fecha_vencimiento', label: 'Fecha de vencimiento', tipo: 'fecha', valor: a?.fecha_vencimiento, ayuda: 'De aquí salen las alertas del semáforo' },
    { name: 'info_entrega', label: 'Instrucciones de entrega', tipo: 'textarea', ancho: 'full', valor: a?.info_entrega, placeholder: 'Qué mandarle al cliente por WhatsApp' },
    { name: 'notas', label: 'Notas internas', tipo: 'textarea', ancho: 'full', valor: a?.notas },
  ];
}

export const opcionesCategorias = (cs: Category[]) =>
  cs.map((c) => ({ value: c.id, label: c.nombre }));

export function camposServicio(
  s: Service | undefined,
  categorias: { value: string; label: string }[],
): Campo[] {
  return [
    { name: 'nombre', label: 'Nombre', requerido: true, valor: s?.nombre, placeholder: 'Netflix' },
    { name: 'slug', label: 'Slug', requerido: true, valor: s?.slug, placeholder: 'netflix', ayuda: 'Solo minúsculas y guiones. Es la dirección en la tienda.' },
    { name: 'category_id', label: 'Categoría', tipo: 'select', opciones: categorias, valor: s?.category_id },
    { name: 'orden', label: 'Orden', tipo: 'numero', valor: s?.orden ?? 0, ayuda: 'Menor número aparece primero' },
    { name: 'color', label: 'Color', valor: s?.color ?? '#a855f7', placeholder: '#e50914' },
    { name: 'logo_url', label: 'Logo', valor: s?.logo_url, placeholder: '/logos/netflix.png' },
    { name: 'descripcion_corta', label: 'Descripción corta', tipo: 'textarea', ancho: 'full', valor: s?.descripcion_corta, placeholder: 'La que se ve en la tarjeta del catálogo' },
    { name: 'descripcion', label: 'Descripción larga', tipo: 'textarea', ancho: 'full', valor: s?.descripcion },
    { name: 'activo', label: 'Publicado en la tienda', tipo: 'switch', ancho: 'half', valor: s ? s.activo : true },
    { name: 'destacado', label: 'Destacado en la portada', tipo: 'switch', ancho: 'half', valor: s?.destacado ?? false },
  ];
}

export function camposPlan(
  p: ServicePlan | undefined,
  serviceId: string,
  servicios: { value: string; label: string }[],
): Campo[] {
  return [
    { name: 'service_id', label: 'Servicio', tipo: 'select', requerido: true, opciones: servicios, valor: p?.service_id ?? serviceId },
    { name: 'nombre', label: 'Nombre del plan', requerido: true, valor: p?.nombre, placeholder: '1 mes · 1 pantalla' },
    { name: 'duracion_dias', label: 'Duración (días)', tipo: 'numero', requerido: true, valor: p?.duracion_dias ?? 30 },
    { name: 'precio_venta', label: 'Precio de venta', tipo: 'numero', prefijo: '$', requerido: true, valor: p?.precio_venta ?? '' },
    { name: 'precio_descuento', label: 'Precio con descuento', tipo: 'numero', prefijo: '$', valor: p?.precio_descuento ?? '', ayuda: 'Déjalo vacío si no hay promoción' },
    { name: 'pantallas', label: 'Pantallas', tipo: 'numero', valor: p?.pantallas ?? '' },
    { name: 'orden', label: 'Orden', tipo: 'numero', valor: p?.orden ?? 0 },
    { name: 'descripcion', label: 'Descripción', tipo: 'textarea', ancho: 'full', valor: p?.descripcion },
    { name: 'disponible', label: 'Con stock disponible', tipo: 'switch', ancho: 'half', valor: p ? p.disponible : true },
    { name: 'activo', label: 'Visible en la tienda', tipo: 'switch', ancho: 'half', valor: p ? p.activo : true },
  ];
}
