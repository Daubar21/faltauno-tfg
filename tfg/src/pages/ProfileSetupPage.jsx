// Pantalla obligatoria de configuración inicial de perfil.
// Se muestra una sola vez tras el registro, antes de acceder a la app.
// El usuario debe elegir nombre de usuario, ciudad, edad y sexo para continuar.
import { useEffect, useRef, useState } from 'react'
import { FiAtSign, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { SPAIN_CITIES } from '../constants/cities'
import { isUsernameAvailable, updateProfile } from '../services/profileService'

const USERNAME_RE = /^[a-zA-Z0-9_\-.]+$/

const GENDER_OPTIONS = [
  { value: 'Masculino',       label: 'Masculino' },
  { value: 'Femenino',        label: 'Femenino' },
  { value: 'No especificado', label: 'Prefiero no decirlo' },
]

export function ProfileSetupPage({ userId, onComplete }) {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'ok' | 'taken' | 'invalid'
  const [city, setCity]     = useState('')
  const [age, setAge]       = useState('')
  const [gender, setGender] = useState('')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    const val = username.trim()
    if (!val) { setUsernameStatus(null); return }
    if (!USERNAME_RE.test(val)) { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const available = await isUsernameAvailable(val, userId)
      setUsernameStatus(available ? 'ok' : 'taken')
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [username, userId])

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmed = username.trim()
    if (!trimmed) { toast.error('Elige un nombre de usuario'); return }
    if (usernameStatus === 'invalid') {
      toast.error('El nombre de usuario solo puede contener letras, números y _ - .')
      return
    }
    if (usernameStatus === 'taken') {
      toast.error('Ese nombre de usuario ya está en uso')
      return
    }
    if (usernameStatus === 'checking' || usernameStatus === null) {
      toast.error('Espera a que se verifique el nombre de usuario')
      return
    }
    if (!city)   { toast.error('Selecciona tu ciudad'); return }
    if (!age || Number(age) < 16 || Number(age) > 100) {
      toast.error('Introduce una edad válida (16–100)')
      return
    }
    if (!gender) { toast.error('Selecciona tu sexo'); return }

    setSaving(true)
    try {
      await updateProfile(userId, {
        username: trimmed,
        display_name: trimmed,
        city,
        age: Number(age),
        gender,
      })
      onComplete()
    } catch {
      toast.error('No se pudo guardar el perfil. Inténtalo de nuevo.')
      setSaving(false)
    }
  }

  return (
    <main className="app-shell setup-shell">
      <div className="setup-card">
        <div className="setup-header">
          <span className="setup-logo">FaltaUno</span>
          <h1>¡Casi listo!</h1>
          <p className="setup-subtitle">
            Necesitamos un poco más de información para mostrarte los eventos más adecuados para ti.
          </p>
        </div>

        <form className="setup-form" onSubmit={handleSubmit} noValidate>

          <div className="setup-field">
            <label htmlFor="setup-username">
              <FiAtSign aria-hidden="true" /> Nombre de usuario
              <span className="setup-required" aria-hidden="true">*</span>
            </label>
            <input
              id="setup-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: daubar_23"
              minLength={3}
              maxLength={30}
              autoFocus
              className={
                usernameStatus === 'ok' ? 'input-ok'
                : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? 'input-error'
                : ''
              }
            />
            {usernameStatus === 'checking' && <span className="username-feedback checking">Comprobando…</span>}
            {usernameStatus === 'ok'       && <span className="username-feedback ok"><FiCheck aria-hidden="true" /> Disponible</span>}
            {usernameStatus === 'taken'    && <span className="username-feedback error"><FiX aria-hidden="true" /> Ya está en uso</span>}
            {usernameStatus === 'invalid'  && <span className="username-feedback error"><FiX aria-hidden="true" /> Solo letras, números y _ - .</span>}
          </div>

          <div className="setup-field">
            <label htmlFor="setup-city">
              Ciudad
              <span className="setup-required" aria-hidden="true">*</span>
            </label>
            <select
              id="setup-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={city ? '' : 'placeholder-select'}
            >
              <option value="" disabled>Selecciona tu ciudad…</option>
              {SPAIN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="setup-field">
            <label htmlFor="setup-age">
              Edad
              <span className="setup-required" aria-hidden="true">*</span>
            </label>
            <input
              id="setup-age"
              type="number"
              min="16"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Tu edad"
            />
          </div>

          <fieldset className="setup-field setup-gender-field">
            <legend>
              Sexo
              <span className="setup-required" aria-hidden="true">*</span>
            </legend>
            <div className="setup-gender-options">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <label key={value} className={`setup-gender-option ${gender === value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={gender === value}
                    onChange={() => setGender(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <p className="setup-hint">
            Tu edad y sexo se usan para filtrarte eventos compatibles. Puedes cambiar estos datos en tu perfil en cualquier momento.
          </p>

          <button
            type="submit"
            className="auth-submit setup-submit"
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Entrar a FaltaUno'}
          </button>
        </form>
      </div>
    </main>
  )
}
