/**
 * Tipos del dominio. Reflejan el esquema de supabase/schema.sql.
 * Si más adelante generas tipos con `supabase gen types typescript`,
 * puedes reemplazar este archivo — el resto del código sigue funcionando.
 */

export type AccountStatus =
  | 'disponible' | 'vendida' | 'activa' | 'por_vencer' | 'vencida' | 'suspendida' | 'cancelada';

export type CustomerStatus = 'activo' | 'inactivo' | 'moroso' | 'bloqueado';
export type ProviderStatus = 'activo' | 'inactivo' | 'suspendido';
export type SaleStatus = 'pendiente' | 'pagada' | 'entregada' | 'reembolsada' | 'cancelada';
export type PaymentMethod =
  | 'llaves' | 'nequi' | 'daviplata' | 'bancolombia' | 'paypal'
  | 'transferencia' | 'efectivo' | 'binance' | 'otro';

export type Semaforo = 'vencido' | 'hoy' | 'critico' | 'proximo' | 'ok' | 'sin_fecha';

export interface Category {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  color: string | null;
  orden: number;
  activo: boolean;
}

export interface ServicePlan {
  id: string;
  service_id: string;
  nombre: string;
  descripcion: string | null;
  duracion_dias: number;
  precio_venta: number;
  precio_descuento: number | null;
  pantallas: number | null;
  disponible: boolean;
  activo: boolean;
  orden: number;
}

export interface Service {
  id: string;
  category_id: string | null;
  slug: string;
  nombre: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  logo_url: string | null;
  color: string | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  categories?: Pick<Category, 'id' | 'slug' | 'nombre' | 'color'> | null;
  service_plans?: ServicePlan[];
}

export interface Provider {
  id: string;
  nombre: string;
  contacto: string | null;
  whatsapp: string | null;
  email: string | null;
  condiciones: string | null;
  notas: string | null;
  estado: ProviderStatus;
  created_at: string;
}

export interface ProviderPrice {
  id: string;
  provider_id: string;
  service_id: string;
  plan_id: string | null;
  etiqueta: string | null;
  costo: number;
  duracion_dias: number;
  condiciones: string | null;
  activo: boolean;
  providers?: Pick<Provider, 'id' | 'nombre' | 'estado'> | null;
  services?: Pick<Service, 'id' | 'nombre' | 'slug'> | null;
}

export interface Customer {
  id: string;
  nombre: string;
  whatsapp: string;
  email: string | null;
  documento: string | null;
  estado: CustomerStatus;
  notas: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  service_id: string;
  plan_id: string | null;
  provider_id: string | null;
  customer_id: string | null;
  credencial_usuario: string | null;
  credencial_secreto: string | null;
  perfil: string | null;
  pin: string | null;
  info_entrega: string | null;
  fecha_adquisicion: string;
  fecha_activacion: string | null;
  fecha_vencimiento: string | null;
  costo_adquisicion: number;
  precio_venta: number;
  ganancia: number;
  plazas_totales: number;
  estado: AccountStatus;
  notas: string | null;
  created_at: string;
  services?: Pick<Service, 'id' | 'nombre' | 'color'> | null;
  service_plans?: Pick<ServicePlan, 'id' | 'nombre' | 'duracion_dias'> | null;
  providers?: Pick<Provider, 'id' | 'nombre'> | null;
  customers?: Pick<Customer, 'id' | 'nombre' | 'whatsapp'> | null;
}

export interface Sale {
  id: string;
  numero: number;
  customer_id: string | null;
  account_id: string | null;
  service_id: string | null;
  plan_id: string | null;
  provider_id: string | null;
  precio: number;
  costo: number;
  ganancia: number;
  fecha: string;
  metodo_pago: PaymentMethod;
  estado: SaleStatus;
  notas: string | null;
  customers?: Pick<Customer, 'id' | 'nombre' | 'whatsapp'> | null;
  services?: Pick<Service, 'id' | 'nombre' | 'color'> | null;
  service_plans?: Pick<ServicePlan, 'id' | 'nombre'> | null;
  providers?: Pick<Provider, 'id' | 'nombre'> | null;
}

/* ------------------------------- vistas ---------------------------------- */

export interface CatalogItem {
  id: string;
  slug: string;
  nombre: string;
  descripcion_corta: string | null;
  descripcion: string | null;
  logo_url: string | null;
  color: string | null;
  destacado: boolean;
  orden: number;
  categoria_slug: string | null;
  categoria: string | null;
  precio_desde: number | null;
  planes_disponibles: number;
}

export interface ProviderComparisonRow {
  price_id: string;
  service_id: string;
  servicio: string;
  servicio_slug: string;
  provider_id: string;
  proveedor: string;
  proveedor_estado: ProviderStatus;
  plan: string;
  costo: number;
  duracion_dias: number;
  costo_por_dia: number;
  costo_30_dias: number;
  precio_venta: number | null;
  margen: number | null;
  margen_pct: number | null;
  condiciones: string | null;
  activo: boolean;
}

export interface ExpirationRow {
  account_id: string;
  fecha_vencimiento: string | null;
  dias_restantes: number | null;
  semaforo: Semaforo;
  estado: AccountStatus;
  customer_id: string | null;
  cliente: string | null;
  cliente_whatsapp: string | null;
  servicio: string | null;
  servicio_logo: string | null;
  plan: string | null;
  proveedor: string | null;
  precio_venta: number;
  costo_adquisicion: number;
}

export interface DashboardStats {
  clientes_totales: number;
  clientes_activos: number;
  servicios_vendidos: number;
  cuentas_activas: number;
  cuentas_disponibles: number;
  por_vencer: number;
  vencidas: number;
  proveedores_activos: number;
  servicios_catalogo: number;
  ventas_hoy: number;
  ventas_mes: number;
  costos_mes: number;
  ganancia_mes: number;
  ganancia_total: number;
}

export interface MonthlyFinanceRow {
  mes: string;
  ventas: number;
  ingresos: number;
  costos: number;
  ganancia: number;
}

export interface ServiceFinanceRow {
  service_id: string;
  servicio: string;
  ventas: number;
  ingresos: number;
  costos: number;
  ganancia: number;
}

export interface ProviderFinanceRow {
  provider_id: string;
  proveedor: string;
  ventas: number;
  invertido: number;
  ganancia: number;
}

/* --------------------------------------------------------------------------
 * Plazas y suscripciones
 * ------------------------------------------------------------------------ */

export type SubscriptionStatus = 'activa' | 'por_vencer' | 'vencida' | 'pausada' | 'cancelada';

/** Una cuenta del inventario vista como "cuántas plazas tiene y cuántas quedan". */
export interface AccountSlotRow {
  account_id: string;
  service_id: string;
  plan_id: string | null;
  provider_id: string | null;
  servicio: string | null;
  servicio_color: string | null;
  plan: string | null;
  duracion_dias: number | null;
  proveedor: string | null;
  credencial_usuario: string | null;
  fecha_adquisicion: string;
  fecha_vencimiento: string | null;
  costo_adquisicion: number;
  plazas_totales: number;
  plazas_ocupadas: number;
  plazas_libres: number;
  estado: AccountStatus;
  notas: string | null;
  dias_cuenta: number | null;
  costo_por_plaza: number;
}

/** Los días a los que un cliente tiene derecho, con la cuenta que ocupa hoy. */
export interface SubscriptionRow {
  subscription_id: string;
  customer_id: string;
  cliente: string | null;
  cliente_whatsapp: string | null;
  service_id: string;
  servicio: string | null;
  servicio_color: string | null;
  plan_id: string | null;
  plan: string | null;
  duracion_dias: number | null;
  account_id: string | null;
  credencial_usuario: string | null;
  perfil: string | null;
  pin: string | null;
  provider_id: string | null;
  proveedor: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  cuenta_vence: string | null;
  precio: number;
  costo_adquisicion: number | null;
  estado: SubscriptionStatus;
  dias_restantes: number | null;
  dias_cuenta: number | null;
  /** La cuenta se vence antes de que se acaben los días del cliente. */
  necesita_reemplazo: boolean;
  semaforo: Semaforo | 'sin_cuenta';
}

/** De qué proveedor conviene comprar, ordenado del más barato al más caro. */
export interface ProviderOptionRow {
  price_id: string;
  service_id: string;
  servicio: string | null;
  plan_id: string | null;
  plan: string | null;
  provider_id: string;
  proveedor: string;
  proveedor_whatsapp: string | null;
  proveedor_estado: ProviderStatus;
  etiqueta: string | null;
  costo: number;
  duracion_dias: number | null;
  condiciones: string | null;
  /** costo + $2.000 */
  precio_sugerido: number;
  /** 1 = el más barato para ese servicio y plan */
  puesto: number;
}
