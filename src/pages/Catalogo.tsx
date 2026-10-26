import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Miniatura } from '../components/Miniatura'
import { DIFICULTAD, formatoCLP } from '../core/costos'
import type { Categoria } from '../core/types'
import { etiquetaPermiso } from '../lib/investigacion'
import { calcular, usePrecios } from '../lib/useCalculo'
import { CATEGORIAS, PROYECTOS, paramsPorDefecto } from '../projects'

const nombreCategoria = (c: string) => c[0].toUpperCase() + c.slice(1)

/** Texto sin tildes ni mayúsculas para buscar «bano» o «camarote» sin importar cómo se escriba. */
const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function Catalogo() {
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const precios = usePrecios()
  const tarjetas = useMemo(
    () =>
      PROYECTOS.map((p) => {
        const c = calcular(p, paramsPorDefecto(p), precios)
        return { p, piezas: c.res.piezas, costo: c.costos.total, texto: normalizar(`${p.nombre} ${p.descripcion} ${p.categoria}`) }
      }),
    [precios],
  )
  const q = normalizar(busqueda.trim())
  const encontradas = tarjetas.filter((t) => !q || q.split(/\s+/).every((w) => t.texto.includes(w)))
  const visibles = encontradas.filter((t) => !categoria || t.p.categoria === categoria)
  const cuenta = (c: Categoria) => encontradas.filter((t) => t.p.categoria === c).length

  return (
    <main className="catalogo">
      <section className="portada">
        <h1>Hazlo tú, a tu medida</h1>
        <p>
          {PROYECTOS.length} proyectos de carpintería, de una repisa a una habitación. Elige uno, pon tus medidas y obtén el plano 3D con cada pieza, la
          lista de corte, los materiales con precios reales de Sodimac, Easy e Imperial y la guía paso a paso. ¿Prefieres que te lo hagan? Te
          conectamos con una mueblería.
        </p>
      </section>

      <div className="buscador">
        <input type="search" placeholder="Buscar: cama, deck, cocina, repisa…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar proyectos" />
      </div>

      <nav className="categorias" aria-label="Categorías">
        <button className={categoria === null ? 'activa' : ''} onClick={() => setCategoria(null)}>
          Todos <span className="cuenta">{encontradas.length}</span>
        </button>
        {CATEGORIAS.map((c) => (
          <button key={c} className={categoria === c ? 'activa' : ''} onClick={() => setCategoria(c)} disabled={cuenta(c) === 0}>
            {nombreCategoria(c)} <span className="cuenta">{cuenta(c)}</span>
          </button>
        ))}
      </nav>

      {visibles.length === 0 && <p className="vacio">No hay proyectos que coincidan con «{busqueda}».</p>}

      <div className="tarjetas">
        {visibles.map(({ p, piezas, costo }) => {
          const permiso = etiquetaPermiso(p.permiso)
          return (
            <Link key={p.id} to={`/proyecto/${p.id}`} className="tarjeta">
              <div className="tarjeta-imagen">
                <Miniatura piezas={piezas} />
                {p.plan === 'pro' && <span className="insignia">Pro</span>}
                {permiso && <span className={`chip-permiso ${permiso.tipo} sobre`}>{permiso.texto}</span>}
              </div>
              <div className="tarjeta-cuerpo">
                <h2>{p.nombre}</h2>
                <p>{p.descripcion}</p>
                <p className="tarjeta-datos">
                  <span>{nombreCategoria(p.categoria)}</span>
                  <span>{DIFICULTAD[p.dificultad - 1]}</span>
                  <span>{p.horas}</span>
                  <span>desde {formatoCLP(costo)}</span>
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
