import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { supabase } from './lib/supabase'
import { useApp } from './store/useApp'
import './styles.css'

if (supabase) {
  supabase.auth.getSession().then(({ data }) => useApp.getState().setSesion(data.session))
  supabase.auth.onAuthStateChange((_evento, sesion) => useApp.getState().setSesion(sesion))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
