import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TarjetaProyecto } from '../components/TarjetaProyecto'
import { formatoCLP } from '../core/costos'
import { PRECIO_MENSUAL, useAcceso } from '../lib/plan'
import { recomendados } from '../lib/recomendar'
import { calcular, usePrecios } from '../lib/useCalculo'
import { PROYECTOS, paramsPorDefecto } from '../projects'
import { usePerfil } from '../store/usePerfil'

export function Inicio() {
  const encuesta = usePerfil((s) => s.encuesta)
  const { pro, plan, dias } = useAcceso()
  const precios = usePrecios()
  const costos = useMemo(() => Object.fromEntries(PROYECTOS.map((p) => [p.id, calcular(p, paramsPorDefecto(p), precios).costos.total])), [precios])
  const principiantes = PROYECTOS.filter((p) => p.dificultad === 1).sort((a, b) => costos[a.id] - costos[b.id])
  const recs = recomendados(PROYECTOS, encuesta, 8)
  const tendencias = ['cama', 'mesa_comedor', 'deck', 'casita_juego', 'vinoteca', 'pikler', 'librero_escalera', 'sofa_2x4', 'mesa_picnic', 'cama_montessori'].map((id) => PROYECTOS.find((p) => p.id === id)!).filter(Boolean)

  return (
    <main className="inicio">
      {plan === 'prueba' && pro && (
        <p className="franja-prueba">
          Prueba Pro: te quedan {dias} {dias === 1 ? 'día' : 'días'}. <Link to="/yo#plan">Ver plan</Link>
        </p>
      )}
      <section className="inicio-hero">
        <div>
          <h1>Hazlo tú, a tu medida</h1>
          <p>
            {PROYECTOS.length} proyectos con plano 3D, lista de corte y materiales con precios reales en Chile, y un diseñador para crear tus propios muebles.
          </p>
          <div className="inicio-cta">
            <Link className="boton destacado" to="/inspiracion">
              Ver proyectos
            </Link>
            <Link className="boton secundario" to="/disena">
              Crear mi propio diseño
            </Link>
          </div>
        </div>
      </section>

      <section className="fila-seccion">
        <div className="fila-cab">
          <h2>{encuesta ? 'Recomendados para ti' : 'Proyectos para principiantes'}</h2>
          <Link to="/inspiracion?filtro=principiante">Ver todos</Link>
        </div>
        <div className="carrusel">
          {(encuesta ? recs : principiantes.slice(0, 10)).map((p) => (
            <TarjetaProyecto key={p.id} p={p} costo={costos[p.id]} variante="carrusel" />
          ))}
        </div>
      </section>

      <section className="banner-disenador">
        <div>
          <span className="etiqueta">Solo en Carpintería para tu hogar</span>
          <h2>Diseña tu mueble en 3D</h2>
          <p>Agrega planchas y listones reales, mueve y gira cada pieza, y te damos la lista de corte, el costo y el PDF. ¿No quieres armarlo? Te lo fabrica una mueblería.</p>
          <Link className="boton destacado" to="/disena">
            Abrir el diseñador
          </Link>
        </div>
        <img src="/fotos/vinoteca.jpg" alt="" />
      </section>

      {encuesta && (
        <section className="fila-seccion">
          <div className="fila-cab">
            <h2>Para partir hoy</h2>
            <Link to="/inspiracion?filtro=principiante">Ver todos</Link>
          </div>
          <div className="carrusel">
            {principiantes.slice(0, 10).map((p) => (
              <TarjetaProyecto key={p.id} p={p} costo={costos[p.id]} variante="carrusel" />
            ))}
          </div>
        </section>
      )}

      <section className="fila-seccion">
        <div className="fila-cab">
          <h2>Tendencias</h2>
          <Link to="/inspiracion?filtro=tendencias">Ver todas</Link>
        </div>
        <div className="grilla-fotos">
          {tendencias.map((p) => (
            <TarjetaProyecto key={p.id} p={p} costo={costos[p.id]} />
          ))}
        </div>
      </section>

      {!pro && (
        <section className="oferta en-linea">
          <h2>Todo el taller por {formatoCLP(PRECIO_MENSUAL)} al mes</h2>
          <p>Planos, guías y PDF de todos los proyectos y el diseñador 3D sin límites.</p>
          <Link className="boton destacado" to="/yo#plan">
            Ver plan Pro
          </Link>
        </section>
      )}
      {!encuesta && (
        <p className="nota centrada">
          <Link to="/bienvenida">Responde 6 preguntas</Link> y te recomendamos proyectos a tu nivel.
        </p>
      )}
    </main>
  )
}
