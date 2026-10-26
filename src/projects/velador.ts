import type { PiezaInstancia, ProyectoDef } from '../core/types'
import { aMm, clavosRespaldo, juntarHerrajes, pieza } from './util'

const M = 'mel15'
const R = 'hdf3'
const t = 15
const r = 3
const ZOCALO = 50
const JUNTA = 3
/** Espacio que ocupa cada corredera telescópica por lado. */
const CORREDERA = 13

export const velador: ProyectoDef = {
  id: 'velador',
  nombre: 'Velador con cajones',
  descripcion: 'Velador de melamina con 1 a 3 cajones sobre correderas telescópicas.',
  categoria: 'dormitorio',
  plan: 'gratis',
  dificultad: 2,
  horas: '5 a 6 horas',
  herramientas: ['Taladro atornillador', 'Broca 3 mm', 'Huincha de medir', 'Escuadra', 'Martillo', 'Plancha (para tapacanto)', 'Cuchillo cartonero', 'Nivel'],
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 35, max: 60, step: 1, default: 45 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 40, max: 75, step: 1, default: 55 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 38, max: 55, step: 1, default: 40, ayuda: 'Desde 47 cm usa correderas de 45 cm.' },
    { id: 'cajones', label: 'Cajones', unidad: 'u', min: 1, max: 3, step: 1, default: 2 },
  ],
  construir(params) {
    const { ancho: W, alto: H, fondo: D, cajones: n } = aMm(params, ['ancho', 'alto', 'fondo'])
    const piezas: PiezaInstancia[] = []
    const avisos: string[] = []

    // Cuerpo
    piezas.push(pieza('lateral', 'Lateral', M, [0, 0, r], [t, H - t, D], 1, { canto: H - t }))
    piezas.push(pieza('lateral', 'Lateral', M, [W - t, 0, r], [W, H - t, D], 1, { canto: H - t }))
    piezas.push(pieza('base', 'Base', M, [t, ZOCALO, r], [W - t, ZOCALO + t, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza('zocalo', 'Zócalo', M, [t, 0, D - 20 - t], [W - t, ZOCALO, D - 20], 1, { canto: W - 2 * t }))
    piezas.push(pieza('cubierta', 'Cubierta', M, [0, H - t, r], [W, H, D + t], 2, { canto: W + 2 * (D + t - r) }))
    piezas.push(pieza('respaldo', 'Respaldo', R, [0, 0, 0], [W, H - t, r], 3))

    // Cajones: frentes superpuestos que cubren desde el zócalo hasta la cubierta.
    const altoFrentes = H - t - ZOCALO
    const fh = (altoFrentes - n * JUNTA) / n
    const largoCorredera = D - r - 10 >= 450 ? 450 : 350
    const cw = W - 2 * t - 2 * CORREDERA
    const ch = Math.min(fh - 40, 200)
    if (ch < 60) avisos.push('Los cajones quedan muy bajos: sube el alto o usa menos cajones.')

    for (let i = 0; i < n; i++) {
      const y0 = ZOCALO + i * (fh + JUNTA)
      piezas.push(pieza('frente', 'Frente de cajón', M, [2, y0, D], [W - 2, y0 + fh, D + t], 5, { canto: 2 * (W - 4 + fh) }))
      const yb = y0 + 15
      const x0 = t + CORREDERA
      const zf = D - largoCorredera
      piezas.push(pieza('cajLateral', 'Lateral de cajón', M, [x0, yb + r, zf], [x0 + t, yb + r + ch, D], 4, { canto: largoCorredera }))
      piezas.push(pieza('cajLateral', 'Lateral de cajón', M, [x0 + cw - t, yb + r, zf], [x0 + cw, yb + r + ch, D], 4, { canto: largoCorredera }))
      piezas.push(pieza('cajTapa', 'Tapa delantera / trasera de cajón', M, [x0 + t, yb + r, D - t], [x0 + cw - t, yb + r + ch, D], 4, { canto: cw - 2 * t }))
      piezas.push(pieza('cajTapa', 'Tapa delantera / trasera de cajón', M, [x0 + t, yb + r, zf], [x0 + cw - t, yb + r + ch, zf + t], 4, { canto: cw - 2 * t }))
      piezas.push(pieza('cajFondo', 'Fondo de cajón', R, [x0, yb, zf], [x0 + cw, yb + r, D], 4))
    }

    return {
      piezas,
      exterior: [W, H, D + t],
      avisos,
      herrajes: juntarHerrajes([
        { id: 'tornillo4x40', cantidad: 10 + n * 12 },
        { id: 'tornillo35x16', cantidad: n * 12 },
        { id: largoCorredera === 450 ? 'corredera450' : 'corredera350', cantidad: n },
        { id: 'tirador', cantidad: n },
        { id: 'clavo1', cantidad: clavosRespaldo(W, H, 1) + n * 14 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija', cantidad: 1 },
      ]),
      pasos: [
        {
          titulo: 'Corta y prepara las piezas',
          texto: 'Pide el corte con la lista de corte. Pega el tapacanto en los cantos indicados. Separa las piezas del cuerpo de las de los cajones.',
        },
        {
          titulo: 'Arma el cuerpo',
          texto: 'Atornilla la base entre los laterales a 5 cm del piso y el zócalo bajo la base, 2 cm hacia adentro. Perfora siempre antes con broca de 3 mm.',
        },
        {
          titulo: 'Pon la cubierta',
          texto: 'La cubierta va encima de los laterales y sobresale 1,5 cm hacia adelante para quedar a ras con los frentes. Atornilla desde abajo o desde arriba con tornillo escondido.',
        },
        {
          titulo: 'Clava el respaldo',
          texto: 'Comprueba que las diagonales midan lo mismo y clava el respaldo cada 10 cm.',
        },
        {
          titulo: 'Arma los cajones y monta las correderas',
          texto: `Arma cada caja con las tapas entre los laterales y clava el fondo por debajo. Separa la corredera: la parte fija va al lateral del mueble y la móvil a la caja, ambas a la misma altura y a ras del frente. Correderas de ${largoCorredera / 10} cm.`,
          consejo: 'Monta las correderas con el mueble acostado: es más fácil dejarlas paralelas.',
        },
        {
          titulo: 'Pon los frentes y tiradores',
          texto: 'Fija cada frente a su caja con 4 tornillos desde dentro, dejando 3 mm de junta entre frentes. Perfora y pon los tiradores al centro.',
          consejo: 'Pega el frente con cinta doble contacto, abre el cajón y atorníllalo desde adentro: así queda alineado.',
        },
      ],
    }
  },
}
