-- Investigación de mercado (Connan, 26-10-2026): precios reales por tienda y catálogo de proyectos.
-- Todo sigue en el esquema aislado «carpinteria»; la app lee por funciones public.carpinteria_*.

-- Trazabilidad del precio que usa la app (qué producto, dónde y en qué envase).
alter table carpinteria.precios
  add column if not exists producto text,
  add column if not exists url text,
  add column if not exists envase numeric,
  add column if not exists unidad_venta text;

-- Precio de cada ítem en cada tienda (la mejor opción encontrada en formato hogar).
create table if not exists carpinteria.precios_tiendas (
  item text not null,
  item_nombre text not null,
  categoria text not null,
  tienda text not null,
  sku text,
  producto text not null,
  marca text,
  precio integer not null check (precio >= 0),
  oferta integer,
  envase numeric not null default 1,
  unidad_envase text not null default 'u',
  url text not null,
  confianza text not null check (confianza in ('confirmado', 'variable', 'una_fuente', 'sin_datos')),
  consultado_en timestamptz not null,
  primary key (item, tienda, consultado_en)
);
alter table carpinteria.precios_tiendas enable row level security;
create policy "precios_tiendas: lectura pública" on carpinteria.precios_tiendas for select to anon, authenticated using (true);
grant select on carpinteria.precios_tiendas to anon, authenticated;

-- Herramientas en tres gamas (económica, media, premium).
create table if not exists carpinteria.herramientas_gamas (
  item text not null,
  gama text not null check (gama in ('economica', 'media', 'premium')),
  tienda text not null,
  producto text not null,
  marca text,
  precio integer not null,
  oferta integer,
  url text not null,
  consultado_en timestamptz not null,
  primary key (item, gama, consultado_en)
);
alter table carpinteria.herramientas_gamas enable row level security;
create policy "herramientas_gamas: lectura pública" on carpinteria.herramientas_gamas for select to anon, authenticated using (true);
grant select on carpinteria.herramientas_gamas to anon, authenticated;

-- Catálogo de proyectos (en la app y propuestos), con piezas, materiales, herramientas, reglas y permisos.
create table if not exists carpinteria.catalogo_proyectos (
  id text primary key,
  nombre text not null,
  categoria text not null,
  dificultad smallint not null check (dificultad between 1 and 3),
  motor text not null check (motor in ('caja', 'liston', 'exterior', 'entramado')),
  prioridad smallint not null check (prioridad between 1 and 3),
  estado text not null check (estado in ('en_app', 'propuesto', 'descartado')),
  datos jsonb not null,
  actualizado timestamptz not null default now()
);
alter table carpinteria.catalogo_proyectos enable row level security;
create policy "catalogo_proyectos: lectura pública" on carpinteria.catalogo_proyectos for select to anon, authenticated using (true);
grant select on carpinteria.catalogo_proyectos to anon, authenticated;

create or replace function public.carpinteria_precios_tiendas(p_item text default null)
returns setof carpinteria.precios_tiendas
language sql stable security invoker set search_path = ''
as $$
  select * from carpinteria.precios_tiendas
  where p_item is null or item = p_item
  order by item, precio
$$;

create or replace function public.carpinteria_catalogo()
returns setof carpinteria.catalogo_proyectos
language sql stable security invoker set search_path = ''
as $$
  select * from carpinteria.catalogo_proyectos order by prioridad, categoria, nombre
$$;

grant execute on function public.carpinteria_precios_tiendas(text) to anon, authenticated;
grant execute on function public.carpinteria_catalogo() to anon, authenticated;
