// Panel Mis Partidos: eventos unidos con estado y fecha
// Panel de partidos apuntados — muestra los eventos a los que el usuario se ha unido,
// con filtros por fecha, badges de estado temporal y acciones de cancelar/valorar.
import { useState } from 'react'
import { FiAlertTriangle, FiCalendar, FiMapPin, FiStar, FiX } from 'react-icons/fi'
import { sportIcons } from '../constants/sports'
import { getEventTimingStatus, useNotifications } from '../hooks/useNotifications'

const DAY_FILTERS = [
  { label: 'Todos',       value: null },
  { label: 'Hoy',         value: 0 },
  { label: 'Esta semana', value: 7 },
  { label: 'Este mes',    value: 30 },
]

const TIMING_BADGES = {
  imminent:            { label: '¡Ahora!',      cls: 'badge-imminent' },
  soon:                { label: '¡Pronto!',     cls: 'badge-soon' },
  past:                { label: 'En curso',     cls: 'badge-past' },
  warning_no_quorum:   { label: '⚠ Sin aforo',  cls: 'badge-warning' },
  ratable:             { label: '¡Terminado!',  cls: 'badge-ratable' },
  cancelled_no_quorum: { label: 'No realizado', cls: 'badge-cancelled-q' },
}

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

function StarDisplay({ n }) {
  return (
    <span className="ce-stars" aria-label={`${n} estrellas`}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

export function JoinedPanel({ joinedEvents, onCancel, onRate, onClose }) {
  const [dayFilter, setDayFilter] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  useNotifications(joinedEvents)

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
      <div className="panel-header">
        <h2>Mis partidos {joinedEvents.length > 0 && `(${joinedEvents.length})`}</h2>
        {onClose && (
          <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Cerrar">
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="panel-body">
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
              ? '¡Empieza a hacer swipe para apuntarte a eventos!'
              : 'No hay eventos en este período.'}
          </p>
        ) : (
          <ul className="joined-events">
            {visible.map((event) => {
              const SportIcon = sportIcons[event.sport] ?? sportIcons['Futbol 7']
              const spotsLeft = event.totalPlaces - event.currentParticipants
              const isCancelled = event.status === 'cancelled'
              const timing = getEventTimingStatus(event)
              const badge = TIMING_BADGES[timing]

              const isEventPast =
                timing === 'past' ||
                timing === 'ratable' ||
                timing === 'cancelled_no_quorum'

              const isNoQuorum   = timing === 'cancelled_no_quorum'
              const isWarning    = timing === 'warning_no_quorum'
              const isRatable    = timing === 'ratable'

              return (
                <li
                  key={event.id}
                  className={`joined-event-card ${isEventPast ? 'past-event' : ''} ${isNoQuorum || isCancelled ? 'event-no-quorum' : ''}`}
                >
                  <img src={event.image} alt={event.title} loading="lazy" />
                  <div className="joined-event-content">
                    <div className="event-header">
                      <p className="joined-sport">
                        <SportIcon aria-hidden="true" /> {event.sport}
                      </p>
                      <div className="event-badges">
                        {badge && (
                          <span className={`event-timing-badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        )}
                        {!isNoQuorum && (
                          <span className={`event-status status-${isCancelled ? 'cancelled' : event.status}`}>
                            {isCancelled ? 'Cancelado' : event.status === 'full' ? 'Completo' : 'Abierto'}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3>{event.title}</h3>

                    <p className="event-meta">
                      <FiCalendar aria-hidden="true" /> {event.date}
                    </p>
                    <p className="event-meta">
                      <FiMapPin aria-hidden="true" /> {event.address}
                    </p>

                    {/* Aviso 30 min antes: el evento no está lleno y puede no celebrarse */}
                    {isWarning && (
                      <div className="no-quorum-warning">
                        <FiAlertTriangle aria-hidden="true" />
                        <p>Faltan jugadores — es posible que este evento no pueda realizarse.</p>
                      </div>
                    )}

                    {/* El evento no se realizó por falta de participantes */}
                    {isNoQuorum && (
                      <div className="no-quorum-notice">
                        <p>Este evento no pudo realizarse por falta de participantes.</p>
                      </div>
                    )}

                    {/* Info del evento (no se muestra si fue cancelado por falta de quórum) */}
                    {!isNoQuorum && !isCancelled && (
                      <div className="event-info-grid">
                        <div className="info-item">
                          <span className="info-label">Jugadores</span>
                          <span className="info-value">
                            {event.currentParticipants}/{event.totalPlaces}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Plazas libres</span>
                          <span className={`info-value ${spotsLeft === 0 ? 'full' : ''}`}>
                            {spotsLeft === 0 ? 'Completo' : `${spotsLeft} libre${spotsLeft !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mapa e instrucciones para llegar (solo eventos futuros) */}
                    {!isEventPast && !isCancelled && (
                      <div className="joined-map-inline">
                        <div className="map-frame-wrap compact-map-frame">
                          <iframe
                            title={`Mapa ${event.title}`}
                            src={`https://www.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            className="mini-action"
                            onClick={() => openGoogleMaps(event)}
                          >
                            Cómo llegar →
                          </button>
                          {spotsLeft > 0 && spotsLeft <= 2 && (
                            <p className="low-spots-alert">Pocas plazas</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Botón de valoración: aparece 2h después de la hora de inicio si el evento estaba lleno */}
                    {isRatable && (
                      <div className="ratable-section">
                        <p className="ratable-prompt">¡El evento ha terminado! ¿Cómo fue?</p>
                        <button
                          type="button"
                          className="rate-event-btn"
                          onClick={() => onRate?.(event)}
                        >
                          <FiStar aria-hidden="true" /> Valorar evento
                        </button>
                      </div>
                    )}

                    {/* El evento fue cancelado por el organizador */}
                    {isCancelled && (
                      <div className="cancelled-notice">
                        <p>⚠️ Este evento ha sido cancelado</p>
                      </div>
                    )}

                    {/* Cancelar participación (solo eventos futuros o inminentes) */}
                    {!isEventPast && !isCancelled && (
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

                    {/* Retirar de la lista eventos cancelados o sin quórum */}
                    {(isNoQuorum || isCancelled) && (
                      <button
                        type="button"
                        className="cancel-participation-btn"
                        onClick={() => handleCancel(event.id)}
                        disabled={cancelling === event.id}
                      >
                        <FiX aria-hidden="true" />
                        {cancelling === event.id ? 'Retirando…' : 'Retirar de mi lista'}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
