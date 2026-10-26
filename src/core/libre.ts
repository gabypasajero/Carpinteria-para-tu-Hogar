// Diseño libre: piezas que la persona agrega, mide y ubica a mano en el diseñador 3D.
// Cada pieza se convierte en una PiezaInstancia, así reutiliza la lista de corte, el optimizador,
// los costos y el PDF de los proyectos del catálogo.
import { MATERIALES } from './catalogo'
import type { HerrajeUso, PiezaInstancia } from './types'

export type Eje = 0 | 1 | 2
export type Canto = 'ninguno' | 'frente' | 'contorno'

export interface PiezaLibre {
  id: string
  nombre: string
  material: string
  /** Largo de la pieza (mm), sobre el eje ejeLargo. */
  largo: number
  /** Ancho de una plancha (mm). En listones lo fija la sección. */
  ancho: number
  ejeLargo: Eje
  /** Eje del espesor (plancha) o del lado delgado de la sección (listón). */
  ejeGrosor: Eje
  /** Centro de la pieza (mm). */
  pos: [number, number, number]
  rot?: [number, number, number]
  canto: Canto
}

export interface DisenoLibre {
  nombre: string
  piezas: PiezaLibre[]
  herrajes: HerrajeUso[]
}

const otro = (a: Eje, b: Eje): Eje => (3 - a - b) as Eje

export function medidas(p: PiezaLibre): [number, number, number] {
  const m = MATERIALES[p.material]
  const size: [number, number, number] = [0, 0, 0]
  if (m.tipo === 'liston') {
    const [a, e] = m.seccion!
    size[p.ejeLargo] = p.largo
    size[p.ejeGrosor] = e
    // Un listón puede ir rebajado (más angosto que su sección); 0 = sección completa.
    size[otro(p.ejeLargo, p.ejeGrosor)] = p.ancho > 0 ? p.ancho : a
  } else {
    size[p.ejeLargo] = p.largo
    size[p.ejeGrosor] = m.espesor
    size[otro(p.ejeLargo, p.ejeGrosor)] = p.ancho
  }
  return size
}

const r = (v: number) => Math.round(v * 2) / 2

export function aInstancia(p: PiezaLibre): PiezaInstancia {
  const size = medidas(p).map(r) as [number, number, number]
  const m = MATERIALES[p.material]
  const [a, b] = [size[p.ejeLargo], size[otro(p.ejeLargo, p.ejeGrosor)]].sort((x, y) => y - x)
  // Piezas iguales (mismo material y medidas de corte) comparten letra.
  const clave = m.tipo === 'liston' ? `libre-${p.material}-${r(p.largo)}` : `libre-${p.material}-${a}x${b}`
  const canto = !m.usaTapacanto ? 0 : p.canto === 'frente' ? p.largo : p.canto === 'contorno' ? 2 * (p.largo + p.ancho) : 0
  return { clave, nombre: p.nombre, material: p.material, size, pos: p.pos, rot: p.rot, paso: 1, canto }
}

/** Pieza del catálogo convertida en pieza editable. */
export function desdeInstancia(pi: PiezaInstancia, id: string): PiezaLibre {
  const m = MATERIALES[pi.material]
  const s = pi.size
  const ejes: Eje[] = [0, 1, 2]
  const cercano = (lista: Eje[], v: number) => lista.reduce((a, b) => (Math.abs(s[b] - v) < Math.abs(s[a] - v) ? b : a))
  let ejeLargo: Eje
  let ejeGrosor: Eje
  if (m.tipo === 'liston') {
    // Se reconoce la sección: el espesor y el ancho del listón; lo que queda es el largo.
    const [a, e] = m.seccion!
    ejeGrosor = cercano(ejes, e)
    const ejeAncho = cercano(
      ejes.filter((x) => x !== ejeGrosor),
      a,
    )
    ejeLargo = otro(ejeGrosor, ejeAncho)
  } else {
    ejeGrosor = cercano(ejes, m.espesor)
    const resto = ejes.filter((x) => x !== ejeGrosor)
    ejeLargo = s[resto[0]] >= s[resto[1]] ? resto[0] : resto[1]
  }
  const anchoReal = s[otro(ejeLargo, ejeGrosor)]
  const ancho = m.tipo === 'liston' && Math.abs(anchoReal - m.seccion![0]) < 0.6 ? 0 : anchoReal
  return {
    id,
    nombre: pi.nombre,
    material: pi.material,
    largo: s[ejeLargo],
    ancho,
    ejeLargo,
    ejeGrosor,
    pos: [...pi.pos] as [number, number, number],
    rot: pi.rot,
    canto: m.usaTapacanto && (pi.canto ?? 0) > 0 ? 'frente' : 'ninguno',
  }
}

/** Gira la pieza 90° alrededor de un eje (intercambia los otros dos). */
export function girar(p: PiezaLibre, eje: Eje): PiezaLibre {
  const cambia = (e: Eje): Eje => {
    if (e === eje) return e
    return otro(eje, e)
  }
  return { ...p, ejeLargo: cambia(p.ejeLargo), ejeGrosor: cambia(p.ejeGrosor) }
}

/** Si la pieza quedó bajo el piso (por ejemplo al girarla), la sube hasta apoyarla. */
export function sobrePiso(p: PiezaLibre): PiezaLibre {
  const y = caja(p).min[1]
  return y < 0 ? { ...p, pos: [p.pos[0], p.pos[1] - y, p.pos[2]] } : p
}

export function nuevaPieza(material: string, id: string, n: number, otras: PiezaLibre[] = []): PiezaLibre {
  const m = MATERIALES[material]
  const plancha = m.tipo === 'plancha'
  const largo = plancha ? 600 : 900
  const ancho = plancha ? 400 : 0
  const pieza: PiezaLibre = { id, nombre: `${plancha ? 'Tablero' : 'Listón'} ${n}`, material, largo, ancho, ejeLargo: 0, ejeGrosor: 1, pos: [0, 0, 0], canto: m.usaTapacanto ? 'frente' : 'ninguno' }
  const size = medidas(pieza)
  // Aparece a la derecha de lo ya diseñado para no quedar encima de otra pieza.
  const xMax = otras.length ? Math.max(...otras.map((o) => caja(o).max[0])) + 80 : 0
  pieza.pos = [xMax + largo / 2, size[1] / 2, size[2] / 2]
  return pieza
}

/** Límites (sin giro) para apoyar en el piso o medir el conjunto. */
export function caja(p: PiezaLibre) {
  const s = medidas(p)
  return { min: p.pos.map((c, i) => c - s[i] / 2) as [number, number, number], max: p.pos.map((c, i) => c + s[i] / 2) as [number, number, number] }
}

/** Pares de piezas que se atraviesan (sin contar las giradas). */
export function choques(piezas: PiezaLibre[]): [string, string][] {
  const out: [string, string][] = []
  const cajas = piezas.filter((p) => !p.rot).map((p) => ({ p, ...caja(p) }))
  for (let i = 0; i < cajas.length; i++)
    for (let j = i + 1; j < cajas.length; j++) {
      const a = cajas[i]
      const b = cajas[j]
      if ([0, 1, 2].every((k) => Math.min(a.max[k], b.max[k]) - Math.max(a.min[k], b.min[k]) > 0.5)) out.push([a.p.nombre, b.p.nombre])
    }
  return out
}

/** Tornillos y cola sugeridos: 4 por tablero y 2 por listón por unión aproximada. */
export function herrajesSugeridos(piezas: PiezaLibre[]): HerrajeUso[] {
  const planchas = piezas.filter((p) => MATERIALES[p.material].tipo === 'plancha' && MATERIALES[p.material].espesor >= 9).length
  const listones = piezas.filter((p) => MATERIALES[p.material].tipo === 'liston').length
  const finas = piezas.filter((p) => MATERIALES[p.material].espesor < 9).length
  const out: HerrajeUso[] = []
  if (planchas) out.push({ id: 't4x40', cantidad: planchas * 4 })
  if (listones) out.push({ id: 't4x50', cantidad: listones * 4 })
  if (finas) out.push({ id: 'clavo1', cantidad: finas * 20 })
  if (piezas.length) out.push({ id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 })
  return out
}

// Enlace para compartir: el diseño completo en la URL, sin cuenta.
export function codificar(d: DisenoLibre): string {
  const compacto = {
    n: d.nombre,
    p: d.piezas.map((p) => [p.nombre, p.material, p.largo, p.ancho, p.ejeLargo, p.ejeGrosor, p.pos.map(r), p.rot ?? 0, p.canto]),
    h: d.herrajes.map((h) => [h.id, h.cantidad]),
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(compacto))))
}

export function decodificar(s: string): DisenoLibre | null {
  try {
    const c = JSON.parse(decodeURIComponent(escape(atob(s))))
    return {
      nombre: c.n,
      piezas: c.p
        .filter((x: unknown[]) => MATERIALES[x[1] as string])
        .map((x: unknown[], i: number) => ({
          id: `p${i}-${Date.now()}`,
          nombre: x[0],
          material: x[1],
          largo: x[2],
          ancho: x[3],
          ejeLargo: x[4],
          ejeGrosor: x[5],
          pos: x[6],
          rot: x[7] || undefined,
          canto: x[8],
        })),
      herrajes: c.h.map(([id, cantidad]: [string, number]) => ({ id, cantidad })),
    }
  } catch {
    return null
  }
}
