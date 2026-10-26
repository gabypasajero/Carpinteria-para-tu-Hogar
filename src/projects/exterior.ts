import type { PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { lis } from './kit'
import { casa } from './obra'
import { barra, cada, claveDim, exteriorDe, juntarHerrajes, redondear, seccion, type V3 } from './util'

const CORTE: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte y pinta los cortes con protector o impregnante: el corte expone la madera sin impregnar.',
  consejo: 'Usa tornillos y herrajes galvanizados o zincados: los comunes se oxidan y manchan la madera.',
}

/** Postes repartidos para que cada empalme de un listón de largo L caiga sobre un poste (k tramos). */
function postesAlineados(L: number, ancho: number, sepMax: number, largoComercial: number): number[] {
  const k = Math.ceil(L / largoComercial)
  const n = k * Math.ceil(Math.ceil((L - ancho) / sepMax) / k) + 1
  return Array.from({ length: n }, (_, i) => (i * (L - ancho)) / (n - 1))
}

/** Tablas inclinadas sobre una línea (z, y) de a hacia b, a una distancia `sobre` de ella (techos y asientos). */
function tablasInclinadas(o: { clave: string; nombre: string; mat: string; x0: number; x1: number; a: [number, number]; b: [number, number]; sobre: number; desde: number; hasta?: number; junta: number; paso: number }) {
  const [tA, tE] = seccion(o.mat)
  const dz = o.b[0] - o.a[0]
  const dy = o.b[1] - o.a[1]
  const largo = Math.hypot(dz, dy)
  const u = [dz / largo, dy / largo]
  // Normal del plano hacia arriba: las tablas quedan sobre la línea.
  const signo = dz >= 0 ? 1 : -1
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

// ---------------------------------------------------------------------------------------------
export const deck: ProyectoDef = {
  id: 'deck',
  nombre: 'Deck de madera',
  descripcion: 'Terraza de tablas impregnadas 1½×5" sobre travesaños cada 40 cm, vigas 2×6 y polines con base metálica, según la guía de instalación de Arauco.',
  plan: 'pro',
  horas: '2 a 4 días',
  ...ficha('deck'),
  params: [
    { id: 'largo', label: 'Largo (sentido de las tablas)', unidad: 'cm', min: 150, max: 600, step: 1, default: 300 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 120, max: 320, step: 1, default: 240 },
    { id: 'altura', label: 'Altura sobre el suelo', unidad: 'cm', min: 40, max: 100, step: 1, default: 45 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const Hd = params.altura * 10
    const [jA, jE] = seccion('pi2x4')
    const [vA, vE] = seccion('pi2x6')
    const P = seccion('polin45')[0]
    const [tA, tE] = seccion('deck')
    const yJ = Hd - tE - jA
    const yV = yJ - vA
    const piezas: PiezaInstancia[] = []
    const xsP = postesAlineados(L, P, 1500, 3200)
    const nb = Math.max(2, Math.ceil((W - P) / 1800) + 1)
    const zsV = Array.from({ length: nb }, (_, i) => P / 2 + (i * (W - P)) / (nb - 1))
    for (const z of zsV) {
      for (const x of xsP) piezas.push(...lis('poste', 'Poste', 'polin45', [x, 0, z - P / 2], 1, yV, 0, 1))
      piezas.push(...lis('viga', 'Viga', 'pi2x6', [0, yV, z - vE / 2], 0, L, 1, 2))
    }
    const xsJ = postesAlineados(L, jE, 400, 3200)
    for (const x of xsJ) piezas.push(...lis('travesano', 'Travesaño', 'pi2x4', [x, yJ, 0], 2, W, 1, 3))
    const n = Math.floor((W + 5) / (tA + 5))
    const junta = (W - n * tA) / (n - 1)
    for (let i = 0; i < n; i++) piezas.push(...lis('tabla', 'Tabla de deck', 'deck', [0, Hd - tE, i * (tA + junta)], 0, L, 2, 4))
    const postes = xsP.length * nb
    const avisos = [`Junta entre tablas: ${junta.toFixed(1)} mm (mínimo 5 mm).`, `Cada poste va sobre un poyo de hormigón (${postes} poyos, no están en el presupuesto).`]
    if (Hd >= 1000) avisos.push('A 1 m o más del suelo necesitas baranda de al menos 95 cm (OGUC).')
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes([
        { id: 'basepilar', cantidad: postes },
        { id: 'perno', cantidad: postes * 2 },
        { id: 'tdeck', cantidad: n * xsJ.length * 2 + xsJ.length * nb * 2 },
        { id: 'protdeck', cantidad: Math.ceil((L * W) / 1e6) },
      ]),
      pasos: [
        CORTE,
        {
          titulo: 'Poyos y postes',
          texto: 'Marca la grilla de poyos con lienza, haz los poyos de hormigón con la base metálica embebida y, cuando fragüen, atornilla los postes cortados a la misma altura.',
          consejo: 'Nivela las bases con manguera de nivel: corregir después es mucho más difícil.',
        },
        { titulo: 'Vigas', texto: 'Apoya las vigas 2×6 de canto sobre los postes y fíjalas con pernos. Los empalmes deben caer sobre un poste.' },
        { titulo: 'Travesaños', texto: 'Reparte los travesaños cada 40 cm como máximo sobre las vigas y fíjalos con tornillos en diagonal o escuadras.' },
        {
          titulo: 'Tablas y protector',
          texto: 'Atornilla las tablas con 5 mm de junta: dos tornillos en los extremos y uno o dos en cada travesaño, perforando antes. Los empalmes van sobre un travesaño. Aplica protector con tinte (no barniz).',
          consejo: 'Usa un clavo de 5 mm como separador entre tablas.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const pergola: ProyectoDef = {
  id: 'pergola',
  nombre: 'Pérgola de madera',
  descripcion: 'Pérgola de polines con base metálica, vigas dobles 2×6 apernadas, cabios 2×4 cada 50 cm y diagonales de arriostre.',
  plan: 'pro',
  horas: '2 a 3 días',
  ...ficha('pergola'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 200, max: 320, step: 1, default: 300 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 200, max: 320, step: 1, default: 280 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 220, max: 250, step: 1, default: 240 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const [cA, cE] = seccion('pi2x4')
    const [vA, vE] = seccion('pi2x6')
    const [dA, dE] = seccion('pi2x3')
    const P = seccion('polin45')[0]
    const Hp = params.alto * 10 - cA
    const vuelo = 300
    const piezas: PiezaInstancia[] = []
    const xsP = [vuelo, L - vuelo - P]
    const zsP = [250 + vE, W - 250 - vE - P]
    for (const x of xsP) for (const z of zsP) piezas.push(...lis('poste', 'Poste', 'polin45', [x, 0, z], 1, Hp, 0, 1))
    for (const z of zsP) for (const zv of [z - vE, z + P]) piezas.push(...lis('viga', 'Viga', 'pi2x6', [0, Hp - vA, zv], 0, L, 1, 2))
    const xsC = cada(0, L, cE, 500)
    for (const x of xsC) piezas.push(...lis('cabio', 'Cabio', 'pi2x4', [x, Hp, 0], 2, W, 1, 3))
    for (const z of zsP)
      for (const [x, s] of [
        [vuelo + P, 1],
        [L - vuelo - P, -1],
      ]) {
        const a: V3 = [x + s * 30, Hp - vA - 520, z + P / 2]
        const b: V3 = [x + s * 520, Hp - vA - 30, z + P / 2]
        piezas.push(barra('diagonal', 'Diagonal', 'pi2x3', a, b, 'xy', [dA, dE], 4, { nota: 'extremos a 45°' }))
      }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Los postes van sobre poyos de hormigón con la base metálica (no están en el presupuesto).', 'Para más rigidez, agrega también diagonales en el otro sentido.'],
      herrajes: juntarHerrajes([
        { id: 'basepilar', cantidad: 4 },
        { id: 'perno', cantidad: 16 + 8 },
        { id: 'tdeck', cantidad: xsC.length * 4 + 8 },
        { id: 'protdeck', cantidad: Math.ceil((L * W) / 1e6 + 2) },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Poyos y postes', texto: 'Haz los cuatro poyos con la base metálica a escuadra (diagonales iguales) y atornilla los postes. Aplómalos con nivel y afírmalos con puntales provisorios.' },
        { titulo: 'Vigas dobles', texto: 'Aperna una viga a cada lado de los postes, a ras arriba, con dos pernos por poste. Deja 30 cm de vuelo a cada lado.' },
        { titulo: 'Cabios', texto: 'Reparte los cabios cada 50 cm sobre las vigas y fíjalos con tornillos en diagonal o escuadras.' },
        { titulo: 'Diagonales', texto: 'Corta las diagonales a 45° y atorníllalas entre cada poste y su viga. Aplica protector con tinte.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const jardinera: ProyectoDef = {
  id: 'jardinera',
  nombre: 'Jardinera elevada',
  descripcion: 'Huerto elevado de tablas de deck impregnadas atornilladas a postes 2×2 impregnados, apto para contacto con tierra.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('jardinera'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 80, max: 240, step: 1, default: 120 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 100, step: 1, default: 60 },
    { id: 'filas', label: 'Tablas de alto', unidad: 'u', min: 2, max: 5, step: 1, default: 3, ayuda: 'Cada tabla suma unos 12 cm.' },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const f = params.filas
    const [tA, tE] = seccion('deck')
    const [p] = seccion('pi2x2')
    const H = f * (tA + 3) - 3
    const piezas: PiezaInstancia[] = []
    for (let i = 0; i < f; i++) {
      const y = i * (tA + 3)
      for (const z of [0, W - tE]) piezas.push(...lis('lado', 'Tabla lateral', 'deck', [0, y, z], 0, L, 1, 2))
      for (const x of [0, L - tE]) piezas.push(...lis('cabeza', 'Tabla de cabecera', 'deck', [x, y, tE], 2, W - 2 * tE, 1, 2))
    }
    const xs = [tE, L - tE - p, ...(L > 1200 ? [L / 2 - p / 2] : [])]
    for (const x of xs) for (const z of [tE, W - tE - p]) piezas.push(...lis('poste', 'Poste', 'pi2x2', [x, 0, z], 1, H, 0, 1))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Forra el interior con plástico grueso (no el fondo) y pon malla antitopos abajo si hay roedores.', `Volumen de tierra: unos ${Math.round((((L - 2 * tE) * (W - 2 * tE) * H) / 1e9) * 1000)} litros.`],
      herrajes: juntarHerrajes([
        { id: 'tdeck', cantidad: f * 4 * 4 + (L > 1200 ? f * 4 : 0) },
        { id: 'protdeck', cantidad: Math.ceil((2 * (L + W) * H) / 1e6) },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Postes', texto: 'Arma primero las dos cabeceras: atornilla las tablas de cabecera a dos postes cada una, a escuadra.' },
        { titulo: 'Tablas', texto: 'Une las cabeceras con las tablas laterales (dos tornillos por poste y tabla). Ubica la jardinera nivelada y llénala con tierra de hoja.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const mesaPicnic: ProyectoDef = {
  id: 'mesa_picnic',
  nombre: 'Mesa de picnic con bancas',
  descripcion: 'Mesa de picnic clásica de pino impregnado 2×6 con bancas integradas, patas inclinadas, pernos coche y diagonales al centro.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('mesa_picnic'),
  params: [{ id: 'largo', label: 'Largo', unidad: 'cm', min: 150, max: 240, step: 1, default: 180, ayuda: '60 cm por persona y lado.' }],
  construir(params) {
    const L = params.largo * 10
    const [bA, bE] = seccion('pi2x6')
    const [cA, cE] = seccion('pi2x4')
    const Dt = 1500
    const zc = Dt / 2
    const anchoC = 5 * bA + 4 * 6
    const zC0 = zc - anchoC / 2
    const piezas: PiezaInstancia[] = []
    for (let i = 0; i < 5; i++) piezas.push(...lis('cubierta', 'Tabla de cubierta', 'pi2x6', [0, 760 - bE, zC0 + i * (bA + 6)], 0, L, 2, 3))
    for (const z of [bE, bE + bA + 6, Dt - bE - 2 * bA - 6, Dt - bE - bA]) piezas.push(...lis('asiento', 'Tabla de banca', 'pi2x6', [0, 450 - bE, z], 0, L, 2, 3))
    const marcos = [
      { xs: 250, xp: 250 + cE },
      { xs: L - 250 - cE, xp: L - 250 - 2 * cE },
    ]
    for (const m of marcos) {
      piezas.push(...lis('apoyoCub', 'Apoyo de cubierta', 'pi2x4', [m.xs, 760 - bE - cA, zC0], 2, anchoC, 1, 1))
      piezas.push(...lis('apoyoBanca', 'Apoyo de bancas', 'pi2x6', [m.xs, 450 - bE - bA, bE], 2, Dt - 2 * bE, 1, 1))
      for (const s of [-1, 1]) {
        const a: V3 = [m.xp + cE / 2, 40, zc + s * (zc - 230)]
        const b: V3 = [m.xp + cE / 2, 760 - bE - 10, zc + s * 120]
        piezas.push(barra('pata', 'Pata', 'pi2x6', a, b, 'zy', [bA, bE], 1, { nota: 'extremos en ángulo, presentar y marcar' }))
      }
    }
    piezas.push(...lis('apoyoCentral', 'Apoyo central', 'pi2x4', [L / 2 - cE / 2, 760 - bE - cA, zC0], 2, anchoC, 1, 2))
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? 250 + cE + 30 : L - 250 - cE - 30
      const x1 = s < 0 ? L / 2 - cE / 2 - 30 : L / 2 + cE / 2 + 30
      piezas.push(barra('diagonal', 'Diagonal', 'pi2x4', [x0, 450 - bE - bA / 2, zc], [x1, 760 - bE - cA - 20, zc], 'xy', [cA, cE], 2, { nota: 'extremos en ángulo' }))
    }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Cubierta a 76 cm y bancas a 45 cm del suelo.'],
      herrajes: juntarHerrajes([
        { id: 'perno', cantidad: 16 },
        { id: 'tdeck', cantidad: 5 * 3 * 2 + 4 * 2 * 2 + 8 },
        { id: 'protdeck', cantidad: Math.ceil(((L * (anchoC + 4 * bA)) / 1e6) * 2) },
      ]),
      pasos: [
        CORTE,
        {
          titulo: 'Arma los dos marcos',
          texto: 'En el piso, presenta las dos patas cruzando el apoyo de cubierta y el de bancas, marca los cortes en ángulo y une todo con pernos coche.',
          consejo: 'Arma el primer marco, verifica medidas y úsalo de plantilla para el segundo.',
        },
        { titulo: 'Apoyo central y diagonales', texto: 'Para los marcos y atornilla una tabla de cubierta provisoria. Instala el apoyo central y las dos diagonales desde los apoyos de bancas.' },
        { titulo: 'Cubierta y bancas', texto: 'Atornilla las tablas de cubierta y de bancas con 6 mm de junta y dos tornillos por apoyo. Lija los cantos y aplica protector.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const adirondack: ProyectoDef = {
  id: 'adirondack',
  nombre: 'Silla Adirondack',
  descripcion: 'La clásica silla de jardín de asiento bajo y respaldo inclinado, con brazos anchos para apoyar un vaso. Pino 1×6 y 1×4.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('adirondack'),
  params: [{ id: 'ancho', label: 'Ancho total', unidad: 'cm', min: 65, max: 80, step: 1, default: 72 }],
  construir(params) {
    const Wt = params.ancho * 10
    const D = 850
    const [aA, aE] = seccion('pc1x6')
    const [tA, tE] = seccion('pc1x4')
    const piezas: PiezaInstancia[] = []
    for (const x of [60, Wt - 60 - aE]) piezas.push(...lis('pataDel', 'Pata delantera', 'pc1x6', [x, 0, D - 40 - aA], 1, 560, 2, 1))
    const S0: [number, number] = [D - 40, 400]
    const S1: [number, number] = [120, 75]
    for (const x of [60 + aE + aE / 2, Wt - 60 - aE - aE / 2])
      piezas.push(barra('larguero', 'Larguero del asiento', 'pc1x6', [x, S0[1], S0[0]], [x, S1[1], S1[0]], 'zy', [aA, aE], 1, { nota: 'extremos en ángulo' }))
    piezas.push(...lis('faldon', 'Faldón delantero', 'pc1x4', [60, 300, D - 40], 0, Wt - 120, 1, 1))
    // Asiento: tablas sobre el canto de los largueros.
    piezas.push(...tablasInclinadas({ clave: 'tablaAsiento', nombre: 'Tabla del asiento', mat: 'pc1x4', x0: 60 + aE, x1: Wt - 60 - aE, a: S0, b: S1, sobre: aA / 2, desde: 20, hasta: 470, junta: 8, paso: 2 }))
    // Respaldo inclinado 20° hacia atrás desde el fondo del asiento.
    const lz = S1[0] - S0[0]
    const ly = S1[1] - S0[1]
    const ll = Math.hypot(lz, ly)
    const B0: [number, number] = [S0[0] + (lz / ll) * 520, S0[1] + (ly / ll) * 520 + aA / 2]
    const B1: [number, number] = [B0[0] - Math.tan((20 * Math.PI) / 180) * 700, B0[1] + 700]
    const zEn = (y: number) => B0[0] + ((B1[0] - B0[0]) * (y - B0[1])) / (B1[1] - B0[1])
    piezas.push(...lis('travRespInf', 'Travesaño inferior del respaldo', 'pc1x4', [60 + 2 * aE, 235, zEn(280) - tE / 2 - tE - 1], 0, Wt - 120 - 4 * aE, 1, 3))
    const zSup = zEn(515) - tE / 2 - tE - 1
    piezas.push(...lis('travRespSup', 'Travesaño superior del respaldo', 'pc1x4', [0, 470, zSup], 0, Wt, 1, 3))
    const libre = Wt - 2 * (aA + 5)
    const n = Math.max(3, Math.floor((libre + 10) / (tA + 10)))
    const paso = (libre - tA) / (n - 1)
    for (let i = 0; i < n; i++) {
      const xc = aA + 5 + tA / 2 + i * paso
      piezas.push(barra('tablaResp', 'Tabla del respaldo', 'pc1x4', [xc, B0[1], B0[0]], [xc, B1[1], B1[0]], 'zy', [tE, tA], 3, { nota: 'punta redondeada' }))
    }
    for (const x of [0, Wt - aA]) piezas.push(...lis('brazo', 'Brazo', 'pc1x6', [x, 560, zSup], 2, D - zSup, 0, 4))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Las curvas de los brazos, las patas y la punta del respaldo se marcan con una plantilla de cartón y se cortan con caladora.'],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 8 + 6 * 4 + n * 4 + 8 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Base', texto: 'Atornilla cada larguero por dentro de su pata delantera, con el extremo trasero apoyado en el suelo. Une las patas con el faldón delantero.' },
        { titulo: 'Asiento', texto: 'Atornilla las tablas del asiento sobre los largueros, de adelante hacia atrás, con 8 mm de junta.' },
        { titulo: 'Respaldo', texto: 'Fija los travesaños del respaldo y atornilla las tablas inclinadas 20° hacia atrás, repartidas de forma pareja.', consejo: 'Presenta la tabla central primero y alinea las demás con ella.' },
        { titulo: 'Brazos', texto: 'Apoya los brazos sobre las patas delanteras y el travesaño superior del respaldo y atorníllalos. Lija los cantos y aplica barniz marino.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
const PERROS = [
  { nombre: 'Pequeño (hasta 10 kg)', L: 700, W: 600, Hm: 500, puerta: [300, 380] },
  { nombre: 'Mediano (10 a 25 kg)', L: 900, W: 750, Hm: 650, puerta: [380, 480] },
  { nombre: 'Grande (más de 25 kg)', L: 1150, W: 900, Hm: 800, puerta: [450, 600] },
]

export const casaPerro: ProyectoDef = {
  id: 'casa_perro',
  nombre: 'Casa de perro',
  descripcion: 'Casa de perro con piso elevado, muros de entramado 2×2 impregnado revestidos con OSB y techo a dos aguas. Tres tamaños.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('casa_perro'),
  params: [{ id: 'tamano', label: 'Tamaño del perro', unidad: 'u', min: 0, max: 2, step: 1, default: 1, opciones: PERROS.map((p) => p.nombre) }],
  construir(params) {
    const t = PERROS[params.tamano]
    const c = 11.1
    const k = casa({
      L: t.L,
      W: t.W,
      Hm: t.Hm,
      piso: { vigas: 'pi2x2', sep: 400, placa: 'osb11' },
      muro: { mat: 'pi2x2', sep: 400, revest: 'osb11', cadenetas: false },
      techo: { cabios: 'pi2x2', sep: 400, pendiente: 30, placa: 'osb11' },
      vanos: { frente: [{ desde: (t.L - 2 * c) / 2 - t.puerta[0] / 2, ancho: t.puerta[0], alto: t.puerta[1] }] },
      pasos: { piso: 1, muros: 2, revest: 3, techo: 4 },
    })
    return {
      piezas: k.piezas,
      exterior: exteriorDe(k.piezas),
      avisos: [`Cubierta de techo aparte (zinc o tejuela asfáltica, unos ${Math.ceil(k.areaTecho * 10) / 10} m²).`, 'Pinta el OSB por fuera con pintura para exterior y deja el piso elevado del suelo.'],
      herrajes: juntarHerrajes([
        { id: 'clavo2', cantidad: k.piezasEntramado * 4 + k.nCabios * 4 + k.nVigas * 4 },
        { id: 'tdeck', cantidad: Math.ceil((k.areaRevest + k.areaTecho + k.areaPiso) * 12) },
        { id: 'protdeck', cantidad: Math.ceil(k.areaPiso + 1) },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Piso', texto: 'Clava las vigas de piso y atornilla encima la placa de OSB.' },
        { titulo: 'Muros', texto: 'Arma los cuatro muros de entramado en el piso, con el vano de la puerta en el frontal, y únelos entre sí y al piso.' },
        { titulo: 'Revestimiento', texto: 'Atornilla el OSB por fuera cada 15 cm y recorta la puerta con caladora. Redondea los bordes de la puerta.' },
        { titulo: 'Techo', texto: 'Instala los cabios a 30° y la cumbrera, atornilla las placas de techo, cierra los frontones y pon la cubierta.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const lenera: ProyectoDef = {
  id: 'lenera',
  nombre: 'Leñera',
  descripcion: 'Leñera ventilada de pino impregnado con piso elevado de listones, tablas separadas en los costados y techo de una caída.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('lenera'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 100, max: 200, step: 1, default: 150 },
    { id: 'alto', label: 'Alto al frente', unidad: 'cm', min: 120, max: 180, step: 1, default: 150 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 50, max: 80, step: 1, default: 60 },
  ],
  construir(params) {
    const L = params.largo * 10
    const Hf = params.alto * 10 - 100
    const D = params.fondo * 10
    const Hb = Hf - 150
    const [pA, pE] = seccion('pi2x3')
    const [sA] = seccion('pi2x2')
    const [tA, tE] = seccion('pc1x4')
    const s = tE
    const piezas: PiezaInstancia[] = []
    for (const x of [s, L - s - pE]) {
      piezas.push(...lis('posteDel', 'Poste delantero', 'pi2x3', [x, 0, D - pA], 1, Hf, 2, 1))
      piezas.push(...lis('posteTras', 'Poste trasero', 'pi2x3', [x, 0, 0], 1, Hb, 2, 1))
    }
    piezas.push(...lis('soleraSup', 'Solera superior', 'pi2x3', [s, Hf, D - pA], 0, L - 2 * s, 2, 1))
    piezas.push(...lis('soleraSup', 'Solera superior', 'pi2x3', [s, Hb, 0], 0, L - 2 * s, 2, 1))
    for (const z of [0, D - pE]) piezas.push(...lis('larguero', 'Larguero del piso', 'pi2x3', [s + pE, 100, z], 0, L - 2 * s - 2 * pE, 1, 2))
    const xsP = cada(s + pE, L - s - pE, sA, 150)
    for (const x of xsP) piezas.push(...lis('listonPiso', 'Listón del piso', 'pi2x2', [x, 100 + pA, 0], 2, D, 0, 2))
    const y0 = 100 + pA + sA + 10
    let filas = 0
    for (let y = y0; y + tA <= Hb - 20; y += tA + 30) {
      filas++
      piezas.push(...lis('tablaTras', 'Tabla trasera', 'pc1x4', [s, y, pA], 0, L - 2 * s, 1, 3))
      for (const x of [0, L - s]) piezas.push(...lis('tablaLado', 'Tabla lateral', 'pc1x4', [x, y, 0], 2, D, 1, 3))
    }
    // Techo de una caída: cabios de la solera trasera a la delantera y tablas encima.
    const a: [number, number] = [30, Hb + pE + sA / 2]
    const b: [number, number] = [D - 30, Hf + pE + sA / 2]
    const xsC = cada(s, L - s - sA, sA, 500)
    for (const x of xsC) piezas.push(barra('cabio', 'Cabio', 'pi2x2', [x + sA / 2, a[1], a[0]], [x + sA / 2, b[1], b[0]], 'zy', [sA, sA], 4, { nota: 'extremos en ángulo' }))
    const techo = tablasInclinadas({ clave: 'tablaTecho', nombre: 'Tabla de techo', mat: 'pc1x4', x0: 0, x1: L, a, b, sobre: sA / 2, desde: 0, junta: 2, paso: 4 })
    piezas.push(...techo)
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Para que el techo no filtre, cúbrelo con una plancha de zinc o fieltro asfáltico (no está en el presupuesto).', 'Las tablas separadas ventilan la leña: no las juntes.'],
      herrajes: juntarHerrajes([
        { id: 'tdeck', cantidad: 4 * 4 + 8 + xsC.length * 4 + xsP.length * 2 },
        { id: 'clavo3', cantidad: filas * 3 * 4 + techo.length * xsC.length * 2 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Marcos', texto: 'Une cada poste delantero con su trasero y las soleras superiores. El frente queda 15 cm más alto para que el agua escurra hacia atrás.' },
        { titulo: 'Piso', texto: 'Atornilla los largueros a 10 cm del suelo y clava los listones del piso cada 15 cm.' },
        { titulo: 'Tablas', texto: 'Clava las tablas de los costados y de atrás con 3 cm de separación.' },
        { titulo: 'Techo', texto: 'Atornilla los cabios inclinados de solera a solera y clava encima las tablas de techo.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const cerco: ProyectoDef = {
  id: 'cerco',
  nombre: 'Cerco de madera',
  descripcion: 'Cerco de tablas verticales sobre soleras 2×3 y polines con base metálica. Los empalmes de las soleras caen siempre sobre un poste.',
  plan: 'pro',
  horas: '1 a 3 días',
  ...ficha('cerco'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 200, max: 1200, step: 10, default: 600 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 100, max: 180, step: 1, default: 150 },
    { id: 'sep', label: 'Separación máxima de postes', unidad: 'cm', min: 150, max: 240, step: 10, default: 200 },
  ],
  construir(params) {
    const L = params.largo * 10
    const H = params.alto * 10
    const P = seccion('polin')[0]
    const [, sE] = seccion('pi2x3')
    const [tA] = seccion('pc1x4')
    const piezas: PiezaInstancia[] = []
    const xsP = postesAlineados(L, P, params.sep * 10, 3200)
    for (const x of xsP) piezas.push(...lis('poste', 'Poste', 'polin', [x, 0, 0], 1, H + 50, 0, 1))
    for (const y of [200, H - 250]) piezas.push(...lis('solera', 'Solera', 'pi2x3', [0, y, P], 0, L, 1, 2))
    const n = Math.floor((L + 20) / (tA + 20))
    const xsT = Array.from({ length: n }, (_, i) => (i * (L - tA)) / (n - 1))
    for (const x of xsT) piezas.push(...lis('tabla', 'Tabla', 'pc1x4', [x, 100, P + sE], 1, H - 100, 0, 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Revisa con la Dirección de Obras la altura y transparencia que permite el Plan Regulador de tu comuna.', `Cada poste va sobre un poyo de hormigón con base metálica (${xsP.length} poyos, no están en el presupuesto).`],
      herrajes: juntarHerrajes([
        { id: 'basepilar', cantidad: xsP.length },
        { id: 'perno', cantidad: xsP.length * 2 },
        { id: 'tdeck', cantidad: xsP.length * 2 * 2 },
        { id: 'clavo3', cantidad: n * 4 },
        { id: 'protdeck', cantidad: Math.ceil((2 * L * H) / 1e6) },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Poyos y postes', texto: 'Tira una lienza, haz los poyos con la base metálica alineada y atornilla los postes aplomados.', consejo: 'Instala primero los postes de los extremos y alinea los demás con la lienza.' },
        { titulo: 'Soleras', texto: 'Atornilla las dos soleras por la cara de los postes, niveladas. Los empalmes deben quedar al centro de un poste.' },
        { titulo: 'Tablas', texto: 'Clava las tablas verticales con 2 cm de separación usando un taco como guía y aplica protector.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const bodega: ProyectoDef = {
  id: 'bodega',
  nombre: 'Bodega de jardín',
  descripcion: 'Bodega de herramientas con piso de OSB sobre vigas impregnadas, muros de entramado 2×3 revestidos con OSB, puerta, ventana y techo a dos aguas.',
  plan: 'pro',
  horas: '4 a 6 días',
  ...ficha('bodega'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 150, max: 300, step: 1, default: 200 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 120, max: 250, step: 1, default: 180 },
    { id: 'alto', label: 'Alto de muros', unidad: 'cm', min: 190, max: 220, step: 1, default: 200 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const Hm = params.alto * 10
    const c = 11.1
    const [a] = seccion('pd2x3')
    const ladoZ = W - 2 * c - 2 * a
    const k = casa({
      L,
      W,
      Hm,
      piso: { vigas: 'pi2x4', sep: 400, placa: 'osb15' },
      muro: { mat: 'pd2x3', sep: 600, revest: 'osb11', cadenetas: true },
      techo: { cabios: 'pi2x4', sep: 600, pendiente: 25, placa: 'osb11' },
      vanos: {
        frente: [{ desde: (L - 2 * c) / 2 - 400, ancho: 800, alto: Math.min(1800, Hm - 150) }],
        der: [{ desde: ladoZ / 2 - 300, ancho: 600, alto: 1600, antepecho: 1000 }],
      },
      pasos: { piso: 1, muros: 2, revest: 3, techo: 4 },
    })
    return {
      piezas: k.piezas,
      exterior: exteriorDe(k.piezas),
      avisos: [
        `Cubierta de techo aparte (zinc, onda o tejuela, unos ${Math.ceil(k.areaTecho)} m²), además de puerta, ventana y poyos de hormigón.`,
        'Pinta el OSB exterior con pintura para exterior o cúbrelo con siding.',
      ],
      herrajes: juntarHerrajes([
        { id: 'clavo4', cantidad: k.piezasEntramado * 4 + k.nCabios * 4 },
        { id: 'clavo3', cantidad: k.nVigas * 6 },
        { id: 'tdeck', cantidad: Math.ceil((k.areaRevest + k.areaTecho + k.areaPiso) * 10) },
        { id: 'escuadra', cantidad: 8 + k.nCabios },
        { id: 'protdeck', cantidad: Math.ceil(k.areaPiso + 2) },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Piso', texto: 'Nivela las vigas impregnadas sobre poyos cada 1 m como máximo y atornilla las placas de OSB del piso.' },
        { titulo: 'Muros', texto: 'Arma cada muro en el piso con pies derechos cada 60 cm, cadenetas, dinteles y jambas en los vanos. Levántalos, aplómalos y únelos.' },
        { titulo: 'Revestimiento', texto: 'Atornilla las placas de OSB por fuera cada 15 cm en los bordes y 30 cm al centro, recortando la puerta y la ventana.' },
        { titulo: 'Techo', texto: 'Instala la cumbrera y los cabios a 25° con escuadras, atornilla el OSB del techo, cierra los frontones y pon la cubierta.' },
      ],
    }
  },
}

export const EXTERIOR: ProyectoDef[] = [deck, pergola, jardinera, mesaPicnic, adirondack, casaPerro, lenera, cerco, bodega]
