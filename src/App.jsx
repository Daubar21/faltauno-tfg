// Rutas protegidas y estructura principal de la SPA
// Componente raíz de la aplicación.
// Decide qué pantalla mostrar según el estado de autenticación:
//   - Sin sesión → pantalla de login/registro (AuthPage)
//   - Con sesión y admin abrió el panel → panel de administración (AdminPage)
//   - Con sesión (usuario normal) → pantalla principal con swipe (SwipePage)
import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { AdminPage } from './pages/AdminPage'
import { SwipePage } from './pages/SwipePage'
import './App.css'

export default function App() {
  const { session, loading, isAdmin } = useAuth()
  // Controla si el admin tiene el panel de administración abierto
  const [showAdmin, setShowAdmin] = useState(false)

  // Mientras Supabase verifica la sesión mostramos un spinner
  if (loading) {
    return (
      <main className="app-shell loading-screen">
        <div className="loading-spinner" role="status" aria-label="Cargando" />
        <p>Iniciando FaltaUno…</p>
      </main>
    )
  }

  return (
    <>
      {/* Contenedor global de notificaciones toast */}
      <ToastContainer position="top-center" autoClose={3000} />
      {!session && <AuthPage />}
      {session && isAdmin && showAdmin && (
        <AdminPage onBack={() => setShowAdmin(false)} />
      )}
      {session && (!isAdmin || !showAdmin) && (
        <SwipePage onOpenAdmin={isAdmin ? () => setShowAdmin(true) : null} />
      )}
    </>
  )
}
