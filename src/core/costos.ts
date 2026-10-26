import { HERRAJES, MATERIALES } from './catalogo'
import type { ResultadoOptimizacion } from './optimizador'
import type { HerrajeUso, PiezaCorte } from './types'

export interface LineaCosto {
  id: string
  nombre: string
  detalle: string
  cantidad: number
  unidadVenta: string
  precioUnitario: number
  total: number
  tienda: string
  tipo: 'material' | 'herraje'
}

export type Precios = Record<string, number>

export function precioDe(id: string, precios: Precios): number {
  return precios[id] ?? MATERIALES[id]?.precio ?? HERRAJES[id]?.precio ?? 0
}

/** Tapacanto total en metros, con 10 % extra por despuntes. */
export function metrosTapacanto(cortes: PiezaCorte[]): number {
  const mm = cortes.reduce((s, c) => s + c.canto, 0)
  return Math.ceil((mm / 1000) * 1.1)
}

export function calcularCostos(
  cortes: PiezaCorte[],
  herrajes: HerrajeUso[],
  opt: ResultadoOptimizacion,
  precios: Precios,
): { lineas: LineaCosto[]; total: number } {
  const lineas: LineaCosto[] = []

  const planchas = new Map<string, number>()
  for (const t of opt.tableros) planchas.set(t.material, (planchas.get(t.material) ?? 0) + 1)
  for (const b of opt.barras) planchas.set(b.material, (planchas.get(b.material) ?? 0) + 1)
  for (const [id, cantidad] of planchas) {
    const m = MATERIALES[id]
    const pu = precioDe(id, precios)
    lineas.push({
      id,
      nombre: m.nombre,
      detalle: m.tipo === 'plancha' ? `Plancha ${m.formato[0] / 10}×${m.formato[1]! / 10} cm` : `Pieza de ${m.formato[0] / 1000} m`,
      cantidad,
      unidadVenta: m.tipo === 'plancha' ? 'plancha' : 'pieza',
      precioUnitario: pu,
      total: pu * cantidad,
      tienda: m.tienda,
      tipo: 'material',
    })
  }

  const usos = new Map<string, number>()
  for (const h of herrajes) usos.set(h.id, (usos.get(h.id) ?? 0) + h.cantidad)
  const canto = metrosTapacanto(cortes)
  if (canto > 0) usos.set('tapacanto', (usos.get('tapacanto') ?? 0) + canto)

  for (const [id, uso] of usos) {
    if (uso <= 0) continue
    const h = HERRAJES[id]
    const envases = Math.ceil(uso / h.envase)
    const pu = precioDe(id, precios)
    lineas.push({
      id,
      nombre: h.nombre,
      detalle: `Se usan ${uso} ${id === 'tapacanto' ? 'm' : 'u'}`,
      cantidad: envases,
      unidadVenta: h.unidadVenta,
      precioUnitario: pu,
      total: pu * envases,
      tienda: h.tienda,
      tipo: 'herraje',
    })
  }

  return { lineas, total: lineas.reduce((s, l) => s + l.total, 0) }
}

const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
export const formatoCLP = (n: number) => clp.format(n)
export const DIFICULTAD = ['Fácil', 'Media', 'Avanzada']
export const cm = (mm: number) => `${Math.round(mm) / 10}`
