// Resultados de la investigación de Connan para la ficha técnica: fuentes de las reglas,
// herramientas en tres gamas de precio y el precio de cada material en cada tienda.
import datos from '../data/investigacion.json'

export interface Fuente {
  titulo: string
  url: string
}

export interface OfertaTienda {
  tienda: string
  producto: string
  precio: number
  oferta: number | null
  url: string
}

export interface Gama {
  tienda: string
  nombre: string
  marca?: string
  precio: number
  oferta: number | null
  url: string
}

export const FUENTES = datos.fuentes as Record<string, Fuente>
export const GAMAS_HERRAMIENTAS = datos.herramientas as Record<string, { nombre: string; gamas: Partial<Record<'economica' | 'media' | 'premium', Gama>> }>
export const PRECIOS_POR_TIENDA = datos.tiendas as Record<string, OfertaTienda[]>
export const FECHA_INVESTIGACION = datos.fecha

/** Cómo se informa el permiso en el catálogo: sin permiso, requiere permiso o consultar a la DOM. */
export function etiquetaPermiso(texto: string | undefined): { texto: string; tipo: 'ok' | 'alerta' | 'consultar' } | null {
  if (!texto) return null
  if (/sin permiso/i.test(texto)) return { texto: 'Sin permiso', tipo: 'ok' }
  if (/requiere|obra menor|con permiso/i.test(texto)) return { texto: 'Requiere permiso', tipo: 'alerta' }
  return { texto: 'Consultar DOM', tipo: 'consultar' }
}

export const fechaLarga = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split('-')
  return `${d}-${m}-${a}`
}

/** «3 plancha», «2 × bolsa de 24 u»: cuando el envase trae varias unidades se muestra como multiplicación. */
export const comprar = (cantidad: number, unidadVenta: string) => (/^\d/.test(unidadVenta) ? `${cantidad} × ${unidadVenta}` : `${cantidad} ${unidadVenta}`)
