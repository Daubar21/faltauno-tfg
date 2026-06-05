// Hook que gestiona el historial de eventos completados y valorados por el usuario.
// Se usa para mostrar las estadísticas del perfil y calcular la racha semanal.
import { useState } from 'react'
import { fetchUserRatings } from '../services/ratingsService'
import { mapDbEvent } from '../utils/mapDbEvent'

export function useCompletedEvents() {
  const [completedEvents, setCompletedEvents] = useState([])

  async function load(userId) {
    const { data } = await fetchUserRatings(userId)
    if (!data) return
    setCompletedEvents(
      data
        .map((r) => {
          const ev = mapDbEvent(r.events)
          if (!ev) return null
          return { ...ev, rating: r.rating, comment: r.comment, ratedAt: r.created_at }
        })
        .filter(Boolean)
    )
  }

  function add(event, rating, comment) {
    const entry = { ...event, rating, comment, ratedAt: new Date().toISOString() }
    setCompletedEvents((prev) => [entry, ...prev.filter((e) => e.id !== event.id)])
  }

  return { completedEvents, load, add }
}
