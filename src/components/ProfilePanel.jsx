// Panel de perfil: nombre, ciudad, bio, edad y avatar
// Panel de perfil — permite al usuario editar sus datos personales (nombre, ciudad,
// bio, avatar, edad, sexo) y ver su historial de eventos completados agrupados por deporte.
import { useState } from 'react'
import { FiCamera, FiMapPin, FiTarget, FiUser, FiX } from 'react-icons/fi'
import { genderIcons, sportIcons } from '../constants/sports'

const GENDER_OPTIONS = ['Masculino', 'Femenino', 'No especificado']

function StarDisplay({ n }) {
  return (
    <span className="ce-stars" aria-label={`${n} estrellas`}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

export function ProfilePanel({
  profile,
  onProfileChange,
  completedEvents,
  onSave,
  onClose,
}) {
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(null)

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

  async function handleSave() {
    if (profile.displayName.trim().length < 2) return
    setSaving(true)
    await onSave(avatarFile)
    setSaving(false)
    setAvatarFile(null)
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

        <label htmlFor="profile-name">
          <FiUser aria-hidden="true" /> Nombre visible *
        </label>
        <input
          id="profile-name"
          value={profile.displayName}
          onChange={(e) => onProfileChange('displayName', e.target.value)}
          placeholder="Como quieres aparecer"
          minLength={2}
          required
        />

        <label htmlFor="profile-city">
          <FiMapPin aria-hidden="true" /> Ciudad
        </label>
        <input
          id="profile-city"
          value={profile.city}
          onChange={(e) => onProfileChange('city', e.target.value)}
          placeholder="Tu ciudad"
        />

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
              <option value="">Prefiero no decirlo</option>
              {GENDER_OPTIONS.map((g) => {
                const Icon = genderIcons[g]
                return (
                  <option key={g} value={g}>
                    {Icon ? '' : ''}{g}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        <p className="profile-gender-hint">
          La edad y el sexo se usan para mostrarte los eventos más adecuados.
        </p>

        <label htmlFor="profile-bio">
          <FiTarget aria-hidden="true" /> Bio deportiva
        </label>
        <textarea
          id="profile-bio"
          value={profile.bio}
          onChange={(e) => onProfileChange('bio', e.target.value)}
          placeholder="Qué deportes practicas y qué buscas…"
          rows={3}
        />

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
          disabled={saving || profile.displayName.trim().length < 2}
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
