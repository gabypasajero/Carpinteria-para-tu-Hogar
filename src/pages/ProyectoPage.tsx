import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Cotizacion } from '../components/Cotizacion'
import { Guia } from '../components/Guia'
import { PanelMedidas } from '../components/PanelMedidas'
import { PlanoCortes } from '../components/PlanoCortes'
import { TablaCorte } from '../components/TablaCorte'
import { TablaMateriales } from '../components/TablaMateriales'
import { Visor3D } from '../components/Visor3D'
import { DIFICULTAD, cm, formatoCLP } from '../core/costos'
import type { ProyectoDef } from '../core/types'
import { guardarDiseno } from '../lib/disenos'
import { useCalculo } from '../lib/useCalculo'
import { buscarProyecto, normalizarParams } from '../projects'

type Pestana = 'corte' | 'materiales' | 'optimizacion' | 'guia'

const PESTANAS: [Pestana, string][] = [
  ['corte', 'Lista de corte'],
  ['materiales', 'Materiales y costo'],
  ['optimizacion', 'Plano de cortes'],
  ['guia', 'Guía paso a paso'],
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

  const [pestana, setPestana] = useState<Pestana>('corte')
  const [explosion, setExplosion] = useState(0)
  const [mostrarLetras, setMostrarLetras] = useState(true)
  const [resaltada, setResaltada] = useState<string | null>(null)
  const [pasoGuia, setPasoGuia] = useState(0)
  const [captura, setCaptura] = useState<{ paso: number | null } | null>(null)
  const [cotizando, setCotizando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const canvas = useRef<HTMLCanvasElement | null>(null)

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
    const doc = generarPdf(proyecto, calc, capturas, window.location.href)
    const [W, H, D] = res.exterior
    doc.save(`${proyecto.id}-${cm(W)}x${cm(H)}x${cm(D)}.pdf`)
    setMensaje('')
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
        <Link to="/" className="volver">
          ← Proyectos
        </Link>
        <h1>{proyecto.nombre}</h1>
        <p className="sub">
          {DIFICULTAD[proyecto.dificultad - 1]} · {proyecto.horas}
          {proyecto.plan === 'pro' && <span className="insignia en-linea">Pro</span>}
        </p>
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
          <div>
            <span>Materiales aprox.</span>
            <strong>{formatoCLP(costos.total)}</strong>
          </div>
        </div>
        {res.avisos.length > 0 && (
          <ul className="avisos">
            {res.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        <div className="acciones">
          <button className="boton" onClick={descargarPdf} disabled={captura !== null}>
            Descargar PDF
          </button>
          <button className="boton secundario" onClick={guardar}>
            Guardar diseño
          </button>
          <button className="boton destacado" onClick={() => setCotizando(true)}>
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
            </button>
          ))}
        </div>
        <div className="pestana-contenido" role="tabpanel">
          {pestana === 'corte' && <TablaCorte cortes={cortes} resaltada={resaltada} onResaltar={setResaltada} />}
          {pestana === 'materiales' && <TablaMateriales lineas={costos.lineas} total={costos.total} />}
          {pestana === 'optimizacion' && <PlanoCortes opt={opt} />}
          {pestana === 'guia' && (
            <Guia pasos={res.pasos} piezas={res.piezas} letras={letras} herramientas={proyecto.herramientas} paso={pasoGuia} onPaso={setPasoGuia} />
          )}
        </div>
      </section>

      {cotizando && (
        <Cotizacion proyecto={proyecto} params={params} exterior={res.exterior} costoMateriales={costos.total} onCerrar={() => setCotizando(false)} />
      )}
    </main>
  )
}
