// Hook que gestiona los eventos a los que el usuario se ha apuntado.
// Permite cargarlos desde la BD, añadir uno nuevo al hacer like,
// cancelar la participación y retirarlos de la lista tras valorarlos.
import { useState } from 'react'
import { cancelParticipation, fetchJoinedEvents, promoteFromWaitlist } from '../services/eventsService'
import { mapDbEvent } from '../utils/mapDbEvent'
import { MADRID_LAT, MADRID_LNG } from '../utils/haversine'

export function useJoinedEvents() {
  const [joinedEvents, setJoinedEvents] = useState([])

  async function load(userId, userLat = MADRID_LAT, userLng = MADRID_LNG) {
    try {
      const { data } = await fetchJoinedEvents(userId)
      if (data) {
        setJoinedEvents(data.map((p) => mapDbEvent(p.events, userLat, userLng)).filter(Boolean))
      }
    } catch {
      // error de red: mantener la lista actual sin bloquear la UI
    }
  }

  function add(event) {
    setJoinedEvents((prev) =>
      prev.some((e) => e.id === event.id) ? prev : [event, ...prev]
    )
  }

  async function cancel(userId, eventId) {
    await cancelParticipation(userId, eventId)
    const promoted = await promoteFromWaitlist(eventId)
    setJoinedEvents((prev) => prev.filter((e) => e.id !== eventId))
    return promoted
  }

  function removeRated(eventId) {
    setJoinedEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  return { joinedEvents, load, add, cancel, removeRated }
}
