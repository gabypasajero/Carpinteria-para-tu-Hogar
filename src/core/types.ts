// Todas las medidas internas están en milímetros. La interfaz muestra centímetros.

export type Categoria =
  | 'dormitorio'
  | 'sala de estar'
  | 'cocina'
  | 'baño'
  | 'oficina'
  | 'espacio infantil'
  | 'almacenamiento'
  | 'entrada'
  | 'jardín'
  | 'decoración'
  | 'taller'
  | 'exterior'
  | 'construcción'

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
  /** Nombres de cada valor (de min a max) para mostrar un selector en vez de un número. */
  opciones?: string[]
}

export type Params = Record<string, number>

/** Una pieza física del mueble, ubicada en el espacio (mm, centro de la caja). */
export interface PiezaInstancia {
  /** Clave que agrupa piezas iguales (misma letra). */
  clave: string
  nombre: string
  material: string
  /** Tamaño de la caja en sus ejes propios: x (ancho), y (alto), z (fondo). */
  size: [number, number, number]
  pos: [number, number, number]
  /** Giro en radianes sobre x, y, z (solo para piezas inclinadas: techos, diagonales, respaldos). */
  rot?: [number, number, number]
  /** Paso de la guía en que se instala (0 = primer paso). */
  paso: number
  /** Metros lineales de tapacanto para esta pieza, en mm. */
  canto?: number
  /** La veta debe seguir el largo: el optimizador no rota la pieza. */
  veta?: boolean
  /** Indicación de corte, p. ej. «extremos a 30°». */
  nota?: string
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

export interface Regla {
  texto: string
  /** Clave de la fuente en la investigación (ver src/data/investigacion.json). */
  fuente: string
}

export interface ProyectoDef {
  id: string
  nombre: string
  descripcion: string
  categoria: Categoria
  plan: Plan
  dificultad: 1 | 2 | 3
  horas: string
  /** Ids de herramientas cotizadas (ver HERRAMIENTAS) o texto libre. */
  herramientas: string[]
  params: ParamDef[]
  /** Reglas técnicas y de seguridad con su fuente. */
  reglas?: Regla[]
  /** Qué dice la OGUC sobre permisos para este proyecto. */
  permiso?: string
  nota?: string
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
  nota?: string
}
