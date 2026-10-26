import { describe, expect, it } from 'vitest'
import investigacion from '../data/investigacion.json'
import { PROYECTOS, normalizarParams } from '../projects'
import { limitesPieza } from '../projects/util'
import { HERRAJES, HERRAMIENTAS, MATERIALES } from './catalogo'
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

it('los ids de los proyectos no se repiten', () => {
  expect(new Set(PROYECTOS.map((p) => p.id)).size).toBe(PROYECTOS.length)
})

describe.each(PROYECTOS)('$nombre', (proyecto) => {
  it('tiene ficha completa', () => {
    expect(proyecto.descripcion.length).toBeGreaterThan(20)
    expect(proyecto.herramientas.length).toBeGreaterThan(0)
    for (const h of proyecto.herramientas) expect(HERRAMIENTAS[h], h).toBeDefined()
    for (const r of proyecto.reglas ?? []) expect(investigacion.fuentes, r.fuente).toHaveProperty(r.fuente)
    for (const d of proyecto.params) {
      expect(d.default).toBeGreaterThanOrEqual(d.min)
      expect(d.default).toBeLessThanOrEqual(d.max)
      if (d.opciones) expect(d.opciones.length, d.id).toBe(Math.round((d.max - d.min) / d.step) + 1)
    }
  })

  it.each(combinaciones(proyecto))('se construye bien con %o', (params) => {
    const res = proyecto.construir(params)
    const [W, H, D] = res.exterior
    expect(res.piezas.length).toBeGreaterThan(0)
    for (const h of res.herrajes) {
      expect(HERRAJES[h.id], h.id).toBeDefined()
      expect(h.cantidad).toBeGreaterThan(0)
    }

    for (const pz of res.piezas) {
      expect(MATERIALES[pz.material], pz.material).toBeDefined()
      expect(pz.paso).toBeGreaterThanOrEqual(0)
      expect(pz.paso).toBeLessThan(res.pasos.length)
      expect(pz.size.every((s) => s > 0 && Number.isFinite(s)), pz.nombre).toBe(true)
      // Cada pieza queda dentro de las medidas exteriores.
      const { min, max } = limitesPieza(pz)
      expect(Math.min(...min), pz.nombre).toBeGreaterThanOrEqual(-0.5)
      expect(max[0], pz.nombre).toBeLessThanOrEqual(W + 0.5)
      expect(max[1], pz.nombre).toBeLessThanOrEqual(H + 0.5)
      expect(max[2], pz.nombre).toBeLessThanOrEqual(D + 0.5)
    }

    // Las piezas no se atraviesan entre sí (las inclinadas se revisan a mano en el visor: su caja envolvente no sirve).
    const cajas = res.piezas.filter((pz) => !pz.rot).map((pz) => ({ nombre: pz.nombre, ...limitesPieza(pz) }))
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
