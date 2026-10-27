import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Bloqueo } from '../components/Bloqueo'
import { Comparador } from '../components/Comparador'
import { Cotizacion } from '../components/Cotizacion'
import { Ficha } from '../components/Ficha'
import { Guia } from '../components/Guia'
import { PanelMedidas } from '../components/PanelMedidas'
import { PlanoCortes } from '../components/PlanoCortes'
import { TablaCorte } from '../components/TablaCorte'
import { TablaMateriales } from '../components/TablaMateriales'
import { Visor3D } from '../components/Visor3D'
import { DIFICULTAD, cm } from '../core/costos'
import { planillaDimensionado } from '../core/dimensionado'
import type { ProyectoDef } from '../core/types'
import { guardarDiseno } from '../lib/disenos'
import { NOTA_PROFESIONAL, conProfesional } from '../lib/profesional'
import { tipoDeProyecto } from '../lib/detodito'
import { SugerenciaDTO } from '../components/SugerenciaDTO'
import { proyectoAbierto, useAcceso } from '../lib/plan'
import { useCalculo } from '../lib/useCalculo'
import { desdeInstancia } from '../core/libre'
import { useApp } from '../store/useApp'
import { useDiseno } from '../store/useDiseno'
import { buscarProyecto, normalizarParams } from '../projects'

type Pestana = 'corte' | 'materiales' | 'optimizacion' | 'guia' | 'ficha'

const PESTANAS: [Pestana, string][] = [
  ['corte', 'Lista de corte'],
  ['materiales', 'Materiales y costo'],
  ['optimizacion', 'Plano de cortes'],
  ['guia', 'Guía paso a paso'],
  ['ficha', 'Ficha y compras'],
]

/** Copia reducida en JPEG del lienzo 3D: un PNG por paso deja el PDF en varios MB. */
function capturarLienzo(c: HTMLCanvasElement, anchoMax = 1200): string {
  const k = Math.min(1, anchoMax / c.width)
  const tmp = document.createElement('canvas')
  tmp.width = Math.round(c.width * k)
  tmp.height = Math.round(c.height * k)
  tmp.getContext('2d')!.drawImage(c, 0, 0, tmp.width, tmp.height)
  return tmp.toDataURL('image/jpeg', 0.82)
}

const esperarCuadros = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r()))))

export function ProyectoPage() {
  const { id = '' } = useParams()
  const proyecto = buscarProyecto(id)
  if (!proyecto) {
    return (
      <main className="vacio">
        <p>No encontramos ese proyecto.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    )
  }
  return <Configurador key={proyecto.id} proyecto={proyecto} />
}

function Configurador({ proyecto }: { proyecto: ProyectoDef }) {
  const [busqueda, setBusqueda] = useSearchParams()
  const params = useMemo(
    () => normalizarParams(proyecto, Object.fromEntries([...busqueda].map(([k, v]) => [k, Number(v)]))),
    [proyecto, busqueda],
  )
  const calc = useCalculo(proyecto, params)
  const { res, cortes, letras, opt, costos } = calc

  const acceso = useAcceso()
  const abierto = proyectoAbierto(proyecto, acceso.abierto)
  const esMuestra = !acceso.pro && acceso.muestra === proyecto.id
  const [pestana, setPestana] = useState<Pestana>(abierto ? 'corte' : 'materiales')
  const bloqueada = (k: Pestana) => !abierto && k !== 'materiales' && k !== 'ficha'
  const [explosion, setExplosion] = useState(0)
  const [mostrarLetras, setMostrarLetras] = useState(true)
  const [resaltada, setResaltada] = useState<string | null>(null)
  const [pasoGuia, setPasoGuia] = useState(0)
  const [captura, setCaptura] = useState<{ paso: number | null } | null>(null)
  /** Tienda con la que se abre la cotización (null = cerrada). */
  const [cotizando, setCotizando] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const tiendas = useApp((s) => s.tiendas)
  const navegar = useNavigate()
  const cargarDiseno = useDiseno((s) => s.cargar)

  const cambiar = useCallback(
    (pid: string, valor: number) => {
      const nuevos = normalizarParams(proyecto, { ...params, [pid]: valor })
      setBusqueda(Object.fromEntries(Object.entries(nuevos).map(([k, v]) => [k, String(v)])), { replace: true })
    },
    [proyecto, params, setBusqueda],
  )

  async function descargarPdf() {
    if (!canvas.current) return
    setMensaje('Generando PDF…')
    const capturas: { general?: string; pasos: (string | undefined)[] } = { pasos: [] }
    try {
      setCaptura({ paso: null })
      await esperarCuadros()
      capturas.general = capturarLienzo(canvas.current)
      for (let i = 0; i < res.pasos.length; i++) {
        if (!res.piezas.some((p) => p.paso === i)) continue
        setCaptura({ paso: i })
        await esperarCuadros()
        capturas.pasos[i] = capturarLienzo(canvas.current)
      }
    } finally {
      setCaptura(null)
    }
    const { generarPdf } = await import('../lib/pdf')
    const doc = generarPdf(proyecto, calc, capturas, window.location.href, tiendas)
    doc.save(`${nombreArchivo()}.pdf`)
    setMensaje('')
  }

  function nombreArchivo() {
    const [W, H, D] = res.exterior
    return `${proyecto.id}-${cm(W)}x${cm(H)}x${cm(D)}`
  }

  function descargarPlanilla() {
    const [W, H, D] = res.exterior
    const csv = planillaDimensionado(cortes, `${proyecto.nombre} ${cm(W)}×${cm(H)}×${cm(D)} cm`)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${nombreArchivo()}-dimensionado.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function guardar() {
    const nombre = window.prompt('Nombre para este diseño', `${proyecto.nombre} ${cm(res.exterior[0])} cm`)
    if (!nombre) return
    try {
      const donde = await guardarDiseno(proyecto.id, nombre, params)
      setMensaje(donde === 'nube' ? 'Guardado en tu cuenta.' : 'Guardado en este navegador. Ingresa para guardarlo en tu cuenta.')
    } catch (e) {
      setMensaje(`No se pudo guardar: ${(e as Error).message}`)
    }
    setTimeout(() => setMensaje(''), 4000)
  }

  const pasoVisor = captura ? captura.paso : pestana === 'guia' ? pasoGuia : null
  const [W, H, D] = res.exterior

  return (
    <main className="configurador">
      <aside className="lateral-panel">
        <Link to="/inspiracion" className="volver">
          ← Proyectos
        </Link>
        <h1>{proyecto.nombre}</h1>
        <p className="sub">
          {DIFICULTAD[proyecto.dificultad - 1]} · {proyecto.horas}
          {proyecto.plan === 'pro' && <span className="insignia en-linea">Pro</span>}
        </p>
        {conProfesional(proyecto) && (
          <div className="aviso-profesional">
            <p>👷 {NOTA_PROFESIONAL}</p>
          </div>
        )}
        <SugerenciaDTO tipo={tipoDeProyecto(proyecto.id)} onCotizar={() => setCotizando('detodito')} />
        {esMuestra && <p className="franja-muestra">🎁 Este es tu proyecto de regalo: lo tienes completo.</p>}
        <PanelMedidas proyecto={proyecto} params={params} onChange={cambiar} />
        <div className="resumen">
          <div>
            <span>Medidas finales</span>
            <strong>
              {cm(W)} × {cm(H)} × {cm(D)} cm
            </strong>
          </div>
          <div>
            <span>Piezas</span>
            <strong>{res.piezas.length}</strong>
          </div>
          <div>
            <span>Planchas / listones</span>
            <strong>{opt.tableros.length + opt.barras.length}</strong>
          </div>
        </div>
        <Comparador costoMateriales={costos.total} horas={proyecto.horas} onCotizar={() => setCotizando('cualquiera')} />
        {res.avisos.length > 0 && (
          <ul className="avisos">
            {res.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        <div className="acciones">
          <button className="boton" onClick={abierto ? descargarPdf : () => setPestana('corte')} disabled={captura !== null}>
            Descargar PDF{!abierto && ' 🔒'}
          </button>
          <button className="boton secundario" onClick={guardar}>
            Guardar diseño
          </button>
          <button
            className="boton secundario"
            onClick={() => {
              cargarDiseno({ nombre: `${proyecto.nombre} (mi versión)`, tipo: tipoDeProyecto(proyecto.id), piezas: res.piezas.map((p, i) => desdeInstancia(p, `${i}-${Date.now()}`)), herrajes: res.herrajes })
              navegar('/disena')
            }}
          >
            Personalizar en el diseñador 3D
          </button>
          <button className="boton destacado" onClick={() => setCotizando('cualquiera')}>
            ¿No quieres hacerlo tú?
          </button>
        </div>
        {mensaje && <p className="mensaje" role="status">{mensaje}</p>}
      </aside>

      <section className="escena">
        <div className="visor">
          <Visor3D
            piezas={res.piezas}
            letras={letras}
            exterior={res.exterior}
            explosion={captura ? 0 : explosion}
            paso={pasoVisor}
            mostrarLetras={captura ? true : mostrarLetras}
            resaltada={captura ? null : resaltada}
            onResaltar={setResaltada}
            onCanvas={(c) => (canvas.current = c)}
          />
          <div className="visor-controles">
            <label>
              Vista explotada
              <input type="range" min={0} max={1} step={0.01} value={explosion} onChange={(e) => setExplosion(Number(e.target.value))} />
            </label>
            <label className="check">
              <input type="checkbox" checked={mostrarLetras} onChange={(e) => setMostrarLetras(e.target.checked)} />
              Letras
            </label>
            {resaltada && (
              <span className="visor-pieza">
                <span className="letra">{letras[resaltada]}</span> {cortes.find((c) => c.clave === resaltada)?.nombre}
              </span>
            )}
          </div>
        </div>

        <div className="pestanas" role="tablist">
          {PESTANAS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={pestana === k} className={pestana === k ? 'activa' : ''} onClick={() => setPestana(k)}>
              {label}
              {bloqueada(k) && ' 🔒'}
            </button>
          ))}
        </div>
        <div className="pestana-contenido" role="tabpanel">
          {bloqueada(pestana) && <Bloqueo que={PESTANAS.find(([k]) => k === pestana)![1]} muestraId={proyecto.id} />}
          {pestana === 'corte' && abierto && (
            <>
              <div className="barra-pestana">
                <p className="nota">Lleva esta lista a la tienda o descárgala para pedir el dimensionado (corte y tapacanto).</p>
                <button className="boton secundario" onClick={descargarPlanilla}>
                  Descargar planilla para dimensionar
                </button>
              </div>
              <TablaCorte cortes={cortes} resaltada={resaltada} onResaltar={setResaltada} />
            </>
          )}
          {pestana === 'materiales' && <TablaMateriales lineas={costos.lineas} total={costos.total} />}
          {pestana === 'optimizacion' && abierto && <PlanoCortes opt={opt} />}
          {pestana === 'guia' && abierto && (
            <Guia pasos={res.pasos} piezas={res.piezas} letras={letras} herramientas={proyecto.herramientas} paso={pasoGuia} onPaso={setPasoGuia} />
          )}
          {pestana === 'ficha' && <Ficha proyecto={proyecto} lineas={costos.lineas} />}
        </div>
      </section>

      {cotizando && (
        <Cotizacion
          proyecto={proyecto}
          params={params}
          exterior={res.exterior}
          costoMateriales={costos.total}
          tiendaInicial={cotizando}
          onCerrar={() => setCotizando(null)}
        />
      )}
    </main>
  )
}
