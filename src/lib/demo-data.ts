/**
 * ---------------------------------------------------------------------------
 * DATOS DE DEMOSTRACIÓN
 * ---------------------------------------------------------------------------
 * El catálogo, los proveedores y los precios son REALES: vienen de
 * `src/lib/catalog-data.ts` (generado por `scripts/build-catalog.py`).
 * Lo único inventado son clientes, cuentas y ventas de ejemplo, para que el
 * dashboard tenga algo que mostrar antes de conectar Supabase.
 *
 * En cuanto pongas las claves de Supabase en `.env.local`, todo el sitio lee
 * de la base de datos real y este archivo deja de usarse.
 * ---------------------------------------------------------------------------
 */

import { seedCategories, seedProviders, seedServices } from '@/lib/catalog-data';
import type {
  Account, CatalogItem, Category, Customer, DashboardStats, ExpirationRow,
  MonthlyFinanceRow, Provider, ProviderComparisonRow, ProviderFinanceRow,
  Sale, Service, ServiceFinanceRow, ServicePlan, Semaforo,
} from '@/lib/types';

const hoy = () => {
  const x = new Date();
  x.setHours(0, 0, 0, 0);
  return x;
};
const d = (offset: number) => {
  const x = hoy();
  x.setDate(x.getDate() + offset);
  return x.toISOString().slice(0, 10);
};
const t = (offsetDays: number) => {
  const x = new Date();
  x.setDate(x.getDate() + offsetDays);
  return x.toISOString();
};

/* ------------------------------------------------------------- categorías */

export const demoCategories: Category[] = seedCategories.map((c) => ({
  id: c.id,
  slug: c.slug,
  nombre: c.nombre,
  descripcion: c.descripcion,
  icono: c.icono,
  color: c.color,
  orden: c.orden,
  activo: true,
}));

const catBySlug = new Map(demoCategories.map((c) => [c.slug, c]));

/* -------------------------------------------------------------- servicios */

export const demoServices: Service[] = seedServices.map((s) => {
  const cat = catBySlug.get(s.categoria) ?? null;
  const planes: ServicePlan[] = s.planes.map((p) => ({
    id: p.id,
    service_id: s.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    duracion_dias: p.duracion_dias,
    precio_venta: p.precio_venta,
    precio_descuento: null,
    pantallas: p.pantallas,
    disponible: true,
    activo: true,
    orden: p.orden,
  }));
  return {
    id: s.id,
    category_id: cat?.id ?? null,
    slug: s.slug,
    nombre: s.nombre,
    descripcion_corta: s.descripcion_corta,
    descripcion: s.descripcion,
    logo_url: s.logo_url,
    color: s.color,
    destacado: s.destacado,
    activo: true,
    orden: s.orden,
    categories: cat ? { id: cat.id, slug: cat.slug, nombre: cat.nombre, color: cat.color } : null,
    service_plans: planes,
  };
});

export const demoCatalog: CatalogItem[] = seedServices.map((s) => {
  const cat = catBySlug.get(s.categoria);
  return {
    id: s.id,
    slug: s.slug,
    nombre: s.nombre,
    descripcion_corta: s.descripcion_corta,
    descripcion: s.descripcion,
    logo_url: s.logo_url,
    color: s.color,
    destacado: s.destacado,
    orden: s.orden,
    categoria_slug: cat?.slug ?? null,
    categoria: cat?.nombre ?? null,
    precio_desde: Math.min(...s.planes.map((p) => p.precio_venta)),
    planes_disponibles: s.planes.length,
  };
});

/* ------------------------------------------------------------ proveedores */

export const demoProviders: Provider[] = seedProviders.map((p, i) => ({
  id: p.id,
  nombre: p.nombre,
  contacto: p.contacto || null,
  whatsapp: p.whatsapp || null,
  email: p.email || null,
  condiciones: p.condiciones,
  notas: null,
  estado: 'activo',
  created_at: t(-120 + i * 20),
}));

const provById = new Map(demoProviders.map((p) => [p.id, p]));
const provByKey = new Map(seedProviders.map((p) => [p.key, p]));

/* ---------------------------------------------- comparador de proveedores */

export const demoComparison: ProviderComparisonRow[] = seedServices.flatMap((s) =>
  s.planes.flatMap((p) =>
    p.costos.map(([key, costo, dias], i) => {
      const prov = provByKey.get(key)!;
      return {
        price_id: `${p.id}-${key}-${i}`,
        service_id: s.id,
        servicio: s.nombre,
        servicio_slug: s.slug,
        provider_id: prov.id,
        proveedor: prov.nombre,
        proveedor_estado: 'activo' as const,
        plan: p.nombre,
        costo,
        duracion_dias: dias,
        costo_por_dia: Math.round((costo / dias) * 100) / 100,
        costo_30_dias: Math.round((costo / dias) * 30),
        precio_venta: p.precio_venta,
        margen: p.precio_venta - costo,
        margen_pct:
          p.precio_venta > 0
            ? Math.round(((p.precio_venta - costo) / p.precio_venta) * 1000) / 10
            : null,
        condiciones: prov.condiciones,
        activo: true,
      };
    }),
  ),
);

/* ----------------------------------------------------------------- helpers */

const svc = (slug: string) => seedServices.find((s) => s.slug === slug)!;
const planDe = (slug: string, idx = 0) => svc(slug).planes[idx]!;
const costoMin = (slug: string, idx = 0) =>
  Math.min(...planDe(slug, idx).costos.map(([, c]) => c));
const provDe = (slug: string, idx = 0) => {
  const p = planDe(slug, idx);
  const barato = p.costos.reduce((a, b) => (a[1] <= b[1] ? a : b));
  return provByKey.get(barato[0])!.id;
};

/* --------------------------------------------------------------- clientes */

export const demoCustomers: Customer[] = [
  { id: 'cl1', nombre: 'Juan Pérez',      whatsapp: '573015551122', email: 'juan.perez@gmail.com',    documento: null, estado: 'activo',   notas: 'Cliente recurrente', created_at: t(-200) },
  { id: 'cl2', nombre: 'María Gómez',     whatsapp: '573025552233', email: 'maria.gomez@gmail.com',   documento: null, estado: 'activo',   notas: null, created_at: t(-160) },
  { id: 'cl3', nombre: 'Carlos Ramírez',  whatsapp: '573035553344', email: null,                      documento: null, estado: 'activo',   notas: 'Prefiere pago por Nequi', created_at: t(-120) },
  { id: 'cl4', nombre: 'Ana Torres',      whatsapp: '573045554455', email: 'ana.torres@outlook.com',  documento: null, estado: 'activo',   notas: null, created_at: t(-90) },
  { id: 'cl5', nombre: 'Luis Martínez',   whatsapp: '573055555566', email: null,                      documento: null, estado: 'inactivo', notas: 'No renovó el último mes', created_at: t(-75) },
  { id: 'cl6', nombre: 'Sofía Herrera',   whatsapp: '573065556677', email: 'sofia.h@gmail.com',       documento: null, estado: 'activo',   notas: 'Llegó por referido', created_at: t(-40) },
  { id: 'cl7', nombre: 'Andrés Vargas',   whatsapp: '573075557788', email: null,                      documento: null, estado: 'activo',   notas: null, created_at: t(-25) },
];

const custById = new Map(demoCustomers.map((c) => [c.id, c]));

/* ---------------------------------------------------------------- cuentas */

type AcctSeed = [string, string, number, string | null, string, string | null, number, number];
//              id     slug   planIdx  clienteId   usuario   perfil   adquirido  vence(NaN = disponible)

const acctSeed: AcctSeed[] = [
  ['a1',  'netflix',            0, 'cl1', 'nfx.pool01@correo.com', 'Perfil 1', -28, 0],
  ['a2',  'disney-plus',        1, 'cl2', 'dsn.pool04@correo.com', 'Perfil 3', -28, 2],
  ['a3',  'spotify',            0, 'cl3', 'spt.user12@correo.com', null,       -25, 5],
  ['a4',  'max',                0, 'cl4', 'max.pool07@correo.com', 'Perfil 2', -15, 15],
  ['a5',  'combo-netflix-prime',0, 'cl6', 'combo.np03@correo.com', 'Perfil 1', -10, 20],
  ['a6',  'crunchyroll',        0, 'cl5', 'crn.pool03@correo.com', null,       -40, -10],
  ['a7',  'canva-pro',          0, 'cl7', 'canva.user9@correo.com', null,      -20, 10],
  ['a8',  'netflix',            0, null,  'nfx.pool09@correo.com', 'Perfil 4', -2, NaN],
  ['a9',  'netflix',            0, null,  'nfx.pool09@correo.com', 'Perfil 5', -2, NaN],
  ['a10', 'prime-video',        0, null,  'amz.pool01@correo.com', 'Perfil 2', -1, NaN],
  ['a11', 'max',                0, null,  'max.pool11@correo.com', 'Perfil 3', -1, NaN],
  ['a12', 'disney-plus',        1, null,  'dsn.pool12@correo.com', 'Perfil 5', -3, NaN],
  ['a13', 'paramount-plus',     0, null,  'pmt.pool02@correo.com', 'Perfil 1', -3, NaN],
];

export const demoAccounts: Account[] = acctSeed.map(
  ([id, slug, planIdx, cust, user, perfil, adq, venc]) => {
    const s = svc(slug);
    const p = planDe(slug, planIdx);
    const costo = costoMin(slug, planIdx);
    const disponible = Number.isNaN(venc);
    const vencido = !disponible && venc < 0;
    const porVencer = !disponible && venc >= 0 && venc <= 7;
    const provId = provDe(slug, planIdx);

    return {
      id,
      service_id: s.id,
      plan_id: p.id,
      provider_id: provId,
      customer_id: cust,
      credencial_usuario: user,
      credencial_secreto: null,
      perfil,
      pin: null,
      info_entrega: null,
      fecha_adquisicion: d(adq),
      fecha_activacion: cust ? d(adq) : null,
      fecha_vencimiento: disponible ? null : d(venc),
      costo_adquisicion: costo,
      precio_venta: p.precio_venta,
      ganancia: p.precio_venta - costo,
      estado: disponible ? 'disponible' : vencido ? 'vencida' : porVencer ? 'por_vencer' : 'activa',
      notas: null,
      created_at: t(adq),
      services: { id: s.id, nombre: s.nombre, color: s.color },
      service_plans: { id: p.id, nombre: p.nombre, duracion_dias: p.duracion_dias },
      providers: provById.get(provId) ?? null,
      customers: cust ? custById.get(cust) ?? null : null,
    };
  },
);

export const demoExpirations: ExpirationRow[] = demoAccounts
  .filter((a) => ['vendida', 'activa', 'por_vencer', 'vencida'].includes(a.estado))
  .map((a) => {
    const dias = a.fecha_vencimiento
      ? Math.round((new Date(a.fecha_vencimiento).getTime() - hoy().getTime()) / 86_400_000)
      : null;
    let semaforo: Semaforo = 'sin_fecha';
    if (dias !== null) {
      if (dias < 0) semaforo = 'vencido';
      else if (dias === 0) semaforo = 'hoy';
      else if (dias <= 3) semaforo = 'critico';
      else if (dias <= 7) semaforo = 'proximo';
      else semaforo = 'ok';
    }
    return {
      account_id: a.id,
      fecha_vencimiento: a.fecha_vencimiento,
      dias_restantes: dias,
      semaforo,
      estado: a.estado,
      customer_id: a.customer_id,
      cliente: a.customers?.nombre ?? null,
      cliente_whatsapp: a.customers?.whatsapp ?? null,
      servicio: a.services?.nombre ?? null,
      servicio_logo: null,
      plan: a.service_plans?.nombre ?? null,
      proveedor: a.providers?.nombre ?? null,
      precio_venta: a.precio_venta,
      costo_adquisicion: a.costo_adquisicion,
    };
  })
  .sort((x, y) => (x.dias_restantes ?? 9999) - (y.dias_restantes ?? 9999));

/* ----------------------------------------------------------------- ventas */

type SaleSeed = [number, string, string | null, string, number, number, Sale['metodo_pago'], Sale['estado']];
//               nº     cliente  cuenta        slug   planIdx  offsetDias  método   estado

const saleSeed: SaleSeed[] = [
  [1014, 'cl2', null,  'combo-netflix-prime-disney', 0,   0, 'daviplata',   'pagada'],
  [1013, 'cl4', null,  'chatgpt',                    0,  -1, 'nequi',       'pagada'],
  [1012, 'cl7', 'a7',  'canva-pro',                  0, -20, 'nequi',       'entregada'],
  [1011, 'cl1', null,  'spotify',                    0,  -3, 'nequi',       'pagada'],
  [1010, 'cl3', null,  'max',                        0,  -6, 'llaves',      'entregada'],
  [1009, 'cl6', 'a5',  'combo-netflix-prime',        0, -10, 'nequi',       'entregada'],
  [1008, 'cl4', 'a4',  'max',                        0, -15, 'bancolombia', 'entregada'],
  [1007, 'cl3', 'a3',  'spotify',                    0, -25, 'nequi',       'entregada'],
  [1006, 'cl2', 'a2',  'disney-plus',                1, -28, 'daviplata',   'entregada'],
  [1005, 'cl1', 'a1',  'netflix',                    0, -28, 'nequi',       'entregada'],
  [1004, 'cl5', 'a6',  'crunchyroll',                0, -40, 'llaves',      'entregada'],
  [1003, 'cl1', null,  'netflix',                    0, -58, 'nequi',       'entregada'],
  [1002, 'cl3', null,  'prime-video',                0, -62, 'nequi',       'entregada'],
  [1001, 'cl6', null,  'disney-plus',                1, -70, 'daviplata',   'entregada'],
  [1000, 'cl4', null,  'netflix',                    0, -88, 'nequi',       'entregada'],
];

export const demoSales: Sale[] = saleSeed.map(
  ([numero, cust, acct, slug, planIdx, offset, metodo, estado]) => {
    const s = svc(slug);
    const p = planDe(slug, planIdx);
    const costo = costoMin(slug, planIdx);
    const provId = provDe(slug, planIdx);
    return {
      id: `v${numero}`,
      numero,
      customer_id: cust,
      account_id: acct,
      service_id: s.id,
      plan_id: p.id,
      provider_id: provId,
      precio: p.precio_venta,
      costo,
      ganancia: p.precio_venta - costo,
      fecha: t(offset),
      metodo_pago: metodo,
      estado,
      notas: null,
      customers: custById.get(cust) ?? null,
      services: { id: s.id, nombre: s.nombre, color: s.color },
      service_plans: { id: p.id, nombre: p.nombre },
      providers: provById.get(provId) ?? null,
    };
  },
);

/* ------------------------------------------------------------ estadísticas */

const pagadas = demoSales.filter((s) => ['pagada', 'entregada'].includes(s.estado));
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
const delMes = pagadas.filter((s) => new Date(s.fecha).getTime() >= inicioMes);
const inicioDia = hoy().getTime();

export const demoStats: DashboardStats = {
  clientes_totales: demoCustomers.length,
  clientes_activos: demoCustomers.filter((c) => c.estado === 'activo').length,
  servicios_vendidos: pagadas.length,
  cuentas_activas: demoAccounts.filter((a) => ['activa', 'vendida', 'por_vencer'].includes(a.estado)).length,
  cuentas_disponibles: demoAccounts.filter((a) => a.estado === 'disponible').length,
  por_vencer: demoExpirations.filter((e) => ['hoy', 'critico', 'proximo'].includes(e.semaforo)).length,
  vencidas: demoExpirations.filter((e) => e.semaforo === 'vencido').length,
  proveedores_activos: demoProviders.filter((p) => p.estado === 'activo').length,
  servicios_catalogo: demoServices.length,
  ventas_hoy: pagadas.filter((s) => new Date(s.fecha).getTime() >= inicioDia).reduce((a, s) => a + s.precio, 0),
  ventas_mes: delMes.reduce((a, s) => a + s.precio, 0),
  costos_mes: delMes.reduce((a, s) => a + s.costo, 0),
  ganancia_mes: delMes.reduce((a, s) => a + s.ganancia, 0),
  ganancia_total: pagadas.reduce((a, s) => a + s.ganancia, 0),
};

export const demoMonthly: MonthlyFinanceRow[] = (() => {
  const map = new Map<string, MonthlyFinanceRow>();
  for (let i = 5; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(1);
    dt.setMonth(dt.getMonth() - i);
    const key = new Date(dt.getFullYear(), dt.getMonth(), 1).toISOString().slice(0, 10);
    map.set(key, { mes: key, ventas: 0, ingresos: 0, costos: 0, ganancia: 0 });
  }
  for (const s of pagadas) {
    const dt = new Date(s.fecha);
    const key = new Date(dt.getFullYear(), dt.getMonth(), 1).toISOString().slice(0, 10);
    const row = map.get(key);
    if (row) {
      row.ventas += 1;
      row.ingresos += s.precio;
      row.costos += s.costo;
      row.ganancia += s.ganancia;
    }
  }
  return [...map.values()];
})();

export const demoByService: ServiceFinanceRow[] = demoServices
  .map((s) => {
    const v = pagadas.filter((x) => x.service_id === s.id);
    return {
      service_id: s.id,
      servicio: s.nombre,
      ventas: v.length,
      ingresos: v.reduce((a, x) => a + x.precio, 0),
      costos: v.reduce((a, x) => a + x.costo, 0),
      ganancia: v.reduce((a, x) => a + x.ganancia, 0),
    };
  })
  .sort((a, b) => b.ganancia - a.ganancia);

export const demoByProvider: ProviderFinanceRow[] = demoProviders
  .map((p) => {
    const v = pagadas.filter((x) => x.provider_id === p.id);
    return {
      provider_id: p.id,
      proveedor: p.nombre,
      ventas: v.length,
      invertido: v.reduce((a, x) => a + x.costo, 0),
      ganancia: v.reduce((a, x) => a + x.ganancia, 0),
    };
  })
  .sort((a, b) => b.ganancia - a.ganancia);
