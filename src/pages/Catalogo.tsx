import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Miniatura } from '../components/Miniatura'
import { DIFICULTAD, formatoCLP } from '../core/costos'
import type { Categoria } from '../core/types'
import { calcular, usePrecios } from '../lib/useCalculo'
import { CATEGORIAS, PROYECTOS, paramsPorDefecto } from '../projects'

export function Catalogo() {
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const precios = usePrecios()
  const tarjetas = useMemo(
    () =>
      PROYECTOS.map((p) => {
        const c = calcular(p, paramsPorDefecto(p), precios)
        return { p, piezas: c.res.piezas, costo: c.costos.total }
      }),
    [precios],
  )
  const visibles = tarjetas.filter((t) => !categoria || t.p.categoria === categoria)
  const conProyectos = new Set(PROYECTOS.map((p) => p.categoria))

  return (
    <main className="catalogo">
      <section className="portada">
        <h1>Hazlo tú, a tu medida</h1>
        <p>
          Elige un mueble, pon tus medidas y obtén el plano 3D con cada pieza, la lista de corte, los materiales con precios en Chile y la guía
          paso a paso. ¿Prefieres que te lo hagan? Te conectamos con una mueblería.
        </p>
      </section>

      <nav className="categorias" aria-label="Categorías">
        <button className={categoria === null ? 'activa' : ''} onClick={() => setCategoria(null)}>
          Todos
        </button>
        {CATEGORIAS.map((c) => (
          <button key={c} className={categoria === c ? 'activa' : ''} onClick={() => setCategoria(c)} disabled={!conProyectos.has(c)}>
            {c[0].toUpperCase() + c.slice(1)}
          </button>
        ))}
      </nav>

      <div className="tarjetas">
        {visibles.map(({ p, piezas, costo }) => (
          <Link key={p.id} to={`/proyecto/${p.id}`} className="tarjeta">
            <div className="tarjeta-imagen">
              <Miniatura piezas={piezas} />
              {p.plan === 'pro' && <span className="insignia">Pro</span>}
            </div>
            <div className="tarjeta-cuerpo">
              <h2>{p.nombre}</h2>
              <p>{p.descripcion}</p>
              <p className="tarjeta-datos">
                <span>{DIFICULTAD[p.dificultad - 1]}</span>
                <span>{p.horas}</span>
                <span>desde {formatoCLP(costo)}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
