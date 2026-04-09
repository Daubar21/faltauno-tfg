import { FiCalendar, FiLogOut, FiSettings, FiUser } from 'react-icons/fi'

export function Topbar({
  joinedCount,
  showFilters,
  showProfile,
  showJoined,
  onToggleFilters,
  onToggleProfile,
  onToggleJoined,
  onSignOut,
  children,
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">FaltaUno</p>
      </div>

      <div className="top-actions">
        <button
          type="button"
          className={`icon-btn ${showProfile ? 'active' : ''}`}
          aria-label="Perfil"
          onClick={onToggleProfile}
        >
          <FiUser aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`icon-btn ${showFilters ? 'active' : ''}`}
          aria-label="Preferencias"
          onClick={onToggleFilters}
        >
          <FiSettings aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`icon-btn cart-like ${showJoined ? 'active' : ''}`}
          aria-label="Mis partidos"
          onClick={onToggleJoined}
        >
          <FiCalendar aria-hidden="true" />
          {joinedCount > 0 && <span className="badge">{joinedCount}</span>}
        </button>

        <button
          type="button"
          className="icon-btn"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          onClick={onSignOut}
        >
          <FiLogOut aria-hidden="true" />
        </button>

        {children}
      </div>
    </header>
  )
}
