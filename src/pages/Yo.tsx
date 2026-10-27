// Perfil: lo que contó en la encuesta, su plan (prueba de 7 días o Pro), sus diseños y su cuenta.
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatoCLP } from '../core/costos'
import { DIAS_PRUEBA, PIEZAS_GRATIS, PRECIO_MENSUAL, useAcceso } from '../lib/plan'
import { buscarProyecto } from '../projects'
import { useDiseno } from '../store/useDiseno'
import { usePerfil } from '../store/usePerfil'
import { Ingresar } from './Ingresar'
import { MisProyectos } from './MisProyectos'

export function Yo() {
  const { encuesta, iniciarPrueba, setPlan } = usePerfil()
  const { pro, plan, dias, pruebaUsada, vencida, muestra } = useAcceso()
  const { guardados, cargar, borrarGuardado } = useDiseno()
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <main className="pagina yo">
      <h1>Mi taller</h1>

      <section className="yo-seccion">
        <h2>Mi perfil</h2>
        {encuesta ? (
          <dl className="yo-perfil">
            <dt>Nivel</dt>
            <dd>{encuesta.nivel || '—'}</dd>
            <dt>Planos</dt>
            <dd>{encuesta.planos || '—'}</dd>
            <dt>Me motiva</dt>
            <dd>{encuesta.motivos.join(', ') || '—'}</dd>
            <dt>Busco</dt>
            <dd>{encuesta.intereses.join(', ') || '—'}</dd>
            <dt>Meta</dt>
            <dd>{encuesta.meta || '—'}</dd>
          </dl>
        ) : (
          <p className="sub">Aún no nos cuentas qué sabes hacer.</p>
        )}
        <Link className="boton secundario" to="/bienvenida">
          {encuesta ? 'Rehacer la encuesta' : 'Responder 6 preguntas'}
        </Link>
      </section>

      <section className="yo-seccion" id="plan">
        <h2>Mi plan</h2>
        <div className={`plan-estado ${pro ? 'pro' : ''}`}>
          <strong>{plan === 'pro' ? 'Pro' : pro ? `Prueba Pro: ${dias} ${dias === 1 ? 'día' : 'días'} restantes` : vencida ? 'Tu prueba terminó' : 'Gratis'}</strong>
          <span className="sub">
            {pro
              ? 'Tienes todos los planos, guías, PDF y el diseñador 3D sin límites.'
              : `Proyectos gratis completos; en los Pro ves el 3D y el costo. Diseñador hasta ${PIEZAS_GRATIS} piezas.`}
          </span>
          {!pro && (
            <span className="sub">
              {muestra ? (
                <>
                  🎁 Tu proyecto de regalo:{' '}
                  {muestra.startsWith('diseno:') ? (
                    <Link to="/disena">{guardados.find((g) => `diseno:${g.id}` === muestra)?.nombre ?? 'un diseño propio'}</Link>
                  ) : (
                    <Link to={`/proyecto/${muestra}`}>{buscarProyecto(muestra)?.nombre ?? muestra}</Link>
                  )}
                </>
              ) : (
                '🎁 Tienes 1 proyecto completo de regalo: elígelo en cualquier proyecto Pro o en tu diseño 3D.'
              )}
            </span>
          )}
        </div>
        <div className="planes">
          <article className="plan-tarjeta">
            <h3>Gratis</h3>
            <p className="plan-precio">$0</p>
            <ul>
              <li>Proyectos gratis completos</li>
              <li>1 proyecto Pro o diseño propio completo de regalo</li>
              <li>3D, medidas y costo de todos los proyectos</li>
              <li>Diseñador 3D hasta {PIEZAS_GRATIS} piezas</li>
              <li>Cotización con mueblerías</li>
            </ul>
          </article>
          <article className="plan-tarjeta destacada">
            <span className="etiqueta">Recomendado</span>
            <h3>Pro</h3>
            <p className="plan-precio">
              {formatoCLP(PRECIO_MENSUAL)} <small>al mes</small>
            </p>
            <ul>
              <li>Lista de corte, plano de cortes y guía de todos los proyectos</li>
              <li>PDF y planilla para dimensionar en la tienda</li>
              <li>Diseñador 3D sin límite de piezas, con PDF</li>
              <li>{DIAS_PRUEBA} días gratis para probar</li>
            </ul>
            {plan === 'pro' ? (
              <button className="boton secundario" onClick={() => setPlan('gratis')}>
                Cancelar plan
              </button>
            ) : !pruebaUsada ? (
              <button className="boton destacado" onClick={iniciarPrueba}>
                Probar {DIAS_PRUEBA} días gratis
              </button>
            ) : (
              <button className="boton destacado" onClick={() => setPlan('pro')}>
                Suscribirme por {formatoCLP(PRECIO_MENSUAL)}/mes
              </button>
            )}
            <p className="nota">El cobro en línea se habilita pronto; mientras tanto el plan se activa en este equipo.</p>
          </article>
        </div>
      </section>

      <section className="yo-seccion">
        <h2>Mis diseños 3D</h2>
        {guardados.length ? (
          <ul className="disenos">
            {guardados.map((g) => (
              <li key={g.id} className="diseno">
                <Link to="/disena" onClick={() => cargar(g)}>
                  <strong>{g.nombre}</strong>
                  <span className="sub">
                    {g.piezas.length} piezas · {new Date(g.creado).toLocaleDateString('es-CL')}
                  </span>
                </Link>
                <button className="enlace" onClick={() => borrarGuardado(g.id)}>
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sub">
            Aún no guardas diseños. <Link to="/disena">Crea tu proyecto</Link>
          </p>
        )}
      </section>

      <MisProyectos incrustado />
      <Ingresar incrustado />
    </main>
  )
}
