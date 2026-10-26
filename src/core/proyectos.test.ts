import { describe, expect, it } from 'vitest'
import { PROYECTOS, normalizarParams } from '../projects'
import { MATERIALES } from './catalogo'
import { calcularCostos } from './costos'
import { agruparPiezas } from './despiece'
import { optimizar } from './optimizador'
import type { Params, ProyectoDef } from './types'

function combinaciones(p: ProyectoDef): Params[] {
  const casos: Params[] = []
  const base = normalizarParams(p, {})
  casos.push(base)
  for (const d of p.params) {
    casos.push({ ...base, [d.id]: d.min })
    casos.push({ ...base, [d.id]: d.max })
  }
  casos.push(Object.fromEntries(p.params.map((d) => [d.id, d.min])))
  casos.push(Object.fromEntries(p.params.map((d) => [d.id, d.max])))
  return casos
}

describe.each(PROYECTOS)('$nombre', (proyecto) => {
  it.each(combinaciones(proyecto))('se construye bien con %o', (params) => {
    const res = proyecto.construir(params)
    const [W, H, D] = res.exterior
    expect(res.piezas.length).toBeGreaterThan(0)

    for (const pz of res.piezas) {
      expect(MATERIALES[pz.material]).toBeDefined()
      expect(pz.paso).toBeGreaterThanOrEqual(0)
      expect(pz.paso).toBeLessThan(res.pasos.length)
      // Cada pieza queda dentro de las medidas exteriores.
      const min = pz.pos.map((c, i) => c - pz.size[i] / 2)
      const max = pz.pos.map((c, i) => c + pz.size[i] / 2)
      expect(Math.min(...min)).toBeGreaterThanOrEqual(-0.5)
      expect(max[0]).toBeLessThanOrEqual(W + 0.5)
      expect(max[1]).toBeLessThanOrEqual(H + 0.5)
      expect(max[2]).toBeLessThanOrEqual(D + 0.5)
    }

    // Las piezas no se atraviesan entre sí.
    const cajas = res.piezas.map((pz) => ({
      nombre: pz.nombre,
      min: pz.pos.map((c, i) => c - pz.size[i] / 2),
      max: pz.pos.map((c, i) => c + pz.size[i] / 2),
    }))
    for (let i = 0; i < cajas.length; i++) {
      for (let j = i + 1; j < cajas.length; j++) {
        const a = cajas[i]
        const b = cajas[j]
        const solapa = [0, 1, 2].every((k) => Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]) > 0.5)
        expect(solapa, `${a.nombre} choca con ${b.nombre}`).toBe(false)
      }
    }

    const cortes = agruparPiezas(res.piezas)
    const opt = optimizar(cortes)
    expect(opt.noCaben).toEqual([])
    const total = cortes.reduce((s, c) => s + c.cantidad, 0)
    const colocadas = opt.tableros.reduce((s, t) => s + t.piezas.length, 0) + opt.barras.reduce((s, b) => s + b.cortes.length, 0)
    expect(colocadas).toBe(total)

    const costo = calcularCostos(cortes, res.herrajes, opt, {})
    expect(costo.total).toBeGreaterThan(0)
  })
})
