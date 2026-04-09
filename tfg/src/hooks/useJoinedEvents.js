import { useState } from 'react'
import { fetchJoinedEvents } from '../services/eventsService'
import { mapDbEvent } from '../utils/mapDbEvent'

export function useJoinedEvents() {
  const [joinedEvents, setJoinedEvents] = useState([])

  async function load(userId) {
    const { data } = await fetchJoinedEvents(userId)
    if (data) {
      setJoinedEvents(data.map((p) => mapDbEvent(p.events)).filter(Boolean))
    }
  }

  function add(event) {
    setJoinedEvents((prev) =>
      prev.some((e) => e.id === event.id) ? prev : [event, ...prev]
    )
  }

  return { joinedEvents, load, add }
}
