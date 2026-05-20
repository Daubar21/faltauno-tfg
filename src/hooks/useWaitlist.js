import { useMemo, useState } from 'react'
import { fetchWaitlistEvents, joinWaitlist, leaveWaitlist } from '../services/eventsService'
import { mapDbEvent } from '../utils/mapDbEvent'
import { MADRID_LAT, MADRID_LNG } from '../utils/haversine'

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
