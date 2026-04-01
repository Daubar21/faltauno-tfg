// Hook para cargar y filtrar eventos desde Supabase
// Hook para cargar y filtrar eventos desde Supabase
// Hook que carga y gestiona la lista de eventos disponibles para hacer swipe.
// También lleva el registro de los eventos que el usuario ya ha visto (swipedIds)
// para no volver a mostrarlos, y permite actualizar el contador de participantes.
import { useState } from 'react'
import { toast } from 'react-toastify'
import { fetchEvents } from '../services/eventsService'
import { fetchSwipeHistory } from '../services/swipeService'
import { mapDbEvent } from '../utils/mapDbEvent'
import { MADRID_LAT, MADRID_LNG } from '../utils/haversine'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [swipedIds, setSwipedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  async function load(userId, userLat = MADRID_LAT, userLng = MADRID_LNG) {
    setLoading(true)
    const [{ data, error }, { data: history }] = await Promise.all([
      fetchEvents(),
      fetchSwipeHistory(userId),
    ])

    if (error) {
      toast.error('Error al cargar eventos')
    } else {
      setSwipedIds(new Set(history?.map((h) => h.event_id) ?? []))
      setEvents(data.map((e) => mapDbEvent(e, userLat, userLng)))
    }
    setLoading(false)
  }

  function markSwiped(eventId) {
    setSwipedIds((prev) => new Set([...prev, eventId]))
  }

  function updateEventCount(eventId, delta) {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, currentParticipants: Math.max(0, e.currentParticipants + delta) }
          : e
      )
    )
  }

  function addEvent(event) {
    setEvents((prev) =>
      prev.some((e) => e.id === event.id) ? prev : [event, ...prev]
    )
  }

  return { events, swipedIds, loading, load, markSwiped, updateEventCount, addEvent }
}
