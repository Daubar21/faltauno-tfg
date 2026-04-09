import { haversineKm, MADRID_LAT, MADRID_LNG } from './haversine'
import { formatEventDate } from './formatDate'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1000&q=80'

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
    image: row.image_url ?? DEFAULT_IMAGE,
  }
}

export function getEventPrice(event) {
  const base = event.sportBasePrice ?? 4
  const groupFactor = Math.max(0, 10 - event.totalPlaces) * 0.35
  return Math.round(Math.min(10, Math.max(0, base + groupFactor)) * 10) / 10
}
