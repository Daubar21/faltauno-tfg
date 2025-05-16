// Panel de amigos: solicitudes, ranking y rachas
// Panel social — gestiona amigos, solicitudes de amistad, ranking por puntos
// y búsqueda de otros usuarios de la aplicación.
import { useEffect, useRef, useState } from 'react'
import { FiBell, FiCalendar, FiChevronDown, FiChevronUp, FiSearch, FiUserMinus, FiUserPlus, FiUsers, FiX } from 'react-icons/fi'
import { fetchFriendUpcomingEvents } from '../services/friendsService'
import { getLevel, getPoints } from '../utils/computeStreak'

const TABS = [
  { id: 'ranking',   label: 'Ranking',      Icon: () => <span aria-hidden="true">🏆</span> },
  { id: 'friends',   label: 'Amigos',       Icon: FiUsers },
  { id: 'requests',  label: 'Solicitudes',  Icon: FiBell },
  { id: 'search',    label: 'Buscar',       Icon: FiSearch },
]

const MEDALS = ['🥇', '🥈', '🥉']

function Avatar({ url, name, size = 36 }) {
  return url ? (
    <img
      className="fr-avatar"
      src={url}
      alt={name}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="fr-avatar fr-avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {(name?.[0] ?? '?').toUpperCase()}
    </div>
  )
}

function LevelBadge({ completedCount }) {
  const level = getLevel(completedCount ?? 0)
  return (
    <span
      className="level-badge"
      style={{ color: level.color, background: level.bg, border: `1.5px solid ${level.color}` }}
    >
      {level.label}
    </span>
  )
}

function RankingRow({ rank, profile, isSelf }) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null
  const points = getPoints(profile.completed_count ?? 0)

  return (
    <li className={`ranking-item ${isSelf ? 'ranking-self' : ''}`}>
      <span className="rank-pos">
        {medal ? <span aria-label={`Posición ${rank}`}>{medal}</span> : <span className="rank-num">{rank}</span>}
      </span>
      <Avatar url={profile.avatar_url} name={profile.display_name} size={34} />
      <div className="ranking-info">
        <span className="ranking-name">{profile.display_name ?? 'Usuario'}{isSelf && <span className="ranking-self-tag"> (tú)</span>}</span>
      </div>
      <div className="ranking-score">
        <span className="ranking-pts">{points}</span>
        <span className="ranking-pts-label">pts</span>
      </div>
    </li>
  )
}

function FriendRow({ friendship, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const { friend } = friendship

  async function toggleExpand() {
    if (!expanded && !events.length) {
      setLoadingEvents(true)
      const { data } = await fetchFriendUpcomingEvents(friend.id)
      setEvents(data)
      setLoadingEvents(false)
    }
    setExpanded((p) => !p)
  }

  if (!friend) return null

  return (
    <li className="friend-item">
      <div className="friend-row-main">
        <Avatar url={friend.avatar_url} name={friend.display_name} size={36} />
        <div className="friend-info">
          <span className="friend-name">{friend.display_name ?? 'Usuario'}</span>
          <div className="friend-meta">
            <LevelBadge completedCount={friend.completed_count} />
            {(friend.current_streak ?? 0) > 0 && (
              <span className="streak-tag">🔥 {friend.current_streak}</span>
            )}
          </div>
        </div>
        <div className="friend-actions">
          <button
            type="button"
            className="friend-expand-btn"
            onClick={toggleExpand}
            aria-label={expanded ? 'Ocultar partidos' : 'Ver partidos'}
            title="Ver próximos partidos"
          >
            <FiCalendar aria-hidden="true" />
            {expanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="friend-remove-btn"
            onClick={() => onRemove(friendship.id)}
            aria-label={`Eliminar a ${friend.display_name}`}
            title="Eliminar amigo"
          >
            <FiUserMinus aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="friend-events-wrap">
          {loadingEvents ? (
            <p className="friend-events-empty">Cargando…</p>
          ) : events.length === 0 ? (
            <p className="friend-events-empty">Sin partidos próximos</p>
          ) : (
            <ul className="friend-events-list">
              {events.map((ev) => (
                <li key={ev.id} className="friend-event-item">
                  <FiCalendar aria-hidden="true" className="fe-icon" />
                  <span className="fe-sport">{ev.sports?.name ?? '?'}</span>
                  <span className="fe-title">{ev.title}</span>
                  <span className="fe-date">{ev.event_date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export function FriendsPanel({
  userId,
  selfProfile,
  accepted,
  incoming,
  outgoing,
  knownIds,
  searchResults,
  searching,
  onSearch,
  onSendRequest,
  onAccept,
  onRemove,
  onClose,
}) {
  const [tab, setTab] = useState('ranking')
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (tab === 'search') searchRef.current?.focus()
  }, [tab])

  function handleQueryChange(e) {
    const val = e.target.value
    setQuery(val)
    onSearch(val)
  }

  // Build ranking list: self + accepted friends
  const rankingList = [
    ...(selfProfile ? [{
      id: userId,
      display_name: selfProfile.displayName,
      avatar_url: selfProfile.avatarUrl,
      completed_count: selfProfile.completedCount ?? 0,
      current_streak: selfProfile.currentStreak ?? 0,
    }] : []),
    ...accepted.map((f) => f.friend).filter(Boolean),
  ].sort((a, b) => (b.completed_count ?? 0) - (a.completed_count ?? 0))

  const filteredSearch = searchResults.filter(
    (u) => u.id !== userId && !knownIds.has(u.id)
  )

  return (
    <section className="floating-panel friends-panel" aria-label="Social">
      <div className="panel-header">
        <h2>Social</h2>
        {onClose && (
          <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Cerrar">
            <FiX aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="friends-tabs" role="tablist">
        {TABS.map(({ id, label, Icon }) => { // eslint-disable-line no-unused-vars
          const badge = id === 'requests' ? incoming.length : 0
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`friends-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {badge > 0 && <span className="tab-badge">{badge}</span>}
            </button>
          )
        })}
      </div>

      <div className="panel-body friends-body">

        {/* ── Pestaña: Ranking ── */}
        {tab === 'ranking' && (
          rankingList.length === 0 ? (
            <p className="fr-empty">Añade amigos para ver el ranking.</p>
          ) : (
            <>
              <p className="fr-hint">Clasificación por puntos (10 pts por evento completado)</p>
              <ol className="ranking-list" aria-label="Ranking de amigos">
                {rankingList.map((profile, i) => (
                  <RankingRow
                    key={profile.id}
                    rank={i + 1}
                    profile={profile}
                    isSelf={profile.id === userId}
                  />
                ))}
              </ol>
            </>
          )
        )}

        {/* ── Pestaña: Amigos ── */}
        {tab === 'friends' && (
          accepted.length === 0 ? (
            <p className="fr-empty">Aún no tienes amigos. ¡Búscalos en la pestaña Buscar!</p>
          ) : (
            <ul className="friend-list" aria-label="Lista de amigos">
              {accepted.map((f) => (
                <FriendRow
                  key={f.id}
                  friendship={f}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          )
        )}

        {/* ── Pestaña: Solicitudes de amistad ── */}
        {tab === 'requests' && (
          <>
            {incoming.length === 0 && outgoing.length === 0 ? (
              <p className="fr-empty">No tienes solicitudes pendientes.</p>
            ) : null}

            {incoming.length > 0 && (
              <>
                <p className="fr-section-label">Recibidas</p>
                <ul className="friend-list">
                  {incoming.map((f) => (
                    <li key={f.id} className="friend-item request-item">
                      <Avatar url={f.friend?.avatar_url} name={f.friend?.display_name} size={36} />
                      <div className="friend-info">
                        <span className="friend-name">{f.friend?.display_name ?? 'Usuario'}</span>
                        <LevelBadge completedCount={f.friend?.completed_count} />
                      </div>
                      <div className="request-btns">
                        <button
                          type="button"
                          className="req-accept-btn"
                          onClick={() => onAccept(f.id)}
                          aria-label="Aceptar solicitud"
                        >
                          <FiUserPlus aria-hidden="true" /> Aceptar
                        </button>
                        <button
                          type="button"
                          className="req-reject-btn"
                          onClick={() => onRemove(f.id)}
                          aria-label="Rechazar solicitud"
                        >
                          <FiX aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {outgoing.length > 0 && (
              <>
                <p className="fr-section-label" style={{ marginTop: incoming.length ? 16 : 0 }}>Enviadas</p>
                <ul className="friend-list">
                  {outgoing.map((f) => (
                    <li key={f.id} className="friend-item request-item">
                      <Avatar url={f.friend?.avatar_url} name={f.friend?.display_name} size={36} />
                      <div className="friend-info">
                        <span className="friend-name">{f.friend?.display_name ?? 'Usuario'}</span>
                        <span className="fr-pending-tag">Pendiente</span>
                      </div>
                      <button
                        type="button"
                        className="req-cancel-btn"
                        onClick={() => onRemove(f.id)}
                        aria-label="Cancelar solicitud"
                      >
                        Cancelar
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        {/* ── Pestaña: Buscar usuarios ── */}
        {tab === 'search' && (
          <>
            <div className="fr-search-wrap">
              <FiSearch className="fr-search-icon" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                className="fr-search-input"
                placeholder="Buscar por nombre…"
                value={query}
                onChange={handleQueryChange}
                aria-label="Buscar usuarios"
              />
            </div>

            {searching && <p className="fr-empty">Buscando…</p>}

            {!searching && query && filteredSearch.length === 0 && (
              <p className="fr-empty">No se encontraron usuarios.</p>
            )}

            {!searching && filteredSearch.length > 0 && (
              <ul className="friend-list">
                {filteredSearch.map((user) => (
                  <li key={user.id} className="friend-item request-item">
                    <Avatar url={user.avatar_url} name={user.display_name} size={36} />
                    <div className="friend-info">
                      <span className="friend-name">{user.display_name ?? 'Usuario'}</span>
                      <LevelBadge completedCount={user.completed_count} />
                    </div>
                    <button
                      type="button"
                      className="req-accept-btn"
                      onClick={() => onSendRequest(user.id)}
                      aria-label={`Agregar a ${user.display_name}`}
                    >
                      <FiUserPlus aria-hidden="true" /> Agregar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

      </div>
    </section>
  )
}
