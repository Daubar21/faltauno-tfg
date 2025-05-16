// Mapa interactivo con Leaflet y marcadores de eventos
// Vista de mapa interactivo (Leaflet) con marcadores de todos los eventos filtrados.
// Al hacer clic en un marcador se muestra un popup con la info del evento y un botón
// para unirse directamente desde el mapa.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiSliders } from 'react-icons/fi'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { getEventPrice } from '../utils/mapDbEvent'

// Al usar Leaflet con Vite (bundler), los iconos por defecto no se resuelven correctamente.
// Esta es la solución estándar: eliminar el método interno y apuntar a las URLs de unpkg.
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

export function MapView({ events, userCoords, onJoin, onToggleFilters, showFilters }) {
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

        {events.map((event) => {
          if (!event.lat || !event.lng) return null
          const price = getEventPrice(event)
          const spotsLeft = event.totalPlaces - event.currentParticipants

          return (
            <Marker key={event.id} position={[event.lat, event.lng]}>
              <Popup className="leaflet-custom-popup">
                <div className="map-popup-card">
                  <strong className="map-popup-title">{event.title}</strong>
                  <span className="map-popup-sport">{event.sport} · {event.level}</span>
                  <span className="map-popup-meta">{event.date}</span>
                  <span className="map-popup-meta">
                    {event.distanceKm} km · {price === 0 ? 'Gratis' : `${price} €/pers.`}
                  </span>
                  <span className="map-popup-meta map-popup-spots">
                    {spotsLeft === 0
                      ? '¡Completo!'
                      : `${spotsLeft} plaza${spotsLeft !== 1 ? 's' : ''} libre${spotsLeft !== 1 ? 's' : ''}`}
                  </span>
                  {spotsLeft > 0 && (
                    <button
                      type="button"
                      className="map-popup-join-btn"
                      onClick={() => onJoin(event)}
                    >
                      ¡Me uno!
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
