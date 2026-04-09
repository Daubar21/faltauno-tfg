import { useState } from 'react'
import { FiCamera, FiMapPin, FiTarget, FiUser } from 'react-icons/fi'
import { FILTER_GROUPS, sportIcons } from '../constants/sports'

export function ProfilePanel({ profile, onProfileChange, joinedEvents, onSave }) {
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)

  // Muestra preview local si hay fichero nuevo, si no la URL guardada
  const previewUrl = avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (file) setAvatarFile(file)
  }

  function toggleFavoriteSport(sportKey) {
    const updated = profile.favoriteSports.includes(sportKey)
      ? profile.favoriteSports.filter((s) => s !== sportKey)
      : [...profile.favoriteSports, sportKey]
    onProfileChange('favoriteSports', updated)
  }

  async function handleSave() {
    setSaving(true)
    await onSave(avatarFile)
    setSaving(false)
    setAvatarFile(null)
  }

  return (
    <section className="floating-panel profile-panel" aria-label="Perfil">
      <h2>Tu perfil deportivo</h2>

      {/* Avatar */}
      <div className="avatar-section">
        <div
          className="avatar-display"
          onClick={() => document.querySelector('#profile-avatar')?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Tu foto de perfil" />
          ) : (
            <FiUser aria-hidden="true" />
          )}
          <button type="button" className="avatar-edit-btn" aria-label="Cambiar foto">
            <FiCamera aria-hidden="true" />
          </button>
        </div>
        <p className="avatar-helper">
          {avatarFile ? `📎 ${avatarFile.name}` : 'Haz clic para cambiar foto'}
        </p>
      </div>

      <label htmlFor="profile-name">
        <FiUser aria-hidden="true" /> Nombre visible
      </label>
      <input
        id="profile-name"
        value={profile.displayName}
        onChange={(e) => onProfileChange('displayName', e.target.value)}
        placeholder="Como quieres aparecer"
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

      <label htmlFor="profile-bio">
        <FiTarget aria-hidden="true" /> Bio deportiva
      </label>
      <textarea
        id="profile-bio"
        value={profile.bio}
        onChange={(e) => onProfileChange('bio', e.target.value)}
        placeholder="Cuéntanos qué deportes practicas y qué tipo de partidos buscas"
        rows={3}
      />

      <p className="panel-section-title">Deportes favoritos</p>
      <div className="icon-grid sports-grid">
        {FILTER_GROUPS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`icon-choice ${profile.favoriteSports.includes(key) ? 'active' : ''}`}
            onClick={() => toggleFavoriteSport(key)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

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
        style={{ marginTop: '1rem' }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Guardar perfil'}
      </button>

      <p className="panel-section-title">Estadísticas</p>
      <div className="stats-grid profile-stats">
        <div className="stat-card">
          <div className="stat-number">{joinedEvents.length}</div>
          <p>Eventos apuntados</p>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {joinedEvents.filter((e) => e.status === 'full').length}
          </div>
          <p>Completados</p>
        </div>
      </div>
    </section>
  )
}
