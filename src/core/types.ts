// Todas las medidas internas están en milímetros. La interfaz muestra centímetros.

export type Categoria = 'dormitorio' | 'living' | 'cocina' | 'baño' | 'exterior' | 'organización'

export type Plan = 'gratis' | 'pro'

export interface ParamDef {
  id: string
  label: string
  /** 'cm' se convierte a mm al construir; 'u' es una cantidad entera. */
  unidad: 'cm' | 'u'
  min: number
  max: number
  step: number
  default: number
  ayuda?: string
}

export type Params = Record<string, number>

/** Una pieza física del mueble, ubicada en el espacio (mm, centro de la caja). */
export interface PiezaInstancia {
  /** Clave que agrupa piezas iguales (misma letra). */
  clave: string
  nombre: string
  material: string
  /** Tamaño de la caja en x (ancho), y (alto), z (fondo). */
  size: [number, number, number]
  pos: [number, number, number]
  /** Paso de la guía en que se instala (0 = primer paso). */
  paso: number
  /** Metros lineales de tapacanto para esta pieza, en mm. */
  canto?: number
  /** La veta debe seguir el largo: el optimizador no rota la pieza. */
  veta?: boolean
}

export interface HerrajeUso {
  id: string
  cantidad: number
}

export interface PasoGuia {
  titulo: string
  texto: string
  consejo?: string
}

export interface ResultadoProyecto {
  piezas: PiezaInstancia[]
  herrajes: HerrajeUso[]
  pasos: PasoGuia[]
  /** Medidas exteriores finales, mm. */
  exterior: [number, number, number]
  avisos: string[]
}

export interface ProyectoDef {
  id: string
  nombre: string
  descripcion: string
  categoria: Categoria
  plan: Plan
  dificultad: 1 | 2 | 3
  horas: string
  herramientas: string[]
  params: ParamDef[]
  construir: (p: Params) => ResultadoProyecto
}

/** Pieza agrupada para la lista de corte. */
export interface PiezaCorte {
  letra: string
  clave: string
  nombre: string
  material: string
  largo: number
  ancho: number
  espesor: number
  cantidad: number
  canto: number
  veta: boolean
}
