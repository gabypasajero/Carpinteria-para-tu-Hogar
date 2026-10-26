import { MATERIALES } from '../core/catalogo'
import { cm } from '../core/costos'
import type { ResultadoOptimizacion } from '../core/optimizador'

export function PlanoCortes({ opt }: { opt: ResultadoOptimizacion }) {
  return (
    <div className="planos">
      {opt.noCaben.length > 0 && (
        <p className="aviso">Hay piezas más grandes que la plancha o el listón: {opt.noCaben.map((n) => n.letra).join(', ')}.</p>
      )}
      {opt.tableros.map((t, i) => (
        <figure key={`t${i}`} className="plano">
          <figcaption>
            Plancha {i + 1} · {MATERIALES[t.material].nombre} · {cm(t.largo)}×{cm(t.ancho)} cm · uso {t.uso}%
          </figcaption>
          <svg viewBox={`-10 -10 ${t.largo + 20} ${t.ancho + 20}`}>
            <rect x={0} y={0} width={t.largo} height={t.ancho} className="plano-fondo" />
            {t.piezas.map((p, j) => (
              <g key={j}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} className="plano-pieza" />
                <text x={p.x + p.w / 2} y={p.y + p.h / 2} className="plano-letra" fontSize={Math.min(110, p.h * 0.5, p.w * 0.5)}>
                  {p.letra}
                </text>
                {p.w > 250 && p.h > 140 && (
                  <text x={p.x + p.w / 2} y={p.y + p.h / 2 + Math.min(110, p.h * 0.5) * 0.75} className="plano-medida" fontSize={48}>
                    {cm(p.w)}×{cm(p.h)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </figure>
      ))}
      {opt.barras.map((b, i) => (
        <figure key={`b${i}`} className="plano">
          <figcaption>
            {MATERIALES[b.material].nombre} · pieza {i + 1} · sobra {cm(b.sobrante)} cm
          </figcaption>
          <svg viewBox={`-10 -10 ${b.largo + 20} 140`}>
            <rect x={0} y={0} width={b.largo} height={120} className="plano-fondo" />
            {b.cortes.map((c, j) => (
              <g key={j}>
                <rect x={c.inicio} y={0} width={c.largo} height={120} className="plano-pieza" />
                <text x={c.inicio + c.largo / 2} y={60} className="plano-letra" fontSize={70}>
                  {c.letra} · {cm(c.largo)}
                </text>
              </g>
            ))}
          </svg>
        </figure>
      ))}
      <p className="nota">Se descuentan 4 mm por cada corte de sierra. Muestra este plano en la tienda al pedir el dimensionado.</p>
    </div>
  )
}
