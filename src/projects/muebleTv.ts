import type { PiezaInstancia, ProyectoDef } from '../core/types'
import { aMm, bisagrasPorPuerta, clavosRespaldo, juntarHerrajes, pieza } from './util'
import { ficha } from './ficha'

const M = 'mel18c'
const R = 'hdf3'
const t = 18
const r = 3
const ZOCALO = 60
const JUNTA = 3

export const muebleTv: ProyectoDef = {
  id: 'mueble-tv',
  nombre: 'Mueble TV',
  descripcion: 'Rack de TV en melamina color roble con nicho central abierto y dos puertas.',
  plan: 'pro',
  ...ficha('mueble_tv'),
  horas: '6 a 8 horas',
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 100, max: 220, step: 1, default: 150 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 40, max: 70, step: 1, default: 50 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 30, max: 50, step: 1, default: 40 },
  ],
  construir(params) {
    const { ancho: W, alto: H, fondo: D } = aMm(params, ['ancho', 'alto', 'fondo'])
    const piezas: PiezaInstancia[] = []
    const avisos: string[] = []
    const veta = true

    piezas.push(pieza('lateral', 'Lateral', M, [0, 0, r], [t, H - t, D], 1, { canto: H - t, veta }))
    piezas.push(pieza('lateral', 'Lateral', M, [W - t, 0, r], [W, H - t, D], 1, { canto: H - t, veta }))
    piezas.push(pieza('base', 'Base', M, [t, ZOCALO, r], [W - t, ZOCALO + t, D], 1, { canto: W - 2 * t, veta }))
    piezas.push(pieza('zocalo', 'Zócalo', M, [t, 0, D - 20 - t], [W - t, ZOCALO, D - 20], 1, { canto: W - 2 * t, veta }))

    // Tres huecos iguales: puerta, nicho abierto, puerta.
    const b = (W - 4 * t) / 3
    const xDiv = [t + b, 2 * t + 2 * b]
    for (const x of xDiv) {
      piezas.push(pieza('division', 'División', M, [x, ZOCALO + t, r], [x + t, H - t, D], 2, { canto: H - t - ZOCALO - t }))
    }
    piezas.push(pieza('cubierta', 'Cubierta', M, [0, H - t, r], [W, H, D + t], 3, { canto: W + 2 * (D + t - r), veta }))
    piezas.push(pieza('respaldo', 'Respaldo', R, [0, 0, 0], [W, H - t, r], 4))

    const yRep = (ZOCALO + t + H - t) / 2 - t / 2
    for (const x0 of [t, xDiv[0] + t, xDiv[1] + t]) {
      piezas.push(pieza('repisa', 'Repisa', M, [x0 + 1, yRep, r], [x0 + b - 1, yRep + t, D - 20], 5, { canto: b - 2, veta }))
    }

    // Puertas superpuestas: cubren el lateral y la mitad de la división.
    const anchoPuerta = t + b + t / 2 - JUNTA / 2 - 2
    const yP = [ZOCALO, H - t - JUNTA]
    piezas.push(pieza('puerta', 'Puerta', M, [2, yP[0], D], [2 + anchoPuerta, yP[1], D + t], 6, { canto: 2 * (anchoPuerta + yP[1] - yP[0]), veta }))
    piezas.push(pieza('puerta', 'Puerta', M, [W - 2 - anchoPuerta, yP[0], D], [W - 2, yP[1], D + t], 6, { canto: 2 * (anchoPuerta + yP[1] - yP[0]), veta }))

    if (b > 800) avisos.push('Los huecos superan 80 cm: las repisas pueden curvarse con peso.')
    avisos.push('Haz una perforación de 6 cm en el respaldo del nicho central para pasar los cables.')

    const bisagras = 2 * bisagrasPorPuerta(yP[1] - yP[0])
    return {
      piezas,
      exterior: [W, H, D + t],
      avisos,
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: 8 + 8 + 8 },
        { id: 't35x16', cantidad: bisagras * 4 },
        { id: 'bisagra', cantidad: bisagras },
        { id: 'tirador', cantidad: 2 },
        { id: 'soporte', cantidad: 12 },
        { id: 'clavo1', cantidad: clavosRespaldo(W, H, 3) },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 1 },
      ]),
      pasos: [
        {
          titulo: 'Corta y prepara las piezas',
          texto: 'Pide el corte respetando la veta (las piezas marcadas con veta no se pueden girar en la plancha). Pega el tapacanto en los cantos visibles.',
        },
        {
          titulo: 'Arma el cuerpo',
          texto: 'Atornilla la base entre los laterales a 6 cm del piso y el zócalo bajo la base, 2 cm hacia adentro.',
        },
        {
          titulo: 'Pon las divisiones',
          texto: `Marca sobre la base los tres huecos iguales de ${Math.round(b) / 10} cm y atornilla las divisiones desde abajo.`,
          consejo: 'Corta un retazo del ancho exacto del hueco y úsalo como separador al fijar las divisiones.',
        },
        {
          titulo: 'Pon la cubierta',
          texto: 'La cubierta apoya sobre laterales y divisiones y sobresale 1,8 cm al frente para quedar a ras con las puertas. Atornilla a laterales y divisiones.',
        },
        {
          titulo: 'Clava el respaldo',
          texto: 'Mide diagonales y clava el respaldo. Antes, haz la perforación para cables en el centro con la sierra copa.',
        },
        {
          titulo: 'Pon las repisas',
          texto: 'Perfora agujeros de 5 mm para los soportes en cada hueco a la misma altura y apoya las repisas.',
        },
        {
          titulo: 'Instala las puertas',
          texto: 'Perfora las cazoletas de 35 mm a 2 cm del borde de cada puerta (a 10 cm de arriba y de abajo). Atornilla las bisagras a la puerta y luego al lateral. Regula los tornillos de la bisagra hasta que las juntas queden parejas.',
          consejo: 'Cubre la broca Forstner con cinta a 12 mm de la punta para no atravesar la puerta.',
        },
      ],
    }
  },
}
