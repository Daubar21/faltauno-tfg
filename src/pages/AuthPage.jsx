// Pantalla de bienvenida con formulario de inicio de sesión y registro.
// Muestra una columna de marketing (izquierda) y el formulario de acceso (derecha).
import { useState } from 'react'
import { FiCheck, FiEye, FiEyeOff, FiNavigation, FiUsers, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { welcomeImages } from '../constants/sports'
import { useAuth } from '../context/AuthContext'
import { getEmailByUsername } from '../services/profileService'

const PWD_RULES = [
  { id: 'len',     label: 'Mínimo 6 caracteres',      test: (p) => p.length >= 6 },
  { id: 'upper',   label: 'Una letra mayúscula',       test: (p) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Un número',                 test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial',      test: (p) => /[^a-zA-Z0-9]/.test(p) },
]

function PasswordRules({ password }) {
  return (
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
  )
}

export function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()

  const [authMode, setAuthMode] = useState('login')
  const [forgotMode, setForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function switchMode(mode) {
    setAuthMode(mode)
    setForgotMode(false)
    setResetSent(false)
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    const { error } = await resetPassword(resetEmail)
    if (error) {
      toast.error(error.message)
    } else {
      setResetSent(true)
    }
  }

  function passwordValid(p) {
    return PWD_RULES.every(({ test }) => test(p))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (authMode === 'register') {
      if (!passwordValid(password)) {
        toast.error('La contraseña no cumple los requisitos mínimos')
        return
      }
      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return
      }
    }

    setSubmitting(true)

    try {
      let loginEmail = email
      if (authMode === 'login' && !email.includes('@')) {
        loginEmail = await getEmailByUsername(email)
        if (!loginEmail) {
          toast.error('No existe ningún usuario con ese nombre de usuario')
          return
        }
      }

      const { error } =
        authMode === 'register'
          ? await signUp(email, password)
          : await signIn(loginEmail, password)

      if (error) {
        toast.error(error.message)
      } else if (authMode === 'register') {
        setRegisteredEmail(email)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (registeredEmail) {
    return (
      <main className="app-shell setup-shell">
        <div className="setup-card email-confirm-card">
          <div className="setup-header">
            <span className="setup-logo">FaltaUno</span>
            <div className="email-confirm-icon" aria-hidden="true">📬</div>
            <h1>¡Revisa tu correo!</h1>
            <p className="setup-subtitle">
              Hemos enviado un enlace de confirmación a<br />
              <strong>{registeredEmail}</strong>
            </p>
            <p className="setup-subtitle" style={{ marginTop: 8 }}>
              Confirma tu email para acceder a FaltaUno. Si no lo ves, revisa la carpeta de spam.
            </p>
          </div>
          <button
            type="button"
            className="auth-submit setup-submit"
            onClick={() => setRegisteredEmail(null)}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell welcome-shell">
      <section className="welcome-layout">
        <article className="welcome-story">
          <p className="eyebrow">FaltaUno</p>
          <h1>La forma más rápida de encontrar deporte cerca de ti</h1>
          <p className="auth-copy">
            Descubre partidos, ligas y quedadas deportivas con experiencia de swipe.
            Ajusta nivel, distancia y preferencias para unirte a planes que encajen contigo.
          </p>

          <ul className="auth-points">
            <li><FiCheck aria-hidden="true" /> Match instantáneo con eventos cercanos</li>
            <li><FiNavigation aria-hidden="true" /> Filtra por distancia, nivel, sexo y deporte</li>
            <li><FiUsers aria-hidden="true" /> Perfil deportivo para conectar con el grupo</li>
          </ul>

          <div className="welcome-stats">
            <div><strong>11</strong><span>deportes</span></div>
            <div><strong>+200</strong><span>eventos activos</span></div>
            <div><strong>+500</strong><span>usuarios activos</span></div>
          </div>

          <div className="welcome-gallery" aria-hidden="true">
            {welcomeImages.map((src, idx) => (
              <img key={src} src={src} alt="" className={`gallery-photo p${idx + 1}`} />
            ))}
          </div>
        </article>

        <aside className="auth-card">
          <h2>Empieza ahora</h2>
          <p className="auth-mini">Crea tu cuenta o entra para empezar a hacer swipe.</p>

          <div className="auth-mode-switch" role="tablist" aria-label="Acceso">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Registrarse
            </button>
          </div>

          {forgotMode && (
            <div className="auth-form">
              {resetSent ? (
                <div className="reset-sent">
                  <FiCheck className="reset-sent-icon" aria-hidden="true" />
                  <p>Te hemos enviado un correo a <strong>{resetEmail}</strong>. Sigue las instrucciones para restablecer tu contraseña.</p>
                  <button
                    type="button"
                    className="auth-submit"
                    onClick={() => { setForgotMode(false); setResetSent(false) }}
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <p className="reset-hint">Introduce tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
                  <label htmlFor="reset-email">
                    Email
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </label>
                  <button type="submit" className="auth-submit" style={{ marginTop: 6 }}>
                    Enviar correo de recuperación
                  </button>
                  <button
                    type="button"
                    className="forgot-back-btn"
                    onClick={() => setForgotMode(false)}
                  >
                    Volver al inicio de sesión
                  </button>
                </form>
              )}
            </div>
          )}

          {!forgotMode && <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="auth-email">
              {authMode === 'login' ? 'Correo o nombre de usuario' : 'Email'}
              <input
                id="auth-email"
                type={authMode === 'login' ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={authMode === 'login' ? 'Correo o usuario' : 'correo@ejemplo.com'}
                required
              />
            </label>

            <label htmlFor="auth-password">
              Contraseña
              <div className="password-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
              </div>
            </label>

            {authMode === 'register' && password.length > 0 && (
              <PasswordRules password={password} />
            )}

            {authMode === 'register' && (
              <label htmlFor="auth-confirm-password">
                Repetir contraseña
                <div className="password-wrap">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                </div>
              </label>
            )}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting
                ? 'Procesando…'
                : authMode === 'login'
                ? 'Entrar en FaltaUno'
                : 'Crear cuenta y continuar'}
            </button>

            {authMode === 'login' && (
              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => { setForgotMode(true); setResetEmail(email) }}
              >
                ¿Has olvidado tu contraseña?
              </button>
            )}
          </form>}
        </aside>
      </section>
    </main>
  )
}
