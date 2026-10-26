import type { Params } from '../core/types'
import { useApp, type DisenoGuardado } from '../store/useApp'
import { supabase } from './supabase'

// Las tablas están en el esquema aislado «carpinteria»: se accede por las funciones public.carpinteria_*.

/** Guarda en Supabase si hay sesión; si no, en este navegador. */
export async function guardarDiseno(proyecto: string, nombre: string, params: Params): Promise<'nube' | 'local'> {
  const { sesion, guardarLocal } = useApp.getState()
  if (supabase && sesion) {
    const { error } = await supabase.rpc('carpinteria_guardar_diseno', { p_proyecto: proyecto, p_nombre: nombre, p_params: params })
    if (error) throw error
    return 'nube'
  }
  guardarLocal({ id: crypto.randomUUID(), proyecto, nombre, params, creado: new Date().toISOString() })
  return 'local'
}

export async function listarDisenosNube(): Promise<DisenoGuardado[]> {
  if (!supabase || !useApp.getState().sesion) return []
  const { data, error } = await supabase.rpc('carpinteria_listar_disenos')
  if (error) throw error
  return ((data ?? []) as { id: string; proyecto: string; nombre: string; params: Params; created_at: string }[]).map((d) => ({
    id: d.id,
    proyecto: d.proyecto,
    nombre: d.nombre,
    params: d.params,
    creado: d.created_at,
  }))
}

export async function borrarDisenoNube(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.rpc('carpinteria_borrar_diseno', { p_id: id })
  if (error) throw error
}
