// Precios referenciales en pesos chilenos (CLP). Son aproximados y cada persona
// puede ajustarlos en la pestaña «Materiales»; se guardan en su navegador.

export type TipoMaterial = 'plancha' | 'liston'

export interface MaterialDef {
  id: string
  nombre: string
  tipo: TipoMaterial
  espesor: number
  /** Plancha: [largo, ancho] mm. Listón: [largo] mm de la pieza comercial. */
  formato: [number, number] | [number]
  /** Sección del listón [ancho, espesor] mm. */
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
  /** Unidades que trae el envase. */
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
    formato: [2440, 1830],
    precio: 39990,
    tienda: 'Imperial',
    color: '#f2efe9',
    usaTapacanto: true,
  },
  mel18: {
    id: 'mel18',
    nombre: 'Melamina roble 18 mm',
    tipo: 'plancha',
    espesor: 18,
    formato: [2440, 1830],
    precio: 47990,
    tienda: 'Imperial',
    color: '#c89b6d',
    usaTapacanto: true,
  },
  hdf3: {
    id: 'hdf3',
    nombre: 'Trupán / HDF 3 mm (respaldos y fondos)',
    tipo: 'plancha',
    espesor: 3,
    formato: [2440, 1830],
    precio: 12990,
    tienda: 'Sodimac',
    color: '#d9c3a5',
  },
  pino1x4: {
    id: 'pino1x4',
    nombre: 'Pino cepillado 1×4" (19×90 mm) 3,2 m',
    tipo: 'liston',
    espesor: 19,
    formato: [3200],
    seccion: [90, 19],
    precio: 4290,
    tienda: 'Sodimac',
    color: '#e3c08d',
  },
  pino2x2: {
    id: 'pino2x2',
    nombre: 'Pino cepillado 2×2" (41×41 mm) 3,2 m',
    tipo: 'liston',
    espesor: 41,
    formato: [3200],
    seccion: [41, 41],
    precio: 3790,
    tienda: 'Easy',
    color: '#d8b07a',
  },
}

export const HERRAJES: Record<string, HerrajeDef> = {
  tornillo4x40: { id: 'tornillo4x40', nombre: 'Tornillo aglomerado 4×40 mm', envase: 100, unidadVenta: 'caja 100 u', precio: 3490, tienda: 'Sodimac' },
  tornillo4x50: { id: 'tornillo4x50', nombre: 'Tornillo madera 4×50 mm', envase: 100, unidadVenta: 'caja 100 u', precio: 3990, tienda: 'Sodimac' },
  tornillo35x16: { id: 'tornillo35x16', nombre: 'Tornillo 3,5×16 mm (herrajes)', envase: 100, unidadVenta: 'caja 100 u', precio: 2490, tienda: 'Easy' },
  tarugo8: { id: 'tarugo8', nombre: 'Tarugo de madera 8×30 mm', envase: 50, unidadVenta: 'bolsa 50 u', precio: 1990, tienda: 'Easy' },
  clavo1: { id: 'clavo1', nombre: 'Clavo puntilla 1"', envase: 200, unidadVenta: 'caja 200 u', precio: 1590, tienda: 'Sodimac' },
  soporteRepisa: { id: 'soporteRepisa', nombre: 'Soporte de repisa (pin) 5 mm', envase: 20, unidadVenta: 'bolsa 20 u', precio: 1990, tienda: 'Imperial' },
  bisagraCazoleta: { id: 'bisagraCazoleta', nombre: 'Bisagra cazoleta 35 mm recta', envase: 2, unidadVenta: 'par', precio: 2490, tienda: 'Imperial' },
  corredera350: { id: 'corredera350', nombre: 'Corredera telescópica 35 cm', envase: 1, unidadVenta: 'par', precio: 6990, tienda: 'Imperial' },
  corredera450: { id: 'corredera450', nombre: 'Corredera telescópica 45 cm', envase: 1, unidadVenta: 'par', precio: 8490, tienda: 'Imperial' },
  tirador: { id: 'tirador', nombre: 'Tirador metálico 96 mm', envase: 1, unidadVenta: 'unidad', precio: 1990, tienda: 'Imperial' },
  barraCloset: { id: 'barraCloset', nombre: 'Barra de closet ovalada 1 m + soportes', envase: 1, unidadVenta: 'kit', precio: 5990, tienda: 'Sodimac' },
  tapacanto: { id: 'tapacanto', nombre: 'Tapacanto PVC 22 mm (por metro)', envase: 1, unidadVenta: 'metro', precio: 290, tienda: 'Imperial' },
  cola: { id: 'cola', nombre: 'Cola fría carpintero 250 g', envase: 1, unidadVenta: 'frasco', precio: 2990, tienda: 'Easy' },
  lija: { id: 'lija', nombre: 'Lija madera grano 120', envase: 1, unidadVenta: 'pliego', precio: 690, tienda: 'Easy' },
  barniz: { id: 'barniz', nombre: 'Barniz marino exterior 1/4 gl', envase: 1, unidadVenta: 'tarro', precio: 9990, tienda: 'Sodimac' },
}

/** Corte de sierra entre piezas, mm. */
export const KERF = 4
