// Precios en pesos chilenos (CLP, con IVA) consultados el 26-10-2026 en Sodimac, Easy e Imperial
// (ver docs/investigacion). Cada precio corresponde al envase indicado; la tabla carpinteria.precios
// de Supabase los reemplaza sin volver a publicar, y cada persona puede ajustarlos en su navegador.

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
  /** Unidades (o metros) que trae el envase. */
  envase: number
  unidadVenta: string
  precio: number
  tienda: string
}

export const MATERIALES: Record<string, MaterialDef> = {
  mel15: {
    id: 'mel15',
    nombre: 'Melamina blanca 15 mm',
    tipo: 'plancha',
    espesor: 15,
    // Formato chileno de Masisa y Arauco Vesto: 2,50 × 1,83 m (Imperial también vende 2,44 × 1,83).
    formato: [2500, 1830],
    precio: 36550,
    tienda: 'Sodimac, Easy e Imperial',
    color: '#f2efe9',
    usaTapacanto: true,
  },
  mel18: {
    id: 'mel18',
    nombre: 'Melamina color madera 18 mm',
    tipo: 'plancha',
    espesor: 18,
    formato: [2500, 1830],
    precio: 55150,
    tienda: 'Sodimac e Imperial',
    color: '#c89b6d',
    usaTapacanto: true,
  },
  hdf3: {
    id: 'hdf3',
    nombre: 'MDF / trupán 3 mm (respaldos y fondos)',
    tipo: 'plancha',
    espesor: 3,
    formato: [2440, 1520],
    precio: 8320,
    tienda: 'Sodimac e Imperial',
    color: '#d9c3a5',
  },
  pino1x4: {
    id: 'pino1x4',
    nombre: 'Pino cepillado 1×4" (19×90 mm) 3,2 m',
    tipo: 'liston',
    espesor: 19,
    formato: [3200],
    seccion: [90, 19],
    precio: 2640,
    tienda: 'Sodimac, Easy e Imperial',
    color: '#e3c08d',
  },
  pino2x2: {
    id: 'pino2x2',
    nombre: 'Pino cepillado 2×2" (41×41 mm) 3,2 m',
    tipo: 'liston',
    espesor: 41,
    formato: [3200],
    seccion: [41, 41],
    precio: 2630,
    tienda: 'Sodimac, Easy e Imperial',
    color: '#d8b07a',
  },
}

export const HERRAJES: Record<string, HerrajeDef> = {
  tornillo4x40: { id: 'tornillo4x40', nombre: 'Tornillo aglomerado 4×40 mm', envase: 144, unidadVenta: 'caja 144 u', precio: 3450, tienda: 'Easy' },
  tornillo4x50: { id: 'tornillo4x50', nombre: 'Tornillo aglomerado 4×50 mm', envase: 100, unidadVenta: 'bolsa 100 u', precio: 1290, tienda: 'Imperial' },
  tornillo35x16: { id: 'tornillo35x16', nombre: 'Tornillo 3,5×16 mm (herrajes)', envase: 144, unidadVenta: 'caja 144 u', precio: 1890, tienda: 'Easy' },
  tarugo8: { id: 'tarugo8', nombre: 'Tarugo de madera 8×45 mm', envase: 100, unidadVenta: 'bolsa 100 u', precio: 2990, tienda: 'Imperial' },
  // Las tiendas venden el clavo por peso; ~500 clavos por ½ kg es una estimación.
  clavo1: { id: 'clavo1', nombre: 'Clavo corriente 1"', envase: 500, unidadVenta: 'bolsa ½ kg', precio: 2373, tienda: 'Sodimac' },
  soporteRepisa: { id: 'soporteRepisa', nombre: 'Soporte de repisa (pin)', envase: 50, unidadVenta: 'bolsa 50 u', precio: 1490, tienda: 'Imperial' },
  bisagraCazoleta: { id: 'bisagraCazoleta', nombre: 'Bisagra cazoleta 35 mm recta', envase: 10, unidadVenta: 'bolsa 10 u', precio: 2990, tienda: 'Imperial' },
  corredera350: { id: 'corredera350', nombre: 'Corredera telescópica 35 cm', envase: 1, unidadVenta: 'juego', precio: 4690, tienda: 'Sodimac' },
  corredera450: { id: 'corredera450', nombre: 'Corredera telescópica 45 cm', envase: 1, unidadVenta: 'juego', precio: 5190, tienda: 'Imperial' },
  tirador: { id: 'tirador', nombre: 'Tirador metálico 96 mm', envase: 1, unidadVenta: 'unidad', precio: 750, tienda: 'Sodimac' },
  barraCloset: { id: 'barraCloset', nombre: 'Barra de closet 1 m', envase: 1, unidadVenta: 'unidad', precio: 5600, tienda: 'Sodimac' },
  tapacanto: { id: 'tapacanto', nombre: 'Tapacanto PVC blanco 22 mm', envase: 25, unidadVenta: 'rollo 25 m', precio: 3190, tienda: 'Sodimac' },
  cola: { id: 'cola', nombre: 'Cola fría carpintero 250 g', envase: 1, unidadVenta: 'frasco', precio: 3990, tienda: 'Easy e Imperial' },
  lija: { id: 'lija', nombre: 'Lija madera grano 120', envase: 1, unidadVenta: 'pliego', precio: 250, tienda: 'Sodimac y Easy' },
  barniz: { id: 'barniz', nombre: 'Barniz marino 1/4 gl', envase: 1, unidadVenta: 'tarro', precio: 7490, tienda: 'Sodimac' },
}

/** Corte de sierra entre piezas, mm. */
export const KERF = 4
