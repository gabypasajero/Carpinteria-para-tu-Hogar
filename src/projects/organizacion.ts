import type { HerrajeUso, PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { lis, mesa, puertas, repisas, respaldo, tablero } from './kit'
import { cada, claveDim, exteriorDe, juntarHerrajes, mover, pieza, seccion } from './util'

const CORTE: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte (o pide el corte en la tienda), lija o tapacanta los cantos y marca cada pieza con su letra.',
  consejo: 'Revisa las medidas de la primera pieza de cada letra antes de cortar el resto.',
}

export const perchero: ProyectoDef = {
  id: 'perchero',
  nombre: 'Perchero con banca de entrada',
  descripcion: 'Mueble de entrada: banca de pino para sentarse y calzarse, panel de terciado para colgadores y repisa superior.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('perchero'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 60, max: 150, step: 1, default: 100 },
    { id: 'alto', label: 'Alto total', unidad: 'cm', min: 160, max: 200, step: 1, default: 180 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const [p] = seccion('pc2x2')
    const banca = mesa({
      L: W,
      W: 350,
      H: 450,
      pata: { mat: 'pc2x2', ax: p, az: p },
      retiro: 20,
      faldon: { mat: 'pc1x4' },
      cubierta: { mat: 'pc1x4', tipo: 'tablas', junta: 5 },
      pasos: { patas: 1, faldones: 1, cubierta: 2 },
    })
    const piezas: PiezaInstancia[] = [
      ...mover(banca.piezas, [0, 0, 15]),
      ...tablero('panel', 'Panel de colgadores', 'terc15', [0, 500, 0], [W, H - 150, 15], 3),
      ...tablero('repisa', 'Repisa superior', 'terc15', [0, H - 150, 0], [W, H - 135, 250], 3),
    ]
    const tablas = banca.piezas.filter((x) => x.nombre === 'Tabla de cubierta').length
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Colgadores metálicos aparte: caben unos ${Math.max(2, Math.floor(W / 200))} (uno cada 20 cm).`],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 16 + tablas * 4 + Math.ceil(W / 300) * 2 },
        { id: 'escuadra', cantidad: 2 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Base de la banca', texto: 'Une los faldones a las patas con cola y dos tornillos por unión. Revisa las diagonales.' },
        { titulo: 'Asiento', texto: 'Atornilla las tablas del asiento con 5 mm de junta. Redondea con lija las esquinas.' },
        {
          titulo: 'Panel y repisa',
          texto: 'Atornilla el panel al muro (a pies derechos o con tarugos) a 50 cm del piso, apoya la repisa sobre su canto superior y fíjala con dos escuadras. Atornilla los colgadores.',
          consejo: 'Pon los colgadores a dos alturas (adultos y niños) si la entrada es familiar.',
        },
      ],
    }
  },
}

export const lavadero: ProyectoDef = {
  id: 'lavadero',
  nombre: 'Mueble sobre lavadora',
  descripcion: 'Mueble de melamina 18 mm que enmarca la lavadora: laterales de piso a techo y un mueble superior con puertas y repisa.',
  plan: 'pro',
  horas: '5 a 8 horas',
  ...ficha('lavadero'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 65, max: 90, step: 1, default: 70, ayuda: 'Interior mínimo 61 cm para una lavadora estándar.' },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 180, max: 220, step: 1, default: 200 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 55, max: 70, step: 1, default: 65 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const M = 'mel18'
    const t = 18
    const Y1 = 1000
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const add = (r: { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] }) => {
      piezas.push(...r.piezas)
      herrajes.push(...r.herrajes)
    }
    for (const x of [0, W - t]) piezas.push(pieza(k('lateral', H, D - 3), 'Lateral', M, [x, 0, 3], [x + t, H, D], 1, { canto: H }))
    piezas.push(pieza(k('horizontal', W - 2 * t, D - 3), 'Piso del mueble / techo', M, [t, Y1, 3], [W - t, Y1 + t, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza(k('horizontal', W - 2 * t, D - 3), 'Piso del mueble / techo', M, [t, H - t, 3], [W - t, H, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza(k('travesano', W - 2 * t, 100), 'Travesaño trasero', M, [t, Y1 - 100, 3], [W - t, Y1, 3 + t], 1))
    add(respaldo({ x0: 0, x1: W, y0: Y1, y1: H, paso: 2 }))
    add(repisas({ x0: t, x1: W - t, y0: Y1 + t, y1: H - t, z0: 3, z1: D - 10, n: 1, mat: M, paso: 3 }))
    add(puertas({ x0: 1.5, x1: W - 1.5, y0: Y1 + 1.5, y1: H - 1.5, zF: D, n: W > 600 ? 2 : 1, mat: M, paso: 3 }))
    herrajes.push({ id: 't4x40', cantidad: 12 }, { id: 'escuadra', cantidad: 2 })
    const avisos = ['Zona húmeda: sella con silicona los cantos inferiores de los laterales y fija el mueble al muro con dos escuadras.']
    if (W - 2 * t < 610) avisos.push('El hueco interior queda bajo 61 cm: revisa el ancho de tu lavadora.')
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE,
        { titulo: 'Arma el cuerpo', texto: 'Atornilla el piso del mueble a 1 m del piso con el travesaño trasero debajo, y el techo a ras arriba.' },
        { titulo: 'Respaldo superior', texto: 'Clava el respaldo solo en el mueble superior: abajo la lavadora necesita espacio para mangueras.' },
        { titulo: 'Repisa y puertas', texto: 'Apoya la repisa en sus soportes, pon las puertas con bisagras cazoleta y fija el mueble al muro.' },
      ],
    }
  },
}

export const panelHerramientas: ProyectoDef = {
  id: 'panel_herramientas',
  nombre: 'Panel de herramientas',
  descripcion: 'Panel de terciado separado del muro con listones, para colgar herramientas con ganchos o clavos y tenerlas a la vista.',
  plan: 'pro',
  horas: '2 a 3 horas',
  ...ficha('panel_herramientas'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 60, max: 240, step: 1, default: 120 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 50, max: 120, step: 1, default: 80 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const [lA, lE] = seccion('pc1x2')
    const xs = cada(0, W, lA, 400)
    const piezas: PiezaInstancia[] = []
    for (const x of xs) piezas.push(...lis('separador', 'Listón separador', 'pc1x2', [x, 0, 0], 1, H, 0, 1))
    piezas.push(...tablero('panel', 'Panel', 'terc12', [0, 0, lE], [W, H, lE + 12], 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Si usarás ganchos de pegboard, perfora una grilla de agujeros de 6 mm cada 25 mm antes de instalar. Los ganchos no están en el presupuesto.'],
      herrajes: juntarHerrajes([{ id: 't4x50', cantidad: xs.length * 3 + xs.length * Math.ceil(H / 200) }]),
      pasos: [
        CORTE,
        { titulo: 'Fija los separadores', texto: `Atornilla los ${xs.length} listones separadores al muro, verticales y cada 40 cm como máximo, revisando con el nivel.` },
        {
          titulo: 'Atornilla el panel',
          texto: 'Atornilla el panel a los separadores cada 20 cm. El espacio de 2 cm detrás deja pasar los ganchos.',
          consejo: 'Dibuja la silueta de cada herramienta en el panel: sabrás qué falta de un vistazo.',
        },
      ],
    }
  },
}

export const ORGANIZACION: ProyectoDef[] = [perchero, lavadero, panelHerramientas]
