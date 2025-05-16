// Tarjeta de evento con soporte para swipe táctil/ratón.
// El usuario puede arrastrar la tarjeta a la derecha (like / me uno) o
// a la izquierda (pass / saltar), o usar los botones de la parte inferior.
import { useRef, useState } from 'react'
import { FiAward, FiCalendar, FiMap, FiMapPin, FiShare2, FiUsers, FiX, FiCheck } from 'react-icons/fi'
import { participantsPool, sportIcons } from '../constants/sports'
import { getEventPrice } from '../utils/mapDbEvent'

// Muestra el icono del deporte correspondiente (fallback a fútbol si no existe)
function SportIcon({ sport }) {
  const Icon = sportIcons[sport] ?? sportIcons['Futbol 7']
  return <Icon aria-hidden="true" />
}

const MAX_VISIBLE_AVATARS = 8

// Genera una lista de avatares de muestra para el evento usando el pool de imágenes.
// El hash del ID del evento determina qué avatares se muestran, de forma consistente.
function getEventAvatars(eventId, count) {
  if (count === 0) return []
  const hash = [...String(eventId)].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const start = hash % participantsPool.length
  const visible = Math.min(count, MAX_VISIBLE_AVATARS)
  return Array.from({ length: visible }, (_, i) =>
    participantsPool[(start + i) % participantsPool.length]
  )
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

  const price = getEventPrice(event)
  const spotsLeft = event.totalPlaces - event.currentParticipants
  const fillPct = Math.round((event.currentParticipants / event.totalPlaces) * 100)
  const cardToneClass = dragX > 35 ? 'like-tone' : dragX < -35 ? 'pass-tone' : ''

  const spotsClass =
    fillPct >= 100 ? 'full' :
    fillPct >= 75  ? 'nearly-full' :
    ''

  function triggerDecision(type) {
    setDecision(type)
    setDragX(type === 'like' ? 460 : -460)
    setTimeout(() => {
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
          <p className="sport-tag">
            <SportIcon sport={event.sport} /> {event.sport}
          </p>
          <h3>{event.title}</h3>
          <p className="meta-line"><FiCalendar aria-hidden="true" /> {event.date}</p>
          <p className="meta-line">
            <FiMapPin aria-hidden="true" /> {event.city} · {event.distanceKm} km
          </p>

          <ul>
            <li><FiUsers aria-hidden="true" /> Nivel {event.level}</li>
            <li><FiCalendar aria-hidden="true" /> {event.minAge}–{event.maxAge} años</li>
            <li><FiUsers aria-hidden="true" /> {event.gender}</li>
            <li>
              <FiAward aria-hidden="true" />
              {price === 0 ? 'Gratis' : `${price} € / pers.`}
            </li>
          </ul>

          {/* Barra de ocupación de plazas */}
          <div className="spots-progress">
            <div className="spots-label">
              <span>
                <FiUsers aria-hidden="true" style={{ display: 'inline', marginRight: 4 }} />
                {event.currentParticipants}/{event.totalPlaces} jugadores
              </span>
              <span style={{ color: spotsLeft <= 2 ? 'var(--warning)' : undefined }}>
                {spotsLeft === 0
                  ? '¡Completo!'
                  : spotsLeft === 1
                  ? '¡Última plaza!'
                  : `${spotsLeft} plazas`}
              </span>
            </div>
            <div className="spots-bar">
              <div
                className={`spots-fill ${spotsClass}`}
                style={{ width: `${Math.min(fillPct, 100)}%` }}
              />
            </div>
          </div>

          {event.currentParticipants > 0 && (() => {
            const avatars  = getEventAvatars(event.id, event.currentParticipants)
            const overflow = Math.max(0, event.currentParticipants - MAX_VISIBLE_AVATARS)
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <div className="participants-avatars">
                  {avatars.map((src, i) => (
                    <img key={i} src={src} alt="Participante" loading="lazy" />
                  ))}
                  {overflow > 0 && (
                    <span className="participants-overflow">+{overflow}</span>
                  )}
                </div>
                {spotsLeft > 0 && spotsLeft <= 2 && (
                  <p className="low-spots-alert">Pocas plazas</p>
                )}
              </div>
            )
          })()}

          <div className="card-action-icons">
            <button
              type="button"
              className={`icon-action ${showMap ? 'active' : ''}`}
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
            {showMap && (
              <span style={{ fontSize: '0.74rem', color: 'var(--text-500)', fontWeight: 600 }}>
                {event.address}
              </span>
            )}
          </div>

          {showMap && (
            <div className="inline-map">
              <div className="map-frame-wrap">
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
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); openGoogleMaps(event) }}
              >
                Cómo llegar →
              </button>
            </div>
          )}
        </div>

        <div className="swipe-hints">
          <span className={dragX < -50 || decision === 'pass' ? 'active pass' : 'pass'}>Saltar</span>
          <span className={dragX > 50 || decision === 'like' ? 'active like' : 'like'}>¡Me uno!</span>
        </div>
      </article>

      <div className="actions">
        <button type="button" onClick={() => triggerDecision('pass')}>
          <FiX aria-hidden="true" /> Paso
        </button>
        <button type="button" className="cta" onClick={() => triggerDecision('like')}>
          <FiCheck aria-hidden="true" /> ¡Me uno!
        </button>
      </div>
    </>
  )
}
