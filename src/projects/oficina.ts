import type { HerrajeUso, PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { columnaCajones, correderaPara, lis, mesa, tablero } from './kit'
import { barra, claveDim, exteriorDe, juntarHerrajes, pieza, seccion } from './util'

const CORTE_PINO: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte, lija los cantos con grano 120 y marca cada pieza con su letra en una cara que no se vea.',
  consejo: 'Con ingletadora, fija un tope para cortar todas las piezas iguales del mismo largo.',
}
const CORTE_TABLERO: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Pide el corte en la tienda con la lista de corte. Si es melamina, pega el tapacanto en los cantos indicados; si es terciado, lija los cantos y redondea las esquinas.',
  consejo: 'Marca cada pieza con su letra con lápiz grafito en una cara que no se vea.',
}

// ---------------------------------------------------------------------------------------------
export const escritorio: ProyectoDef = {
  id: 'escritorio',
  nombre: 'Escritorio',
  descripcion: 'Escritorio de melamina 18 mm con laterales de piso, faldón de recato y cajonera opcional de tres cajones.',
  plan: 'pro',
  horas: '5 a 8 horas',
  ...ficha('escritorio'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 90, max: 180, step: 1, default: 120 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 50, max: 75, step: 1, default: 60 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 73, max: 76, step: 1, default: 75 },
    { id: 'cajonera', label: 'Cajonera', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Sin cajonera', 'Con cajonera de 3 cajones'] },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const H = params.alto * 10
    const conCaj = params.cajonera === 1
    const M = 'mel18'
    const t = 18
    const Db = D - t
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const xi = L - t - 400
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    for (const x of [0, L - t]) piezas.push(pieza(k('lateral', H - t, Db), 'Lateral', M, [x, 0, 0], [x + t, H - t, Db], 1, { canto: H - t }))
    const finFaldon = conCaj ? xi : L - t
    piezas.push(pieza(k('faldon', finFaldon - t, 300), 'Faldón de recato', M, [t, H - t - 300, 50], [finFaldon, H - t, 50 + t], 1))
    if (conCaj) {
      piezas.push(pieza(k('divCaj', H - t, Db), 'Lateral de cajonera', M, [xi, 0, 0], [xi + t, H - t, Db], 2, { canto: H - t }))
      piezas.push(pieza(k('baseCaj', L - t - xi - t, Db), 'Base de cajonera', M, [xi + t, 50, 0], [L - t, 50 + t, Db], 2, { canto: L - 2 * t - xi }))
      piezas.push(pieza(k('zocaloCaj', L - t - xi - t, 50), 'Zócalo de cajonera', M, [xi + t, 0, Db - 20 - t], [L - t, 50, Db - 20], 2))
      const prof = correderaPara(Db - 10) ?? 350
      const cc = columnaCajones({ x0: xi + t, x1: L - t, fx0: xi + 2, fx1: L - 2, y0: 50 + t - 15, y1: H - t - 2, zF: Db, prof, mat: M, paso: 4, pasoFrente: 4, n: 3 })
      piezas.push(...cc.piezas)
      herrajes.push(...cc.herrajes)
    }
    piezas.push(pieza(k('cubierta', L, D), 'Cubierta', M, [0, H - t, 0], [L, H, D], 3, { canto: L + 2 * D }))
    herrajes.push({ id: 't4x40', cantidad: 12 + (conCaj ? 12 : 0) }, { id: 'escuadra', cantidad: 4 }, { id: 'cola', cantidad: 1 })
    const pasos: PasoGuia[] = [
      CORTE_TABLERO,
      { titulo: 'Laterales y faldón', texto: 'Atornilla el faldón de recato entre los laterales, 5 cm hacia adentro desde atrás. Revisa con la escuadra.' },
      {
        titulo: 'Cuerpo de la cajonera',
        texto: 'Atornilla la base de la cajonera a 5 cm del piso entre su lateral y el lateral derecho, con el zócalo debajo.',
      },
      { titulo: 'Cubierta', texto: 'Apoya la cubierta y fíjala desde abajo con escuadras metálicas (dos por lateral) y tornillos de 16 mm.' },
      {
        titulo: 'Cajones',
        texto: 'Arma los cajones, monta las correderas y pon los frentes con 3 mm de junta y los tiradores.',
        consejo: 'Monta las correderas antes de poner la cubierta si te resulta más cómodo.',
      },
    ]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: L > 1500 ? ['Con más de 1,5 m, la cubierta de 18 mm puede flectarse con peso: atornilla el faldón también a la cubierta.'] : [],
      herrajes: juntarHerrajes(herrajes),
      pasos: conCaj ? pasos : [pasos[0], pasos[1], { titulo: 'Revisa la escuadra', texto: 'Mide las diagonales del conjunto antes de poner la cubierta: deben ser iguales.' }, pasos[3]],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const escritorioMuro: ProyectoDef = {
  id: 'escritorio_muro',
  nombre: 'Escritorio plegable de muro',
  descripcion: 'Caja de terciado que se atornilla al muro con una tabla abatible que se convierte en escritorio, con dos patas plegables y una repisa interior.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('escritorio_muro'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 60, max: 110, step: 1, default: 80 },
    { id: 'fondo', label: 'Fondo de la tabla', unidad: 'cm', min: 40, max: 60, step: 1, default: 50 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const F = params.fondo * 10
    const M = 'terc15'
    const t = 15
    const P = 60
    const yb = 735
    const Hb = F + 60
    const [p] = seccion('pc2x2')
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const piezas: PiezaInstancia[] = [
      ...tablero('fondoCaja', 'Fondo de la caja', M, [0, yb, 0], [W, yb + Hb, t], 1),
      pieza(k('costado', Hb, P), 'Costado', M, [0, yb, t], [t, yb + Hb, t + P], 1),
      pieza(k('costado', Hb, P), 'Costado', M, [W - t, yb, t], [W, yb + Hb, t + P], 1),
      pieza(k('horizontal', W - 2 * t, P), 'Base / techo de la caja', M, [t, yb, t], [W - t, yb + t, t + P], 1),
      pieza(k('horizontal', W - 2 * t, P), 'Base / techo de la caja', M, [t, yb + Hb - t, t], [W - t, yb + Hb, t + P], 1),
      pieza(k('repisaCaja', W - 2 * t, P - 15), 'Repisa interior', M, [t, yb + Hb / 2, t], [W - t, yb + Hb / 2 + t, t + P - 15], 2),
      ...tablero('tabla', 'Tabla abatible', M, [t, yb, t + P], [W - t, yb + t, t + P + F], 3),
    ]
    for (const x of [30, W - 30 - p]) piezas.push(...lis('pata', 'Pata plegable', 'pc2x2', [x, 0, t + P + F - 20 - p], 1, yb, 0, 4))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [
        'La tabla queda a 75 cm del piso. Plegada, tapa la caja y la repisa interior.',
        `Para abatir la tabla usa una bisagra de piano de ${(W - 2 * t) / 10} cm, y dos bisagras de mariposa para las patas (no están en el presupuesto).`,
      ],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: 24 },
        { id: 'escuadra', cantidad: 2 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
      ]),
      pasos: [
        CORTE_TABLERO,
        {
          titulo: 'Arma la caja',
          texto: 'Encola y atornilla los costados, la base y el techo sobre el fondo. Revisa que quede a escuadra.',
          consejo: 'Atornilla el fondo desde atrás cada 15 cm: es el que carga todo.',
        },
        { titulo: 'Repisa interior', texto: 'Atornilla la repisa interior a media altura, 1,5 cm más corta para que cierre la tabla.' },
        {
          titulo: 'Tabla abatible',
          texto: 'Une la tabla a la base de la caja con la bisagra de piano por la cara superior, de modo que al abrirse quede horizontal y a ras.',
        },
        {
          titulo: 'Patas y montaje',
          texto: 'Atornilla las patas bajo la tabla con bisagras de mariposa para que se plieguen. Fija la caja al muro con tarugos (o a pies derechos) y con dos escuadras bajo la base.',
          consejo: 'Revisa con el nivel que la tabla abierta quede horizontal antes del último tornillo.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const estanteria: ProyectoDef = {
  id: 'estanteria',
  nombre: 'Estantería de pino',
  descripcion: 'Estantería abierta con pilares 2×2, travesaños 1×2, niveles de tablas 1×6 y diagonal trasera que la mantiene a escuadra.',
  plan: 'pro',
  horas: '4 a 6 horas',
  ...ficha('estanteria'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 120, step: 1, default: 90 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 80, max: 220, step: 1, default: 180 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 25, max: 45, step: 1, default: 30, ayuda: 'Se llena con tablas 1×6 enteras.' },
    { id: 'niveles', label: 'Niveles', unidad: 'u', min: 2, max: 7, step: 1, default: 5 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const n = params.niveles
    const [p] = seccion('pc2x2')
    const [tA, tE] = seccion('pc1x6')
    const [dA, dE] = seccion('pc1x2')
    const nb = Math.max(2, Math.floor((params.fondo * 10 + 10) / (tA + 10)))
    const D = nb * tA + (nb - 1) * 10
    const z0 = dE
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - p]) for (const z of [z0, z0 + D - p]) piezas.push(...lis('pilar', 'Pilar', 'pc2x2', [x, 0, z], 1, H, 0, 1))
    const yb = 100 + dA
    const ys = Array.from({ length: n }, (_, i) => (n === 1 ? yb : yb + (i * (H - tE - yb)) / (n - 1)))
    for (const y of ys) {
      for (const x of [p, W - p - dE]) piezas.push(...lis('travesano', 'Travesaño', 'pc1x2', [x, y - dA, z0], 2, D, 1, 2))
      for (let i = 0; i < nb; i++) piezas.push(...lis('tabla', 'Tabla de nivel', 'pc1x6', [p, y, z0 + i * (tA + 10)], 0, W - 2 * p, 2, 3))
    }
    piezas.push(barra('diagonal', 'Diagonal trasera', 'pc1x2', [30, 30, dE / 2], [W - 30, H - 30, dE / 2], 'xy', [dA, dE], 4, { nota: 'extremos en ángulo, presentar y marcar' }))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Fondo real: ${D / 10} cm (${nb} tablas 1×6).`, ...(H > 1500 ? ['Con más de 1,5 m de alto, fíjala al muro con dos escuadras.'] : [])],
      herrajes: juntarHerrajes([{ id: 't4x50', cantidad: n * (4 + nb * 4) + 4 }, ...(H > 1500 ? [{ id: 'escuadra', cantidad: 2 }] : [])]),
      pasos: [
        CORTE_PINO,
        { titulo: 'Para los pilares', texto: 'Marca en los cuatro pilares la altura de cada nivel, todos juntos y prensados, para que queden iguales.' },
        { titulo: 'Travesaños', texto: 'Atornilla los travesaños por dentro de cada par de pilares (adelante y atrás) a la altura marcada. Arma los dos costados en el piso.' },
        { titulo: 'Niveles', texto: 'Para los costados y atornilla las tablas de cada nivel sobre los travesaños, con 1 cm de junta entre tablas.' },
        {
          titulo: 'Diagonal trasera',
          texto: 'Revisa que la estantería esté a escuadra (diagonales iguales), presenta la diagonal por detrás, marca los cortes y atorníllala a los pilares y a cada nivel.',
          consejo: 'La diagonal es la que evita que la estantería se ladee: no la omitas.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const bancoTrabajo: ProyectoDef = {
  id: 'banco_trabajo',
  nombre: 'Banco de trabajo',
  descripcion: 'Banco de taller con patas y bastidores de pino 2×4, cubierta de terciado 18 mm y repisa inferior de OSB.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('banco_trabajo'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 100, max: 220, step: 1, default: 150 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 80, step: 1, default: 65 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 80, max: 100, step: 1, default: 90, ayuda: 'A la altura de tus muñecas con los brazos estirados.' },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const H = params.alto * 10
    const [ax, az] = seccion('pc2x4')
    const m = mesa({
      L,
      W,
      H,
      pata: { mat: 'pc2x4', ax, az },
      retiro: 0,
      faldon: { mat: 'pc2x4' },
      cubierta: { mat: 'terc18', tipo: 'tablero' },
      pasos: { patas: 1, faldones: 1, cubierta: 3 },
    })
    const piezas: PiezaInstancia[] = [...m.piezas]
    const yi = 150
    for (const z of [0, W - az]) piezas.push(...lis('rielInf', 'Bastidor inferior largo', 'pc2x4', [ax, yi, z], 0, L - 2 * ax, 1, 2))
    for (const x of [ax / 2 - az / 2, L - ax / 2 - az / 2]) piezas.push(...lis('rielInfC', 'Bastidor inferior corto', 'pc2x4', [x, yi, az], 2, W - 2 * az, 1, 2))
    piezas.push(...tablero('repisaInf', 'Repisa inferior', 'osb15', [ax, yi + ax, 0], [L - ax, yi + ax + 15, W], 2))
    if (L > 1600) {
      const z0 = az
      piezas.push(...lis('travCentral', 'Travesaño central', 'pc2x4', [L / 2 - az / 2, m.yTop - ax, z0], 2, W - 2 * z0, 1, 1))
    }
    const herrajes: HerrajeUso[] = [
      { id: 'perno', cantidad: 16 },
      { id: 't4x50', cantidad: 16 + Math.ceil((2 * (L + W)) / 200) * 2 },
      { id: 'cola', cantidad: 1 },
    ]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Para un banco más firme, atorníllalo al muro por el bastidor trasero.'],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_PINO,
        {
          titulo: 'Bastidor superior y patas',
          texto: 'Arma el bastidor superior con los faldones de 2×4 de canto y une cada pata con dos pernos coche. Revisa las diagonales.',
          consejo: 'Arma el banco boca abajo sobre un piso plano: así la cubierta queda pareja.',
        },
        { titulo: 'Bastidor inferior y repisa', texto: 'Atornilla el bastidor inferior a 15 cm del piso y apoya la repisa de OSB encima, atornillada cada 20 cm.' },
        { titulo: 'Cubierta', texto: 'Atornilla la cubierta de terciado cada 20 cm al bastidor superior, con los tornillos avellanados para que no rayen.' },
      ],
    }
  },
}

export const OFICINA: ProyectoDef[] = [escritorio, escritorioMuro, estanteria, bancoTrabajo]
