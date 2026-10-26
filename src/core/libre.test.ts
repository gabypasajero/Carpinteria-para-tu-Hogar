import { describe, expect, it } from 'vitest'
import { PROYECTOS, paramsPorDefecto } from '../projects'
import { aInstancia, codificar, decodificar, desdeInstancia, girar, medidas, nuevaPieza, sobrePiso } from './libre'

describe('diseño libre', () => {
  it.each(PROYECTOS.map((p) => [p.id, p] as const))('%s se convierte en piezas editables sin cambiar medidas', (_id, p) => {
    const res = p.construir(paramsPorDefecto(p))
    for (const [i, pi] of res.piezas.entries()) {
      const libre = desdeInstancia(pi, String(i))
      expect(medidas(libre).map((v) => Math.round(v))).toEqual(pi.size.map((v) => Math.round(v)))
    }
  })

  it('girar dos veces sobre el mismo eje vuelve al original', () => {
    const p = nuevaPieza('mel18', 'a', 0)
    for (const e of [0, 1, 2] as const) expect(medidas(girar(girar(p, e), e))).toEqual(medidas(p))
  })

  it('al girar una pieza bajo el piso se apoya en él', () => {
    const p = sobrePiso(girar(nuevaPieza('mel18', 'a', 0), 0))
    expect(p.pos[1] - medidas(p)[1] / 2).toBeGreaterThanOrEqual(0)
  })

  it('el enlace para compartir conserva el diseño', () => {
    const d = { nombre: 'Repisa de Ñuñoa', piezas: [nuevaPieza('pc1x4', 'a', 0), nuevaPieza('terc18', 'b', 1)], herrajes: [{ id: 't4x40', cantidad: 8 }] }
    const r = decodificar(codificar(d))!
    expect(r.nombre).toBe(d.nombre)
    expect(r.piezas.map(aInstancia).map((p) => p.size)).toEqual(d.piezas.map(aInstancia).map((p) => p.size))
    expect(r.herrajes).toEqual(d.herrajes)
  })
})
