import { Link } from 'react-router-dom'
import { DIAS_PRUEBA, PRECIO_MENSUAL, useAcceso } from '../lib/plan'
import { formatoCLP } from '../core/costos'
import { usePerfil } from '../store/usePerfil'

/** Tarjeta que reemplaza una función Pro: invita a la prueba gratis o a suscribirse. */
export function Bloqueo({ que }: { que: string }) {
  const { pruebaUsada } = useAcceso()
  const iniciarPrueba = usePerfil((s) => s.iniciarPrueba)
  return (
    <div className="bloqueo">
      <span className="bloqueo-icono" aria-hidden="true">
        🔒
      </span>
      <h3>{que} es parte del plan Pro</h3>
      <p>
        Lista de corte, plano de cortes, guía paso a paso y PDF de todos los proyectos, y el diseñador 3D sin límites, por {formatoCLP(PRECIO_MENSUAL)} al mes.
      </p>
      {pruebaUsada ? (
        <Link className="boton destacado" to="/yo#plan">
          Hazte Pro
        </Link>
      ) : (
        <button className="boton destacado" onClick={iniciarPrueba}>
          Probar {DIAS_PRUEBA} días gratis
        </button>
      )}
    </div>
  )
}
