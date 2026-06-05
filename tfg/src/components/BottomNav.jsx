import { FiCalendar, FiPlusCircle, FiShield, FiUsers } from 'react-icons/fi'

export function BottomNav({
  joinedCount,
  showJoined,
  showCreate,
  showFriends,
  requestsCount,
  onToggleCreate,
  onToggleJoined,
  onToggleFriends,
  onOpenAdmin,
  adminBadge,
}) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <button
        type="button"
        className={`bottom-nav-btn cart-like ${showJoined ? 'active' : ''}`}
        aria-label="Mis partidos"
        onClick={onToggleJoined}
      >
        <FiCalendar aria-hidden="true" />
        {joinedCount > 0 && <span className="badge">{joinedCount}</span>}
        <span className="bottom-nav-label">Mis partidos</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-btn cart-like ${showFriends ? 'active' : ''}`}
        aria-label="Amigos"
        onClick={onToggleFriends}
      >
        <FiUsers aria-hidden="true" />
        {requestsCount > 0 && <span className="badge">{requestsCount}</span>}
        <span className="bottom-nav-label">Amigos</span>
      </button>

      {onOpenAdmin && (
        <button
          type="button"
          className={`bottom-nav-btn cart-like${adminBadge > 0 ? ' pending-alert-nav' : ''}`}
          aria-label="Administración"
          onClick={onOpenAdmin}
        >
          <FiShield aria-hidden="true" />
          {adminBadge > 0 && <span className="badge badge-pending">{adminBadge}</span>}
          <span className="bottom-nav-label">Admin</span>
        </button>
      )}

      {onToggleCreate && (
        <button
          type="button"
          className={`bottom-nav-btn ${showCreate ? 'active' : ''}`}
          aria-label="Proponer evento"
          onClick={onToggleCreate}
        >
          <FiPlusCircle aria-hidden="true" />
          <span className="bottom-nav-label">Proponer</span>
        </button>
      )}
    </nav>
  )
}
