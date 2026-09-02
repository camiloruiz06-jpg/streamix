-- ============================================================================
-- STREAMIX · Migración: plazas por cuenta y suscripciones por cliente
-- ----------------------------------------------------------------------------
-- Qué cambia:
--   · Una CUENTA deja de pertenecer a un solo cliente. Ahora es inventario:
--     tiene N plazas y varias personas pueden ocuparla.
--   · Aparece la SUSCRIPCIÓN: los días a los que un cliente tiene derecho.
--     Vive aparte de la cuenta, así que puedes moverlo a otra cuenta sin que
--     pierda un solo día.
--
-- Es segura de correr sobre la base que ya tienes: no borra nada y convierte
-- sola las cuentas que hoy están asignadas a un cliente.
-- Se puede ejecutar varias veces sin romper nada.
--
-- Ejecutar en:  Supabase → SQL Editor → New query
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
  (a.fecha_vencimiento is not null and a.fecha_vencimiento < sb.fecha_fin) as necesita_reemplazo,
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
