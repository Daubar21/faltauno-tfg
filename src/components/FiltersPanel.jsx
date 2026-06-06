// Panel de filtros — permite al usuario ajustar deporte, nivel, fechas,
// distancia y precio.
// Los cambios se propagan al padre y se guardan en Supabase al cerrar el panel.
import { FiAward, FiCalendar, FiNavigation, FiX } from 'react-icons/fi'
import { FILTER_GROUPS, levelIcons, levelOptions } from '../constants/sports'

const DAY_OPTIONS = [
  { label: 'Hoy',         value: 0,  sub: 'Solo hoy' },
  { label: 'Esta semana', value: 7,  sub: 'Próximos 7 días' },
  { label: 'Este mes',    value: 30, sub: 'Próximos 30 días' },
]

function getEndLabel(days) {
  if (days === 0) {
    return new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  const end = new Date()
  end.setDate(end.getDate() + days)
  return `hasta ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
}

export function FiltersPanel({ prefs, onPrefChange, onReset, onApply, onClose }) {
  function toggleGroup(key) {
    const current = prefs.selectedSports
    const updated = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key]
    onPrefChange('selectedSports', updated)
  }

  function toggleLevel(value) {
    const current = prefs.selectedLevels
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onPrefChange('selectedLevels', updated)
  }

  const distanceLabel =
    prefs.maxDistance >= 100 ? 'Sin límite' : `${prefs.maxDistance} km`

  return (
    <section className="floating-panel" aria-label="Preferencias">
      <div className="panel-header">
        <h2>Preferencias</h2>
        {onClose && (
          <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Cerrar">
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="panel-body">
        <p className="panel-section-title">Deportes</p>
        <div className="icon-grid sports-grid">
          {FILTER_GROUPS.map(({ key, label, icon }) => {
            const GroupIcon = icon
            return (
              <button
                key={key}
                type="button"
                className={`icon-choice ${prefs.selectedSports.includes(key) ? 'active' : ''}`}
                onClick={() => toggleGroup(key)}
              >
                <GroupIcon aria-hidden="true" />
                <span>{label}</span>
              </button>
            )
          })}
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
                onClick={() => toggleLevel(option)}
              >
                <Icon aria-hidden="true" />
                <span>{option}</span>
              </button>
            )
          })}
        </div>

        <p className="panel-section-title">
          <FiCalendar aria-hidden="true" /> ¿Cuándo quieres jugar?
        </p>
        <div className="day-strip">
          {DAY_OPTIONS.map(({ label, value, sub }) => {
            const isActive = prefs.maxDays === value
            return (
              <button
                key={value}
                type="button"
                className={`day-pill ${isActive ? 'active' : ''}`}
                onClick={() => onPrefChange('maxDays', value)}
              >
                <span className="day-pill-label">{label}</span>
                <span className="day-pill-sub">{isActive ? getEndLabel(value) : sub}</span>
              </button>
            )
          })}
        </div>

        <label htmlFor="distance">
          <FiNavigation aria-hidden="true" /> Distancia máxima
          <span className="slider-value">{distanceLabel}</span>
        </label>
        <input
          id="distance"
          type="range"
          min="1"
          max="100"
          step="1"
          value={prefs.maxDistance}
          onChange={(e) => onPrefChange('maxDistance', Number(e.target.value))}
        />
        <label htmlFor="price">
          <FiAward aria-hidden="true" /> Precio máximo
          <span className="slider-value">
            {prefs.maxPrice === 0 ? 'Gratis' : `${prefs.maxPrice} €`}
          </span>
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

        <div className="filter-actions">
          <button type="button" className="ghost-btn secondary" onClick={onReset}>
            Limpiar filtros
          </button>
          <button type="button" className="ghost-btn primary" onClick={onApply ?? onClose}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </section>
  )
}
