import { useRef, useState } from 'react'
import { FiAward, FiCalendar, FiCheck, FiMap, FiMapPin, FiShare2, FiThumbsDown } from 'react-icons/fi'
import { participantsPool, sportIcons } from '../constants/sports'
import { getEventPrice } from '../utils/mapDbEvent'

function getSportIcon(sport) {
  return sportIcons[sport] ?? sportIcons['Futbol 7']
}

function getEventParticipants(eventId) {
  const hash = [...String(eventId)].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const start = hash % participantsPool.length
  return [
    participantsPool[start],
    participantsPool[(start + 1) % participantsPool.length],
    participantsPool[(start + 2) % participantsPool.length],
  ]
}

function openGoogleMaps(event) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${event.lat},${event.lng}`)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function shareEvent(event) {
  const text = `Mira este evento: ${event.title} - ${event.date} en ${event.city}. ¡Únete a FaltaUno!`
  if (navigator.share) {
    navigator.share({ title: 'FaltaUno - Evento', text, url: window.location.href })
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }
}

export function EventCard({ event, onDecision }) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [decision, setDecision] = useState(null)
  const [showMap, setShowMap] = useState(false)

  const cardRef = useRef(null)
  const startXRef = useRef(0)

  const SportIcon = getSportIcon(event.sport)
  const price = getEventPrice(event)
  const spotsLeft = event.totalPlaces - event.currentParticipants
  const cardToneClass = dragX > 35 ? 'like-tone' : dragX < -35 ? 'pass-tone' : ''

  function triggerDecision(type) {
    setDecision(type)
    setDragX(type === 'like' ? 460 : -460)
    window.setTimeout(() => {
      setDecision(null)
      setDragX(0)
      setShowMap(false)
      onDecision(type)
    }, 240)
  }

  function onPointerDown(e) {
    if (e.target.closest('button, a, input, textarea, label')) return
    setIsDragging(true)
    startXRef.current = e.clientX
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!isDragging) return
    setDragX(e.clientX - startXRef.current)
  }

  function onPointerUp(e) {
    if (!isDragging) return
    cardRef.current?.releasePointerCapture(e.pointerId)
    setIsDragging(false)
    if (dragX > 120) { triggerDecision('like'); return }
    if (dragX < -120) { triggerDecision('pass'); return }
    setDragX(0)
  }

  return (
    <>
      <article
        className={`event-card ${cardToneClass}`}
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX / 26}deg)`,
          transition: isDragging ? 'none' : 'transform 220ms ease',
        }}
      >
        <figure className="card-media">
          <img src={event.image} alt={event.title} loading="lazy" />
          <div className="gradient" />
        </figure>

        <div className="card-content">
          {spotsLeft > 0 && spotsLeft <= 2 && (
            <p className="low-spots-alert">Pocas plazas</p>
          )}

          <p className="sport-tag">
            <SportIcon aria-hidden="true" /> {event.sport}
          </p>
          <h3>{event.title}</h3>
          <p className="meta-line"><FiCalendar aria-hidden="true" /> {event.date}</p>
          <p className="meta-line">
            <FiMapPin aria-hidden="true" /> {event.city} | {event.distanceKm} km
          </p>

          <ul>
            <li>Nivel {event.level}</li>
            <li>Edad {event.minAge}–{event.maxAge}</li>
            <li>{event.gender}</li>
            <li>
              <FiAward aria-hidden="true" />
              {price === 0 ? 'Gratis' : `EUR ${price} / persona`}
            </li>
          </ul>

          <div className="participants-row">
            <p>{event.currentParticipants}/{event.totalPlaces} jugadores apuntados</p>
            <div className="participants-avatars">
              {getEventParticipants(event.id).map((src) => (
                <img key={src} src={src} alt="Participante" loading="lazy" />
              ))}
            </div>
          </div>

          <div className="card-action-icons">
            <button
              type="button"
              className="icon-action"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setShowMap((p) => !p) }}
              title="Ver en mapa"
            >
              <FiMap aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-action"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); shareEvent(event) }}
              title="Compartir evento"
            >
              <FiShare2 aria-hidden="true" />
            </button>
          </div>

          {showMap && (
            <div className="map-container inline-map">
              <div className="map-frame-wrap">
                <iframe
                  title={`Mapa ${event.title}`}
                  src={`https://www.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="map-placeholder map-controls">
                <button
                  type="button"
                  className="mini-action"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); openGoogleMaps(event) }}
                >
                  Como llegar
                </button>
                <span className="map-event-distance">{event.address}</span>
              </div>
            </div>
          )}
        </div>

        <div className="swipe-hints">
          <span className={dragX < -50 || decision === 'pass' ? 'active pass' : ''}>Saltar</span>
          <span className={dragX > 50 || decision === 'like' ? 'active like' : ''}>Unirme</span>
        </div>
      </article>

      <div className="actions">
        <button type="button" onClick={() => triggerDecision('pass')}>
          <FiThumbsDown aria-hidden="true" /> No me encaja
        </button>
        <button type="button" className="cta" onClick={() => triggerDecision('like')}>
          <FiCheck aria-hidden="true" /> Me uno
        </button>
      </div>
    </>
  )
}
