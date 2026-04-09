import { useState } from 'react'
import { cancelParticipation, fetchJoinedEvents } from '../services/eventsService'
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

  async function cancel(userId, eventId) {
    await cancelParticipation(userId, eventId)
    setJoinedEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  return { joinedEvents, load, add, cancel }
}
