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


-- ============================================================================
-- 12. PLAZAS Y SUSCRIPCIONES
-- ----------------------------------------------------------------------------
-- Una cuenta es inventario con N plazas; la suscripción son los días que le
-- debes a un cliente. Así puedes moverlo de cuenta sin que pierda tiempo.
-- (Mismo contenido que supabase/migracion-plazas.sql, para instalaciones nuevas)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Plazas en las cuentas
-- ----------------------------------------------------------------------------

alter table accounts add column if not exists plazas_totales int not null default 1;

do $$ begin
  alter table accounts add constraint accounts_plazas_chk check (plazas_totales between 1 and 50);
exception when duplicate_object then null; end $$;

comment on column accounts.plazas_totales is
  'Cuántos clientes caben en esta cuenta (perfiles o pantallas que revendes).';

-- ----------------------------------------------------------------------------
-- 2. Suscripciones: los días que le debes a cada cliente
-- ----------------------------------------------------------------------------

do $$ begin
  create type subscription_status as enum ('activa', 'por_vencer', 'vencida', 'pausada', 'cancelada');
exception when duplicate_object then null; end $$;

create table if not exists subscriptions (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references customers(id)     on delete cascade,
  service_id    uuid not null references services(id)      on delete restrict,
  plan_id       uuid references service_plans(id)          on delete set null,

  -- La plaza que ocupa HOY. Puede cambiar sin tocar las fechas de abajo.
  account_id    uuid references accounts(id)               on delete set null,
  perfil        text,
  pin           text,

  fecha_inicio  date not null default current_date,
  fecha_fin     date not null,          -- hasta cuándo tiene derecho el cliente
  precio        numeric(12,2) not null default 0 check (precio >= 0),

  estado        subscription_status not null default 'activa',
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists subs_customer_idx on subscriptions(customer_id);
create index if not exists subs_account_idx  on subscriptions(account_id);
create index if not exists subs_fin_idx      on subscriptions(fecha_fin);
create index if not exists subs_estado_idx   on subscriptions(estado);

drop trigger if exists trg_subscriptions_updated on subscriptions;
create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

comment on table subscriptions is
  'Lo que le vendiste a un cliente: un servicio hasta una fecha. La cuenta que usa es intercambiable.';

-- ----------------------------------------------------------------------------
-- 3. Convertir lo que ya existe
--    Cada cuenta que hoy tiene un cliente asignado pasa a ser una suscripción.
-- ----------------------------------------------------------------------------

insert into subscriptions (customer_id, service_id, plan_id, account_id, perfil, pin,
                           fecha_inicio, fecha_fin, precio, estado, notas)
select a.customer_id,
       a.service_id,
       a.plan_id,
       a.id,
       a.perfil,
       a.pin,
       coalesce(a.fecha_activacion, a.fecha_adquisicion, current_date),
       coalesce(a.fecha_vencimiento, current_date),
       a.precio_venta,
       case
         when coalesce(a.fecha_vencimiento, current_date) < current_date then 'vencida'
         else 'activa'
       end::subscription_status,
       'Creada automáticamente al migrar a plazas'
from accounts a
where a.customer_id is not null
  and not exists (
    select 1 from subscriptions s
    where s.account_id = a.id and s.customer_id = a.customer_id
  );

-- Las ventas viejas se quedan como están; solo agregamos el enlace opcional.
alter table sales add column if not exists subscription_id uuid references subscriptions(id) on delete set null;

update sales v
set subscription_id = s.id
from subscriptions s
where v.subscription_id is null
  and v.account_id = s.account_id
  and v.customer_id = s.customer_id;

-- ----------------------------------------------------------------------------
-- 4. Vistas
-- ----------------------------------------------------------------------------

-- 4.1 Plazas de cada cuenta: cuántas hay, cuántas ocupadas, cuántas libres.
create or replace view v_account_slots as
select
  a.id                                   as account_id,
  a.service_id,
  a.plan_id,
  a.provider_id,
  s.nombre                               as servicio,
  s.color                                as servicio_color,
  p.nombre                               as plan,
  p.duracion_dias,
  pr.nombre                              as proveedor,
  a.credencial_usuario,
  a.fecha_adquisicion,
  a.fecha_vencimiento,
  a.costo_adquisicion,
  a.plazas_totales,
  coalesce(o.ocupadas, 0)::int           as plazas_ocupadas,
  (a.plazas_totales - coalesce(o.ocupadas, 0))::int as plazas_libres,
  a.estado,
  a.notas,
  case
    when a.fecha_vencimiento is null then null
    else (a.fecha_vencimiento - current_date)
  end                                    as dias_cuenta,
  -- costo por plaza: lo que realmente te cuesta cada persona
  case when a.plazas_totales > 0
       then round(a.costo_adquisicion / a.plazas_totales, 2)
       else a.costo_adquisicion end      as costo_por_plaza
from accounts a
left join services s       on s.id  = a.service_id
left join service_plans p  on p.id  = a.plan_id
left join providers pr     on pr.id = a.provider_id
left join (
  select account_id, count(*) as ocupadas
  from subscriptions
  where account_id is not null
    and estado in ('activa', 'por_vencer')
  group by account_id
) o on o.account_id = a.id;

-- 4.2 Suscripciones con su semáforo y el aviso de "la cuenta se vence antes".
create or replace view v_subscriptions as
select
  sb.id                       as subscription_id,
  sb.customer_id,
  c.nombre                    as cliente,
  c.whatsapp                  as cliente_whatsapp,
  sb.service_id,
  s.nombre                    as servicio,
  s.color                     as servicio_color,
  sb.plan_id,
  p.nombre                    as plan,
  p.duracion_dias,
  sb.account_id,
  a.credencial_usuario,
  sb.perfil,
  sb.pin,
  a.provider_id,
  pr.nombre                   as proveedor,
  sb.fecha_inicio,
  sb.fecha_fin,
  a.fecha_vencimiento         as cuenta_vence,
  sb.precio,
  a.costo_adquisicion,
  sb.estado,
  (sb.fecha_fin - current_date)                       as dias_restantes,
  (a.fecha_vencimiento - current_date)                as dias_cuenta,
  -- La cuenta se acaba antes de que se acaben los días del cliente
  a.estado                    as cuenta_estado,
  -- Hay que sacarlo de esa cuenta si: la marcaste como vencida/suspendida/
  -- cancelada, o si la cuenta se muere antes de que se le acaben sus días.
  (
    a.id is not null and (
      a.estado in ('vencida', 'suspendida', 'cancelada')
      or (a.fecha_vencimiento is not null and a.fecha_vencimiento < sb.fecha_fin)
    )
  )                           as necesita_reemplazo,
  case
    when sb.account_id is null                        then 'sin_cuenta'
    when (sb.fecha_fin - current_date) <  0           then 'vencido'
    when (sb.fecha_fin - current_date) =  0           then 'hoy'
    when (sb.fecha_fin - current_date) <= 3           then 'critico'
    when (sb.fecha_fin - current_date) <= 7           then 'proximo'
    else 'ok'
  end                                                 as semaforo
from subscriptions sb
left join customers c      on c.id  = sb.customer_id
left join services  s      on s.id  = sb.service_id
left join service_plans p  on p.id  = sb.plan_id
left join accounts  a      on a.id  = sb.account_id
left join providers pr     on pr.id = a.provider_id
where sb.estado <> 'cancelada';

-- 4.3 De qué proveedor conviene comprar cada servicio, el más barato primero.
create or replace view v_provider_options as
select
  pp.id                     as price_id,
  pp.service_id,
  s.nombre                  as servicio,
  pp.plan_id,
  pl.nombre                 as plan,
  pp.provider_id,
  pr.nombre                 as proveedor,
  pr.whatsapp               as proveedor_whatsapp,
  pr.estado                 as proveedor_estado,
  pp.etiqueta,
  pp.costo,
  pp.duracion_dias,
  pp.condiciones,
  (pp.costo + 2000)         as precio_sugerido,
  row_number() over (
    partition by pp.service_id, coalesce(pp.plan_id, '00000000-0000-0000-0000-000000000000'::uuid)
    order by pp.costo asc, pr.nombre asc
  )                         as puesto
from provider_prices pp
join providers pr     on pr.id = pp.provider_id
left join services s      on s.id  = pp.service_id
left join service_plans pl on pl.id = pp.plan_id
where pp.activo = true and pr.estado = 'activo';

-- ----------------------------------------------------------------------------
-- 5. Funciones de negocio
-- ----------------------------------------------------------------------------

-- 5.1 ¿Cabe alguien más en esta cuenta?
create or replace function plazas_libres(p_account uuid)
returns int language sql stable as $$
  select greatest(
    0,
    (select plazas_totales from accounts where id = p_account)
    - (select count(*) from subscriptions
       where account_id = p_account and estado in ('activa','por_vencer'))
  )::int;
$$;

-- 5.2 Mover un cliente a otra cuenta SIN perder sus días.
create or replace function mover_suscripcion(p_subscription uuid, p_account uuid, p_perfil text default null)
returns subscriptions language plpgsql security definer set search_path = public as $$
declare fila subscriptions;
begin
  if p_account is not null and plazas_libres(p_account) < 1 then
    -- Solo bloqueamos si de verdad va a entrar alguien nuevo
    if not exists (select 1 from subscriptions where id = p_subscription and account_id = p_account) then
      raise exception 'Esa cuenta ya no tiene plazas libres.';
    end if;
  end if;

  update subscriptions
  set account_id = p_account,
      perfil     = coalesce(p_perfil, perfil),
      estado     = case when estado = 'vencida' then estado else 'activa' end
  where id = p_subscription
  returning * into fila;

  if fila.id is null then raise exception 'No encontré esa suscripción.'; end if;
  return fila;
end $$;

-- 5.3 Renovar: suma días a partir de hoy o de la fecha de fin, lo que sea mayor.
create or replace function renovar_suscripcion(
  p_subscription uuid,
  p_dias         int,
  p_account      uuid          default null,
  p_precio       numeric       default null,
  p_metodo       payment_method default 'llaves'
) returns subscriptions language plpgsql security definer set search_path = public as $$
declare fila subscriptions; base date; nuevo_costo numeric;
begin
  select * into fila from subscriptions where id = p_subscription;
  if fila.id is null then raise exception 'No encontré esa suscripción.'; end if;

  -- Si todavía le quedan días, se los respetamos y sumamos encima.
  base := greatest(fila.fecha_fin, current_date);

  if p_account is not null and p_account is distinct from fila.account_id then
    perform mover_suscripcion(p_subscription, p_account, null);
  end if;

  update subscriptions
  set fecha_fin = base + p_dias,
      precio    = coalesce(p_precio, precio),
      estado    = 'activa'
  where id = p_subscription
  returning * into fila;

  -- El costo de la cuenta se carga una sola vez, en su primera venta.
  -- Una renovación sobre una cuenta ya pagada no vuelve a costar.
  select case
           when fila.account_id is null then 0
           when exists (select 1 from sales where account_id = fila.account_id) then 0
           else coalesce((select costo_adquisicion from accounts where id = fila.account_id), 0)
         end
    into nuevo_costo;

  insert into sales (customer_id, account_id, service_id, plan_id, provider_id,
                     subscription_id, precio, costo, metodo_pago, estado, notas)
  values (
    fila.customer_id,
    fila.account_id,
    fila.service_id,
    fila.plan_id,
    (select provider_id from accounts where id = fila.account_id),
    fila.id,
    coalesce(p_precio, fila.precio),
    coalesce(nuevo_costo, 0),
    p_metodo,
    'entregada'::sale_status,
    'Renovación por ' || p_dias || ' días'
  );

  return fila;
end $$;

-- 5.4 Recalcular estados según la fecha de hoy.
create or replace function refresh_subscription_statuses()
returns table (por_vencer int, vencidas int)
language plpgsql security definer set search_path = public as $$
declare a int; b int;
begin
  update subscriptions set estado = 'vencida'
  where estado in ('activa','por_vencer') and fecha_fin < current_date;
  get diagnostics b = row_count;

  update subscriptions set estado = 'por_vencer'
  where estado = 'activa'
    and fecha_fin >= current_date
    and fecha_fin <= current_date + 3;
  get diagnostics a = row_count;

  -- Las cuentas sin nadie encima vuelven a estar disponibles
  update accounts set estado = 'disponible'
  where estado in ('activa','vendida')
    and (fecha_vencimiento is null or fecha_vencimiento >= current_date)
    and plazas_libres(id) = plazas_totales;

  update accounts set estado = 'vencida'
  where fecha_vencimiento is not null
    and fecha_vencimiento < current_date
    and estado not in ('vencida','cancelada');

  return query select a, b;
end $$;

-- ----------------------------------------------------------------------------
-- 6. Seguridad (RLS)
-- ----------------------------------------------------------------------------

alter table subscriptions enable row level security;

drop policy if exists "admin total subscriptions" on subscriptions;
create policy "admin total subscriptions" on subscriptions
  for all to authenticated using (is_admin()) with check (is_admin());

-- Las vistas heredan los permisos de las tablas que consultan.
grant select on v_account_slots, v_subscriptions, v_provider_options to authenticated;


-- ============================================================================
-- 13. CLIENTES POR NÚMERO O POR @USUARIO
-- ----------------------------------------------------------------------------
-- WhatsApp permite un @usuario público además del número; los dos conviven.
-- Un cliente se identifica con lo que tengas, y el nombre es opcional.
-- (Mismo contenido que supabase/migracion-clientes.sql)
-- ============================================================================


alter table customers add column if not exists usuario text;

-- El nombre y el número dejan de ser obligatorios
do $$ begin
  alter table customers alter column nombre   drop not null;
exception when others then null; end $$;

do $$ begin
  alter table customers alter column whatsapp drop not null;
exception when others then null; end $$;

-- Pero algo tiene que haber: número o usuario
do $$ begin
  alter table customers add constraint customers_contacto_chk
    check (coalesce(whatsapp, '') <> '' or coalesce(usuario, '') <> '');
exception when duplicate_object then null; end $$;

create index if not exists customers_usuario_idx on customers(usuario);

comment on column customers.usuario is
  'Nombre de usuario de WhatsApp, sin la @. Convive con el número.';

-- Cómo se muestra un cliente: su nombre si lo pusiste, si no el @usuario,
-- y si no el número.
create or replace function etiqueta_cliente(p_nombre text, p_usuario text, p_whatsapp text)
returns text language sql immutable as $$
  select coalesce(
    nullif(trim(coalesce(p_nombre, '')), ''),
    case when nullif(trim(coalesce(p_usuario, '')), '') is not null
         then '@' || trim(p_usuario) end,
    nullif(trim(coalesce(p_whatsapp, '')), ''),
    'Sin identificar'
  );
$$;

-- La vista de suscripciones ahora usa esa etiqueta.
-- Se recrea desde cero porque cambian sus columnas, y "create or replace"
-- de PostgreSQL solo deja agregarlas al final.
drop view if exists v_subscriptions;
create view v_subscriptions as
select
  sb.id                       as subscription_id,
  sb.customer_id,
  etiqueta_cliente(c.nombre, c.usuario, c.whatsapp) as cliente,
  c.whatsapp                  as cliente_whatsapp,
  c.usuario                   as cliente_usuario,
  sb.service_id,
  s.nombre                    as servicio,
  s.color                     as servicio_color,
  sb.plan_id,
  p.nombre                    as plan,
  p.duracion_dias,
  sb.account_id,
  a.credencial_usuario,
  sb.perfil,
  sb.pin,
  a.provider_id,
  pr.nombre                   as proveedor,
  sb.fecha_inicio,
  sb.fecha_fin,
  a.fecha_vencimiento         as cuenta_vence,
  sb.precio,
  a.costo_adquisicion,
  sb.estado,
  (sb.fecha_fin - current_date)                       as dias_restantes,
  (a.fecha_vencimiento - current_date)                as dias_cuenta,
  a.estado                    as cuenta_estado,
  -- Hay que sacarlo de esa cuenta si: la marcaste como vencida/suspendida/
  -- cancelada, o si la cuenta se muere antes de que se le acaben sus días.
  (
    a.id is not null and (
      a.estado in ('vencida', 'suspendida', 'cancelada')
      or (a.fecha_vencimiento is not null and a.fecha_vencimiento < sb.fecha_fin)
    )
  )                           as necesita_reemplazo,
  case
    when sb.account_id is null                        then 'sin_cuenta'
    when (sb.fecha_fin - current_date) <  0           then 'vencido'
    when (sb.fecha_fin - current_date) =  0           then 'hoy'
    when (sb.fecha_fin - current_date) <= 3           then 'critico'
    when (sb.fecha_fin - current_date) <= 7           then 'proximo'
    else 'ok'
  end                                                 as semaforo
from subscriptions sb
left join customers c      on c.id  = sb.customer_id
left join services  s      on s.id  = sb.service_id
left join service_plans p  on p.id  = sb.plan_id
left join accounts  a      on a.id  = sb.account_id
left join providers pr     on pr.id = a.provider_id
where sb.estado <> 'cancelada';

grant select on v_subscriptions to authenticated;
