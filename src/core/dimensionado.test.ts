import { describe, expect, it } from 'vitest'
import { agruparPiezas } from './despiece'
import { cantosPorLado, planillaDimensionado } from './dimensionado'
import { PROYECTOS, paramsPorDefecto } from '../projects'

const cortesDe = (id: string) => {
  const p = PROYECTOS.find((x) => x.id === id)!
  return agruparPiezas(p.construir(paramsPorDefecto(p)).piezas)
}

describe('cantosPorLado', () => {
  it('reconoce el canto frontal de un lateral (un lado largo)', () => {
    const lateral = cortesDe('repisa').find((c) => c.clave === 'lateral')!
    expect(cantosPorLado(lateral)).toEqual({ largos: 1, anchos: 0 })
  })

  it('reconoce una puerta con los cuatro cantos', () => {
    const puerta = cortesDe('closet').find((c) => c.clave === 'puerta')!
    expect(cantosPorLado(puerta)).toEqual({ largos: 2, anchos: 2 })
  })

  it('reconoce una cubierta con el frente y los dos costados', () => {
    const cubierta = cortesDe('velador').find((c) => c.clave === 'cubierta')!
    expect(cantosPorLado(cubierta)).toEqual({ largos: 1, anchos: 2 })
  })

  it('deja sin canto el respaldo', () => {
    const respaldo = cortesDe('repisa').find((c) => c.clave === 'respaldo')!
    expect(cantosPorLado(respaldo)).toEqual({ largos: 0, anchos: 0 })
  })
})

describe('planillaDimensionado', () => {
  it('lista las planchas y aparte los listones', () => {
    const csv = planillaDimensionado(cortesDe('banca'), 'Banca')
    expect(csv.startsWith('﻿Banca')).toBe(true)
    expect(csv).toContain('Listones')
    expect(csv).toContain('Pata;4;')
  })

  it('usa coma decimal para Excel en español', () => {
    const csv = planillaDimensionado(cortesDe('closet'), 'Closet')
    expect(csv).toContain(';575,5;')
  })

  it('incluye una fila por pieza de plancha', () => {
    const cortes = cortesDe('closet')
    const filas = planillaDimensionado(cortes, 'Closet').split('\r\n')
    expect(filas.length).toBe(3 + cortes.length)
  })
})
