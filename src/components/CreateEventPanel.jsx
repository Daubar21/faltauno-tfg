// Panel para que los usuarios propongan sus propios eventos.
// Los eventos creados por usuarios no-admin quedan en estado 'pending'
// hasta que un administrador los aprueba desde el panel de administración.
import { useState } from 'react'
import { FiCalendar, FiCheck, FiImage, FiMapPin, FiNavigation, FiSearch, FiUsers, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { SPORT_IMAGES, getFirstSportImage } from '../constants/eventImages'
import { genderOptions, levelOptions, sportIcons } from '../constants/sports'
import { createUserEvent } from '../services/eventsService'
import { geocodeAddress, reverseGeocode } from '../utils/geocode'

const SPORT_NAMES = Object.keys(sportIcons)
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const EMPTY_FORM = {
  sportName: SPORT_NAMES[0],
  title: '',
  eventDate: '',
  eventTime: '',
  city: 'Madrid',
  address: '',
  lat: null,
  lng: null,
  locationLabel: '',
  level: 'Intermedio',
  gender: 'Mixto',
  minAge: 18,
  maxAge: 50,
  totalPlaces: 10,
  directions: '',
  imageUrl: getFirstSportImage(SPORT_NAMES[0]),
}

export function CreateEventPanel({ userId, isAdmin, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  function setLocationField(field, value) {
    setForm((p) => ({ ...p, [field]: value, lat: null, lng: null, locationLabel: '' }))
  }

  async function handleGeocode() {
    const q = [form.address, form.city].filter(Boolean).join(', ')
    if (!q.trim()) { toast.error('Escribe una dirección antes de buscar'); return }
    setGeocoding(true)
    try {
      const result = await geocodeAddress(q)
      if (!result) {
        toast.error('No se encontró esa dirección. Prueba a ser más específico.')
        return
      }
      setForm((p) => ({ ...p, lat: result.lat, lng: result.lng, locationLabel: result.displayName }))
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
            locationLabel: result?.displayName ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            city: result?.city || p.city,
            address: result?.road || p.address,
          }))
          toast.success('Ubicación obtenida')
        } catch {
          setForm((p) => ({
            ...p,
            lat: latitude,
            lng: longitude,
            locationLabel: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }))
        }
        setGeocoding(false)
      },
      () => {
        setGeocoding(false)
        toast.error('No se pudo obtener la ubicación')
      },
      { timeout: 8000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error('El título debe tener al menos 3 caracteres')
      return
    }
    if (!form.eventDate) {
      toast.error('La fecha es obligatoria')
      return
    }
    const now = new Date()
    const todayMidnight = new Date(now)
    todayMidnight.setHours(0, 0, 0, 0)
    if (new Date(form.eventDate + 'T00:00:00') < todayMidnight) {
      toast.error('La fecha debe ser hoy o posterior')
      return
    }
    if (form.eventTime) {
      const eventDt = new Date(`${form.eventDate}T${form.eventTime}:00`)
      if (eventDt <= now) {
        toast.error('La hora del evento no puede ser en el pasado')
        return
      }
    }
    if (!form.lat || !form.lng) {
      toast.error('Confirma la ubicación usando el botón de búsqueda 🔍')
      return
    }
    if (Number(form.minAge) > Number(form.maxAge)) {
      toast.error('La edad mínima no puede superar la máxima')
      return
    }
    if (Number(form.totalPlaces) < 2) {
      toast.error('El evento necesita al menos 2 plazas')
      return
    }

    setSaving(true)
    try {
      const created = await createUserEvent({
        sportName: form.sportName,
        title: form.title.trim(),
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        city: form.city,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        level: form.level,
        gender: form.gender,
        minAge: form.minAge,
        maxAge: form.maxAge,
        totalPlaces: form.totalPlaces,
        directions: form.directions,
        imageUrl: form.imageUrl,
        createdBy: userId,
        status: isAdmin ? 'open' : 'pending',
      })
      toast.success(isAdmin ? '¡Evento publicado!' : '¡Solicitud enviada! Un administrador la revisará pronto.')
      onCreated(created)
    } catch {
      toast.error('Error al crear el evento. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="floating-panel create-panel" aria-label="Proponer evento">
      <div className="panel-header">
        <h2>Proponer evento</h2>
        <button type="button" className="panel-close-btn" onClick={onClose} aria-label="Cerrar">
          <FiX aria-hidden="true" />
        </button>
      </div>

      <div className="panel-body">
        <form onSubmit={handleSubmit}>
          <p className="panel-section-title">Qué y cuándo</p>

          <label htmlFor="ce-sport">Deporte *</label>
          <select
            id="ce-sport"
            value={form.sportName}
            onChange={(e) => {
              const name = e.target.value
              setForm((p) => ({ ...p, sportName: name, imageUrl: getFirstSportImage(name) }))
            }}
          >
            {SPORT_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <label htmlFor="ce-title">Título *</label>
          <input
            id="ce-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ej: Partido amistoso en el Retiro"
            minLength={3}
            required
          />

          <div className="ce-row">
            <div>
              <label htmlFor="ce-date">
                <FiCalendar aria-hidden="true" /> Fecha *
              </label>
              <input
                id="ce-date"
                type="date"
                value={form.eventDate}
                min={todayStr()}
                onChange={(e) => set('eventDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="ce-time-h">Hora</label>
              {(() => {
                const isToday = form.eventDate === todayStr()
                const nowH = new Date().getHours()
                const nowM = new Date().getMinutes()
                const selH = form.eventTime ? form.eventTime.split(':')[0] : ''
                const selM = form.eventTime ? form.eventTime.split(':')[1] : ''
                return (
                  <div className="ce-time-selects" style={{ display: 'flex', gap: 4 }}>
                    <select
                      id="ce-time-h"
                      value={selH}
                      onChange={(e) => {
                        const h = e.target.value
                        const m = selM || '00'
                        set('eventTime', h ? `${h}:${m}` : '')
                      }}
                    >
                      <option value="">--</option>
                      {HOURS.map((h) => (
                        <option key={h} value={h} disabled={isToday && Number(h) < nowH}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Minutos"
                      value={selM}
                      onChange={(e) => {
                        const m = e.target.value
                        const h = selH || '00'
                        set('eventTime', m ? `${h}:${m}` : '')
                      }}
                    >
                      <option value="">--</option>
                      {MINUTES.map((m) => (
                        <option key={m} value={m} disabled={isToday && Number(selH) === nowH && Number(m) <= nowM}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })()}
            </div>
          </div>

          <p className="panel-section-title">
            <FiMapPin aria-hidden="true" /> Dónde
          </p>

          <label htmlFor="ce-city">Ciudad *</label>
          <input
            id="ce-city"
            value={form.city}
            onChange={(e) => setLocationField('city', e.target.value)}
            placeholder="Ej: Madrid"
            required
          />

          <label htmlFor="ce-address">Dirección</label>
          <div className="ce-address-row">
            <input
              id="ce-address"
              value={form.address}
              onChange={(e) => setLocationField('address', e.target.value)}
              placeholder="Ej: Parque del Retiro, junto al lago"
            />
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

          {form.locationLabel ? (
            <p className="ce-location-confirm">
              <FiCheck aria-hidden="true" /> {form.locationLabel}
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
          >
            <FiNavigation aria-hidden="true" />
            {geocoding ? ' Obteniendo ubicación…' : ' Usar mi ubicación actual'}
          </button>

          <p className="panel-section-title">
            <FiUsers aria-hidden="true" /> Participantes
          </p>

          <div className="ce-row">
            <div>
              <label htmlFor="ce-level">Nivel</label>
              <select
                id="ce-level"
                value={form.level}
                onChange={(e) => set('level', e.target.value)}
              >
                {levelOptions.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ce-gender">Género</label>
              <select
                id="ce-gender"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                {genderOptions.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="ce-row ce-row-3">
            <div>
              <label htmlFor="ce-minage">Edad mín.</label>
              <input
                id="ce-minage"
                type="number"
                min="16"
                max="80"
                value={form.minAge}
                onChange={(e) => set('minAge', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ce-maxage">Edad máx.</label>
              <input
                id="ce-maxage"
                type="number"
                min="16"
                max="80"
                value={form.maxAge}
                onChange={(e) => set('maxAge', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ce-places">Plazas</label>
              <input
                id="ce-places"
                type="number"
                min="2"
                max="50"
                value={form.totalPlaces}
                onChange={(e) => set('totalPlaces', e.target.value)}
              />
            </div>
          </div>

          <label htmlFor="ce-directions">Instrucciones (opcional)</label>
          <textarea
            id="ce-directions"
            value={form.directions}
            onChange={(e) => set('directions', e.target.value)}
            placeholder="Cómo llegar, punto de encuentro, qué traer…"
            rows={2}
          />

          <p className="panel-section-title">
            <FiImage aria-hidden="true" /> Imagen del evento
          </p>
          <div className="ce-image-grid">
            {(SPORT_IMAGES[form.sportName] ?? SPORT_IMAGES['Futbol 7']).map((url, i) => (
              <button
                key={i}
                type="button"
                className={`ce-image-option ${form.imageUrl === url ? 'selected' : ''}`}
                onClick={() => set('imageUrl', url)}
                aria-label={`Imagen ${i + 1}`}
              >
                <img src={url} alt={`${form.sportName} opción ${i + 1}`} loading="lazy" />
                {form.imageUrl === url && (
                  <span className="ce-image-check"><FiCheck aria-hidden="true" /></span>
                )}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={saving || geocoding}
            style={{ marginTop: 10 }}
          >
            {saving ? 'Creando evento…' : '+ Proponer evento'}
          </button>
        </form>
      </div>
    </section>
  )
}
