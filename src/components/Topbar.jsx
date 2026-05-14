// Barra de navegacion superior
// Barra de navegacion superior
// Barra de navegación superior — contiene los botones de acceso a todos los paneles
// y el logo de la aplicación. Recibe callbacks del padre (SwipePage) para cada acción.
import { FiActivity, FiCalendar, FiLogOut, FiMap, FiPlusCircle, FiSliders, FiShield, FiUser, FiUsers } from 'react-icons/fi'

export function Topbar({
  joinedCount,
  showFilters,
  showProfile,
  showJoined,
  showCreate,
  showMap,
  showFriends,
  requestsCount,
  onToggleFilters,
  onToggleProfile,
  onToggleJoined,
  onToggleCreate,
  onToggleMap,
  onToggleFriends,
  onSignOut,
  onOpenAdmin,
  adminBadge,
  children,
}) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-icon" aria-hidden="true">
          <FiActivity />
        </div>
        <p className="eyebrow">FaltaUno</p>
      </div>

      <div className="top-actions">
        <button
          type="button"
          className={`icon-btn ${showProfile ? 'active' : ''}`}
          aria-label="Perfil"
          title="Mi perfil"
          onClick={onToggleProfile}
        >
          <FiUser aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`icon-btn ${showFilters ? 'active' : ''}`}
          aria-label="Preferencias"
          title="Filtros"
          onClick={onToggleFilters}
        >
          <FiSliders aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`icon-btn cart-like ${showJoined ? 'active' : ''}`}
          aria-label="Mis partidos"
          title="Mis partidos"
          onClick={onToggleJoined}
        >
          <FiCalendar aria-hidden="true" />
          {joinedCount > 0 && <span className="badge">{joinedCount}</span>}
        </button>

        {onToggleCreate && (
          <button
            type="button"
            className={`icon-btn ${showCreate ? 'active' : ''}`}
            aria-label="Proponer evento"
            title="Proponer evento"
            onClick={onToggleCreate}
          >
            <FiPlusCircle aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          className={`icon-btn ${showMap ? 'active' : ''}`}
          aria-label="Ver mapa"
          title="Ver mapa de eventos"
          onClick={onToggleMap}
        >
          <FiMap aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`icon-btn cart-like ${showFriends ? 'active' : ''}`}
          aria-label="Social"
          title="Amigos y ranking"
          onClick={onToggleFriends}
        >
          <FiUsers aria-hidden="true" />
          {requestsCount > 0 && <span className="badge">{requestsCount}</span>}
        </button>

        {onOpenAdmin && (
          <button
            type="button"
            className={`icon-btn cart-like${adminBadge > 0 ? ' pending-alert' : ''}`}
            aria-label={adminBadge > 0 ? `Administración — ${adminBadge} solicitud${adminBadge > 1 ? 'es' : ''} pendiente${adminBadge > 1 ? 's' : ''}` : 'Panel de administración'}
            title={adminBadge > 0 ? `${adminBadge} solicitud${adminBadge > 1 ? 'es' : ''} pendiente${adminBadge > 1 ? 's' : ''}` : 'Administración'}
            onClick={onOpenAdmin}
          >
            <FiShield aria-hidden="true" />
            {adminBadge > 0 && <span className="badge badge-pending">{adminBadge}</span>}
          </button>
        )}

        <button
          type="button"
          className="icon-btn danger"
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
