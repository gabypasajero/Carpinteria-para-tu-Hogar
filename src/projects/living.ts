import type { HerrajeUso, PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { lis, mesa, tablero } from './kit'
import { barra, cada, claveDim, exteriorDe, juntarHerrajes, pieza, placas, seccion, type V3 } from './util'

const CORTE = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte, lija los cantos con grano 120 y marca cada pieza con su letra en una cara que no se vea.',
  consejo: 'Con ingletadora, fija un tope para cortar todas las piezas iguales del mismo largo.',
}

/** Mesa baja de listones (centro o lateral) con repisa inferior opcional. */
function mesaBaja(o: { L: number; W: number; H: number; pata: string; conRepisa: boolean }) {
  const [ax, az] = seccion(o.pata)
  const r = 30
  const m = mesa({
    L: o.L,
    W: o.W,
    H: o.H,
    pata: { mat: o.pata, ax, az },
    retiro: r,
    faldon: { mat: 'pc1x4' },
    cubierta: { mat: 'pc1x5', tipo: 'tablas', junta: 3 },
    pasos: { patas: 1, faldones: 1, cubierta: 2 },
  })
  const piezas = [...m.piezas]
  const [cA] = seccion('pc2x2')
  if (o.conRepisa) {
    const yR = 100
    for (const z of [r, m.W - r - cA]) piezas.push(...lis('apoyoRepisa', 'Apoyo de repisa', 'pc2x2', [r + ax, yR, z], 0, o.L - 2 * (r + ax), 1, 3))
    piezas.push(...tablero('repisaInf', 'Repisa inferior', 'terc15', [r + ax, yR + cA, r], [o.L - r - ax, yR + cA + 15, m.W - r], 3))
  }
  const tablas = m.piezas.filter((p) => p.nombre === 'Tabla de cubierta').length
  return { piezas, W: m.W, tablas }
}

function pasosMesa(conRepisa: boolean): PasoGuia[] {
  const p: PasoGuia[] = [
    CORTE,
    {
      titulo: 'Arma la base',
      texto: 'Une los faldones a las patas con cola y dos tornillos por unión (perfora antes con broca de 3 mm). Arma primero los dos costados cortos y después une con los faldones largos.',
      consejo: 'Revisa las diagonales: si miden lo mismo, la base está a escuadra.',
    },
    {
      titulo: 'Pon la cubierta',
      texto: 'Reparte las tablas de cubierta con 3 mm de junta y atorníllalas a los faldones desde arriba (tornillo avellanado y tapado con masilla) o desde abajo con escuadras.',
      consejo: 'Alterna el dibujo de los anillos de cada tabla para que la cubierta no se curve.',
    },
  ]
  if (conRepisa) p.push({ titulo: 'Repisa inferior', texto: 'Atornilla los apoyos entre las patas a 10 cm del piso y apoya la repisa de terciado sobre ellos.' })
  p.push({ titulo: 'Termina', texto: 'Lija todo con grano 120, limpia el polvo y aplica dos manos de barniz lijando suave entre manos.' })
  return p
}

export const mesaCentro: ProyectoDef = {
  id: 'mesa_centro',
  nombre: 'Mesa de centro',
  descripcion: 'Mesa de centro de pino con patas 2×3, faldones 1×4, cubierta de tablas 1×5 y repisa inferior opcional.',
  plan: 'pro',
  horas: '4 a 6 horas',
  ...ficha('mesa_centro'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 70, max: 140, step: 1, default: 100 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 75, step: 1, default: 55, ayuda: 'Se ajusta al ancho de tablas enteras.' },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 35, max: 50, step: 1, default: 42 },
    { id: 'repisa', label: 'Repisa inferior', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Sin repisa', 'Con repisa inferior'] },
  ],
  construir(params) {
    const m = mesaBaja({ L: params.largo * 10, W: params.ancho * 10, H: params.alto * 10, pata: 'pc2x3', conRepisa: params.repisa === 1 })
    return {
      piezas: m.piezas,
      exterior: exteriorDe(m.piezas),
      avisos: [`Ancho real con tablas enteras: ${m.W / 10} cm.`],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 16 + m.tablas * 4 + (params.repisa ? 12 : 0) },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 3 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: pasosMesa(params.repisa === 1),
    }
  },
}

export const mesaLateral: ProyectoDef = {
  id: 'mesa_lateral',
  nombre: 'Mesa lateral',
  descripcion: 'Mesa auxiliar o arrimo de pino con patas 2×2, faldones 1×4 y cubierta de tablas 1×5.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('mesa_lateral'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 35, max: 120, step: 1, default: 50 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 30, max: 50, step: 1, default: 40 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 45, max: 80, step: 1, default: 55 },
  ],
  construir(params) {
    const m = mesaBaja({ L: params.largo * 10, W: params.ancho * 10, H: params.alto * 10, pata: 'pc2x2', conRepisa: false })
    return {
      piezas: m.piezas,
      exterior: exteriorDe(m.piezas),
      avisos: [`Ancho real con tablas enteras: ${m.W / 10} cm.`],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 16 + m.tablas * 4 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: pasosMesa(false),
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const repisaFlotante: ProyectoDef = {
  id: 'repisa_flotante',
  nombre: 'Repisa flotante',
  descripcion: 'Repisa sin soportes a la vista: caja hueca de MDF que se desliza sobre un bastidor oculto de pino atornillado al muro.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('repisa_flotante'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 40, max: 150, step: 1, default: 90 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 15, max: 30, step: 1, default: 22 },
    { id: 'espesor', label: 'Espesor visible', unidad: 'cm', min: 7.5, max: 10, step: 0.5, default: 8, ayuda: 'Mínimo 7,5 cm para que quepa el bastidor de 2×2.' },
  ],
  construir(params) {
    const L = params.largo * 10
    const D = params.fondo * 10
    const E = params.espesor * 10
    const M = 'mdf15'
    const t = 15
    const [cA] = seccion('pc2x2')
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const piezas: PiezaInstancia[] = []
    // Bastidor oculto: riel al muro y brazos cada 30 cm como máximo.
    piezas.push(...lis('riel', 'Riel al muro', 'pc2x2', [t, t, 0], 0, L - 2 * t, 1, 1))
    const brazos = cada(t, L - t, cA, 300)
    for (const x of brazos) piezas.push(...lis('brazo', 'Brazo del bastidor', 'pc2x2', [x, t, cA], 2, D - t - 5 - cA, 1, 1))
    // Caja hueca.
    for (const y of [0, E - t]) piezas.push(pieza(k('tapa', L, D - t), y === 0 ? 'Tapa inferior' : 'Tapa superior', M, [0, y, 0], [L, y + t, D - t], 2))
    piezas.push(pieza(k('frente', L, E), 'Frente', M, [0, 0, D - t], [L, E, D], 2))
    for (const x of [0, L - t]) piezas.push(pieza(k('costado', D - t, E - 2 * t), 'Costado', M, [x, t, 0], [x + t, E - t, D - t], 2))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [
        'Carga orientativa: libros livianos o adornos. Para más peso, atornilla el riel a pies derechos o usa tarugos para el tipo de muro.',
        'La altura de montaje la eliges tú: el plano muestra la repisa apoyada en el piso.',
      ],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: Math.ceil(L / 300) + 1 + brazos.length * 2 },
        { id: 'clavo1', cantidad: Math.ceil((4 * L + 4 * D) / 100) },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        {
          titulo: 'Arma y fija el bastidor',
          texto: `Atornilla los ${brazos.length} brazos al riel con dos tornillos 4×50 cada uno. Marca la altura con nivel y fija el riel al muro con tornillos y tarugos cada 30 cm.`,
          consejo: 'En tabiques busca los pies derechos con un imán o golpeando: ahí el tornillo agarra firme.',
        },
        {
          titulo: 'Arma la caja y deslízala',
          texto: 'Pega y clava la tapa inferior, el frente, los costados y la tapa superior formando una caja abierta atrás. Pinta, desliza la caja sobre el bastidor y fíjala con tornillos desde abajo.',
          consejo: 'Masilla las uniones antes de pintar: así parece una sola pieza.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const sofa2x4: ProyectoDef = {
  id: 'sofa_2x4',
  nombre: 'Sofá de madera 2×4',
  descripcion: 'Sofá de pino con estructura 2×4, asiento de tablas y respaldo inclinado a 15°. Sirve para interior o terraza techada; los cojines se compran aparte.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('sofa_2x4'),
  params: [
    { id: 'plazas', label: 'Plazas', unidad: 'u', min: 2, max: 3, step: 1, default: 2, opciones: ['2 plazas (160 cm)', '3 plazas (210 cm)'] },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 70, max: 90, step: 1, default: 80 },
    { id: 'altoAsiento', label: 'Alto del asiento (sin cojín)', unidad: 'cm', min: 30, max: 40, step: 1, default: 34, ayuda: 'Con un cojín de 10 cm queda en 41–44 cm.' },
  ],
  construir(params) {
    const L = params.plazas === 2 ? 1600 : 2100
    const D = params.fondo * 10
    const HS = params.altoAsiento * 10
    const [pA, pE] = seccion('pc2x4')
    const [tA, tE] = seccion('pc1x4')
    const HA = HS + 220
    const HB = HS + 480
    const yb = HS - tE - pA
    const piezas: PiezaInstancia[] = []

    // Costados: patas, brazo y travesaño bajo.
    for (const x of [0, L - pE]) {
      for (const z of [0, D - pA]) piezas.push(...lis('pata', 'Pata', 'pc2x4', [x, 0, z], 1, HA, 2, 1))
      piezas.push(...lis('brazo', 'Brazo', 'pc2x4', [x, HA, 0], 2, D, 1, 1))
      piezas.push(...lis('travLateral', 'Travesaño lateral', 'pc2x4', [x, 100, pA], 2, D - 2 * pA, 1, 1))
    }
    // Bastidor del asiento.
    for (const z of [0, D - pE]) piezas.push(...lis('riel', 'Riel del asiento', 'pc2x4', [pE, yb, z], 0, L - 2 * pE, 1, 2))
    const jx = cada(pE, L - pE, pE, 450)
    for (const x of jx) piezas.push(...lis('travesano', 'Travesaño del asiento', 'pc2x4', [x, yb, pE], 2, D - 2 * pE, 1, 2))
    // Respaldo: postes inclinados 15° apoyados junto a los travesaños.
    const zB = 230
    const zT = zB - Math.tan((15 * Math.PI) / 180) * (HB - yb)
    const postesX = [jx[0] + pE, jx[jx.length - 1] - pE]
    if (L > 1800) postesX.push(jx[Math.floor(jx.length / 2)] + pE)
    for (const x of postesX)
      piezas.push(barra('posteResp', 'Poste del respaldo', 'pc2x4', [x + pE / 2, yb, zB], [x + pE / 2, HB, zT], 'zy', [pA, pE], 3, { nota: 'extremos a 15°' }))
    // Tablas del asiento delante de los postes.
    const zs = zB + pA / 2 + 10
    const nAs = Math.max(2, Math.floor((D - zs + 6) / (tA + 6)))
    const juntaAs = (D - zs - nAs * tA) / (nAs - 1)
    for (let i = 0; i < nAs; i++) piezas.push(...lis('tablaAsiento', 'Tabla del asiento', 'pc1x4', [pE, HS - tE, zs + i * (tA + juntaAs)], 0, L - 2 * pE, 2, 4))
    // Tablas del respaldo, giradas como los postes y apoyadas en su cara frontal.
    const dz = zT - zB
    const dy = HB - yb
    const largo = Math.hypot(dz, dy)
    const u = [dz / largo, dy / largo]
    const n = [dy / largo, -dz / largo]
    const ang = Math.atan2(-dy, dz)
    const s0 = (HS + 40 - yb) / u[1]
    const nResp = Math.floor((largo - s0) / (tA + 15))
    for (let i = 0; i < nResp; i++) {
      const s = s0 + i * (tA + 15) + tA / 2
      const off = pA / 2 + tE / 2
      const pos: V3 = [L / 2, yb + u[1] * s + n[1] * off, zB + u[0] * s + n[0] * off]
      piezas.push({ clave: claveDim('tablaResp', 'pc1x4', L - 2 * pE, 0), nombre: 'Tabla del respaldo', material: 'pc1x4', size: [L - 2 * pE, tE, tA], pos, rot: [ang, 0, 0], paso: 4 })
    }

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [
        `Cojines aparte: asiento ${Math.round((D - zs) / 10)}×${Math.round((L - 2 * pE) / 10)} cm y respaldo de unos ${Math.round((largo - s0) / 10)} cm de alto.`,
        'En terraza usa pino impregnado o protege con barniz marino y guarda los cojines bajo techo.',
      ],
      herrajes: juntarHerrajes([
        { id: 'tdeck', cantidad: 4 * 4 + 4 + jx.length * 4 + 4 },
        { id: 'perno', cantidad: postesX.length * 2 },
        { id: 't4x50', cantidad: (nAs + nResp) * (2 + postesX.length) + jx.length * 2 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 4 },
        { id: 'barniz', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        {
          titulo: 'Arma los dos costados',
          texto: 'Para cada costado, une las dos patas con el travesaño lateral a 10 cm del piso y el brazo encima. Usa tornillos exteriores de 100 mm y cola.',
        },
        {
          titulo: 'Arma el bastidor del asiento',
          texto: 'Atornilla los rieles del asiento a las patas (por dentro) y reparte los travesaños entre ellos cada 45 cm como máximo.',
          consejo: 'Arma el bastidor en el piso y luego súbelo entre los costados con un ayudante.',
        },
        {
          titulo: 'Postes del respaldo',
          texto: 'Corta los extremos de los postes a 15° y fíjalos junto a los travesaños con dos pernos coche cada uno, todos con la misma inclinación.',
          consejo: 'Haz una plantilla con el primer poste y úsala para marcar los demás.',
        },
        {
          titulo: 'Tablas de asiento y respaldo',
          texto: 'Atornilla las tablas del asiento de adelante hacia atrás con 6 mm de junta y luego las del respaldo de abajo hacia arriba con 15 mm. Lija y barniza.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const panelRanurado: ProyectoDef = {
  id: 'panel_ranurado',
  nombre: 'Muro de listones',
  descripcion: 'Revestimiento decorativo de muro con listones de pino 1×2 sobre un fondo de MDF pintado. Ideal detrás de la TV o del respaldo de la cama.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('panel_ranurado'),
  params: [
    { id: 'ancho', label: 'Ancho del muro', unidad: 'cm', min: 60, max: 400, step: 1, default: 240 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 100, max: 260, step: 1, default: 240 },
    { id: 'separacion', label: 'Separación entre listones', unidad: 'cm', min: 1, max: 5, step: 0.5, default: 2 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const g = params.separacion * 10
    const [lA] = seccion('pc1x2')
    const fondo = placas('fondo', 'Fondo de MDF', 'mdf9', 'xy', [0, W], [0, H], 0, 1)
    const xs = cada(0, W, lA, lA + g)
    const piezas: PiezaInstancia[] = [...fondo]
    for (const x of xs) piezas.push(...lis('liston', 'Listón', 'pc1x2', [x, 0, 9], 1, H, 0, 2))
    const m2 = (W * H) / 1e6
    const herrajes: HerrajeUso[] = [
      { id: 'tvolc', cantidad: Math.ceil(m2 * 12) },
      { id: 't4x40', cantidad: xs.length * Math.ceil(H / 600 + 1) },
      { id: 'cola', cantidad: Math.ceil(xs.length / 15) },
      { id: 'lija120', cantidad: 2 },
    ]
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`${xs.length} listones con ${((xs.length > 1 ? (W - xs.length * lA) / (xs.length - 1) : 0) / 10).toFixed(1)} cm entre ellos. Pinta el fondo y los listones antes de instalarlos.`],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE,
        {
          titulo: 'Instala el fondo',
          texto: 'Atornilla las planchas de MDF al muro (a los pies derechos si es tabique, o con tarugos) con unos 12 tornillos por m². Pinta el fondo de un color oscuro.',
          consejo: 'Empieza por una esquina y revisa con el nivel que la primera plancha quede vertical.',
        },
        {
          titulo: 'Pon los listones',
          texto: 'Pega cada listón con cola y fíjalo con tornillos 4×40 avellanados cada 60 cm. Usa un taco del ancho de la separación para mantenerlos parejos.',
          consejo: 'Revisa con el nivel cada 5 listones: un error pequeño se nota al final del muro.',
        },
      ],
    }
  },
}

export const LIVING: ProyectoDef[] = [mesaCentro, mesaLateral, repisaFlotante, sofa2x4, panelRanurado]
