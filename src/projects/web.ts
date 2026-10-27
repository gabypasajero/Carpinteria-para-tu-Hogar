// Proyectos encontrados por Connan en la web (Ana White, Kreg, Anika's DIY Life, Bunnings, Sodimac),
// adaptados a materiales y medidas de Chile.
import type { PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { cajonListones } from './inspiracion'
import { lis, mesa, tablero } from './kit'
import { claveDim, exteriorDe, filas, juntarHerrajes, mover, pieza, seccion } from './util'

const CORTE: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte (o pide el corte en la tienda), lija los cantos con grano 120 y marca cada pieza con su letra.',
  consejo: 'Revisa la primera pieza de cada letra antes de cortar el resto.',
}
const T = 18
const k18 = (b: string, a: number, c: number) => claveDim(b, 'terc18', a, c)
const panel = (b: string, nombre: string, min: [number, number, number], max: [number, number, number], paso: number) =>
  pieza(k18(b, ...(([max[0] - min[0], max[1] - min[1], max[2] - min[2]].filter((d) => Math.abs(d - T) > 0.5) as [number, number]))), nombre, 'terc18', min, max, paso)

// ---------------------------------------------------------------------------------------------
export const colgadorMuro: ProyectoDef = {
  id: 'colgador_muro',
  nombre: 'Colgador de muro con repisa',
  descripcion: 'Respaldo de tablas para atornillar perchas en la entrada, con una repisa arriba para gorros, llaves y canastos.',
  plan: 'gratis',
  horas: '2 horas',
  ...ficha('colgador_muro'),
  params: [{ id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 160, step: 1, default: 90 }],
  construir(params) {
    const W = params.ancho * 10
    const [a] = seccion('pc1x6')
    const piezas: PiezaInstancia[] = []
    for (const y of [0, a + 3]) piezas.push(...lis('respaldo', 'Tabla del respaldo', 'pc1x6', [0, y, 0], 0, W, 1, 1))
    piezas.push(...lis('repisa', 'Repisa', 'pc1x6', [0, 2 * a + 3, 0], 0, W, 2, 2))
    const ganchos = Math.max(2, Math.floor(W / 170))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Caben ${ganchos} perchas (cada 17 cm; no están en el presupuesto). Instálalo con la repisa a unos 1,80 m del piso.`],
      herrajes: juntarHerrajes([{ id: 't4x50', cantidad: 8 + Math.ceil(W / 300) * 2 }, { id: 'escuadra', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Respaldo', texto: 'Atornilla las dos tablas del respaldo al muro (a pies derechos o con tarugos), una sobre otra con 3 mm de junta. Revisa con el nivel.' },
        { titulo: 'Repisa y perchas', texto: 'Apoya la repisa sobre el canto superior del respaldo con dos escuadras y atornilla las perchas cada 17 cm.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const pufCajon: ProyectoDef = {
  id: 'puf_cajon',
  nombre: 'Puf cajón con ruedas',
  descripcion: 'Cubo de terciado con tapa que sirve de asiento, mesa auxiliar y baúl. Se tapiza encima y se mueve con ruedas.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('puf_cajon'),
  params: [
    { id: 'lado', label: 'Lado', unidad: 'cm', min: 38, max: 55, step: 1, default: 45 },
    { id: 'alto', label: 'Alto de la caja', unidad: 'cm', min: 30, max: 42, step: 1, default: 36, ayuda: 'Las ruedas y el cojín suman unos 9 cm.' },
  ],
  construir(params) {
    const L = params.lado * 10
    const H = params.alto * 10
    const piezas: PiezaInstancia[] = [
      panel('frente', 'Frente / trasera', [0, 0, 0], [L, H, T], 1),
      panel('frente', 'Frente / trasera', [0, 0, L - T], [L, H, L], 1),
      panel('costado', 'Costado', [0, 0, T], [T, H, L - T], 1),
      panel('costado', 'Costado', [L - T, 0, T], [L, H, L - T], 1),
      panel('fondo', 'Fondo', [T, 0, T], [L - T, T, L - T], 1),
      panel('tapa', 'Tapa', [0, H, 0], [L, H + T, L], 2),
    ]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Espuma de 5 cm, tela y corchetes para tapizar la tapa no están en el presupuesto.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 24 }, { id: 'rueda', cantidad: 4 }, { id: 'cola', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Caja', texto: 'Encola y atornilla los costados entre el frente y la trasera, y el fondo por dentro. Atornilla las ruedas en las esquinas del fondo.' },
        { titulo: 'Tapa', texto: 'Pega la espuma sobre la tapa, fórrala con tela corcheteando por debajo y apóyala sobre la caja (va suelta o con dos topes por dentro).' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const bancaZapatos: ProyectoDef = {
  id: 'banca_zapatos',
  nombre: 'Banca de entrada con zapatero',
  descripcion: 'Banca de terciado para sentarse a calzarse con una repisa debajo para dejar los zapatos.',
  plan: 'gratis',
  horas: '3 horas',
  ...ficha('banca_zapatos'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 60, max: 130, step: 1, default: 90 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 30, max: 40, step: 1, default: 35 },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const H = 460
    const piezas: PiezaInstancia[] = [
      panel('lateral', 'Lateral', [0, 0, 0], [T, H - T, D], 1),
      panel('lateral', 'Lateral', [L - T, 0, 0], [L, H - T, D], 1),
      panel('repisa', 'Repisa de zapatos', [T, 100, 0], [L - T, 100 + T, D], 1),
      panel('faldon', 'Faldón trasero', [T, H - T - 100, 0], [L - T, H - T, T], 1),
      panel('asiento', 'Asiento', [0, H - T, 0], [L, H, D], 2),
    ]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Redondea las esquinas del asiento; si quieres, ponle un cojín delgado.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 20 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [CORTE, { titulo: 'Cuerpo', texto: 'Atornilla la repisa a 10 cm del piso y el faldón trasero arriba, entre los laterales.' }, { titulo: 'Asiento', texto: 'Atornilla el asiento desde arriba con tornillos avellanados y tapa con masilla. Lija y barniza.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const mesaExterior: ProyectoDef = {
  id: 'mesa_exterior',
  nombre: 'Mesa de centro de exterior 2×4',
  descripcion: 'Mesa baja de terraza hecha solo con listones 2×4 impregnados: barata, firme y lista en una tarde.',
  plan: 'gratis',
  horas: '3 horas',
  ...ficha('mesa_exterior'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 70, max: 130, step: 1, default: 100 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 70, step: 1, default: 50 },
  ],
  construir(params) {
    const [a, e] = seccion('pi2x4')
    const m = mesa({ L: params.largo * 10, W: params.ancho * 10, H: 420, pata: { mat: 'pi2x4', ax: a, az: e }, retiro: 20, faldon: { mat: 'pi2x4' }, cubierta: { mat: 'pi2x4', tipo: 'tablas', junta: 8 }, pasos: { patas: 1, faldones: 1, cubierta: 2 } })
    const tablas = m.piezas.filter((p) => p.nombre === 'Tabla de cubierta').length
    return {
      piezas: m.piezas,
      exterior: exteriorDe(m.piezas),
      avisos: [`Ancho real: ${m.W / 10} cm.`],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: 16 + tablas * 4 }, { id: 'protdeck', cantidad: 1 }]),
      pasos: [CORTE, { titulo: 'Base', texto: 'Une los faldones a las patas con tornillos de 100 mm.' }, { titulo: 'Cubierta', texto: 'Atornilla las tablas de la cubierta con 8 mm de junta para que escurra el agua y aplica protector.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const cajaExterior: ProyectoDef = {
  id: 'caja_exterior',
  nombre: 'Baúl de terraza',
  descripcion: 'Baúl de tablas de deck impregnadas para guardar cojines, mangueras o juguetes de exterior, con tapa que sirve de asiento.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('caja_exterior'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 80, max: 150, step: 1, default: 120 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 45, max: 70, step: 1, default: 55 },
    { id: 'filas', label: 'Tablas de alto', unidad: 'u', min: 3, max: 5, step: 1, default: 4 },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const c = cajonListones({ L, D, filas: params.filas, tabla: 'deck', poste: 'pi2x2', fondo: 'deck', yF: 0, junta: 4, pasos: [2, 2, 1] })
    const [tA, tE] = seccion('deck')
    const [p] = seccion('pi2x2')
    const zs = filas(0, D, tA, 4)
    const piezas = [...c.piezas]
    for (const z of zs) piezas.push(...lis('tapa', 'Tabla de tapa', 'deck', [0, c.H, z], 0, L, 2, 3))
    for (const x of [tE + p + 20, L - tE - 2 * p - 20]) piezas.push(...lis('travTapa', 'Travesaño de tapa', 'pi2x2', [x, c.H - p, tE + p + 5], 2, D - 2 * (tE + p + 5), 1, 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Bisagras galvanizadas para la tapa y un brazo de freno no están en el presupuesto.', 'Haz agujeros de 1 cm en el fondo para que drene.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: c.tornillos / 2 + zs.length * 4 }, { id: 'protdeck', cantidad: Math.ceil((2 * (L + D) * c.H) / 1e6 + (L * D) / 1e6) }]),
      pasos: [
        CORTE,
        { titulo: 'Fondo', texto: 'Reparte las tablas del fondo con 4 mm de junta.' },
        { titulo: 'Caja', texto: 'Atornilla las tablas de los cuatro lados a los postes de las esquinas.' },
        { titulo: 'Tapa', texto: 'Une las tablas de la tapa con los dos travesaños por debajo y ponla con bisagras. Aplica protector para deck.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const mesaJardineria: ProyectoDef = {
  id: 'mesa_jardineria',
  nombre: 'Mesa de jardinería',
  descripcion: 'Mesa alta de trasplante con cubierta de tablas de deck, repisa inferior para sacos y una repisa trasera para macetas.',
  plan: 'pro',
  horas: '5 horas',
  ...ficha('mesa_jardineria'),
  params: [{ id: 'largo', label: 'Largo', unidad: 'cm', min: 90, max: 150, step: 1, default: 120 }],
  construir(params) {
    const L = params.largo * 10
    const [a, e] = seccion('pi2x4')
    const [p] = seccion('pi2x2')
    const [tA] = seccion('deck')
    const H = 900
    const m = mesa({ L, W: 500, H, pata: { mat: 'pi2x4', ax: a, az: e }, retiro: 0, faldon: { mat: 'pi2x4' }, cubierta: { mat: 'deck', tipo: 'tablas', junta: 5 }, pasos: { patas: 1, faldones: 1, cubierta: 2 } })
    const piezas: PiezaInstancia[] = mover(m.piezas, [0, 0, p])
    const yR = 200
    for (const z of [p, p + m.W - e]) piezas.push(...lis('apoyoInf', 'Apoyo de repisa inferior', 'pi2x4', [a, yR, z], 0, L - 2 * a, 1, 3))
    for (const z of filas(p + e, p + m.W - e, tA, 10)) piezas.push(...lis('repisaInf', 'Tabla de repisa inferior', 'deck', [a, yR + a, z], 0, L - 2 * a, 2, 3))
    for (const x of [0, L - p]) piezas.push(...lis('poste', 'Poste trasero', 'pi2x2', [x, 0, 0], 1, H + 450, 0, 4))
    piezas.push(...lis('repisaSup', 'Repisa trasera', 'deck', [0, H + 450, 0], 0, L, 2, 4))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Cubierta a 90 cm: altura cómoda para trabajar de pie.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: 60 }, { id: 'protdeck', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Base', texto: 'Arma las patas con los faldones de 2×4.' },
        { titulo: 'Cubierta', texto: 'Atornilla las tablas de deck de la cubierta con 5 mm de junta.' },
        { titulo: 'Repisa inferior', texto: 'Atornilla los apoyos entre las patas a 20 cm del suelo y las tablas encima.' },
        { titulo: 'Repisa trasera', texto: 'Atornilla los postes traseros a las patas y la repisa arriba. Aplica protector.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const veladorInfantil: ProyectoDef = {
  id: 'velador_infantil',
  nombre: 'Velador infantil con libros a la vista',
  descripcion: 'Velador bajo de terciado con dos repisas y un listón al frente para que los cuentos se vean de portada.',
  plan: 'gratis',
  horas: '3 horas',
  ...ficha('velador_infantil'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 35, max: 60, step: 1, default: 42 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 40, max: 60, step: 1, default: 50 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = 300
    const [, lE] = seccion('pc1x2')
    const yM = Math.round(H / 2)
    const piezas: PiezaInstancia[] = [
      panel('lateral', 'Lateral', [0, 0, 0], [T, H - T, D], 1),
      panel('lateral', 'Lateral', [W - T, 0, 0], [W, H - T, D], 1),
      panel('repisa', 'Base / repisa', [T, 50, 0], [W - T, 50 + T, D], 1),
      panel('repisa', 'Base / repisa', [T, yM, 0], [W - T, yM + T, D], 1),
      panel('cubierta', 'Cubierta', [0, H - T, 0], [W, H, D], 2),
    ]
    for (const y of [50 + T, yM + T]) piezas.push(...lis('tope', 'Listón de tope', 'pc1x2', [T, y, D - lE], 0, W - 2 * T, 1, 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Redondea todas las esquinas y usa pintura al agua.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 20 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [CORTE, { titulo: 'Cuerpo', texto: 'Atornilla la base a 5 cm del piso y la repisa al medio entre los laterales.' }, { titulo: 'Cubierta y topes', texto: 'Atornilla la cubierta y pega un listón de tope al frente de cada repisa para apoyar los libros de portada.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const carroTaller: ProyectoDef = {
  id: 'carro_taller',
  nombre: 'Carro de taller con ruedas',
  descripcion: 'Banco de trabajo compacto sobre ruedas con freno, cubierta de terciado y repisa inferior de OSB para herramientas.',
  plan: 'pro',
  horas: '4 a 5 horas',
  ...ficha('carro_taller'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 70, max: 120, step: 1, default: 90 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 45, max: 65, step: 1, default: 55 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const [a, e] = seccion('pc2x4')
    const m = mesa({ L, W, H: 830, pata: { mat: 'pc2x4', ax: a, az: e }, retiro: 0, faldon: { mat: 'pc2x4' }, cubierta: { mat: 'terc18', tipo: 'tablero' }, pasos: { patas: 1, faldones: 1, cubierta: 3 } })
    const piezas: PiezaInstancia[] = [...m.piezas]
    const yi = 120
    for (const z of [0, W - e]) piezas.push(...lis('rielInf', 'Bastidor inferior', 'pc2x4', [a, yi, z], 0, L - 2 * a, 1, 2))
    piezas.push(...tablero('repisaInf', 'Repisa inferior', 'osb15', [a, yi + a, 0], [L - a, yi + a + 15, W], 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Las ruedas suman unos 7 cm: el carro queda a ~90 cm de alto. Usa ruedas con freno.'],
      herrajes: juntarHerrajes([{ id: 'rueda', cantidad: 4 }, { id: 'perno', cantidad: 8 }, { id: 't4x50', cantidad: 40 }]),
      pasos: [CORTE, { titulo: 'Bastidor', texto: 'Arma el bastidor superior y une las patas con pernos.' }, { titulo: 'Repisa inferior', texto: 'Atornilla el bastidor inferior y la repisa de OSB.' }, { titulo: 'Cubierta y ruedas', texto: 'Atornilla la cubierta de terciado y las cuatro ruedas bajo las patas.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const barExterior: ProyectoDef = {
  id: 'bar_exterior',
  nombre: 'Barra de terraza',
  descripcion: 'Barra de 105 cm para la terraza o el quincho: estructura de 2×4 impregnado, frente forrado con tablas de deck y repisa interior.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('bar_exterior'),
  params: [{ id: 'largo', label: 'Largo', unidad: 'cm', min: 120, max: 220, step: 1, default: 160 }],
  construir(params) {
    const L = params.largo * 10
    const [a, e] = seccion('pi2x4')
    const [tA] = seccion('deck')
    const m = mesa({ L, W: 450, H: 1050, pata: { mat: 'pi2x4', ax: a, az: e }, retiro: 0, faldon: { mat: 'pi2x4' }, cubierta: { mat: 'deck', tipo: 'tablas', junta: 5 }, pasos: { patas: 1, faldones: 1, cubierta: 3 } })
    const piezas: PiezaInstancia[] = [...m.piezas]
    const yTop = m.yTop
    for (let y = 80; y + tA <= yTop - a; y += tA + 3) piezas.push(...lis('frente', 'Tabla del frente', 'deck', [0, y, m.W], 0, L, 1, 2))
    for (const z of [0, m.W - e]) piezas.push(...lis('apoyo', 'Apoyo de repisa', 'pi2x4', [a, 400, z], 0, L - 2 * a, 1, 2))
    for (const z of filas(e, m.W - e, tA, 10)) piezas.push(...lis('repisa', 'Tabla de repisa', 'deck', [a, 400 + a, z], 0, L - 2 * a, 2, 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Para taburetes de barra de 75 cm. Ancla la barra al piso o al muro si queda expuesta al viento.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: 100 }, { id: 'protdeck', cantidad: 4 }]),
      pasos: [CORTE, { titulo: 'Estructura', texto: 'Arma las patas y faldones de 2×4.' }, { titulo: 'Frente y repisa', texto: 'Forra el frente con tablas de deck horizontales y atornilla la repisa interior a 40 cm.' }, { titulo: 'Cubierta', texto: 'Atornilla la cubierta de tablas y aplica protector con tinte.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const muebleTocadiscos: ProyectoDef = {
  id: 'mueble_tocadiscos',
  nombre: 'Mueble para tocadiscos y vinilos',
  descripcion: 'Mueble bajo con patas de pino y casilleros de 33 cm para guardar los discos de vinilo de canto, con el tocadiscos encima.',
  plan: 'pro',
  horas: '4 horas',
  ...ficha('mueble_tocadiscos'),
  params: [{ id: 'casilleros', label: 'Casilleros', unidad: 'u', min: 2, max: 4, step: 1, default: 3 }],
  construir(params) {
    const n = params.casilleros
    const c = 340
    const W = n * c + (n + 1) * T
    const D = 400
    const [p] = seccion('pc2x2')
    const y0 = 200
    const H = y0 + T + 330 + T
    const piezas: PiezaInstancia[] = []
    for (const x of [20, W - 20 - p]) for (const z of [20, D - 20 - p]) piezas.push(...lis('pata', 'Pata', 'pc2x2', [x, 0, z], 1, y0, 0, 1))
    piezas.push(panel('base', 'Base', [0, y0, 0], [W, y0 + T, D], 2))
    for (let i = 0; i <= n; i++) piezas.push(panel('division', i === 0 || i === n ? 'Lateral' : 'División', [i * (c + T), y0 + T, 0], [i * (c + T) + T, H - T, D], 2))
    piezas.push(panel('cubierta', 'Cubierta', [0, H - T, 0], [W, H, D], 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Caben unos ${n * 50} discos. Los LP miden 31,5 cm: los casilleros tienen 33 cm de alto.`],
      herrajes: juntarHerrajes([{ id: 't4x50', cantidad: 8 + (n + 1) * 4 }, { id: 'cola', cantidad: 1 }, { id: 'barniz', cantidad: 1 }]),
      pasos: [CORTE, { titulo: 'Patas', texto: 'Atornilla las cuatro patas bajo la base, 2 cm hacia adentro.' }, { titulo: 'Divisiones', texto: 'Atornilla los laterales y las divisiones sobre la base, cada 34 cm.' }, { titulo: 'Cubierta', texto: 'Atornilla la cubierta. Lija y barniza.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const repisaMuro: ProyectoDef = {
  id: 'repisa_muro',
  nombre: 'Repisa de muro tipo caja',
  descripcion: 'Repisa abierta de cuatro tablas que se cuelga en el muro: para plantas, libros o especias. El proyecto ideal para partir.',
  plan: 'gratis',
  horas: '1 a 2 horas',
  ...ficha('repisa_muro'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 40, max: 120, step: 1, default: 70 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 15, max: 35, step: 1, default: 22 },
  ],
  construir(params) {
    const L = params.largo * 10
    const H = params.alto * 10
    const [, t] = seccion('pc1x6')
    const piezas: PiezaInstancia[] = []
    for (const y of [0, H - t]) piezas.push(...lis('horizontal', 'Base / techo', 'pc1x6', [0, y, 0], 0, L, 2, 1))
    for (const x of [0, L - t]) piezas.push(...lis('lateral', 'Lateral', 'pc1x6', [x, t, 0], 1, H - 2 * t, 2, 1))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Cuélgala con dos escuadras ocultas por dentro o con un listón francés.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 8 }, { id: 'escuadra', cantidad: 2 }, { id: 'cola', cantidad: 1 }]),
      pasos: [CORTE, { titulo: 'Arma la caja', texto: 'Encola y atornilla los laterales entre la base y el techo. Revisa las diagonales, lija, barniza y cuelga.' }],
    }
  },
}

export const cajaTapa: ProyectoDef = {
  id: 'caja_tapa',
  nombre: 'Caja de madera con tapa',
  descripcion: 'Caja de pino con fondo y tapa de terciado para guardar recuerdos, té o herramientas pequeñas. Un regalo hecho a mano.',
  plan: 'gratis',
  horas: '2 horas',
  ...ficha('caja_tapa'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 20, max: 50, step: 1, default: 30 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 15, max: 35, step: 1, default: 20 },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const [a, t] = seccion('pc1x6')
    const H = a
    const piezas: PiezaInstancia[] = []
    for (const z of [0, D - t]) piezas.push(...lis('frente', 'Frente / trasera', 'pc1x6', [0, 0, z], 0, L, 1, 1))
    for (const x of [0, L - t]) piezas.push(...lis('costado', 'Costado', 'pc1x6', [x, 0, t], 2, D - 2 * t, 1, 1))
    piezas.push(pieza(claveDim('fondo', 'terc12', L - 2 * t, D - 2 * t), 'Fondo', 'terc12', [t, 0, t], [L - t, 12, D - t], 1))
    piezas.push(pieza(claveDim('tapa', 'terc12', L, D), 'Tapa', 'terc12', [0, H, 0], [L, H + 12, D], 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Dos bisagras pequeñas de latón (o una tapa calzada con un listón por dentro) no están en el presupuesto.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 8 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [CORTE, { titulo: 'Caja', texto: 'Encola y atornilla los costados entre el frente y la trasera; encola el fondo por dentro.' }, { titulo: 'Tapa', texto: 'Redondea los cantos de la tapa y fíjala con bisagras pequeñas. Lija y aceita.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const verdulero: ProyectoDef = {
  id: 'verdulero',
  nombre: 'Verdulero de tres niveles',
  descripcion: 'Mueble de cocina con tres bandejas de listones ventiladas para papas, cebollas y frutas.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('verdulero'),
  params: [{ id: 'ancho', label: 'Ancho', unidad: 'cm', min: 35, max: 60, step: 1, default: 45 }],
  construir(params) {
    const W = params.ancho * 10
    const D = 350
    const H = 800
    const [p] = seccion('pc2x2')
    const [a, t] = seccion('pc1x3')
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - p]) for (const z of [0, D - p]) piezas.push(...lis('poste', 'Poste', 'pc2x2', [x, 0, z], 1, H, 0, 1))
    const niveles = [80, 330, 580]
    for (const y of niveles) {
      for (const x of [p, W - p - t]) piezas.push(...lis('apoyo', 'Apoyo lateral', 'pc1x3', [x, y, p], 2, D - 2 * p, 1, 2))
      for (const z of filas(0, D, a, 12)) piezas.push(...lis('tablilla', 'Tablilla de bandeja', 'pc1x3', [p, y + a, z], 0, W - 2 * p, 2, 2))
      for (const z of [0, D - t]) piezas.push(...lis('borde', 'Borde de bandeja', 'pc1x3', [p, y + a + t, z], 0, W - 2 * p, 1, 3))
    }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Guarda papas y cebollas en bandejas distintas: juntas se echan a perder antes.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 3 * (4 + 2 * 8) }, { id: 'cola', cantidad: 1 }]),
      pasos: [CORTE, { titulo: 'Apoyos', texto: 'Atornilla los apoyos laterales entre los postes a las tres alturas.' }, { titulo: 'Bandejas', texto: 'Atornilla las tablillas sobre los apoyos con 1 cm de separación para que ventile.' }, { titulo: 'Bordes', texto: 'Atornilla un borde adelante y atrás de cada bandeja para que no se caigan las verduras.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const zapateroBajoCama: ProyectoDef = {
  id: 'zapatero_bajo_cama',
  nombre: 'Zapatero bajo la cama con ruedas',
  descripcion: 'Cajón bajo de pino con fondo de MDF, divisiones para cada par y ruedas para sacarlo de debajo de la cama.',
  plan: 'gratis',
  horas: '2 a 3 horas',
  ...ficha('zapatero_bajo_cama'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 60, max: 110, step: 1, default: 80 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 50, max: 70, step: 1, default: 60 },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const [, t] = seccion('pc1x6')
    const [, dE] = seccion('pc1x3')
    const piezas: PiezaInstancia[] = []
    for (const z of [0, D - t]) piezas.push(...lis('frente', 'Frente / trasera', 'pc1x6', [0, 0, z], 0, L, 1, 1))
    for (const x of [0, L - t]) piezas.push(...lis('costado', 'Costado', 'pc1x6', [x, 0, t], 2, D - 2 * t, 1, 1))
    piezas.push(pieza(claveDim('fondo', 'hdf3', L - 2 * t, D - 2 * t), 'Fondo', 'hdf3', [t, 0, t], [L - t, 3, D - t], 1))
    const pares = Math.max(2, Math.floor((L - 2 * t) / 200))
    const paso = (L - 2 * t - (pares - 1) * dE) / pares
    for (let i = 1; i < pares; i++) piezas.push(...lis('division', 'División', 'pc1x3', [t + i * paso + (i - 1) * dE, 3, t], 2, D - 2 * t, 1, 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`${pares * 2} pares (dos por división). Revisa que la cama tenga al menos 18 cm libres debajo.`],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 8 + (pares - 1) * 2 }, { id: 'rueda', cantidad: 4 }, { id: 'clavo1', cantidad: 30 }]),
      pasos: [CORTE, { titulo: 'Cajón', texto: 'Atornilla los costados entre el frente y la trasera, clava el fondo por debajo y atornilla las ruedas.' }, { titulo: 'Divisiones', texto: 'Pega y atornilla las divisiones repartidas a lo largo. Haz una manilla calando el frente.' }],
    }
  },
}

export const WEB: ProyectoDef[] = [
  colgadorMuro,
  pufCajon,
  bancaZapatos,
  mesaExterior,
  cajaExterior,
  mesaJardineria,
  veladorInfantil,
  carroTaller,
  barExterior,
  muebleTocadiscos,
  repisaMuro,
  cajaTapa,
  verdulero,
  zapateroBajoCama,
]
