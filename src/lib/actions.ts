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
    columnas: ['nombre', 'whatsapp', 'usuario', 'email', 'documento', 'estado', 'notas'],
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
      'costo_adquisicion', 'plazas_totales', 'estado', 'notas',
    ],
    numericas: ['costo_adquisicion', 'plazas_totales'],
  },
  sales: {
    etiqueta: 'venta',
    columnas: [
      'customer_id', 'account_id', 'service_id', 'plan_id', 'provider_id',
      'precio', 'costo', 'fecha', 'metodo_pago', 'estado', 'notas',
    ],
    numericas: ['precio', 'costo'],
  },
  subscriptions: {
    etiqueta: 'servicio del cliente',
    columnas: [
      'customer_id', 'service_id', 'plan_id', 'account_id', 'perfil', 'pin',
      'fecha_inicio', 'fecha_fin', 'precio', 'estado', 'notas',
    ],
    numericas: ['precio'],
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
  '/admin/vencimientos', '/admin/servicios', '/admin/proveedores', '/admin/vender',
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

  const { data, error } = await supabase.rpc('refresh_subscription_statuses');
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

/* ==========================================================================
 * EL FLUJO DE VENTA
 * --------------------------------------------------------------------------
 * Llega alguien por WhatsApp pidiendo un servicio. Hay dos caminos:
 *   a) Ya tienes una cuenta con plaza libre  → la usas y no gastas nada.
 *   b) No tienes                             → le compras al proveedor más
 *      barato, registras la cuenta y en el mismo paso se la entregas.
 * En ambos casos queda la SUSCRIPCIÓN del cliente (sus días) y la VENTA.
 * ======================================================================== */

const num = (v: FormDataEntryValue | null, porDefecto = 0) => {
  const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : porDefecto;
};
const txt = (v: FormDataEntryValue | null) => {
  const t = typeof v === 'string' ? v.trim() : '';
  return t === '' ? null : t;
};
const sumarDias = (dias: number, desde?: string | null) => {
  const d = desde ? new Date(`${desde}T00:00:00`) : new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};

export async function registrarVenta(
  _estado: EstadoAccion,
  form: FormData,
): Promise<EstadoAccion> {
  if (!supabaseConfigured()) return { error: 'La base de datos no está conectada.' };

  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  let customerId = txt(form.get('customer_id'));
  const serviceId = txt(form.get('service_id'));
  const planId = txt(form.get('plan_id'));
  const modo = (txt(form.get('modo')) ?? 'existente') as 'existente' | 'nueva';
  const dias = Math.max(1, num(form.get('dias'), 30));
  const precio = num(form.get('precio'));
  const metodo = txt(form.get('metodo_pago')) ?? 'llaves';
  const perfil = txt(form.get('perfil'));
  const notas = txt(form.get('notas'));

  // Cliente nuevo: se crea aquí mismo, sin salir de la pantalla.
  if (customerId === 'nuevo') {
    // Un solo campo: puede venir un número o un @usuario de WhatsApp.
    const contacto = (txt(form.get('cliente_contacto')) ?? '').trim();
    const nombre = txt(form.get('cliente_nombre'));

    const esUsuario = contacto.startsWith('@') || /[a-zA-Z_]/.test(contacto);
    const whatsapp = esUsuario ? null : contacto.replace(/[^0-9]/g, '');
    const usuario = esUsuario ? contacto.replace(/^@/, '').trim() : null;

    if (!whatsapp && !usuario) {
      return { error: 'Escribe el número de WhatsApp del cliente, o su @usuario.' };
    }
    if (whatsapp && whatsapp.length < 10) {
      return { error: 'Ese número no parece un WhatsApp válido. Va con el 57 adelante.' };
    }

    // Si ya lo tienes registrado lo reusamos en vez de duplicarlo.
    const busqueda = supabase.from('customers').select('id');
    const { data: existente } = whatsapp
      ? await busqueda.eq('whatsapp', whatsapp).maybeSingle()
      : await busqueda.ilike('usuario', usuario as string).maybeSingle();

    if (existente) {
      customerId = existente.id;
    } else {
      const { data: creado, error: eCliente } = await supabase
        .from('customers')
        .insert({ nombre, whatsapp, usuario, email: txt(form.get('cliente_email')), estado: 'activo' })
        .select('id')
        .single();
      if (eCliente || !creado) {
        return { error: `No se pudo crear el cliente: ${eCliente?.message ?? ''}` };
      }
      customerId = creado.id;
    }
  }

  if (!customerId) return { error: 'Elige el cliente.' };
  if (!serviceId) return { error: 'Elige el servicio.' };
  if (precio <= 0) return { error: 'Escribe el precio que te pagó el cliente.' };

  let accountId = txt(form.get('account_id'));
  let costo = 0;
  let providerId: string | null = null;

  if (modo === 'nueva') {
    // Compraste una cuenta nueva: la registramos antes de entregarla.
    providerId = txt(form.get('provider_id'));
    costo = num(form.get('costo'));
    const plazas = Math.max(1, num(form.get('plazas_totales'), 1));
    const venceCuenta = txt(form.get('cuenta_vence')) ?? sumarDias(dias);

    const { data: nueva, error: eNueva } = await supabase
      .from('accounts')
      .insert({
        service_id: serviceId,
        plan_id: planId,
        provider_id: providerId,
        credencial_usuario: txt(form.get('credencial_usuario')),
        credencial_secreto: txt(form.get('credencial_secreto')),
        perfil,
        pin: txt(form.get('pin')),
        fecha_adquisicion: new Date().toISOString().slice(0, 10),
        fecha_vencimiento: venceCuenta,
        costo_adquisicion: costo,
        plazas_totales: plazas,
        estado: 'activa',
      })
      .select('id')
      .single();

    if (eNueva || !nueva) {
      return { error: `No se pudo registrar la cuenta nueva: ${eNueva?.message ?? ''}` };
    }
    accountId = nueva.id;
  } else {
    if (!accountId) return { error: 'Elige la cuenta que vas a usar, o registra una nueva.' };

    const { data: libre } = await supabase.rpc('plazas_libres', { p_account: accountId });
    if (typeof libre === 'number' && libre < 1) {
      return { error: 'Esa cuenta ya no tiene plazas libres. Elige otra o compra una nueva.' };
    }

    const { data: cta } = await supabase
      .from('accounts')
      .select('costo_adquisicion, provider_id')
      .eq('id', accountId)
      .single();
    providerId = cta?.provider_id ?? null;

    // El costo de la cuenta se carga UNA sola vez, en la primera venta.
    // Las siguientes plazas de esa misma cuenta no te cuestan nada: ya la
    // pagaste. Así "la compré en 4.000 y la vendí en 7.000" da 3.000 de
    // ganancia, y el total de la cuenta nunca queda inflado.
    const { count } = await supabase
      .from('sales')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId);

    costo = (count ?? 0) === 0 ? Number(cta?.costo_adquisicion ?? 0) : 0;

    await supabase.from('accounts').update({ estado: 'activa' }).eq('id', accountId);
  }

  const { data: sub, error: eSub } = await supabase
    .from('subscriptions')
    .insert({
      customer_id: customerId,
      service_id: serviceId,
      plan_id: planId,
      account_id: accountId,
      perfil,
      pin: txt(form.get('pin')),
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: sumarDias(dias),
      precio,
      estado: 'activa',
      notas,
    })
    .select('id')
    .single();

  if (eSub || !sub) return { error: `No se pudo registrar la suscripción: ${eSub?.message ?? ''}` };

  const { error: eVenta } = await supabase.from('sales').insert({
    customer_id: customerId,
    account_id: accountId,
    service_id: serviceId,
    plan_id: planId,
    provider_id: providerId,
    subscription_id: sub.id,
    precio,
    costo: Math.round(costo),
    metodo_pago: metodo,
    estado: 'entregada',
    notas,
  });

  if (eVenta) {
    return { error: `La entrega quedó registrada, pero la venta no: ${eVenta.message}` };
  }

  refrescar();
  return {
    ok: true,
    mensaje:
      modo === 'nueva'
        ? `Cuenta nueva registrada y entregada. Vence el ${sumarDias(dias)}.`
        : `Entregado en una cuenta que ya tenías. Vence el ${sumarDias(dias)}.`,
  };
}

/** Renueva sumando días encima de los que le queden al cliente. */
export async function renovarSuscripcion(
  _estado: EstadoAccion,
  form: FormData,
): Promise<EstadoAccion> {
  if (!supabaseConfigured()) return { error: 'La base de datos no está conectada.' };
  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  const id = txt(form.get('subscription_id'));
  const dias = Math.max(1, num(form.get('dias'), 30));
  const precio = num(form.get('precio'));
  const metodo = txt(form.get('metodo_pago')) ?? 'llaves';
  const cuenta = txt(form.get('account_id'));

  if (!id) return { error: 'Falta la suscripción a renovar.' };
  if (precio <= 0) return { error: 'Escribe cuánto te pagó por la renovación.' };

  const { data, error } = await supabase.rpc('renovar_suscripcion', {
    p_subscription: id,
    p_dias: dias,
    p_account: cuenta,
    p_precio: precio,
    p_metodo: metodo,
  });

  if (error) return { error: error.message };
  refrescar();
  const fila = Array.isArray(data) ? data[0] : data;
  return { ok: true, mensaje: `Renovado. Ahora vence el ${fila?.fecha_fin ?? '—'}.` };
}

/**
 * Pasa al cliente a otra cuenta conservando sus días.
 * Es lo que usas cuando la cuenta se te vence antes que el derecho del cliente.
 */
export async function moverSuscripcion(
  _estado: EstadoAccion,
  form: FormData,
): Promise<EstadoAccion> {
  if (!supabaseConfigured()) return { error: 'La base de datos no está conectada.' };
  const supabase = await createClient();
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) return { error: 'Tu sesión expiró. Vuelve a entrar.' };

  const id = txt(form.get('subscription_id'));
  const cuenta = txt(form.get('account_id'));
  if (!id) return { error: 'Falta la suscripción.' };
  if (!cuenta) return { error: 'Elige la cuenta a la que lo vas a pasar.' };

  const { error } = await supabase.rpc('mover_suscripcion', {
    p_subscription: id,
    p_account: cuenta,
    p_perfil: txt(form.get('perfil')),
  });

  if (error) return { error: error.message };
  refrescar();
  return { ok: true, mensaje: 'Listo, quedó en la cuenta nueva con los mismos días.' };
}
