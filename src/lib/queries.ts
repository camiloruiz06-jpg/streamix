/**
 * Capa de acceso a datos.
 * Si Supabase está configurado lee de la base de datos; si no, devuelve los
 * datos de demostración para que el sitio sea navegable desde el minuto uno.
 */

import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import * as demo from '@/lib/demo-data';
import type {
  Account, AccountSlotRow, CatalogItem, Category, Customer, DashboardStats, ExpirationRow,
  MonthlyFinanceRow, Provider, ProviderComparisonRow, ProviderFinanceRow, ProviderOptionRow,
  Sale, Service, ServiceFinanceRow, SubscriptionRow,
} from '@/lib/types';

export const isDemo = () => !supabaseConfigured();

/* ------------------------------------------------------------------ público */

export async function getCategories(): Promise<Category[]> {
  if (isDemo()) return demo.demoCategories;
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories').select('*').eq('activo', true).order('orden');
  return (data as Category[]) ?? demo.demoCategories;
}

export async function getCatalog(): Promise<CatalogItem[]> {
  if (isDemo()) return demo.demoCatalog;
  const supabase = await createClient();
  const { data } = await supabase.from('v_public_catalog').select('*').order('orden');
  return (data as CatalogItem[]) ?? [];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (isDemo()) return demo.demoServices.find((s) => s.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('services')
    .select('*, categories(id, slug, nombre, color), service_plans(*)')
    .eq('slug', slug)
    .eq('activo', true)
    .single();
  if (!data) return null;
  const service = data as Service;
  service.service_plans = (service.service_plans ?? [])
    .filter((p) => p.activo)
    .sort((a, b) => a.orden - b.orden);
  return service;
}

export async function getFeatured(limit = 4): Promise<CatalogItem[]> {
  const all = await getCatalog();
  const destacados = all.filter((s) => s.destacado);
  return (destacados.length ? destacados : all).slice(0, limit);
}

/* ---------------------------------------------------------------- dashboard */

export async function getStats(): Promise<DashboardStats> {
  if (isDemo()) return demo.demoStats;
  const supabase = await createClient();
  const { data } = await supabase.rpc('dashboard_stats');
  return (data as DashboardStats) ?? demo.demoStats;
}

export async function getMonthlyFinance(): Promise<MonthlyFinanceRow[]> {
  if (isDemo()) return demo.demoMonthly;
  const supabase = await createClient();
  const { data } = await supabase.from('v_finance_monthly').select('*');
  return (data as MonthlyFinanceRow[]) ?? [];
}

export async function getFinanceByService(): Promise<ServiceFinanceRow[]> {
  if (isDemo()) return demo.demoByService;
  const supabase = await createClient();
  const { data } = await supabase.from('v_finance_by_service').select('*');
  return (data as ServiceFinanceRow[]) ?? [];
}

export async function getFinanceByProvider(): Promise<ProviderFinanceRow[]> {
  if (isDemo()) return demo.demoByProvider;
  const supabase = await createClient();
  const { data } = await supabase.from('v_finance_by_provider').select('*');
  return (data as ProviderFinanceRow[]) ?? [];
}

/**
 * Vencimientos: ahora salen de las SUSCRIPCIONES (los días del cliente), no de
 * la cuenta. Se devuelven con la misma forma de siempre para no romper nada.
 */
export async function getExpirations(limit?: number): Promise<ExpirationRow[]> {
  const subs = await getSubscriptions(limit);
  return subs.map((s) => ({
    account_id: s.account_id ?? s.subscription_id,
    fecha_vencimiento: s.fecha_fin,
    dias_restantes: s.dias_restantes,
    semaforo: (s.semaforo === 'sin_cuenta' ? 'sin_fecha' : s.semaforo) as ExpirationRow['semaforo'],
    estado: (s.estado === 'pausada' ? 'suspendida' : s.estado) as ExpirationRow['estado'],
    customer_id: s.customer_id,
    cliente: s.cliente,
    cliente_whatsapp: s.cliente_whatsapp,
    servicio: s.servicio,
    servicio_logo: null,
    plan: s.plan,
    proveedor: s.proveedor,
    precio_venta: s.precio,
    costo_adquisicion: s.costo_adquisicion ?? 0,
  }));
}

/* ------------------------------------------------------------------- admin */

export async function getServicesAdmin(): Promise<Service[]> {
  if (isDemo()) return demo.demoServices;
  const supabase = await createClient();
  const { data } = await supabase
    .from('services')
    .select('*, categories(id, slug, nombre, color), service_plans(*)')
    .order('orden');
  return (data as Service[]) ?? [];
}

export async function getProviders(): Promise<Provider[]> {
  if (isDemo()) return demo.demoProviders;
  const supabase = await createClient();
  const { data } = await supabase.from('providers').select('*').order('nombre');
  return (data as Provider[]) ?? [];
}

export async function getComparison(): Promise<ProviderComparisonRow[]> {
  if (isDemo()) return demo.demoComparison;
  const supabase = await createClient();
  const { data } = await supabase
    .from('v_provider_comparison').select('*')
    .eq('activo', true)
    .order('servicio')
    .order('costo_30_dias');
  return (data as ProviderComparisonRow[]) ?? [];
}

export async function getCustomers(): Promise<Customer[]> {
  if (isDemo()) return demo.demoCustomers;
  const supabase = await createClient();
  const { data } = await supabase
    .from('customers').select('*').order('created_at', { ascending: false });
  return (data as Customer[]) ?? [];
}

export async function getAccounts(): Promise<Account[]> {
  if (isDemo()) return demo.demoAccounts;
  const supabase = await createClient();
  const { data } = await supabase
    .from('accounts')
    .select(
      '*, services(id, nombre, color), service_plans(id, nombre, duracion_dias), providers(id, nombre), customers(id, nombre, whatsapp)',
    )
    .order('created_at', { ascending: false });
  return (data as Account[]) ?? [];
}

export async function getSales(): Promise<Sale[]> {
  if (isDemo()) return demo.demoSales;
  const supabase = await createClient();
  const { data } = await supabase
    .from('sales')
    .select(
      '*, customers(id, nombre, whatsapp), services(id, nombre, color), service_plans(id, nombre), providers(id, nombre)',
    )
    .order('fecha', { ascending: false });
  return (data as Sale[]) ?? [];
}

/** Compras de un cliente identificado por su WhatsApp (consulta pública). */
export async function getPurchasesByWhatsapp(whatsapp: string): Promise<ExpirationRow[]> {
  const limpio = whatsapp.replace(/[^0-9]/g, '');
  if (!limpio) return [];
  const todas = await getExpirations();
  const cola = limpio.slice(-10);
  return todas.filter((e) => (e.cliente_whatsapp ?? '').replace(/[^0-9]/g, '').endsWith(cola));
}

/* ------------------------------------------------ plazas y suscripciones */

/** El inventario con sus plazas: cuántas hay, cuántas ocupadas, cuántas libres. */
export async function getAccountSlots(): Promise<AccountSlotRow[]> {
  if (isDemo()) return demo.demoSlots;
  const supabase = await createClient();
  const { data } = await supabase
    .from('v_account_slots').select('*')
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false });
  return (data as AccountSlotRow[]) ?? [];
}

/** Lo que le debes a cada cliente: sus días, su cuenta actual y su semáforo. */
export async function getSubscriptions(limit?: number): Promise<SubscriptionRow[]> {
  if (isDemo()) return limit ? demo.demoSubscriptions.slice(0, limit) : demo.demoSubscriptions;
  const supabase = await createClient();
  let q = supabase.from('v_subscriptions').select('*').order('fecha_fin', { ascending: true });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data as SubscriptionRow[]) ?? [];
}

/** De qué proveedor comprar cada servicio, el más barato de primero. */
export async function getProviderOptions(): Promise<ProviderOptionRow[]> {
  if (isDemo()) return demo.demoProviderOptions;
  const supabase = await createClient();
  const { data } = await supabase
    .from('v_provider_options').select('*')
    .order('service_id').order('puesto');
  return (data as ProviderOptionRow[]) ?? [];
}
