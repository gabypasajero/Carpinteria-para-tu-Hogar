import { MATERIALES } from '../core/catalogo'
import type { HerrajeUso, Params, PiezaInstancia } from '../core/types'

export type V3 = [number, number, number]

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
  extra: Partial<Pick<PiezaInstancia, 'canto' | 'veta' | 'nota'>> = {},
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

/** Posiciones (inicio) de piezas de ancho a repartidas con separación máxima sep entre desde y hasta. */
export function cada(desde: number, hasta: number, a: number, sep: number): number[] {
  const n = Math.max(2, Math.ceil((hasta - desde - a) / sep) + 1)
  const paso = (hasta - desde - a) / (n - 1)
  return Array.from({ length: n }, (_, i) => desde + paso * i)
}

export function juntarHerrajes(lista: HerrajeUso[]): HerrajeUso[] {
  const m = new Map<string, number>()
  for (const h of lista) m.set(h.id, (m.get(h.id) ?? 0) + h.cantidad)
  // Las cantidades en unidades se redondean hacia arriba; metros, m² y kg conservan un decimal.
  return [...m]
    .map(([id, cantidad]) => ({ id, cantidad: Math.ceil(cantidad * 10) / 10 }))
    .filter((h) => h.cantidad > 0)
}

/** Clavos para fijar un respaldo cada ~10 cm por el perímetro y por cada pieza interior. */
export function clavosRespaldo(ancho: number, alto: number, travesanos: number): number {
  return Math.ceil((2 * (ancho + alto)) / 100) + travesanos * Math.ceil(ancho / 150)
}

/** Clave única por material y medida: piezas iguales comparten letra aunque vengan de partes distintas. */
export function claveDim(base: string, material: string, a: number, b: number): string {
  const [l, c] = [redondear(a), redondear(b)].sort((x, y) => y - x)
  return `${base}-${material}-${l}x${c}`
}

/** Divide un largo en tramos iguales que no superen el largo comercial (las uniones caen sobre un apoyo). */
export function tramos(largo: number, max: number): number[] {
  const n = Math.ceil(largo / max)
  return Array.from({ length: n }, () => largo / n)
}

/** Largo comercial de un material (listón) o lado largo de la plancha. */
export const largoComercial = (material: string) => MATERIALES[material].formato[0]
export const seccion = (material: string): [number, number] => MATERIALES[material].seccion ?? [0, 0]
export const espesor = (material: string) => MATERIALES[material].espesor

/**
 * Pieza inclinada entre dos puntos: el largo va de a hacia b dentro de un plano vertical.
 * plano 'xy': la pieza gira sobre z (techos y diagonales vistos de frente).
 * plano 'zy': la pieza gira sobre x (techos y respaldos vistos de lado).
 * grosor = [espesor en el plano, ancho perpendicular al plano].
 */
export function barra(
  clave: string,
  nombre: string,
  material: string,
  a: V3,
  b: V3,
  plano: 'xy' | 'zy',
  grosor: [number, number],
  paso: number,
  extra: Partial<Pick<PiezaInstancia, 'nota' | 'veta'>> = {},
): PiezaInstancia {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const pos: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
  if (plano === 'xy') {
    const largo = Math.hypot(d[0], d[1])
    const ang = Math.atan2(d[1], d[0])
    return { clave, nombre, material, size: [redondear(largo), grosor[0], grosor[1]], pos, rot: [0, 0, ang], paso, ...extra }
  }
  const largo = Math.hypot(d[2], d[1])
  const ang = Math.atan2(-d[1], d[2])
  return { clave, nombre, material, size: [grosor[1], grosor[0], redondear(largo)], pos, rot: [ang, 0, 0], paso, ...extra }
}

const gradosTexto = (rad: number) => `${Math.round(Math.abs((rad * 180) / Math.PI))}°`
export const notaAngulo = (rad: number) => `cortes a ${gradosTexto(rad)}`

/** Esquinas de una pieza (con su giro) en coordenadas del mueble. */
export function esquinas(p: PiezaInstancia): V3[] {
  const [rx, ry, rz] = p.rot ?? [0, 0, 0]
  const [cx, sx] = [Math.cos(rx), Math.sin(rx)]
  const [cy, sy] = [Math.cos(ry), Math.sin(ry)]
  const [cz, sz] = [Math.cos(rz), Math.sin(rz)]
  // Matriz R = Rx · Ry · Rz (orden de Euler «XYZ», igual que three.js).
  const R = [
    [cy * cz, -cy * sz, sy],
    [sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy],
    [-cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy],
  ]
  const out: V3[] = []
  for (const ex of [-1, 1])
    for (const ey of [-1, 1])
      for (const ez of [-1, 1]) {
        const v = [(ex * p.size[0]) / 2, (ey * p.size[1]) / 2, (ez * p.size[2]) / 2]
        out.push([0, 1, 2].map((i) => p.pos[i] + R[i][0] * v[0] + R[i][1] * v[1] + R[i][2] * v[2]) as V3)
      }
  return out
}

/** Caja que envuelve a una pieza (considera el giro). */
export function limitesPieza(p: PiezaInstancia): { min: V3; max: V3 } {
  if (!p.rot) {
    return { min: p.pos.map((c, i) => c - p.size[i] / 2) as V3, max: p.pos.map((c, i) => c + p.size[i] / 2) as V3 }
  }
  const e = esquinas(p)
  return {
    min: [0, 1, 2].map((i) => Math.min(...e.map((q) => q[i]))) as V3,
    max: [0, 1, 2].map((i) => Math.max(...e.map((q) => q[i]))) as V3,
  }
}

/** Medidas exteriores de un conjunto de piezas (todas deben quedar en coordenadas ≥ 0). */
export function exteriorDe(piezas: PiezaInstancia[]): V3 {
  const max: V3 = [0, 0, 0]
  for (const p of piezas) {
    const l = limitesPieza(p)
    for (let i = 0; i < 3; i++) max[i] = Math.max(max[i], l.max[i])
  }
  return max.map((v) => Math.ceil(v)) as V3
}

interface Rect {
  u0: number
  u1: number
  v0: number
  v1: number
}

/** Resta rectángulos (aberturas) a un rectángulo: devuelve los trozos que quedan. */
function restar(r: Rect, h: Rect): Rect[] {
  if (h.u0 >= r.u1 || h.u1 <= r.u0 || h.v0 >= r.v1 || h.v1 <= r.v0) return [r]
  const out: Rect[] = []
  if (h.u0 > r.u0) out.push({ ...r, u1: h.u0 })
  if (h.u1 < r.u1) out.push({ ...r, u0: h.u1 })
  const u0 = Math.max(r.u0, h.u0)
  const u1 = Math.min(r.u1, h.u1)
  if (h.v0 > r.v0) out.push({ u0, u1, v0: r.v0, v1: h.v0 })
  if (h.v1 < r.v1) out.push({ u0, u1, v0: h.v1, v1: r.v1 })
  return out
}

/**
 * Cubre un rectángulo plano con placas del formato comercial del material, restando aberturas.
 * plano 'xy' (muro paralelo al frente: u = x, v = y, w = z), 'zy' (muro lateral: u = z, v = y, w = x)
 * o 'xz' (piso o cielo: u = x, v = z, w = y). w0 es la cara donde empieza la placa.
 */
export function placas(
  base: string,
  nombre: string,
  material: string,
  plano: 'xy' | 'zy' | 'xz',
  u: [number, number],
  v: [number, number],
  w0: number,
  paso: number,
  aberturas: Rect[] = [],
): PiezaInstancia[] {
  const [L, A] = MATERIALES[material].formato as [number, number]
  const e = MATERIALES[material].espesor
  // En muros las placas van de pie (lado corto horizontal); en pisos, el lado largo sigue a u.
  const [tu, tv] = plano === 'xz' ? [L, A] : [A, L]
  let rects: Rect[] = []
  for (let a = u[0]; a < u[1] - 1; a += tu)
    for (let b = v[0]; b < v[1] - 1; b += tv) rects.push({ u0: a, u1: Math.min(a + tu, u[1]), v0: b, v1: Math.min(b + tv, v[1]) })
  for (const h of aberturas) rects = rects.flatMap((r) => restar(r, h))
  return rects
    .filter((r) => r.u1 - r.u0 > 20 && r.v1 - r.v0 > 20)
    .map((r) => {
      const clave = claveDim(base, material, r.u1 - r.u0, r.v1 - r.v0)
      if (plano === 'xy') return pieza(clave, nombre, material, [r.u0, r.v0, w0], [r.u1, r.v1, w0 + e], paso)
      if (plano === 'zy') return pieza(clave, nombre, material, [w0, r.v0, r.u0], [w0 + e, r.v1, r.u1], paso)
      return pieza(clave, nombre, material, [r.u0, w0, r.v0], [r.u1, w0 + e, r.v1], paso)
    })
}

/** Área en m² de un conjunto de placas (para aislación, pasta y tornillos). */
export const areaM2 = (piezas: PiezaInstancia[]) =>
  piezas.reduce((s, p) => {
    const [a, b] = [...p.size].sort((x, y) => y - x)
    return s + (a * b) / 1e6
  }, 0)

/** Desplaza un conjunto de piezas (para armar un proyecto con partes de otro). */
export const mover = (piezas: PiezaInstancia[], d: V3): PiezaInstancia[] =>
  piezas.map((p) => ({ ...p, pos: [p.pos[0] + d[0], p.pos[1] + d[1], p.pos[2] + d[2]] as V3 }))

/** Posiciones (inicio) de tablas de ancho a entre desde y hasta con al menos `junta` entre ellas (las extremas a ras). */
export function filas(desde: number, hasta: number, a: number, junta: number): number[] {
  const n = Math.max(1, Math.floor((hasta - desde + junta) / (a + junta)))
  if (n === 1) return [desde]
  const paso = (hasta - desde - a) / (n - 1)
  return Array.from({ length: n }, (_, i) => desde + paso * i)
}
