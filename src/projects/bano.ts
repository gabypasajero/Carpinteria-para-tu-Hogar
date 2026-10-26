import type { HerrajeUso, PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { cuerpo, puertas, repisas } from './kit'
import { barra, claveDim, exteriorDe, juntarHerrajes, pieza, repartir, seccion } from './util'

const CORTE_MELAMINA: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Pide el corte en la tienda con la lista de corte. Pega el tapacanto en todos los cantos indicados: en el baño ningún canto de melamina debe quedar a la vista.',
  consejo: 'Después de armar, sella con silicona neutra las uniones cercanas al agua.',
}

export const vanitorio: ProyectoDef = {
  id: 'vanitorio',
  nombre: 'Mueble vanitorio',
  descripcion: 'Mueble de baño de melamina 18 mm para lavamanos de sobreponer: espalda abierta para las cañerías, puertas con bisagra cazoleta y cubierta.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('vanitorio'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 120, step: 1, default: 70 },
    { id: 'alto', label: 'Alto (sin lavamanos)', unidad: 'cm', min: 75, max: 90, step: 1, default: 82 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 40, max: 50, step: 1, default: 45 },
    { id: 'base', label: 'Instalación', unidad: 'u', min: 0, max: 1, step: 1, default: 0, opciones: ['De piso con zócalo', 'Colgado al muro'] },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const colgado = params.base === 1
    const M = 'mel18'
    const t = 18
    const Z = colgado ? 0 : 100
    const Hc = H - t
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const add = (r: { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] }) => {
      piezas.push(...r.piezas)
      herrajes.push(...r.herrajes)
    }
    add(cuerpo({ W, H: Hc, z0: 0, z1: D, mat: M, zocalo: Z, techo: 'travesanos', paso: 1 }))
    piezas.push(pieza(claveDim('travInf', M, W - 2 * t, 100), 'Travesaño trasero inferior', M, [t, Z + t, 0], [W - t, Z + t + 100, t], 1))
    add(repisas({ x0: t, x1: W - t, y0: Z + t + 100, y1: Hc - t, z0: t + 150, z1: D - 20, n: 1, mat: M, paso: 2 }))
    add(puertas({ x0: 1.5, x1: W - 1.5, y0: Z + 3, y1: Hc - 3, zF: D, n: W > 500 ? 2 : 1, mat: M, paso: 3 }))
    piezas.push(pieza(claveDim('cubierta', M, W, D + t + 10), 'Cubierta', M, [0, Hc, 0], [W, H, D + t + 10], 4, { canto: W + 2 * (D + t + 10) }))
    herrajes.push({ id: 'escuadra', cantidad: colgado ? 4 : 2 }, { id: 't4x40', cantidad: 4 })
    const avisos = ['Calado del lavamanos: marca con la plantilla del fabricante y corta con caladora. El lavamanos y la grifería no están en el presupuesto.']
    if (colgado) avisos.push('Colgado: fíjalo con 4 escuadras a muro sólido o a pies derechos, con la cubierta a unos 85 cm del piso.')
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        {
          titulo: 'Arma el cuerpo',
          texto: `Atornilla la base${Z ? ', el zócalo' : ''}, los travesaños superiores y el travesaño trasero inferior entre los laterales. La espalda queda abierta para las cañerías.`,
          consejo: 'Presenta el mueble en su lugar antes de seguir: revisa que el desagüe y las llaves queden libres.',
        },
        { titulo: 'Repisa', texto: 'La repisa va retirada 15 cm hacia adelante para dejar paso al sifón. Perfora los soportes y apóyala.' },
        {
          titulo: 'Puertas',
          texto: 'Perfora las cazoletas de 35 mm, atornilla las bisagras a las puertas y luego a los laterales. Regula las juntas.',
        },
        {
          titulo: 'Cubierta y lavamanos',
          texto: 'Cala la cubierta según la plantilla del lavamanos, sella el canto del calado con silicona, atorníllala desde abajo y fija el mueble al muro.',
          consejo: 'Sella con silicona todo el contorno del lavamanos y la unión de la cubierta con el muro.',
        },
      ],
    }
  },
}

export const repisaWc: ProyectoDef = {
  id: 'repisa_wc',
  nombre: 'Repisa sobre WC',
  descripcion: 'Mueble de melamina que aprovecha el espacio sobre el WC: dos laterales altos de piso y repisas fijas desde 1 m de altura.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('repisa_wc'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 60, max: 90, step: 1, default: 70, ayuda: 'El hueco interior debe dejar al menos 5 cm por lado al estanque.' },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 160, max: 200, step: 1, default: 180 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 18, max: 30, step: 1, default: 22 },
    { id: 'niveles', label: 'Repisas', unidad: 'u', min: 2, max: 4, step: 1, default: 3 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const n = params.niveles
    const M = 'mel15'
    const t = 15
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - t]) piezas.push(pieza(k('lateral', H, D), 'Lateral', M, [x, 0, 0], [x + t, H, D], 1, { canto: 2 * H + D }))
    piezas.push(pieza(k('travesano', W - 2 * t, 100), 'Travesaño trasero', M, [t, 850, 0], [W - t, 950, t], 1, { canto: W - 2 * t }))
    const ys = [1000, ...repartir(1000 + t, H - t, n - 2, t), H - t]
    for (const y of ys) piezas.push(pieza(k('repisa', W - 2 * t, D), y === H - t ? 'Techo' : 'Repisa', M, [t, y, 0], [W - t, y + t, D], 2, { canto: 2 * (W - 2 * t) }))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Hueco libre para el WC: ${(W - 2 * t) / 10} cm de ancho y 85 cm de alto. Fija el mueble al muro con dos escuadras.`],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: ys.length * 4 + 4 },
        { id: 'escuadra', cantidad: 2 },
      ]),
      pasos: [
        CORTE_MELAMINA,
        { titulo: 'Travesaño trasero', texto: 'Atornilla el travesaño trasero entre los laterales a 85 cm del piso: da rigidez y queda oculto por el estanque.' },
        {
          titulo: 'Repisas y techo',
          texto: 'Atornilla las repisas entre los laterales, la primera a 1 m del piso y el techo a ras arriba. Revisa con la escuadra, para el mueble sobre el WC y fíjalo al muro.',
          consejo: 'Sella con silicona los cantos inferiores de los laterales antes de apoyarlos en el piso del baño.',
        },
      ],
    }
  },
}

export const toallero: ProyectoDef = {
  id: 'toallero',
  nombre: 'Toallero escalera',
  descripcion: 'Escalera toallera de pino que se apoya en el muro inclinada 10°, con largueros 1×3 y peldaños 1×2.',
  plan: 'pro',
  horas: '2 a 3 horas',
  ...ficha('toallero'),
  params: [
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 120, max: 180, step: 1, default: 160 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 35, max: 60, step: 1, default: 45 },
    { id: 'peldanos', label: 'Peldaños', unidad: 'u', min: 3, max: 7, step: 1, default: 5 },
  ],
  construir(params) {
    const H = params.alto * 10
    const W = params.ancho * 10
    const n = params.peldanos
    const [lA, lE] = seccion('pc1x3')
    const [pA, pE] = seccion('pc1x2')
    const ang = (10 * Math.PI) / 180
    const zt = 40
    const y0 = 6
    const zb = zt + (H - 2 * y0) * Math.tan(ang)
    const piezas: PiezaInstancia[] = []
    for (const x of [lE / 2, W - lE / 2]) piezas.push(barra('larguero', 'Larguero', 'pc1x3', [x, y0, zb], [x, H - y0, zt], 'zy', [lA, lE], 1, { nota: 'extremos a 10°' }))
    const ys = repartir(250, H - 120, n - 1, pE).concat([H - 120])
    for (const y of ys) {
      const zc = zb + ((zt - zb) * (y - y0)) / (H - 2 * y0)
      piezas.push(pieza(claveDim('peldano', 'pc1x2', W - 2 * lE, 0), 'Peldaño', 'pc1x2', [lE, y, zc - pA / 2], [W - lE, y + pE, zc + pA / 2], 2))
    }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Apóyala en un muro firme y pon fieltro bajo las patas para que no resbale.'],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: n * 2 },
        { id: 'tarugo8', cantidad: n * 2 },
        { id: 'cola', cantidad: 1 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: [
        { titulo: 'Corta y prepara las piezas', texto: 'Corta los dos largueros con los extremos a 10° (paralelos entre sí) y los peldaños. Lija todo con grano 120.' },
        { titulo: 'Prepara los largueros', texto: 'Junta los dos largueros y marca juntos las alturas de los peldaños para que queden iguales.' },
        {
          titulo: 'Une los peldaños',
          texto: 'Encola cada peldaño y fíjalo con un tarugo y un tornillo por lado desde el exterior del larguero. Barniza con barniz marino por la humedad del baño.',
          consejo: 'Tapa las cabezas de los tornillos con tarugos de madera para un mejor acabado.',
        },
      ],
    }
  },
}

export const BANO: ProyectoDef[] = [vanitorio, repisaWc, toallero]
