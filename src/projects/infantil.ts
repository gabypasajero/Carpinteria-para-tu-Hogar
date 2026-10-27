import type { PasoGuia, PiezaInstancia, ProyectoDef } from '../core/types'
import { ficha } from './ficha'
import { COLCHONES, lis, mesa } from './kit'
import { casa } from './obra'
import { barra, cada, claveDim, exteriorDe, juntarHerrajes, mover, pieza, seccion } from './util'

const CORTE: PasoGuia = {
  titulo: 'Corta y prepara las piezas',
  texto: 'Corta las piezas según la lista de corte, redondea las esquinas y lija todos los cantos con grano 120: los niños tocan todo.',
  consejo: 'Usa pintura o barniz al agua, sin plomo, apto para muebles infantiles.',
}

// ---------------------------------------------------------------------------------------------
export const casitaJuego: ProyectoDef = {
  id: 'casita_juego',
  nombre: 'Casita de juegos',
  descripcion: 'Casita de jardín para niños: piso de OSB sobre polines, muros de entramado de pino impregnado revestidos con machihembrado, puerta, dos ventanas y techo a dos aguas.',
  plan: 'pro',
  horas: '3 a 4 días',
  ...ficha('casita_juego'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 120, max: 200, step: 1, default: 150 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 100, max: 160, step: 1, default: 120 },
    { id: 'alto', label: 'Alto de muros', unidad: 'cm', min: 120, max: 150, step: 1, default: 130 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const Hm = params.alto * 10
    const [a] = seccion('pi2x2')
    const c = seccion('machi')[1]
    const ladoZ = W - 2 * c - 2 * a
    const ventana = { desde: ladoZ / 2 - 200, ancho: 400, alto: 950, antepecho: 550 }
    const k = casa({
      L,
      W,
      Hm,
      piso: { vigas: 'polin', sep: 600, placa: 'osb11' },
      muro: { mat: 'pi2x2', sep: 600, revest: 'machi', tablas: { util: 80 }, cadenetas: false },
      techo: { cabios: 'pi2x3', sep: 600, pendiente: 35, placa: 'osb11' },
      vanos: { frente: [{ desde: (L - 2 * c) / 2 - 250, ancho: 500, alto: 1000 }], izq: [ventana], der: [ventana] },
      pasos: { piso: 1, muros: 2, revest: 3, techo: 4 },
    })
    return {
      piezas: k.piezas,
      exterior: exteriorDe(k.piezas),
      avisos: [
        `La cubierta del techo (tejuela asfáltica o zinc, unos ${Math.ceil(k.areaTecho)} m²) no está en el presupuesto.`,
        'Apoya los polines sobre poyos de hormigón o pastelones, no directo en la tierra.',
        'Lija y redondea los bordes de la puerta y las ventanas.',
      ],
      herrajes: juntarHerrajes([
        { id: 'clavo3', cantidad: k.piezasEntramado * 4 + k.nCabios * 4 },
        { id: 'clavo2', cantidad: k.tablasRevest * 4 },
        { id: 'tdeck', cantidad: Math.ceil(k.areaPiso * 12 + k.areaTecho * 10) },
        { id: 'escuadra', cantidad: 8 },
        { id: 'protdeck', cantidad: Math.ceil(k.areaRevest + k.areaPiso) },
      ]),
      pasos: [
        { ...CORTE, texto: 'Corta las piezas del entramado y del techo según la lista de corte. Las tablas de revestimiento se cortan al presentarlas en cada muro.' },
        { titulo: 'Piso', texto: 'Nivela los polines sobre poyos, cada 60 cm, y atornilla encima las placas de OSB del piso con tornillos cada 15 cm por el borde.', consejo: 'Comprueba las diagonales del piso: si son iguales, todo lo demás saldrá a escuadra.' },
        { titulo: 'Muros', texto: 'Arma cada muro en el piso (soleras, pies derechos y vanos), levántalo y únelo a los vecinos y al piso con clavos de 3" y escuadras.' },
        { titulo: 'Revestimiento', texto: 'Clava el machihembrado de abajo hacia arriba con el macho hacia arriba, recortando los vanos de puerta y ventanas.', consejo: 'Pinta o protege las tablas antes de instalarlas: el machihembrado se mueve y deja ver líneas sin pintar.' },
        { titulo: 'Techo', texto: 'Presenta un par de cabios con sus cortes a 35°, úsalo de plantilla, instala la cumbrera y los cabios cada 60 cm, y atornilla las placas de OSB. Cierra los frontones y pon la cubierta de techo.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
const EDADES = [
  { nombre: '2 a 3 años (mesa 45 cm)', mesa: 450, silla: 260 },
  { nombre: '4 a 6 años (mesa 52 cm)', mesa: 520, silla: 300 },
  { nombre: '7 a 9 años (mesa 58 cm)', mesa: 580, silla: 340 },
]

export const mesaInfantil: ProyectoDef = {
  id: 'mesa_infantil',
  nombre: 'Mesa y pisos infantiles',
  descripcion: 'Mesa para niños con cubierta de terciado y dos pisos a juego, con alturas según la edad.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('mesa_infantil'),
  params: [
    { id: 'edad', label: 'Edad', unidad: 'u', min: 0, max: 2, step: 1, default: 1, opciones: EDADES.map((e) => e.nombre) },
    { id: 'largo', label: 'Largo de la mesa', unidad: 'cm', min: 50, max: 90, step: 1, default: 60 },
  ],
  construir(params) {
    const ed = EDADES[params.edad]
    const L = params.largo * 10
    const W = 500
    const [p] = seccion('pc2x2')
    const base = { pata: { mat: 'pc2x2', ax: p, az: p }, faldon: { mat: 'pc1x3' }, cubierta: { mat: 'terc15', tipo: 'tablero' as const } }
    const m = mesa({ L, W, H: ed.mesa, retiro: 30, ...base, pasos: { patas: 1, faldones: 1, cubierta: 2 } })
    const piezas: PiezaInstancia[] = [...m.piezas]
    for (const x of [0, 340]) piezas.push(...mover(mesa({ L: 280, W: 280, H: ed.silla, retiro: 15, ...base, pasos: { patas: 3, faldones: 3, cubierta: 3 } }).piezas, [x, 0, W + 120]))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Redondea con lija todas las esquinas de las cubiertas (radio de 1 cm o más).'],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 3 * 16 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 3 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Base de la mesa', texto: 'Une los faldones a las patas con cola y dos tornillos por unión, primero los costados cortos y luego los largos.' },
        { titulo: 'Cubierta de la mesa', texto: 'Atornilla la cubierta desde abajo a través de los faldones, con los tornillos inclinados.' },
        { titulo: 'Pisos', texto: 'Arma los dos pisos igual que la mesa: base, faldones y asiento. Termina con pintura o barniz al agua.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const baul: ProyectoDef = {
  id: 'baul',
  nombre: 'Baúl juguetero',
  descripcion: 'Caja de terciado con fondo elevado, esquineros de refuerzo y tapa. Sirve de juguetero y de asiento.',
  plan: 'pro',
  horas: '4 a 5 horas',
  ...ficha('baul'),
  params: [
    { id: 'largo', label: 'Largo', unidad: 'cm', min: 50, max: 100, step: 1, default: 80 },
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 35, max: 55, step: 1, default: 40 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 35, max: 55, step: 1, default: 45 },
  ],
  construir(params) {
    const L = params.largo * 10
    const W = params.ancho * 10
    const H = params.alto * 10
    const M = 'terc12'
    const t = 12
    const Hb = H - t
    const [lA, lE] = seccion('pc1x2')
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const piezas: PiezaInstancia[] = []
    for (const z of [0, W - t]) piezas.push(pieza(k('frente', L, Hb), 'Frente / trasero', M, [0, 0, z], [L, Hb, z + t], 1))
    for (const x of [0, L - t]) piezas.push(pieza(k('costado', W - 2 * t, Hb), 'Costado', M, [x, 0, t], [x + t, Hb, W - t], 1))
    for (const z of [t, W - t - lE]) piezas.push(...lis('apoyoFondo', 'Apoyo del fondo', 'pc1x2', [t, 0, z], 0, L - 2 * t, 1, 2))
    piezas.push(pieza(k('fondo', L - 2 * t, W - 2 * t), 'Fondo', M, [t, lA, t], [L - t, lA + t, W - t], 2))
    for (const x of [t, L - t - lA]) for (const z of [t, W - t - lE]) piezas.push(...lis('esquinero', 'Esquinero', 'pc1x2', [x, lA + t, z], 1, Hb - lA - t, 0, 2))
    piezas.push(pieza(k('tapa', L, W), 'Tapa', M, [0, Hb, 0], [L, H, W], 3))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Usa bisagras con retenedor de tapa (o un brazo de freno) para que la tapa no caiga sobre las manos. No están en el presupuesto.', 'Haz dos agujeros de 3 cm en los costados: ventilan y sirven de manillas.'],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: 8 * 4 + 8 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Arma la caja', texto: 'Encola y atornilla los costados entre el frente y el trasero. Revisa que quede a escuadra.' },
        { titulo: 'Fondo y esquineros', texto: 'Atornilla los apoyos del fondo por dentro, abajo; apoya el fondo y pega los cuatro esquineros en las esquinas interiores.' },
        { titulo: 'Tapa', texto: 'Redondea los cantos de la tapa y únela al trasero con las bisagras con retenedor.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const camaMontessori: ProyectoDef = {
  id: 'cama_montessori',
  nombre: 'Cama casita Montessori',
  descripcion: 'Cama a ras de piso con marco de casita de pino 2×2, techo a dos aguas y tablillas para ventilar el colchón. El niño sube y baja solo.',
  plan: 'pro',
  horas: '1 día',
  ...ficha('cama_montessori'),
  params: [{ id: 'tamano', label: 'Tamaño de colchón', unidad: 'u', min: 0, max: 1, step: 1, default: 0, opciones: COLCHONES.slice(0, 2).map((c) => c.nombre) }],
  construir(params) {
    const c = COLCHONES[params.tamano]
    const Wo = c.ancho + 80
    const Lo = c.largo + 80
    const Hw = 1100
    const [p] = seccion('pc2x2')
    const [bA, bE] = seccion('pc1x4')
    const piezas: PiezaInstancia[] = []
    for (const x of [0, Wo - p]) for (const z of [0, Lo - p]) piezas.push(...lis('poste', 'Poste', 'pc2x2', [x, 0, z], 1, Hw, 0, 1))
    for (const x of [p / 2 - bE / 2, Wo - p / 2 - bE / 2]) piezas.push(...lis('baseLarga', 'Tabla lateral de la base', 'pc1x4', [x, 0, p], 2, Lo - 2 * p, 1, 1))
    for (const z of [p / 2 - bE / 2, Lo - p / 2 - bE / 2]) piezas.push(...lis('baseCorta', 'Tabla de cabecera de la base', 'pc1x4', [p, 0, z], 0, Wo - 2 * p, 1, 1))
    for (const x of [0, Wo - p]) piezas.push(...lis('larguero', 'Larguero superior', 'pc2x2', [x, Hw - p, p], 2, Lo - 2 * p, 1, 2))
    const r = Wo / 2 - p / 2
    for (const z of [p / 2, Lo - p / 2])
      for (const x of [p / 2, Wo - p / 2]) piezas.push(barra('cabio', 'Cabio', 'pc2x2', [x, Hw + p / 2, z], [Wo / 2, Hw + p / 2 + r, z], 'xy', [p, p], 3, { nota: 'cortes a 45°' }))
    piezas.push(...lis('cumbrera', 'Cumbrera', 'pc2x2', [Wo / 2 - p / 2, Hw + r - p, p], 2, Lo - 2 * p, 1, 3))
    for (const z of cada(p, Lo - p, bA, 160)) piezas.push(...lis('tablilla', 'Tablilla', 'pc1x4', [p, 0, z], 0, Wo - 2 * p, 2, 4))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: ['Lija y redondea todos los cantos. Las tablillas van sueltas sobre el piso para ventilar el colchón.'],
      herrajes: juntarHerrajes([
        { id: 't4x50', cantidad: 4 * 4 + 4 * 2 + 4 * 2 + 4 * 2 + 4 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 4 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Base y postes', texto: 'Atornilla las tablas de la base entre los postes, a ras del piso, formando el marco del colchón.' },
        { titulo: 'Largueros superiores', texto: 'Une los postes de cada lado con un larguero superior. Revisa con la escuadra.' },
        { titulo: 'Techo', texto: 'Corta los cabios a 45°, únelos de a pares formando los dos triángulos y atorníllalos sobre los postes. Une las cumbres con la cumbrera.', consejo: 'Arma un triángulo en el piso y úsalo de plantilla para el segundo.' },
        { titulo: 'Tablillas', texto: 'Reparte las tablillas dentro del marco, separadas unos 7 cm, y apoya el colchón encima.' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------------------------
export const torreAprendizaje: ProyectoDef = {
  id: 'torre_aprendizaje',
  nombre: 'Torre de aprendizaje',
  descripcion: 'Torre de terciado para que niños de 18 meses a 5 años alcancen el mesón de la cocina con barandas en los cuatro lados y un peldaño de acceso.',
  plan: 'pro',
  horas: '5 a 6 horas',
  ...ficha('torre_aprendizaje'),
  params: [{ id: 'plataforma', label: 'Alto de la plataforma', unidad: 'cm', min: 30, max: 50, step: 1, default: 40, ayuda: 'Mide desde el piso hasta la cintura del niño menos el alto del mesón.' }],
  construir(params) {
    const p = params.plataforma * 10
    const M = 'terc18'
    const t = 18
    const Wt = 450
    const D = 600
    const Ht = p + 650
    const k = (b: string, a: number, c: number) => claveDim(b, M, a, c)
    const piezas: PiezaInstancia[] = []
    for (const x of [0, Wt - t]) piezas.push(pieza(k('lateral', Ht, D), 'Lateral', M, [x, 0, 0], [x + t, Ht, D], 1))
    piezas.push(pieza(k('plataforma', Wt - 2 * t, D - 220 - t), 'Plataforma', M, [t, p - t, t], [Wt - t, p, D - 220], 2))
    piezas.push(pieza(k('peldano', Wt - 2 * t, 200), 'Peldaño', M, [t, p / 2 - t, D - 200], [Wt - t, p / 2, D], 2))
    const baranda = (y0: number, y1: number, z0: number, nombre: string) => pieza(k('baranda', Wt - 2 * t, y1 - y0), nombre, M, [t, y0, z0], [Wt - t, y1, z0 + t], 3)
    piezas.push(baranda(60, 140, 0, 'Travesaño inferior'), baranda(p + 250, p + 330, 0, 'Baranda media'), baranda(Ht - 80, Ht, 0, 'Baranda superior'), baranda(Ht - 80, Ht, D - t, 'Baranda superior'))
    return {
      piezas,
      exterior: exteriorDe(piezas),
      avisos: [
        'Producto de seguridad infantil: úsala siempre con un adulto presente y apoyada contra el mesón.',
        'Corta los laterales con forma de trapecio (más anchos abajo) si quieres más estabilidad.',
      ],
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: 6 * 4 },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 2 },
      ]),
      pasos: [
        CORTE,
        { titulo: 'Prepara los laterales', texto: 'Marca juntos los dos laterales con las alturas de la plataforma y del peldaño. Redondea las esquinas.' },
        { titulo: 'Plataforma y peldaño', texto: 'Encola y atornilla la plataforma y el peldaño entre los laterales (cuatro tornillos por lado).' },
        { titulo: 'Barandas', texto: 'Atornilla las barandas y el travesaño inferior. Prueba la torre cargándola con tu peso antes de que la use el niño.' },
      ],
    }
  },
}

export const INFANTIL: ProyectoDef[] = [casitaJuego, mesaInfantil, baul, camaMontessori, torreAprendizaje]
