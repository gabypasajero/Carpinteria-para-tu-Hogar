// Recomienda proyectos según la encuesta inicial: nivel, intereses, herramientas que tiene y meta.
import type { ProyectoDef } from '../core/types'
import type { Encuesta } from '../store/usePerfil'

export const NIVELES = ['Nunca he hecho un mueble', 'He hecho algunos proyectos simples', 'Tengo experiencia', 'Soy carpintero o mueblista']
const VENDEN = ['tabla_picar', 'caja_tapa', 'repisa_muro', 'vinoteca', 'marco_cuadro', 'casa_pajaros', 'bandeja_sofa', 'macetero_alto', 'cama_perro']

export function puntaje(p: ProyectoDef, e: Encuesta | null): number {
  if (!e) return p.dificultad === 1 ? 2 : 0
  const nivel = Math.max(0, NIVELES.indexOf(e.nivel))
  let s = 0
  if (p.dificultad <= nivel + 1) s += 3
  else s -= 4 * (p.dificultad - nivel - 1)
  if (e.intereses.includes(p.categoria)) s += 4
  const tiene = p.herramientas.filter((h) => e.herramientas.includes(h)).length
  s += (tiene / Math.max(1, p.herramientas.length)) * 2
  if (e.meta === 'Emprender y vender lo que hago' && VENDEN.includes(p.id)) s += 3
  if (e.meta === 'Arreglar el patio o la terraza' && ['exterior', 'jardín'].includes(p.categoria)) s += 3
  if (e.meta === 'Hacer mi primer mueble' && p.dificultad === 1) s += 2
  if (e.meta === 'Amoblar mi casa a mi medida' && ['dormitorio', 'sala de estar', 'cocina', 'almacenamiento'].includes(p.categoria)) s += 2
  return s
}

export function recomendados(proyectos: ProyectoDef[], e: Encuesta | null, n = 8): ProyectoDef[] {
  return [...proyectos].sort((a, b) => puntaje(b, e) - puntaje(a, e)).slice(0, n)
}
