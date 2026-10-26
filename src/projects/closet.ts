import type { PiezaInstancia, ProyectoDef } from '../core/types'
import { aMm, bisagrasPorPuerta, clavosRespaldo, juntarHerrajes, pieza, repartir } from './util'

const M = 'mel15'
const R = 'hdf3'
const t = 15
const r = 3
const ZOCALO = 70
const JUNTA = 3
const MALETERO = 350

export const closet: ProyectoDef = {
  id: 'closet',
  nombre: 'Closet dos puertas',
  descripcion: 'Closet de melamina con un lado de repisas y otro con barra para colgar y maletero.',
  categoria: 'dormitorio',
  plan: 'pro',
  dificultad: 3,
  horas: '1 a 2 días',
  herramientas: ['Taladro atornillador', 'Broca 3 mm y 5 mm', 'Broca Forstner 35 mm (bisagras)', 'Huincha de medir', 'Escuadra', 'Nivel', 'Plancha (para tapacanto)', 'Martillo', 'Ayudante (para levantarlo)'],
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 80, max: 180, step: 1, default: 120 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 160, max: 240, step: 1, default: 200 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 45, max: 60, step: 1, default: 55 },
    { id: 'repisas', label: 'Repisas lado izquierdo', unidad: 'u', min: 2, max: 7, step: 1, default: 4 },
  ],
  construir(params) {
    const { ancho: W, alto: H, fondo: D, repisas: n } = aMm(params, ['ancho', 'alto', 'fondo'])
    const piezas: PiezaInstancia[] = []
    const avisos: string[] = []

    piezas.push(pieza('lateral', 'Lateral', M, [0, 0, r], [t, H, D], 1, { canto: H }))
    piezas.push(pieza('lateral', 'Lateral', M, [W - t, 0, r], [W, H, D], 1, { canto: H }))
    piezas.push(pieza('horizontal', 'Base / techo', M, [t, ZOCALO, r], [W - t, ZOCALO + t, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza('zocalo', 'Zócalo', M, [t, 0, D - 20 - t], [W - t, ZOCALO, D - 20], 1, { canto: W - 2 * t }))
    piezas.push(pieza('horizontal', 'Base / techo', M, [t, H - t, r], [W - t, H, D], 2, { canto: W - 2 * t }))

    const b = (W - 3 * t) / 2
    const xDiv = t + b
    piezas.push(pieza('division', 'División central', M, [xDiv, ZOCALO + t, r], [xDiv + t, H - t, D], 3, { canto: H - 2 * t - ZOCALO }))
    piezas.push(pieza('respaldo', 'Respaldo', R, [0, 0, 0], [W, H, r], 4))

    // Lado izquierdo: repisas regulables.
    for (const y of repartir(ZOCALO + t, H - t, n, t)) {
      piezas.push(pieza('repisa', 'Repisa', M, [t + 1, y, r], [xDiv - 1, y + t, D - 20], 5, { canto: b - 2 }))
    }
    // Lado derecho: maletero arriba y barra de colgar bajo él.
    const yMal = H - t - MALETERO - t
    piezas.push(pieza('repisa', 'Repisa', M, [xDiv + t + 1, yMal, r], [W - t - 1, yMal + t, D - 20], 5, { canto: b - 2 }))
    const espacioColgar = yMal - (ZOCALO + t)
    if (espacioColgar < 1000) avisos.push(`Quedan ${Math.round(espacioColgar / 10)} cm para colgar: sirve para camisas, no para vestidos ni abrigos largos.`)

    const yP = [ZOCALO, H - 2]
    const anchoPuerta = (W - 4 - JUNTA) / 2
    const altoPuerta = yP[1] - yP[0]
    const cantoPuerta = 2 * (anchoPuerta + altoPuerta)
    piezas.push(pieza('puerta', 'Puerta', M, [2, yP[0], D], [2 + anchoPuerta, yP[1], D + t], 6, { canto: cantoPuerta }))
    piezas.push(pieza('puerta', 'Puerta', M, [W - 2 - anchoPuerta, yP[0], D], [W - 2, yP[1], D + t], 6, { canto: cantoPuerta }))

    if (b > 800) avisos.push('Los huecos superan 80 cm: las repisas de 15 mm pueden curvarse.')
    if (anchoPuerta > 600) avisos.push('Puertas de más de 60 cm de ancho son pesadas: considera 4 puertas o bisagras extra.')
    avisos.push('Fija el closet al muro con dos escuadras en el techo para evitar que se vuelque.')

    const bisagras = 2 * bisagrasPorPuerta(altoPuerta)
    return {
      piezas,
      exterior: [W, H, D + t],
      avisos,
      herrajes: juntarHerrajes([
        { id: 'tornillo4x40', cantidad: 8 + 8 + 6 + 4 },
        { id: 'tornillo35x16', cantidad: bisagras * 4 },
        { id: 'bisagraCazoleta', cantidad: bisagras },
        { id: 'tirador', cantidad: 2 },
        { id: 'soporteRepisa', cantidad: (n + 1) * 4 },
        { id: 'barraCloset', cantidad: Math.ceil(b / 1000) },
        { id: 'clavo1', cantidad: clavosRespaldo(W, H, 2 + n) },
        { id: 'cola', cantidad: 1 },
        { id: 'lija', cantidad: 1 },
      ]),
      pasos: [
        {
          titulo: 'Corta y prepara las piezas',
          texto: 'Pide el corte con la lista de corte y pega el tapacanto. Arma el closet acostado en el piso, sobre un cartón, en la pieza donde quedará: de pie puede no pasar por la puerta.',
          consejo: 'Calcula la diagonal del closet: debe ser menor que la altura del cielo para poder pararlo.',
        },
        {
          titulo: 'Arma el cuerpo',
          texto: 'Atornilla la base entre los laterales a 7 cm del piso y el zócalo bajo la base, 2 cm hacia adentro.',
        },
        {
          titulo: 'Pon el techo',
          texto: 'Atornilla el techo entre los laterales, a ras arriba. Revisa la escuadra.',
        },
        {
          titulo: 'Pon la división central',
          texto: 'Mide el centro sobre base y techo, marca y atornilla la división desde arriba y desde abajo.',
        },
        {
          titulo: 'Clava el respaldo',
          texto: 'Con el closet acostado boca abajo, mide diagonales y clava el respaldo cada 10 cm, también sobre la división. Luego, entre dos personas, ponlo de pie.',
        },
        {
          titulo: 'Repisas, maletero y barra',
          texto: `Perfora los agujeros de los soportes y pon las repisas a la izquierda. A la derecha pon el maletero a ${MALETERO / 10} cm del techo y la barra 5 cm bajo él.`,
        },
        {
          titulo: 'Instala las puertas',
          texto: `Perfora las cazoletas de 35 mm en cada puerta (${bisagrasPorPuerta(altoPuerta)} por puerta, repartidas). Cuelga las puertas y regula las bisagras hasta que la junta del centro quede pareja. Pon los tiradores y fija el closet al muro.`,
        },
      ],
    }
  },
}
