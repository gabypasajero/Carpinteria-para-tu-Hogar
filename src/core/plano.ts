// Plano para cotizar: el diseño en un formato abierto (JSON) que la mueblería puede leer en su propio diseñador
// para armar el presupuesto. Trae la lista de corte, los herrajes y cada pieza ubicada en 3D.
// Formato documentado en docs/formato-plano.md.
import { HERRAJES, MATERIALES } from './catalogo'
import { cantosPorLado } from './dimensionado'
import type { HerrajeUso, PiezaCorte, PiezaInstancia } from './types'

export const FORMATO_PLANO = 'carpinteria-plano'
export const VERSION_PLANO = 1

export interface PlanoCotizar {
  formato: typeof FORMATO_PLANO
  version: number
  creado: string
  nombre: string
  /** Id del proyecto del catálogo, o «libre» si lo diseñó la persona. */
  proyecto: string
  enlace: string
  /** Medidas exteriores en mm: ancho, alto, fondo. */
  medidas: { ancho: number; alto: number; fondo: number }
  costoMateriales: number
  cortes: {
    letra: string
    nombre: string
    material: string
    materialNombre: string
    tipo: 'plancha' | 'liston'
    cantidad: number
    largo: number
    ancho: number
    espesor: number
    veta: boolean
    tapacantoLados: { largos: number; anchos: number }
    nota?: string
  }[]
  herrajes: { id: string; nombre: string; cantidad: number; unidad: string }[]
  /** Cada pieza en 3D (mm, centro de la pieza; giro en radianes). z = 0 es el muro. */
  piezas: { letra: string; nombre: string; material: string; size: [number, number, number]; pos: [number, number, number]; rot?: [number, number, number] }[]
}

interface Datos {
  nombre: string
  proyecto: string
  enlace: string
  exterior: [number, number, number]
  costoMateriales: number
  cortes: PiezaCorte[]
  letras: Record<string, string>
  piezas: PiezaInstancia[]
  herrajes: HerrajeUso[]
}

const r1 = (v: number) => Math.round(v * 10) / 10

export function planoParaCotizar(d: Datos): PlanoCotizar {
  return {
    formato: FORMATO_PLANO,
    version: VERSION_PLANO,
    creado: new Date().toISOString(),
    nombre: d.nombre,
    proyecto: d.proyecto,
    enlace: d.enlace,
    medidas: { ancho: r1(d.exterior[0]), alto: r1(d.exterior[1]), fondo: r1(d.exterior[2]) },
    costoMateriales: Math.round(d.costoMateriales),
    cortes: d.cortes.map((c) => ({
      letra: c.letra,
      nombre: c.nombre,
      material: c.material,
      materialNombre: MATERIALES[c.material].nombre,
      tipo: MATERIALES[c.material].tipo,
      cantidad: c.cantidad,
      largo: c.largo,
      ancho: c.ancho,
      espesor: c.espesor,
      veta: c.veta,
      tapacantoLados: cantosPorLado(c),
      ...(c.nota ? { nota: c.nota } : {}),
    })),
    herrajes: d.herrajes.map((h) => ({ id: h.id, nombre: HERRAJES[h.id]?.nombre ?? h.id, cantidad: h.cantidad, unidad: HERRAJES[h.id]?.unidadUso ?? 'u' })),
    piezas: d.piezas.map((p) => ({
      letra: d.letras[p.clave] ?? '',
      nombre: p.nombre,
      material: p.material,
      size: p.size.map(r1) as [number, number, number],
      pos: p.pos.map(r1) as [number, number, number],
      ...(p.rot ? { rot: p.rot } : {}),
    })),
  }
}

/** Descarga el plano como archivo .json. */
export function descargarPlano(plano: PlanoCotizar) {
  const blob = new Blob([JSON.stringify(plano, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${plano.nombre.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}.plano.json`
  a.click()
  URL.revokeObjectURL(a.href)
}
