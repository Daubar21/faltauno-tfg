// Utilidades: formula de Haversine y formateo de fechas
// Fórmula de Haversine — calcula la distancia en kilómetros entre dos puntos
// geográficos dados en latitud/longitud. Se usa para mostrar "a X km de ti"
// en cada tarjeta de evento.
// Madrid se usa como ubicación por defecto cuando el usuario no comparte su GPS.
export const MADRID_LAT = 40.4168
export const MADRID_LNG = -3.7038

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}
