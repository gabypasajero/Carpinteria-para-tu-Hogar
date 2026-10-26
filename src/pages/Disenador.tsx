// «Crea tu proyecto»: diseñador 3D libre. La persona arma su mueble con planchas y listones reales,
// los mide, los mueve y los gira, agrega herrajes, y obtiene lista de corte, plano de cortes, costo y PDF.
import { Edges, Grid, OrbitControls, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Mesh } from 'three'
import { Bloqueo } from '../components/Bloqueo'
import { Cotizacion } from '../components/Cotizacion'
import { PlanoCortes } from '../components/PlanoCortes'
import { TablaCorte } from '../components/TablaCorte'
import { TablaMateriales } from '../components/TablaMateriales'
import { HERRAJES, MATERIALES } from '../core/catalogo'
import { calcularCostos, cm, formatoCLP } from '../core/costos'
import { agruparPiezas, letrasPorClave } from '../core/despiece'
import { aInstancia, caja, choques, codificar, decodificar, desdeInstancia, girar, herrajesSugeridos, medidas, nuevaPieza, sobrePiso, type Eje, type PiezaLibre } from '../core/libre'
import { optimizar } from '../core/optimizador'
import type { ProyectoDef, ResultadoProyecto } from '../core/types'
import { PIEZAS_GRATIS, useAcceso } from '../lib/plan'
import { usePrecios } from '../lib/useCalculo'
import { PROYECTOS, buscarProyecto, paramsPorDefecto } from '../projects'
import { useApp } from '../store/useApp'
import { useDiseno } from '../store/useDiseno'

const ESCALA = 1 / 1000
const PLANTILLAS = ['repisa_muro', 'caja_tapa', 'repisa', 'velador', 'mesa_centro', 'banca', 'escritorio', 'cocina_base']
const GRUPOS: [string, (id: string) => boolean][] = [
  ['Melamina', (id) => id.startsWith('mel')],
  ['MDF, terciado y OSB', (id) => /^(hdf|mdf|terc|osb)/.test(id)],
  ['Volcanita', (id) => id.startsWith('volc')],
  ['Pino cepillado y dimensionado', (id) => /^(pc|pd)/.test(id)],
  ['Exterior (impregnado, deck, polines)', (id) => /^(pi|deck|polin|machi)/.test(id)],
]
const id = () => Math.random().toString(36).slice(2, 10)

function PiezaMesh({ p, seleccionada, onSel, refSel }: { p: PiezaLibre; seleccionada: boolean; onSel: () => void; refSel: React.RefObject<Mesh | null> }) {
  const s = medidas(p)
  return (
    <mesh
      ref={seleccionada ? refSel : undefined}
      position={p.pos.map((v) => v * ESCALA) as [number, number, number]}
      rotation={p.rot}
      onClick={(e) => {
        e.stopPropagation()
        onSel()
      }}
    >
      <boxGeometry args={[s[0] * ESCALA, s[1] * ESCALA, s[2] * ESCALA]} />
      <meshStandardMaterial color={seleccionada ? '#e9a6c1' : MATERIALES[p.material].color} />
      <Edges color={seleccionada ? '#a8325e' : '#6b5a48'} />
    </mesh>
  )
}

function Escena({ onCanvas }: { onCanvas: (c: HTMLCanvasElement) => void }) {
  const { piezas, seleccion, setSeleccion, actualizar } = useDiseno()
  const ref = useRef<Mesh | null>(null)
  const [, setListo] = useState(0)
  useEffect(() => setListo((n) => n + 1), [seleccion])
  const sel = piezas.find((p) => p.id === seleccion)
  return (
    <Canvas camera={{ position: [1.6, 1.3, 2.2], fov: 40, near: 0.01, far: 100 }} gl={{ preserveDrawingBuffer: true }} onPointerMissed={() => setSeleccion(null)} onCreated={({ gl }) => onCanvas(gl.domElement)}>
      <color attach="background" args={['#f4f2ef']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} />
      <Grid args={[10, 10]} cellSize={0.1} sectionSize={1} cellColor="#d9d1c7" sectionColor="#c5b9ab" fadeDistance={12} infiniteGrid />
      {piezas.map((p) => (
        <PiezaMesh key={p.id} p={p} seleccionada={p.id === seleccion} onSel={() => setSeleccion(p.id)} refSel={ref} />
      ))}
      {sel && ref.current && (
        <TransformControls
          object={ref.current}
          mode="translate"
          translationSnap={0.01}
          size={0.8}
          onMouseUp={() => {
            const o = ref.current
            if (o) actualizar(sel.id, { pos: [Math.round(o.position.x / ESCALA), Math.round(o.position.y / ESCALA), Math.round(o.position.z / ESCALA)] })
          }}
        />
      )}
      <OrbitControls makeDefault enableDamping />
    </Canvas>
  )
}

function Biblioteca() {
  const { piezas, agregar, herrajes, setHerraje, cargar } = useDiseno()
  const lleno = useLleno()
  const [tab, setTab] = useState<'materiales' | 'herrajes' | 'plantillas'>('materiales')
  const usados = Object.fromEntries(herrajes.map((h) => [h.id, h.cantidad]))
  const desdeProyecto = (pid: string) => {
    const pr = buscarProyecto(pid)
    if (!pr) return
    const res = pr.construir(paramsPorDefecto(pr))
    cargar({ nombre: `${pr.nombre} (mi versión)`, piezas: res.piezas.map((pi, i) => desdeInstancia(pi, `${i}-${id()}`)), herrajes: res.herrajes })
  }
  return (
    <div className="dz-biblioteca">
      <div className="dz-tabs" role="tablist">
        {(['materiales', 'herrajes', 'plantillas'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'activa' : ''} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'materiales' && lleno && <Bloqueo que={`Diseñar con más de ${PIEZAS_GRATIS} piezas`} />}
      {tab === 'materiales' &&
        GRUPOS.map(([g, f]) => (
          <details key={g} open={g !== 'Volcanita'}>
            <summary>{g}</summary>
            <ul className="dz-lista">
              {Object.values(MATERIALES)
                .filter((m) => f(m.id))
                .map((m) => (
                  <li key={m.id}>
                    <button className="dz-item" disabled={lleno} onClick={() => agregar(nuevaPieza(m.id, id(), piezas.length, piezas))}>
                      <span className="dz-muestra" style={{ background: m.color }} />
                      <span>
                        {m.nombre}
                        <small>
                          {m.tipo === 'plancha' ? `Plancha ${m.formato[0] / 10}×${m.formato[1]! / 10} cm` : `Pieza de ${m.formato[0] / 1000} m`} · {formatoCLP(m.precio)}
                        </small>
                      </span>
                      <span className="dz-mas">＋</span>
                    </button>
                  </li>
                ))}
            </ul>
          </details>
        ))}
      {tab === 'herrajes' && (
        <>
          <button className="boton secundario dz-sugerir" onClick={() => herrajesSugeridos(piezas).forEach((h) => setHerraje(h.id, Math.max(usados[h.id] ?? 0, h.cantidad)))}>
            Sugerir tornillos y cola según mis piezas
          </button>
          <ul className="dz-lista">
            {Object.values(HERRAJES).map((h) => (
              <li key={h.id} className="dz-herraje">
                <span>
                  {h.nombre}
                  <small>
                    {formatoCLP(h.precio)} · {h.unidadVenta}
                  </small>
                </span>
                <input
                  type="number"
                  min={0}
                  step={h.unidadUso === 'u' ? 1 : 0.5}
                  value={usados[h.id] ?? 0}
                  onChange={(e) => setHerraje(h.id, Math.max(0, Number(e.target.value)))}
                  aria-label={`Cantidad de ${h.nombre} en ${h.unidadUso}`}
                />
                <small className="dz-unidad">{h.unidadUso}</small>
              </li>
            ))}
          </ul>
        </>
      )}
      {tab === 'plantillas' && (
        <div className="dz-plantillas">
          <p className="nota">Parte desde un mueble del catálogo y modifícalo pieza por pieza.</p>
          <div className="dz-chips">
            {PLANTILLAS.map((pid) => (
              <button key={pid} className="chip-boton" onClick={() => desdeProyecto(pid)}>
                {buscarProyecto(pid)?.nombre}
              </button>
            ))}
          </div>
          <label className="medida">
            <span className="medida-cab">Cualquier proyecto</span>
            <select defaultValue="" onChange={(e) => e.target.value && desdeProyecto(e.target.value)}>
              <option value="">Elige un proyecto…</option>
              {PROYECTOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}

function Num({ label, valor, onChange, min = 1 }: { label: string; valor: number; onChange: (v: number) => void; min?: number }) {
  return (
    <label className="dz-num">
      <span>{label}</span>
      <input type="number" step={0.1} min={min} value={Math.round(valor) / 10} onChange={(e) => e.target.value !== '' && onChange(Math.round(Number(e.target.value) * 10))} />
      <small>cm</small>
    </label>
  )
}

function Propiedades() {
  const { piezas, seleccion, actualizar, quitar, agregar } = useDiseno()
  const lleno = useLleno()
  const p = piezas.find((x) => x.id === seleccion)
  if (!p) return <p className="nota dz-vacio">Toca una pieza para editarla, o agrega una desde la biblioteca.</p>
  const m = MATERIALES[p.material]
  const s = medidas(p)
  const c = caja(p)
  const mover = (eje: Eje, d: number) => {
    const pos = [...p.pos] as [number, number, number]
    pos[eje] += d
    actualizar(p.id, { pos })
  }
  return (
    <div className="dz-props">
      <label className="dz-campo">
        <span>Nombre</span>
        <input value={p.nombre} onChange={(e) => actualizar(p.id, { nombre: e.target.value })} />
      </label>
      <label className="dz-campo">
        <span>Material</span>
        <select value={p.material} onChange={(e) => actualizar(p.id, { material: e.target.value })}>
          {Object.values(MATERIALES).map((x) => (
            <option key={x.id} value={x.id}>
              {x.nombre}
            </option>
          ))}
        </select>
      </label>
      <div className="dz-fila">
        <Num label="Largo" valor={p.largo} onChange={(v) => actualizar(p.id, { largo: Math.min(v, m.formato[0]) })} />
        {m.tipo === 'plancha' ? (
          <Num label="Ancho" valor={p.ancho} onChange={(v) => actualizar(p.id, { ancho: Math.min(v, m.formato[1]!) })} />
        ) : (
          <span className="dz-dato">
            Sección {m.seccion![1]}×{m.seccion![0]} mm
          </span>
        )}
      </div>
      <p className="nota">
        Medidas: {cm(s[0])} × {cm(s[1])} × {cm(s[2])} cm · espesor {m.tipo === 'plancha' ? m.espesor : m.seccion![1]} mm
      </p>
      <div className="dz-fila">
        <Num label="X" valor={c.min[0]} min={-10000} onChange={(v) => mover(0, v - c.min[0])} />
        <Num label="Alto (Y)" valor={c.min[1]} min={-10000} onChange={(v) => mover(1, v - c.min[1])} />
        <Num label="Z" valor={c.min[2]} min={-10000} onChange={(v) => mover(2, v - c.min[2])} />
      </div>
      <div className="dz-botones">
        <span>Girar 90°:</span>
        <button onClick={() => actualizar(p.id, sobrePiso(girar(p, 1)))} title="Girar sobre el eje vertical">↻ Vertical</button>
        <button onClick={() => actualizar(p.id, sobrePiso(girar(p, 0)))} title="Pararla o acostarla">⤾ Pararla</button>
        <button onClick={() => actualizar(p.id, sobrePiso(girar(p, 2)))} title="Girarla de lado">⟲ De lado</button>
      </div>
      {m.usaTapacanto && (
        <label className="dz-campo">
          <span>Tapacanto</span>
          <select value={p.canto} onChange={(e) => actualizar(p.id, { canto: e.target.value as PiezaLibre['canto'] })}>
            <option value="ninguno">Sin tapacanto</option>
            <option value="frente">Solo el canto largo del frente</option>
            <option value="contorno">Todo el contorno</option>
          </select>
        </label>
      )}
      <div className="dz-botones">
        <button onClick={() => mover(1, -c.min[1])}>Apoyar en el piso</button>
        <button
          disabled={lleno}
          onClick={() => {
            const copia = { ...p, id: id(), nombre: `${p.nombre} (copia)`, pos: [p.pos[0] + 50, p.pos[1], p.pos[2] + 50] as [number, number, number] }
            agregar(copia)
          }}
        >
          Duplicar
        </button>
        <button className="peligro" onClick={() => quitar(p.id)}>
          Eliminar
        </button>
      </div>
    </div>
  )
}

/** Sin plan Pro el diseñador permite hasta PIEZAS_GRATIS piezas. */
function useLleno() {
  const { pro } = useAcceso()
  const n = useDiseno((s) => s.piezas.length)
  return !pro && n >= PIEZAS_GRATIS
}

export function Disenador() {
  const d = useDiseno()
  const { pro } = useAcceso()
  const precios = usePrecios()
  const tiendas = useApp((s) => s.tiendas)
  const [busqueda, setBusqueda] = useSearchParams()
  const [pestana, setPestana] = useState<'corte' | 'materiales' | 'plano'>('materiales')
  const [panel, setPanel] = useState<'biblioteca' | 'pieza' | 'resumen'>('biblioteca')
  const [mensaje, setMensaje] = useState('')
  const [cotizando, setCotizando] = useState(false)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  // Diseño compartido por enlace (?d=...).
  useEffect(() => {
    const cod = busqueda.get('d')
    if (!cod) return
    const dis = decodificar(cod)
    if (dis) d.cargar(dis)
    setBusqueda({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (d.seleccion) setPanel('pieza')
  }, [d.seleccion])

  const calc = useMemo(() => {
    const piezas = d.piezas.map(aInstancia)
    const exterior = (() => {
      if (!d.piezas.length) return [0, 0, 0] as [number, number, number]
      const cajas = d.piezas.map(caja)
      return [0, 1, 2].map((i) => Math.max(...cajas.map((c) => c.max[i])) - Math.min(...cajas.map((c) => c.min[i]))) as [number, number, number]
    })()
    const res: ResultadoProyecto = {
      piezas,
      herrajes: d.herrajes,
      exterior,
      avisos: choques(d.piezas).map(([a, b]) => `«${a}» se cruza con «${b}»: muévelas para que solo se toquen.`),
      pasos: [
        { titulo: 'Corta y prepara las piezas', texto: 'Pide el corte en la tienda con la lista de corte o corta en tu taller. Marca cada pieza con su letra.' },
        { titulo: 'Arma tu diseño', texto: 'Arma las piezas como se ven en el modelo 3D, perforando antes de atornillar. Revisa las diagonales para que quede a escuadra.' },
        { titulo: 'Termina', texto: 'Lija, aplica tapacanto o barniz y revisa que todo quede firme.' },
      ],
    }
    const cortes = agruparPiezas(piezas)
    const opt = optimizar(cortes)
    const costos = calcularCostos(cortes, d.herrajes, opt, precios)
    if (opt.noCaben.length) res.avisos.push(`Hay piezas más grandes que la plancha o listón: ${opt.noCaben.map((n) => n.letra).join(', ')}. Divídelas en dos.`)
    return { res, cortes, letras: letrasPorClave(cortes), opt, costos }
  }, [d.piezas, d.herrajes, precios])

  const proyecto: ProyectoDef = {
    id: 'libre',
    nombre: d.nombre,
    descripcion: 'Diseño propio hecho en Carpintería para tu hogar.',
    categoria: 'decoración',
    plan: 'gratis',
    dificultad: 2,
    horas: 'según el diseño',
    herramientas: ['huincha', 'escuadrac', 'taladro', 'brocas', 'serrucho', 'lijadora'],
    params: [],
    construir: () => calc.res,
  }
  const [W, H, D] = calc.res.exterior

  function enlace() {
    return `${window.location.origin}/disena?d=${codificar(d)}`
  }
  async function compartir() {
    const url = enlace()
    try {
      if (navigator.share) await navigator.share({ title: d.nombre, url })
      else await navigator.clipboard.writeText(url)
      setMensaje('Enlace copiado: quien lo abra verá tu diseño.')
    } catch {
      setMensaje(url)
    }
  }
  async function pdf() {
    if (!pro) {
      setMensaje('El PDF del diseñador es parte del plan Pro: pruébalo 7 días gratis en Yo › Mi plan.')
      return
    }
    if (!canvas.current) return
    setMensaje('Generando PDF…')
    const { generarPdf } = await import('../lib/pdf')
    const doc = generarPdf(proyecto, calc, { general: canvas.current.toDataURL('image/jpeg', 0.85), pasos: [] }, enlace(), tiendas)
    doc.save(`${d.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    setMensaje('')
  }

  return (
    <main className="disenador">
      <header className="dz-cabecera">
        <input className="dz-nombre" value={d.nombre} onChange={(e) => d.setNombre(e.target.value)} aria-label="Nombre del diseño" />
        <div className="dz-acciones">
          <button
            className="boton secundario"
            onClick={() => {
              d.guardar()
              setMensaje('Guardado en este navegador.')
            }}
          >
            Guardar
          </button>
          <button className="boton secundario" onClick={compartir}>
            Compartir
          </button>
          <button className="boton secundario" onClick={pdf} disabled={!d.piezas.length}>
            PDF{!pro && ' 🔒'}
          </button>
          <button className="boton destacado" onClick={() => setCotizando(true)} disabled={!d.piezas.length}>
            Que me lo fabriquen
          </button>
          <button
            className="boton secundario"
            onClick={() => {
              if (!d.piezas.length || window.confirm('¿Empezar un diseño nuevo? Guarda antes si quieres conservar este.')) d.nuevo()
            }}
          >
            Nuevo
          </button>
        </div>
      </header>
      {mensaje && (
        <p className="mensaje dz-mensaje" role="status">
          {mensaje}
        </p>
      )}

      <nav className="dz-paneles" aria-label="Paneles del diseñador">
        {(['biblioteca', 'pieza', 'resumen'] as const).map((k) => (
          <button key={k} className={panel === k ? 'activa' : ''} onClick={() => setPanel(k)}>
            {k === 'biblioteca' ? 'Agregar' : k === 'pieza' ? 'Pieza' : 'Resumen'}
          </button>
        ))}
      </nav>

      <section className={`dz-izq ${panel === 'biblioteca' ? 'visible' : ''}`}>
        <Biblioteca />
      </section>

      <section className="dz-escena">
        <Escena onCanvas={(c) => (canvas.current = c)} />
        {!d.piezas.length && (
          <div className="dz-bienvenida">
            <h2>Crea tu propio proyecto</h2>
            <p>Agrega planchas y listones desde la biblioteca, dales medidas, muévelos con las flechas y gíralos. Te damos la lista de corte, el costo y el PDF.</p>
            <p>¿No sabes por dónde partir? Elige una plantilla y modifícala.</p>
          </div>
        )}
        <div className="dz-ayuda">Arrastra para girar la vista · toca una pieza y usa las flechas para moverla</div>
      </section>

      <section className={`dz-der ${panel !== 'biblioteca' ? 'visible' : ''}`}>
        <div className={panel === 'pieza' ? 'visible' : 'oculto-movil'}>
          <h3>Pieza</h3>
          <Propiedades />
        </div>
        <div className={panel === 'resumen' ? 'visible' : 'oculto-movil'}>
          <h3>Resumen</h3>
          <div className="resumen">
            <div>
              <span>Medidas totales</span>
              <strong>
                {cm(W)} × {cm(H)} × {cm(D)} cm
              </strong>
            </div>
            <div>
              <span>Piezas</span>
              <strong>{d.piezas.length}</strong>
            </div>
            <div>
              <span>Materiales</span>
              <strong>{formatoCLP(calc.costos.total)}</strong>
            </div>
            <div>
              <span>Planchas / listones</span>
              <strong>{calc.opt.tableros.length + calc.opt.barras.length}</strong>
            </div>
          </div>
          {calc.res.avisos.length > 0 && (
            <ul className="avisos">
              {calc.res.avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
          {d.guardados.length > 0 && (
            <details className="dz-guardados">
              <summary>Mis diseños ({d.guardados.length})</summary>
              <ul>
                {d.guardados.map((g) => (
                  <li key={g.id}>
                    <button className="enlace" onClick={() => d.cargar(g)}>
                      {g.nombre}
                    </button>
                    <button className="enlace peligro" onClick={() => d.borrarGuardado(g.id)} aria-label={`Borrar ${g.nombre}`}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="nota">
            ¿Prefieres un mueble ya resuelto? <Link to="/">Mira el catálogo</Link>.
          </p>
        </div>
      </section>

      <section className="dz-tablas">
        <div className="pestanas" role="tablist">
          {(
            [
              ['materiales', 'Materiales y costo'],
              ['corte', 'Lista de corte'],
              ['plano', 'Plano de cortes'],
            ] as const
          ).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={pestana === k} className={pestana === k ? 'activa' : ''} onClick={() => setPestana(k)}>
              {l}
            </button>
          ))}
        </div>
        <div className="pestana-contenido">
          {!d.piezas.length ? (
            <p className="nota">Aquí aparecerán la lista de corte, el aprovechamiento de las planchas y el costo de tu diseño.</p>
          ) : pestana === 'corte' ? (
            <TablaCorte cortes={calc.cortes} resaltada={null} onResaltar={() => {}} />
          ) : pestana === 'materiales' ? (
            <TablaMateriales lineas={calc.costos.lineas} total={calc.costos.total} />
          ) : (
            <PlanoCortes opt={calc.opt} />
          )}
        </div>
      </section>

      {cotizando && <Cotizacion proyecto={proyecto} params={{}} exterior={calc.res.exterior} costoMateriales={calc.costos.total} onCerrar={() => setCotizando(false)} />}
    </main>
  )
}
