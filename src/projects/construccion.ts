import type { HerrajeUso, PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { entramado, lis, type Vano } from './kit'
import { casa, tablasMuro } from './obra'
import { areaM2, barra, cada, exteriorDe, juntarHerrajes, espesor, placas, seccion } from './util'

const CORTE: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta los listones según la lista de corte y márcalos con su letra. Las placas se cortan al presentarlas: marca con lápiz, corta el papel con cuchillo cartonero y quiebra la placa.',
  consejo: 'Usa pino seco (humedad bajo 18 %): el verde se tuerce al secarse y agrieta las juntas.',
}

/** Metros de junta de una cara de placas: las uniones verticales entre placas y las horizontales si hay más de una fila. */
function juntas(piezas: PiezaInstancia[], L: number, H: number, ancho: number): number {
  const columnas = Math.ceil(L / ancho)
  const filas = piezas.length / Math.max(1, columnas)
  return ((columnas - 1) * H + (filas > columnas ? L : 0)) / 1000
}

// ---------------------------------------------------------------------------------------------
export const tabique: ProyectoDef = {
  id: 'tabique',
  nombre: 'Tabique divisorio',
  descripcion: 'Muro interior no soportante de volcanita sobre entramado de pino 2×3: soleras, pies derechos, cadenetas, vano de puerta opcional y aislación de lana.',
  plan: 'pro',
  horas: '1 a 2 días',
  ...ficha('tabique'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 100, max: 500, step: 1, default: 300 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 220, max: 260, step: 1, default: 240 },
    { id: 'sep', label: 'Pies derechos cada', unidad: 'cm', min: 40, max: 60, step: 20, default: 60, opciones: ['40 cm', '60 cm'] },
    { id: 'puerta', label: 'Puerta', unidad: 'u', min: 0, max: 1, step: 1, default: 0, opciones: ['Sin puerta', 'Con vano de puerta (90×200)'] },
    { id: 'placa', label: 'Volcanita', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['10 mm', '15 mm'] },
    { id: 'lana', label: 'Aislación', unidad: 'u', min: 0, max: 1, step: 1, default: 1, opciones: ['Sin aislación', 'Con lana de vidrio'] },
  ],
  construir(params) {
    const L = params.largo * 10
    const H = params.alto * 10
    const v = params.placa === 1 ? 'volc15' : 'volc10'
    const ev = espesor(v)
    const [a] = seccion('pd2x3')
    const conPuerta = params.puerta === 1 && L >= 1200
    const vanos: Vano[] = conPuerta ? [{ desde: L / 2 - 450, ancho: 900, alto: 2000 }] : []
    const e = entramado({ material: 'pd2x3', eje: 'x', origen: [0, 0, ev], largo: L, alto: H, sep: params.sep * 10, vanos, paso: 1 })
    const caraA = placas('placa', 'Placa de volcanita', v, 'xy', [0, L], [0, H], 0, 2, e.aberturas)
    const caraB = placas('placa', 'Placa de volcanita', v, 'xy', [0, L], [0, H], ev + a, 3, e.aberturas)
    const area = areaM2(caraA)
    const ancho = 1200
    const mJuntas = juntas(caraA, L, H, ancho) * 2 + (conPuerta ? 2 * (2 * 2 + 0.9) : 0)
    const herrajes: HerrajeUso[] = [
      { id: 'clavo4', cantidad: e.piezas.length * 4 },
      { id: 'tvolc', cantidad: Math.ceil(area * 2 * 20) },
      { id: 'cintamuro', cantidad: Math.ceil(mJuntas) },
      { id: 'pastamuro', cantidad: Math.ceil(area * 2 * 0.4 * 10) / 10 },
    ]
    if (params.lana === 1) herrajes.push({ id: 'lanamin', cantidad: Math.ceil(area * 10) / 10 })
    const avisos = ['Fija la solera inferior al piso y la superior al cielo cada 60 cm, con tarugos o tornillos según el material.']
    if (params.puerta === 1 && !conPuerta) avisos.push('El vano de puerta necesita un tabique de al menos 1,2 m de largo.')
    if (conPuerta) avisos.push('La puerta, el marco y los junquillos no están en el presupuesto.')
    return {
      piezas: [...e.piezas, ...caraA, ...caraB],
      exterior: exteriorDe([...e.piezas, ...caraA, ...caraB]),
      avisos,
      herrajes: juntarHerrajes(herrajes),
      pasos: [
        CORTE,
        {
          titulo: 'Entramado',
          texto: `Fija las soleras al piso y al cielo alineadas con un hilo, y pon los pies derechos cada ${params.sep} cm, aplomados, con cadenetas a media altura.${conPuerta ? ' En el vano de puerta pon jambas dobles y un dintel.' : ''}`,
          consejo: 'Marca la posición de los pies derechos en el piso y el cielo antes de cortar.',
        },
        {
          titulo: 'Primera cara',
          texto: 'Atornilla las placas de una cara con tornillos cada 25 cm en los bordes y 30 cm al centro, a 1 cm del borde. Las juntas verticales caen sobre un pie derecho.',
          consejo: 'Hunde la cabeza del tornillo apenas bajo el papel, sin romperlo.',
        },
        {
          titulo: 'Aislación, segunda cara y terminación',
          texto: `${params.lana === 1 ? 'Rellena los huecos con lana de vidrio. ' : ''}Atornilla la segunda cara desfasando las juntas respecto de la primera. Pega la cinta en las juntas, pasa tres manos de pasta y lija suave entre manos.`,
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const muroRevestido: ProyectoDef = {
  id: 'muro_revestido',
  nombre: 'Muro revestido con machihembrado',
  descripcion: 'Revestimiento de un muro existente con tablas de pino machihembrado sobre listones 1×2, en vertical u horizontal.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('muro_revestido'),
  params: [
    { id: 'largo', label: 'Largo del muro', unidad: 'cm', min: 100, max: 500, step: 1, default: 300 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 90, max: 260, step: 1, default: 240 },
    { id: 'orientacion', label: 'Tablas', unidad: 'u', min: 0, max: 1, step: 1, default: 0, opciones: ['Verticales', 'Horizontales'] },
  ],
  construir(params) {
    const L = params.largo * 10
    const H = params.alto * 10
    const vertical = params.orientacion === 0
    const [lA, lE] = seccion('pc1x2')
    const piezas: PiezaInstancia[] = []
    // Los listones van cruzados a las tablas, cada 50 cm como máximo.
    if (vertical) for (const y of cada(0, H, lA, 500)) piezas.push(...lis('liston', 'Listón de enlistonado', 'pc1x2', [0, y, 0], 0, L, 1, 1))
    else for (const x of cada(0, L, lA, 500)) piezas.push(...lis('liston', 'Listón de enlistonado', 'pc1x2', [x, 0, 0], 1, H, 0, 1))
    const listones = piezas.length
    const tablas = tablasMuro('tabla', 'Tabla machihembrada', 'machi', 'xy', [0, L], [0, H], lE, 2, [], vertical ? 'v' : 'h', 80)
    piezas.push(...tablas)
    const cruces = vertical ? cada(0, H, lA, 500).length : cada(0, L, lA, 500).length
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Deja las tablas 48 horas dentro de la pieza antes de instalarlas para que se aclimaten.', 'Guardapolvo y cornisa se compran aparte.'],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: listones * Math.ceil((vertical ? L : H) / 500 + 1) },
        { id: 'clavo2', cantidad: tablas.length * cruces },
        { id: 'cola', cantidad: Math.ceil(tablas.length / 40) },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Enlistonado', texto: `Atornilla los listones al muro con tarugos cada 50 cm, ${vertical ? 'horizontales' : 'verticales'} y aplomados. Suple con cuñas donde el muro no esté plano.` },
        {
          titulo: 'Tablas',
          texto: 'Parte desde una esquina con la hembra hacia ella. Clava cada tabla en diagonal por el macho (clavo oculto) en cada listón y encaja la siguiente.',
          consejo: 'Revisa con el nivel cada cinco tablas: un desvío pequeño se nota al final.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const habitacion: ProyectoDef = {
  id: 'habitacion',
  nombre: 'Habitación de madera',
  descripcion: 'Ampliación de una pieza en estructura de madera: piso sobre vigas, muros de entramado 2×4 con OSB por fuera, lana de vidrio y volcanita por dentro, puerta, ventana y techo a dos aguas.',
  plan: 'pro',
  horas: '2 a 4 semanas',
  ...ficha('habitacion'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 250, max: 500, step: 1, default: 350 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 250, max: 280, step: 1, default: 270 },
    { id: 'alto', label: 'Alto de muros', unidad: 'cm', min: 240, max: 260, step: 1, default: 240 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const Hm = params.alto * 10
    const c = espesor('osb11')
    const [a] = seccion('pd2x4')
    const ladoZ = W - 2 * c - 2 * a
    const k = casa({
      L,
      W,
      Hm,
      piso: { vigas: 'pi2x4', sep: 400, placa: 'osb15' },
      muro: { mat: 'pd2x4', sep: 400, revest: 'osb11', interior: 'volc15', cadenetas: true },
      techo: { cabios: 'pc2x6', sep: 600, pendiente: 25, placa: 'osb11' },
      vanos: {
        frente: [{ desde: 400, ancho: 900, alto: 2000 }],
        der: [{ desde: ladoZ / 2 - 600, ancho: 1200, alto: 2100, antepecho: 1100 }],
      },
      pasos: { piso: 1, muros: 2, revest: 3, techo: 4, interior: 5 },
    })
    const sup = (L * W) / 1e6
    return {
      piezas: k.piezas,
      exterior: exteriorDe(k.piezas),
      avisos: [
        `Superficie: ${sup.toFixed(1)} m². Es una ampliación: necesita permiso de obra menor en la DOM con planos firmados por un arquitecto.`,
        'No incluye fundaciones (poyos o radier), cubierta de techo, cielo, puerta, ventana, instalación eléctrica (debe hacerla un instalador SEC) ni barrera de humedad.',
        `Cubierta de techo aparte: unos ${Math.ceil(k.areaTecho)} m² de zinc o teja asfáltica.`,
      ],
      herrajes: juntarHerrajes([
        { id: 'clavo4', cantidad: k.piezasEntramado * 4 + k.nCabios * 4 },
        { id: 'clavo3', cantidad: k.nVigas * 8 + Math.ceil(k.areaRevest * 15) },
        { id: 'tvolc', cantidad: Math.ceil(k.areaInterior * 20) },
        { id: 'escuadra', cantidad: k.nCabios + 8 },
        { id: 'perno', cantidad: Math.ceil((2 * (L + W)) / 1000) },
        { id: 'lanamin', cantidad: Math.ceil(k.areaMuros) },
        { id: 'cintamuro', cantidad: Math.ceil(k.areaInterior * 1.5) },
        { id: 'pastamuro', cantidad: Math.ceil(k.areaInterior * 0.4) },
      ]),
      pasos: [
        { ...CORTE, consejo: 'Para muros estructurales usa pino grado C24; para tabiques interiores basta C16.' },
        { titulo: 'Piso', texto: 'Sobre los poyos o el radier, instala las vigas de piso cada 40 cm, niveladas, y atornilla las placas de OSB de 15 mm con las juntas desfasadas.' },
        {
          titulo: 'Muros',
          texto: 'Arma cada muro en el piso con pies derechos cada 40 cm, cadenetas, jambas y dinteles en la puerta y la ventana. Levántalos, aplómalos, únelos en las esquinas y apernalos al piso.',
          consejo: 'Arriostra los muros con diagonales provisorias hasta que pongas el OSB.',
        },
        { titulo: 'Revestimiento exterior', texto: 'Atornilla o clava el OSB por fuera, cada 15 cm en los bordes y 30 cm al centro. Es el que da rigidez a los muros.' },
        { titulo: 'Techo', texto: 'Instala la cumbrera y los cabios a 25° con escuadras, el OSB del techo, los frontones y la cubierta.' },
        {
          titulo: 'Interior',
          texto: 'Pasa las instalaciones, rellena los muros con lana de vidrio y atornilla la volcanita de 15 mm. Termina las juntas con cinta y pasta.',
        },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const altillo: ProyectoDef = {
  id: 'altillo',
  nombre: 'Altillo (mezanine)',
  descripcion: 'Plataforma interior de madera sobre pilares laminados de 2×6, vigas dobles, envigado cada 40 cm, piso de terciado 18 mm, baranda y escalera de servicio.',
  plan: 'pro',
  horas: '1 a 2 semanas',
  ...ficha('altillo'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 150, max: 300, step: 1, default: 240 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 150, max: 250, step: 1, default: 200 },
    { id: 'altura', label: 'Altura del piso del altillo', unidad: 'cm', min: 180, max: 240, step: 1, default: 220 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const Hf = params.altura * 10
    const [vA, vE] = seccion('pc2x6')
    const [bA, bE] = seccion('pc1x2')
    const [hA] = seccion('pc2x4')
    const yP = Hf - 18 - vA
    const yV = yP - vA
    const piezas: PiezaInstancia[] = []
    // Pilares laminados (dos 2×6 encolados) en las esquinas.
    for (const x of [0, L - 2 * vE])
      for (const z of [0, W - vA])
        for (const d of [0, vE]) piezas.push(...lis('pilar', 'Pilar (mitad laminada)', 'pc2x6', [x + d, 0, z], 1, yV, 2, 1))
    // Vigas dobles sobre los pilares.
    for (const z0 of [(vA - 2 * vE) / 2, W - vA + (vA - 2 * vE) / 2]) for (const d of [0, vE]) piezas.push(...lis('viga', 'Viga (doble)', 'pc2x6', [0, yV, z0 + d], 0, L, 1, 2))
    // Envigado: cabezales y vigas de piso cada 40 cm.
    for (const z of [0, W - vE]) piezas.push(...lis('cabezal', 'Cabezal', 'pc2x6', [0, yP, z], 0, L, 1, 3))
    const xsJ = cada(0, L, vE, 400)
    for (const x of xsJ) piezas.push(...lis('vigueta', 'Viga de piso', 'pc2x6', [x, yP, vE], 2, W - 2 * vE, 1, 3))
    piezas.push(...placas('piso', 'Piso de terciado', 'terc18', 'xz', [0, L], [0, W], Hf - 18, 4))
    // Escalera de servicio a 60° por el lado derecho, junto al frente.
    const anchoEsc = 700
    const zE = W - vE - anchoEsc - 2 * vE
    const run = Hf / Math.tan((60 * Math.PI) / 180)
    const nE = Math.ceil(Hf / 220)
    for (const z of [zE, zE + vE + anchoEsc])
      piezas.push(barra('zanca', 'Zanca de escalera', 'pc2x6', [L + run + 40, 70, z + vE / 2], [L + 40, Hf - 60, z + vE / 2], 'xy', [vA, vE], 5, { nota: 'cortes a 60° y 30°' }))
    for (let i = 1; i < nE; i++) {
      const y = (i * Hf) / nE
      const xc = L + 40 + ((Hf - y) / Hf) * run
      piezas.push(...lis('peldano', 'Peldaño', 'pc2x6', [xc - vA / 2, y - vE, zE + vE], 2, anchoEsc, 0, 5))
    }
    // Baranda de 95 cm: balaustres con menos de 12,5 cm entre ellos y pasamanos.
    const xsB = cada(0, L, bA, bA + 110)
    for (const x of xsB) piezas.push(...lis('balaustre', 'Balaustre', 'pc1x2', [x, Hf - 150, W], 1, 1100, 0, 6))
    const zsB = cada(0, zE - 20, bA, bA + 110)
    for (const z of zsB) piezas.push(...lis('balaustre', 'Balaustre', 'pc1x2', [L, Hf - 150, z], 1, 1100, 2, 6))
    piezas.push(...lis('pasamanos', 'Pasamanos', 'pc2x4', [0, Hf + 950, W + bE - hA], 0, L, 2, 6))
    piezas.push(...lis('pasamanos', 'Pasamanos', 'pc2x4', [L + bE - hA, Hf + 950, 0], 2, zE - 20, 0, 6))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [
        'Agrega superficie y es una estructura: requiere permiso y cálculo de un profesional. Usa este plano para cotizar.',
        'La escalera de 60° es de servicio. Para uso diario la OGUC pide huella de 28 cm o más y contrahuella de 13 a 18 cm.',
        'Ancla los pilares al piso con escuadras y, si se puede, la estructura al muro.',
      ],
      herrajes: juntarHerrajes([
        { id: 'perno', cantidad: 4 * 4 + 8 },
        { id: 'escuadra', cantidad: xsJ.length * 2 + 8 },
        { id: 't4x50', cantidad: Math.ceil(((L * W) / 1e6) * 12) + (xsB.length + zsB.length) * 2 + nE * 4 },
        { id: 'cola', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Pilares', texto: 'Encola y atornilla las dos mitades de cada pilar. Ubícalos aplomados y fíjalos al piso con escuadras.' },
        { titulo: 'Vigas dobles', texto: 'Apoya las vigas dobles sobre los pilares y apérnalas con dos pernos por pilar.' },
        { titulo: 'Envigado', texto: 'Atornilla los cabezales y reparte las vigas de piso cada 40 cm con escuadras en ambos extremos.' },
        { titulo: 'Piso', texto: 'Atornilla el terciado de 18 mm cada 20 cm con las juntas desfasadas sobre las vigas.' },
        { titulo: 'Escalera', texto: 'Corta las zancas a 60° y 30°, atornilla los peldaños con escuadras y fija la escalera al cabezal.' },
        { titulo: 'Baranda', texto: 'Atornilla los balaustres a los cabezales con menos de 12,5 cm entre ellos y el pasamanos a 95 cm del piso.', consejo: 'La baranda debe resistir 50 kg por metro empujada hacia afuera.' },
      ],
    }
  },
}

export const CONSTRUCCION: ProyectoDef[] = [tabique, muroRevestido, habitacion, altillo]
