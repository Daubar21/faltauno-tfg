import { useState } from 'react'
import { FiCalendar, FiMapPin, FiX } from 'react-icons/fi'
import { sportIcons } from '../constants/sports'

const DAY_FILTERS = [
  { label: 'Todos', value: null },
  { label: 'Hoy', value: 0 },
  { label: '3 días', value: 3 },
  { label: '1 semana', value: 7 },
  { label: '2 semanas', value: 14 },
  { label: '1 mes', value: 30 },
]

function daysFromToday(eventDate) {
  if (!eventDate) return Infinity
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(eventDate + 'T00:00:00')
  return Math.floor((d - today) / (1000 * 60 * 60 * 24))
}

function openGoogleMaps(event) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${event.lat},${event.lng}`)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function JoinedPanel({ joinedEvents, onCancel }) {
  const [dayFilter, setDayFilter] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  const visible =
    dayFilter === null
      ? joinedEvents
      : joinedEvents.filter((e) => {
          const diff = daysFromToday(e.eventDate)
          return dayFilter === 0 ? diff === 0 : diff >= 0 && diff <= dayFilter
        })

  async function handleCancel(eventId) {
    setCancelling(eventId)
    await onCancel(eventId)
    setCancelling(null)
  }

  return (
    <section className="floating-panel joined-panel" aria-label="Mis partidos">
      <h2>Mis partidos</h2>

      <div className="day-filter-row">
        {DAY_FILTERS.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            className={`day-chip ${dayFilter === value ? 'active' : ''}`}
            onClick={() => setDayFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="joined-empty">
          {joinedEvents.length === 0
            ? 'Todavía no te has apuntado a ningún evento.'
            : 'No hay eventos en este período.'}
        </p>
      ) : (
        <ul className="joined-events">
          {visible.map((event) => {
            const SportIcon = sportIcons[event.sport] ?? sportIcons['Futbol 7']
            const spotsLeft = event.totalPlaces - event.currentParticipants
            const isComplete = event.status === 'full'
            const isCancelled = event.status === 'cancelled'

            return (
              <li key={event.id} className="joined-event-card">
                <img src={event.image} alt={event.title} loading="lazy" />
                <div className="joined-event-content">
                  <div className="event-header">
                    <p className="joined-sport">
                      <SportIcon aria-hidden="true" /> {event.sport}
                    </p>
                    <span className={`event-status status-${event.status}`}>
                      {isCancelled ? 'Cancelado' : isComplete ? 'Completo' : 'Abierto'}
                    </span>
                  </div>
                  <h3>{event.title}</h3>
                  <p className="event-meta">
                    <FiCalendar aria-hidden="true" /> {event.date}
                  </p>
                  <p className="event-meta">
                    <FiMapPin aria-hidden="true" /> {event.address}
                  </p>

                  <div className="event-info-grid">
                    <div className="info-item">
                      <span className="info-label">Participantes</span>
                      <span className="info-value">
                        {event.currentParticipants}/{event.totalPlaces}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Plazas libres</span>
                      <span className={`info-value ${spotsLeft === 0 ? 'full' : ''}`}>
                        {spotsLeft === 0 ? 'Completo' : `${spotsLeft} libres`}
                      </span>
                    </div>
                  </div>

                  {isComplete && (
                    <div className="directions-section">
                      <p className="directions-title">📍 Cómo llegar:</p>
                      <p className="directions-text">{event.directions}</p>
                    </div>
                  )}

                  <div className="joined-map-inline">
                    <p className="directions-title">Mapa del evento</p>
                    <div className="map-frame-wrap compact-map-frame">
                      <iframe
                        title={`Mapa ${event.title}`}
                        src={`https://www.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <button
                      type="button"
                      className="mini-action"
                      onClick={() => openGoogleMaps(event)}
                    >
                      Cómo llegar
                    </button>
                    {spotsLeft > 0 && spotsLeft <= 2 && (
                      <p className="low-spots-alert">Pocas plazas</p>
                    )}
                  </div>

                  {isCancelled ? (
                    <div className="cancelled-notice">
                      <p>⚠️ Este evento ha sido cancelado</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="cancel-participation-btn"
                      onClick={() => handleCancel(event.id)}
                      disabled={cancelling === event.id}
                    >
                      <FiX aria-hidden="true" />
                      {cancelling === event.id ? 'Cancelando…' : 'Cancelar participación'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
