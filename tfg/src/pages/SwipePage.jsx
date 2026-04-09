import { useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import { EventCard } from '../components/EventCard'
import { FiltersPanel } from '../components/FiltersPanel'
import { JoinedPanel } from '../components/JoinedPanel'
import { ProfilePanel } from '../components/ProfilePanel'
import { Topbar } from '../components/Topbar'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../hooks/useEvents'
import { useJoinedEvents } from '../hooks/useJoinedEvents'
import { usePreferences, DEFAULT_PREFS } from '../hooks/usePreferences'
import { useProfile } from '../hooks/useProfile'
import { useSwipe } from '../hooks/useSwipe'
import { joinEvent } from '../services/eventsService'
import { recordSwipe } from '../services/swipeService'
import { getEventPrice } from '../utils/mapDbEvent'
import { useState } from 'react'

export function SwipePage() {
  const { session, signOut } = useAuth()
  const userId = session.user.id

  const eventsHook = useEvents()
  const joinedHook = useJoinedEvents()
  const profileHook = useProfile()
  const prefsHook = usePreferences()
  const swipe = useSwipe()

  const [showFilters, setShowFilters] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showJoined, setShowJoined] = useState(false)

  // Load all user data on mount
  useEffect(() => {
    eventsHook.load(userId)
    joinedHook.load(userId)
    profileHook.load(userId)
    prefsHook.load(userId)
  }, [userId])

  // Reset deck when filters change
  useEffect(() => {
    swipe.reset()
  }, [
    prefsHook.prefs.userAge,
    prefsHook.prefs.maxDistance,
    prefsHook.prefs.maxPrice,
    prefsHook.prefs.selectedSports.join(),
    prefsHook.prefs.selectedLevels.join(),
    prefsHook.prefs.selectedGenders.join(),
    prefsHook.prefs.maxDays,
  ])

  const { prefs } = prefsHook

  const filteredEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return eventsHook.events.filter((event) => {
      if (eventsHook.swipedIds.has(event.id)) return false
      if (prefs.userAge < event.minAge || prefs.userAge > event.maxAge) return false
      if (event.distanceKm > prefs.maxDistance) return false
      if (getEventPrice(event) > prefs.maxPrice) return false
      if (prefs.selectedSports.length > 0 && !prefs.selectedSports.includes(event.sport)) return false
      if (prefs.selectedLevels.length > 0 && !prefs.selectedLevels.includes(event.level)) return false
      if (prefs.selectedGenders.length > 0 && !prefs.selectedGenders.includes(event.gender)) return false
      if (event.eventDate) {
        const d = new Date(event.eventDate + 'T00:00:00')
        const diffDays = Math.floor((d - today) / (1000 * 60 * 60 * 24))
        if (prefs.maxDays === 0 ? diffDays !== 0 : diffDays > prefs.maxDays) return false
      }
      return true
    })
  }, [eventsHook.events, eventsHook.swipedIds, prefs])

  const activeEvent = filteredEvents[swipe.index]

  async function handleDecision(type) {
    if (!activeEvent) return

    eventsHook.markSwiped(activeEvent.id)

    if (type === 'like') {
      joinedHook.add(activeEvent)
    }

    // Persist to DB (fire-and-forget for responsive UX)
    recordSwipe(userId, activeEvent.id, type)
    if (type === 'like') {
      joinEvent(userId, activeEvent.id)
    }

    swipe.advance()
  }

  function handlePrefChange(field, value) {
    prefsHook.updatePref(field, value)
  }

  function handleResetPrefs() {
    prefsHook.reset()
  }

  async function handleCloseFilters() {
    setShowFilters(false)
    await prefsHook.save(userId)
  }

  function handleToggleFilters() {
    if (showFilters) {
      handleCloseFilters()
    } else {
      setShowFilters(true)
      setShowProfile(false)
      setShowJoined(false)
    }
  }

  function handleToggleProfile() {
    setShowProfile((p) => !p)
    setShowFilters(false)
    setShowJoined(false)
  }

  function handleToggleJoined() {
    setShowJoined((p) => !p)
    setShowFilters(false)
    setShowProfile(false)
  }

  async function handleSaveProfile(avatarFile) {
    await profileHook.save(userId, avatarFile)
    toast.success('Perfil guardado')
    setShowProfile(false)
  }

  async function handleCancelEvent(eventId) {
    await joinedHook.cancel(userId, eventId)
    toast.info('Has cancelado tu participación')
  }

  function handleProfileChange(field, value) {
    profileHook.setProfile((prev) => ({ ...prev, [field]: value }))
  }

  if (eventsHook.loading) {
    return (
      <main className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Cargando eventos…</p>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <Topbar
        joinedCount={joinedHook.joinedEvents.length}
        showFilters={showFilters}
        showProfile={showProfile}
        showJoined={showJoined}
        onToggleFilters={handleToggleFilters}
        onToggleProfile={handleToggleProfile}
        onToggleJoined={handleToggleJoined}
        onSignOut={signOut}
      >
        {showFilters && (
          <FiltersPanel
            prefs={prefs}
            onPrefChange={handlePrefChange}
            onReset={handleResetPrefs}
            onClose={handleCloseFilters}
          />
        )}
        {showProfile && (
          <ProfilePanel
            profile={profileHook.profile}
            onProfileChange={handleProfileChange}
            joinedEvents={joinedHook.joinedEvents}
            onSave={handleSaveProfile}
          />
        )}
        {showJoined && (
          <JoinedPanel
            joinedEvents={joinedHook.joinedEvents}
            onCancel={handleCancelEvent}
          />
        )}
      </Topbar>

      <section className="main-center" aria-live="polite">
        <section className="deck">
          {activeEvent ? (
            <EventCard event={activeEvent} onDecision={handleDecision} />
          ) : (
            <article className="event-card empty">
              <h3>No hay más eventos con estos filtros</h3>
              <p>Ajusta preferencias o reinicia para ver más propuestas.</p>
              <button type="button" className="ghost-btn" onClick={swipe.reset}>
                Volver al inicio
              </button>
            </article>
          )}
        </section>
      </section>
    </main>
  )
}
