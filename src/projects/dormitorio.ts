import type { HerrajeUso, ParamDef, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { COLCHONES, cajon, columnaCajones, correderaPara, lis, repisas, respaldo, tablero } from './kit'
import { cada, claveDim, exteriorDe, juntarHerrajes, pieza, repartir, seccion } from './util'

const tamano = (max = 5, def = 0): ParamDef => ({
  id: 'tamano',
  label: 'Tamaño de colchón',
  unidad: 'u',
  min: 0,
  max,
  step: 1,
  default: def,
  opciones: COLCHONES.slice(0, max + 1).map((c) => c.nombre),
})

const CORTE = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte (o pide el corte en la tienda con el plano de optimización). Lija los cantos y marca cada pieza con su letra en una cara que no se vea.',
  consejo: 'Revisa las medidas de la primera pieza de cada letra antes de cortar el resto.',
}
const CORTE_MELAMINA = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Pide el corte en la tienda con la lista de corte. Pega el tapacanto en los cantos indicados con la plancha caliente y recorta el sobrante con cuchillo.',
  consejo: 'Marca cada pieza con su letra con lápiz grafito en una cara que no se vea.',
}

// ---------------------------------------------------------------------------------------------
export const cama: ProyectoDef = {
  id: 'cama',
  nombre: 'Cama base con respaldo',
  descripcion: 'Base de cama de pino con somier de tablillas, viga central desde 2 plazas y respaldo de tablas. De 1 plaza a super king.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('cama'),
  params: [
    tamano(5, 2),
    { id: 'alto', label: 'Alto del somier', unidad: 'cm', min: 25, max: 45, step: 1, default: 35, ayuda: 'Altura de las tablillas; el colchón queda encima.' },
    { id: 'respaldo', label: 'Respaldo', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Sin respaldo', 'Con respaldo de tablas'] },
    { id: 'altoResp', label: 'Alto del respaldo', unidad: 'cm', min: 90, max: 130, step: 1, default: 105 },
  ],
  construir(params) {
    const c = COLCHONES[params.tamano]
    const H = params.alto * 10
    const conResp = params.respaldo === 1
    const HR = params.altoResp * 10
    const [rA, rE] = seccion('pc2x6')
    const [pA, pE] = seccion('pc2x4')
    const [cA] = seccion('pc2x2')
    const [sA, sE] = seccion('pc1x3')
    const [bA, bE] = seccion('pc1x6')
    const Wi = c.ancho + 20
    const Li = c.largo + 20
    const Wo = Wi + 2 * rE
    const Lo = Li + 2 * rE
    const z0 = conResp ? bE + pE : 0
    const piezas: PiezaInstancia[] = []
    const avisos: string[] = []

    for (const x of [0, Wo - rE]) piezas.push(...lis('larguero', 'Larguero', 'pc2x6', [x, H - rA, z0], 2, Lo, 1, 1))
    for (const z of [z0, z0 + Lo - rE]) piezas.push(...lis('travesano', 'Travesaño de cabecera y pie', 'pc2x6', [rE, H - rA, z], 0, Wi, 1, 1))
    for (const x of [rE, Wo - rE - pA])
      for (const z of [z0 + rE, z0 + Lo - rE - pE]) piezas.push(...lis('pata', 'Pata', 'pc2x4', [x, 0, z], 1, H - sE, 0, 2))
    for (const x of [rE, Wo - rE - cA]) piezas.push(...lis('apoyo', 'Listón de apoyo', 'pc2x2', [x, H - sE - cA, z0 + rE + pE], 2, Li - 2 * pE, 1, 2))
    const central = c.ancho >= 1500
    if (central) {
      piezas.push(...lis('viga', 'Viga central', 'pc2x4', [Wo / 2 - pE / 2, H - sE - pA, z0 + rE], 2, Li, 1, 2))
      for (const f of [1 / 3, 2 / 3]) piezas.push(...lis('pataCentral', 'Pata central', 'pc2x4', [Wo / 2 - pA / 2, 0, z0 + rE + Li * f - pE / 2], 1, H - sE - pA, 0, 2))
    }
    const tablillas = cada(z0 + rE, z0 + rE + Li, sA, sA + 60)
    for (const z of tablillas) piezas.push(...lis('tablilla', 'Tablilla de somier', 'pc1x3', [rE, H - sE, z], 0, Wi, 2, 3))

    let tablas = 0
    if (conResp) {
      for (const x of [0, Wo - pA]) piezas.push(...lis('poste', 'Poste del respaldo', 'pc2x4', [x, 0, bE], 1, HR, 0, 4))
      tablas = Math.max(1, Math.floor((HR - H + 6) / (bA + 6)))
      for (let i = 0; i < tablas; i++) piezas.push(...lis('tablaResp', 'Tabla del respaldo', 'pc1x6', [0, HR - (i + 1) * bA - i * 6, 0], 0, Wo, 1, 4))
    }
    if (c.ancho >= 1500) avisos.push('Desde 2 plazas la base lleva viga central con dos patas: no la omitas, evita que las tablillas se flecten.')

    const herrajes: HerrajeUso[] = [
      { id: 'perno', cantidad: 8 + (conResp ? 4 : 0) },
      { id: 'escuadra', cantidad: 4 },
      { id: 't4x50', cantidad: tablillas.length * 2 + 2 * Math.ceil(Li / 300) + (central ? 8 + tablillas.length : 0) + tablas * 4 },
      { id: 'cola', cantidad: 1 },
      { id: 'lija120', cantidad: 4 },
      { id: 'barniz', cantidad: 1 },
    ]
    const pasos = [
      CORTE,
      {
        titulo: 'Arma el marco',
        texto: 'Une los largueros con los travesaños de cabecera y pie formando un rectángulo. Perfora y atornilla, y refuerza cada esquina por dentro con una escuadra metálica.',
        consejo: 'Mide las diagonales: si son iguales, el marco está a escuadra.',
      },
      {
        titulo: 'Pon las patas y los listones de apoyo',
        texto: `Fija una pata en cada esquina interior con dos pernos coche. Atornilla los listones de apoyo por dentro de los largueros, a ras con la parte superior de las patas.${central ? ' Instala la viga central de cabecera a pie con sus dos patas.' : ''}`,
      },
      {
        titulo: 'Coloca las tablillas',
        texto: `Reparte las ${tablillas.length} tablillas sobre los listones de apoyo, con unos 6 cm entre ellas, y fija cada extremo con un tornillo.`,
        consejo: 'Corta un taco de 6 cm y úsalo de separador para que queden parejas.',
      },
    ]
    if (conResp)
      pasos.push({
        titulo: 'Arma y une el respaldo',
        texto: 'Atornilla las tablas del respaldo a los dos postes, de arriba hacia abajo con 6 mm de junta. Une los postes al travesaño de cabecera con dos pernos cada uno.',
        consejo: 'Redondea con lija las esquinas superiores del respaldo.',
      })
    return { piezas, herrajes: juntarHerrajes(herrajes), pasos, exterior: exteriorDe(piezas), avisos }
  },
}

// ---------------------------------------------------------------------------------------------
/** Somier de tablillas entre dos largueros, para camarote y cama alta. */
function somierLiteraNivel(o: { yS: number; E: number; Lo: number; Wo: number; paso: number; pasoSomier: number }) {
  const [rA, rE] = seccion('pc2x6')
  const [pA, pE] = seccion('pc2x4')
  const [cA] = seccion('pc2x2')
  const [sA, sE] = seccion('pc1x3')
  const { yS, E, Lo, Wo } = o
  const xs = E + pA
  const xe = Lo - E - pA
  const piezas: PiezaInstancia[] = []
  for (const z of [pE, Wo - pE - rE]) piezas.push(...lis('larguero', 'Larguero', 'pc2x6', [E, yS - rA, z], 0, Lo - 2 * E, 1, o.paso))
  for (const z of [pE + rE, Wo - pE - rE - cA]) piezas.push(...lis('apoyo', 'Listón de apoyo', 'pc2x2', [xs, yS - sE - cA, z], 0, xe - xs, 1, o.pasoSomier))
  const xsT = cada(xs, xe, sA, sA + 60)
  for (const x of xsT) piezas.push(...lis('tablilla', 'Tablilla de somier', 'pc1x3', [x, yS - sE, pE + rE], 2, Wo - 2 * (pE + rE), 0, o.pasoSomier))
  return { piezas, tablillas: xsT.length }
}

/** Escalera integrada al frente: un poste de baranda que baja al piso y peldaños atornillados por fuera. */
function escaleraLitera(o: { yS: number; HT: number; E: number; Lo: number; Wo: number; paso: number }) {
  const [pA, pE] = seccion('pc2x4')
  const [gA] = seccion('pc1x4')
  const xe = o.Lo - o.E - pA
  const xg = xe - 380 - pA
  const piezas = [...lis('posteEscalera', 'Poste de escalera', 'pc2x4', [xg, 0, o.Wo - pE], 1, o.HT, 0, o.paso)]
  const k = Math.max(2, Math.round(o.yS / 280))
  const s = o.yS / k
  for (let i = 1; i <= k; i++) piezas.push(...lis('peldano', 'Peldaño', 'pc1x4', [xg, s * i - gA, o.Wo], 0, o.Lo - o.E - xg, 1, o.paso))
  return { piezas, xg, peldanos: k }
}

function avisosLitera(): string[] {
  return [
    'Nivel superior: no apto para menores de 6 años (16 CFR 1513).',
    'Usa un colchón de máximo 15 cm de alto: así la baranda queda 15 cm sobre él (la norma pide al menos 13 cm).',
    'Fija la estructura al muro con dos escuadras en los postes del lado del muro.',
  ]
}

export const camarote: ProyectoDef = {
  id: 'camarote',
  nombre: 'Camarote (litera)',
  descripcion: 'Litera de pino con postes 2×4, largueros 2×6, barandas continuas en el nivel superior y escalera integrada al frente, según 16 CFR 1513.',
  plan: 'pro',
  horas: '2 a 3 días',
  ...ficha('camarote'),
  params: [
    tamano(1),
    { id: 'libre', label: 'Altura libre sobre la cama de abajo', unidad: 'cm', min: 75, max: 100, step: 1, default: 85, ayuda: 'Desde el colchón de abajo hasta la estructura de arriba.' },
  ],
  construir(params) {
    const c = COLCHONES[params.tamano]
    const [rA, rE] = seccion('pc2x6')
    const [pA, pE] = seccion('pc2x4')
    const [, bE] = seccion('pc1x6')
    const [, gE] = seccion('pc1x4')
    const E = bE
    const Wo = c.ancho + 20 + 2 * (pE + rE)
    const Lo = c.largo + 20 + 2 * (pA + E)
    const yS1 = 350
    const yS2 = yS1 + 150 + params.libre * 10 + rA
    const HT = yS2 + 300
    const piezas: PiezaInstancia[] = []

    for (const x of [E, Lo - E - pA]) for (const z of [0, Wo - pE]) piezas.push(...lis('poste', 'Poste', 'pc2x4', [x, 0, z], 1, HT, 0, 1))
    const ysTablas = [yS1 - rA, yS1 + 12, yS2 - rA, yS2 + 12, yS2 + 162]
    for (const x of [0, Lo - E]) for (const y of ysTablas) piezas.push(...lis('tablaCab', 'Tabla de cabecera', 'pc1x6', [x, y, 0], 2, Wo, 1, 1))
    let tablillas = 0
    for (const yS of [yS1, yS2]) {
      const n = somierLiteraNivel({ yS, E, Lo, Wo, paso: 2, pasoSomier: 3 })
      piezas.push(...n.piezas)
      tablillas += n.tablillas
    }
    const esc = escaleraLitera({ yS: yS2, HT, E, Lo, Wo, paso: 4 })
    for (const y of [yS2 + 50, yS2 + 210]) {
      piezas.push(...lis('baranda', 'Baranda del lado del muro', 'pc1x4', [E, y, pE], 0, Lo - 2 * E, 1, 4))
      piezas.push(...lis('barandaF', 'Baranda frontal', 'pc1x4', [E, y, Wo - pE - gE], 0, esc.xg + pA - E, 1, 4))
    }
    piezas.push(...esc.piezas)

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: avisosLitera(),
      herrajes: juntarHerrajes([
        { id: 'perno', cantidad: 20 },
        { id: 'escuadra', cantidad: 10 },
        { id: 't4x50', cantidad: ysTablas.length * 8 + 4 * 4 + esc.peldanos * 4 + tablillas * 2 + 4 * Math.ceil(c.largo / 300) },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 6 },
        { id: 'barniz', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        {
          titulo: 'Arma las dos cabeceras',
          texto: 'En el piso, atornilla las tablas de cabecera por fuera de cada par de postes: dos tablas para el nivel de abajo y tres para el de arriba. Deja 12 mm entre tablas.',
          consejo: 'Arma las cabeceras sobre una superficie plana y revisa que queden a escuadra.',
        },
        {
          titulo: 'Une las cabeceras con los largueros',
          texto: 'Con ayuda, para las cabeceras y une los largueros por dentro de los postes con dos pernos coche en cada extremo. Refuerza cada unión con una escuadra.',
          consejo: 'Perfora los pernos con las piezas prensadas para que los agujeros coincidan.',
        },
        {
          titulo: 'Pon los listones de apoyo y las tablillas',
          texto: 'Atornilla los listones de apoyo por dentro de los largueros y reparte las tablillas con unos 6 cm entre ellas.',
        },
        {
          titulo: 'Barandas y escalera',
          texto: 'Atornilla dos barandas continuas en el lado del muro y dos en el frente hasta el poste de escalera. Deja 38 cm libres para subir. Atornilla los peldaños por fuera del poste de escalera y del poste de la esquina.',
          consejo: 'Revisa que no quede ninguna abertura de más de 23 cm en el nivel superior.',
        },
      ],
    }
  },
}

export const camaAlta: ProyectoDef = {
  id: 'cama_alta',
  nombre: 'Cama alta con escritorio',
  descripcion: 'Cama loft de pino con escritorio de terciado debajo, barandas continuas, escalera integrada y altura libre regulable.',
  plan: 'pro',
  horas: '2 a 3 días',
  ...ficha('cama_alta'),
  params: [
    tamano(1),
    { id: 'libre', label: 'Altura libre bajo la cama', unidad: 'cm', min: 120, max: 160, step: 1, default: 140 },
    { id: 'fondoEsc', label: 'Fondo del escritorio', unidad: 'cm', min: 45, max: 60, step: 1, default: 55 },
  ],
  construir(params) {
    const c = COLCHONES[params.tamano]
    const [rA, rE] = seccion('pc2x6')
    const [pA, pE] = seccion('pc2x4')
    const [, bE] = seccion('pc1x6')
    const [cA] = seccion('pc2x2')
    const [gA, gE] = seccion('pc1x4')
    const E = bE
    const Wo = c.ancho + 20 + 2 * (pE + rE)
    const Lo = c.largo + 20 + 2 * (pA + E)
    const yS = params.libre * 10 + rA
    const HT = yS + 300
    const F = params.fondoEsc * 10
    const xs = E + pA
    const xe = Lo - E - pA
    const yD = 730
    const piezas: PiezaInstancia[] = []

    for (const x of [E, Lo - E - pA]) for (const z of [0, Wo - pE]) piezas.push(...lis('poste', 'Poste', 'pc2x4', [x, 0, z], 1, HT, 0, 1))
    const ysTablas = [100, yD - 138, yS - rA, yS + 12, yS + 162]
    for (const x of [0, Lo - E]) for (const y of ysTablas) piezas.push(...lis('tablaCab', 'Tabla de cabecera', 'pc1x6', [x, y, 0], 2, Wo, 1, 1))
    const n = somierLiteraNivel({ yS, E, Lo, Wo, paso: 2, pasoSomier: 3 })
    piezas.push(...n.piezas)
    const esc = escaleraLitera({ yS, HT, E, Lo, Wo, paso: 4 })
    for (const y of [yS + 50, yS + 210]) {
      piezas.push(...lis('baranda', 'Baranda del lado del muro', 'pc1x4', [E, y, pE], 0, Lo - 2 * E, 1, 4))
      piezas.push(...lis('barandaF', 'Baranda frontal', 'pc1x4', [E, y, Wo - pE - gE], 0, esc.xg + pA - E, 1, 4))
    }
    piezas.push(...esc.piezas)
    // Escritorio: apoyos de extremo entre postes, listón al muro y faldón al frente.
    for (const x of [xs, xe - cA]) piezas.push(...lis('apoyoEsc', 'Apoyo lateral del escritorio', 'pc2x2', [x, yD - cA, 0], 2, Wo, 1, 5))
    piezas.push(...lis('apoyoMuro', 'Listón al muro', 'pc2x2', [xs + cA, yD - cA, 0], 0, xe - xs - 2 * cA, 1, 5))
    piezas.push(...lis('faldonEsc', 'Faldón del escritorio', 'pc1x4', [xs + cA, yD - gA, F - gE], 0, xe - xs - 2 * cA, 1, 5))
    piezas.push(...tablero('cubiertaEsc', 'Cubierta del escritorio', 'terc18', [xs, yD, 0], [xe, yD + 18, F], 5))

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [...avisosLitera(), 'El escritorio queda a 74,8 cm del piso (73–76 cm recomendado).'],
      herrajes: juntarHerrajes([
        { id: 'perno', cantidad: 12 },
        { id: 'escuadra', cantidad: 8 },
        { id: 't4x50', cantidad: ysTablas.length * 8 + 4 * 4 + esc.peldanos * 4 + n.tablillas * 2 + 2 * Math.ceil(c.largo / 300) + 30 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 6 },
        { id: 'barniz', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        {
          titulo: 'Arma las dos cabeceras',
          texto: 'Atornilla por fuera de cada par de postes las tablas: una abajo, una a la altura del escritorio y tres en el nivel de la cama.',
        },
        {
          titulo: 'Une las cabeceras con los largueros',
          texto: 'Para las cabeceras con ayuda y une los largueros por dentro de los postes con dos pernos coche por extremo y una escuadra en cada unión.',
        },
        {
          titulo: 'Pon los listones de apoyo y las tablillas',
          texto: 'Atornilla los listones de apoyo por dentro de los largueros y reparte las tablillas con unos 6 cm entre ellas.',
        },
        {
          titulo: 'Barandas y escalera',
          texto: 'Atornilla las barandas continuas del lado del muro y del frente hasta el poste de escalera, dejando 38 cm para subir, y luego los peldaños por fuera.',
        },
        {
          titulo: 'Instala el escritorio',
          texto: 'Atornilla los apoyos laterales a los postes a 69 cm del piso, el listón al muro (a pies derechos o con tarugos) y el faldón al frente. Apoya la cubierta y fíjala desde abajo.',
          consejo: 'Usa el nivel en los apoyos antes de atornillar: la cubierta debe quedar horizontal.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const camaNido: ProyectoDef = {
  id: 'cama_nido',
  nombre: 'Cama con cajones',
  descripcion: 'Base de cama de melamina con cajones grandes sobre correderas al frente y plataforma de terciado para el colchón.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('cama_nido'),
  params: [tamano(2), { id: 'cajones', label: 'Cajones al frente', unidad: 'u', min: 2, max: 4, step: 1, default: 3 }],
  construir(params) {
    const c = COLCHONES[params.tamano]
    const n = params.cajones
    const M = 'mel18'
    const t = 18
    const L = c.largo + 20
    const W = c.ancho + 20
    const Hc = 340
    const zSp = W - 470 - t
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const k = (b: string, a: number, d: number) => claveDim(b, M, a, d)

    for (const x of [0, L - t]) piezas.push(pieza(k('extremo', Hc, W), 'Panel de extremo', M, [x, 0, 0], [x + t, Hc, W], 1, { canto: Hc }))
    piezas.push(pieza(k('trasero', L - 2 * t, Hc), 'Panel trasero', M, [t, 0, 0], [L - t, Hc, t], 1))
    piezas.push(pieza(k('espina', L - 2 * t, Hc), 'Panel central', M, [t, 0, zSp], [L - t, Hc, zSp + t], 1))
    if (W > 1200) {
      const zm = (t + zSp) / 2 - t / 2
      piezas.push(pieza(k('espina', L - 2 * t, Hc), 'Panel central', M, [t, 0, zm], [L - t, Hc, zm + t], 1))
    }
    const wc = (L - 2 * t - (n - 1) * t) / n
    const divs = Array.from({ length: n - 1 }, (_, i) => t + (i + 1) * wc + i * t)
    for (const x of divs) piezas.push(pieza(k('division', W - zSp - t, Hc), 'División de cajones', M, [x, 0, zSp + t], [x + t, Hc, W], 2, { canto: Hc }))
    const bordes = [0, ...divs, L - t]
    for (let i = 0; i < n; i++) {
      const x0 = bordes[i] + t
      const x1 = bordes[i + 1]
      const fx0 = i === 0 ? 2 : bordes[i] + t / 2 + 1.5
      const fx1 = i === n - 1 ? L - 2 : bordes[i + 1] + t / 2 - 1.5
      const caj = cajon({ x0, x1, fx0, fx1, y0: 15, y1: Hc - 2, zF: W, prof: 450, mat: M, paso: 3, pasoFrente: 4 })
      piezas.push(...caj.piezas)
      herrajes.push(...caj.herrajes)
    }
    piezas.push(...tablero('plataforma', 'Plataforma', 'terc12', [0, Hc, 0], [L, Hc + 12, W], 5))
    herrajes.push({ id: 't4x40', cantidad: 16 + (n - 1) * 6 + Math.ceil((2 * (L + W)) / 250) }, { id: 'escuadra', cantidad: 4 })

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['El colchón queda a unos 35 cm del piso más su propio alto.'],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        {
          titulo: 'Arma el cajón principal',
          texto: 'Atornilla el panel trasero y el (o los) panel central entre los dos paneles de extremo. Perfora con broca de 3 mm antes de cada tornillo.',
          consejo: 'Arma la base con las piezas de canto sobre el piso para que quede pareja.',
        },
        {
          titulo: 'Pon las divisiones de los cajones',
          texto: 'Atornilla las divisiones entre el panel central y el frente, a escuadra. Cada hueco recibe un cajón.',
        },
        {
          titulo: 'Arma los cajones y monta las correderas',
          texto: 'Arma cada caja, clava el fondo y monta las correderas de 45 cm: la parte fija va en las divisiones y la móvil en la caja.',
        },
        {
          titulo: 'Pon los frentes',
          texto: 'Fija cada frente con 4 tornillos desde dentro, con 3 mm de junta entre frentes, y atornilla los tiradores.',
        },
        {
          titulo: 'Fija la plataforma',
          texto: 'Apoya la plataforma de terciado sobre los paneles y atorníllala cada 25 cm por todo el borde y sobre el panel central.',
          consejo: 'Haz algunos agujeros de 25 mm en la plataforma para que el colchón ventile.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const comoda: ProyectoDef = {
  id: 'comoda',
  nombre: 'Cómoda cajonera',
  descripcion: 'Cómoda de melamina con una o dos columnas de cajones sobre correderas telescópicas y cubierta de 18 mm.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('comoda'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 50, max: 140, step: 1, default: 90 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 60, max: 120, step: 1, default: 85 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 40, max: 55, step: 1, default: 45, ayuda: 'Desde 47 cm usa correderas de 45 cm.' },
    { id: 'columnas', label: 'Columnas', unidad: 'u', min: 1, max: 2, step: 1, default: 1, opciones: ['1 columna', '2 columnas'] },
    { id: 'cajones', label: 'Cajones por columna', unidad: 'u', min: 2, max: 5, step: 1, default: 4 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const cols = params.columnas
    const n = params.cajones
    const M = 'mel15'
    const C = 'mel18'
    const t = 15
    const Z = 60
    const r = 3
    const k = (b: string, a: number, d: number, m = M) => claveDim(b, m, a, d)
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const avisos: string[] = []

    for (const x of [0, W - t]) piezas.push(pieza(k('lateral', H - 18, D - r), 'Lateral', M, [x, 0, r], [x + t, H - 18, D], 1, { canto: H - 18 }))
    piezas.push(pieza(k('base', W - 2 * t, D - r), 'Base', M, [t, Z, r], [W - t, Z + t, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza(k('zocalo', W - 2 * t, Z), 'Zócalo', M, [t, 0, D - 20 - t], [W - t, Z, D - 20], 1, { canto: W - 2 * t }))
    if (cols === 2) piezas.push(pieza(k('division', H - 18 - Z - t, D - r), 'División', M, [W / 2 - t / 2, Z + t, r], [W / 2 + t / 2, H - 18, D], 1, { canto: H - 18 - Z - t }))
    piezas.push(pieza(k('cubierta', W, D + t - r, C), 'Cubierta', C, [0, H - 18, r], [W, H, D + t], 2, { canto: W + 2 * (D + t - r) }))
    const resp = respaldo({ x0: 0, x1: W, y0: 0, y1: H - 18, paso: 3 })
    piezas.push(...resp.piezas)
    herrajes.push(...resp.herrajes)

    const prof = correderaPara(D - r - 10)
    if (!prof) throw new Error('Fondo insuficiente para correderas')
    const columnas =
      cols === 1
        ? [{ x0: t, x1: W - t, fx0: 2, fx1: W - 2 }]
        : [
            { x0: t, x1: W / 2 - t / 2, fx0: 2, fx1: W / 2 - 1.5 },
            { x0: W / 2 + t / 2, x1: W - t, fx0: W / 2 + 1.5, fx1: W - 2 },
          ]
    let alto = 0
    for (const col of columnas) {
      const cc = columnaCajones({ ...col, y0: Z, y1: H - 18 - 2, zF: D, prof, mat: M, paso: 4, pasoFrente: 5, n })
      piezas.push(...cc.piezas)
      herrajes.push(...cc.herrajes)
      alto = cc.altoFrente
    }
    if (alto - 40 < 80) avisos.push('Los cajones quedan bajos: sube el alto o usa menos cajones por columna.')
    if ((W - 2 * t) / cols > 900) avisos.push('Cajones de más de 90 cm de ancho se traban: usa dos columnas.')
    if (H > 1000) avisos.push('Con más de 1 m de alto, fija la cómoda al muro con dos escuadras (riesgo de volcamiento).')
    herrajes.push({ id: 't4x40', cantidad: 14 + (cols === 2 ? 4 : 0) }, { id: 'escuadra', cantidad: 2 }, { id: 'cola', cantidad: 1 })

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        {
          titulo: 'Arma el cuerpo',
          texto: `Atornilla la base entre los laterales a ${Z / 10} cm del piso y el zócalo bajo ella, 2 cm hacia adentro.${cols === 2 ? ' Pon la división al centro, a escuadra.' : ''}`,
        },
        { titulo: 'Pon la cubierta', texto: 'La cubierta de 18 mm va sobre los laterales y sobresale 1,5 cm al frente para quedar a ras con los frentes de cajón.' },
        { titulo: 'Clava el respaldo', texto: 'Comprueba que las diagonales midan lo mismo y clava el respaldo cada 10 cm. Él mantiene la cómoda a escuadra.' },
        {
          titulo: 'Arma los cajones y monta las correderas',
          texto: `Arma cada caja con su fondo y monta las correderas de ${prof / 10} cm: la parte fija en el lateral, la móvil en la caja, a la misma altura.`,
          consejo: 'Monta las correderas con el mueble acostado: es más fácil dejarlas paralelas.',
        },
        {
          titulo: 'Pon frentes y tiradores',
          texto: 'Fija cada frente con 4 tornillos desde dentro dejando 3 mm de junta y atornilla los tiradores.',
          consejo: 'Pega el frente con cinta doble contacto, abre el cajón y atorníllalo desde adentro.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const closetAbierto: ProyectoDef = {
  id: 'closet_abierto',
  nombre: 'Closet abierto modular',
  descripcion: 'Vestidor abierto de melamina 18 mm en módulos de hasta 90 cm: módulos para colgar con maletero, módulos de repisas y cajonera opcional.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('closet_abierto'),
  params: [
    { id: 'ancho', label: 'Ancho total', unidad: 'cm', min: 100, max: 300, step: 1, default: 180 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 180, max: 240, step: 1, default: 220 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 50, max: 60, step: 1, default: 55 },
    { id: 'cajonera', label: 'Cajonera', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Sin cajonera', 'Con 3 cajones en un módulo de repisas'] },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const M = 'mel18'
    const t = 18
    const Z = 60
    const r = 3
    const k = (b: string, a: number, d: number) => claveDim(b, M, a, d)
    const nMod = Math.max(1, Math.ceil((W - t) / (900 + t)))
    const wm = (W - (nMod + 1) * t) / nMod
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const avisos: string[] = ['Fija el mueble al muro con escuadras en la parte superior de cada lateral.']

    for (let i = 0; i <= nMod; i++) {
      const x = i * (wm + t)
      piezas.push(pieza(k('lateral', H, D - r), i === 0 || i === nMod ? 'Lateral' : 'División', M, [x, 0, r], [x + t, H, D], 1, { canto: H }))
    }
    let conCajones = params.cajonera === 1
    let barras = 0
    for (let m = 0; m < nMod; m++) {
      const x0 = m * (wm + t) + t
      const x1 = x0 + wm
      piezas.push(pieza(k('base', wm, D - r), 'Base', M, [x0, Z, r], [x1, Z + t, D], 1, { canto: wm }))
      piezas.push(pieza(k('zocalo', wm, Z), 'Zócalo', M, [x0, 0, D - 20 - t], [x1, Z, D - 20], 1, { canto: wm }))
      piezas.push(pieza(k('techo', wm, D - r), 'Techo', M, [x0, H - t, r], [x1, H, D], 2, { canto: wm }))
      const colgar = nMod === 1 || m % 2 === 0
      if (colgar) {
        const y = H - t - 350 - t
        piezas.push(pieza(k('maletero', wm, D - r), 'Maletero', M, [x0, y, r], [x1, y + t, D], 4, { canto: wm }))
        barras += Math.ceil(wm / 1000)
      } else if (conCajones) {
        conCajones = false
        const prof = correderaPara(D - r - 10) ?? 450
        const cc = columnaCajones({ x0, x1, fx0: x0 - t / 2 + 1.5, fx1: x1 + t / 2 - 1.5, y0: Z + 3, y1: Z + t + 600, zF: D, prof, mat: M, paso: 5, pasoFrente: 5, n: 3 })
        piezas.push(...cc.piezas)
        herrajes.push(...cc.herrajes)
        const yT = Z + t + 600
        piezas.push(pieza(k('tapaCaj', wm, D - r), 'Tapa de cajonera', M, [x0, yT, r], [x1, yT + t, D], 4, { canto: wm }))
        const rp = repisas({ x0, x1, y0: yT + t, y1: H - t, z0: r, z1: D - 10, n: 3, mat: M, paso: 4 })
        piezas.push(...rp.piezas)
        herrajes.push(...rp.herrajes)
      } else {
        const rp = repisas({ x0, x1, y0: Z + t, y1: H - t, z0: r, z1: D - 10, n: 5, mat: M, paso: 4 })
        piezas.push(...rp.piezas)
        herrajes.push(...rp.herrajes)
      }
    }
    const resp = respaldo({ x0: 0, x1: W, y0: 0, y1: H, paso: 3 })
    piezas.push(...resp.piezas)
    herrajes.push(...resp.herrajes)
    if (barras) herrajes.push({ id: 'barra', cantidad: barras })
    herrajes.push({ id: 't4x40', cantidad: nMod * 16 }, { id: 'escuadra', cantidad: nMod + 1 }, { id: 'cola', cantidad: 1 })
    if (D < 550) avisos.push('Para colgar ropa se recomiendan 55 a 60 cm de fondo.')

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        { titulo: 'Bases y zócalos', texto: `Atornilla la base y el zócalo de cada módulo entre sus laterales, a ${Z / 10} cm del piso.` },
        { titulo: 'Techos', texto: 'Atornilla los techos a ras arriba. Con el mueble en el piso, revisa con la escuadra cada módulo.' },
        { titulo: 'Clava el respaldo', texto: 'Clava las franjas de respaldo cada 10 cm. Para el mueble con ayuda y fíjalo al muro con las escuadras.' },
        {
          titulo: 'Maleteros, barras y repisas',
          texto: 'Atornilla los maleteros fijos a 35 cm del techo y pon la barra de colgar unos 5 cm bajo ellos. Perfora los agujeros de los soportes y apoya las repisas.',
          consejo: 'Barra a 160–170 cm para ropa larga; a 90–110 cm si haces doble barra.',
        },
        { titulo: 'Cajonera', texto: 'Monta las correderas, arma los cajones, pon los frentes y la tapa de la cajonera.' },
      ].slice(0, params.cajonera === 1 && nMod > 1 ? 6 : 5),
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const respaldoCama: ProyectoDef = {
  id: 'respaldo',
  nombre: 'Respaldo de cama de muro',
  descripcion: 'Cabecera que se fija al muro: panel de MDF sobre bastidor de pino, liso para pintar o tapizar, o con listones verticales.',
  plan: 'pro',
  horas: '4 a 6 horas',
  ...ficha('respaldo'),
  params: [
    tamano(5, 2),
    { id: 'alto', label: 'Alto desde el piso', unidad: 'cm', min: 100, max: 140, step: 1, default: 120 },
    { id: 'estilo', label: 'Estilo', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Liso (para pintar o tapizar)', 'Con listones verticales'] },
  ],
  construir(params) {
    const c = COLCHONES[params.tamano]
    const W = c.ancho + 150
    const H = params.alto * 10
    const Y0 = 300
    const [bA, bE] = seccion('pc1x3')
    const [lA] = seccion('pc1x2')
    const piezas: PiezaInstancia[] = []
    for (const y of [Y0, H - bA]) piezas.push(...lis('bastidorH', 'Bastidor horizontal', 'pc1x3', [0, y, 0], 0, W, 1, 1))
    const verticales = cada(0, W, bA, 600)
    for (const x of verticales) piezas.push(...lis('bastidorV', 'Bastidor vertical', 'pc1x3', [x, Y0 + bA, 0], 1, H - Y0 - 2 * bA, 0, 1))
    piezas.push(...tablero('panel', 'Panel', 'mdf15', [0, Y0, bE], [W, H, bE + 15], 2))
    const listones = params.estilo === 1 ? cada(0, W, lA, lA + 50) : []
    for (const x of listones) piezas.push(...lis('liston', 'Listón vertical', 'pc1x2', [x, Y0, bE + 15], 1, H - Y0, 0, 3))

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Ancho = colchón + 15 cm (${W / 10} cm). El panel parte a 30 cm del piso y queda tapado por la base de la cama.`],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: verticales.length * 4 + Math.ceil((2 * (W + H - Y0)) / 300) + listones.length * 3 },
        { id: 'escuadra', cantidad: 4 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Arma el bastidor', texto: 'Atornilla los listones verticales entre el horizontal de arriba y el de abajo, a escuadra.' },
        {
          titulo: 'Pega y atornilla el panel',
          texto: 'Pon cola en el bastidor, apoya el panel y atorníllalo cada 30 cm. Avellana las cabezas para masillar si vas a pintar.',
        },
        ...(listones.length
          ? [
              {
                titulo: 'Pon los listones',
                texto: `Pega y atornilla los ${listones.length} listones verticales con 5 cm de separación. Pinta antes de instalar si quieres dos colores.`,
                consejo: 'Usa un taco de 5 cm como separador.',
              },
            ]
          : []),
        {
          titulo: 'Fija al muro',
          texto: 'Atornilla cuatro escuadras al bastidor y fíjalas al muro con tarugos (o a pies derechos en tabiques). Revisa con el nivel.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const zapatero: ProyectoDef = {
  id: 'zapatero',
  nombre: 'Zapatero',
  descripcion: 'Mueble zapatero de melamina con niveles fijos y respaldo. Cabe en la entrada o dentro del closet.',
  plan: 'pro',
  horas: '3 a 4 horas',
  ...ficha('zapatero'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 120, step: 1, default: 80 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 40, max: 120, step: 1, default: 90 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 25, max: 40, step: 1, default: 32 },
    { id: 'niveles', label: 'Niveles', unidad: 'u', min: 2, max: 6, step: 1, default: 4 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const n = params.niveles
    const M = 'mel15'
    const t = 15
    const r = 3
    const k = (b: string, a: number, d: number) => claveDim(b, M, a, d)
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - t]) piezas.push(pieza(k('lateral', H, D - r), 'Lateral', M, [x, 0, r], [x + t, H, D], 1, { canto: H }))
    piezas.push(pieza(k('horizontal', W - 2 * t, D - r), 'Base / techo', M, [t, 0, r], [W - t, t, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza(k('horizontal', W - 2 * t, D - r), 'Base / techo', M, [t, H - t, r], [W - t, H, D], 1, { canto: W - 2 * t }))
    const ys = repartir(t, H - t, n - 1, t)
    for (const y of ys) piezas.push(pieza(k('nivel', W - 2 * t, D - r - 10), 'Nivel', M, [t, y, r], [W - t, y + t, D - 10], 2, { canto: W - 2 * t }))
    const resp = respaldo({ x0: 0, x1: W, y0: 0, y1: H, paso: 3 })
    piezas.push(...resp.piezas)
    const hueco = (H - 2 * t - (n - 1) * t) / n
    const avisos = hueco < 150 ? ['Los niveles quedan a menos de 15 cm: solo caben zapatos bajos. Baja la cantidad de niveles.'] : []
    if (H > 1000) avisos.push('Con más de 1 m de alto, fíjalo al muro con una escuadra.')
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes([...resp.herrajes, { id: 't4x40', cantidad: 8 + ys.length * 4 }, { id: 'cola', cantidad: 1 }]),
      pasos: [
        CORTE_MELAMINA,
        { titulo: 'Arma el cuerpo', texto: 'Atornilla la base y el techo entre los laterales, a ras. Perfora con broca de 3 mm antes de cada tornillo.' },
        {
          titulo: 'Pon los niveles',
          texto: `Marca las alturas de los ${ys.length} niveles en ambos laterales y atorníllalos (2 tornillos por lado), 1 cm hacia adentro del frente.`,
          consejo: 'Corta dos tacos de la altura del hueco y úsalos de separadores.',
        },
        { titulo: 'Clava el respaldo', texto: 'Revisa las diagonales y clava el respaldo cada 10 cm.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const tocador: ProyectoDef = {
  id: 'tocador',
  nombre: 'Tocador con espejo',
  descripcion: 'Tocador de melamina 18 mm con cajonera colgante, faldón trasero y marco para espejo sobre la cubierta.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('tocador'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 80, max: 140, step: 1, default: 100 },
    { id: 'alto', label: 'Alto de cubierta', unidad: 'cm', min: 72, max: 78, step: 1, default: 75 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 38, max: 50, step: 1, default: 42 },
    { id: 'cajones', label: 'Cajones', unidad: 'u', min: 1, max: 3, step: 1, default: 2 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const n = params.cajones
    const M = 'mel18'
    const t = 18
    const k = (b: string, a: number, d: number, m = M) => claveDim(b, m, a, d)
    const xi = W - 400
    const hc = n * 150
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []

    for (const x of [0, W - t]) piezas.push(pieza(k('lateral', H - t, D), 'Lateral', M, [x, 0, 0], [x + t, H - t, D], 1, { canto: H - t }))
    piezas.push(pieza(k('faldon', xi - t, 100), 'Faldón trasero', M, [t, H - t - 100, 0], [xi, H - t, t], 1))
    piezas.push(pieza(k('divCaj', hc, D), 'División de cajonera', M, [xi, H - t - hc, 0], [xi + t, H - t, D], 1, { canto: hc }))
    piezas.push(pieza(k('fondoCaj', W - t - xi, D), 'Fondo de cajonera', M, [xi, H - t - hc - t, 0], [W - t, H - t - hc, D], 1, { canto: W - t - xi }))
    piezas.push(pieza(k('cubierta', W, D + t), 'Cubierta', M, [0, H - t, 0], [W, H, D + t], 2, { canto: W + 2 * (D + t) }))
    const prof = correderaPara(D - 10) ?? 350
    const cc = columnaCajones({ x0: xi + t, x1: W - t, fx0: xi + 2, fx1: W - 2, y0: H - t - hc - 15, y1: H - t - 2, zF: D, prof, mat: M, paso: 3, pasoFrente: 3, n })
    piezas.push(...cc.piezas)
    herrajes.push(...cc.herrajes)
    // Marco de espejo sobre la cubierta: fondo de MDF 3 mm, espejo de 4 mm y marco de 6 cm.
    const Wm = Math.min(600, W - 200)
    const Hm = 700
    const xm = (W - Wm) / 2
    const zM = 7
    piezas.push(pieza(k('fondoEsp', Wm, Hm, 'hdf3'), 'Fondo del espejo', 'hdf3', [xm, H, 0], [xm + Wm, H + Hm, 3], 4))
    for (const x of [xm, xm + Wm - 60]) piezas.push(pieza(k('marcoV', Hm, 60), 'Marco vertical', M, [x, H, zM], [x + 60, H + Hm, zM + t], 4, { canto: 2 * Hm }))
    for (const y of [H, H + Hm - 60]) piezas.push(pieza(k('marcoH', Wm - 120, 60), 'Marco horizontal', M, [xm + 60, y, zM], [xm + Wm - 60, y + 60, zM + t], 4, { canto: 2 * (Wm - 120) }))
    herrajes.push({ id: 't4x40', cantidad: 20 }, { id: 'escuadra', cantidad: 2 }, { id: 'cola', cantidad: 1 })

    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`El espejo de 4 mm se pide cortado en vidriería: ${(Wm - 100) / 10}×${(Hm - 100) / 10} cm (no está en el presupuesto).`],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        {
          titulo: 'Arma la estructura',
          texto: 'Atornilla el faldón trasero entre el lateral izquierdo y la división, y el fondo de cajonera entre la división y el lateral derecho. Revisa que todo quede a escuadra.',
        },
        { titulo: 'Pon la cubierta', texto: 'Apoya la cubierta sobre los laterales, con 1,8 cm de vuelo al frente, y atorníllala desde abajo con escuadras o tornillos en diagonal.' },
        { titulo: 'Cajones', texto: 'Arma los cajones, monta las correderas en la división y el lateral, y pon frentes y tiradores.' },
        {
          titulo: 'Marco del espejo',
          texto: 'Arma el marco con cola y tornillos por detrás, pega el espejo con silicona neutra sobre el fondo y une el conjunto a la cubierta con dos escuadras.',
          consejo: 'Usa silicona neutra para espejos: la acética mancha la plata.',
        },
      ],
    }
  },
}

export const DORMITORIO: ProyectoDef[] = [cama, camarote, camaAlta, camaNido, comoda, closetAbierto, respaldoCama, zapatero, tocador]
