import { useState, type FormEvent } from 'react'
import { cm, formatoCLP } from '../core/costos'
import { precioFabricacion } from '../core/tiendas'
import type { Params, ProyectoDef } from '../core/types'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/useApp'

const CUALQUIERA = { id: 'cualquiera', nombre: 'La que responda primero', whatsapp: null, factor: 0 }

interface Props {
  proyecto: ProyectoDef
  params: Params
  exterior: [number, number, number]
  costoMateriales: number
  onCerrar: () => void
}

export function Cotizacion({ proyecto, params, exterior, costoMateriales, onCerrar }: Props) {
  const sesion = useApp((s) => s.sesion)
  const tiendas = useApp((s) => s.tiendas)
  const opciones = [...tiendas, CUALQUIERA]
  const [tienda, setTienda] = useState('cualquiera')
  const [form, setForm] = useState({ nombre: '', telefono: '', email: sesion?.user.email ?? '', comuna: '', comentario: '' })
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado' | 'error'>('editando')
  const [error, setError] = useState('')

  const medidas = `${cm(exterior[0])} × ${cm(exterior[1])} × ${cm(exterior[2])} cm (ancho × alto × fondo)`
  const resumen = [
    `Hola, quiero cotizar la fabricación de: ${proyecto.nombre}`,
    `Medidas: ${medidas}`,
    ...proyecto.params.filter((d) => d.unidad === 'u').map((d) => `${d.label}: ${params[d.id]}`),
    `Nombre: ${form.nombre}`,
    `Comuna: ${form.comuna}`,
    form.comentario && `Comentario: ${form.comentario}`,
    `Enlace al diseño: ${window.location.href}`,
  ]
    .filter(Boolean)
    .join('\n')

  const whatsapp = opciones.find((t) => t.id === tienda)?.whatsapp
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!supabase) {
      // Sin Supabase el pedido viaja solo por WhatsApp o copiando el resumen.
      setEstado('enviado')
      return
    }
    setEstado('enviando')
    const { error } = await supabase.rpc('carpinteria_enviar_solicitud', {
      p_tienda: tienda,
      p_proyecto: proyecto.id,
      p_params: params,
      p_costo_materiales: costoMateriales,
      p_nombre: form.nombre,
      p_telefono: form.telefono,
      p_email: form.email,
      p_comuna: form.comuna,
      p_comentario: form.comentario,
      p_enlace: window.location.href,
    })
    if (error) {
      setError(error.message)
      setEstado('error')
    } else setEstado('enviado')
  }

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="cotizar-titulo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
        <h2 id="cotizar-titulo">¿No quieres hacerlo tú?</h2>
        <p>
          Te lo fabricamos. Envía este diseño ({medidas}) y una tienda te contactará con el precio final. Fabricado cuesta desde{' '}
          <strong>{formatoCLP(precioFabricacion(costoMateriales, tiendas))}</strong> aprox. (solo materiales: {formatoCLP(costoMateriales)}).
        </p>

        {estado === 'enviado' ? (
          <div className="exito">
            <p>{supabase ? '¡Listo! Recibimos tu solicitud y te contactaremos pronto.' : 'Tu resumen está listo para enviar.'}</p>
            {whatsapp && (
              <a className="boton" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(resumen)}`} target="_blank" rel="noreferrer">
                Enviar también por WhatsApp
              </a>
            )}
            {!supabase && !whatsapp && (
              <button className="boton" onClick={() => navigator.clipboard.writeText(resumen)}>
                Copiar resumen
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={enviar} className="formulario">
            <fieldset className="tiendas">
              <legend>¿Quién lo fabrica?</legend>
              {opciones.map((t) => (
                <label key={t.id} className={tienda === t.id ? 'activa' : ''}>
                  <input type="radio" name="tienda" checked={tienda === t.id} onChange={() => setTienda(t.id)} />
                  {t.nombre}
                </label>
              ))}
            </fieldset>
            <label>
              Nombre
              <input required value={form.nombre} onChange={set('nombre')} autoComplete="name" />
            </label>
            <label>
              Teléfono
              <input required type="tel" value={form.telefono} onChange={set('telefono')} autoComplete="tel" placeholder="+56 9 1234 5678" />
            </label>
            <label>
              Correo (opcional)
              <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            </label>
            <label>
              Comuna
              <input required value={form.comuna} onChange={set('comuna')} />
            </label>
            <label>
              Comentario (color, plazo, instalación…)
              <textarea rows={3} value={form.comentario} onChange={set('comentario')} />
            </label>
            {estado === 'error' && <p className="aviso">No se pudo enviar: {error}</p>}
            <button className="boton" type="submit" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Enviando…' : 'Pedir cotización'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
