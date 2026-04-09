import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { SwipePage } from './pages/SwipePage'
import './App.css'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <main
        className="app-shell"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ color: '#888' }}>Cargando…</p>
      </main>
    )
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      {session ? <SwipePage /> : <AuthPage />}
    </>
  )
}
