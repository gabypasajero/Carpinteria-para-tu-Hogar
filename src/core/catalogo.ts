// Materiales, herrajes y herramientas. Las propiedades físicas viven aquí; el precio, la tienda,
// el envase y el formato real de cada plancha vienen de src/data/precios.json, que se genera desde
// la investigación de precios (scripts/precios/generar_app.py). La tabla carpinteria.precios de
// Supabase los reemplaza sin volver a publicar, y cada persona puede ajustarlos en su navegador.
import datos from '../data/precios.json'

export type TipoMaterial = 'plancha' | 'liston'

export interface MaterialDef {
  id: string
  nombre: string
  tipo: TipoMaterial
  espesor: number
  /** Plancha: [largo, ancho] mm. Listón: [largo] mm de la pieza comercial. */
  formato: [number, number] | [number]
  /** Sección real del listón [ancho, espesor] mm. */
  seccion?: [number, number]
  precio: number
  tienda: string
  color: string
  /** Material de canto visible que necesita tapacanto. */
  usaTapacanto?: boolean
}

export interface HerrajeDef {
  id: string
  nombre: string
  /** Unidades (o metros, m², kg) que trae el envase, en la unidad en que se cuenta el uso. */
  envase: number
  unidadVenta: string
  /** Unidad en que el proyecto cuenta el uso (u, m, m², kg). */
  unidadUso: string
  precio: number
  tienda: string
}

interface PrecioRef {
  nombre: string
  precio: number
  tienda: string
  producto: string
  url: string
  envase?: number
  unidadVenta?: string
  formato?: [number, number] | null
}

const PRECIOS = datos.items as unknown as Record<string, PrecioRef>
export const FECHA_PRECIOS = datos.fecha

type Meta = Omit<MaterialDef, 'id' | 'precio' | 'tienda'>

const plancha = (nombre: string, espesor: number, formato: [number, number], color: string, usaTapacanto = false): Meta => ({
  nombre,
  tipo: 'plancha',
  espesor,
  formato,
  color,
  usaTapacanto,
})
const liston = (nombre: string, seccion: [number, number], color: string, largo = 3200): Meta => ({
  nombre,
  tipo: 'liston',
  espesor: seccion[1],
  formato: [largo],
  seccion,
  color,
})

const PINO = '#e3c08d'
const IMPREGNADO = '#b8ad78'

const META_MATERIALES: Record<string, Meta> = {
  mel15: plancha('Melamina blanca 15 mm', 15, [2500, 1830], '#f2efe9', true),
  mel18: plancha('Melamina blanca 18 mm', 18, [2500, 1830], '#f5f2ec', true),
  mel18c: plancha('Melamina color madera 18 mm', 18, [2500, 1830], '#c89b6d', true),
  hdf3: plancha('MDF / trupán 3 mm (respaldos y fondos)', 3, [2440, 1520], '#d9c3a5'),
  mdf9: plancha('MDF 9 mm', 9, [2440, 1220], '#d2b892'),
  mdf15: plancha('MDF 15 mm', 15, [2440, 1220], '#d2b892'),
  mdf18: plancha('MDF 18 mm', 18, [2440, 1220], '#d2b892'),
  terc12: plancha('Terciado estructural 12 mm', 12, [2440, 1220], '#dcb984'),
  terc15: plancha('Terciado estructural 15 mm', 15, [2440, 1220], '#dcb984'),
  terc18: plancha('Terciado estructural 18 mm', 18, [2440, 1220], '#dcb984'),
  osb9: plancha('OSB estructural 9,5 mm', 9.5, [2440, 1220], '#c9a46a'),
  osb11: plancha('OSB estructural 11,1 mm', 11.1, [2440, 1220], '#c9a46a'),
  osb15: plancha('OSB estructural 15 mm', 15, [2440, 1220], '#c9a46a'),
  volc10: plancha('Volcanita (yeso cartón) 10 mm', 10, [2400, 1200], '#ecebe6'),
  volc15: plancha('Volcanita (yeso cartón) 15 mm', 15, [2400, 1200], '#ecebe6'),
  pc1x2: liston('Pino cepillado 1×2" (19×41 mm) 3,2 m', [41, 19], PINO),
  pc1x3: liston('Pino cepillado 1×3" (19×65 mm) 3,2 m', [65, 19], PINO),
  pc1x4: liston('Pino cepillado 1×4" (19×90 mm) 3,2 m', [90, 19], PINO),
  pc1x5: liston('Pino cepillado 1×5" (19×114 mm) 3,2 m', [114, 19], PINO),
  pc1x6: liston('Pino cepillado 1×6" (19×138 mm) 3,2 m', [138, 19], PINO),
  pc2x2: liston('Pino cepillado 2×2" (41×41 mm) 3,2 m', [41, 41], '#d8b07a'),
  pc2x3: liston('Pino cepillado 2×3" (41×65 mm) 3,2 m', [65, 41], '#d8b07a'),
  pc2x4: liston('Pino cepillado 2×4" (41×90 mm) 3,2 m', [90, 41], '#d8b07a'),
  pc2x6: liston('Pino cepillado 2×6" (41×138 mm) 3,2 m', [138, 41], '#d8b07a'),
  pd2x3: liston('Pino dimensionado seco 2×3" (45×69 mm) 3,2 m', [69, 45], '#d9b98a'),
  pd2x4: liston('Pino dimensionado seco 2×4" (45×94 mm) 3,2 m', [94, 45], '#d9b98a'),
  // Sección real publicada solo para el 2×4 impregnado (48×98); el resto es aproximada.
  pi2x2: liston('Pino impregnado 2×2" (~48×48 mm) 3,2 m', [48, 48], IMPREGNADO),
  pi2x3: liston('Pino impregnado 2×3" (~48×73 mm) 3,2 m', [73, 48], IMPREGNADO),
  pi2x4: liston('Pino impregnado 2×4" (48×98 mm) 3,2 m', [98, 48], IMPREGNADO),
  pi2x6: liston('Pino impregnado 2×6" (~48×148 mm) 3,2 m', [148, 48], IMPREGNADO),
  deck: liston('Tabla de deck impregnada 1½×5" (38×120 mm) 3,2 m', [120, 38], '#a99a62'),
  machi: liston('Pino machihembrado 3/4×4" (19×90 mm) 3,2 m', [90, 19], '#e6c795'),
  polin: liston('Polín impregnado 3–4" (~90 mm) 2,4 m', [90, 90], IMPREGNADO, 2400),
  polin45: liston('Polín impregnado 4–5" (~110 mm) 2,44 m', [110, 110], IMPREGNADO, 2440),
}

const NOMBRES_HERRAJES: Record<string, string> = {
  t4x40: 'Tornillo aglomerado 4×40 mm',
  t4x50: 'Tornillo aglomerado 4×50 mm',
  t35x16: 'Tornillo 3,5×16 mm (herrajes)',
  tvolc: 'Tornillo volcanita 6×1¼"',
  tdeck: 'Tornillo exterior zincado 6×100 mm',
  tarugo8: 'Tarugo de madera 8×45 mm',
  clavo1: 'Clavo corriente 1"',
  clavo2: 'Clavo corriente 2"',
  clavo3: 'Clavo corriente 3"',
  clavo4: 'Clavo corriente 4"',
  bisagra: 'Bisagra cazoleta 35 mm recta',
  corr35: 'Corredera telescópica 35 cm',
  corr45: 'Corredera telescópica 45 cm',
  tirador: 'Tirador metálico 96 mm',
  soporte: 'Soporte de repisa (pin)',
  barra: 'Barra de closet 1 m',
  escuadra: 'Escuadra metálica de refuerzo',
  perno: 'Perno coche 3/8×3" con tuerca',
  basepilar: 'Base metálica para poste 4×4"',
  rueda: 'Rueda con freno 50 mm',
  tapacanto: 'Tapacanto PVC blanco 22 mm',
  cola: 'Cola fría carpintero 250 g',
  lija120: 'Lija madera grano 120',
  barniz: 'Barniz marino',
  protdeck: 'Protector para deck (m² con dos manos)',
  cintamuro: 'Cinta para juntas de volcanita',
  pastamuro: 'Pasta para muro (juntas)',
  lanamin: 'Lana de vidrio 40 mm (aislación)',
}

const UNIDAD_USO: Record<string, string> = { tapacanto: 'm', cintamuro: 'm', pastamuro: 'kg', lanamin: 'm²', protdeck: 'm²' }

function precio(id: string): PrecioRef {
  const p = PRECIOS[id]
  if (!p) throw new Error(`Falta el precio de «${id}» en src/data/precios.json`)
  return p
}

export const MATERIALES: Record<string, MaterialDef> = Object.fromEntries(
  Object.entries(META_MATERIALES).map(([id, m]) => {
    const p = precio(id)
    // El formato de la plancha es el del producto cotizado (Imperial vende 2,44 m; Masisa y Arauco 2,50 m).
    const formato = m.tipo === 'plancha' && p.formato ? (p.formato as [number, number]) : m.formato
    return [id, { ...m, id, formato, precio: p.precio, tienda: p.tienda }]
  }),
)

export const HERRAJES: Record<string, HerrajeDef> = Object.fromEntries(
  Object.entries(NOMBRES_HERRAJES).map(([id, nombre]) => {
    const p = precio(id)
    return [id, { id, nombre, envase: p.envase ?? 1, unidadVenta: p.unidadVenta ?? 'unidad', unidadUso: UNIDAD_USO[id] ?? 'u', precio: p.precio, tienda: p.tienda }]
  }),
)

/** Producto y enlace de referencia de cada material o herraje (para «dónde comprar»). */
export function productoDe(id: string): { producto: string; url: string } | undefined {
  const p = PRECIOS[id]
  return p && { producto: p.producto, url: p.url }
}

/** Herramientas cotizadas (con tres gamas de precio en la ficha). Otras se escriben como texto libre. */
export const HERRAMIENTAS: Record<string, string> = {
  taladro: 'Taladro atornillador inalámbrico',
  circular: 'Sierra circular 7¼"',
  caladora: 'Sierra caladora',
  ingletadora: 'Sierra ingletadora 10"',
  lijadora: 'Lijadora orbital',
  router: 'Fresadora (router)',
  huincha: 'Huincha de medir 5 m',
  escuadrac: 'Escuadra de carpintero',
  nivel: 'Nivel de burbuja 60 cm',
  prensa: 'Prensas sargento',
  brocas: 'Set de brocas para madera',
  forstner: 'Broca Forstner 35 mm (bisagras)',
  martillo: 'Martillo carpintero',
  serrucho: 'Serrucho carpintero',
  formon: 'Formones',
  pistolacal: 'Pistola para silicona',
}

export const nombreHerramienta = (id: string) => HERRAMIENTAS[id] ?? id

/** Corte de sierra entre piezas, mm. */
export const KERF = 4
