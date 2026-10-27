import { MATERIALES } from '../core/catalogo'
import { cm } from '../core/costos'
import type { PiezaCorte } from '../core/types'

interface Props {
  cortes: PiezaCorte[]
  resaltada: string | null
  onResaltar: (clave: string | null) => void
}

export function TablaCorte({ cortes, resaltada, onResaltar }: Props) {
  return (
    <div className="tabla-scroll">
      <table className="tabla">
        <thead>
          <tr>
            <th>Pieza</th>
            <th>Nombre</th>
            <th>Cant.</th>
            <th>Largo (cm)</th>
            <th>Ancho (cm)</th>
            <th>Esp. (mm)</th>
            <th>Material</th>
            <th>Tapacanto</th>
          </tr>
        </thead>
        <tbody>
          {cortes.map((c) => (
            <tr
              key={c.clave}
              className={resaltada === c.clave ? 'resaltada' : ''}
              onMouseEnter={() => onResaltar(c.clave)}
              onMouseLeave={() => onResaltar(null)}
            >
              <td>
                <span className="letra">{c.letra}</span>
              </td>
              <td>
                {c.nombre}
                {c.veta && <span className="chip" title="Respetar la dirección de la veta">veta</span>}
                {c.nota && <small className="nota-corte">{c.nota}</small>}
              </td>
              <td className="num">{c.cantidad}</td>
              <td className="num">{cm(c.largo)}</td>
              <td className="num">{cm(c.ancho)}</td>
              <td className="num">{c.espesor}</td>
              <td>{MATERIALES[c.material].nombre}</td>
              <td className="num">{c.canto > 0 ? `${(c.canto / 1000).toFixed(2)} m` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
