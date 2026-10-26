import type { PiezaInstancia, ProyectoDef } from '../core/types'
import { aMm, juntarHerrajes, pieza } from './util'

const TABLA = 'pino1x4'
const PATA = 'pino2x2'
const e = 19 // espesor 1×4
const a = 90 // ancho 1×4
const p = 41 // lado 2×2
const VUELO = 20 // las tablas sobresalen de las patas

export const banca: ProyectoDef = {
  id: 'banca',
  nombre: 'Banca de pino',
  descripcion: 'Banca de madera de pino cepillado para terraza, entrada o comedor.',
  categoria: 'exterior',
  plan: 'gratis',
  dificultad: 1,
  horas: '3 a 4 horas',
  herramientas: ['Sierra circular o serrucho', 'Taladro atornillador', 'Broca 4 mm', 'Escuadra', 'Huincha de medir', 'Lijadora o taco de lija', 'Brocha'],
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 60, max: 200, step: 1, default: 120 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 35, max: 50, step: 1, default: 45 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 25, max: 50, step: 1, default: 35 },
  ],
  construir(params) {
    const { largo: L, alto: H, fondo: D } = aMm(params, ['largo', 'alto', 'fondo'])
    const piezas: PiezaInstancia[] = []
    const avisos: string[] = []
    const altoPata = H - e
    const xi = [VUELO, L - VUELO - p]
    const zi = [VUELO, D - VUELO - p]

    // Paso 1: dos costados (2 patas + travesaño corto arriba + chambrana abajo)
    for (const x of xi) {
      for (const z of zi) piezas.push(pieza('pata', 'Pata', PATA, [x, 0, z], [x + p, altoPata, z + p], 1, { veta: true }))
      const xc = x + (p - e) / 2
      piezas.push(pieza('travCorto', 'Travesaño corto', TABLA, [xc, altoPata - a, zi[0] + p], [xc + e, altoPata, zi[1]], 1, { veta: true }))
      piezas.push(pieza('chambrana', 'Chambrana', PATA, [x, 100, zi[0] + p], [x + p, 100 + p, zi[1]], 1, { veta: true }))
    }

    // Paso 2: travesaños largos que unen los costados
    for (const z of [zi[0], zi[1] + p - e]) {
      piezas.push(pieza('travLargo', 'Travesaño largo', TABLA, [xi[0] + p, altoPata - a, z], [xi[1], altoPata, z + e], 2, { veta: true }))
    }

    // Paso 3: tablas del asiento repartidas en el fondo
    // Cuántas tablas caben dejando al menos 5 mm de junta para que escurra el agua.
    const n = Math.max(2, Math.floor((D + 5) / (a + 5)))
    const junta = (D - n * a) / (n - 1)
    if (junta > 20) avisos.push('Las tablas del asiento quedan muy separadas: ajusta el fondo.')
    for (let i = 0; i < n; i++) {
      const z = i * (a + junta)
      piezas.push(pieza('tabla', 'Tabla de asiento', TABLA, [0, altoPata, z], [L, H, z + a], 3, { veta: true }))
    }
    if (L > 1500) avisos.push('Con más de 1,5 m de largo, agrega un travesaño corto al centro para que el asiento no se flecte.')

    return {
      piezas,
      exterior: [L, H, D],
      avisos,
      herrajes: juntarHerrajes([
        { id: 'tornillo4x50', cantidad: n * (L > 1000 ? 6 : 4) + 2 * 4 + 2 * 4 + 2 * 4 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija', cantidad: 3 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: [
        {
          titulo: 'Corta los listones',
          texto: 'Corta las patas, travesaños, chambranas y tablas según la lista de corte. Usa la escuadra para que los cortes queden rectos. Lija los cantos.',
          consejo: 'Corta primero las piezas largas: con los retazos salen las cortas.',
        },
        {
          titulo: 'Arma los dos costados',
          texto: 'En cada costado une dos patas con el travesaño corto arriba y la chambrana a 10 cm del piso. Pon cola, perfora con broca de 4 mm y atornilla.',
        },
        {
          titulo: 'Une los costados',
          texto: 'Atornilla los travesaños largos al frente y atrás, a ras con la parte de arriba de las patas. Revisa con la escuadra y mide diagonales.',
        },
        {
          titulo: 'Pon las tablas del asiento',
          texto: 'Reparte las tablas con la misma junta entre ellas, sobresaliendo 2 cm de las patas. Atornilla cada tabla a los travesaños cortos (y al centro si es larga).',
          consejo: 'Usa un retazo como separador para que todas las juntas queden iguales.',
        },
        {
          titulo: 'Lija y protege',
          texto: 'Lija toda la banca con grano 120, limpia el polvo y aplica dos manos de barniz marino si va al exterior.',
        },
      ],
    }
  },
}
