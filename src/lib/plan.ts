// Reglas del plan: qué se puede usar gratis y qué es Pro (prueba de 7 días y luego $1.100 al mes).
import type { ProyectoDef } from '../core/types'
import { usePerfil } from '../store/usePerfil'

export const PRECIO_MENSUAL = 1100
export const DIAS_PRUEBA = 7
/** Piezas que se pueden usar en el diseñador sin plan Pro. */
export const PIEZAS_GRATIS = 12

export function diasRestantes(inicio: string | null, ahora = Date.now()): number {
  if (!inicio) return 0
  const fin = new Date(inicio).getTime() + DIAS_PRUEBA * 864e5
  return Math.max(0, Math.ceil((fin - ahora) / 864e5))
}

export function useAcceso() {
  const { plan, inicioPrueba } = usePerfil()
  const dias = diasRestantes(inicioPrueba)
  const pro = plan === 'pro' || (plan === 'prueba' && dias > 0)
  return { pro, plan, dias, pruebaUsada: !!inicioPrueba, vencida: plan === 'prueba' && dias === 0 }
}

/** Un proyecto gratis se usa completo; uno Pro muestra el 3D y el costo, y bloquea planos, guía y PDF. */
export const proyectoAbierto = (p: ProyectoDef, pro: boolean) => p.plan === 'gratis' || pro
