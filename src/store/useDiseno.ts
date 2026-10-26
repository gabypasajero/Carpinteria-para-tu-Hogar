import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DisenoLibre, PiezaLibre } from '../core/libre'
import type { HerrajeUso } from '../core/types'

interface DisenoState extends DisenoLibre {
  seleccion: string | null
  setNombre: (n: string) => void
  setSeleccion: (id: string | null) => void
  agregar: (p: PiezaLibre) => void
  actualizar: (id: string, cambios: Partial<PiezaLibre>) => void
  quitar: (id: string) => void
  setHerraje: (id: string, cantidad: number) => void
  cargar: (d: DisenoLibre) => void
  nuevo: () => void
  /** Diseños guardados en este navegador. */
  guardados: (DisenoLibre & { id: string; creado: string })[]
  guardar: () => void
  borrarGuardado: (id: string) => void
}

const vacio: DisenoLibre = { nombre: 'Mi proyecto', piezas: [], herrajes: [] }

export const useDiseno = create<DisenoState>()(
  persist(
    (set, get) => ({
      ...vacio,
      seleccion: null,
      setNombre: (nombre) => set({ nombre }),
      setSeleccion: (seleccion) => set({ seleccion }),
      agregar: (p) => set((s) => ({ piezas: [...s.piezas, p], seleccion: p.id })),
      actualizar: (id, cambios) => set((s) => ({ piezas: s.piezas.map((p) => (p.id === id ? { ...p, ...cambios } : p)) })),
      quitar: (id) => set((s) => ({ piezas: s.piezas.filter((p) => p.id !== id), seleccion: s.seleccion === id ? null : s.seleccion })),
      setHerraje: (id, cantidad) =>
        set((s) => {
          const otros = s.herrajes.filter((h) => h.id !== id)
          return { herrajes: cantidad > 0 ? [...otros, { id, cantidad } as HerrajeUso] : otros }
        }),
      cargar: (d) => set({ nombre: d.nombre, piezas: d.piezas, herrajes: d.herrajes, seleccion: null }),
      nuevo: () => set({ ...vacio, seleccion: null }),
      guardados: [],
      guardar: () => {
        const { nombre, piezas, herrajes, guardados } = get()
        const previo = guardados.find((g) => g.nombre === nombre)
        const id = previo?.id ?? crypto.randomUUID()
        set({ guardados: [{ id, nombre, piezas, herrajes, creado: new Date().toISOString() }, ...guardados.filter((g) => g.id !== id)] })
      },
      borrarGuardado: (id) => set((s) => ({ guardados: s.guardados.filter((g) => g.id !== id) })),
    }),
    { name: 'carpinteria-diseno-libre', partialize: (s) => ({ nombre: s.nombre, piezas: s.piezas, herrajes: s.herrajes, guardados: s.guardados }) },
  ),
)
