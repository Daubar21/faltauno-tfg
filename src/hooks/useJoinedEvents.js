// Hook para obtener eventos a los que se ha unido el usuario
// Hook para obtener eventos a los que se ha unido el usuario
// Hook que gestiona los eventos a los que el usuario se ha apuntado.
// Permite cargarlos desde la BD, añadir uno nuevo al hacer like,
// cancelar la participación y retirarlos de la lista tras valorarlos.
import { useState } from 'react'
import { cancelParticipation, fetchJoinedEvents } from '../services/eventsService'
import { mapDbEvent } from '../utils/mapDbEvent'
import { MADRID_LAT, MADRID_LNG } from '../utils/haversine'

export function useJoinedEvents() {
  const [joinedEvents, setJoinedEvents] = useState([])

  async function load(userId, userLat = MADRID_LAT, userLng = MADRID_LNG) {
    const { data } = await fetchJoinedEvents(userId)
    if (data) {
      setJoinedEvents(data.map((p) => mapDbEvent(p.events, userLat, userLng)).filter(Boolean))
    }
  }

  function add(event) {
    setJoinedEvents((prev) =>
      prev.some((e) => e.id === event.id) ? prev : [event, ...prev]
    )
  }

  async function cancel(userId, eventId) {
    await cancelParticipation(userId, eventId)
    setJoinedEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  function removeRated(eventId) {
    setJoinedEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  return { joinedEvents, load, add, cancel, removeRated }
}
