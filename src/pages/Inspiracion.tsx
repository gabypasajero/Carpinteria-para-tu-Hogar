import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TarjetaProyecto } from '../components/TarjetaProyecto'
import { calcular, usePrecios } from '../lib/useCalculo'
import { CATEGORIAS, PROYECTOS, paramsPorDefecto } from '../projects'

const TENDENCIAS = ['cama', 'mesa_comedor', 'deck', 'casita_juego', 'vinoteca', 'pikler', 'librero_escalera', 'sofa_2x4', 'mesa_picnic', 'cama_montessori', 'tumbona', 'cama_perro', 'porta_plantas', 'mueble_tocadiscos']
const nombre = (c: string) => c[0].toUpperCase() + c.slice(1)
const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Inspiración: todos los proyectos con su foto, filtros por categoría y buscador. */
export function Inspiracion() {
  const [busqueda, setBusqueda] = useSearchParams()
  const filtro = busqueda.get('filtro') ?? 'tendencias'
  const [texto, setTexto] = useState('')
  const precios = usePrecios()
  const costos = useMemo(() => Object.fromEntries(PROYECTOS.map((p) => [p.id, calcular(p, paramsPorDefecto(p), precios).costos.total])), [precios])
  const filtros = ['tendencias', 'principiante', 'todos', ...CATEGORIAS]
  const q = normalizar(texto.trim())
  let lista = PROYECTOS
  if (q) lista = lista.filter((p) => q.split(/\s+/).every((w) => normalizar(`${p.nombre} ${p.descripcion} ${p.categoria}`).includes(w)))
  else if (filtro === 'tendencias') lista = TENDENCIAS.map((id) => PROYECTOS.find((p) => p.id === id)!).filter(Boolean)
  else if (filtro === 'principiante') lista = lista.filter((p) => p.dificultad === 1)
  else if (filtro !== 'todos') lista = lista.filter((p) => p.categoria === filtro)

  return (
    <main className="inspiracion">
      <div className="inspiracion-cab">
        <h1>Inspiración</h1>
        <input type="search" placeholder="Buscar: cama, deck, repisa…" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar proyectos" />
      </div>
      <nav className="chips" aria-label="Filtros">
        {filtros.map((f) => (
          <button key={f} className={!q && filtro === f ? 'activa' : ''} onClick={() => (setTexto(''), setBusqueda({ filtro: f }, { replace: true }))}>
            {nombre(f)}
          </button>
        ))}
      </nav>
      {lista.length === 0 && <p className="vacio">No encontramos proyectos con «{texto}». ¿Por qué no lo diseñas tú en el diseñador 3D?</p>}
      <div className="grilla-fotos">
        {lista.map((p) => (
          <TarjetaProyecto key={p.id} p={p} costo={costos[p.id]} />
        ))}
      </div>
    </main>
  )
}
