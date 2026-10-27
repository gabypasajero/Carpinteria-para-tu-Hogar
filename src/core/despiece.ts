import { MATERIALES } from './catalogo'
import type { PiezaCorte, PiezaInstancia } from './types'

export function letraPara(indice: number): string {
  let s = ''
  let n = indice
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

/** Medidas de corte (largo ≥ ancho) a partir de la caja 3D y el material. */
export function medidasCorte(pieza: PiezaInstancia): { largo: number; ancho: number; espesor: number } {
  const mat = MATERIALES[pieza.material]
  const dims = [...pieza.size].sort((a, b) => b - a)
  if (mat.tipo === 'liston') {
    return { largo: dims[0], ancho: mat.seccion![0], espesor: mat.seccion![1] }
  }
  let idx = 0
  for (let i = 1; i < 3; i++) {
    if (Math.abs(dims[i] - mat.espesor) < Math.abs(dims[idx] - mat.espesor)) idx = i
  }
  const resto = dims.filter((_, i) => i !== idx)
  return { largo: resto[0], ancho: resto[1], espesor: mat.espesor }
}

/** Agrupa las piezas iguales y les asigna una letra en orden de aparición. */
export function agruparPiezas(piezas: PiezaInstancia[]): PiezaCorte[] {
  const grupos = new Map<string, PiezaCorte>()
  for (const p of piezas) {
    const m = medidasCorte(p)
    const existente = grupos.get(p.clave)
    if (existente) {
      if (existente.largo !== m.largo || existente.ancho !== m.ancho || existente.material !== p.material) {
        throw new Error(`Las piezas «${p.clave}» comparten clave pero no medidas`)
      }
      existente.cantidad++
      existente.canto += p.canto ?? 0
      continue
    }
    grupos.set(p.clave, {
      letra: letraPara(grupos.size),
      clave: p.clave,
      nombre: p.nombre,
      material: p.material,
      ...m,
      cantidad: 1,
      canto: p.canto ?? 0,
      veta: p.veta ?? false,
      nota: p.nota,
    })
  }
  return [...grupos.values()]
}

export function letrasPorClave(cortes: PiezaCorte[]): Record<string, string> {
  return Object.fromEntries(cortes.map((c) => [c.clave, c.letra]))
}
