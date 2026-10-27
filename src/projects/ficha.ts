// Ficha técnica de cada proyecto según la investigación (docs/investigacion/catalogo-proyectos.json):
// categoría, dificultad, herramientas recomendadas, reglas con su fuente, permisos y notas.
import fichas from '../data/fichas.json'
import type { Categoria, ProyectoDef, Regla } from '../core/types'

interface Ficha {
  categoria: string
  dificultad: number
  herramientas: string[]
  reglas: Regla[]
  permiso: string | null
  nota: string | null
}

const FICHAS = fichas as Record<string, Ficha>

export function ficha(id: string): Pick<ProyectoDef, 'categoria' | 'dificultad' | 'herramientas' | 'reglas' | 'permiso' | 'nota'> {
  const f = FICHAS[id]
  if (!f) throw new Error(`Falta la ficha de «${id}» en src/data/fichas.json`)
  return {
    categoria: f.categoria as Categoria,
    dificultad: f.dificultad as 1 | 2 | 3,
    herramientas: f.herramientas,
    reglas: f.reglas,
    permiso: f.permiso ?? undefined,
    nota: f.nota ?? undefined,
  }
}
