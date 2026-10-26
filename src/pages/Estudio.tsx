// Estudio fotográfico: dibuja un proyecto con sus medidas por defecto, con sombras suaves y veta de madera,
// para generar las fotos del catálogo (scripts/fotos/renderizar.cjs). No tiene interfaz.
import { ContactShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { MATERIALES } from '../core/catalogo'
import { buscarProyecto, paramsPorDefecto } from '../projects'

const ESCALA = 1 / 1000
const texturas = new Map<string, CanvasTexture>()

/** Veta procedimental: franjas finas y nudos suaves sobre el color del material. */
function veta(color: string): CanvasTexture {
  let t = texturas.get(color)
  if (t) return t
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = color
  g.fillRect(0, 0, 256, 256)
  let semilla = 7
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 70; i++) {
    const y = azar() * 256
    g.strokeStyle = `rgba(90,55,20,${0.04 + azar() * 0.08})`
    g.lineWidth = 0.6 + azar() * 1.8
    g.beginPath()
    g.moveTo(0, y)
    for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x / 40 + i) * 3)
    g.stroke()
  }
  t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.wrapS = t.wrapT = RepeatWrapping
  texturas.set(color, t)
  return t
}

const esMadera = (id: string) => !/^(mel|hdf|volc)/.test(id)

export function Estudio() {
  const { id = '' } = useParams()
  const proyecto = buscarProyecto(id)
  const res = useMemo(() => (proyecto ? proyecto.construir(paramsPorDefecto(proyecto)) : null), [proyecto])
  if (!proyecto || !res) return <p>Proyecto no encontrado</p>
  const [W, H, D] = res.exterior
  const mayor = Math.max(W, H, D) * ESCALA
  const cam: [number, number, number] = [mayor * 1.25, mayor * 0.85, mayor * 1.75]
  return (
    <div className="estudio">
      <Canvas shadows camera={{ position: cam, fov: 35, near: 0.01, far: 100 }} gl={{ preserveDrawingBuffer: true, antialias: true }} dpr={2}>
        <color attach="background" args={['#f4f2ef']} />
        <hemisphereLight args={['#fffaf2', '#d8cfc4', 0.9]} />
        <directionalLight position={[mayor * 2, mayor * 4, mayor * 3]} intensity={1.8} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}>
          <orthographicCamera attach="shadow-camera" args={[-mayor * 2, mayor * 2, mayor * 2, -mayor * 2, 0.1, mayor * 12]} />
        </directionalLight>
        <directionalLight position={[-mayor * 3, mayor * 1.5, mayor]} intensity={0.35} />
        <group position={[-(W * ESCALA) / 2, -(H * ESCALA) / 2, -(D * ESCALA) / 2]}>
          {res.piezas.map((p, i) => {
            const m = MATERIALES[p.material]
            return (
              <mesh key={i} position={p.pos.map((v) => v * ESCALA) as [number, number, number]} rotation={p.rot} castShadow receiveShadow>
                <boxGeometry args={[p.size[0] * ESCALA, p.size[1] * ESCALA, p.size[2] * ESCALA]} />
                <meshStandardMaterial color={esMadera(p.material) ? '#ffffff' : m.color} map={esMadera(p.material) ? veta(m.color) : null} roughness={0.75} />
              </mesh>
            )
          })}
        </group>
        <ContactShadows position={[0, -(H * ESCALA) / 2 - 0.001, 0]} scale={mayor * 4} blur={2.4} opacity={0.45} far={mayor * 2} />
      </Canvas>
    </div>
  )
}
