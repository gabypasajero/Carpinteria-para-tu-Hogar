import { Edges, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { MATERIALES } from '../core/catalogo'
import type { PiezaInstancia } from '../core/types'

interface Props {
  piezas: PiezaInstancia[]
  letras: Record<string, string>
  exterior: [number, number, number]
  /** 0 = armado, 1 = totalmente explotado. */
  explosion: number
  /** Paso de la guía a mostrar; null muestra el mueble completo. */
  paso: number | null
  mostrarLetras: boolean
  resaltada: string | null
  onResaltar: (clave: string | null) => void
  onCanvas?: (c: HTMLCanvasElement) => void
}

const ESCALA = 1 / 1000

// Las letras se dibujan como texturas dentro de la escena (no como HTML) para que
// también salgan en las imágenes del PDF.
const texturas = new Map<string, CanvasTexture>()
function texturaLetra(letra: string, activa: boolean): CanvasTexture {
  const k = `${letra}-${activa}`
  let tex = texturas.get(k)
  if (!tex) {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = activa ? '#e08a2e' : 'rgba(107,68,32,0.92)'
    ctx.beginPath()
    ctx.roundRect(8, 8, 112, 112, 26)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${letra.length > 1 ? 56 : 72}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letra, 64, 68)
    tex = new CanvasTexture(c)
    tex.colorSpace = SRGBColorSpace
    texturas.set(k, tex)
  }
  return tex
}

export function Visor3D({ piezas, letras, exterior, explosion, paso, mostrarLetras, resaltada, onResaltar, onCanvas }: Props) {
  const [W, H, D] = exterior
  const centro: [number, number, number] = [W / 2, H / 2, D / 2]
  const mayor = Math.max(W, H, D) * ESCALA

  // La cámara se ubica según el tamaño del mueble para que siempre quepa en pantalla.
  const camara = useMemo(() => [mayor * 1.5, mayor * 1.1, mayor * 2.2] as [number, number, number], [mayor])

  return (
    <Canvas
      key={camara.join()}
      camera={{ position: camara, fov: 40, near: 0.01, far: 100 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => onCanvas?.(gl.domElement)}
      onPointerMissed={() => onResaltar(null)}
    >
      <color attach="background" args={['#f6f1ea']} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} />
      <group position={[0, -(H * ESCALA) / 2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
          <planeGeometry args={[mayor * 6, mayor * 6]} />
          <meshStandardMaterial color="#e9e0d3" />
        </mesh>
        {piezas.map((p, i) => {
          const desp = p.pos.map((c, k) => (c - centro[k]) * explosion * 0.9)
          const pos: [number, number, number] = [
            (p.pos[0] - centro[0] + desp[0]) * ESCALA,
            (p.pos[1] + desp[1] + (explosion > 0 ? H * 0.15 * explosion : 0)) * ESCALA,
            (p.pos[2] - centro[2] + desp[2]) * ESCALA,
          ]
          const futura = paso !== null && p.paso > paso
          const actual = paso !== null && p.paso === paso
          const activa = resaltada === p.clave
          const color = activa ? '#e08a2e' : actual ? '#f0b25a' : MATERIALES[p.material].color
          return (
            <group key={i} position={pos}>
              <mesh
                onPointerOver={(e) => {
                  if (futura) return
                  e.stopPropagation()
                  onResaltar(p.clave)
                }}
                onPointerOut={() => onResaltar(null)}
              >
                <boxGeometry args={[p.size[0] * ESCALA, p.size[1] * ESCALA, p.size[2] * ESCALA]} />
                {/* La key fuerza un material nuevo: three.js no recompila al cambiar «transparent». */}
                <meshStandardMaterial
                  key={futura ? 'fantasma' : 'solida'}
                  color={color}
                  transparent={futura}
                  opacity={futura ? 0.08 : 1}
                  depthWrite={!futura}
                />
                {!futura && <Edges color={actual || activa ? '#8a4b10' : '#6b5a48'} />}
              </mesh>
              {mostrarLetras && !futura && (
                <sprite scale={[0.032, 0.032, 1]} renderOrder={10}>
                  <spriteMaterial map={texturaLetra(letras[p.clave], activa)} depthTest={false} sizeAttenuation={false} />
                </sprite>
              )}
            </group>
          )
        })}
      </group>
      <OrbitControls makeDefault enableDamping target={[0, 0, 0]} maxPolarAngle={Math.PI / 2 - 0.05} />
    </Canvas>
  )
}
