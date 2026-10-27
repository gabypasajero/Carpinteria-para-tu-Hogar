import { useMemo } from 'react'
import { MATERIALES } from '../core/catalogo'
import type { PiezaInstancia } from '../core/types'
import { esquinas, limitesPieza } from '../projects/util'

const C = Math.cos(Math.PI / 6)
const S = Math.sin(Math.PI / 6)

function proyectar(x: number, y: number, z: number): [number, number] {
  return [(x - z) * C, (x + z) * S - y]
}

function oscurecer(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f))
  return `rgb(${c.join(',')})`
}

type Caja = { pz: PiezaInstancia; min: number[]; max: number[] }

/** A queda detrás de B (y se dibuja antes) si está separada de B hacia atrás en algún eje. */
function detras(a: Caja, b: Caja): boolean {
  return [0, 1, 2].some((k) => a.max[k] <= b.min[k] + 0.5)
}

/** Orden de pintor: cada pieza se dibuja después de todas las que tiene detrás. */
function ordenar(piezas: PiezaInstancia[]): Caja[] {
  const cajas = piezas.map((pz) => ({ pz, ...limitesPieza(pz) }))
  const hecho = new Set<Caja>()
  const salida: Caja[] = []
  const visitar = (c: Caja, enCurso: Set<Caja>) => {
    if (hecho.has(c) || enCurso.has(c)) return
    enCurso.add(c)
    for (const o of cajas) if (o !== c && detras(o, c) && !detras(c, o)) visitar(o, enCurso)
    hecho.add(c)
    salida.push(c)
  }
  for (const c of cajas) visitar(c, new Set())
  return salida
}

// Caras de la caja según el índice de esquina (bit 2 = x, bit 1 = y, bit 0 = z).
const CARAS = [
  [4, 5, 7, 6],
  [0, 1, 3, 2],
  [2, 3, 7, 6],
  [0, 1, 5, 4],
  [1, 3, 7, 5],
  [0, 2, 6, 4],
]

/** Vista isométrica simple de las piezas, dibujada en SVG. */
export function Miniatura({ piezas }: { piezas: PiezaInstancia[] }) {
  const { caras, viewBox } = useMemo(() => {
    const caras: { d: string; fill: string }[] = []
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const { pz } of ordenar(piezas)) {
      const e = esquinas(pz)
      const color = MATERIALES[pz.material].color
      for (const cara of CARAS) {
        const pts = cara.map((i) => e[i])
        // Se ve la cara cuya normal apunta hacia el observador (desde +x, +y, +z).
        const n = [0, 1, 2].map((k) => pts.reduce((s, q) => s + q[k], 0) / 4 - pz.pos[k])
        const largo = Math.hypot(...n) || 1
        const [nx, ny, nz] = n.map((v) => v / largo)
        if (nx + ny + nz <= 1e-6) continue
        const luz = (Math.max(0, ny) * 1 + Math.max(0, nz) * 0.86 + Math.max(0, nx) * 0.72) / (Math.max(0, nx) + Math.max(0, ny) + Math.max(0, nz))
        const p = pts.map((q) => proyectar(...q))
        for (const [x, y] of p) {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        }
        caras.push({ d: 'M' + p.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L') + 'Z', fill: oscurecer(color, luz) })
      }
    }
    const m = 20
    return { caras, viewBox: `${minX - m} ${minY - m} ${maxX - minX + 2 * m} ${maxY - minY + 2 * m}` }
  }, [piezas])

  return (
    <svg viewBox={viewBox} className="miniatura" aria-hidden="true">
      {caras.map((c, i) => (
        <path key={i} d={c.d} fill={c.fill} stroke="#5b4630" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}
