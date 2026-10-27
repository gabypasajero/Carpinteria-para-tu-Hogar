import { describe, expect, it } from 'vitest'
import { agruparPiezas, letrasPorClave } from './despiece'
import { FORMATO_PLANO, planoParaCotizar } from './plano'
import { buscarProyecto, paramsPorDefecto } from '../projects'

describe('plano para cotizar', () => {
  it('trae la lista de corte, los herrajes y cada pieza con su letra', () => {
    const p = buscarProyecto('comoda')!
    const res = p.construir(paramsPorDefecto(p))
    const cortes = agruparPiezas(res.piezas)
    const letras = letrasPorClave(cortes)
    const plano = planoParaCotizar({ nombre: p.nombre, proyecto: p.id, enlace: 'x', exterior: res.exterior, costoMateriales: 1000, cortes, letras, piezas: res.piezas, herrajes: res.herrajes })
    expect(plano.formato).toBe(FORMATO_PLANO)
    expect(plano.cortes.reduce((n, c) => n + c.cantidad, 0)).toBe(res.piezas.length)
    expect(plano.piezas).toHaveLength(res.piezas.length)
    expect(plano.piezas.every((x) => x.letra)).toBe(true)
    expect(plano.herrajes.every((h) => h.nombre && h.cantidad > 0)).toBe(true)
    expect(JSON.parse(JSON.stringify(plano))).toEqual(plano)
  })
})
