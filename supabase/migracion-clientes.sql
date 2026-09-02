-- ============================================================================
-- STREAMIX · Clientes por número o por @usuario de WhatsApp
-- ----------------------------------------------------------------------------
-- WhatsApp ahora deja tener un @usuario público además del número. Los dos
-- conviven: el número sigue siendo la base de la cuenta, pero mucha gente ya
-- solo comparte el usuario.
--
-- A partir de aquí un cliente se identifica con lo que tengas: el número, el
-- @usuario, o los dos. El nombre pasa a ser opcional.
--
-- Segura de correr sobre lo que ya tienes. No borra nada.
-- Ejecutar en:  Supabase → SQL Editor → New query
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
