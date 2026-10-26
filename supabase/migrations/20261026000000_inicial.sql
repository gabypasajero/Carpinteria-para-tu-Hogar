-- Diseños guardados por cada persona
create table if not exists public.disenos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  proyecto text not null,
  nombre text not null,
  params jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.disenos enable row level security;

create policy "disenos: ver los propios" on public.disenos
  for select using (auth.uid() = user_id);
create policy "disenos: crear los propios" on public.disenos
  for insert with check (auth.uid() = user_id);
create policy "disenos: borrar los propios" on public.disenos
  for delete using (auth.uid() = user_id);

-- Solicitudes de cotización «¿No quieres hacerlo tú?»
create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  tienda text not null check (tienda in ('detodito', 'molina', 'cualquiera')),
  proyecto text not null,
  params jsonb not null,
  costo_materiales integer,
  nombre text not null,
  telefono text not null,
  email text,
  comuna text not null,
  comentario text,
  estado text not null default 'nueva' check (estado in ('nueva', 'contactada', 'cotizada', 'vendida', 'descartada')),
  created_at timestamptz not null default now()
);

alter table public.solicitudes enable row level security;

-- Cualquiera puede enviar una solicitud, pero nadie puede leerlas desde la app pública:
-- las tiendas las ven desde el panel de Supabase (o un panel propio con rol de servicio).
create policy "solicitudes: enviar" on public.solicitudes
  for insert with check (user_id is null or auth.uid() = user_id);
