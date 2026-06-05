import { useMemo, useState } from 'react'
import { fetchWaitlistEvents, joinWaitlist, leaveWaitlist } from '../services/eventsService'
import { mapDbEvent } from '../utils/mapDbEvent'
import { MADRID_LAT, MADRID_LNG } from '../utils/haversine'

function isEventPast(event) {
  if (!event.eventDate) return false
  const time = event.eventTime ? event.eventTime.slice(0, 5) : '00:00'
  return new Date(`${event.eventDate}T${time}:00`) < new Date()
}

export function useWaitlist() {
  const [waitlistEvents, setWaitlistEvents] = useState([])

  async function load(userId, userLat = MADRID_LAT, userLng = MADRID_LNG) {
    try {
      const { data } = await fetchWaitlistEvents(userId)
      if (data) {
        setWaitlistEvents(
          data
            .map((w) => ({ ...mapDbEvent(w.events, userLat, userLng), waitlistEntryId: w.id, waitlistAt: w.created_at }))
            .filter(Boolean)
            .filter((e) => !isEventPast(e))
        )
      }
    } catch { /* mantener estado actual */ }
  }

  async function join(userId, event) {
    const entry = await joinWaitlist(userId, event.id)
    setWaitlistEvents((prev) =>
      prev.some((e) => e.id === event.id)
        ? prev
        : [...prev, { ...event, waitlistEntryId: entry.id, waitlistAt: entry.created_at }]
    )
  }

  async function leave(userId, eventId) {
    await leaveWaitlist(userId, eventId)
    setWaitlistEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  function remove(eventId) {
    setWaitlistEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  const waitlistIds = useMemo(() => new Set(waitlistEvents.map((e) => e.id)), [waitlistEvents])

  return { waitlistEvents, waitlistIds, load, join, leave, remove }
}
