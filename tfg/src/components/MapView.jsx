// Vista de mapa interactivo (Leaflet) con marcadores de todos los eventos filtrados.
// Color de chincheta según ocupación: azul < 50 %, ámbar 50–74 %, verde ≥ 75 %.
// Eventos completos → chincheta roja con popup de lista de espera.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiSliders } from 'react-icons/fi'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { getEventPrice } from '../utils/mapDbEvent'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const userLocationIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #2563eb,0 2px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function makeMarkerIcon(color) {
  const html = `
    <div style="width:28px;height:36px;display:flex;align-items:flex-start;justify-content:center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z"
          fill="${color}" stroke="rgba(0,0,0,0.18)" stroke-width="1"/>
        <circle cx="12" cy="12" r="5" fill="rgba(255,255,255,0.85)"/>
      </svg>
    </div>`
  return L.divIcon({ className: '', html, iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36] })
}

function getMarkerColor(fillPct) {
  if (fillPct >= 75) return '#16a34a'  // verde — últimas plazas
  if (fillPct >= 50) return '#d97706'  // ámbar — pocas plazas
  return '#2563eb'                     // azul  — plazas disponibles
}

export function MapView({
  events,
  fullEvents,
  waitlistIds,
  userCoords,
  onJoin,
  onJoinWaitlist,
  onLeaveWaitlist,
  onToggleFilters,
  showFilters,
}) {
  const center = [userCoords.lat, userCoords.lng]

  return (
    <div className="map-view-wrap">
      <button
        type="button"
        className={`map-filters-btn ${showFilters ? 'active' : ''}`}
        onClick={onToggleFilters}
        aria-label="Filtros"
      >
        <FiSliders aria-hidden="true" />
        Filtros
        {showFilters && <span className="map-filters-dot" aria-hidden="true" />}
      </button>

      <div className="map-legend">
        <span className="map-legend-item map-legend-blue">Plazas disponibles</span>
        <span className="map-legend-item map-legend-amber">Pocas plazas</span>
        <span className="map-legend-item map-legend-green">Últimas plazas</span>
        <span className="map-legend-item map-legend-red">Completo</span>
      </div>

      <MapContainer center={center} zoom={13} className="leaflet-main-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center} icon={userLocationIcon}>
          <Popup className="leaflet-custom-popup">
            <div className="map-popup-card">
              <strong className="map-popup-title">Mi ubicación</strong>
            </div>
          </Popup>
        </Marker>

        {/* Eventos con plazas disponibles */}
        {events.map((event) => {
          if (!event.lat || !event.lng) return null
          const price = getEventPrice(event)
          const spotsLeft = event.totalPlaces - event.currentParticipants
          const fillPct = Math.round((event.currentParticipants / event.totalPlaces) * 100)

          return (
            <Marker key={event.id} position={[event.lat, event.lng]} icon={makeMarkerIcon(getMarkerColor(fillPct))}>
              <Popup className="leaflet-custom-popup">
                <div className="map-popup-card">
                  <strong className="map-popup-title">{event.title}</strong>
                  <span className="map-popup-sport">{event.sport} · {event.level}</span>
                  <span className="map-popup-meta">{event.date}</span>
                  <span className="map-popup-meta">
                    {event.distanceKm} km · {price === 0 ? 'Gratis' : `${price} €/pers.`}
                  </span>
                  <span className="map-popup-meta map-popup-spots">
                    {spotsLeft} plaza{spotsLeft !== 1 ? 's' : ''} libre{spotsLeft !== 1 ? 's' : ''}
                  </span>
                  <button type="button" className="map-popup-join-btn" onClick={() => onJoin(event)}>
                    ¡Me uno!
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Eventos completos — chincheta roja + opción de lista de espera */}
        {(fullEvents ?? []).map((event) => {
          if (!event.lat || !event.lng) return null
          const inWaitlist = waitlistIds?.has(event.id)

          return (
            <Marker key={`full-${event.id}`} position={[event.lat, event.lng]} icon={makeMarkerIcon('#dc2626')}>
              <Popup className="leaflet-custom-popup">
                <div className="map-popup-card">
                  <strong className="map-popup-title">{event.title}</strong>
                  <span className="map-popup-sport">{event.sport} · {event.level}</span>
                  <span className="map-popup-meta">{event.date}</span>
                  <span className="map-popup-meta">{event.distanceKm} km · {event.city}</span>
                  <span className="map-popup-meta map-popup-full">
                    🔴 Completo · {event.currentParticipants}/{event.totalPlaces}
                  </span>
                  {inWaitlist ? (
                    <button
                      type="button"
                      className="map-popup-waitlist-btn map-popup-waitlist-leave"
                      onClick={() => onLeaveWaitlist?.(event.id)}
                    >
                      Salir de la lista de espera
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="map-popup-waitlist-btn"
                      onClick={() => onJoinWaitlist?.(event)}
                    >
                      Apuntarse a lista de espera
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
