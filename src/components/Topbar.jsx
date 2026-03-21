// Header simplificado: logo a la izquierda, filtros, perfil y salir a la derecha.
import { FiActivity, FiLogOut, FiSliders, FiUser } from 'react-icons/fi'

export function Topbar({
  showFilters,
  showProfile,
  onToggleFilters,
  onToggleProfile,
  onSignOut,
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
          className={`icon-btn ${showFilters ? 'active' : ''}`}
          aria-label="Filtros"
          title="Filtros"
          onClick={onToggleFilters}
        >
          <FiSliders aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`icon-btn ${showProfile ? 'active' : ''}`}
          aria-label="Mi perfil"
          title="Mi perfil"
          onClick={onToggleProfile}
        >
          <FiUser aria-hidden="true" />
        </button>

        {onSignOut && (
          <button
            type="button"
            className="icon-btn danger"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={onSignOut}
          >
            <FiLogOut aria-hidden="true" />
          </button>
        )}

        {children}
      </div>
    </header>
  )
}
