import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Catalogo } from './pages/Catalogo'
import { Ingresar } from './pages/Ingresar'
import { MisProyectos } from './pages/MisProyectos'
import { useApp } from './store/useApp'

// El visor 3D (three.js) es pesado: se carga solo al abrir un proyecto.
const ProyectoPage = lazy(() => import('./pages/ProyectoPage').then((m) => ({ default: m.ProyectoPage })))
const Disenador = lazy(() => import('./pages/Disenador').then((m) => ({ default: m.Disenador })))
const Estudio = lazy(() => import('./pages/Estudio').then((m) => ({ default: m.Estudio })))

export function App() {
  const sesion = useApp((s) => s.sesion)
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
  return (
    <>
      <header className="cabecera">
        <NavLink to="/" className="marca">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          Carpintería para tu hogar
        </NavLink>
        <nav>
          <NavLink to="/" end>
            Proyectos
          </NavLink>
          <NavLink to="/disena">Crea tu proyecto</NavLink>
          <NavLink to="/mis-proyectos">Mis proyectos</NavLink>
          <NavLink to="/ingresar">{sesion ? 'Mi cuenta' : 'Ingresar'}</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route
          path="/proyecto/:id"
          element={
            <Suspense fallback={<main className="vacio">Cargando el taller…</main>}>
              <ProyectoPage />
            </Suspense>
          }
        />
        <Route
          path="/disena"
          element={
            <Suspense fallback={<main className="vacio">Abriendo el diseñador…</main>}>
              <Disenador />
            </Suspense>
          }
        />
        <Route path="/mis-proyectos" element={<MisProyectos />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route path="*" element={<Catalogo />} />
      </Routes>
    </>
  )
}
