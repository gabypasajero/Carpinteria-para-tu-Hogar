import type { PiezaInstancia, PasoGuia } from '../core/types'

interface Props {
  pasos: PasoGuia[]
  piezas: PiezaInstancia[]
  letras: Record<string, string>
  herramientas: string[]
  paso: number
  onPaso: (n: number) => void
}

export function Guia({ pasos, piezas, letras, herramientas, paso, onPaso }: Props) {
  const actual = pasos[paso]
  const usadas = [...new Set(piezas.filter((p) => p.paso === paso).map((p) => letras[p.clave]))].sort()
  return (
    <div className="guia">
      <div className="guia-nav">
        <button onClick={() => onPaso(Math.max(0, paso - 1))} disabled={paso === 0}>
          ← Anterior
        </button>
        <span>
          Paso {paso + 1} de {pasos.length}
        </span>
        <button onClick={() => onPaso(Math.min(pasos.length - 1, paso + 1))} disabled={paso === pasos.length - 1}>
          Siguiente →
        </button>
      </div>
      <h3>{actual.titulo}</h3>
      {usadas.length > 0 && (
        <p className="guia-piezas">
          Piezas: {usadas.map((l) => <span key={l} className="letra">{l}</span>)}
        </p>
      )}
      <p>{actual.texto}</p>
      {actual.consejo && <p className="consejo">💡 {actual.consejo}</p>}
      {paso === 0 && (
        <>
          <h4>Herramientas</h4>
          <ul className="herramientas">
            {herramientas.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
      <ol className="guia-lista">
        {pasos.map((p, i) => (
          <li key={i} className={i === paso ? 'activo' : ''}>
            <button className="enlace" onClick={() => onPaso(i)}>
              {p.titulo}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
