export interface Tienda {
  id: string
  nombre: string
  whatsapp: string | null
  /** Precio de fabricación estimado = costo de materiales × factor. */
  factor: number
}

/** Se usan cuando la app corre sin Supabase o mientras cargan los datos. */
export const TIENDAS_POR_DEFECTO: Tienda[] = [
  { id: 'detodito', nombre: 'De Todito Outlet', whatsapp: null, factor: 2.5 },
  { id: 'molina', nombre: 'Muebles y Hogar Molina', whatsapp: null, factor: 2.5 },
]

/** Precio «desde» para que te lo fabriquen, redondeado a miles. */
export function precioFabricacion(costoMateriales: number, tiendas: Tienda[]): number {
  const factor = Math.min(...tiendas.map((t) => t.factor))
  return Math.round((costoMateriales * factor) / 1000) * 1000
}
