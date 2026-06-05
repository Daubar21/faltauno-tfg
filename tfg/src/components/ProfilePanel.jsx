// Panel de perfil — permite al usuario editar sus datos personales (ciudad,
// bio, avatar, edad, sexo, username) y ver su historial de eventos completados.
import { useEffect, useRef, useState } from 'react'
import { FiAtSign, FiCamera, FiCheck, FiEdit2, FiMapPin, FiUser, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { SPAIN_CITIES } from '../constants/cities'
import { genderIcons, sportIcons } from '../constants/sports'
import { isUsernameAvailable } from '../services/profileService'

const USERNAME_RE = /^[a-zA-Z0-9_\-.]+$/

const GENDER_OPTIONS = [
  { value: 'Masculino',       label: 'Masculino' },
  { value: 'Femenino',        label: 'Femenino' },
  { value: 'No especificado', label: 'Prefiero no decirlo' },
]

function StarDisplay({ n }) {
  return (
    <span className="ce-stars" aria-label={`${n} estrellas`}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

export function ProfilePanel({
  userId,
  profile,
  onProfileChange,
  completedEvents,
  onSave,
  onClose,
}) {
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(null)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'ok' | 'taken' | 'invalid'
  const originalUsernameRef = useRef(profile.username)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!isEditingUsername) { setUsernameStatus(null); return }
    const val = profile.username?.trim() ?? ''
    if (!val || val === originalUsernameRef.current) { setUsernameStatus(null); return }
    if (!USERNAME_RE.test(val)) { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const available = await isUsernameAvailable(val, userId)
      setUsernameStatus(available ? 'ok' : 'taken')
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [profile.username, isEditingUsername, userId])

  const previewUrl = avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl

  const sportCounts = completedEvents.reduce((acc, ev) => {
    if (ev.sport) acc[ev.sport] = (acc[ev.sport] ?? 0) + 1
    return acc
  }, {})

  const sportGroups = completedEvents.reduce((acc, ev) => {
    if (!acc[ev.sport]) acc[ev.sport] = []
    acc[ev.sport].push(ev)
    return acc
  }, {})

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (file) setAvatarFile(file)
  }

  function handleEditUsername() {
    originalUsernameRef.current = profile.username
    setIsEditingUsername(true)
  }

  function handleCancelUsername() {
    onProfileChange('username', originalUsernameRef.current)
    setIsEditingUsername(false)
    setUsernameStatus(null)
  }

  async function handleSave() {
    if (isEditingUsername) {
      if (usernameStatus === 'invalid') {
        toast.error('El nombre de usuario solo puede contener letras, números y _ - .')
        return
      }
      if (usernameStatus === 'taken') {
        toast.error('Ese nombre de usuario ya está en uso')
        return
      }
      if (usernameStatus === 'checking') {
        toast.error('Espera a que termine la comprobación')
        return
      }
    }

    setSaving(true)
    try {
      await onSave(avatarFile)
      setAvatarFile(null)
      setIsEditingUsername(false)
    } finally {
      setSaving(false)
    }
  }

  function toggleTab(tab) {
    setActiveTab((prev) => (prev === tab ? null : tab))
  }

  return (
    <section className="floating-panel profile-panel" aria-label="Perfil">
      <div className="panel-header">
        <h2>Tu perfil deportivo</h2>
        {onClose && (
          <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Cerrar">
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="panel-body">
        <div className="avatar-section">
          <div
            className="avatar-display"
            onClick={() => document.querySelector('#profile-avatar')?.click()}
            role="button"
            aria-label="Cambiar foto de perfil"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && document.querySelector('#profile-avatar')?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Tu foto de perfil" />
            ) : (
              <FiUser aria-hidden="true" />
            )}
            <button type="button" className="avatar-edit-btn" aria-label="Cambiar foto" tabIndex={-1}>
              <FiCamera aria-hidden="true" />
            </button>
          </div>
          <p className="avatar-helper">
            {avatarFile ? `📎 ${avatarFile.name}` : 'Toca para cambiar foto'}
          </p>
        </div>

        <label>
          <FiAtSign aria-hidden="true" /> Nombre de usuario
        </label>
        {isEditingUsername ? (
          <div className="username-edit-row">
            <div className="username-input-wrap">
              <input
                id="profile-username"
                value={profile.username}
                onChange={(e) => onProfileChange('username', e.target.value)}
                placeholder="tu_username"
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
            <button
              type="button"
              className="username-cancel-btn"
              onClick={handleCancelUsername}
              aria-label="Cancelar edición"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="username-display-row">
            <span className="username-badge">
              <FiAtSign aria-hidden="true" />
              {profile.username || <em>sin username</em>}
            </span>
            <button
              type="button"
              className="username-edit-btn"
              onClick={handleEditUsername}
              aria-label="Editar nombre de usuario"
            >
              <FiEdit2 aria-hidden="true" /> Editar
            </button>
          </div>
        )}

        <label htmlFor="profile-city">
          <FiMapPin aria-hidden="true" /> Ciudad
        </label>
        <select
          id="profile-city"
          value={profile.city}
          onChange={(e) => onProfileChange('city', e.target.value)}
        >
          <option value="">Selecciona tu ciudad…</option>
          {SPAIN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="ce-row">
          <div>
            <label htmlFor="profile-age">
              🎂 Mi edad
            </label>
            <input
              id="profile-age"
              type="number"
              min="16"
              max="100"
              value={profile.age}
              onChange={(e) => onProfileChange('age', e.target.value)}
              placeholder="—"
            />
          </div>
          <div>
            <label htmlFor="profile-gender">
              👤 Sexo
            </label>
            <select
              id="profile-gender"
              value={profile.gender}
              onChange={(e) => onProfileChange('gender', e.target.value)}
            >
              <option value="">— Selecciona —</option>
              {GENDER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="profile-gender-hint">
          La edad y el sexo se usan para mostrarte los eventos más adecuados.
        </p>

        <input
          id="profile-avatar"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          className="auth-submit"
          style={{ marginTop: '14px' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar perfil'}
        </button>

        <p className="panel-section-title" style={{ marginTop: 18 }}>Estadísticas</p>

        {(() => {
          const streak = profile.currentStreak ?? 0
          return (
            <div className="profile-level-row">
              <span className="profile-streak">
                🔥 Racha actual: {streak} {streak === 1 ? 'semana' : 'semanas'}
              </span>
            </div>
          )
        })()}

        <div className="stats-grid profile-stats">
          <button
            type="button"
            className={`stat-card stat-card-clickable ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => toggleTab('completed')}
            aria-expanded={activeTab === 'completed'}
          >
            <div className="stat-number">{completedEvents.length}</div>
            <p>Completados</p>
          </button>
          <button
            type="button"
            className={`stat-card stat-card-clickable ${activeTab === 'sports' ? 'active' : ''}`}
            onClick={() => toggleTab('sports')}
            aria-expanded={activeTab === 'sports'}
          >
            <div className="stat-number">{Object.keys(sportCounts).length}</div>
            <p>Deportes</p>
          </button>
        </div>

        {activeTab === 'completed' && (
          completedEvents.length === 0 ? (
            <p className="joined-empty" style={{ fontSize: '0.82rem' }}>
              Aún no tienes eventos completados. ¡Apúntate a un evento y valóralo cuando termine!
            </p>
          ) : (
            <ul className="completed-events-list">
              {completedEvents.map((event) => {
                const SportIcon = sportIcons[event.sport] ?? sportIcons['Futbol 7']
                return (
                  <li key={event.id} className="completed-event-item">
                    <div className="ce-item-header">
                      <span className="ce-sport">
                        <SportIcon aria-hidden="true" /> {event.sport}
                      </span>
                      <StarDisplay n={event.rating} />
                    </div>
                    <p className="ce-title">{event.title}</p>
                    <p className="ce-meta">{event.date} · {event.city}</p>
                    {event.comment && (
                      <p className="ce-comment">"{event.comment}"</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )
        )}

        {activeTab === 'sports' && (
          Object.keys(sportGroups).length === 0 ? (
            <p className="joined-empty" style={{ fontSize: '0.82rem' }}>
              Aún no has completado ningún evento.
            </p>
          ) : (
            <div className="sport-groups">
              {Object.entries(sportGroups).map(([sport, events]) => {
                const SportIcon = sportIcons[sport] ?? sportIcons['Futbol 7']
                return (
                  <div key={sport} className="sport-group">
                    <div className="sport-group-header">
                      <SportIcon aria-hidden="true" />
                      <span>{sport}</span>
                      {events.length > 1 && (
                        <span className="chip-count">×{events.length}</span>
                      )}
                    </div>
                    <ul className="completed-events-list sport-group-list">
                      {events.map((event) => (
                        <li key={event.id} className="completed-event-item">
                          <div className="ce-item-header">
                            <p className="ce-title" style={{ margin: 0 }}>{event.title}</p>
                            <StarDisplay n={event.rating} />
                          </div>
                          <p className="ce-meta">{event.date} · {event.city}</p>
                          {event.comment && (
                            <p className="ce-comment">"{event.comment}"</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </section>
  )
}
