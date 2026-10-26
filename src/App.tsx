import { lazy, Suspense } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Catalogo } from './pages/Catalogo'
import { Ingresar } from './pages/Ingresar'
import { MisProyectos } from './pages/MisProyectos'
import { useApp } from './store/useApp'

// El visor 3D (three.js) es pesado: se carga solo al abrir un proyecto.
const ProyectoPage = lazy(() => import('./pages/ProyectoPage').then((m) => ({ default: m.ProyectoPage })))

export function App() {
  const sesion = useApp((s) => s.sesion)
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
        <Route path="/mis-proyectos" element={<MisProyectos />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route path="*" element={<Catalogo />} />
      </Routes>
    </>
  )
}
