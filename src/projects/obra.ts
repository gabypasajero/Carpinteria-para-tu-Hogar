// Construcciones livianas: revestimientos de tablas y casetas con piso, muros de entramado y techo a dos aguas.
// Lo usan la casita de juegos, la casa de perro, la bodega y la habitación.
import { MATERIALES } from '../core/catalogo'
import type { PiezaInstancia } from '../core/types'
import { entramado, lis, type Vano } from './kit'
import { barra, cada, claveDim, espesor, pieza, placas, redondear, seccion, tramos, type V3 } from './util'

interface Rect {
  u0: number
  u1: number
  v0: number
  v1: number
}

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
 * Revestimiento de tablas (machihembrado, siding) sobre un plano, horizontales ('h') o verticales ('v'),
 * restando aberturas. `util` es el ancho cubierto por cada tabla (en machihembrado, menos que su ancho real).
 * Las tablas más largas que el largo comercial se dividen en tramos iguales.
 */
export function tablasMuro(
  base: string,
  nombre: string,
  mat: string,
  plano: 'xy' | 'zy',
  u: [number, number],
  v: [number, number],
  w0: number,
  paso: number,
  aberturas: Rect[] = [],
  dir: 'h' | 'v' = 'h',
  util?: number,
): PiezaInstancia[] {
  const [a, e] = seccion(mat)
  const p = util ?? a
  let rects: Rect[] = []
  if (dir === 'h') for (let b = v[0]; b < v[1] - 1; b += p) rects.push({ u0: u[0], u1: u[1], v0: b, v1: Math.min(b + p, v[1]) })
  else for (let b = u[0]; b < u[1] - 1; b += p) rects.push({ u0: b, u1: Math.min(b + p, u[1]), v0: v[0], v1: v[1] })
  for (const h of aberturas) rects = rects.flatMap((r) => restar(r, h))
  const largoMax = MATERIALES[mat].formato[0]
  const piezas: PiezaInstancia[] = []
  for (const r of rects) {
    const largo = dir === 'h' ? r.u1 - r.u0 : r.v1 - r.v0
    const ancho = dir === 'h' ? r.v1 - r.v0 : r.u1 - r.u0
    if (largo < 100 || ancho < 20) continue
    let desde = dir === 'h' ? r.u0 : r.v0
    for (const l of tramos(largo, largoMax)) {
      const q = dir === 'h' ? { ...r, u0: desde, u1: desde + l } : { ...r, v0: desde, v1: desde + l }
      desde += l
      const clave = claveDim(base, mat, l, 0)
      if (plano === 'xy') piezas.push(pieza(clave, nombre, mat, [q.u0, q.v0, w0], [q.u1, q.v1, w0 + e], paso))
      else piezas.push(pieza(clave, nombre, mat, [w0, q.v0, q.u0], [w0 + e, q.v1, q.u1], paso))
    }
  }
  return piezas
}

/** Placas de techo sobre un faldón inclinado (de a, en el alero, hasta b, en la cumbrera), sobre los cabios. */
function faldon(mat: string, L: number, a: [number, number], b: [number, number], sobre: number, paso: number): PiezaInstancia[] {
  const [Lp, Ap] = MATERIALES[mat].formato as [number, number]
  const t = espesor(mat)
  const dz = b[0] - a[0]
  const dy = b[1] - a[1]
  const largo = Math.hypot(dz, dy)
  const u = [dz / largo, dy / largo]
  // Normal hacia afuera del techo (arriba y hacia el alero).
  const n = dz > 0 ? [-dy / largo, dz / largo] : [dy / largo, -dz / largo]
  const ang = Math.atan2(-dy, dz)
  const nx = Math.ceil(L / Lp)
  const ns = Math.ceil(largo / Ap)
  const piezas: PiezaInstancia[] = []
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ns; j++) {
      const s = ((j + 0.5) * largo) / ns
      const off = sobre + t / 2
      const pos: V3 = [((i + 0.5) * L) / nx, a[1] + u[1] * s + n[1] * off, a[0] + u[0] * s + n[0] * off]
      piezas.push({ clave: claveDim('techo', mat, L / nx, largo / ns), nombre: 'Placa de techo', material: mat, size: [redondear(L / nx), t, redondear(largo / ns)], pos, rot: [ang, 0, 0], paso })
    }
  return piezas
}

export interface OpcCasa {
  /** Largo (x), ancho (z) exteriores y alto de muros. */
  L: number
  W: number
  Hm: number
  piso: { vigas: string; sep: number; placa: string }
  muro: { mat: string; sep: number; revest: string; tablas?: { util: number }; interior?: string; cadenetas?: boolean }
  techo: { cabios: string; sep: number; pendiente: number; placa: string }
  /** Vanos de cada muro, medidos desde el inicio de su entramado (izquierda mirando desde afuera no importa: desde x o z menor). */
  vanos?: { frente?: Vano[]; fondo?: Vano[]; izq?: Vano[]; der?: Vano[] }
  pasos: { piso: number; muros: number; revest: number; techo: number; interior?: number }
}

/** Caseta completa: piso de vigas y placas, cuatro muros de entramado revestidos, frontones y techo a dos aguas (cumbrera a lo largo de x). */
export function casa(o: OpcCasa) {
  const { L, W, Hm } = o
  const piezas: PiezaInstancia[] = []
  // Piso
  const [va, ve] = seccion(o.piso.vigas)
  const xsVigas = cada(0, L, ve, o.piso.sep)
  for (const x of xsVigas) piezas.push(...lis('viga', 'Viga de piso', o.piso.vigas, [x, 0, 0], 2, W, 1, o.pasos.piso))
  const piso = placas('piso', 'Placa de piso', o.piso.placa, 'xz', [0, L], [0, W], va, o.pasos.piso)
  piezas.push(...piso)
  const yF = va + espesor(o.piso.placa)

  // Muros
  const m = o.muro
  const [a] = seccion(m.mat)
  const c = m.tablas ? seccion(m.revest)[1] : espesor(m.revest)
  const v = o.vanos ?? {}
  const muros = [
    { eje: 'x' as const, origen: [c, yF, c] as V3, largo: L - 2 * c, vanos: v.fondo ?? [] },
    { eje: 'x' as const, origen: [c, yF, W - c - a] as V3, largo: L - 2 * c, vanos: v.frente ?? [] },
    { eje: 'z' as const, origen: [c, yF, c + a] as V3, largo: W - 2 * c - 2 * a, vanos: v.izq ?? [] },
    { eje: 'z' as const, origen: [L - c - a, yF, c + a] as V3, largo: W - 2 * c - 2 * a, vanos: v.der ?? [] },
  ]
  let piezasEntramado = 0
  const ab = muros.map((mu) => {
    const e = entramado({ material: m.mat, eje: mu.eje, origen: mu.origen, largo: mu.largo, alto: Hm, sep: m.sep, vanos: mu.vanos, paso: o.pasos.muros, cadenetas: m.cadenetas })
    piezas.push(...e.piezas)
    piezasEntramado += e.piezas.length
    // Aberturas en coordenadas absolutas (u = x en muros 'x', u = z en muros 'z').
    const du = mu.eje === 'x' ? mu.origen[0] : mu.origen[2]
    return e.aberturas.map((r) => ({ u0: r.u0 + du, u1: r.u1 + du, v0: r.v0 + yF, v1: r.v1 + yF }))
  })
  const vMuro: [number, number] = [yF, yF + Hm]
  const revestir = (plano: 'xy' | 'zy', u: [number, number], w0: number, aberturas: Rect[]) =>
    m.tablas
      ? tablasMuro('revest', 'Revestimiento exterior', m.revest, plano, u, vMuro, w0, o.pasos.revest, aberturas, 'h', m.tablas.util)
      : placas('revest', 'Revestimiento exterior', m.revest, plano, u, vMuro, w0, o.pasos.revest, aberturas)
  const revest = [
    ...revestir('xy', [0, L], 0, ab[0]),
    ...revestir('xy', [0, L], W - c, ab[1]),
    ...revestir('zy', [c, W - c], 0, ab[2]),
    ...revestir('zy', [c, W - c], L - c, ab[3]),
  ]
  piezas.push(...revest)

  // Revestimiento interior (sin traslapar en las esquinas).
  const interior: PiezaInstancia[] = []
  if (m.interior) {
    const ti = espesor(m.interior)
    const pi = o.pasos.interior ?? o.pasos.revest
    const i0 = c + a
    interior.push(
      ...placas('interior', 'Revestimiento interior', m.interior, 'xy', [i0, L - i0], vMuro, i0, pi, ab[0]),
      ...placas('interior', 'Revestimiento interior', m.interior, 'xy', [i0, L - i0], vMuro, W - i0 - ti, pi, ab[1]),
      ...placas('interior', 'Revestimiento interior', m.interior, 'zy', [i0 + ti, W - i0 - ti], vMuro, i0, pi, ab[2]),
      ...placas('interior', 'Revestimiento interior', m.interior, 'zy', [i0 + ti, W - i0 - ti], vMuro, L - i0 - ti, pi, ab[3]),
    )
    piezas.push(...interior)
  }

  // Techo
  const t = o.techo
  const p = (t.pendiente * Math.PI) / 180
  const [ra, re] = seccion(t.cabios)
  const half = ra / 2
  const tp = espesor(t.placa)
  const zs = (half + tp) * Math.sin(p) + 2
  const yT = yF + Hm
  const y0 = yT + half / Math.cos(p)
  const y1 = y0 + (W / 2 - zs) * Math.tan(p)
  const nota = `cortes a ${t.pendiente}°`
  const xsCabios = cada(c, L - c - re, re, t.sep)
  for (const x of xsCabios)
    for (const z of [zs, W - zs]) piezas.push(barra('cabio', 'Cabio', t.cabios, [x + re / 2, y0, z], [x + re / 2, y1, W / 2], 'zy', [ra, re], o.pasos.techo, { nota }))
  piezas.push(...lis('cumbrera', 'Cumbrera', t.cabios, [c + re, y1 + half / Math.cos(p) - ra - 30, W / 2 - re / 2], 0, L - 2 * c - 2 * re, 1, o.pasos.techo))
  const techo = [...faldon(t.placa, L, [zs, y0], [W / 2, y1], half, o.pasos.techo), ...faldon(t.placa, L, [W - zs, y0], [W / 2, y1], half, o.pasos.techo)]
  piezas.push(...techo)

  // Frontones: franjas que se angostan hacia la cumbrera (se cortan en ángulo al presentarlas).
  const hFr = m.tablas ? m.tablas.util : 300
  const nombreFr = 'Frontón'
  const frontones: PiezaInstancia[] = []
  for (let yb = yT; ; yb += hFr) {
    const alto = Math.min(hFr, y1 - yb)
    // Largo a media altura de la franja: el trapecio que se corta tiene esa misma superficie.
    const largo = Math.min(W - 2 * c, W - 2 * (zs + (yb + alto / 2 - yT) / Math.tan(p)))
    if (largo < 100 || alto < 20) break
    // Las franjas más largas que la plancha o la tabla se dividen en tramos iguales.
    const partes = tramos(largo, MATERIALES[m.revest].formato[0])
    for (const x of [0, L - c]) {
      let z0 = W / 2 - largo / 2
      for (const l of partes) {
        const clave = m.tablas ? claveDim('fronton', m.revest, l, 0) : claveDim('fronton', m.revest, l, alto)
        frontones.push(pieza(clave, nombreFr, m.revest, [x, yb, z0], [x + c, yb + alto, z0 + l], o.pasos.techo, { nota: `cortar a ${t.pendiente}° en los extremos` }))
        z0 += l
      }
    }
  }
  piezas.push(...frontones)

  const areaPlano = (ps: PiezaInstancia[]) =>
    ps.reduce((s, q) => {
      const [x, y] = [...q.size].sort((m1, m2) => m2 - m1)
      return s + (x * y) / 1e6
    }, 0)
  const aberturas = ab.flat().reduce((s, r) => s + ((r.u1 - r.u0) * (r.v1 - r.v0)) / 1e6, 0)
  const areaMuros = (2 * (L + W) * Hm) / 1e6 - aberturas
  return {
    piezas,
    yF,
    yT,
    cumbre: y1 + half,
    areaPiso: (L * W) / 1e6,
    areaMuros,
    areaRevest: areaPlano(revest) + areaPlano(frontones),
    areaInterior: areaPlano(interior),
    areaTecho: areaPlano(techo),
    nVigas: xsVigas.length,
    nCabios: xsCabios.length * 2,
    piezasEntramado,
    tablasRevest: m.tablas ? revest.length + frontones.length : 0,
  }
}
