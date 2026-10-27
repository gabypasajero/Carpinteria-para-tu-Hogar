import { HERRAMIENTAS, MATERIALES } from '../core/catalogo'
import { formatoCLP } from '../core/costos'
import { GAMAS_HERRAMIENTAS, fechaLarga } from '../lib/investigacion'
import { FECHA_PRECIOS } from '../core/catalogo'
import { PROYECTOS } from '../projects'

const ICONOS: Record<string, string> = {
  taladro: '🔩',
  circular: '🪚',
  caladora: '🪚',
  ingletadora: '📐',
  lijadora: '🧽',
  router: '⚙️',
  huincha: '📏',
  escuadrac: '📐',
  nivel: '🫧',
  prensa: '🗜️',
  brocas: '🔩',
  forstner: '⭕',
  martillo: '🔨',
  serrucho: '🪚',
  formon: '🔪',
  pistolacal: '🧴',
}

/** Herramientas recomendadas con precio en tres gamas y guía de materiales con sus formatos reales. */
export function Herramientas() {
  const uso = (h: string) => PROYECTOS.filter((p) => p.herramientas.includes(h)).length
  const orden = Object.keys(HERRAMIENTAS).sort((a, b) => uso(b) - uso(a))
  return (
    <main className="pagina herramientas-pag">
      <h1>Herramientas</h1>
      <p className="sub">Las que más usan nuestros proyectos, con su precio en gama económica, media y premium (Sodimac, Easy e Imperial, {fechaLarga(FECHA_PRECIOS)}).</p>
      <div className="herr-grilla">
        {orden.map((h) => {
          const g = GAMAS_HERRAMIENTAS[h]?.gamas
          return (
            <article key={h} className="herr-tarjeta">
              <div className="herr-cab">
                <span className="herr-icono" aria-hidden="true">
                  {ICONOS[h] ?? '🛠️'}
                </span>
                <div>
                  <h3>{HERRAMIENTAS[h]}</h3>
                  <small>La usan {uso(h)} proyectos</small>
                </div>
              </div>
              <ul>
                {(['economica', 'media', 'premium'] as const).map((k) =>
                  g?.[k] ? (
                    <li key={k}>
                      <span className="gama">{k === 'economica' ? 'Económica' : k === 'media' ? 'Media' : 'Premium'}</span>
                      <a href={g[k]!.url} target="_blank" rel="noopener noreferrer">
                        {g[k]!.marca ?? g[k]!.tienda}
                      </a>
                      <strong>{formatoCLP(g[k]!.oferta ?? g[k]!.precio)}</strong>
                    </li>
                  ) : null,
                )}
              </ul>
            </article>
          )
        })}
      </div>
      <h2>Guía de materiales</h2>
      <p className="sub">Formato real de cada plancha y listón y su precio de referencia.</p>
      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Material</th>
              <th>Formato</th>
              <th>Precio</th>
              <th>Tienda</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(MATERIALES).map((m) => (
              <tr key={m.id}>
                <td>
                  <span className="dz-muestra en-tabla" style={{ background: m.color }} /> {m.nombre}
                </td>
                <td>{m.tipo === 'plancha' ? `${m.formato[0] / 10} × ${m.formato[1]! / 10} cm` : `${m.formato[0] / 1000} m`}</td>
                <td className="num">{formatoCLP(m.precio)}</td>
                <td>{m.tienda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
