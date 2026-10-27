-- Carpintería para tu hogar
-- Todo vive en el esquema «carpinteria», separado del resto del proyecto de Supabase.
-- La app no accede a las tablas directamente: usa las funciones public.carpinteria_*
-- (así no hace falta publicar el esquema en la API). Todas son SECURITY INVOKER,
-- por lo que las políticas RLS de cada tabla siguen mandando.

create schema if not exists carpinteria;
grant usage on schema carpinteria to anon, authenticated;

-- Diseños guardados por cada persona ------------------------------------------
create table carpinteria.disenos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  proyecto text not null,
  nombre text not null check (char_length(nombre) between 1 and 120),
  params jsonb not null,
  created_at timestamptz not null default now()
);
create index disenos_user_idx on carpinteria.disenos (user_id, created_at desc);
alter table carpinteria.disenos enable row level security;

create policy "disenos: ver los propios" on carpinteria.disenos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "disenos: crear los propios" on carpinteria.disenos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "disenos: borrar los propios" on carpinteria.disenos
  for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, delete on carpinteria.disenos to authenticated;

-- Tiendas que fabrican («¿No quieres hacerlo tú?») -----------------------------
create table carpinteria.tiendas (
  id text primary key,
  nombre text not null,
  whatsapp text,
  -- Precio de fabricación estimado = costo de materiales × factor. Lo confirma la tienda.
  factor_fabricacion numeric(4, 2) not null default 2.5 check (factor_fabricacion >= 1),
  activa boolean not null default true,
  orden int not null default 0
);
alter table carpinteria.tiendas enable row level security;
create policy "tiendas: lectura pública" on carpinteria.tiendas for select to anon, authenticated using (activa);
grant select on carpinteria.tiendas to anon, authenticated;

insert into carpinteria.tiendas (id, nombre, orden) values
  ('detodito', 'De Todito Outlet', 1),
  ('molina', 'Muebles y Hogar Molina', 2);

-- Precios de materiales y herrajes (reemplazan a los referenciales del código) --
create table carpinteria.precios (
  id text primary key,
  precio integer not null check (precio >= 0),
  tienda text,
  actualizado timestamptz not null default now()
);
alter table carpinteria.precios enable row level security;
create policy "precios: lectura pública" on carpinteria.precios for select to anon, authenticated using (true);
grant select on carpinteria.precios to anon, authenticated;

-- Solicitudes de cotización ----------------------------------------------------
create table carpinteria.solicitudes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  tienda text not null check (tienda in ('detodito', 'molina', 'cualquiera')),
  proyecto text not null,
  params jsonb not null,
  costo_materiales integer,
  nombre text not null check (char_length(nombre) between 1 and 120),
  telefono text not null check (char_length(telefono) between 6 and 30),
  email text,
  comuna text not null check (char_length(comuna) between 1 and 80),
  comentario text check (char_length(comentario) <= 1000),
  enlace text,
  estado text not null default 'nueva' check (estado in ('nueva', 'contactada', 'cotizada', 'vendida', 'descartada')),
  created_at timestamptz not null default now()
);
create index solicitudes_estado_idx on carpinteria.solicitudes (estado, created_at desc);
alter table carpinteria.solicitudes enable row level security;
-- Cualquiera puede enviar; nadie puede leerlas desde la app pública.
-- Las tiendas las revisan en el panel de Supabase (Table Editor → esquema carpinteria).
create policy "solicitudes: enviar" on carpinteria.solicitudes
  for insert to anon, authenticated with check (user_id is null or user_id = (select auth.uid()));
grant insert on carpinteria.solicitudes to anon, authenticated;

-- Funciones que usa la app -----------------------------------------------------
create function public.carpinteria_tiendas()
returns table (id text, nombre text, whatsapp text, factor_fabricacion numeric)
language sql stable security invoker set search_path = ''
as $$
  select t.id, t.nombre, t.whatsapp, t.factor_fabricacion from carpinteria.tiendas t order by t.orden
$$;

create function public.carpinteria_precios()
returns table (id text, precio integer, tienda text, actualizado timestamptz)
language sql stable security invoker set search_path = ''
as $$
  select p.id, p.precio, p.tienda, p.actualizado from carpinteria.precios p
$$;

create function public.carpinteria_listar_disenos()
returns setof carpinteria.disenos
language sql stable security invoker set search_path = ''
as $$
  select * from carpinteria.disenos order by created_at desc
$$;

create function public.carpinteria_guardar_diseno(p_proyecto text, p_nombre text, p_params jsonb)
returns uuid
language sql security invoker set search_path = ''
as $$
  insert into carpinteria.disenos (proyecto, nombre, params) values (p_proyecto, p_nombre, p_params) returning id
$$;

create function public.carpinteria_borrar_diseno(p_id uuid)
returns void
language sql security invoker set search_path = ''
as $$
  delete from carpinteria.disenos where id = p_id
$$;

create function public.carpinteria_enviar_solicitud(
  p_tienda text, p_proyecto text, p_params jsonb, p_costo_materiales integer,
  p_nombre text, p_telefono text, p_email text, p_comuna text, p_comentario text, p_enlace text
)
returns void
language sql security invoker set search_path = ''
as $$
  insert into carpinteria.solicitudes
    (user_id, tienda, proyecto, params, costo_materiales, nombre, telefono, email, comuna, comentario, enlace)
  values
    (auth.uid(), p_tienda, p_proyecto, p_params, p_costo_materiales, p_nombre, p_telefono,
     nullif(p_email, ''), p_comuna, nullif(p_comentario, ''), p_enlace)
$$;

revoke execute on function public.carpinteria_listar_disenos() from public, anon;
revoke execute on function public.carpinteria_guardar_diseno(text, text, jsonb) from public, anon;
revoke execute on function public.carpinteria_borrar_diseno(uuid) from public, anon;
grant execute on function public.carpinteria_listar_disenos() to authenticated;
grant execute on function public.carpinteria_guardar_diseno(text, text, jsonb) to authenticated;
grant execute on function public.carpinteria_borrar_diseno(uuid) to authenticated;
grant execute on function public.carpinteria_tiendas() to anon, authenticated;
grant execute on function public.carpinteria_precios() to anon, authenticated;
grant execute on function public.carpinteria_enviar_solicitud(text, text, jsonb, integer, text, text, text, text, text, text) to anon, authenticated;
