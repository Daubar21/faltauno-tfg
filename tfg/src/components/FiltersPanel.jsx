import { FiAward, FiNavigation, FiUsers } from 'react-icons/fi'
import { FILTER_GROUPS, genderIcons, genderOptions, levelIcons, levelOptions } from '../constants/sports'

export function FiltersPanel({ prefs, onPrefChange, onReset }) {
  function toggleGroup(key) {
    const current = prefs.selectedSports
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key]
    onPrefChange('selectedSports', updated)
  }

  function toggleArray(field, value) {
    const current = prefs[field]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onPrefChange(field, updated)
  }

  return (
    <section className="floating-panel" aria-label="Preferencias">
      <h2>Preferencias</h2>

      <p className="panel-section-title">Deportes</p>
      <div className="icon-grid sports-grid">
        {FILTER_GROUPS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`icon-choice ${prefs.selectedSports.includes(key) ? 'active' : ''}`}
            onClick={() => toggleGroup(key)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <p className="panel-section-title">Nivel</p>
      <div className="icon-grid compact-grid">
        {levelOptions.map((option) => {
          const Icon = levelIcons[option]
          return (
            <button
              key={option}
              type="button"
              className={`icon-choice ${prefs.selectedLevels.includes(option) ? 'active' : ''}`}
              onClick={() => toggleArray('selectedLevels', option)}
            >
              <Icon aria-hidden="true" />
              <span>{option}</span>
            </button>
          )
        })}
      </div>

      <p className="panel-section-title">Sexo</p>
      <div className="icon-grid compact-grid">
        {genderOptions.map((option) => {
          const Icon = genderIcons[option]
          return (
            <button
              key={option}
              type="button"
              className={`icon-choice ${prefs.selectedGenders.includes(option) ? 'active' : ''}`}
              onClick={() => toggleArray('selectedGenders', option)}
            >
              <Icon aria-hidden="true" />
              <span>{option}</span>
            </button>
          )
        })}
      </div>

      <label htmlFor="age">
        <FiUsers aria-hidden="true" /> Edad {prefs.userAge}
      </label>
      <input
        id="age"
        type="range"
        min="16"
        max="60"
        value={prefs.userAge}
        onChange={(e) => onPrefChange('userAge', Number(e.target.value))}
      />

      <label htmlFor="distance">
        <FiNavigation aria-hidden="true" /> Distancia {prefs.maxDistance} km
      </label>
      <input
        id="distance"
        type="range"
        min="1"
        max="30"
        value={prefs.maxDistance}
        onChange={(e) => onPrefChange('maxDistance', Number(e.target.value))}
      />

      <label htmlFor="price">
        <FiAward aria-hidden="true" /> Precio máximo{' '}
        {prefs.maxPrice === 0 ? 'Gratis' : `${prefs.maxPrice} EUR`}
      </label>
      <input
        id="price"
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={prefs.maxPrice}
        onChange={(e) => onPrefChange('maxPrice', Number(e.target.value))}
      />

      <p className="panel-section-title">Notificaciones</p>
      <label className="inline-check" htmlFor="notif-reminders">
        <input
          id="notif-reminders"
          type="checkbox"
          checked={prefs.notifReminders}
          onChange={(e) => onPrefChange('notifReminders', e.target.checked)}
        />
        Recordatorios de partido
      </label>
      <label className="inline-check" htmlFor="notif-status">
        <input
          id="notif-status"
          type="checkbox"
          checked={prefs.notifStatusUpdates}
          onChange={(e) => onPrefChange('notifStatusUpdates', e.target.checked)}
        />
        Cambios de estado del evento
      </label>
      <label className="inline-check" htmlFor="notif-events">
        <input
          id="notif-events"
          type="checkbox"
          checked={prefs.notifNewEvents}
          onChange={(e) => onPrefChange('notifNewEvents', e.target.checked)}
        />
        Nuevos eventos cercanos
      </label>

      <button type="button" className="ghost-btn secondary" onClick={onReset}>
        Limpiar filtros
      </button>
    </section>
  )
}
