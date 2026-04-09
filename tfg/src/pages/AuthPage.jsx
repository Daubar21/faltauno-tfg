import { useState } from 'react'
import { FiCheck, FiNavigation, FiUsers } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { welcomeImages } from '../constants/sports'
import { useAuth } from '../context/AuthContext'

export function AuthPage() {
  const { signIn, signUp } = useAuth()

  const [authMode, setAuthMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const { error } =
      authMode === 'register'
        ? await signUp(email, password, name)
        : await signIn(email, password)

    if (error) {
      toast.error(error.message)
    } else if (authMode === 'register') {
      toast.success('Cuenta creada. ¡Empieza a hacer swipe!')
    }

    setSubmitting(false)
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
            <li><FiNavigation aria-hidden="true" /> Filtros por distancia, nivel, sexo y deportes</li>
            <li><FiUsers aria-hidden="true" /> Perfil deportivo para conectar mejor con el grupo</li>
          </ul>

          <div className="welcome-stats">
            <div><strong>+50</strong><span>deportes</span></div>
            <div><strong>+1.2k</strong><span>eventos activos</span></div>
            <div><strong>4.9</strong><span>valoración media</span></div>
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
              onClick={() => setAuthMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Registrarse
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <label htmlFor="auth-name">
                Nombre
                <input
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </label>
            )}

            <label htmlFor="auth-email">
              Email
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </label>

            <label htmlFor="auth-password">
              Contraseña
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </label>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting
                ? 'Procesando…'
                : authMode === 'login'
                ? 'Entrar en FaltaUno'
                : 'Crear cuenta y continuar'}
            </button>
          </form>
        </aside>
      </section>
    </main>
  )
}
