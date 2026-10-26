import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Precios } from '../core/costos'
import type { Params } from '../core/types'
import { TIENDAS_POR_DEFECTO, type Tienda } from '../core/tiendas'

export interface DisenoGuardado {
  id: string
  proyecto: string
  nombre: string
  params: Params
  creado: string
}

interface AppState {
  /** Precios que la persona ajustó en su navegador. */
  precios: Precios
  setPrecio: (id: string, precio: number | null) => void
  /** Precios publicados en Supabase; reemplazan a los del código. */
  preciosBase: Precios
  setPreciosBase: (p: Precios) => void
  tiendas: Tienda[]
  setTiendas: (t: Tienda[]) => void
  locales: DisenoGuardado[]
  guardarLocal: (d: DisenoGuardado) => void
  borrarLocal: (id: string) => void
  sesion: Session | null
  setSesion: (s: Session | null) => void
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      precios: {},
      setPrecio: (id, precio) =>
        set((s) => {
          const precios = { ...s.precios }
          if (precio === null) delete precios[id]
          else precios[id] = precio
          return { precios }
        }),
      preciosBase: {},
      setPreciosBase: (preciosBase) => set({ preciosBase }),
      tiendas: TIENDAS_POR_DEFECTO,
      setTiendas: (tiendas) => set({ tiendas }),
      locales: [],
      guardarLocal: (d) => set((s) => ({ locales: [d, ...s.locales.filter((x) => x.id !== d.id)] })),
      borrarLocal: (id) => set((s) => ({ locales: s.locales.filter((x) => x.id !== id) })),
      sesion: null,
      setSesion: (sesion) => set({ sesion }),
    }),
    {
      name: 'carpinteria-hogar',
      partialize: (s) => ({ precios: s.precios, locales: s.locales }),
    },
  ),
)
