import { KERF, MATERIALES } from './catalogo'
import type { PiezaCorte } from './types'

export interface Colocada {
  letra: string
  x: number
  y: number
  /** Medidas tal como quedan en la plancha (w sobre el largo de la plancha). */
  w: number
  h: number
  rotada: boolean
}

export interface Tablero {
  material: string
  largo: number
  ancho: number
  piezas: Colocada[]
  /** Porcentaje del tablero ocupado por piezas (0–100). */
  uso: number
}

export interface Barra {
  material: string
  largo: number
  cortes: { letra: string; inicio: number; largo: number }[]
  sobrante: number
}

export interface ResultadoOptimizacion {
  tableros: Tablero[]
  barras: Barra[]
  noCaben: { letra: string; material: string }[]
}

interface Libre {
  x: number
  y: number
  w: number
  h: number
}

interface Abierto {
  tablero: Tablero
  libres: Libre[]
}

function ajusta(libre: Libre, w: number, h: number): number | null {
  if (w > libre.w || h > libre.h) return null
  // Mejor ajuste del lado corto: deja el menor sobrante en el lado más ajustado.
  return Math.min(libre.w - w, libre.h - h)
}

/** Optimiza planchas con un algoritmo de guillotina (mejor ajuste del lado corto). */
export function optimizarPlanchas(
  cortes: PiezaCorte[],
  kerf = KERF,
): { tableros: Tablero[]; noCaben: ResultadoOptimizacion['noCaben'] } {
  const tableros: Tablero[] = []
  const noCaben: ResultadoOptimizacion['noCaben'] = []
  const porMaterial = new Map<string, PiezaCorte[]>()
  for (const c of cortes) {
    if (MATERIALES[c.material].tipo !== 'plancha') continue
    porMaterial.set(c.material, [...(porMaterial.get(c.material) ?? []), c])
  }

  for (const [material, lista] of porMaterial) {
    const [L, A] = MATERIALES[material].formato as [number, number]
    const items = lista
      .flatMap((c) => Array.from({ length: c.cantidad }, () => c))
      .sort((a, b) => b.largo * b.ancho - a.largo * a.ancho || b.largo - a.largo)
    const abiertos: Abierto[] = []

    for (const c of items) {
      const orientaciones: [number, number, boolean][] = [[c.largo, c.ancho, false]]
      if (!c.veta && c.largo !== c.ancho) orientaciones.push([c.ancho, c.largo, true])

      let mejor: { ab: Abierto; i: number; w: number; h: number; rot: boolean; puntaje: number } | null = null
      for (const ab of abiertos) {
        ab.libres.forEach((libre, i) => {
          for (const [w, h, rot] of orientaciones) {
            const puntaje = ajusta(libre, w + kerf, h + kerf)
            if (puntaje !== null && (mejor === null || puntaje < mejor.puntaje)) {
              mejor = { ab, i, w, h, rot, puntaje }
            }
          }
        })
      }

      if (mejor === null) {
        const nuevo: Abierto = {
          tablero: { material, largo: L, ancho: A, piezas: [], uso: 0 },
          libres: [{ x: 0, y: 0, w: L + kerf, h: A + kerf }],
        }
        for (const [w, h, rot] of orientaciones) {
          if (ajusta(nuevo.libres[0], w + kerf, h + kerf) !== null) {
            mejor = { ab: nuevo, i: 0, w, h, rot, puntaje: 0 }
            break
          }
        }
        if (mejor === null) {
          noCaben.push({ letra: c.letra, material })
          continue
        }
        abiertos.push(nuevo)
        tableros.push(nuevo.tablero)
      }

      const m = mejor as { ab: Abierto; i: number; w: number; h: number; rot: boolean }
      const libre = m.ab.libres[m.i]
      m.ab.tablero.piezas.push({ letra: c.letra, x: libre.x, y: libre.y, w: m.w, h: m.h, rotada: m.rot })
      const wk = m.w + kerf
      const hk = m.h + kerf
      // Corte de guillotina: se divide por el eje que deja el sobrante más grande entero.
      const restoW = libre.w - wk
      const restoH = libre.h - hk
      const nuevos: Libre[] =
        restoW > restoH
          ? [
              { x: libre.x + wk, y: libre.y, w: restoW, h: libre.h },
              { x: libre.x, y: libre.y + hk, w: wk, h: restoH },
            ]
          : [
              { x: libre.x, y: libre.y + hk, w: libre.w, h: restoH },
              { x: libre.x + wk, y: libre.y, w: restoW, h: hk },
            ]
      m.ab.libres.splice(m.i, 1, ...nuevos.filter((r) => r.w > kerf && r.h > kerf))
    }
  }

  for (const t of tableros) {
    const area = t.piezas.reduce((s, p) => s + p.w * p.h, 0)
    t.uso = Math.round((area / (t.largo * t.ancho)) * 1000) / 10
  }
  return { tableros, noCaben }
}

/** Optimiza listones comerciales (corte en una dimensión, primero el más largo). */
export function optimizarListones(cortes: PiezaCorte[], kerf = KERF): { barras: Barra[]; noCaben: ResultadoOptimizacion['noCaben'] } {
  const barras: Barra[] = []
  const noCaben: ResultadoOptimizacion['noCaben'] = []
  const porMaterial = new Map<string, PiezaCorte[]>()
  for (const c of cortes) {
    if (MATERIALES[c.material].tipo !== 'liston') continue
    porMaterial.set(c.material, [...(porMaterial.get(c.material) ?? []), c])
  }
  for (const [material, lista] of porMaterial) {
    const [L] = MATERIALES[material].formato
    const items = lista.flatMap((c) => Array.from({ length: c.cantidad }, () => c)).sort((a, b) => b.largo - a.largo)
    const propias: Barra[] = []
    for (const c of items) {
      if (c.largo > L) {
        noCaben.push({ letra: c.letra, material })
        continue
      }
      let barra = propias.find((b) => b.sobrante >= c.largo)
      if (!barra) {
        barra = { material, largo: L, cortes: [], sobrante: L }
        propias.push(barra)
      }
      const inicio = L - barra.sobrante
      barra.cortes.push({ letra: c.letra, inicio, largo: c.largo })
      barra.sobrante = Math.max(0, barra.sobrante - c.largo - kerf)
    }
    barras.push(...propias)
  }
  return { barras, noCaben }
}

export function optimizar(cortes: PiezaCorte[]): ResultadoOptimizacion {
  const p = optimizarPlanchas(cortes)
  const l = optimizarListones(cortes)
  return { tableros: p.tableros, barras: l.barras, noCaben: [...p.noCaben, ...l.noCaben] }
}
