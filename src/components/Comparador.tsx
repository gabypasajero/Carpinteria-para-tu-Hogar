import { formatoCLP } from '../core/costos'
import { precioFabricacion } from '../core/tiendas'
import { useApp } from '../store/useApp'

interface Props {
  costoMateriales: number
  horas: string
  onCotizar: () => void
}

/** «Hazlo tú» frente a «que te lo hagan»: la decisión que lleva a la venta. */
export function Comparador({ costoMateriales, horas, onCotizar }: Props) {
  const tiendas = useApp((s) => s.tiendas)
  const fabricado = precioFabricacion(costoMateriales, tiendas)
  return (
    <div className="comparador">
      <div className="opcion">
        <span className="opcion-titulo">Hazlo tú</span>
        <strong>{formatoCLP(costoMateriales)}</strong>
        <small>en materiales · {horas} de trabajo</small>
      </div>
      <button className="opcion opcion-fabricar" onClick={onCotizar}>
        <span className="opcion-titulo">Que te lo hagan</span>
        <strong>desde {formatoCLP(fabricado)}</strong>
        <small>listo para usar · pedir cotización →</small>
      </button>
    </div>
  )
}
