// Proyectos que conviene hacer con un profesional: muebles de cocina, closets, isla, cómoda y obras de construcción.
import type { ProyectoDef } from '../core/types'

const CON_PROFESIONAL = new Set(['cocina_base', 'cocina_aereo', 'despensa', 'isla', 'closet', 'closet_abierto', 'comoda'])

export const conProfesional = (p: ProyectoDef) => p.categoria === 'construcción' || CON_PROFESIONAL.has(p.id)

export const NOTA_PROFESIONAL = 'Este proyecto debería hacerlo un profesional, o tú con la ayuda de uno.'
