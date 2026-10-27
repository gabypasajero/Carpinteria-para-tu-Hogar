// Muebles que De Todito Outlet vende ya armados: solo en estos se sugiere cotizarle el proyecto listo.
export const TIPOS_DTO = {
  closet: { nombre: 'Closet', plural: 'closets' },
  velador: { nombre: 'Velador', plural: 'veladores' },
  comoda: { nombre: 'Cómoda', plural: 'cómodas' },
  cocina: { nombre: 'Mueble de cocina', plural: 'muebles de cocina' },
} as const

export type TipoMueble = keyof typeof TIPOS_DTO | 'otro'

const POR_PROYECTO: Record<string, TipoMueble> = {
  closet: 'closet',
  closet_abierto: 'closet',
  velador: 'velador',
  velador_infantil: 'velador',
  comoda: 'comoda',
  cocina_base: 'cocina',
  cocina_aereo: 'cocina',
  despensa: 'cocina',
  isla: 'cocina',
}

export const tipoDeProyecto = (id: string): TipoMueble => POR_PROYECTO[id] ?? 'otro'

const PALABRAS: [RegExp, TipoMueble][] = [
  [/closet|cl[oó]set|ropero|vestidor|guardarropa/, 'closet'],
  [/velador|mesita de noche|mesa de noche/, 'velador'],
  [/c[oó]moda|cajonera/, 'comoda'],
  [/cocina|isla|despensa|alacena|lavaplatos|mueble a[eé]reo/, 'cocina'],
]

/** Tipo de un diseño propio según su nombre (si la persona no lo eligió). */
export function tipoDeNombre(nombre: string): TipoMueble {
  const n = nombre.toLowerCase()
  return PALABRAS.find(([re]) => re.test(n))?.[1] ?? 'otro'
}
