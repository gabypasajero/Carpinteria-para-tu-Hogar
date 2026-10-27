// Piezas de construcción que comparten varios proyectos (cajones, puertas, repisas, mesas, entramados).
import { MATERIALES } from '../core/catalogo'
import type { HerrajeUso, PiezaInstancia } from '../core/types'
import { bisagrasPorPuerta, claveDim, espesor, pieza, repartir, seccion, tramos, type V3 } from './util'

const JUNTA = 3
/** Espacio que ocupa cada corredera telescópica por lado. */
const CORREDERA = 13

/** Largo de corredera que cabe en un fondo libre (null si no cabe ninguna). */
export function correderaPara(fondoLibre: number): 350 | 450 | null {
  if (fondoLibre >= 460) return 450
  if (fondoLibre >= 360) return 350
  return null
}

/**
 * Cajón: caja sobre correderas telescópicas entre dos costados (x0–x1) y frente superpuesto (fx0–fx1, y0–y1)
 * delante de la cara frontal del mueble (zF). prof es el largo de la corredera.
 */
export function cajon(o: {
  x0: number
  x1: number
  fx0: number
  fx1: number
  y0: number
  y1: number
  zF: number
  prof: 350 | 450
  mat: string
  paso: number
  pasoFrente: number
  veta?: boolean
}): { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] } {
  const t = espesor(o.mat)
  const fh = o.y1 - o.y0
  const cw = o.x1 - o.x0 - 2 * CORREDERA
  const ch = Math.min(fh - 40, 200)
  const yb = o.y0 + 15
  const bx0 = o.x0 + CORREDERA
  const zf = o.zF - o.prof
  const k = (b: string, a: number, c: number, m = o.mat) => claveDim(b, m, a, c)
  const piezas = [
    pieza(k('frente', o.fx1 - o.fx0, fh), 'Frente de cajón', o.mat, [o.fx0, o.y0, o.zF], [o.fx1, o.y1, o.zF + t], o.pasoFrente, {
      canto: 2 * (o.fx1 - o.fx0 + fh),
      veta: o.veta,
    }),
    pieza(k('cajLat', o.prof, ch), 'Lateral de cajón', o.mat, [bx0, yb + 3, zf], [bx0 + t, yb + 3 + ch, o.zF], o.paso, { canto: o.prof }),
    pieza(k('cajLat', o.prof, ch), 'Lateral de cajón', o.mat, [bx0 + cw - t, yb + 3, zf], [bx0 + cw, yb + 3 + ch, o.zF], o.paso, { canto: o.prof }),
    pieza(k('cajTapa', cw - 2 * t, ch), 'Tapa delantera / trasera de cajón', o.mat, [bx0 + t, yb + 3, o.zF - t], [bx0 + cw - t, yb + 3 + ch, o.zF], o.paso, {
      canto: cw - 2 * t,
    }),
    pieza(k('cajTapa', cw - 2 * t, ch), 'Tapa delantera / trasera de cajón', o.mat, [bx0 + t, yb + 3, zf], [bx0 + cw - t, yb + 3 + ch, zf + t], o.paso, {
      canto: cw - 2 * t,
    }),
    pieza(k('cajFondo', cw, o.prof, 'hdf3'), 'Fondo de cajón', 'hdf3', [bx0, yb, zf], [bx0 + cw, yb + 3, o.zF], o.paso),
  ]
  return {
    piezas,
    herrajes: [
      { id: o.prof === 450 ? 'corr45' : 'corr35', cantidad: 1 },
      { id: 't35x16', cantidad: 12 },
      { id: 't4x40', cantidad: 12 },
      { id: 'tirador', cantidad: 1 },
      { id: 'clavo1', cantidad: 14 },
    ],
  }
}

/** Columna de n cajones iguales que ocupan de y0 a y1 (frentes con junta de 3 mm). */
export function columnaCajones(o: Omit<Parameters<typeof cajon>[0], 'y0' | 'y1'> & { y0: number; y1: number; n: number }) {
  const fh = (o.y1 - o.y0 - (o.n - 1) * JUNTA) / o.n
  const piezas: PiezaInstancia[] = []
  const herrajes: HerrajeUso[] = []
  for (let i = 0; i < o.n; i++) {
    const y0 = o.y0 + i * (fh + JUNTA)
    const c = cajon({ ...o, y0, y1: y0 + fh })
    piezas.push(...c.piezas)
    herrajes.push(...c.herrajes)
  }
  return { piezas, herrajes, altoFrente: fh }
}

/** Puertas superpuestas (1 o 2) que cubren de x0 a x1 y de y0 a y1, delante de zF. */
export function puertas(o: { x0: number; x1: number; y0: number; y1: number; zF: number; n: number; mat: string; paso: number; veta?: boolean }) {
  const t = espesor(o.mat)
  const ancho = (o.x1 - o.x0 - (o.n - 1) * JUNTA) / o.n
  const alto = o.y1 - o.y0
  const piezas = Array.from({ length: o.n }, (_, i) => {
    const x = o.x0 + i * (ancho + JUNTA)
    return pieza(claveDim('puerta', o.mat, ancho, alto), 'Puerta', o.mat, [x, o.y0, o.zF], [x + ancho, o.y1, o.zF + t], o.paso, {
      canto: 2 * (ancho + alto),
      veta: o.veta,
    })
  })
  const bisagras = o.n * bisagrasPorPuerta(alto)
  return {
    piezas,
    herrajes: [
      { id: 'bisagra', cantidad: bisagras },
      { id: 't35x16', cantidad: bisagras * 4 },
      { id: 'tirador', cantidad: o.n },
    ],
  }
}

/** Repisas regulables sobre soportes, repartidas entre y0 y y1. */
export function repisas(o: { x0: number; x1: number; y0: number; y1: number; z0: number; z1: number; n: number; mat: string; paso: number; veta?: boolean }) {
  const t = espesor(o.mat)
  const piezas = repartir(o.y0, o.y1, o.n, t).map((y) =>
    pieza(claveDim('repisa', o.mat, o.x1 - o.x0 - 2, o.z1 - o.z0), 'Repisa', o.mat, [o.x0 + 1, y, o.z0], [o.x1 - 1, y + t, o.z1], o.paso, {
      canto: o.x1 - o.x0 - 2,
      veta: o.veta,
    }),
  )
  return { piezas, herrajes: [{ id: 'soporte', cantidad: o.n * 4 }] }
}

/** Respaldo de MDF 3 mm; se divide en franjas verticales si no cabe en una plancha. */
export function respaldo(o: { x0: number; x1: number; y0: number; y1: number; z0?: number; paso: number }) {
  const [L, A] = MATERIALES.hdf3.formato as [number, number]
  const W = o.x1 - o.x0
  const H = o.y1 - o.y0
  let k = 1
  while (!(Math.max(W / k, H) <= L && Math.min(W / k, H) <= A)) k++
  const z0 = o.z0 ?? 0
  const piezas = Array.from({ length: k }, (_, i) =>
    pieza(claveDim('respaldo', 'hdf3', W / k, H), k > 1 ? 'Respaldo (franja)' : 'Respaldo', 'hdf3', [o.x0 + (i * W) / k, o.y0, z0], [o.x0 + ((i + 1) * W) / k, o.y1, z0 + 3], o.paso),
  )
  return { piezas, herrajes: [{ id: 'clavo1', cantidad: Math.ceil((2 * (W + H)) / 100) + k * Math.ceil(H / 100) }] }
}

/** Tablero de una pieza o, si no cabe en la plancha, en franjas iguales a lo largo de x. */
export function tablero(clave: string, nombre: string, mat: string, min: V3, max: V3, paso: number, extra: { canto?: number; veta?: boolean } = {}) {
  const [L, A] = MATERIALES[mat].formato as [number, number]
  const t = espesor(mat)
  const dims = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  const iEsp = dims.findIndex((d) => Math.abs(d - t) < 0.6)
  const otros = [0, 1, 2].filter((i) => i !== iEsp)
  const eje = dims[otros[0]] >= dims[otros[1]] ? otros[0] : otros[1]
  const resto = otros.find((i) => i !== eje)!
  let k = 1
  while (!(Math.max(dims[eje] / k, dims[resto]) <= L && Math.min(dims[eje] / k, dims[resto]) <= A)) k++
  return Array.from({ length: k }, (_, i) => {
    const a = [...min] as V3
    const b = [...max] as V3
    a[eje] = min[eje] + (i * dims[eje]) / k
    b[eje] = min[eje] + ((i + 1) * dims[eje]) / k
    return pieza(claveDim(clave, mat, dims[eje] / k, dims[resto]), k > 1 ? `${nombre} (parte)` : nombre, mat, a, b, paso, extra)
  })
}

/** Listón largo dividido en tramos que no superen el largo comercial (los empalmes caen sobre apoyos). */
export function listonLargo(clave: string, nombre: string, mat: string, min: V3, max: V3, eje: 0 | 1 | 2, paso: number) {
  const largo = max[eje] - min[eje]
  let desde = min[eje]
  return tramos(largo, MATERIALES[mat].formato[0]).map((l) => {
    const a = [...min] as V3
    const b = [...max] as V3
    a[eje] = desde
    b[eje] = desde + l
    desde += l
    return pieza(claveDim(clave, mat, l, 0), nombre, mat, a, b, paso)
  })
}

/**
 * Listón recto que parte en `min`: el largo sigue al eje `eje`, la cara ancha de la sección al eje `ancho`
 * y el espesor al eje restante. Si supera el largo comercial se divide en tramos (empalmes sobre apoyos).
 */
export function lis(clave: string, nombre: string, mat: string, min: V3, eje: 0 | 1 | 2, largo: number, ancho: 0 | 1 | 2, paso: number, extra: { veta?: boolean; nota?: string } = {}) {
  const [a, e] = seccion(mat)
  const max = [...min] as V3
  max[eje] += largo
  max[ancho] += a
  max[3 - eje - ancho] += e
  if (largo <= MATERIALES[mat].formato[0]) return [pieza(claveDim(clave, mat, largo, 0), nombre, mat, min, max, paso, extra)]
  return listonLargo(clave, nombre, mat, min, max, eje, paso)
}

/** Medidas de colchón en Chile (ancho × largo, mm). */
export const COLCHONES: { nombre: string; ancho: number; largo: number }[] = [
  { nombre: '1 plaza (90×190)', ancho: 900, largo: 1900 },
  { nombre: '1½ plaza (105×190)', ancho: 1050, largo: 1900 },
  { nombre: '2 plazas (150×190)', ancho: 1500, largo: 1900 },
  { nombre: 'Queen (160×200)', ancho: 1600, largo: 2000 },
  { nombre: 'King (180×200)', ancho: 1800, largo: 2000 },
  { nombre: 'Super king (200×200)', ancho: 2000, largo: 2000 },
]

/**
 * Mesa de listones: 4 patas, faldones bajo la cubierta y cubierta de tablas (a lo largo de x) o de un tablero.
 * Devuelve también el ancho real (las tablas no siempre suman el ancho pedido).
 */
export function mesa(o: {
  L: number
  W: number
  H: number
  pata: { mat: string; ax: number; az: number; laminada?: boolean }
  retiro: number
  faldon: { mat: string }
  cubierta: { mat: string; tipo: 'tablas' | 'tablero'; junta?: number }
  pasos: { patas: number; faldones: number; cubierta: number }
}) {
  const piezas: PiezaInstancia[] = []
  const tc = espesor(o.cubierta.mat)
  const [fa, fe] = seccion(o.faldon.mat)
  // Ancho real: con tablas, el que resulta de sumar tablas enteras.
  let W = o.W
  const filas: number[] = []
  if (o.cubierta.tipo === 'tablas') {
    const [b] = seccion(o.cubierta.mat)
    const j = o.cubierta.junta ?? 3
    const n = Math.max(2, Math.round((o.W + j) / (b + j)))
    W = n * b + (n - 1) * j
    for (let i = 0; i < n; i++) filas.push(i * (b + j))
  }
  const { L, H, retiro: r } = o
  const { ax, az } = o.pata
  const yTop = H - tc
  for (const x of [r, L - r - ax])
    for (const z of [r, W - r - az]) {
      if (o.pata.laminada) {
        piezas.push(pieza(claveDim('pata', o.pata.mat, yTop, ax), 'Pata (mitad laminada)', o.pata.mat, [x, 0, z], [x + ax / 2, yTop, z + az], o.pasos.patas))
        piezas.push(pieza(claveDim('pata', o.pata.mat, yTop, ax), 'Pata (mitad laminada)', o.pata.mat, [x + ax / 2, 0, z], [x + ax, yTop, z + az], o.pasos.patas))
      } else piezas.push(pieza(claveDim('pata', o.pata.mat, yTop, ax * 1000 + az), 'Pata', o.pata.mat, [x, 0, z], [x + ax, yTop, z + az], o.pasos.patas))
    }
  const zc = [r + az / 2, W - r - az / 2]
  for (const c of zc)
    piezas.push(pieza(claveDim('faldonL', o.faldon.mat, L - 2 * (r + ax), fa), 'Faldón largo', o.faldon.mat, [r + ax, yTop - fa, c - fe / 2], [L - r - ax, yTop, c + fe / 2], o.pasos.faldones))
  const xc = [r + ax / 2, L - r - ax / 2]
  for (const c of xc)
    piezas.push(pieza(claveDim('faldonC', o.faldon.mat, W - 2 * (r + az), fa), 'Faldón corto', o.faldon.mat, [c - fe / 2, yTop - fa, r + az], [c + fe / 2, yTop, W - r - az], o.pasos.faldones))
  if (o.cubierta.tipo === 'tablas') {
    const [b] = seccion(o.cubierta.mat)
    for (const z of filas) piezas.push(...listonLargo('cubierta', 'Tabla de cubierta', o.cubierta.mat, [0, yTop, z], [L, H, z + b], 0, o.pasos.cubierta))
  } else piezas.push(...tablero('cubierta', 'Cubierta', o.cubierta.mat, [0, yTop, 0], [L, H, W], o.pasos.cubierta))
  return { piezas, W, yTop }
}

export interface Vano {
  /** Distancia desde el inicio del muro al borde del vano. */
  desde: number
  ancho: number
  /** Altura del borde superior del vano. */
  alto: number
  /** Altura del borde inferior (0 en puertas). */
  antepecho?: number
}

/**
 * Entramado de un muro: soleras, pies derechos cada `sep`, jambas, dinteles, antepechos y cadenetas a media altura.
 * eje 'x': el muro corre a lo largo de x desde origen; su espesor (ancho del listón) va en z.
 * eje 'z': corre a lo largo de z; su espesor va en x.
 */
export function entramado(o: { material: string; eje: 'x' | 'z'; origen: V3; largo: number; alto: number; sep: number; vanos?: Vano[]; paso: number; cadenetas?: boolean }) {
  const [a, e] = seccion(o.material)
  const piezas: PiezaInstancia[] = []
  const vanos = o.vanos ?? []
  const put = (tipo: string, nombre: string, u0: number, u1: number, y0: number, y1: number) => {
    if (u1 - u0 < 10 || y1 - y0 < 10) return
    const [x0, y, z0] = o.origen
    const largo = Math.max(u1 - u0, y1 - y0)
    if (o.eje === 'x') piezas.push(...partir(tipo, nombre, [x0 + u0, y + y0, z0], [x0 + u1, y + y1, z0 + a], u1 - u0 >= y1 - y0 ? 0 : 1, largo))
    else piezas.push(...partir(tipo, nombre, [x0, y + y0, z0 + u0], [x0 + a, y + y1, z0 + u1], u1 - u0 >= y1 - y0 ? 2 : 1, largo))
  }
  const partir = (tipo: string, nombre: string, min: V3, max: V3, eje: 0 | 1 | 2, largo: number) =>
    largo > MATERIALES[o.material].formato[0]
      ? listonLargo(tipo, nombre, o.material, min, max, eje, o.paso)
      : [pieza(claveDim(tipo, o.material, largo, 0), nombre, o.material, min, max, o.paso)]

  put('solera', 'Solera inferior', 0, o.largo, 0, e)
  put('solera', 'Solera superior', 0, o.largo, o.alto - e, o.alto)
  const zonas = vanos.map((v) => [v.desde - e, v.desde + v.ancho + e])
  const enZona = (p: number) => zonas.some(([z0, z1]) => p + e > z0 && p < z1)
  const grilla: number[] = []
  for (let p = 0; p < o.largo - e; p += o.sep) grilla.push(p)
  // Si el último pie de la grilla queda pegado al del extremo, se reemplaza por este.
  if (grilla.length > 1 && o.largo - e - grilla[grilla.length - 1] < e) grilla.pop()
  grilla.push(o.largo - e)
  const verticales: [number, number][] = []
  for (const p of grilla)
    if (!enZona(p)) {
      put('pie', 'Pie derecho', p, p + e, e, o.alto - e)
      verticales.push([p, p + e])
    }
  for (const v of vanos) {
    const d = v.desde
    const w = v.ancho
    put('jamba', 'Jamba', d - e, d, e, v.alto)
    put('jamba', 'Jamba', d + w, d + w + e, e, v.alto)
    verticales.push([d - e, d], [d + w, d + w + e])
    put('dintel', 'Dintel', d - e, d + w + e, v.alto, v.alto + e)
    for (const p of grilla) if (p >= d && p + e <= d + w) put('cojo', 'Pie cojo', p, p + e, v.alto + e, o.alto - e)
    if (v.antepecho) {
      put('antepecho', 'Antepecho', d, d + w, v.antepecho - e, v.antepecho)
      for (const p of grilla) if (p >= d && p + e <= d + w) put('cojo', 'Pie cojo', p, p + e, e, v.antepecho - e)
    }
  }
  if (o.cadenetas !== false) {
    const ym = Math.round(o.alto / 2)
    verticales.sort((p, q) => p[0] - q[0])
    for (let i = 0; i + 1 < verticales.length; i++) {
      const u0 = verticales[i][1]
      const u1 = verticales[i + 1][0]
      // Bajo y sobre los vanos hay pies cojos: ahí no van cadenetas.
      const cruzaVano = vanos.some((v) => u0 < v.desde + v.ancho && u1 > v.desde)
      if (u1 - u0 > 20 && !cruzaVano) put('cadeneta', 'Cadeneta', u0, u1, ym - e / 2, ym + e / 2)
    }
  }
  return { piezas, aberturas: vanos.map((v) => ({ u0: v.desde, u1: v.desde + v.ancho, v0: v.antepecho ?? 0, v1: v.alto })) }
}

/**
 * Cuerpo de melamina: laterales de piso a techo, base sobre zócalo retranqueado 5 cm y techo completo
 * o dos travesaños (muebles base de cocina). Ocupa x0..x0+W y z0..z1. Devuelve el hueco interior.
 */
export function cuerpo(o: {
  x0?: number
  W: number
  H: number
  z0: number
  z1: number
  mat: string
  zocalo: number
  techo: 'completo' | 'travesanos'
  paso: number
}) {
  const t = espesor(o.mat)
  const x0 = o.x0 ?? 0
  const x1 = x0 + o.W
  const D = o.z1 - o.z0
  const Z = o.zocalo
  const k = (b: string, a: number, c: number) => claveDim(b, o.mat, a, c)
  const piezas: PiezaInstancia[] = []
  for (const x of [x0, x1 - t]) piezas.push(pieza(k('lateral', o.H, D), 'Lateral', o.mat, [x, 0, o.z0], [x + t, o.H, o.z1], o.paso, { canto: o.H }))
  piezas.push(pieza(k('base', o.W - 2 * t, D), 'Base', o.mat, [x0 + t, Z, o.z0], [x1 - t, Z + t, o.z1], o.paso, { canto: o.W - 2 * t }))
  if (Z > 0) piezas.push(pieza(k('zocalo', o.W - 2 * t, Z), 'Zócalo', o.mat, [x0 + t, 0, o.z1 - 50 - t], [x1 - t, Z, o.z1 - 50], o.paso, { canto: o.W - 2 * t }))
  if (o.techo === 'completo') piezas.push(pieza(k('techo', o.W - 2 * t, D), 'Techo', o.mat, [x0 + t, o.H - t, o.z0], [x1 - t, o.H, o.z1], o.paso, { canto: o.W - 2 * t }))
  else
    for (const z of [o.z0, o.z1 - 100]) piezas.push(pieza(k('travesano', o.W - 2 * t, 100), 'Travesaño superior', o.mat, [x0 + t, o.H - t, z], [x1 - t, o.H, z + 100], o.paso, { canto: o.W - 2 * t }))
  return {
    piezas,
    herrajes: [{ id: 't4x40', cantidad: Z > 0 ? 16 : 12 }] as HerrajeUso[],
    interior: { x0: x0 + t, x1: x1 - t, y0: Z + t, y1: o.H - t },
  }
}
