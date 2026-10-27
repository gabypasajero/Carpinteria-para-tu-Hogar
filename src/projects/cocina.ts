import type { HerrajeUso, PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { cajon, columnaCajones, cuerpo, lis, mesa, puertas, repisas, respaldo, tablero } from './kit'
import { claveDim, exteriorDe, juntarHerrajes, pieza, repartir, seccion } from './util'

const CORTE_PINO: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte, lija los cantos con grano 120 y marca cada pieza con su letra en una cara que no se vea.',
  consejo: 'Con ingletadora, fija un tope para cortar todas las piezas iguales del mismo largo.',
}
const CORTE_MELAMINA: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Pide el corte en la tienda con la lista de corte. Pega el tapacanto en los cantos indicados con la plancha caliente y recorta el sobrante con cuchillo.',
  consejo: 'Marca cada pieza con su letra con lápiz grafito en una cara que no se vea.',
}
const BISAGRAS: PasoGuia = {
  titulo: 'Puertas',
  texto: 'Perfora las cazoletas de 35 mm a 2 cm del borde de cada puerta, atornilla las bisagras a la puerta y luego al lateral. Regula los tornillos de la bisagra hasta que las juntas queden parejas.',
  consejo: 'Usa una plantilla de cartón para marcar las bisagras a la misma altura en todas las puertas.',
}

// ---------------------------------------------------------------------------------------------
export const mesaComedor: ProyectoDef = {
  id: 'mesa_comedor',
  nombre: 'Mesa de comedor',
  descripcion: 'Mesa de comedor de pino con patas laminadas de 2×4, faldones 1×6 y cubierta de tablas 2×6. De 4 a 10 personas.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('mesa_comedor'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 100, max: 240, step: 1, default: 160, ayuda: '60 cm por persona: 120 cm para 4, 160 para 6, 200 para 8, 240 para 10.' },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 70, max: 100, step: 1, default: 85, ayuda: 'Se ajusta al ancho de tablas enteras.' },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 74, max: 78, step: 1, default: 76 },
  ],
  construir(params) {
    const L = params.largo * 10
    const r = 60
    const m = mesa({
      L,
      W: params.ancho * 10,
      H: params.alto * 10,
      pata: { mat: 'pc2x4', ax: 82, az: 90, laminada: true },
      retiro: r,
      faldon: { mat: 'pc1x6' },
      cubierta: { mat: 'pc2x6', tipo: 'tablas', junta: 2 },
      pasos: { patas: 1, faldones: 2, cubierta: 3 },
    })
    const piezas: PiezaInstancia[] = [...m.piezas]
    const [fa, fe] = seccion('pc1x6')
    if (L > 1600) {
      const z0 = r + 45 + fe / 2
      piezas.push(...lis('travCentral', 'Travesaño central', 'pc1x6', [L / 2 - fe / 2, m.yTop - fa, z0], 2, m.W - 2 * z0, 1, 2))
    }
    const tablas = m.piezas.filter((p) => p.nombre === 'Tabla de cubierta').length
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [`Ancho real con tablas enteras: ${m.W / 10} cm. Caben ${Math.floor(L / 600) * 2 + (m.W >= 800 ? 2 : 0)} personas.`],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 8 * 6 + 16 + tablas * 6 },
        { id: 'escuadra', cantidad: 4 },
        { id: 'cola', cantidad: 2 },
        { id: 'lija120', cantidad: 6 },
        { id: 'barniz', cantidad: 2 },
      ]),
      pasos: [
        CORTE_PINO,
        {
          titulo: 'Lamina las patas',
          texto: 'Encola las dos mitades de cada pata cara a cara, prénsalas y atorníllalas desde la cara interior. Deja secar una hora.',
          consejo: 'Pon las prensas cada 20 cm y limpia la cola que rebalse con un paño húmedo.',
        },
        {
          titulo: 'Arma la base',
          texto: `Une los faldones a las patas con cola, tres tornillos por unión y una escuadra metálica en cada esquina.${L > 1600 ? ' Atornilla el travesaño central entre los faldones largos.' : ''}`,
          consejo: 'Mide las diagonales antes de que seque la cola.',
        },
        {
          titulo: 'Pon la cubierta',
          texto: 'Reparte las tablas con 2 mm de junta, encola los cantos si quieres una superficie continua y atorníllalas desde abajo a través de los faldones. Lija con grano 80, luego 120, y aplica dos manos de barniz.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const silla: ProyectoDef = {
  id: 'silla',
  nombre: 'Silla de comedor',
  descripcion: 'Silla de pino 2×2 con faldones 1×4 unidos con tarugos, asiento de terciado y respaldo de dos tablas.',
  plan: 'pro',
  horas: '5 a 6 horas por silla',
  ...ficha('silla'),
  params: [
    { id: 'altoAsiento', label: 'Alto del asiento', unidad: 'cm', min: 43, max: 48, step: 1, default: 45 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 48, step: 1, default: 44 },
  ],
  construir(params) {
    const HS = params.altoAsiento * 10
    const W = params.ancho * 10
    const D = 420
    const HB = 860
    const [p] = seccion('pc2x2')
    const [fa, fe] = seccion('pc1x4')
    const ya = HS - 12
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - p]) {
      piezas.push(...lis('pataTras', 'Pata trasera', 'pc2x2', [x, 0, 0], 1, HB, 0, 1))
      piezas.push(...lis('pataDel', 'Pata delantera', 'pc2x2', [x, 0, D - p], 1, ya, 0, 1))
      piezas.push(...lis('chambrana', 'Chambrana lateral', 'pc2x2', [x, 150, p], 2, D - 2 * p, 0, 1))
      piezas.push(...lis('faldonLat', 'Faldón lateral', 'pc1x4', [x + p / 2 - fe / 2, ya - fa, p], 2, D - 2 * p, 1, 1))
    }
    for (const z of [p / 2 - fe / 2, D - p / 2 - fe / 2]) piezas.push(...lis('faldonFT', 'Faldón frontal y trasero', 'pc1x4', [p, ya - fa, z], 0, W - 2 * p, 1, 2))
    for (const y of [HB - fa, HB - 2 * fa - 70]) piezas.push(...lis('respaldo', 'Tabla del respaldo', 'pc1x4', [p, y, p / 2 - fe / 2], 0, W - 2 * p, 1, 2))
    piezas.push(...tablero('asiento', 'Asiento', 'terc12', [0, ya, p], [W, HS, D], 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Medidas por silla: multiplica los materiales por la cantidad de sillas (las planchas y listones rinden más al cortar varias).'],
      herrajes: juntarHerrajes([
        { id: 'tarugo8', cantidad: 2 * 12 },
        { id: 't4x50', cantidad: 8 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 3 },
        { id: 'barniz', cantidad: 1 },
      ]),
      pasos: [
        CORTE_PINO,
        {
          titulo: 'Arma los dos costados',
          texto: 'Une cada pata trasera con su pata delantera mediante el faldón lateral y la chambrana, con dos tarugos de 8 mm y cola en cada unión. Prensa hasta que seque.',
          consejo: 'Usa centradores de tarugo para que los agujeros coincidan en ambas piezas.',
        },
        {
          titulo: 'Une los costados',
          texto: 'Encola y entaruga los faldones frontal y trasero y las dos tablas del respaldo entre las patas. Revisa con la escuadra y deja secar prensado.',
        },
        {
          titulo: 'Pon el asiento',
          texto: 'Redondea los cantos del asiento, atorníllalo desde abajo a los faldones con 8 tornillos y termina con lija y barniz.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const cocinaBase: ProyectoDef = {
  id: 'cocina_base',
  nombre: 'Mueble base de cocina',
  descripcion: 'Módulo base de cocina en melamina 18 mm (60, 80, 100 o 120 cm) con puertas, tres cajones o puertas con cajón. La cubierta se compra aparte.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('cocina_base'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 60, max: 120, step: 20, default: 80, opciones: ['60 cm', '80 cm', '100 cm', '120 cm'] },
    { id: 'tipo', label: 'Frente', unidad: 'u', min: 0, max: 2, step: 1, default: 0, opciones: ['Puertas', 'Tres cajones', 'Puertas y cajón superior'] },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = 860
    const D = 560
    const Z = 100
    const M = 'mel18'
    const t = 18
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const add = (r: { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] }) => {
      piezas.push(...r.piezas)
      herrajes.push(...r.herrajes)
    }
    add(cuerpo({ W, H, z0: 3, z1: D, mat: M, zocalo: Z, techo: 'travesanos', paso: 1 }))
    add(respaldo({ x0: 0, x1: W, y0: 0, y1: H, paso: 2 }))
    const tipo = params.tipo
    const avisos = ['La cubierta (postformado de 60 cm o cuarzo) se compra aparte y va sobre el módulo: la altura final queda en unos 90 cm.']
    if (tipo === 0) {
      add(repisas({ x0: t, x1: W - t, y0: Z + t, y1: H - t, z0: 3, z1: D - 30, n: 1, mat: M, paso: 3 }))
      add(puertas({ x0: 1.5, x1: W - 1.5, y0: Z + 3, y1: H - 3, zF: D, n: W > 600 ? 2 : 1, mat: M, paso: 4 }))
    } else if (tipo === 1) {
      const cols =
        W >= 1000
          ? [
              { x0: t, x1: W / 2 - t / 2, fx0: 1.5, fx1: W / 2 - 1.5 },
              { x0: W / 2 + t / 2, x1: W - t, fx0: W / 2 + 1.5, fx1: W - 1.5 },
            ]
          : [{ x0: t, x1: W - t, fx0: 1.5, fx1: W - 1.5 }]
      if (cols.length === 2)
        piezas.push(pieza(claveDim('division', M, H - Z - 2 * t, D - 3), 'División', M, [W / 2 - t / 2, Z + t, 3], [W / 2 + t / 2, H - t, D], 1, { canto: H - Z - 2 * t }))
      for (const c of cols) add(columnaCajones({ ...c, y0: Z + 3, y1: H - 3, zF: D, prof: 450, mat: M, paso: 3, pasoFrente: 4, n: 3 }))
    } else {
      const yc = H - 3 - 150
      add(cajon({ x0: t, x1: W - t, fx0: 1.5, fx1: W - 1.5, y0: yc, y1: H - 3, zF: D, prof: 450, mat: M, paso: 3, pasoFrente: 4 }))
      add(repisas({ x0: t, x1: W - t, y0: Z + t, y1: yc - 20, z0: 3, z1: D - 30, n: 1, mat: M, paso: 3 }))
      add(puertas({ x0: 1.5, x1: W - 1.5, y0: Z + 3, y1: yc - 3, zF: D, n: W > 600 ? 2 : 1, mat: M, paso: 4 }))
    }
    herrajes.push({ id: 'cola', cantidad: 1 })
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos,
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        {
          titulo: 'Arma el cuerpo',
          texto: 'Atornilla la base entre los laterales a 10 cm del piso, el zócalo 5 cm hacia adentro y los dos travesaños superiores (adelante y atrás). Perfora siempre antes con broca de 3 mm.',
        },
        { titulo: 'Clava el respaldo', texto: 'Comprueba que las diagonales midan lo mismo y clava el respaldo cada 10 cm.' },
        tipo === 0
          ? { titulo: 'Repisa', texto: 'Perfora los agujeros de los soportes a la altura que quieras y apoya la repisa.' }
          : { titulo: 'Cajones', texto: 'Arma las cajas de los cajones con su fondo y monta las correderas de 45 cm a la misma altura en ambos lados.' },
        { ...BISAGRAS, titulo: tipo === 1 ? 'Frentes y tiradores' : 'Puertas y frentes', texto: tipo === 1 ? 'Fija cada frente desde dentro con 3 mm de junta y pon los tiradores.' : BISAGRAS.texto },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const cocinaAereo: ProyectoDef = {
  id: 'cocina_aereo',
  nombre: 'Mueble aéreo de cocina',
  descripcion: 'Módulo colgante de melamina 15 mm con repisa regulable, puertas con bisagra cazoleta y listón colgador oculto.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('cocina_aereo'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 120, step: 10, default: 80 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 60, max: 70, step: 10, default: 70, opciones: ['60 cm', '70 cm'] },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 30, max: 35, step: 1, default: 32 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const M = 'mel15'
    const t = 15
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const add = (r: { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] }) => {
      piezas.push(...r.piezas)
      herrajes.push(...r.herrajes)
    }
    add(cuerpo({ W, H, z0: 3, z1: D, mat: M, zocalo: 0, techo: 'completo', paso: 1 }))
    piezas.push(pieza(claveDim('colgador', M, W - 2 * t, 90), 'Listón colgador', M, [t, H - t - 90, 3], [W - t, H - t, 3 + t], 1))
    add(respaldo({ x0: 0, x1: W, y0: 0, y1: H, paso: 2 }))
    add(repisas({ x0: t, x1: W - t, y0: t, y1: H - t - 90, z0: 3 + t, z1: D - 10, n: H > 650 ? 2 : 1, mat: M, paso: 3 }))
    add(puertas({ x0: 1.5, x1: W - 1.5, y0: 1.5, y1: H - 1.5, zF: D, n: W > 600 ? 2 : 1, mat: M, paso: 4 }))
    herrajes.push({ id: 't4x50', cantidad: Math.max(3, Math.ceil(W / 300)) })
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Instálalo con la base a 45–60 cm sobre la cubierta (unos 1,45 m del piso). El colgador se atornilla al muro con tarugos o a los pies derechos.'],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        { titulo: 'Arma el cuerpo', texto: 'Atornilla la base y el techo entre los laterales y el listón colgador bajo el techo, pegado atrás.' },
        { titulo: 'Clava el respaldo', texto: 'Revisa las diagonales y clava el respaldo cada 10 cm.' },
        { titulo: 'Repisas', texto: 'Perfora los agujeros de los soportes y apoya las repisas.' },
        { ...BISAGRAS, texto: `${BISAGRAS.texto} Cuelga el mueble atornillando el listón colgador al muro, revisando con el nivel.` },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const despensa: ProyectoDef = {
  id: 'despensa',
  nombre: 'Despensa alta',
  descripcion: 'Alacena alta de melamina 18 mm con repisas regulables y puertas de piso a techo. Se fija al muro.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('despensa'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 90, step: 1, default: 60 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 180, max: 240, step: 1, default: 210 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 35, max: 60, step: 1, default: 45 },
    { id: 'repisas', label: 'Repisas', unidad: 'u', min: 3, max: 7, step: 1, default: 5 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const D = params.fondo * 10
    const M = 'mel18'
    const t = 18
    const Z = 60
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const add = (r: { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] }) => {
      piezas.push(...r.piezas)
      herrajes.push(...r.herrajes)
    }
    add(cuerpo({ W, H, z0: 3, z1: D, mat: M, zocalo: Z, techo: 'completo', paso: 1 }))
    add(respaldo({ x0: 0, x1: W, y0: 0, y1: H, paso: 2 }))
    add(repisas({ x0: t, x1: W - t, y0: Z + t, y1: H - t, z0: 3, z1: D - 10, n: params.repisas, mat: M, paso: 3 }))
    add(puertas({ x0: 1.5, x1: W - 1.5, y0: Z + 1.5, y1: H - 1.5, zF: D, n: W > 500 ? 2 : 1, mat: M, paso: 4 }))
    herrajes.push({ id: 'escuadra', cantidad: 2 })
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Fíjala al muro con dos escuadras en la parte superior: un mueble alto lleno puede volcarse.'],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        { titulo: 'Arma el cuerpo', texto: `Con el mueble acostado, atornilla la base a ${Z / 10} cm del piso, el zócalo y el techo entre los laterales.` },
        { titulo: 'Clava el respaldo', texto: 'Revisa las diagonales y clava el respaldo cada 10 cm. Para el mueble con ayuda y fíjalo al muro.' },
        { titulo: 'Repisas', texto: 'Perfora los agujeros de los soportes y apoya las repisas.' },
        BISAGRAS,
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const isla: ProyectoDef = {
  id: 'isla',
  nombre: 'Isla de cocina',
  descripcion: 'Isla o desayunador de melamina 18 mm: módulos base con puertas, espalda terminada, cubierta doble de 36 mm y 30 cm de voladizo para taburetes.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('isla'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 100, max: 220, step: 1, default: 140 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 90, max: 105, step: 15, default: 90, opciones: ['Mesón (90 cm)', 'Barra (105 cm)'] },
  ],
  construir(params) {
    const L = params.largo * 10
    const Ht = params.alto * 10
    const M = 'mel18'
    const t = 18
    const V = 300
    const Z = 100
    const Hb = Ht - 2 * t
    const zF = V + 560
    const [p] = seccion('pc2x2')
    const piezas: PiezaInstancia[] = []
    const herrajes: HerrajeUso[] = []
    const add = (r: { piezas: PiezaInstancia[]; herrajes: HerrajeUso[] }) => {
      piezas.push(...r.piezas)
      herrajes.push(...r.herrajes)
    }
    piezas.push(...tablero('espalda', 'Espalda', M, [0, 0, V], [L, Hb, V + t], 1, { canto: 2 * Hb }))
    const nMod = Math.ceil(L / 1000)
    const wm = L / nMod
    for (let i = 0; i < nMod; i++) {
      const x0 = i * wm
      add(cuerpo({ x0, W: wm, H: Hb, z0: V + t, z1: zF, mat: M, zocalo: Z, techo: 'travesanos', paso: 1 }))
      add(repisas({ x0: x0 + t, x1: x0 + wm - t, y0: Z + t, y1: Hb - t, z0: V + t, z1: zF - 30, n: 1, mat: M, paso: 2 }))
      add(puertas({ x0: x0 + 1.5, x1: x0 + wm - 1.5, y0: Z + 3, y1: Hb - 3, zF, n: wm > 600 ? 2 : 1, mat: M, paso: 2 }))
    }
    const patasX = [0, L - p, ...(L > 1600 ? [L / 2 - p / 2] : [])]
    for (const x of patasX) piezas.push(...lis('pie', 'Pie de apoyo', 'pc2x2', [x, 0, 40], 1, Hb, 0, 3))
    const zc = zF + t + 20
    for (const y of [Hb, Hb + t]) piezas.push(...tablero('cubierta', y === Hb ? 'Cubierta (capa inferior)' : 'Cubierta (capa superior)', M, [0, y, 0], [L, y + t, zc], 4, { canto: y === Hb ? 0 : 2 * (L + zc) }))
    herrajes.push({ id: 'escuadra', cantidad: 2 * nMod + 2 * patasX.length }, { id: 't4x40', cantidad: Math.ceil((L * zc) / 40000) }, { id: 'cola', cantidad: 2 })
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [
        params.alto === 105 ? 'Para barra de 105 cm usa taburetes de unos 75 cm.' : 'Para mesón de 90 cm usa pisos de unos 65 cm.',
        'Si prefieres cubierta de cuarzo o postformado, no compres la cubierta de melamina: mide la isla ya armada.',
      ],
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE_MELAMINA,
        {
          titulo: 'Arma los módulos y la espalda',
          texto: 'Arma cada módulo (laterales, base, zócalo y travesaños), únelos entre sí con tornillos por los laterales y atornilla la espalda terminada por detrás.',
          consejo: 'Nivela los módulos con cuñas antes de unirlos.',
        },
        { titulo: 'Repisas y puertas', texto: `Apoya las repisas sobre sus soportes. ${BISAGRAS.texto}` },
        { titulo: 'Pies de apoyo', texto: 'Atornilla los pies de apoyo bajo el voladizo y fíjalos al piso con una escuadra cada uno.' },
        {
          titulo: 'Cubierta',
          texto: 'Encola y atornilla las dos capas de la cubierta por debajo (tornillos de 30 mm cada 20 cm), apóyala sobre los módulos y fíjala con escuadras.',
          consejo: 'Tapacanta solo la capa superior y el canto de 36 mm completo para que parezca una sola pieza.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const especiero: ProyectoDef = {
  id: 'especiero',
  nombre: 'Especiero de muro',
  descripcion: 'Repisa de cocina de pino con laterales 1×4, niveles 1×3 y topes para que los frascos no se caigan.',
  plan: 'pro',
  horas: '2 a 3 horas',
  ...ficha('especiero'),
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 30, max: 100, step: 1, default: 50 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 30, max: 90, step: 1, default: 50 },
    { id: 'niveles', label: 'Niveles', unidad: 'u', min: 2, max: 5, step: 1, default: 3 },
  ],
  construir(params) {
    const W = params.ancho * 10
    const H = params.alto * 10
    const n = params.niveles
    const [, lE] = seccion('pc1x4')
    const [rA, rE] = seccion('pc1x3')
    const [, tE] = seccion('pc1x2')
    const piezas: PiezaInstancia[] = []
    for (const x of [0, W - lE]) piezas.push(...lis('lateral', 'Lateral', 'pc1x4', [x, 0, 0], 1, H, 2, 1))
    const ys = [0, ...repartir(rE, H - rE, n - 2, rE), H - rE]
    for (const y of ys) {
      piezas.push(...lis('nivel', 'Nivel', 'pc1x3', [lE, y, 0], 0, W - 2 * lE, 2, 2))
      if (y < H - rE - 1) piezas.push(...lis('tope', 'Tope', 'pc1x2', [lE, y + rE, rA - tE], 0, W - 2 * lE, 1, 3))
    }
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: n * 4 + (n - 1) * 2 + 2 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 1 },
      ]),
      pasos: [
        CORTE_PINO,
        { titulo: 'Une los niveles a los laterales', texto: 'Pega y atornilla cada nivel entre los laterales (dos tornillos por lado), a ras atrás.' },
        { titulo: 'Pon los topes', texto: 'Pega los topes en el borde delantero de cada nivel (menos el de arriba) y fíjalos con un tornillo por lado desde los laterales.' },
        { titulo: 'Cuelga', texto: 'Lija, barniza o pinta y atornilla el especiero al muro por dentro de los laterales con tarugos.' },
      ],
    }
  },
}

export const COCINA: ProyectoDef[] = [mesaComedor, silla, cocinaBase, cocinaAereo, despensa, isla, especiero]
