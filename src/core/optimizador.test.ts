import { describe, expect, it } from 'vitest'
import { optimizarListones, optimizarPlanchas } from './optimizador'
import type { PiezaCorte } from './types'

const corte = (letra: string, largo: number, ancho: number, cantidad: number, material = 'mel15', veta = false): PiezaCorte => ({
  letra,
  clave: letra,
  nombre: letra,
  material,
  largo,
  ancho,
  espesor: 15,
  cantidad,
  canto: 0,
  veta,
})

function sinChoques(piezas: { x: number; y: number; w: number; h: number }[], L: number, A: number) {
  for (const p of piezas) {
    expect(p.x + p.w).toBeLessThanOrEqual(L)
    expect(p.y + p.h).toBeLessThanOrEqual(A)
  }
  for (let i = 0; i < piezas.length; i++)
    for (let j = i + 1; j < piezas.length; j++) {
      const a = piezas[i]
      const b = piezas[j]
      const solapa = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
      expect(solapa).toBe(false)
    }
}

describe('optimizarPlanchas', () => {
  it('pone 4 piezas de un cuarto de plancha en una sola plancha', () => {
    const { tableros } = optimizarPlanchas([corte('A', 1216, 911, 4)])
    expect(tableros).toHaveLength(1)
    sinChoques(tableros[0].piezas, 2440, 1830)
  })

  it('abre una segunda plancha cuando no caben', () => {
    const { tableros } = optimizarPlanchas([corte('A', 2000, 1000, 2)])
    expect(tableros).toHaveLength(2)
  })

  it('no gira piezas con veta', () => {
    const { tableros } = optimizarPlanchas([corte('A', 1800, 300, 5, 'mel15', true)])
    for (const t of tableros) for (const p of t.piezas) expect(p.rotada).toBe(false)
  })

  it('informa piezas más grandes que la plancha', () => {
    const { noCaben } = optimizarPlanchas([corte('A', 2500, 1900, 1)])
    expect(noCaben).toEqual([{ letra: 'A', material: 'mel15' }])
  })

  it('no superpone piezas de distintos tamaños', () => {
    const { tableros } = optimizarPlanchas([corte('A', 1200, 400, 3), corte('B', 600, 380, 6), corte('C', 450, 450, 4)])
    for (const t of tableros) sinChoques(t.piezas, t.largo, t.ancho)
  })
})

describe('optimizarListones', () => {
  it('reparte cortes en barras de 3,2 m con descuento de sierra', () => {
    const { barras } = optimizarListones([corte('A', 1500, 90, 3, 'pino1x4')])
    expect(barras).toHaveLength(2)
    expect(barras[0].cortes).toHaveLength(2)
  })
})
