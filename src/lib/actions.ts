'use server';

/**
 * ---------------------------------------------------------------------------
 * ACCIONES DEL PANEL: crear, editar y borrar registros
 * ---------------------------------------------------------------------------
 * Todo pasa por Supabase con la sesión del administrador, así que las reglas
 * de seguridad de la base de datos (RLS) siguen aplicando: sin sesión válida,
 * ninguna de estas acciones escribe nada.
 *
 * Solo se aceptan las tablas y columnas listadas aquí abajo.
 * ---------------------------------------------------------------------------
 */

import { revalidatePath } from 'next/cache';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

/** Tablas que el panel puede modificar, y qué columnas de cada una. */
const TABLAS = {
  customers: {
    etiqueta: 'cliente',
    columnas: ['nombre', 'whatsapp', 'email', 'documento', 'estado', 'notas'],
    numericas: [] as string[],
  },
  providers: {
    etiqueta: 'proveedor',
    columnas: ['nombre', 'contacto', 'whatsapp', 'email', 'condiciones', 'notas', 'estado'],
    numericas: [] as string[],
  },
  accounts: {
    etiqueta: 'cuenta',
    columnas: [
      'service_id', 'plan_id', 'provider_id', 'customer_id',
      'credencial_usuario', 'perfil', 'pin', 'info_entrega',
      'fecha_adquisicion', 'fecha_activacion', 'fecha_vencimiento',
      'costo_adquisicion', 'precio_venta', 'estado', 'notas',
    ],
    numericas: ['costo_adquisicion', 'precio_venta'],
  },
  sales: {
    etiqueta: 'venta',
    columnas: [
      'customer_id', 'account_id', 'service_id', 'plan_id', 'provider_id',
      'precio', 'costo', 'fecha', 'metodo_pago', 'estado', 'notas',
    ],
    numericas: ['precio', 'costo'],
  },
  services: {
    etiqueta: 'servicio',
    columnas: [
      'nombre', 'slug', 'category_id', 'descripcion_corta', 'descripcion',
      'logo_url', 'color', 'destacado', 'activo', 'orden',
    ],
    numericas: ['orden'],
  },
  service_plans: {
    etiqueta: 'plan',
    columnas: [
      'service_id', 'nombre', 'descripcion', 'duracion_dias',
      'precio_venta', 'precio_descuento', 'pantallas', 'disponible', 'activo', 'orden',
    ],
    numericas: ['duracion_dias', 'precio_venta', 'precio_descuento', 'pantallas', 'orden'],
  },
  provider_prices: {
    etiqueta: 'precio de proveedor',
    columnas: ['provider_id', 'service_id', 'plan_id', 'etiqueta', 'costo', 'duracion_dias', 'condiciones', 'activo'],
    numericas: ['costo', 'duracion_dias'],
  },
} as const;

type Tabla = keyof typeof TABLAS;

export interface EstadoAccion {
  ok?: boolean;
  error?: string;
  mensaje?: string;
}

const esTabla = (v: unknown): v is Tabla =>
  typeof v === 'string' && Object.prototype.hasOwnProperty.call(TABLAS, v);

/** Convierte los valores del formulario a lo que espera PostgreSQL. */
function limpiar(tabla: Tabla, form: FormData) {
  const cfg = TABLAS[tabla];
  const datos: Record<string, unknown> = {};

  for (const col of cfg.columnas) {
    if (!form.has(col) && !form.has(`__bool_${col}`)) continue;

    // Casillas de verificación: llegan como "on" o no llegan
    if (form.has(`__bool_${col}`)) {
      datos[col] = form.get(col) === 'on' || form.get(col) === 'true';
      continue;
    }

    const bruto = form.get(col);
    const valor = typeof bruto === 'string' ? bruto.trim() : '';

    if (valor === '') {
      datos[col] = null;
      continue;
    }

    if ((cfg.numericas as readonly string[]).includes(col)) {
      const n = Number(valor.replace(/[^0-9.-]/g, ''));
      datos[col] = Number.isFinite(n) ? n : null;
      continue;
    }

    datos[col] = valor;
  }
  return datos;
}

const RUTAS = [
  '/admin', '/admin/clientes', '/admin/cuentas', '/admin/ventas',
  '/admin/vencimientos', '/admin/servicios', '/admin/proveedores',
  '/admin/comparador', '/admin/finanzas', '/servicios', '/',
];

function refrescar() {
  for (const r of RUTAS) revalidatePath(r);
}

/* -------------------------------------------------------- crear / editar */

export async function guardarRegistro(
  _estado: EstadoAccion,
  form: FormData,
): Promise<EstadoAccion> {
  const tabla = form.get('__tabla');
  const id = (form.get('__id') as string) || null;

  if (!esTabla(tabla)) return { error: 'Esa tabla no se puede modificar desde el panel.' };
  if (!supabaseConfigured()) {
    return { error: 'La base de datos no está conectada. Revisa las claves en .env.local.' };
  }

  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  const datos = limpiar(tabla, form);
  if (Object.keys(datos).length === 0) return { error: 'No enviaste ningún dato.' };

  const etiqueta = TABLAS[tabla].etiqueta;

  const { error } = id
    ? await supabase.from(tabla).update(datos).eq('id', id)
    : await supabase.from(tabla).insert(datos);

  if (error) {
    // Mensajes de PostgreSQL traducidos a algo entendible
    let msg = error.message;
    if (error.code === '23505') msg = 'Ya existe un registro con ese valor único (revisa el slug).';
    if (error.code === '23503') msg = 'Falta seleccionar un dato relacionado, o el que elegiste ya no existe.';
    if (error.code === '23514') msg = 'Alguno de los valores no es válido (revisa precios y duraciones).';
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      msg =
        'La base de datos rechazó el cambio por permisos. Tu usuario debe estar en la tabla admin_profiles con activo = true. ' +
        'En Supabase → SQL Editor ejecuta: insert into admin_profiles (id, email) select id, email from auth.users on conflict (id) do nothing;';
    }
    return { error: msg };
  }

  refrescar();
  return {
    ok: true,
    mensaje: id ? `Se actualizó el ${etiqueta}.` : `Se creó el ${etiqueta}.`,
  };
}

/* ---------------------------------------------------------------- borrar */

export async function borrarRegistro(
  _estado: EstadoAccion,
  form: FormData,
): Promise<EstadoAccion> {
  const tabla = form.get('__tabla');
  const id = form.get('__id') as string;

  if (!esTabla(tabla)) return { error: 'Esa tabla no se puede modificar desde el panel.' };
  if (!id) return { error: 'Falta el identificador del registro.' };
  if (!supabaseConfigured()) return { error: 'La base de datos no está conectada.' };

  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  const { error } = await supabase.from(tabla).delete().eq('id', id);

  if (error) {
    let msg = error.message;
    if (error.code === '23503') {
      msg = 'No se puede borrar: hay otros registros que dependen de este. Cámbialo a inactivo en vez de borrarlo.';
    }
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      msg = 'La base de datos rechazó el borrado por permisos. Revisa que tu usuario esté en admin_profiles con activo = true.';
    }
    return { error: msg };
  }

  refrescar();
  return { ok: true, mensaje: `Se eliminó el ${TABLAS[tabla].etiqueta}.` };
}

/* ------------------------------------------- acciones rápidas de negocio */

/** Marca vencidas y por vencer según la fecha de hoy. */
export async function actualizarVencimientos(): Promise<EstadoAccion> {
  if (!supabaseConfigured()) return { error: 'La base de datos no está conectada.' };
  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  const { data, error } = await supabase.rpc('refresh_account_statuses');
  if (error) return { error: error.message };

  refrescar();
  const fila = Array.isArray(data) ? data[0] : data;
  return {
    ok: true,
    mensaje: `Listo: ${fila?.por_vencer ?? 0} por vencer y ${fila?.vencidas ?? 0} vencidas.`,
  };
}

/**
 * Entrega una cuenta a un cliente y registra la venta, en un solo paso.
 * Es el camino más común: alguien escribe por WhatsApp, le asignas un cupo
 * disponible y queda la venta registrada.
 */
export async function venderCuenta(
  _estado: EstadoAccion,
  form: FormData,
): Promise<EstadoAccion> {
  if (!supabaseConfigured()) return { error: 'La base de datos no está conectada.' };

  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  const accountId = form.get('account_id') as string;
  const customerId = form.get('customer_id') as string;
  const precio = Number(String(form.get('precio') ?? '').replace(/[^0-9.-]/g, ''));
  const metodo = (form.get('metodo_pago') as string) || 'llaves';
  const fechaVenc = (form.get('fecha_vencimiento') as string) || null;
  const notas = (form.get('notas') as string) || null;

  if (!accountId) return { error: 'Elige la cuenta que vas a entregar.' };
  if (!customerId) return { error: 'Elige el cliente.' };
  if (!Number.isFinite(precio) || precio < 0) return { error: 'El precio no es válido.' };

  const { data: cuenta, error: e1 } = await supabase
    .from('accounts')
    .select('id, service_id, plan_id, provider_id, costo_adquisicion, service_plans(duracion_dias)')
    .eq('id', accountId)
    .single();

  if (e1 || !cuenta) return { error: 'No encontré esa cuenta.' };

  // Si no dieron fecha de vencimiento, se calcula con la duración del plan
  let vence = fechaVenc;
  if (!vence) {
    const dias =
      (cuenta as unknown as { service_plans?: { duracion_dias?: number } }).service_plans
        ?.duracion_dias ?? 30;
    const d = new Date();
    d.setDate(d.getDate() + dias);
    vence = d.toISOString().slice(0, 10);
  }

  const hoy = new Date().toISOString().slice(0, 10);

  const { error: e2 } = await supabase
    .from('accounts')
    .update({
      customer_id: customerId,
      fecha_activacion: hoy,
      fecha_vencimiento: vence,
      precio_venta: precio,
      estado: 'activa',
    })
    .eq('id', accountId);

  if (e2) return { error: `No se pudo actualizar la cuenta: ${e2.message}` };

  const { error: e3 } = await supabase.from('sales').insert({
    customer_id: customerId,
    account_id: accountId,
    service_id: cuenta.service_id,
    plan_id: cuenta.plan_id,
    provider_id: cuenta.provider_id,
    precio,
    costo: cuenta.costo_adquisicion ?? 0,
    metodo_pago: metodo,
    estado: 'entregada',
    notas,
  });

  if (e3) return { error: `La cuenta se asignó, pero la venta no se registró: ${e3.message}` };

  refrescar();
  return { ok: true, mensaje: `Venta registrada. La cuenta vence el ${vence}.` };
}
