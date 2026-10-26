import type { Params } from '../core/types'
import { useApp, type DisenoGuardado } from '../store/useApp'
import { supabase } from './supabase'

/** Guarda en Supabase si hay sesión; si no, en este navegador. */
export async function guardarDiseno(proyecto: string, nombre: string, params: Params): Promise<'nube' | 'local'> {
  const { sesion, guardarLocal } = useApp.getState()
  if (supabase && sesion) {
    const { error } = await supabase.from('disenos').insert({ proyecto, nombre, params, user_id: sesion.user.id })
    if (error) throw error
    return 'nube'
  }
  guardarLocal({ id: crypto.randomUUID(), proyecto, nombre, params, creado: new Date().toISOString() })
  return 'local'
}

export async function listarDisenosNube(): Promise<DisenoGuardado[]> {
  if (!supabase || !useApp.getState().sesion) return []
  const { data, error } = await supabase.from('disenos').select('id, proyecto, nombre, params, created_at').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((d) => ({ id: d.id, proyecto: d.proyecto, nombre: d.nombre, params: d.params, creado: d.created_at }))
}

export async function borrarDisenoNube(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('disenos').delete().eq('id', id)
  if (error) throw error
}
