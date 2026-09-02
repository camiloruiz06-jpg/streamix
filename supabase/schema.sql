-- ============================================================================
-- NOVAPLAY · Esquema de base de datos
-- Plataforma de venta y gestión de servicios de streaming
-- PostgreSQL / Supabase
-- ----------------------------------------------------------------------------
-- Ejecuta este archivo completo en:  Supabase → SQL Editor → New query
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TIPOS (estados del negocio)
-- ============================================================================

do $$ begin
  create type account_status as enum (
    'disponible', 'vendida', 'activa', 'por_vencer', 'vencida', 'suspendida', 'cancelada'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type customer_status as enum ('activo', 'inactivo', 'moroso', 'bloqueado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type provider_status as enum ('activo', 'inactivo', 'suspendido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sale_status as enum ('pendiente', 'pagada', 'entregada', 'reembolsada', 'cancelada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum (
    'llaves', 'nequi', 'daviplata', 'bancolombia', 'paypal',
    'transferencia', 'efectivo', 'binance', 'otro'
  );
exception when duplicate_object then null; end $$;

-- Si la base ya existía sin 'llaves', esto lo agrega sin romper nada.
do $$ begin
  alter type payment_method add value if not exists 'llaves';
exception when others then null; end $$;

-- ============================================================================
-- 2. UTILIDADES
-- ============================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- 3. ADMINISTRADORES
-- Se apoya en auth.users de Supabase. Esta tabla añade rol y estado.
-- ============================================================================

create table if not exists admin_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null default 'Administrador',
  email       text,
  rol         text not null default 'admin' check (rol in ('admin', 'operador')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ¿El usuario autenticado es administrador?
-- Se define aquí, y no antes, porque consulta la tabla de arriba: PostgreSQL
-- valida el cuerpo de las funciones SQL en el momento de crearlas.
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_profiles
    where id = auth.uid() and activo = true
  );
$$;

-- Al crear un usuario en Auth se le genera su perfil automáticamente.
create or replace function handle_new_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_profiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_admin();

-- ============================================================================
-- 4. CATÁLOGO: categorías → servicios → planes
-- ============================================================================

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  nombre      text not null,
  descripcion text,
  icono       text default 'sparkles',      -- nombre de icono lucide
  color       text default '#a855f7',
  orden       int  not null default 0,
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists services (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references categories(id) on delete set null,
  slug              text not null unique,
  nombre            text not null,
  descripcion_corta text,
  descripcion       text,
  logo_url          text,                    -- URL o ruta en Supabase Storage
  color             text default '#a855f7',  -- color de marca para el glow de la card
  destacado         boolean not null default false,
  activo            boolean not null default true,
  orden             int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists services_category_idx on services(category_id);
create index if not exists services_activo_idx   on services(activo);

-- Un servicio puede tener varios planes (Premium 30 días, Estándar 60 días, 1 pantalla...)
create table if not exists service_plans (
  id                uuid primary key default gen_random_uuid(),
  service_id        uuid not null references services(id) on delete cascade,
  nombre            text not null,                 -- "Premium · 1 pantalla"
  descripcion       text,
  duracion_dias     int  not null default 30 check (duracion_dias > 0),
  precio_venta      numeric(12,2) not null check (precio_venta >= 0),
  precio_descuento  numeric(12,2) check (precio_descuento >= 0),
  pantallas         int default 1,
  disponible        boolean not null default true, -- disponibilidad manual (vitrina)
  activo            boolean not null default true,
  orden             int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists service_plans_service_idx on service_plans(service_id);

-- ============================================================================
-- 5. PROVEEDORES y sus precios (base del comparador)
-- ============================================================================

create table if not exists providers (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  contacto     text,
  whatsapp     text,
  email        text,
  condiciones  text,                          -- garantía, tiempos de entrega, etc.
  notas        text,
  estado       provider_status not null default 'activo',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Precio al que ESTE proveedor vende ESTE servicio (opcionalmente atado a un plan)
create table if not exists provider_prices (
  id             uuid primary key default gen_random_uuid(),
  provider_id    uuid not null references providers(id) on delete cascade,
  service_id     uuid not null references services(id) on delete cascade,
  plan_id        uuid references service_plans(id) on delete set null,
  etiqueta       text,                                    -- "Premium 1 pantalla"
  costo          numeric(12,2) not null check (costo >= 0),
  duracion_dias  int not null default 30 check (duracion_dias > 0),
  condiciones    text,
  activo         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists provider_prices_service_idx  on provider_prices(service_id);
create index if not exists provider_prices_provider_idx on provider_prices(provider_id);

-- ============================================================================
-- 6. CLIENTES
-- ============================================================================

create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  whatsapp    text not null,
  email       text,
  documento   text,
  estado      customer_status not null default 'activo',
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists customers_whatsapp_idx on customers(whatsapp);

-- ============================================================================
-- 7. CUENTAS / INVENTARIO
-- Cada fila es una cuenta o cupo adquirido a un proveedor, que luego se vende.
-- ============================================================================

create table if not exists accounts (
  id                 uuid primary key default gen_random_uuid(),
  service_id         uuid not null references services(id) on delete restrict,
  plan_id            uuid references service_plans(id) on delete set null,
  provider_id        uuid references providers(id) on delete set null,
  customer_id        uuid references customers(id) on delete set null,

  -- datos de entrega (no guardar contraseñas en claro si puedes evitarlo)
  credencial_usuario text,
  credencial_secreto text,
  perfil             text,
  pin                text,
  info_entrega       text,

  fecha_adquisicion  date not null default current_date,
  fecha_activacion   date,
  fecha_vencimiento  date,

  costo_adquisicion  numeric(12,2) not null default 0 check (costo_adquisicion >= 0),
  precio_venta       numeric(12,2) not null default 0 check (precio_venta >= 0),
  ganancia           numeric(12,2) generated always as (precio_venta - costo_adquisicion) stored,

  estado             account_status not null default 'disponible',
  notas              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists accounts_estado_idx      on accounts(estado);
create index if not exists accounts_vencimiento_idx on accounts(fecha_vencimiento);
create index if not exists accounts_customer_idx    on accounts(customer_id);
create index if not exists accounts_service_idx     on accounts(service_id);

-- ============================================================================
-- 8. VENTAS
-- ============================================================================

create sequence if not exists sale_number_seq start 1000;

create table if not exists sales (
  id             uuid primary key default gen_random_uuid(),
  numero         int not null unique default nextval('sale_number_seq'),
  customer_id    uuid references customers(id) on delete set null,
  account_id     uuid references accounts(id) on delete set null,
  service_id     uuid references services(id) on delete set null,
  plan_id        uuid references service_plans(id) on delete set null,
  provider_id    uuid references providers(id) on delete set null,

  precio         numeric(12,2) not null default 0 check (precio >= 0),
  costo          numeric(12,2) not null default 0 check (costo >= 0),
  ganancia       numeric(12,2) generated always as (precio - costo) stored,

  fecha          timestamptz not null default now(),
  metodo_pago    payment_method not null default 'nequi',
  estado         sale_status not null default 'pagada',
  notas          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists sales_fecha_idx    on sales(fecha desc);
create index if not exists sales_customer_idx on sales(customer_id);
create index if not exists sales_service_idx  on sales(service_id);

-- ============================================================================
-- 9. AJUSTES DEL SITIO (editables desde el panel)
-- ============================================================================

create table if not exists settings (
  key         text primary key,
  value       text,
  descripcion text,
  updated_at  timestamptz not null default now()
);

insert into settings (key, value, descripcion) values
  ('whatsapp_numero',  '573014605500', 'Número de WhatsApp en formato internacional sin +'),
  ('marca_nombre',     'NOVAPLAY',     'Nombre de la marca'),
  ('marca_claim',      'Tu entretenimiento favorito, en un solo lugar.', 'Frase principal del hero'),
  ('dias_alerta',      '7',            'Días de anticipación para alertar vencimientos'),
  ('moneda',           'COP',          'Moneda de los precios')
on conflict (key) do nothing;

-- ============================================================================
-- 10. TRIGGERS updated_at
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'admin_profiles','categories','services','service_plans','providers',
    'provider_prices','customers','accounts','sales'
  ] loop
    execute format('drop trigger if exists set_%1$s_updated_at on %1$I;', t);
    execute format(
      'create trigger set_%1$s_updated_at before update on %1$I
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
-- 11. VISTAS DE NEGOCIO
-- ============================================================================

-- 11.1 Comparador de proveedores: costo normalizado a 30 días + margen estimado
create or replace view v_provider_comparison as
select
  pp.id                                                as price_id,
  s.id                                                 as service_id,
  s.nombre                                             as servicio,
  s.slug                                               as servicio_slug,
  pr.id                                                as provider_id,
  pr.nombre                                            as proveedor,
  pr.estado                                            as proveedor_estado,
  coalesce(pp.etiqueta, sp.nombre, 'General')          as plan,
  pp.costo,
  pp.duracion_dias,
  round(pp.costo / nullif(pp.duracion_dias, 0), 2)     as costo_por_dia,
  round((pp.costo / nullif(pp.duracion_dias, 0)) * 30, 2) as costo_30_dias,
  sp.precio_venta,
  (sp.precio_venta - pp.costo)                         as margen,
  case when sp.precio_venta > 0
       then round(((sp.precio_venta - pp.costo) / sp.precio_venta) * 100, 1)
  end                                                  as margen_pct,
  pp.condiciones,
  pp.activo
from provider_prices pp
join providers pr on pr.id = pp.provider_id
join services  s  on s.id  = pp.service_id
left join service_plans sp on sp.id = pp.plan_id;

-- 11.2 Vencimientos con semáforo
create or replace view v_expirations as
select
  a.id                as account_id,
  a.fecha_vencimiento,
  (a.fecha_vencimiento - current_date)          as dias_restantes,
  case
    when a.fecha_vencimiento is null            then 'sin_fecha'
    when a.fecha_vencimiento <  current_date    then 'vencido'
    when a.fecha_vencimiento =  current_date    then 'hoy'
    when a.fecha_vencimiento <= current_date + 3 then 'critico'
    when a.fecha_vencimiento <= current_date + 7 then 'proximo'
    else 'ok'
  end                 as semaforo,
  a.estado,
  c.id                as customer_id,
  c.nombre            as cliente,
  c.whatsapp          as cliente_whatsapp,
  s.nombre            as servicio,
  s.logo_url          as servicio_logo,
  sp.nombre           as plan,
  pr.nombre           as proveedor,
  a.precio_venta,
  a.costo_adquisicion
from accounts a
left join customers     c  on c.id  = a.customer_id
left join services      s  on s.id  = a.service_id
left join service_plans sp on sp.id = a.plan_id
left join providers     pr on pr.id = a.provider_id
where a.estado in ('vendida','activa','por_vencer','vencida');

-- 11.3 Resumen financiero por mes
create or replace view v_finance_monthly as
select
  date_trunc('month', fecha)::date as mes,
  count(*)                         as ventas,
  sum(precio)                      as ingresos,
  sum(costo)                       as costos,
  sum(ganancia)                    as ganancia
from sales
where estado in ('pagada','entregada')
group by 1
order by 1;

-- 11.4 Rentabilidad por servicio
create or replace view v_finance_by_service as
select
  s.id as service_id,
  s.nombre as servicio,
  count(v.*)          as ventas,
  coalesce(sum(v.precio), 0)   as ingresos,
  coalesce(sum(v.costo), 0)    as costos,
  coalesce(sum(v.ganancia), 0) as ganancia
from services s
left join sales v on v.service_id = s.id and v.estado in ('pagada','entregada')
group by s.id, s.nombre
order by ganancia desc;

-- 11.5 Rentabilidad por proveedor
create or replace view v_finance_by_provider as
select
  p.id as provider_id,
  p.nombre as proveedor,
  count(v.*)          as ventas,
  coalesce(sum(v.costo), 0)    as invertido,
  coalesce(sum(v.ganancia), 0) as ganancia
from providers p
left join sales v on v.provider_id = p.id and v.estado in ('pagada','entregada')
group by p.id, p.nombre
order by ganancia desc;

-- 11.6 Catálogo público (servicio + su plan más barato)
create or replace view v_public_catalog as
select
  s.id, s.slug, s.nombre, s.descripcion_corta, s.descripcion,
  s.logo_url, s.color, s.destacado, s.orden,
  c.slug   as categoria_slug,
  c.nombre as categoria,
  (select min(sp.precio_venta) from service_plans sp
    where sp.service_id = s.id and sp.activo) as precio_desde,
  (select count(*) from service_plans sp
    where sp.service_id = s.id and sp.activo and sp.disponible) as planes_disponibles
from services s
left join categories c on c.id = s.category_id
where s.activo = true;

-- ============================================================================
-- 12. FUNCIÓN: marcar automáticamente estados por vencimiento
-- Llamable desde el panel o desde un cron (pg_cron / Supabase scheduled function)
-- ============================================================================

create or replace function refresh_account_statuses()
returns table (por_vencer int, vencidas int)
language plpgsql security definer set search_path = public as $$
declare v_por_vencer int; v_vencidas int;
begin
  update accounts set estado = 'vencida'
   where fecha_vencimiento is not null
     and fecha_vencimiento < current_date
     and estado in ('activa','vendida','por_vencer');
  get diagnostics v_vencidas = row_count;

  update accounts set estado = 'por_vencer'
   where fecha_vencimiento is not null
     and fecha_vencimiento between current_date and current_date + 7
     and estado in ('activa','vendida');
  get diagnostics v_por_vencer = row_count;

  return query select v_por_vencer, v_vencidas;
end $$;

-- ============================================================================
-- 13. ESTADÍSTICAS DEL DASHBOARD (una sola llamada)
-- ============================================================================

create or replace function dashboard_stats()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'clientes_totales',    (select count(*) from customers),
    'clientes_activos',    (select count(*) from customers where estado = 'activo'),
    'servicios_vendidos',  (select count(*) from sales where estado in ('pagada','entregada')),
    'cuentas_activas',     (select count(*) from accounts where estado in ('activa','vendida')),
    'cuentas_disponibles', (select count(*) from accounts where estado = 'disponible'),
    'por_vencer',          (select count(*) from accounts
                             where fecha_vencimiento between current_date and current_date + 7
                               and estado in ('activa','vendida','por_vencer')),
    'vencidas',            (select count(*) from accounts
                             where fecha_vencimiento < current_date
                               and estado in ('activa','vendida','por_vencer','vencida')),
    'proveedores_activos', (select count(*) from providers where estado = 'activo'),
    'servicios_catalogo',  (select count(*) from services where activo = true),
    'ventas_hoy',          (select coalesce(sum(precio),0) from sales
                             where estado in ('pagada','entregada')
                               and fecha >= date_trunc('day', now())),
    'ventas_mes',          (select coalesce(sum(precio),0) from sales
                             where estado in ('pagada','entregada')
                               and fecha >= date_trunc('month', now())),
    'costos_mes',          (select coalesce(sum(costo),0) from sales
                             where estado in ('pagada','entregada')
                               and fecha >= date_trunc('month', now())),
    'ganancia_mes',        (select coalesce(sum(ganancia),0) from sales
                             where estado in ('pagada','entregada')
                               and fecha >= date_trunc('month', now())),
    'ganancia_total',      (select coalesce(sum(ganancia),0) from sales
                             where estado in ('pagada','entregada'))
  );
$$;

-- ============================================================================
-- 14. SEGURIDAD (RLS)
-- Público: solo lectura del catálogo activo.
-- Todo lo demás: solo administradores autenticados.
-- ============================================================================

alter table admin_profiles  enable row level security;
alter table categories      enable row level security;
alter table services        enable row level security;
alter table service_plans   enable row level security;
alter table providers       enable row level security;
alter table provider_prices enable row level security;
alter table customers       enable row level security;
alter table accounts        enable row level security;
alter table sales           enable row level security;
alter table settings        enable row level security;

-- --- Catálogo: lectura pública de lo activo -------------------------------
drop policy if exists "catalogo publico categorias" on categories;
create policy "catalogo publico categorias" on categories
  for select using (activo = true);

drop policy if exists "catalogo publico servicios" on services;
create policy "catalogo publico servicios" on services
  for select using (activo = true);

drop policy if exists "catalogo publico planes" on service_plans;
create policy "catalogo publico planes" on service_plans
  for select using (activo = true);

drop policy if exists "ajustes publicos" on settings;
create policy "ajustes publicos" on settings
  for select using (key in ('whatsapp_numero','marca_nombre','marca_claim','moneda'));

-- --- Administración total --------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'categories','services','service_plans','providers','provider_prices',
    'customers','accounts','sales','settings'
  ] loop
    execute format('drop policy if exists "admin total %1$s" on %1$I;', t);
    execute format(
      'create policy "admin total %1$s" on %1$I
         for all to authenticated using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

drop policy if exists "perfil propio" on admin_profiles;
create policy "perfil propio" on admin_profiles
  for select to authenticated using (id = auth.uid() or is_admin());

drop policy if exists "perfil propio update" on admin_profiles;
create policy "perfil propio update" on admin_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============================================================================
-- FIN
-- ============================================================================
