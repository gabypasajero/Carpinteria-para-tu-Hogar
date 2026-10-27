import { formatoCLP, type LineaCosto } from '../core/costos'
import { comprar } from '../lib/investigacion'
import { useApp } from '../store/useApp'

export function TablaMateriales({ lineas, total }: { lineas: LineaCosto[]; total: number }) {
  const { precios, setPrecio } = useApp()
  return (
    <>
      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Material o herraje</th>
              <th>Comprar</th>
              <th>Precio unitario</th>
              <th>Total</th>
              <th>Dónde</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.nombre}
                  <small className="sub">{l.detalle}</small>
                </td>
                <td className="num">
                  {comprar(l.cantidad, l.unidadVenta)}
                </td>
                <td className="num">
                  <input
                    className={`precio ${precios[l.id] !== undefined ? 'editado' : ''}`}
                    type="number"
                    min={0}
                    step={10}
                    value={l.precioUnitario}
                    onChange={(e) => setPrecio(l.id, e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
                    aria-label={`Precio de ${l.nombre}`}
                  />
                  {precios[l.id] !== undefined && (
                    <button className="enlace" onClick={() => setPrecio(l.id, null)} title="Volver al precio referencial">
                      ↺
                    </button>
                  )}
                </td>
                <td className="num">{formatoCLP(l.total)}</td>
                <td>{l.tienda}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total estimado</td>
              <td className="num">{formatoCLP(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="nota">
        Precios referenciales aproximados en Chile. Ajústalos con lo que veas en tu tienda: quedan guardados en este navegador. No incluye el
        servicio de corte de la tienda ni herramientas.
      </p>
    </>
  )
}
