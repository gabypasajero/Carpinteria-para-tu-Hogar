import type { PiezaInstancia, ProyectoDef } from '../core/types'
import { aMm, clavosRespaldo, juntarHerrajes, pieza, repartir } from './util'
import { ficha } from './ficha'

const M = 'mel15'
const R = 'hdf3'
const t = 15
const r = 3

export const repisa: ProyectoDef = {
  id: 'repisa',
  nombre: 'Repisa librero',
  descripcion: 'Librero simple de melamina con repisas regulables. Ideal para el primer proyecto.',
  plan: 'gratis',
  ...ficha('repisa'),
  horas: '3 a 4 horas',
  params: [
    { id: 'ancho', label: 'Ancho', unidad: 'cm', min: 40, max: 120, step: 1, default: 80 },
    { id: 'alto', label: 'Alto', unidad: 'cm', min: 50, max: 220, step: 1, default: 120 },
    { id: 'fondo', label: 'Fondo', unidad: 'cm', min: 20, max: 45, step: 1, default: 30 },
    { id: 'repisas', label: 'Repisas interiores', unidad: 'u', min: 0, max: 7, step: 1, default: 3 },
  ],
  construir(params) {
    const { ancho: W, alto: H, fondo: D, repisas: n } = aMm(params, ['ancho', 'alto', 'fondo'])
    const piezas: PiezaInstancia[] = []
    const avisos: string[] = []
    const z0 = r

    piezas.push(pieza('lateral', 'Lateral', M, [0, 0, z0], [t, H, D], 1, { canto: H }))
    piezas.push(pieza('lateral', 'Lateral', M, [W - t, 0, z0], [W, H, D], 1, { canto: H }))
    piezas.push(pieza('horizontal', 'Base / techo', M, [t, 0, z0], [W - t, t, D], 1, { canto: W - 2 * t }))
    piezas.push(pieza('horizontal', 'Base / techo', M, [t, H - t, z0], [W - t, H, D], 2, { canto: W - 2 * t }))
    piezas.push(pieza('respaldo', 'Respaldo', R, [0, 0, 0], [W, H, r], 3))

    for (const y of repartir(t, H - t, n, t)) {
      // 1 mm de holgura por lado para que la repisa entre sin forzar.
      piezas.push(pieza('repisa', 'Repisa', M, [t + 1, y, z0], [W - t - 1, y + t, D - 10], 4, { canto: W - 2 * t - 2 }))
    }

    if (W - 2 * t > 800 && n > 0) avisos.push('Repisas de más de 80 cm en 15 mm pueden curvarse con libros: considera 18 mm o bajar el ancho.')
    if (H > 1500) avisos.push('Con más de 1,5 m de alto, fija el mueble al muro con una escuadra para que no se vuelque.')

    return {
      piezas,
      exterior: [W, H, D],
      avisos,
      herrajes: juntarHerrajes([
        { id: 't4x40', cantidad: 8 },
        { id: 'soporte', cantidad: n * 4 },
        { id: 'clavo1', cantidad: clavosRespaldo(W, H, 0) },
        { id: 'cola', cantidad: 1 },
        { id: 'lija120', cantidad: 1 },
      ]),
      pasos: [
        {
          titulo: 'Corta y prepara las piezas',
          texto: 'Pide el corte en la tienda con la lista de corte (o usa el plano de optimización). Pega el tapacanto en los cantos indicados con la plancha caliente y recorta el sobrante con cuchillo.',
          consejo: 'Marca cada pieza con su letra con lápiz grafito en una cara que no se vea.',
        },
        {
          titulo: 'Une la base a los laterales',
          texto: 'Apoya los laterales de canto en el piso y pon la base entre ellos, a ras abajo. Perfora con broca de 3 mm a través del lateral y atornilla dos tornillos 4×40 por lado.',
          consejo: 'Perfora primero: la melamina se parte si atornillas directo cerca del borde.',
        },
        {
          titulo: 'Pon el techo',
          texto: 'Igual que la base, a ras arriba. Revisa con la escuadra que las esquinas queden a 90°.',
        },
        {
          titulo: 'Clava el respaldo',
          texto: 'Mide las diagonales: si son iguales, el mueble está a escuadra. Clava el respaldo cada 10 cm por todo el borde; él mantiene el mueble firme.',
        },
        {
          titulo: 'Pon las repisas',
          texto: 'Perfora en los laterales agujeros de 5 mm y 10 mm de profundidad a 5 cm del frente y de atrás, a la altura que quieras. Inserta los soportes y apoya las repisas.',
          consejo: 'Usa un retazo con los agujeros marcados como plantilla para que todas queden niveladas.',
        },
      ],
    }
  },
}
