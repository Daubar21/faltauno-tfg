// Panel de administración — accesible solo para usuarios con rol 'admin'.
// Contiene cuatro pestañas: Resumen (estadísticas), Solicitudes (eventos pendientes),
// Eventos (CRUD completo) y Usuarios (gestión de roles).
import { useEffect, useState } from 'react'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiImage,
  FiNavigation,
  FiPlusCircle,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
  FiXCircle,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { SPORT_IMAGES, getFirstSportImage } from '../constants/eventImages'
import { geocodeAddress, reverseGeocode } from '../utils/geocode'
import {
  approveEvent,
  cancelEventAdmin,
  createEventAdmin,
  deleteEventAdmin,
  fetchAdminStats,
  fetchAllEventsAdmin,
  fetchAllUsers,
  fetchPendingEvents,
  fetchSports,
  rejectEvent,
  setUserRole,
  updateEventAdmin,
} from '../services/adminService'

// ─── Funciones auxiliares ──────────────────────────────────────────────────

function isPast(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') < today
}

function effectiveStatus(ev) {
  if (ev.status === 'cancelled') return 'cancelled'
  if (ev.status === 'pending')   return 'pending'
  if (isPast(ev.event_date)) {
    const completed = ev.status === 'full' || ev.current_participants >= ev.total_places
    return completed ? 'past' : 'cancelled'
  }
  if (ev.status === 'full') return 'full'
  return 'open'
}

function statusLabel(ev) {
  const s = effectiveStatus(ev)
  if (s === 'open')      return 'Abierto'
  if (s === 'full')      return 'Completo'
  if (s === 'pending')   return 'Pendiente'
  if (s === 'past')      return 'Realizado'
  return 'Cancelado'
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Botón de pestaña ──────────────────────────────────────────────────────

function TabButton({ tab, active, onClick, badge }) {
  const { id, label, Icon } = tab
  return (
    <button
      type="button"
      className={`admin-tab-btn ${active ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      <Icon aria-hidden="true" /> {label}
      {badge > 0 && <span className="tab-badge">{badge}</span>}
    </button>
  )
}

// ─── Formulario modal de evento (crear o editar) ───────────────────────────

const EMPTY_FORM = {
  sport_id: '',
  title: '',
  event_date: '',
  event_time: '',
  city: 'Madrid',
  address: '',
  lat: null,
  lng: null,
  level: 'Intermedio',
  gender: 'Mixto',
  min_age: 18,
  max_age: 50,
  total_places: 10,
  directions: '',
  image_url: '',
}

function EventForm({ sports, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [locationLabel, setLocationLabel] = useState(
    initial?.lat ? [initial.address, initial.city].filter(Boolean).join(', ') : ''
  )

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function setAddressField(field, value) {
    setForm((p) => ({ ...p, [field]: value, lat: null, lng: null }))
    setLocationLabel('')
  }

  const sportName = sports.find((s) => s.id === Number(form.sport_id))?.name ?? ''
  const sportImages = SPORT_IMAGES[sportName] ?? []

  async function handleGeocode() {
    const q = [form.address, form.city].filter(Boolean).join(', ')
    if (!q.trim()) { toast.error('Escribe una dirección antes de buscar'); return }
    setGeocoding(true)
    try {
      const result = await geocodeAddress(q)
      if (!result) { toast.error('No se encontró esa dirección. Prueba a ser más específico.'); return }
      setForm((p) => ({ ...p, lat: result.lat, lng: result.lng }))
      setLocationLabel(result.displayName)
      toast.success('¡Ubicación encontrada!')
    } catch {
      toast.error('Error al buscar la dirección. Comprueba tu conexión.')
    } finally {
      setGeocoding(false)
    }
  }

  async function handleUseMyLocation() {
    if (!navigator.geolocation) { toast.error('Geolocalización no disponible en este dispositivo'); return }
    setGeocoding(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const result = await reverseGeocode(latitude, longitude)
          setForm((p) => ({
            ...p,
            lat: latitude,
            lng: longitude,
            city: result?.city || p.city,
            address: result?.road || p.address,
          }))
          setLocationLabel(result?.displayName ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          toast.success('Ubicación obtenida')
        } catch {
          setForm((p) => ({ ...p, lat: latitude, lng: longitude }))
          setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        }
        setGeocoding(false)
      },
      () => { setGeocoding(false); toast.error('No se pudo obtener la ubicación') },
      { timeout: 8000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.sport_id || !form.title || !form.event_date || !form.event_time || !form.address) {
      toast.error('Rellena los campos obligatorios')
      return
    }
    if (!form.lat || !form.lng) {
      toast.error('Confirma la ubicación usando el botón de búsqueda 🔍')
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...form,
        sport_id: Number(form.sport_id),
        lat: Number(form.lat),
        lng: Number(form.lng),
        min_age: Number(form.min_age),
        max_age: Number(form.max_age),
        total_places: Number(form.total_places),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{initial ? 'Editar evento' : 'Crear evento'}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="admin-event-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Deporte *
              <select
                value={form.sport_id}
                onChange={(e) => {
                  const id = e.target.value
                  const name = sports.find((s) => s.id === Number(id))?.name ?? ''
                  setForm((p) => ({ ...p, sport_id: id, image_url: getFirstSportImage(name) }))
                }}
                required
              >
                <option value="">Seleccionar…</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label>
              Título *
              <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Fecha *
              <input type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} required />
            </label>
            <label>
              Hora *
              <input type="time" value={form.event_time} onChange={(e) => set('event_time', e.target.value)} required />
            </label>
          </div>

          <div className="form-row">
            <label>
              Ciudad
              <input value={form.city} onChange={(e) => setAddressField('city', e.target.value)} />
            </label>
            <label>
              Dirección *
              <div className="ce-address-row">
                <input value={form.address} onChange={(e) => setAddressField('address', e.target.value)} required />
                <button
                  type="button"
                  className="icon-btn ce-search-btn"
                  onClick={handleGeocode}
                  disabled={geocoding}
                  aria-label="Buscar ubicación"
                  title="Buscar ubicación"
                >
                  <FiSearch aria-hidden="true" />
                </button>
              </div>
            </label>
          </div>

          {locationLabel ? (
            <p className="ce-location-confirm">
              <FiCheck aria-hidden="true" /> {locationLabel}
            </p>
          ) : (
            <p className="ce-location-hint">
              Escribe la dirección y pulsa 🔍 para confirmar la ubicación
            </p>
          )}

          <button
            type="button"
            className="ghost-btn ce-location-btn"
            onClick={handleUseMyLocation}
            disabled={geocoding}
            style={{ marginBottom: 12 }}
          >
            <FiNavigation aria-hidden="true" />
            {geocoding ? ' Obteniendo ubicación…' : ' Usar mi ubicación actual'}
          </button>

          <div className="form-row">
            <label>
              Nivel
              <select value={form.level} onChange={(e) => set('level', e.target.value)}>
                <option>Principiante</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </select>
            </label>
            <label>
              Género
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option>Mixto</option>
                <option>Masculino</option>
                <option>Femenino</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Edad mín.
              <input type="number" min="16" max="99" value={form.min_age} onChange={(e) => set('min_age', e.target.value)} />
            </label>
            <label>
              Edad máx.
              <input type="number" min="16" max="100" value={form.max_age} onChange={(e) => set('max_age', e.target.value)} />
            </label>
            <label>
              Plazas totales
              <input type="number" min="2" max="100" value={form.total_places} onChange={(e) => set('total_places', e.target.value)} />
            </label>
          </div>

          <label>
            Instrucciones / cómo llegar
            <textarea rows={2} value={form.directions} onChange={(e) => set('directions', e.target.value)} />
          </label>

          {sportImages.length > 0 && (
            <>
              <p className="panel-section-title" style={{ marginTop: 12 }}>
                <FiImage aria-hidden="true" /> Imagen del evento
              </p>
              <div className="ce-image-grid">
                {sportImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`ce-image-option ${form.image_url === url ? 'selected' : ''}`}
                    onClick={() => set('image_url', url)}
                    aria-label={`Imagen ${i + 1}`}
                  >
                    <img src={url} alt={`${sportName} opción ${i + 1}`} loading="lazy" />
                    {form.image_url === url && (
                      <span className="ce-image-check"><FiCheck aria-hidden="true" /></span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="admin-modal-footer">
            <button type="button" className="ghost-btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="auth-submit" disabled={saving || geocoding}>
              {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Pestaña: Resumen general ──────────────────────────────────────────────

function DashboardTab({ onGoToPending }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchAdminStats().then(setStats)
  }, [])

  if (!stats) return <p className="admin-loading">Cargando estadísticas…</p>

  const { totalEvents, totalUsers, statusCounts, sportCounts } = stats

  return (
    <div className="admin-dashboard">
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="stat-big">{totalEvents}</span>
          <span>Eventos totales</span>
        </div>
        <div className="admin-stat-card open">
          <span className="stat-big">{statusCounts.open}</span>
          <span>Abiertos</span>
        </div>
        <div className="admin-stat-card full">
          <span className="stat-big">{statusCounts.full}</span>
          <span>Completos</span>
        </div>
        <div className="admin-stat-card cancelled">
          <span className="stat-big">{statusCounts.cancelled}</span>
          <span>Cancelados</span>
        </div>
        {statusCounts.pending > 0 && (
          <button
            type="button"
            className="admin-stat-card pending stat-card-btn"
            onClick={onGoToPending}
          >
            <span className="stat-big">{statusCounts.pending}</span>
            <span>Pendientes ›</span>
          </button>
        )}
        <div className="admin-stat-card users">
          <span className="stat-big">{totalUsers}</span>
          <span>Usuarios</span>
        </div>
      </div>

      <h3 className="admin-section-title">Eventos por deporte</h3>
      <div className="admin-sport-bars">
        {Object.entries(sportCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([sport, count]) => (
            <div key={sport} className="sport-bar-row">
              <span className="sport-bar-label">{sport}</span>
              <div className="sport-bar-track">
                <div
                  className="sport-bar-fill"
                  style={{ width: `${Math.round((count / totalEvents) * 100)}%` }}
                />
              </div>
              <span className="sport-bar-count">{count}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

// ─── Pestaña: Solicitudes de eventos pendientes ────────────────────────────

function PendingTab({ onCountChange }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { data } = await fetchPendingEvents()
      const list = data ?? []
      setEvents(list)
      onCountChange?.(list.length)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  async function handleApprove(id) {
    const { error } = await approveEvent(id)
    if (error) { toast.error('Error al aprobar el evento'); return }
    toast.success('¡Evento aprobado y publicado!')
    load()
  }

  async function handleReject(id, title) {
    if (!confirm(`¿Rechazar el evento "${title}"?`)) return
    const { error } = await rejectEvent(id)
    if (error) { toast.error('Error al rechazar'); return }
    toast.info('Evento rechazado')
    load()
  }

  if (loading) return <p className="admin-loading">Cargando solicitudes…</p>

  if (!events.length) {
    return (
      <div className="admin-tab-content">
        <p className="admin-empty">
          <FiCheckCircle aria-hidden="true" /> No hay solicitudes pendientes
        </p>
      </div>
    )
  }

  return (
    <div className="admin-tab-content">
      <p className="admin-pending-help">
        Revisa los eventos propuestos por usuarios antes de publicarlos.
      </p>
      <div className="pending-events-list">
        {events.map((ev) => (
          <div key={ev.id} className="pending-event-card">
            {ev.image_url && (
              <img
                src={ev.image_url}
                alt={ev.title}
                className="pending-event-img"
                loading="lazy"
              />
            )}
            <div className="pending-event-info">
              <span className="pending-sport-badge">{ev.sports?.name ?? '—'}</span>
              <h4 className="pending-event-title">{ev.title}</h4>
              <p className="pending-event-meta">
                📅 {fmtDate(ev.event_date)}{ev.event_time ? ` · ${ev.event_time.slice(0, 5)}` : ''}
              </p>
              <p className="pending-event-meta">
                📍 {ev.address}{ev.city ? `, ${ev.city}` : ''}
              </p>
              <p className="pending-event-meta">
                👥 {ev.total_places} plazas · {ev.level} · {ev.gender}
                · Edad {ev.min_age}–{ev.max_age}
              </p>
              {ev.directions && (
                <p className="pending-event-directions">🗺️ {ev.directions}</p>
              )}
            </div>
            <div className="pending-event-actions">
              <button
                type="button"
                className="pending-approve-btn"
                onClick={() => handleApprove(ev.id)}
              >
                <FiCheckCircle aria-hidden="true" /> Aprobar
              </button>
              <button
                type="button"
                className="pending-reject-btn"
                onClick={() => handleReject(ev.id, ev.title)}
              >
                <FiXCircle aria-hidden="true" /> Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Pestaña: Gestión de todos los eventos ─────────────────────────────────

function EventsTab({ userId }) {
  const [events, setEvents] = useState([])
  const [sports, setSports] = useState([])
  const [loading, setLoading] = useState(true)
  const [formTarget, setFormTarget] = useState(null)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [{ data: evs }, { data: sps }] = await Promise.all([
        fetchAllEventsAdmin(),
        fetchSports(),
      ])
      setEvents(evs ?? [])
      setSports(sps ?? [])
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  async function handleSave(fields) {
    if (formTarget === 'new') {
      const { error } = await createEventAdmin(userId, fields)
      if (error) { toast.error('Error al crear el evento'); return }
      toast.success('Evento creado')
    } else {
      const { error } = await updateEventAdmin(formTarget.id, fields)
      if (error) { toast.error('Error al actualizar'); return }
      toast.success('Evento actualizado')
    }
    setFormTarget(null)
    load()
  }

  async function handleCancel(id) {
    if (!confirm('¿Cancelar este evento? Los participantes serán notificados.')) return
    const { error } = await cancelEventAdmin(id)
    if (error) { toast.error(`Error al cancelar: ${error.message}`); return }
    toast.success('Evento cancelado correctamente')
    load()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este evento permanentemente? Esta acción no se puede deshacer.')) return
    const { error } = await deleteEventAdmin(id)
    if (error) { toast.error(`Error al eliminar: ${error.message}`); return }
    toast.success('Evento eliminado correctamente')
    load()
  }

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.sports?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.city?.toLowerCase().includes(search.toLowerCase()),
  )

  const initialForm = formTarget && formTarget !== 'new'
    ? {
        sport_id: String(formTarget.sport_id),
        title: formTarget.title,
        event_date: formTarget.event_date,
        event_time: formTarget.event_time?.substring(0, 5),
        city: formTarget.city,
        address: formTarget.address,
        lat: String(formTarget.lat),
        lng: String(formTarget.lng),
        level: formTarget.level,
        gender: formTarget.gender,
        min_age: formTarget.min_age,
        max_age: formTarget.max_age,
        total_places: formTarget.total_places,
        directions: formTarget.directions ?? '',
        image_url: formTarget.image_url ?? '',
      }
    : null

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-toolbar">
        <input
          className="admin-search"
          placeholder="Buscar por título, deporte o ciudad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="auth-submit admin-create-btn" onClick={() => setFormTarget('new')}>
          <FiPlusCircle /> Nuevo evento
        </button>
      </div>

      {loading ? (
        <p className="admin-loading">Cargando eventos…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-events-table">
            <thead>
              <tr>
                <th>Deporte</th>
                <th>Título</th>
                <th>Fecha</th>
                <th>Ciudad</th>
                <th>Nivel</th>
                <th>Plazas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const eStatus = effectiveStatus(ev)
                const past = isPast(ev.event_date)
                return (
                  <tr key={ev.id} className={past ? 'admin-row-past' : ''}>
                    <td>{ev.sports?.name ?? '—'}</td>
                    <td className="admin-td-title">{ev.title}</td>
                    <td>{fmtDate(ev.event_date)}</td>
                    <td>{ev.city}</td>
                    <td>{ev.level}</td>
                    <td>
                      <span className={past ? 'admin-participants-past' : ''}>
                        {ev.current_participants}/{ev.total_places}
                        {past && ` (${Math.round((ev.current_participants / (ev.total_places || 1)) * 100)}%)`}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge status-${eStatus}`}>
                        {statusLabel(ev)}
                      </span>
                    </td>
                    <td className="admin-actions">
                      {!past && (
                        <button type="button" className="icon-btn" title="Editar" onClick={() => setFormTarget(ev)}>
                          <FiEdit2 />
                        </button>
                      )}
                      {!past && eStatus !== 'cancelled' && eStatus !== 'pending' && (
                        <button type="button" className="icon-btn warn" title="Cancelar" onClick={() => handleCancel(ev.id)}>
                          <FiXCircle />
                        </button>
                      )}
                      {eStatus === 'pending' && (
                        <button type="button" className="icon-btn success" title="Aprobar" onClick={() => approveEvent(ev.id).then(load)}>
                          <FiCheckCircle />
                        </button>
                      )}
                      {!past && (
                        <button type="button" className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(ev.id)}>
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-500)' }}>
                    No se encontraron eventos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formTarget && (
        <EventForm
          sports={sports}
          initial={initialForm}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
        />
      )}
    </div>
  )
}

// ─── Pestaña: Gestión de usuarios ──────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const { data } = await fetchAllUsers()
      setUsers(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  async function handleToggleAdmin(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const label = newRole === 'admin' ? 'admin' : 'usuario'
    if (!confirm(`¿Cambiar rol de ${user.display_name ?? 'este usuario'} a ${label}?`)) return
    const { error } = await setUserRole(user.id, newRole)
    if (error) { toast.error('Error al cambiar rol'); return }
    toast.success(`Rol actualizado a ${label}`)
    load()
  }

  return (
    <div className="admin-tab-content">
      {loading ? (
        <p className="admin-loading">Cargando usuarios…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-users-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Rol</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="admin-user-avatar" />
                    ) : (
                      <div className="admin-user-avatar placeholder" />
                    )}
                  </td>
                  <td>{u.display_name ?? <em style={{ color: 'var(--text-500)' }}>Sin nombre</em>}</td>
                  <td>{u.city ?? '—'}</td>
                  <td>
                    <span className={`admin-role-badge ${u.role}`}>
                      {u.role === 'admin' ? <><FiShield /> Admin</> : 'Usuario'}
                    </span>
                  </td>
                  <td>{fmtDate(u.created_at?.substring(0, 10))}</td>
                  <td>
                    <button
                      type="button"
                      className={`day-chip ${u.role === 'admin' ? 'active' : ''}`}
                      onClick={() => handleToggleAdmin(u)}
                      title={u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                    >
                      {u.role === 'admin' ? <FiXCircle /> : <FiCheckCircle />}
                      {u.role === 'admin' ? ' Quitar admin' : ' Dar admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal del panel de administración ─────────────────────

export function AdminPage({ onBack }) {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchPendingEvents().then(({ data }) => setPendingCount(data?.length ?? 0))
  }, [])

  const TABS = [
    { id: 'dashboard', label: 'Resumen',      Icon: FiBarChart2    },
    { id: 'pending',   label: 'Solicitudes',  Icon: FiAlertCircle  },
    { id: 'events',    label: 'Eventos',      Icon: FiCalendar     },
    { id: 'users',     label: 'Usuarios',     Icon: FiUsers        },
  ]

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <button type="button" className="icon-btn" onClick={onBack} title="Volver a la app">
          <FiArrowLeft />
        </button>
        <div className="admin-title-wrap">
          <FiShield className="admin-shield-icon" />
          <h1 className="admin-title">Panel de Administración</h1>
        </div>
        <nav className="admin-tabs">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={setActiveTab}
              badge={tab.id === 'pending' ? pendingCount : 0}
            />
          ))}
        </nav>
      </header>

      <div className="admin-body">
        {activeTab === 'dashboard' && (
          <DashboardTab onGoToPending={() => setActiveTab('pending')} />
        )}
        {activeTab === 'pending' && (
          <PendingTab onCountChange={setPendingCount} />
        )}
        {activeTab === 'events' && <EventsTab userId={session.user.id} />}
        {activeTab === 'users'  && <UsersTab />}
      </div>
    </main>
  )
}
