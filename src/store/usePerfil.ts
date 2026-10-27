// Perfil de la persona: respuestas de la encuesta inicial y estado de su plan (gratis, prueba o Pro).
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Encuesta {
  nivel: string
  motivos: string[]
  planos: string
  herramientas: string[]
  intereses: string[]
  meta: string
}

export type EstadoPlan = 'gratis' | 'prueba' | 'pro'

interface PerfilState {
  encuesta: Encuesta | null
  setEncuesta: (e: Encuesta) => void
  /** Saltó la encuesta: no se la volvemos a mostrar al entrar. */
  omitida: boolean
  saltar: () => void
  plan: EstadoPlan
  inicioPrueba: string | null
  iniciarPrueba: () => void
  setPlan: (p: EstadoPlan) => void
  /** Proyecto de muestra: uno completo gratis (id del catálogo o «diseno:<uid>» del diseñador). */
  muestra: string | null
  usarMuestra: (id: string) => void
}

export const usePerfil = create<PerfilState>()(
  persist(
    (set) => ({
      encuesta: null,
      setEncuesta: (encuesta) => set({ encuesta }),
      omitida: false,
      saltar: () => set({ omitida: true }),
      plan: 'gratis',
      inicioPrueba: null,
      iniciarPrueba: () => set((s) => (s.inicioPrueba ? {} : { plan: 'prueba', inicioPrueba: new Date().toISOString() })),
      setPlan: (plan) => set({ plan }),
      muestra: null,
      usarMuestra: (id) => set((s) => (s.muestra ? {} : { muestra: id })),
    }),
    { name: 'carpinteria-perfil' },
  ),
)
