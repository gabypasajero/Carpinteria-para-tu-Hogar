import { Link } from 'react-router-dom'
import { DIAS_PRUEBA, PRECIO_MENSUAL, useAcceso } from '../lib/plan'
import { formatoCLP } from '../core/costos'
import { usePerfil } from '../store/usePerfil'

interface Props {
  que: string
  /** Si viene, ofrece abrir este proyecto (o diseño) como la muestra gratis. */
  muestraId?: string
}

/** Tarjeta que reemplaza una función Pro: ofrece la muestra gratis, la prueba de 7 días o suscribirse. */
export function Bloqueo({ que, muestraId }: Props) {
  const { pruebaUsada, muestra } = useAcceso()
  const { iniciarPrueba, usarMuestra } = usePerfil()
  const puedeMuestra = !!muestraId && !muestra
  return (
    <div className="bloqueo">
      <span className="bloqueo-icono" aria-hidden="true">
        {puedeMuestra ? '🎁' : '🔒'}
      </span>
      <h3>{puedeMuestra ? 'Tienes 1 proyecto completo de regalo' : `${que} es parte del plan Pro`}</h3>
      <p>
        {puedeMuestra
          ? 'Úsalo en este proyecto y tendrás todo: lista de corte, plano de cortes, guía paso a paso y PDF. Puedes usarlo una sola vez, en un proyecto del catálogo o en uno diseñado por ti.'
          : `Lista de corte, plano de cortes, guía paso a paso y PDF de todos los proyectos, y el diseñador 3D sin límites, por ${formatoCLP(PRECIO_MENSUAL)} al mes.`}
      </p>
      <div className="bloqueo-acciones">
        {puedeMuestra && (
          <button className="boton destacado" onClick={() => usarMuestra(muestraId!)}>
            Usar mi proyecto de regalo aquí
          </button>
        )}
        {pruebaUsada ? (
          <Link className={`boton ${puedeMuestra ? 'secundario' : 'destacado'}`} to="/yo#plan">
            Hazte Pro
          </Link>
        ) : (
          <button className={`boton ${puedeMuestra ? 'secundario' : 'destacado'}`} onClick={iniciarPrueba}>
            Probar {DIAS_PRUEBA} días gratis
          </button>
        )}
      </div>
    </div>
  )
}
