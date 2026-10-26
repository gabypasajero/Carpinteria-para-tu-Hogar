// Proyectos cortos y de decoración (estilo «Inspiración»): de 1 a 4 horas, ideales para partir.
import type { PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { lis } from './kit'
import { barra, claveDim, filas, exteriorDe, juntarHerrajes, mover, pieza, redondear, repartir, seccion, type V3 } from './util'

const CORTE: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte, lija los cantos con grano 120 y marca cada pieza con su letra en una cara que no se vea.',
  consejo: 'Con ingletadora o una guía de corte, fija un tope para cortar iguales todas las piezas de la misma letra.',
}
const TERMINA: PasoGuia = { titulo: 'Termina', texto: 'Lija todo con grano 120, limpia el polvo y aplica dos manos de barniz o aceite, lijando suave entre manos.' }

/** Tabla girada sobre el eje x apoyada en una línea (z, y) de a hacia b, a una distancia `sobre` hacia arriba. */
function tablasSobreLinea(o: { clave: string; nombre: string; mat: string; x0: number; x1: number; a: [number, number]; b: [number, number]; sobre: number; desde: number; hasta?: number; junta: number; paso: number }) {
  const [tA, tE] = seccion(o.mat)
  const dz = o.b[0] - o.a[0]
  const dy = o.b[1] - o.a[1]
  const largo = Math.hypot(dz, dy)
  const signo = dz >= 0 ? 1 : -1
  const u = [dz / largo, dy / largo]
  const n = [(-dy / largo) * signo, (dz / largo) * signo]
  const ang = Math.atan2(-dy, dz)
  const piezas: PiezaInstancia[] = []
  for (let s = o.desde + tA / 2; s + tA / 2 <= (o.hasta ?? largo); s += tA + o.junta) {
    const off = o.sobre + tE / 2
    const pos: V3 = [(o.x0 + o.x1) / 2, o.a[1] + u[1] * s + n[1] * off, o.a[0] + u[0] * s + n[0] * off]
    piezas.push({ clave: claveDim(o.clave, o.mat, o.x1 - o.x0, 0), nombre: o.nombre, material: o.mat, size: [redondear(o.x1 - o.x0), tE, tA], pos, rot: [ang, 0, 0], paso: o.paso })
  }
  return piezas
}

/**
 * Cajón de listones: postes en las esquinas interiores, filas de tablas en los cuatro lados y fondo de tablillas
 * a la altura yF (sobre listones de apoyo si yF > 0). filasFrente permite un frente más bajo (camas de mascota).
 */
function cajonListones(o: { L: number; D: number; filas: number; filasFrente?: number; tabla: string; poste: string; fondo: string; yF: number; junta: number; pasos: [number, number, number] }) {
  const [a, t] = seccion(o.tabla)
  const [p] = seccion(o.poste)
  const [fa, fe] = seccion(o.fondo)
  const H = o.filas * (a + o.junta) - o.junta
  const piezas: PiezaInstancia[] = []
  const y0P = o.yF === 0 ? fe : 0
  for (const x of [t, o.L - t - p]) for (const z of [t, o.D - t - p]) piezas.push(...lis('poste', 'Poste', o.poste, [x, y0P, z], 1, H - y0P, 0, o.pasos[0]))
  for (let i = 0; i < o.filas; i++) {
    const y = i * (a + o.junta)
    piezas.push(...lis('lado', 'Tabla lateral', o.tabla, [0, y, 0], 0, o.L, 1, o.pasos[1]))
    if (i < (o.filasFrente ?? o.filas)) piezas.push(...lis('lado', 'Tabla lateral', o.tabla, [0, y, o.D - t], 0, o.L, 1, o.pasos[1]))
    for (const x of [0, o.L - t]) piezas.push(...lis('cabeza', 'Tabla de cabecera', o.tabla, [x, y, t], 2, o.D - 2 * t, 1, o.pasos[1]))
  }
  let tablillas: number[]
  if (o.yF === 0) {
    tablillas = filas(t, o.L - t, fa, 10)
    for (const x of tablillas) piezas.push(...lis('fondo', 'Tablilla del fondo', o.fondo, [x, 0, t], 2, o.D - 2 * t, 0, o.pasos[2]))
  } else {
    for (const z of [t, o.D - t - p]) piezas.push(...lis('apoyo', 'Listón de apoyo', o.poste, [t + p, o.yF - p, z], 0, o.L - 2 * (t + p), 1, o.pasos[2]))
    tablillas = filas(t + p, o.L - t - p, fa, 10)
    for (const x of tablillas) piezas.push(...lis('fondo', 'Tablilla del fondo', o.fondo, [x, o.yF, t], 2, o.D - 2 * t, 0, o.pasos[2]))
  }
  const tablas = piezas.filter((q) => q.nombre !== 'Poste' && q.nombre !== 'Listón de apoyo').length
  return { piezas, H, tornillos: tablas * 4 }
}

// ---------------------------------------------------------------------------------------------
export const bandejaBotas: ProyectoDef = {
  id: 'bandeja_botas',
  nombre: 'Bandeja de listones para botas',
  descripcion: 'Bandeja baja de listones separados para dejar botas y zapatos mojados en la entrada: el agua escurre y la madera se seca.',
  plan: 'gratis',
  horas: '1 a 2 horas',
  ...ficha('bandeja_botas'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 50, max: 120, step: 1, default: 80 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 30, max: 45, step: 1, default: 38 },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const [rA, rE] = seccion('pc1x2')
    const [sA] = seccion('pc1x3')
    const piezas: PiezaInstancia[] = []
    const xs = [30, L / 2 - rE / 2, L - 30 - rE]
    for (const x of xs) piezas.push(...lis('patin', 'Patín', 'pc1x2', [x, 0, 0], 2, D, 1, 1))
    const zs = filas(0, D, sA, 10)
    for (const z of zs) piezas.push(...lis('listón', 'Listón de la bandeja', 'pc1x3', [0, rA, z], 0, L, 2, 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Usa barniz marino: la bandeja recibe agua y barro.'],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: zs.length * 3 * 1 + 2 },
        { id: 'cola', cantidad: 1 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Patines', texto: 'Ubica los tres patines de canto, paralelos: uno en cada extremo y uno al centro.' },
        { titulo: 'Listones', texto: `Atornilla los ${zs.length} listones sobre los patines con un tornillo en cada cruce, dejando 1 cm entre listones.`, consejo: 'Usa un taco de 1 cm como separador.' },
        { ...TERMINA, texto: 'Redondea las esquinas con lija y aplica dos manos de barniz marino.' },
      ],
    }
  },
}

export const cajaListones: ProyectoDef = {
  id: 'caja_listones',
  nombre: 'Caja de almacenamiento con listones',
  descripcion: 'Caja abierta de listones de pino con postes en las esquinas, para mantas, juguetes o leña. Se apila y se ve bien a la vista.',
  plan: 'gratis',
  horas: '2 a 3 horas',
  ...ficha('caja_listones'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 30, max: 70, step: 1, default: 45 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 25, max: 45, step: 1, default: 32 },
    { id: 'filas', label: 'Filas de listones', unidad: 'u', min: 2, max: 5, step: 1, default: 3, ayuda: 'Cada fila suma unos 7 cm de alto.' },
  ],
  construir(params) {
    const c = cajonListones({ L: params.largo * 10, D: params.fondo * 10, filas: params.filas, tabla: 'pc1x3', poste: 'pc2x2', fondo: 'pc1x3', yF: 0, junta: 8, pasos: [2, 2, 1] })
    return {
      piezas: c.piezas,
      exterior: exteriorDe(c.piezas),
      avisos: ['Para manillas, cala una ranura de 10×3 cm en la tabla superior de cada cabecera.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: c.tornillos }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Fondo', texto: 'Reparte las tablillas del fondo con 1 cm entre ellas.' },
        { titulo: 'Postes y listones', texto: 'Atornilla los listones de cada cabecera a dos postes; luego une las cabeceras con los listones laterales y el fondo.', consejo: 'Revisa las diagonales antes del último tornillo.' },
        TERMINA,
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
const ENTRADAS = [25, 29, 32]

export const casaPajaros: ProyectoDef = {
  id: 'casa_pajaros',
  nombre: 'Casa de pájaros',
  descripcion: 'Caja nido de pino con techo de una caída, piso para 10×10 cm y entrada del diámetro justo para aves pequeñas del jardín.',
  plan: 'gratis',
  horas: '2 horas',
  ...ficha('casa_pajaros'),
  params: [
    { id: 'alto', label: 'Alto al frente', unidad: 'cm', min: 18, max: 25, step: 1, default: 22 },
    { id: 'entrada', label: 'Entrada', unidad: 'u', min: 0, max: 2, step: 1, default: 0, opciones: ['2,5 cm (chincol, diuca)', '2,9 cm (golondrina)', '3,2 cm (aves algo mayores)'] },
  ],
  construir(params) {
    const H = params.alto * 10
    const Hb = H - 30
    const [a, t] = seccion('pc1x6')
    const piezas: PiezaInstancia[] = [
      pieza(claveDim('frente', 'pc1x6', H, 0), 'Frente', 'pc1x6', [0, 0, a - t], [a, H, a], 1, { nota: `entrada de ${ENTRADAS[params.entrada] / 10} cm a ${(H - 70) / 10} cm del piso` }),
      pieza(claveDim('trasera', 'pc1x6', Hb, 0), 'Trasera', 'pc1x6', [0, 0, 0], [a, Hb, t], 1),
    ]
    for (const x of [0, a - t]) piezas.push(pieza(claveDim('costado', 'pc1x6', Hb, 0), 'Costado', 'pc1x6', [x, 0, t], [x + t, Hb, a - t], 2, { nota: 'canto superior en bisel' }))
    piezas.push(pieza(claveDim('piso', 'pc1x6', a - 2 * t, 0), 'Piso', 'pc1x6', [t, 8, t], [a - t, 8 + t, a - t], 2, { nota: 'despuntar las esquinas (drenaje)' }))
    piezas.push(barra('techo', 'Techo', 'pc1x6', [a / 2, Hb + 14, 12], [a / 2, H + 14, a + 50], 'zy', [t, a], 3, { nota: 'canto trasero en bisel' }))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Cuélgala a 1,5–3 m de altura, lejos de comederos y protegida del sol de la tarde.', 'Barniza solo por fuera y no pongas percha: ayuda a los depredadores.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 16 }, { id: 'cola', cantidad: 1 }, { id: 'barniz', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Frente y trasera', texto: `Perfora la entrada de ${ENTRADAS[params.entrada] / 10} cm con broca de paleta o sierra copa, a 7 cm del borde superior del frente.` },
        { titulo: 'Caja', texto: 'Une los costados entre el frente y la trasera y atornilla el piso 1 cm hacia arriba. Despunta sus esquinas para que drene.' },
        { titulo: 'Techo', texto: 'Atornilla el techo con vuelo al frente para que la lluvia no entre por la entrada. Fija con un solo tornillo de un lado para poder abrir y limpiar.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const tablaPicar: ProyectoDef = {
  id: 'tabla_picar',
  nombre: 'Tabla de picar laminada',
  descripcion: 'Tabla de picar o de picoteo hecha con listones encolados de canto. Delgada para servir o gruesa para picar.',
  plan: 'gratis',
  horas: '2 horas + secado',
  ...ficha('tabla_picar'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 25, max: 60, step: 1, default: 40 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 15, max: 35, step: 1, default: 25 },
    { id: 'grosor', label: 'Grosor', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Delgada 1,9 cm (tablas 1×4)', 'Gruesa 4,1 cm (listones 2×2)'] },
  ],
  construir(params) {
    const L = params.largo * 10
    const mat = params.grosor === 1 ? 'pc2x2' : 'pc1x4'
    const [a] = seccion(mat)
    const n = Math.max(2, Math.round((params.ancho * 10) / a))
    const piezas: PiezaInstancia[] = []
    for (let i = 0; i < n; i++) piezas.push(...lis('listón', 'Listón', mat, [0, 0, i * a], 0, L, 2, 1))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Ancho real: ${(n * a) / 10} cm. Para picar todos los días prefiere madera dura (roble, raulí, coigüe). Mantenla con aceite apto para alimentos.`],
      herrajes: juntarHerrajes([{ id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 3 }]),
      pasos: [
        CORTE,
        { titulo: 'Encola y prensa', texto: 'Alterna el dibujo de los anillos, encola los cantos y prensa los listones de lado a lado. Deja secar 24 horas.', consejo: 'Usa cola apta para contacto con alimentos una vez seca (tipo D3 o poliuretano alimentario).' },
        { titulo: 'Escuadra, lija y aceita', texto: 'Recorta los extremos a escuadra, redondea las esquinas, lija hasta grano 180 y aplica aceite mineral o de cocina en varias manos.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const portaPlantas: ProyectoDef = {
  id: 'porta_plantas',
  nombre: 'Porta plantas escalonado',
  descripcion: 'Estante en escalera para macetas: cada nivel queda más alto y más atrás, así todas reciben luz.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('porta_plantas'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 120, step: 1, default: 70 },
    { id: 'niveles', label: 'Niveles', unidad: 'u', min: 2, max: 4, step: 1, default: 3 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const n = params.niveles
    const [p] = seccion('pc2x2')
    const [tA, tE] = seccion('pc1x4')
    const s = 2 * tA + 15
    const D = n * s
    const yTop = (i: number) => 250 + i * 220
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - p])
      for (let k = 0; k <= n; k++) {
        const z = Math.min(k * s, D - p)
        // El nivel más alto queda atrás (contra el muro): el poste toma el alto del nivel más alto que toca.
        const alto = yTop(Math.min(n - k, n - 1)) - tE
        piezas.push(...lis('pata', 'Pata', 'pc2x2', [x, 0, z], 1, alto, 0, 1))
      }
    for (let i = 0; i < n; i++) {
      const y = yTop(i) - tE
      const z0 = (n - 1 - i) * s
      for (const x of [p, W - 2 * p]) piezas.push(...lis('larguero', 'Larguero', 'pc2x2', [x, y - p, z0], 2, s, 1, 2))
      for (const z of [z0 + 5, z0 + 10 + tA]) piezas.push(...lis('tabla', 'Tabla del nivel', 'pc1x4', [p, y, z], 0, W - 2 * p, 2, 3))
    }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['En exterior usa pino impregnado o protege con barniz marino; pon platos bajo las macetas.'],
      herrajes: juntarHerrajes([{ id: 't4x50', cantidad: n * 4 + n * 2 * 4 + (n + 1) * 2 }, { id: 'cola', cantidad: 1 }, { id: 'barniz', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Costados', texto: 'Arma cada costado uniendo las patas con los largueros a la altura de cada nivel, del más bajo al más alto.' },
        { titulo: 'Une los costados', texto: 'Para los dos costados y revisa que queden paralelos y a escuadra.' },
        { titulo: 'Tablas', texto: 'Atornilla dos tablas por nivel sobre los largueros con 5 mm de separación para que drene el agua.' },
      ],
    }
  },
}

export const maceteroAlto: ProyectoDef = {
  id: 'macetero_alto',
  nombre: 'Macetero alto de listones',
  descripcion: 'Macetero cuadrado y alto con postes impregnados y fondo elevado: menos tierra y la planta queda a la vista.',
  plan: 'pro',
  horas: '2 a 3 horas',
  ...ficha('macetero_alto'),
  params: [
    { id: 'lado', label: 'Lado', unidad: 'cm', min: 30, max: 60, step: 1, default: 40 },
    { id: 'filas', label: 'Filas de tablas', unidad: 'u', min: 4, max: 9, step: 1, default: 7, ayuda: 'Cada fila suma unos 10 cm.' },
  ],
  construir(params) {
    const L = params.lado * 10
    const filas = params.filas
    const H = filas * (90 + 5) - 5
    const c = cajonListones({ L, D: L, filas, tabla: 'pc1x4', poste: 'pi2x2', fondo: 'pc1x4', yF: Math.max(100, H - 320), junta: 5, pasos: [1, 2, 1] })
    return {
      piezas: c.piezas,
      exterior: exteriorDe(c.piezas),
      avisos: ['Forra el interior con plástico grueso (no el fondo) y haz agujeros de drenaje.', 'Usa pino impregnado o barniz marino: las tablas tocan tierra húmeda.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: Math.ceil(c.tornillos / 2) }, { id: 'barniz', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Postes, apoyos y fondo', texto: 'Atornilla los listones de apoyo entre los postes a la altura del fondo y reparte las tablillas del fondo con 1 cm entre ellas.' },
        { titulo: 'Tablas', texto: 'Atornilla las tablas de los cuatro lados a los postes, de abajo hacia arriba, con 5 mm de junta.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const vinoteca: ProyectoDef = {
  id: 'vinoteca',
  nombre: 'Vinoteca de cubos',
  descripcion: 'Mueble de pino con celdas de 10 cm para guardar botellas acostadas. Se cuelga, se apoya en un mueble o se apila.',
  plan: 'pro',
  horas: '4 a 5 horas',
  ...ficha('vinoteca'),
  params: [
    { id: 'columnas', label: 'Columnas', unidad: 'u', min: 2, max: 8, step: 1, default: 4 },
    { id: 'filas', label: 'Filas', unidad: 'u', min: 2, max: 8, step: 1, default: 4 },
  ],
  construir(params) {
    const cols = params.columnas
    const filas = params.filas
    const [, t] = seccion('pc1x6')
    const c = 100
    const W = cols * c + (cols + 1) * t
    const H = filas * c + (filas + 1) * t
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - t]) piezas.push(...lis('lateral', 'Lateral', 'pc1x6', [x, 0, 0], 1, H, 2, 1))
    for (const y of [0, H - t]) piezas.push(...lis('techo', 'Base / techo', 'pc1x6', [t, y, 0], 0, W - 2 * t, 2, 1))
    for (let i = 1; i < cols; i++) piezas.push(...lis('division', 'División vertical', 'pc1x6', [i * (c + t), t, 0], 1, H - 2 * t, 2, 2))
    for (let i = 0; i < cols; i++)
      for (let j = 1; j < filas; j++) piezas.push(...lis('separador', 'Separador', 'pc1x6', [t + i * (c + t), j * (c + t), 0], 0, c, 2, 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`${cols * filas} botellas. Las botellas de 750 ml sobresalen unos 15 cm: es normal.`, 'Si la cuelgas, atorníllala a pies derechos o con tarugos: llena pesa más de 1,3 kg por botella.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 8 + (cols - 1) * 4 + cols * (filas - 1) * 4 }, { id: 'cola', cantidad: 1 }, { id: 'barniz', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Marco', texto: 'Arma el marco con la base y el techo entre los laterales, a escuadra.' },
        { titulo: 'Divisiones', texto: 'Atornilla las divisiones verticales cada 10 cm de luz, desde arriba y abajo.' },
        { titulo: 'Separadores', texto: 'Encola y atornilla los separadores de cada columna formando celdas de 10 × 10 cm.', consejo: 'Corta un taco de 10 cm y úsalo de separador mientras atornillas.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const soporteMonitor: ProyectoDef = {
  id: 'soporte_monitor',
  nombre: 'Elevador de monitor',
  descripcion: 'Repisa de escritorio que sube el monitor a la altura de los ojos y deja espacio para guardar el teclado debajo.',
  plan: 'gratis',
  horas: '1 a 2 horas',
  ...ficha('soporte_monitor'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 120, step: 1, default: 60 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 9, max: 16, step: 1, default: 11 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const [a, t] = seccion('pc1x6')
    const [bA] = seccion('pc1x3')
    const D = 2 * a + 3
    const piezas: PiezaInstancia[] = []
    for (const z of [0, a + 3]) piezas.push(...lis('cubierta', 'Tabla de cubierta', 'pc1x6', [0, H - t, z], 0, W, 2, 2))
    for (const x of [30, W - 30 - t]) for (const z of [0, a + 3]) piezas.push(...lis('pata', 'Pata', 'pc1x6', [x, 0, z], 1, H - t, 2, 1, { nota: `alto ${(H - t) / 10} cm` }))
    if (H - t >= bA) piezas.push(...lis('travesano', 'Travesaño trasero', 'pc1x3', [30 + t, H - t - bA, 0], 0, W - 60 - 2 * t, 1, 1))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Fondo: ${D / 10} cm. Pega fieltro bajo las patas para no rayar el escritorio.`],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 16 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Patas', texto: 'Junta cada par de patas formando un panel y únelas con el travesaño trasero.' },
        { titulo: 'Cubierta', texto: 'Encola y atornilla las dos tablas de la cubierta sobre las patas, a ras atrás. Lija y barniza.' },
      ],
    }
  },
}

export const atril: ProyectoDef = {
  id: 'atril',
  nombre: 'Atril para libros y tablet',
  descripcion: 'Atril de mesa inclinado a 70° con tope para sostener libros de cocina, partituras o la tablet.',
  plan: 'gratis',
  horas: '1 a 2 horas',
  ...ficha('atril'),
  params: [{ id: 'ancho', label: 'Ancho', unidad: 'cm', min: 25, max: 45, step: 1, default: 32 }],
  construir(params) {
    const W = params.ancho * 10
    const [a, t] = seccion('pc1x6')
    const [lA, lE] = seccion('pc1x2')
    const ang = (70 * Math.PI) / 180
    const A: [number, number] = [a - 20, t + 4]
    const B: [number, number] = [A[0] - Math.cos(ang) * 2 * a, A[1] + Math.sin(ang) * 2 * a]
    const piezas: PiezaInstancia[] = [
      ...lis('base', 'Base', 'pc1x6', [0, 0, 0], 0, W, 2, 1),
      ...lis('tope', 'Tope', 'pc1x2', [0, t, a - lE], 0, W, 1, 2),
      ...tablasSobreLinea({ clave: 'respaldo', nombre: 'Tabla del respaldo', mat: 'pc1x6', x0: 0, x1: W, a: B, b: A, sobre: 0, desde: 0, junta: 0, paso: 2 }),
    ]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Une el respaldo a la base con dos tornillos desde abajo y cola; si quieres que se pliegue, usa una bisagra de piano.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 8 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Base', texto: 'Redondea las esquinas de la base y lija los cantos.' },
        { titulo: 'Respaldo y tope', texto: `Encola las dos tablas del respaldo de canto, corta el canto inferior en bisel de 20° y atorníllalo a la base. Pega el tope de ${lA / 10} cm al frente.` },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const banquito: ProyectoDef = {
  id: 'banquito',
  nombre: 'Banquito escalón infantil',
  descripcion: 'Piso de dos peldaños para que los niños alcancen el lavamanos o el mesón: base ancha, peldaños de pino y costados de terciado.',
  plan: 'gratis',
  horas: '2 a 3 horas',
  ...ficha('banquito'),
  params: [{ id: 'ancho', label: 'Ancho', unidad: 'cm', min: 30, max: 45, step: 1, default: 38 }],
  construir(params) {
    const W = params.ancho * 10
    const M = 'terc18'
    const t = 18
    const [a, e] = seccion('pc1x6')
    const H = 320
    const h1 = 160
    const D = 300
    const zm = 150
    const k = (b: string, x: number, y: number) => claveDim(b, M, x, y)
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - t]) {
      piezas.push(pieza(k('costadoAlto', H - e, zm), 'Costado (parte alta)', M, [x, 0, 0], [x + t, H - e, zm], 1))
      piezas.push(pieza(k('costadoBajo', h1 - e, D - zm), 'Costado (parte baja)', M, [x, 0, zm], [x + t, h1 - e, D], 1))
    }
    piezas.push(pieza(k('trasera', W - 2 * t, H - e - 100), 'Trasera', M, [t, 100, 0], [W - t, H - e, t], 2))
    piezas.push(pieza(k('contrahuella', W - 2 * t, H - e - h1), 'Contrahuella alta', M, [t, h1, zm - t], [W - t, H - e, zm], 2))
    piezas.push(pieza(k('frenteBajo', W - 2 * t, h1 - e - 40), 'Contrahuella baja', M, [t, 40, D - t], [W - t, h1 - e, D], 2))
    piezas.push(...lis('peldano', 'Peldaño superior', 'pc1x6', [0, H - e, 6], 0, W, 2, 3))
    piezas.push(...lis('peldano', 'Peldaño inferior', 'pc1x6', [0, h1 - e, D - a - 6], 0, W, 2, 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Pega cinta antideslizante en los peldaños y redondea todos los cantos.', 'El plano muestra cada costado en dos piezas: si prefieres, córtalo en una sola con forma de escalera.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 24 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Costados', texto: 'Encola y atornilla las dos partes de cada costado formando la escalera.' },
        { titulo: 'Trasera y contrahuellas', texto: 'Une los costados con la trasera y las dos contrahuellas. Revisa con la escuadra.' },
        { titulo: 'Peldaños', texto: 'Atornilla los peldaños desde arriba con tornillos avellanados y tapa con masilla. Lija y pinta con pintura al agua.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
function caballete(L: number, H: number, paso: [number, number]) {
  const [a, e] = seccion('pc2x4')
  const zc = 330
  const piezas: PiezaInstancia[] = [...lis('viga', 'Viga', 'pc2x4', [0, H - a, zc - e / 2], 0, L, 1, paso[0])]
  for (const x of [120, L - 120 - e])
    for (const s of [-1, 1]) {
      const pA: V3 = [x + e / 2, 30, zc + s * 280]
      const pB: V3 = [x + e / 2, H - a - 10, zc + s * (e / 2 + a / 2 + 4)]
      piezas.push(barra('pata', 'Pata', 'pc2x4', pA, pB, 'zy', [a, e], paso[1], { nota: 'extremos a 15°' }))
    }
  for (const x of [120 + e, L - 120 - 2 * e]) piezas.push(...lis('travesano', 'Travesaño', 'pc2x4', [x, 280, zc - 200], 2, 400, 1, paso[1], { nota: 'extremos a 15°' }))
  return piezas
}

export const caballetes: ProyectoDef = {
  id: 'caballetes',
  nombre: 'Par de caballetes de taller',
  descripcion: 'Dos caballetes de pino 2×4 con patas abiertas a 15°: la base para cortar, pintar o armar una mesa de trabajo con una puerta encima.',
  plan: 'gratis',
  horas: '3 horas',
  ...ficha('caballetes'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 60, max: 110, step: 1, default: 90 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 65, max: 85, step: 1, default: 75 },
  ],
  construir(params) {
    const L = params.largo * 10
    const H = params.alto * 10
    const uno = caballete(L, H, [1, 2])
    const piezas = [...uno, ...mover(caballete(L, H, [1, 2]), [0, 0, 800])]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Usa tornillos de 100 mm en las patas: los caballetes cargan peso de golpe.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: 2 * (4 * 2 + 4 * 2) }, { id: 't4x50', cantidad: 8 }]),
      pasos: [
        CORTE,
        { titulo: 'Vigas', texto: 'Marca en cada viga la posición de las patas, a 12 cm de cada extremo.' },
        { titulo: 'Patas y travesaños', texto: 'Atornilla las patas a los costados de la viga con sus extremos a 15° y une cada par con un travesaño a 28 cm del piso.', consejo: 'Arma el primer caballete y úsalo de plantilla para el segundo.' },
      ],
    }
  },
}

export const cajaHerramientas: ProyectoDef = {
  id: 'caja_herramientas',
  nombre: 'Caja de herramientas de madera',
  descripcion: 'Caja abierta con manilla central para llevar herramientas, artículos de limpieza o de jardín.',
  plan: 'gratis',
  horas: '2 a 3 horas',
  ...ficha('caja_herramientas'),
  params: [{ id: 'largo', label: 'Largo', unidad: 'cm', min: 35, max: 65, step: 1, default: 50 }],
  construir(params) {
    const L = params.largo * 10
    const [a, t] = seccion('pc1x6')
    const [p] = seccion('pc2x2')
    const D = a + 2 * t
    const Hc = 250
    const piezas: PiezaInstancia[] = []
    for (const x of [0, L - t]) piezas.push(...lis('cabecera', 'Cabecera', 'pc1x6', [x, 0, t], 1, Hc, 2, 1, { nota: 'cortar en punta y perforar para la manilla' }))
    piezas.push(...lis('fondo', 'Fondo', 'pc1x6', [t, 0, t], 0, L - 2 * t, 2, 1))
    for (const z of [0, D - t]) piezas.push(...lis('lado', 'Costado', 'pc1x3', [0, 0, z], 0, L, 1, 2))
    piezas.push(...lis('manilla', 'Manilla', 'pc2x2', [t, Hc - 25 - p, D / 2 - p / 2], 0, L - 2 * t, 1, 3, { nota: 'redondear las aristas' }))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Redondea la manilla con lija o cepillo para que no maltrate la mano.'],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: 16 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 2 }]),
      pasos: [
        CORTE,
        { titulo: 'Cabeceras y fondo', texto: 'Corta las cabeceras en punta (o con curva) y atorníllalas al fondo.' },
        { titulo: 'Costados', texto: 'Atornilla los costados a las cabeceras y al fondo.' },
        { titulo: 'Manilla', texto: 'Mete la manilla entre las cabeceras, a 2,5 cm del borde superior, con cola y un tornillo por lado.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const cajonArena: ProyectoDef = {
  id: 'cajon_arena',
  nombre: 'Arenero con tapa banca',
  descripcion: 'Arenero de tablas de deck impregnadas con tapa en dos mitades: cerrada protege la arena, abierta queda como dos bancas.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('cajon_arena'),
  params: [
    { id: 'lado', label: 'Lado', unidad: 'cm', min: 100, max: 160, step: 1, default: 120 },
    { id: 'filas', label: 'Tablas de alto', unidad: 'u', min: 2, max: 3, step: 1, default: 2 },
  ],
  construir(params) {
    const L = params.lado * 10
    const f = params.filas
    const [tA, tE] = seccion('deck')
    const [p] = seccion('pi2x2')
    const H = f * (tA + 3) - 3
    const piezas: PiezaInstancia[] = []
    for (let i = 0; i < f; i++) {
      const y = i * (tA + 3)
      for (const z of [0, L - tE]) piezas.push(...lis('lado', 'Tabla lateral', 'deck', [0, y, z], 0, L, 1, 1))
      for (const x of [0, L - tE]) piezas.push(...lis('cabeza', 'Tabla de cabecera', 'deck', [x, y, tE], 2, L - 2 * tE, 1, 1))
    }
    for (const x of [tE, L - tE - p]) for (const z of [tE, L - tE - p]) piezas.push(...lis('poste', 'Poste', 'pi2x2', [x, 0, z], 1, H, 0, 1))
    const mitad = L / 2 - 3
    for (const [z0, z1] of [
      [0, mitad],
      [L / 2 + 3, L],
    ]) {
      const n = Math.floor((z1 - z0 + 5) / (tA + 5))
      const j = (z1 - z0 - n * tA) / Math.max(1, n - 1)
      for (let i = 0; i < n; i++) piezas.push(...lis('tapa', 'Tabla de tapa', 'deck', [0, H, z0 + i * (tA + j)], 0, L, 2, 2))
      for (const x of [200, L - 200 - p]) piezas.push(...lis('travTapa', 'Travesaño de tapa', 'pi2x2', [x, H - p, Math.max(z0, tE + p + 5)], 2, Math.min(z1, L - tE - p - 5) - Math.max(z0, tE + p + 5), 1, 2))
    }
    const litros = Math.round(((L - 2 * tE) * (L - 2 * tE) * (H - 30)) / 1e6)
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Arena: unos ${litros} litros. Pon geotextil en el fondo para que drene y no salga maleza.`, 'Las bisagras de la tapa (tipo T o piano galvanizadas) no están en el presupuesto.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: f * 4 * 4 + 40 }, { id: 'protdeck', cantidad: Math.ceil(((4 * L * H) / 1e6) * 1 + (L * L) / 1e6) }]),
      pasos: [
        CORTE,
        { titulo: 'Caja', texto: 'Atornilla las tablas de los cuatro lados a los postes de las esquinas, con los tornillos a 2 cm del borde.' },
        { titulo: 'Tapa', texto: 'Arma cada mitad de la tapa atornillando sus tablas a dos travesaños. Une las mitades a la caja con bisagras para que al abrir queden como respaldos.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const pikler: ProyectoDef = {
  id: 'pikler',
  nombre: 'Triángulo Pikler',
  descripcion: 'Triángulo de escalar para niños de 6 meses a 6 años: dos marcos de pino 2×2 con peldaños cada 9 cm para trepar y explorar.',
  plan: 'pro',
  horas: '4 a 5 horas',
  ...ficha('pikler'),
  params: [
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 70, max: 85, step: 1, default: 78 },
    { id: 'fondo', label: 'Ancho de peldaños', unidad: 'cm', min: 50, max: 70, step: 1, default: 60 },
  ],
  construir(params) {
    const H = params.alto * 10
    const D = params.fondo * 10
    const [p] = seccion('pc2x2')
    const base = Math.round(H * 1.15)
    const x0 = 30
    const xa = base / 2
    const piezas: PiezaInstancia[] = []
    for (const z of [p / 2, D - p / 2])
      for (const xe of [x0, base - x0]) piezas.push(barra('pata', 'Pata', 'pc2x2', [xe, 25, z], [xa, H - 25, z], 'xy', [p, p], 1, { nota: 'cortes en ángulo' }))
    const pasoP = 90
    let peldanos = 0
    for (let y = 120; y < H - 110; y += pasoP)
      for (const xe of [x0, base - x0]) {
        const xc = xe + ((xa - xe) * (y - 25)) / (H - 50)
        piezas.push(...lis('peldano', 'Peldaño', 'pc2x2', [xc - p / 2, y - p / 2, p], 2, D - 2 * p, 0, 2, { nota: 'redondear las aristas' }))
        peldanos++
      }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Uso siempre con un adulto cerca y sobre una alfombra o colchoneta.', 'Redondea con lija todas las aristas de los peldaños y patas.'],
      herrajes: juntarHerrajes([{ id: 'perno', cantidad: 2 }, { id: 't4x50', cantidad: peldanos * 2 }, { id: 'cola', cantidad: 1 }, { id: 'lija120', cantidad: 4 }]),
      pasos: [
        CORTE,
        { titulo: 'Marcos', texto: 'Une cada par de patas en la punta con un perno, formando una A. Revisa que los dos marcos sean iguales.' },
        { titulo: 'Peldaños', texto: 'Encola y atornilla los peldaños entre los dos marcos, cada 9 cm, de abajo hacia arriba. Avellana y tapa los tornillos.', consejo: 'Haz una plantilla de 9 cm para marcar los peldaños.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
const PERROS = [
  { nombre: 'Pequeño (52 × 44 cm)', L: 520, D: 440 },
  { nombre: 'Mediano (72 × 54 cm)', L: 720, D: 540 },
  { nombre: 'Grande (100 × 70 cm)', L: 1000, D: 700 },
]

export const camaPerro: ProyectoDef = {
  id: 'cama_perro',
  nombre: 'Cama de madera para perro',
  descripcion: 'Cama elevada de listones con fondo de tablillas para que ventile el cojín y frente bajo para que el perro entre fácil.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('cama_perro'),
  params: [{ id: 'tamano', label: 'Tamaño', unidad: 'u', min: 0, max: 2, step: 1, default: 1, opciones: PERROS.map((p) => p.nombre) }],
  construir(params) {
    const t = PERROS[params.tamano]
    const c = cajonListones({ L: t.L, D: t.D, filas: 3, filasFrente: 1, tabla: 'pc1x4', poste: 'pc2x2', fondo: 'pc1x3', yF: 80, junta: 10, pasos: [1, 2, 1] })
    return {
      piezas: c.piezas,
      exterior: exteriorDe(c.piezas),
      avisos: [`Cojín de ${(t.L - 80) / 10} × ${(t.D - 80) / 10} cm (no está en el presupuesto).`],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: c.tornillos }, { id: 'cola', cantidad: 1 }, { id: 'barniz', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Base', texto: 'Atornilla los listones de apoyo entre las patas a 8 cm del piso y reparte las tablillas del fondo.' },
        { titulo: 'Costados', texto: 'Atornilla tres tablas atrás y a los lados, y una sola al frente para que el perro entre. Lija bien y barniza con barniz al agua.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const marcoCuadro: ProyectoDef = {
  id: 'marco_cuadro',
  nombre: 'Marco para cuadro',
  descripcion: 'Marco de pino con esquinas a inglete y fondo de MDF para láminas, fotos o espejos.',
  plan: 'gratis',
  horas: '1 a 2 horas',
  ...ficha('marco_cuadro'),
  params: [
    { id: 'ancho', label: 'Ancho de la imagen', unidad: 'cm', min: 15, max: 70, step: 1, default: 30 },
    { id: 'alto', label: 'Alto de la imagen', unidad: 'cm', min: 15, max: 90, step: 1, default: 40 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const [a, t] = seccion('pc1x3')
    const Wt = W + 2 * a
    const Ht = H + 2 * a
    const piezas: PiezaInstancia[] = []
    for (const y of [0, Ht - a]) piezas.push(...lis('horizontal', 'Travesaño (inglete 45°)', 'pc1x3', [0, y, 0], 0, Wt, 1, 1))
    for (const x of [0, Wt - a]) piezas.push(pieza(claveDim('vertical', 'pc1x3', Ht, 0), 'Lateral (inglete 45°)', 'pc1x3', [x, a, 0], [x + a, Ht - a, t], 1, { nota: `cortar a ${Ht / 10} cm por el lado largo` }))
    piezas.push(pieza(claveDim('fondo', 'hdf3', W + 20, H + 20), 'Fondo', 'hdf3', [a - 10, a - 10, t], [a + W + 10, a + H + 10, t + 3], 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Vidrio o acrílico de ${(W + 20) / 10} × ${(H + 20) / 10} cm aparte (vidriería). Haz un rebaje de 1 cm por detrás con router o pega un listón de tope.`],
      herrajes: juntarHerrajes([{ id: 'cola', cantidad: 1 }, { id: 'clavo1', cantidad: 16 }, { id: 'lija120', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Marco', texto: 'Corta las cuatro piezas a 45° con la ingletadora, encola las esquinas y prénsalas con una prensa de marcos o huincha de amarre.', consejo: 'Corta las piezas opuestas juntas para que midan exactamente lo mismo.' },
        { titulo: 'Fondo', texto: 'Pon el vidrio, la imagen y el fondo, y fíjalo con clavos pequeños por detrás. Agrega un colgador.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const libreroEscalera: ProyectoDef = {
  id: 'librero_escalera',
  nombre: 'Librero escalera',
  descripcion: 'Librero de muro inclinado como una escalera: repisas más profundas abajo y más angostas arriba.',
  plan: 'pro',
  horas: '4 a 5 horas',
  ...ficha('librero_escalera'),
  params: [
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 150, max: 200, step: 1, default: 180 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 90, step: 1, default: 65 },
    { id: 'repisas', label: 'Repisas', unidad: 'u', min: 3, max: 5, step: 1, default: 4 },
  ],
  construir(params) {
    const H = params.alto * 10
    const W = params.ancho * 10
    const n = params.repisas
    const [p] = seccion('pc2x2')
    const [a, t] = seccion('pc1x6')
    const ang = (12 * Math.PI) / 180
    const zt = 40
    const zb = zt + (H - 20) * Math.tan(ang)
    const piezas: PiezaInstancia[] = []
    for (const x of [p / 2, W - p / 2]) piezas.push(barra('larguero', 'Larguero', 'pc2x2', [x, 10, zb], [x, H - 10, zt], 'zy', [p, p], 1, { nota: 'extremos a 12°' }))
    const zEn = (y: number) => zb + ((zt - zb) * (y - 10)) / (H - 20)
    const ys = [...repartir(0, H - 300, n - 1, t), H - 300]
    ys.forEach((y, i) => {
      const tablas = i < Math.ceil(n / 2) ? 2 : 1
      for (let k = 0; k < tablas; k++) piezas.push(...lis('repisa', 'Tabla de repisa', 'pc1x6', [p, y, zEn(y) - p / 2 + k * (a + 3)], 0, W - 2 * p, 2, 2))
    })
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Fíjalo al muro con una escuadra arriba: no es una escalera para subir.'],
      herrajes: juntarHerrajes([{ id: 't4x50', cantidad: n * 4 }, { id: 'escuadra', cantidad: 1 }, { id: 'cola', cantidad: 1 }]),
      pasos: [
        CORTE,
        { titulo: 'Largueros', texto: 'Corta los extremos de los largueros a 12° para que apoyen planos en el piso y en el muro. Marca juntos la altura de cada repisa.' },
        { titulo: 'Repisas', texto: 'Atornilla las repisas entre los largueros con cola, las más profundas abajo. Apoya en el muro y fija con la escuadra.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const tumbona: ProyectoDef = {
  id: 'tumbona',
  nombre: 'Tumbona de jardín',
  descripcion: 'Silla reclinable larga de pino impregnado con tablas de deck: para la piscina o la terraza.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('tumbona'),
  params: [{ id: 'ancho', label: 'Ancho', unidad: 'cm', min: 55, max: 75, step: 1, default: 65 }],
  construir(params) {
    const W = params.ancho * 10
    const L = 1900
    const [rA, rE] = seccion('pi2x4')
    const [bA, bE] = seccion('pi2x3')
    const [tA] = seccion('deck')
    const yR = 200
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - rE]) piezas.push(...lis('larguero', 'Larguero', 'pi2x4', [x, yR, 0], 2, L, 1, 1))
    for (const x of [rE, W - rE - rA]) for (const z of [30, L - 30 - rE]) piezas.push(...lis('pata', 'Pata', 'pi2x4', [x, 0, z], 1, yR + rA, 0, 1))
    for (const z of [600, 1100]) piezas.push(...lis('travesano', 'Travesaño', 'pi2x3', [rE, yR, z], 0, W - 2 * rE, 1, 1))
    const yA = yR + rA
    const zs = filas(0, 1150, tA, 8)
    for (const z of zs) piezas.push(...lis('asiento', 'Tabla del asiento', 'deck', [0, yA, z], 0, W, 2, 2))
    const A: [number, number] = [L - 60, yA + bA / 2]
    const B: [number, number] = [1300, 950]
    for (const x of [rE + bE / 2 + 30, W - rE - bE / 2 - 30]) piezas.push(barra('respaldoBrazo', 'Brazo del respaldo', 'pi2x3', [x, A[1], A[0]], [x, B[1], B[0]], 'zy', [bA, bE], 3, { nota: 'extremos en ángulo' }))
    piezas.push(...tablasSobreLinea({ clave: 'respaldo', nombre: 'Tabla del respaldo', mat: 'deck', x0: 0, x1: W, a: A, b: B, sobre: bA / 2, desde: 30, junta: 8, paso: 3 }))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Respaldo fijo a unos 45°. Para hacerlo regulable agrega un puntal con bisagras (no cotizadas).', 'Cojín aparte.'],
      herrajes: juntarHerrajes([{ id: 'tdeck', cantidad: (zs.length + 8) * 2 + 16 }, { id: 'perno', cantidad: 8 }, { id: 'protdeck', cantidad: 3 }]),
      pasos: [
        CORTE,
        { titulo: 'Bastidor', texto: 'Une los largueros con los travesaños y aperna las cuatro patas por dentro.' },
        { titulo: 'Asiento', texto: 'Atornilla las tablas del asiento con 8 mm de junta desde los pies hasta el respaldo.' },
        { titulo: 'Respaldo', texto: 'Atornilla los brazos inclinados a los largueros y luego las tablas del respaldo. Aplica protector para deck.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const bandejaSofa: ProyectoDef = {
  id: 'bandeja_sofa',
  nombre: 'Bandeja para brazo de sofá',
  descripcion: 'Bandeja en U que se calza sobre el brazo del sofá para apoyar el café, el control o el celular.',
  plan: 'gratis',
  horas: '1 a 2 horas',
  ...ficha('bandeja_sofa'),
  params: [
    { id: 'brazo', label: 'Ancho del brazo del sofá', unidad: 'cm', min: 12, max: 30, step: 1, default: 20 },
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 30, max: 55, step: 1, default: 40 },
  ],
  construir(params) {
    const A = params.brazo * 10
    const L = params.largo * 10
    const [a, t] = seccion('pc1x6')
    const n = Math.ceil((A + 2 * t + 10) / a)
    const Wt = n * a
    const piezas: PiezaInstancia[] = []
    for (const x of [0, Wt - t]) piezas.push(...lis('costado', 'Costado', 'pc1x6', [x, 0, 0], 2, L, 1, 1))
    for (let i = 0; i < n; i++) piezas.push(...lis('cubierta', 'Tabla de cubierta', 'pc1x6', [i * a, a, 0], 2, L, 0, 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Hueco interior: ${(Wt - 2 * t) / 10} cm. Pega fieltro por dentro para no marcar el tapiz.`],
      herrajes: juntarHerrajes([{ id: 't4x40', cantidad: n * 4 }, { id: 'cola', cantidad: 1 }, { id: 'barniz', cantidad: 1 }]),
      pasos: [CORTE, { titulo: 'Costados', texto: 'Presenta los costados sobre el brazo del sofá para comprobar la holgura.' }, { titulo: 'Cubierta', texto: 'Encola y atornilla las tablas de cubierta sobre los costados. Lija y barniza.' }],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const tipi: ProyectoDef = {
  id: 'tipi',
  nombre: 'Tienda tipi infantil',
  descripcion: 'Estructura en A de pino 2×2 para armar una carpa de juego con una tela: liviana, desarmable y para usar en la pieza.',
  plan: 'pro',
  horas: '2 a 3 horas',
  ...ficha('tipi'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 100, max: 130, step: 1, default: 110 },
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 100, max: 150, step: 1, default: 120 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 120, max: 160, step: 1, default: 140 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const L = params.largo * 10
    const H = params.alto * 10
    const [p] = seccion('pc2x2')
    const piezas: PiezaInstancia[] = []
    for (const z of [p / 2, L - p / 2]) for (const x of [30, W - 30]) piezas.push(barra('pata', 'Pata', 'pc2x2', [x, 25, z], [W / 2, H - 25, z], 'xy', [p, p], 1, { nota: 'cortes en ángulo; perforar la punta' }))
    piezas.push(...lis('cumbrera', 'Cumbrera', 'pc2x2', [W / 2 - p / 2, H - 40 - p, p], 2, L - 2 * p, 0, 2))
    for (const x of [0, W - p]) piezas.push(...lis('base', 'Travesaño de piso', 'pc2x2', [x, 0, p], 2, L - 2 * p, 0, 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Tela aparte: unos ${Math.ceil((2 * Math.hypot(W / 2, H) * L) / 1e6 + 1)} m² de lona o crudo, cosida como funda.`],
      herrajes: juntarHerrajes([{ id: 'perno', cantidad: 2 }, { id: 'lija120', cantidad: 3 }]),
      pasos: [CORTE, { titulo: 'Marcos en A', texto: 'Une cada par de patas por la punta con un perno, cruzadas, para que la cumbrera apoye entre ellas.' }, { titulo: 'Cumbrera y base', texto: 'Apoya la cumbrera sobre los dos cruces y une las patas abajo con los travesaños de piso. Pon la funda de tela.' }],
    }
  },
}

export const INSPIRACION: ProyectoDef[] = [
  bandejaBotas,
  cajaListones,
  casaPajaros,
  tablaPicar,
  portaPlantas,
  maceteroAlto,
  vinoteca,
  soporteMonitor,
  atril,
  banquito,
  caballetes,
  cajaHerramientas,
  cajonArena,
  pikler,
  camaPerro,
  marcoCuadro,
  libreroEscalera,
  tumbona,
  bandejaSofa,
  tipi,
]

