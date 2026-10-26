import type { Categoria, Params, ProyectoDef } from '../core/types'
import { banca } from './banca'
import { closet } from './closet'
import { muebleTv } from './muebleTv'
import { repisa } from './repisa'
import { velador } from './velador'

export const PROYECTOS: ProyectoDef[] = [repisa, velador, banca, muebleTv, closet]

export const CATEGORIAS: Categoria[] = ['dormitorio', 'living', 'cocina', 'baño', 'exterior', 'organización']

export function buscarProyecto(id: string): ProyectoDef | undefined {
  return PROYECTOS.find((p) => p.id === id)
}

export function paramsPorDefecto(p: ProyectoDef): Params {
  return Object.fromEntries(p.params.map((d) => [d.id, d.default]))
}

/** Ajusta los valores a los límites y al paso de cada parámetro. */
export function normalizarParams(p: ProyectoDef, valores: Partial<Params>): Params {
  const r: Params = {}
  for (const d of p.params) {
    const v = Number(valores[d.id] ?? d.default)
    const ajustado = Math.round((Number.isFinite(v) ? v : d.default) / d.step) * d.step
    r[d.id] = Math.min(d.max, Math.max(d.min, ajustado))
  }
  return r
}
