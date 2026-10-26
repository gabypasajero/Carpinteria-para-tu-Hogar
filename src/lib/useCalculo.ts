import { useMemo } from 'react'
import { calcularCostos } from '../core/costos'
import { agruparPiezas, letrasPorClave } from '../core/despiece'
import { optimizar } from '../core/optimizador'
import type { Params, ProyectoDef } from '../core/types'
import { useApp } from '../store/useApp'

export function calcular(proyecto: ProyectoDef, params: Params, precios: Record<string, number>) {
  const res = proyecto.construir(params)
  const cortes = agruparPiezas(res.piezas)
  const letras = letrasPorClave(cortes)
  const opt = optimizar(cortes)
  const costos = calcularCostos(cortes, res.herrajes, opt, precios)
  return { res, cortes, letras, opt, costos }
}

export type Calculo = ReturnType<typeof calcular>

export function useCalculo(proyecto: ProyectoDef, params: Params): Calculo {
  const precios = useApp((s) => s.precios)
  return useMemo(() => calcular(proyecto, params, precios), [proyecto, params, precios])
}
