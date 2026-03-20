// Pagina principal de swipe de eventos deportivos
// Página principal de swipe de eventos deportivos
// Pantalla principal de la aplicación — orquesta todos los hooks y paneles.
// Carga los eventos, gestiona el estado de los paneles (filtros, perfil, mapa, etc.)
// y aplica los filtros del usuario sobre la lista de eventos disponibles.
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { CreateEventPanel } from '../components/CreateEventPanel'
import { EventCard } from '../components/EventCard'
import { FiltersPanel } from '../components/FiltersPanel'
import { FriendsPanel } from '../components/FriendsPanel'
import { JoinedPanel } from '../components/JoinedPanel'
import { MapView } from '../components/MapView'
import { ProfilePanel } from '../components/ProfilePanel'
import { RatingModal } from '../components/RatingModal'
import { Topbar } from '../components/Topbar'
import { useAuth } from '../context/AuthContext'
import { useCompletedEvents } from '../hooks/useCompletedEvents'
import { useEvents } from '../hooks/useEvents'
import { useFriends } from '../hooks/useFriends'
import { useJoinedEvents } from '../hooks/useJoinedEvents'
import { useLocation } from '../hooks/useLocation'
import { usePreferences } from '../hooks/usePreferences'
import { useProfile } from '../hooks/useProfile'
import { useSwipe } from '../hooks/useSwipe'
import { requestNotifPermission } from '../hooks/useNotifications'
import { fetchPendingEvents } from '../services/adminService'
import { cancelParticipation, joinEvent } from '../services/eventsService'
import { updateUserStats } from '../services/profileService'
import { recordSwipe } from '../services/swipeService'
import { computeStreak } from '../utils/computeStreak'
import { getEventPrice } from '../utils/mapDbEvent'
import { FILTER_GROUPS } from '../constants/sports'

export function SwipePage({ onOpenAdmin }) {
  const { session, signOut, isAdmin } = useAuth()
  const userId = session.user.id

  const eventsHook = useEvents()
  const joinedHook = useJoinedEvents()
  const completedHook = useCompletedEvents()
  const profileHook = useProfile()
  const prefsHook = usePreferences()
  const friendsHook = useFriends(userId)
  const swipe = useSwipe()
  const { coords: userCoords, status: locationStatus } = useLocation()

  const [showFilters, setShowFilters] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showJoined, setShowJoined] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [ratingEvent, setRatingEvent] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Carga inicial: se espera a tener la ubicación del usuario antes de buscar eventos.
  // Se usa eslint-disable porque el array de dependencias es intencionalmente reducido:
  // solo se recarga si cambia el usuario o el estado del GPS (no en cada render).
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (locationStatus === 'requesting') return
    eventsHook.load(userId, userCoords.lat, userCoords.lng)
    joinedHook.load(userId, userCoords.lat, userCoords.lng)
    completedHook.load(userId)
    profileHook.load(userId)
    prefsHook.load(userId)
    friendsHook.load()
    if (onOpenAdmin) {
      fetchPendingEvents().then(({ data }) => setPendingCount(data?.length ?? 0))
    }
  }, [userId, locationStatus])
  /* eslint-enable react-hooks/exhaustive-deps */

  const { prefs } = prefsHook
  const sportsKey = prefs.selectedSports.join(',')
  const levelsKey = prefs.selectedLevels.join(',')
  const userAge = Number(profileHook.profile.age) || 0
  const userGender = profileHook.profile.gender || ''

  // Cuando el usuario cambia sus filtros, se reinicia el mazo para que vea
  // todas las tarjetas desde el principio con los nuevos criterios aplicados.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    swipe.reset()
  }, [
    userAge,
    userGender,
    prefs.maxDistance,
    prefs.maxPrice,
    sportsKey,
    levelsKey,
    prefs.maxDays,
  ])
  /* eslint-enable react-hooks/exhaustive-deps */

  // Expande los grupos de deportes seleccionados (ej. 'Futbol') a los nombres concretos
  // de la BD ('Futbol 7', 'Futbol Sala', 'Futbol 11') para comparar con event.sport
  const selectedSportNames = useMemo(() => {
    if (prefs.selectedSports.length === 0) return null
    const names = new Set()
    prefs.selectedSports.forEach((key) => {
      const group = FILTER_GROUPS.find((g) => g.key === key)
      if (group) group.sports.forEach((name) => names.add(name))
    })
    return names
  }, [sportsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Aplica todos los filtros activos sobre la lista de eventos.
  // Se excluyen los ya vistos (swipedIds) y los que no cumplen los criterios del usuario.
  const filteredEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return eventsHook.events.filter((event) => {
      if (eventsHook.swipedIds.has(event.id)) return false
      if (userAge > 0 && (userAge < event.minAge || userAge > event.maxAge)) return false
      if (prefs.maxDistance < 100 && event.distanceKm > prefs.maxDistance) return false
      if (getEventPrice(event) > prefs.maxPrice) return false
      if (selectedSportNames && !selectedSportNames.has(event.sport)) return false
      if (prefs.selectedLevels.length > 0 && !prefs.selectedLevels.includes(event.level)) return false
      if (userGender && userGender !== 'No especificado' && event.gender !== 'Mixto' && event.gender !== userGender) return false
      if (event.eventDate) {
        const d = new Date(event.eventDate + 'T00:00:00')
        const diffDays = Math.floor((d - today) / (1000 * 60 * 60 * 24))
        if (prefs.maxDays === 0 ? diffDays !== 0 : diffDays > prefs.maxDays) return false
      }
      return true
    })
  }, [eventsHook.events, eventsHook.swipedIds, prefs, selectedSportNames, userAge, userGender])

  const activeEvent = filteredEvents[swipe.index]

  async function handleDecision(type) {
    if (!activeEvent) return
    eventsHook.markSwiped(activeEvent.id)
    if (type === 'like') {
      eventsHook.updateEventCount(activeEvent.id, 1)
      joinedHook.add({ ...activeEvent, currentParticipants: activeEvent.currentParticipants + 1 })
      requestNotifPermission()
    }
    recordSwipe(userId, activeEvent.id, type)
    if (type === 'like') {
      joinEvent(userId, activeEvent.id).catch(() => {
        toast.error('No se pudo guardar tu inscripción. Inténtalo de nuevo.')
      })
    }
    swipe.advance()
  }

  async function handleJoinFromMap(event) {
    eventsHook.markSwiped(event.id)
    eventsHook.updateEventCount(event.id, 1)
    joinedHook.add({ ...event, currentParticipants: event.currentParticipants + 1 })
    requestNotifPermission()
    recordSwipe(userId, event.id, 'like')
    joinEvent(userId, event.id).catch(() => {
      toast.error('No se pudo guardar tu inscripción.')
    })
    toast.success(`¡Te has unido a "${event.title}"!`)
  }

  function handleEventCreated() {
    setShowCreate(false)
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

  function closeAllPanels() {
    setShowFilters(false)
    setShowProfile(false)
    setShowJoined(false)
    setShowCreate(false)
    setShowFriends(false)
  }

  function handleToggleFilters() {
    if (showFilters) { handleCloseFilters(); return }
    closeAllPanels()
    setShowFilters(true)
  }

  function handleToggleProfile() {
    const next = !showProfile
    closeAllPanels()
    setShowProfile(next)
  }

  function handleToggleJoined() {
    const next = !showJoined
    closeAllPanels()
    setShowJoined(next)
  }

  function handleToggleCreate() {
    const next = !showCreate
    closeAllPanels()
    setShowCreate(next)
  }

  function handleToggleMap() {
    setShowMap((p) => !p)
  }

  function handleToggleFriends() {
    const next = !showFriends
    closeAllPanels()
    setShowFriends(next)
  }

  async function handleSaveProfile(avatarFile) {
    try {
      await profileHook.save(userId, avatarFile)
      toast.success('Perfil guardado')
      setShowProfile(false)
    } catch {
      toast.error('Error al guardar el perfil. Inténtalo de nuevo.')
    }
  }

  async function handleCancelEvent(eventId) {
    await joinedHook.cancel(userId, eventId)
    eventsHook.updateEventCount(eventId, -1)
    toast.info('Has cancelado tu participación')
  }

  // Cuando el usuario valora un evento: lo retira del panel de apuntados,
  // lo añade al historial de completados, cancela la participación activa en la BD
  // y recalcula la racha y los puntos del perfil.
  function handleRated(event, stars, comment) {
    joinedHook.removeRated(event.id)
    const newEntry = { ...event, rating: stars, comment, ratedAt: new Date().toISOString() }
    const newCompleted = [newEntry, ...completedHook.completedEvents.filter((e) => e.id !== event.id)]
    completedHook.add(event, stars, comment)
    cancelParticipation(userId, event.id)
    const streak = computeStreak(newCompleted)
    const count = newCompleted.length
    updateUserStats(userId, count, streak).catch(() => {})
    profileHook.setProfile((p) => ({ ...p, completedCount: count, currentStreak: streak }))
  }

  function handleProfileChange(field, value) {
    profileHook.setProfile((prev) => ({ ...prev, [field]: value }))
  }

  if (locationStatus === 'requesting' || eventsHook.loading) {
    return (
      <main className="app-shell loading-screen">
        <div className="loading-spinner" role="status" aria-label="Cargando" />
        <p>
          {locationStatus === 'requesting'
            ? 'Obteniendo tu ubicación…'
            : 'Buscando eventos cerca de ti…'}
        </p>
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
        showCreate={showCreate}
        showMap={showMap}
        showFriends={showFriends}
        requestsCount={friendsHook.incoming.length}
        onToggleFilters={handleToggleFilters}
        onToggleProfile={handleToggleProfile}
        onToggleJoined={handleToggleJoined}
        onToggleCreate={isAdmin ? null : handleToggleCreate}
        onToggleMap={handleToggleMap}
        onToggleFriends={handleToggleFriends}
        onSignOut={signOut}
        onOpenAdmin={onOpenAdmin}
        adminBadge={pendingCount}
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
            completedEvents={completedHook.completedEvents}
            onSave={handleSaveProfile}
            onClose={handleToggleProfile}
          />
        )}
        {showJoined && (
          <JoinedPanel
            joinedEvents={joinedHook.joinedEvents}
            onCancel={handleCancelEvent}
            onRate={setRatingEvent}
            onClose={handleToggleJoined}
          />
        )}
        {showCreate && (
          <CreateEventPanel
            userId={userId}
            isAdmin={isAdmin}
            onClose={() => setShowCreate(false)}
            onCreated={handleEventCreated}
          />
        )}
        {showFriends && (
          <FriendsPanel
            userId={userId}
            selfProfile={profileHook.profile}
            accepted={friendsHook.accepted}
            incoming={friendsHook.incoming}
            outgoing={friendsHook.outgoing}
            knownIds={friendsHook.knownIds}
            searchResults={friendsHook.searchResults}
            searching={friendsHook.searching}
            onSearch={friendsHook.search}
            onSendRequest={friendsHook.sendRequest}
            onAccept={friendsHook.accept}
            onRemove={friendsHook.remove}
            onClose={handleToggleFriends}
          />
        )}
      </Topbar>

      <section className="main-center" aria-live="polite">
        {showMap ? (
          <MapView
            events={filteredEvents}
            userCoords={userCoords}
            onJoin={handleJoinFromMap}
            onToggleFilters={handleToggleFilters}
            showFilters={showFilters}
          />
        ) : (
          <section className="deck">
            {activeEvent ? (
              <EventCard event={activeEvent} onDecision={handleDecision} />
            ) : (
              <article className="event-card empty">
                <div className="empty-icon" aria-hidden="true">🏟️</div>
                <h3>No hay más eventos con estos filtros</h3>
                <p>Ajusta tus preferencias o reinicia para ver más propuestas.</p>
                <button type="button" className="ghost-btn" onClick={swipe.reset}>
                  Volver al inicio
                </button>
              </article>
            )}
          </section>
        )}
      </section>

      {ratingEvent && (
        <RatingModal
          event={ratingEvent}
          userId={userId}
          onRated={handleRated}
          onClose={() => setRatingEvent(null)}
        />
      )}
    </main>
  )
}
