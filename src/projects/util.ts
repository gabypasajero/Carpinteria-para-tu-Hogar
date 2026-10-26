import type { HerrajeUso, Params, PiezaInstancia } from '../core/types'

type V3 = [number, number, number]

/**
 * Crea una pieza a partir de sus esquinas mínima y máxima (mm).
 * Ejes: x = ancho (izquierda → derecha), y = alto (piso → arriba), z = fondo (muro → frente).
 */
export function pieza(
  clave: string,
  nombre: string,
  material: string,
  min: V3,
  max: V3,
  paso: number,
  extra: Partial<Pick<PiezaInstancia, 'canto' | 'veta'>> = {},
): PiezaInstancia {
  const size: V3 = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  if (size.some((s) => s <= 0)) throw new Error(`Pieza «${nombre}» con medida no positiva: ${size.join('×')}`)
  return {
    clave,
    nombre,
    material,
    size: size.map(redondear) as V3,
    pos: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
    paso,
    ...extra,
  }
}

/** Redondea a medio milímetro: más precisión no se puede cortar. */
export const redondear = (mm: number) => Math.round(mm * 2) / 2

/** Convierte los parámetros en cm a mm (las cantidades quedan igual). */
export function aMm(p: Params, idsCm: string[]): Params {
  const r: Params = { ...p }
  for (const id of idsCm) r[id] = p[id] * 10
  return r
}

/** Bisagras por puerta según su altura (regla usual de fabricantes). */
export function bisagrasPorPuerta(alto: number): number {
  if (alto <= 900) return 2
  if (alto <= 1600) return 3
  if (alto <= 2000) return 4
  return 5
}

/** Reparte n huecos iguales entre dos alturas dejando piezas de espesor t entre ellos. */
export function repartir(desde: number, hasta: number, n: number, t: number): number[] {
  const hueco = (hasta - desde - n * t) / (n + 1)
  return Array.from({ length: n }, (_, i) => desde + hueco * (i + 1) + t * i)
}

export function juntarHerrajes(lista: HerrajeUso[]): HerrajeUso[] {
  const m = new Map<string, number>()
  for (const h of lista) m.set(h.id, (m.get(h.id) ?? 0) + Math.ceil(h.cantidad))
  return [...m].map(([id, cantidad]) => ({ id, cantidad })).filter((h) => h.cantidad > 0)
}

/** Clavos para fijar un respaldo cada ~10 cm por el perímetro y por cada pieza interior. */
export function clavosRespaldo(ancho: number, alto: number, travesanos: number): number {
  return Math.ceil((2 * (ancho + alto)) / 100) + travesanos * Math.ceil(ancho / 150)
}
