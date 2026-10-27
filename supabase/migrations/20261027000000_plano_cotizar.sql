-- Plano para cotizar: el diseño completo (lista de corte, herrajes y piezas en 3D) viaja con la solicitud,
-- para que la mueblería lo lea en su diseñador y arme el presupuesto. Formato: docs/formato-plano.md.
alter table carpinteria.solicitudes
  add column plano jsonb check (plano is null or pg_column_size(plano) < 512000);

drop function public.carpinteria_enviar_solicitud(text, text, jsonb, integer, text, text, text, text, text, text);

create function public.carpinteria_enviar_solicitud(
  p_tienda text, p_proyecto text, p_params jsonb, p_costo_materiales integer,
  p_nombre text, p_telefono text, p_email text, p_comuna text, p_comentario text, p_enlace text,
  p_plano jsonb default null
)
returns void
language sql security invoker set search_path = ''
as $$
  insert into carpinteria.solicitudes
    (user_id, tienda, proyecto, params, costo_materiales, nombre, telefono, email, comuna, comentario, enlace, plano)
  values
    (auth.uid(), p_tienda, p_proyecto, p_params, p_costo_materiales, p_nombre, p_telefono,
     nullif(p_email, ''), p_comuna, nullif(p_comentario, ''), p_enlace, p_plano)
$$;

revoke execute on function public.carpinteria_enviar_solicitud(text, text, jsonb, integer, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.carpinteria_enviar_solicitud(text, text, jsonb, integer, text, text, text, text, text, text, jsonb) to anon, authenticated;
