import { TIPOS_DTO, type TipoMueble } from '../lib/detodito'

/** Si el mueble es de los que vende De Todito Outlet, sugiere cotizarlo ya armado. */
export function SugerenciaDTO({ tipo, onCotizar }: { tipo: TipoMueble; onCotizar: () => void }) {
  if (tipo === 'otro') return null
  return (
    <div className="sugerencia-dto">
      <p>
        🛋️ En <strong>De Todito Outlet</strong> vendemos {TIPOS_DTO[tipo].plural} ya armados. ¿Prefieres cotizar tu proyecto listo para usar?
      </p>
      <button className="boton secundario" onClick={onCotizar}>
        Cotizar con De Todito Outlet
      </button>
    </div>
  )
}
