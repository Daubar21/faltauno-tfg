import { useState } from 'react'
import { toast } from 'react-toastify'
import { fetchEvents } from '../services/eventsService'
import { fetchSwipeHistory } from '../services/swipeService'
import { mapDbEvent } from '../utils/mapDbEvent'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [swipedIds, setSwipedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  async function load(userId) {
    setLoading(true)
    const [{ data, error }, { data: history }] = await Promise.all([
      fetchEvents(),
      fetchSwipeHistory(userId),
    ])

    if (error) {
      toast.error('Error al cargar eventos')
    } else {
      setSwipedIds(new Set(history?.map((h) => h.event_id) ?? []))
      setEvents(data.map((e) => mapDbEvent(e)))
    }
    setLoading(false)
  }

  function markSwiped(eventId) {
    setSwipedIds((prev) => new Set([...prev, eventId]))
  }

  return { events, swipedIds, loading, load, markSwiped }
}
