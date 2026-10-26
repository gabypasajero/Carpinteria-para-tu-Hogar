import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/useApp'

export function Ingresar() {
  const sesion = useApp((s) => s.sesion)
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'inicio' | 'enviando' | 'enviado'>('inicio')
  const [error, setError] = useState('')

  if (!supabase) {
    return (
      <main className="pagina">
        <h1>Ingresar</h1>
        <p>El inicio de sesión aún no está activo. Tus diseños se guardan en este navegador.</p>
      </main>
    )
  }

  if (sesion) {
    return (
      <main className="pagina">
        <h1>Tu cuenta</h1>
        <p>Ingresaste como {sesion.user.email}.</p>
        <button className="boton secundario" onClick={() => supabase!.auth.signOut()}>
          Cerrar sesión
        </button>
      </main>
    )
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEstado('enviando')
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    if (error) {
      setError(error.message)
      setEstado('inicio')
    } else setEstado('enviado')
  }

  return (
    <main className="pagina">
      <h1>Ingresar</h1>
      {estado === 'enviado' ? (
        <p>Te enviamos un enlace a {email}. Ábrelo desde este equipo para ingresar.</p>
      ) : (
        <form onSubmit={enviar} className="formulario angosto">
          <label>
            Correo
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          {error && <p className="aviso">{error}</p>}
          <button className="boton" disabled={estado === 'enviando'}>
            Enviarme un enlace
          </button>
          <p className="sub">Sin contraseñas: te llega un enlace al correo.</p>
        </form>
      )}
    </main>
  )
}
