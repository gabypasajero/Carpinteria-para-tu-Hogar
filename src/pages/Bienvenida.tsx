// Encuesta inicial (como en las apps de carpintería), recomendación personalizada y oferta de prueba gratis.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERRAMIENTAS } from '../core/catalogo'
import { formatoCLP } from '../core/costos'
import { DIAS_PRUEBA, PRECIO_MENSUAL } from '../lib/plan'
import { NIVELES, recomendados } from '../lib/recomendar'
import { CATEGORIAS, PROYECTOS } from '../projects'
import { usePerfil, type Encuesta } from '../store/usePerfil'

const MOTIVOS = ['Ahorrar dinero', 'Tener muebles a mi medida', 'Relajarme con un hobby', 'Emprender y vender', 'Arreglar mi casa']
const PLANOS = ['No sé leer planos', 'Entiendo lo básico', 'Sí, sin problema']
const METAS = ['Hacer mi primer mueble', 'Amoblar mi casa a mi medida', 'Arreglar el patio o la terraza', 'Emprender y vender lo que hago']
const HERR = ['taladro', 'circular', 'caladora', 'ingletadora', 'lijadora', 'router', 'serrucho', 'prensa']

type Paso = { titulo: string; sub: string; campo: keyof Encuesta; opciones: { valor: string; texto: string }[]; multiple?: boolean }

const PASOS: Paso[] = [
  { titulo: '¿Cuánto sabes de carpintería?', sub: 'Así te mostramos proyectos a tu nivel.', campo: 'nivel', opciones: NIVELES.map((v) => ({ valor: v, texto: v })) },
  { titulo: '¿Qué te motiva?', sub: 'Elige todas las que quieras.', campo: 'motivos', multiple: true, opciones: MOTIVOS.map((v) => ({ valor: v, texto: v })) },
  { titulo: '¿Sabes leer planos?', sub: 'No te preocupes: nuestros planos son en 3D y con letras.', campo: 'planos', opciones: PLANOS.map((v) => ({ valor: v, texto: v })) },
  {
    titulo: '¿Qué herramientas tienes?',
    sub: 'Te recomendamos proyectos que puedas hacer con lo que tienes.',
    campo: 'herramientas',
    multiple: true,
    opciones: HERR.map((v) => ({ valor: v, texto: HERRAMIENTAS[v] })),
  },
  { titulo: '¿Qué tipo de proyectos buscas?', sub: 'Elige todas las que quieras.', campo: 'intereses', multiple: true, opciones: CATEGORIAS.map((c) => ({ valor: c, texto: c[0].toUpperCase() + c.slice(1) })) },
  { titulo: '¿Qué quieres conseguir?', sub: 'Tu meta para los próximos meses.', campo: 'meta', opciones: METAS.map((v) => ({ valor: v, texto: v })) },
]

export function Bienvenida() {
  const navegar = useNavigate()
  const { setEncuesta, iniciarPrueba, saltar, encuesta: previa } = usePerfil()
  const [i, setI] = useState(0)
  const [r, setR] = useState<Encuesta>(previa ?? { nivel: '', motivos: [], planos: '', herramientas: [], intereses: [], meta: '' })
  const fin = i >= PASOS.length

  if (fin) {
    const recs = recomendados(PROYECTOS, r, 3)
    return (
      <main className="bienvenida">
        <div className="bienvenida-caja">
          <p className="bienvenida-paso">Tu plan de inicio</p>
          <h1>Listo, armamos tu taller</h1>
          <p className="sub">Con lo que nos contaste, te recomendamos partir por:</p>
          <ul className="bienvenida-recs">
            {recs.map((p) => (
              <li key={p.id}>
                <img src={`/fotos/${p.id}.jpg`} alt="" loading="lazy" />
                <span>
                  <strong>{p.nombre}</strong>
                  <small>{p.horas}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="oferta">
            <h2>Prueba Pro {DIAS_PRUEBA} días gratis</h2>
            <ul>
              <li>Planos, lista de corte, plano de cortes y guía de los {PROYECTOS.length} proyectos</li>
              <li>Diseñador 3D sin límites para crear tus propios muebles</li>
              <li>PDF para llevar a la tienda y precios reales de Sodimac, Easy e Imperial</li>
            </ul>
            <p className="sub">Después, {formatoCLP(PRECIO_MENSUAL)} al mes. Cancela cuando quieras.</p>
            <button
              className="boton destacado grande"
              onClick={() => {
                setEncuesta(r)
                iniciarPrueba()
                navegar('/')
              }}
            >
              Empezar mi prueba gratis
            </button>
            <button
              className="enlace"
              onClick={() => {
                setEncuesta(r)
                navegar('/')
              }}
            >
              Seguir con el plan gratis
            </button>
          </div>
        </div>
      </main>
    )
  }

  const paso = PASOS[i]
  const valor = r[paso.campo]
  const listo = Array.isArray(valor) ? true : !!valor
  const elegir = (v: string) => {
    if (paso.multiple) {
      const lista = valor as string[]
      setR({ ...r, [paso.campo]: lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v] })
    } else {
      setR({ ...r, [paso.campo]: v })
      setTimeout(() => setI((n) => n + 1), 180)
    }
  }
  return (
    <main className="bienvenida">
      <div className="bienvenida-caja">
        <div className="progreso" aria-label={`Pregunta ${i + 1} de ${PASOS.length}`}>
          <span style={{ width: `${((i + 1) / PASOS.length) * 100}%` }} />
        </div>
        <p className="bienvenida-paso">
          {i + 1} de {PASOS.length}
        </p>
        <h1>{paso.titulo}</h1>
        <p className="sub">{paso.sub}</p>
        <div className="opciones">
          {paso.opciones.map((o) => {
            const activa = Array.isArray(valor) ? valor.includes(o.valor) : valor === o.valor
            return (
              <button key={o.valor} className={`opcion-encuesta ${activa ? 'activa' : ''}`} aria-pressed={activa} onClick={() => elegir(o.valor)}>
                {o.texto}
              </button>
            )
          })}
        </div>
        <div className="bienvenida-nav">
          {i > 0 ? (
            <button className="enlace" onClick={() => setI(i - 1)}>
              ← Atrás
            </button>
          ) : (
            <button
              className="enlace"
              onClick={() => {
                saltar()
                navegar('/')
              }}
            >
              Saltar
            </button>
          )}
          {paso.multiple && (
            <button className="boton" disabled={!listo} onClick={() => setI(i + 1)}>
              Continuar
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
