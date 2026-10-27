import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DIFICULTAD, formatoCLP } from '../core/costos'
import type { ProyectoDef } from '../core/types'
import { conProfesional } from '../lib/profesional'

/** Tarjeta con la foto del proyecto (renderizada desde su modelo 3D). */
export function TarjetaProyecto({ p, costo, variante = 'grilla' }: { p: ProyectoDef; costo?: number; variante?: 'grilla' | 'carrusel' }) {
  const [sinFoto, setSinFoto] = useState(false)
  return (
    <Link to={`/proyecto/${p.id}`} className={`tarjeta-foto ${variante}`}>
      <div className="tarjeta-foto-img">
        {sinFoto ? <div className="tarjeta-foto-vacia">{p.nombre[0]}</div> : <img src={`/fotos/${p.id}.jpg`} alt={p.nombre} loading="lazy" onError={() => setSinFoto(true)} />}
        {p.plan === 'pro' ? <span className="insignia">Pro</span> : <span className="insignia gratis">Gratis</span>}
      </div>
      <div className="tarjeta-foto-cuerpo">
        <h3>{p.nombre}</h3>
        <p>
          <span>⏱ {p.horas}</span>
          <span>{DIFICULTAD[p.dificultad - 1]}</span>
          {conProfesional(p) && <span>👷 Con profesional</span>}
          {costo !== undefined && <span className="precio-desde">desde {formatoCLP(costo)}</span>}
        </p>
      </div>
    </Link>
  )
}
