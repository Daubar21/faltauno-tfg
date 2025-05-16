// Modal de valoracion de eventos completados
// Modal de valoración — aparece cuando un evento ha terminado y el usuario
// puede puntuar del 1 al 5 y dejar un comentario opcional.
// Tras guardar la valoración ofrece compartir el resultado por WhatsApp.
import { useState } from 'react'
import { FiMessageSquare, FiStar, FiX } from 'react-icons/fi'
import { submitRating } from '../services/ratingsService'

export function RatingModal({ event, userId, onRated, onClose }) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit() {
    if (stars === 0 || submitting) return
    setSubmitting(true)
    setError(false)
    try {
      await submitRating(userId, event.id, stars, comment)
      onRated?.(event, stars, comment)
      setSubmitted(true)
    } catch {
      setError(true)
    }
    setSubmitting(false)
  }

  function handleWhatsApp() {
    const label = stars === 1 ? '1 estrella' : `${stars} estrellas`
    const msg = encodeURIComponent(
      `¡Acabo de jugar ${event.sport} con FaltaUno! Le doy ${label} al evento "${event.title}". ¿Te apuntas al próximo? 🏆`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="rating-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Valorar evento"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rating-modal">
        <button
          type="button"
          className="panel-close-btn rating-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FiX aria-hidden="true" />
        </button>

        {submitted ? (
          <div className="rating-done">
            <p className="rating-done-emoji">🏆</p>
            <h3>¡Gracias por valorar!</h3>
            <p className="rating-event-name">{event.title}</p>
            <p className="rating-done-sub">El evento ha sido guardado en tu perfil.</p>
            <button type="button" className="rating-wa-btn" onClick={handleWhatsApp}>
              <span className="wa-icon">💬</span> Compartir en WhatsApp
            </button>
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h3 className="rating-title">¿Cómo fue el evento?</h3>
            <p className="rating-event-name">{event.title}</p>
            <p className="rating-sport">{event.sport} · {event.date}</p>

            <div
              className="stars-row"
              role="group"
              aria-label="Valoración de 1 a 5 estrellas"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`star-btn ${n <= (hovered || stars) ? 'active' : ''}`}
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
                >
                  <FiStar aria-hidden="true" />
                </button>
              ))}
            </div>

            <label htmlFor="rating-comment" className="rating-comment-label">
              <FiMessageSquare aria-hidden="true" /> Comentario (opcional)
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Qué mejorarías? ¿Qué fue lo mejor?"
              rows={2}
            />

            {error && (
              <p className="rating-error">No se pudo guardar la valoración. Inténtalo de nuevo.</p>
            )}

            <button
              type="button"
              className="auth-submit"
              onClick={handleSubmit}
              disabled={stars === 0 || submitting}
            >
              {submitting ? 'Guardando…' : 'Enviar valoración'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
