import { useApp } from '../store/useApp'
import { supabase } from './supabase'

/** Trae tiendas y precios desde el esquema «carpinteria» de Supabase. */
export async function cargarDatosRemotos(): Promise<void> {
  if (!supabase) return
  const [tiendas, precios] = await Promise.all([supabase.rpc('carpinteria_tiendas'), supabase.rpc('carpinteria_precios')])
  const { setTiendas, setPreciosBase } = useApp.getState()
  if (!tiendas.error && tiendas.data?.length) {
    setTiendas(
      (tiendas.data as { id: string; nombre: string; whatsapp: string | null; factor_fabricacion: number }[]).map((t) => ({
        id: t.id,
        nombre: t.nombre,
        whatsapp: t.whatsapp,
        factor: Number(t.factor_fabricacion),
      })),
    )
  }
  if (!precios.error && precios.data) {
    setPreciosBase(Object.fromEntries((precios.data as { id: string; precio: number }[]).map((p) => [p.id, p.precio])))
  }
}
