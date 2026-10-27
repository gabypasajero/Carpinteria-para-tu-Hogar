import { MATERIALES } from './catalogo'
import type { PiezaCorte } from './types'

/** Cuántos cantos largos y cuántos cortos lleva tapacanto (0 a 2 cada uno). */
export function cantosPorLado(c: PiezaCorte): { largos: number; anchos: number } {
  const porPieza = c.canto / c.cantidad
  if (porPieza <= 0) return { largos: 0, anchos: 0 }
  let mejor = { largos: 0, anchos: 0, error: Infinity }
  for (let largos = 0; largos <= 2; largos++) {
    for (let anchos = 0; anchos <= 2; anchos++) {
      const error = Math.abs(largos * c.largo + anchos * c.ancho - porPieza)
      if (error < mejor.error) mejor = { largos, anchos, error }
    }
  }
  return { largos: mejor.largos, anchos: mejor.anchos }
}

const celda = (v: string | number) => {
  // Excel en español usa coma decimal.
  const s = typeof v === 'number' ? String(v).replace('.', ',') : v
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Planilla de dimensionado para pedir el corte en tienda (Imperial, Sodimac, Easy u otra).
 * CSV separado por «;» y con BOM para que Excel en español lo abra con tildes y columnas.
 */
export function planillaDimensionado(cortes: PiezaCorte[], titulo: string): string {
  const filas: (string | number)[][] = [
    [titulo],
    [],
    ['Pieza', 'Descripción', 'Cantidad', 'Largo (mm)', 'Ancho (mm)', 'Espesor (mm)', 'Material', 'Veta en el largo', 'Tapacanto largo (lados)', 'Tapacanto ancho (lados)'],
  ]
  for (const c of cortes) {
    const mat = MATERIALES[c.material]
    if (mat.tipo !== 'plancha') continue
    const { largos, anchos } = cantosPorLado(c)
    filas.push([c.letra, c.nombre, c.cantidad, c.largo, c.ancho, c.espesor, mat.nombre, c.veta ? 'Sí' : 'No', largos, anchos])
  }
  const listones = cortes.filter((c) => MATERIALES[c.material].tipo === 'liston')
  if (listones.length) {
    filas.push([], ['Listones (cortar en casa o en la tienda)'], ['Pieza', 'Descripción', 'Cantidad', 'Largo (mm)', 'Material'])
    for (const c of listones) filas.push([c.letra, c.nombre, c.cantidad, c.largo, MATERIALES[c.material].nombre])
  }
  return '﻿' + filas.map((f) => f.map(celda).join(';')).join('\r\n')
}
