// Transforma un evento de la base de datos (snake_case) al formato que usan
// los componentes (camelCase), calcula la distancia al usuario y formatea la fecha.
import { haversineKm, MADRID_LAT, MADRID_LNG } from './haversine'
import { formatEventDate } from './formatDate'
import { getFirstSportImage } from '../constants/eventImages'

export function mapDbEvent(row, userLat = MADRID_LAT, userLng = MADRID_LNG) {
  if (!row) return null
  const lat = Number(row.lat)
  const lng = Number(row.lng)
  return {
    id: row.id,
    sport: row.sports?.name ?? '',
    sportBasePrice: Number(row.sports?.base_price) || 0,
    title: row.title,
    eventDate: row.event_date ?? '',
    eventTime: row.event_time ?? null,
    date: formatEventDate(row.event_date, row.event_time),
    city: row.city,
    address: row.address,
    lat,
    lng,
    distanceKm: haversineKm(userLat, userLng, lat, lng),
    level: row.level,
    minAge: row.min_age,
    maxAge: row.max_age,
    gender: row.gender,
    totalPlaces: row.total_places,
    currentParticipants: row.current_participants,
    status: row.status,
    directions: row.directions ?? '',
    image: row.image_url || getFirstSportImage(row.sports?.name),
  }
}

// Calcula el precio estimado por persona. Eventos con menos plazas (más exclusivos)
// tienen un pequeño recargo sobre el precio base del deporte (máximo 10 €).
export function getEventPrice(event) {
  const base = event.sportBasePrice ?? 4
  const groupFactor = Math.max(0, 10 - event.totalPlaces) * 0.35
  return Math.round(Math.min(10, Math.max(0, base + groupFactor)) * 10) / 10
}
