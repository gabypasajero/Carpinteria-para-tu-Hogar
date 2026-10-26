import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { borrarDisenoNube, listarDisenosNube } from '../lib/disenos'
import { supabase } from '../lib/supabase'
import { buscarProyecto } from '../projects'
import { useApp, type DisenoGuardado } from '../store/useApp'

function enlace(d: DisenoGuardado) {
  return `/proyecto/${d.proyecto}?${new URLSearchParams(Object.entries(d.params).map(([k, v]) => [k, String(v)]))}`
}

export function MisProyectos({ incrustado = false }: { incrustado?: boolean }) {
  const Caja = incrustado ? 'section' : 'main'
  const Titulo = incrustado ? 'h2' : 'h1'
  const { sesion, locales, borrarLocal } = useApp()
  const [nube, setNube] = useState<DisenoGuardado[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    listarDisenosNube().then(setNube, (e: Error) => setError(e.message))
  }, [sesion])

  const fila = (d: DisenoGuardado, borrar: () => void) => (
    <li key={d.id} className="diseno">
      <Link to={enlace(d)}>
        <strong>{d.nombre}</strong>
        <span className="sub">
          {buscarProyecto(d.proyecto)?.nombre ?? d.proyecto} · {new Date(d.creado).toLocaleDateString('es-CL')}
        </span>
      </Link>
      <button className="enlace" onClick={borrar}>
        Borrar
      </button>
    </li>
  )

  return (
    <Caja className={incrustado ? 'yo-seccion' : 'pagina'}>
      <Titulo>{incrustado ? "Proyectos del catálogo guardados" : "Mis proyectos"}</Titulo>
      {error && <p className="aviso">{error}</p>}
      {supabase && sesion && (
        <section>
          <h2>En tu cuenta</h2>
          {nube.length ? (
            <ul className="disenos">
              {nube.map((d) =>
                fila(d, () => borrarDisenoNube(d.id).then(() => setNube((n) => n.filter((x) => x.id !== d.id)), (e: Error) => setError(e.message))),
              )}
            </ul>
          ) : (
            <p className="sub">Aún no guardas diseños en tu cuenta.</p>
          )}
        </section>
      )}
      <section>
        <h2>En este navegador</h2>
        {locales.length ? <ul className="disenos">{locales.map((d) => fila(d, () => borrarLocal(d.id)))}</ul> : <p className="sub">No hay diseños guardados aquí.</p>}
      </section>
      {supabase && !sesion && (
        <p>
          <Link to="/ingresar">Ingresa</Link> para guardar tus diseños en tu cuenta y verlos desde cualquier equipo.
        </p>
      )}
    </Caja>
  )
}
