import type { Params, ProyectoDef } from '../core/types'

interface Props {
  proyecto: ProyectoDef
  params: Params
  onChange: (id: string, valor: number) => void
}

export function PanelMedidas({ proyecto, params, onChange }: Props) {
  return (
    <div className="medidas">
      {proyecto.params.map((d) => (
        <label key={d.id} className="medida">
          <span className="medida-cab">
            <span>{d.label}</span>
            <span className="medida-valor">
              <input
                type="number"
                min={d.min}
                max={d.max}
                step={d.step}
                value={params[d.id]}
                onChange={(e) => e.target.value !== '' && onChange(d.id, Number(e.target.value))}
                aria-label={`${d.label} en ${d.unidad === 'cm' ? 'centímetros' : 'unidades'}`}
              />
              {d.unidad === 'cm' ? 'cm' : ''}
            </span>
          </span>
          <input type="range" min={d.min} max={d.max} step={d.step} value={params[d.id]} onChange={(e) => onChange(d.id, Number(e.target.value))} />
          {d.ayuda && <small>{d.ayuda}</small>}
        </label>
      ))}
    </div>
  )
}
