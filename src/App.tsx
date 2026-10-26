import { lazy, Suspense } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Bienvenida } from './pages/Bienvenida'
import { Herramientas } from './pages/Herramientas'
import { Ingresar } from './pages/Ingresar'
import { Inicio } from './pages/Inicio'
import { Inspiracion } from './pages/Inspiracion'
import { MisProyectos } from './pages/MisProyectos'
import { Yo } from './pages/Yo'
import { usePerfil } from './store/usePerfil'

// El visor 3D (three.js) es pesado: se carga solo al abrir un proyecto.
const ProyectoPage = lazy(() => import('./pages/ProyectoPage').then((m) => ({ default: m.ProyectoPage })))
const Disenador = lazy(() => import('./pages/Disenador').then((m) => ({ default: m.Disenador })))
const Estudio = lazy(() => import('./pages/Estudio').then((m) => ({ default: m.Estudio })))

const SECCIONES: [string, string, string][] = [
  ['/', 'Inicio', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
  ['/inspiracion', 'Inspiración', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['/disena', 'Crear', 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5'],
  ['/herramientas', 'Herramientas', 'M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 0-2-2zM4 20l2-2'],
  ['/yo', 'Yo', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
]

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const cargando = (texto: string) => <main className="vacio">{texto}</main>

export function App() {
  const nueva = usePerfil((s) => !s.encuesta && !s.omitida)
  const { pathname } = useLocation()
  // Estudio fotográfico para generar las fotos del catálogo: sin cabecera.
  if (pathname.startsWith('/estudio/'))
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/estudio/:id" element={<Estudio />} />
        </Routes>
      </Suspense>
    )
  if (pathname === '/bienvenida') return <Bienvenida />
  return (
    <>
      <header className="cabecera">
        <NavLink to="/" className="marca">
          <img src="/favicon.svg" alt="" width={30} height={30} />
          <span>
            Carpintería para tu hogar
            <small>Parte de De Todito Outlet</small>
          </span>
        </NavLink>
        <nav aria-label="Secciones">
          {SECCIONES.map(([ruta, texto]) => (
            <NavLink key={ruta} to={ruta} end={ruta === '/'}>
              {ruta === '/disena' ? 'Crea tu proyecto' : texto}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/inspiracion" element={<Inspiracion />} />
          <Route path="/herramientas" element={<Herramientas />} />
          <Route path="/yo" element={<Yo />} />
          <Route path="/proyecto/:id" element={<Suspense fallback={cargando('Cargando el taller…')}><ProyectoPage /></Suspense>} />
          <Route path="/disena" element={<Suspense fallback={cargando('Abriendo el diseñador…')}><Disenador /></Suspense>} />
          <Route path="/mis-proyectos" element={<MisProyectos />} />
          <Route path="/ingresar" element={<Ingresar />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {nueva && pathname === '/' && <Navigate to="/bienvenida" replace />}
      </div>
      <nav className="barra-inferior" aria-label="Secciones">
        {SECCIONES.map(([ruta, texto, d]) => (
          <NavLink key={ruta} to={ruta} end={ruta === '/'}>
            <Icono d={d} />
            <span>{texto}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
