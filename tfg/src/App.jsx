// Componente raíz de la aplicación.
// Decide qué pantalla mostrar según el estado de autenticación:
//   - Sin sesión → pantalla de login/registro (AuthPage)
//   - Con sesión y admin abrió el panel → panel de administración (AdminPage)
//   - Con sesión (usuario normal) → pantalla principal con swipe (SwipePage)
import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiEye, FiEyeOff, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { AdminPage } from './pages/AdminPage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { SwipePage } from './pages/SwipePage'
import { fetchProfile } from './services/profileService'
import { sendFriendRequest } from './services/friendsService'
import './App.css'

const PWD_RULES = [
  { id: 'len',     label: 'Mínimo 6 caracteres',  test: (p) => p.length >= 6 },
  { id: 'upper',   label: 'Una letra mayúscula',   test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Un número',             test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial',  test: (p) => /[^a-zA-Z0-9]/.test(p) },
]

function PasswordRecoveryOverlay() {
  const { updatePassword, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const allValid = PWD_RULES.every(({ test }) => test(password))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allValid) { toast.error('La contraseña no cumple los requisitos'); return }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return }
    setSaving(true)
    const { error } = await updatePassword(password)
    if (error) toast.error(error.message)
    else toast.success('Contraseña actualizada. ¡Ya puedes entrar!')
    setSaving(false)
  }

  return (
    <div className="recovery-overlay">
      <div className="recovery-card">
        <h2>Nueva contraseña</h2>
        <p className="auth-mini">Elige una contraseña segura para tu cuenta.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="rec-password">
            Nueva contraseña
            <div className="password-wrap">
              <input
                id="rec-password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu nueva contraseña"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                {showPwd ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            </div>
          </label>

          {password.length > 0 && (
            <ul className="pwd-rules">
              {PWD_RULES.map(({ id, label, test }) => {
                const ok = test(password)
                return (
                  <li key={id} className={ok ? 'pwd-rule ok' : 'pwd-rule'}>
                    {ok ? <FiCheck aria-hidden="true" /> : <FiX aria-hidden="true" />}
                    {label}
                  </li>
                )
              })}
            </ul>
          )}

          <label htmlFor="rec-confirm">
            Repetir contraseña
            <div className="password-wrap">
              <input
                id="rec-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                {showConfirm ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            </div>
          </label>

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Establecer nueva contraseña'}
          </button>
          <button type="button" className="forgot-back-btn" onClick={signOut}>
            Cancelar e iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const { session, loading, isAdmin, isPasswordRecovery } = useAuth()
  const [showAdmin, setShowAdmin] = useState(false)
  // null = comprobando, true = necesita completar perfil, false = perfil completo
  const [needsSetup, setNeedsSetup] = useState(null)
  const inviteProcessed = useRef(false)

  // Captura el parámetro ?ref= al cargar la página y lo guarda para procesarlo tras el login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      sessionStorage.setItem('pendingFriendRef', ref)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (!session) { setNeedsSetup(null); return }
    fetchProfile(session.user.id)
      .then(({ data }) => {
        const complete = Boolean(data?.username && data?.city && data?.age && data?.gender)
        setNeedsSetup(!complete)
      })
      .catch(() => setNeedsSetup(false))
  }, [session])

  // Procesa la invitación pendiente en cuanto el usuario está logado y con perfil completo
  useEffect(() => {
    if (!session || needsSetup !== false || inviteProcessed.current) return
    const ref = sessionStorage.getItem('pendingFriendRef')
    if (!ref || ref === session.user.id) {
      sessionStorage.removeItem('pendingFriendRef')
      return
    }
    inviteProcessed.current = true
    sessionStorage.removeItem('pendingFriendRef')
    sendFriendRequest(session.user.id, ref).then(({ error }) => {
      if (!error) toast.success('¡Solicitud de amistad enviada automáticamente!')
    })
  }, [session, needsSetup])

  if (loading || (session && !isPasswordRecovery && needsSetup === null)) {
    return (
      <main className="app-shell loading-screen">
        <div className="loading-spinner" role="status" aria-label="Cargando" />
        <p>Iniciando FaltaUno…</p>
      </main>
    )
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      {!session && <AuthPage />}
      {session && isPasswordRecovery && <PasswordRecoveryOverlay />}
      {session && !isPasswordRecovery && needsSetup === true && (
        <ProfileSetupPage
          userId={session.user.id}
          onComplete={() => setNeedsSetup(false)}
        />
      )}
      {session && !isPasswordRecovery && needsSetup === false && isAdmin && showAdmin && (
        <AdminPage onBack={() => setShowAdmin(false)} />
      )}
      {session && !isPasswordRecovery && needsSetup === false && (!isAdmin || !showAdmin) && (
        <SwipePage onOpenAdmin={isAdmin ? () => setShowAdmin(true) : null} />
      )}
    </>
  )
}
