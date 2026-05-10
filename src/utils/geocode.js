// Funciones de geocodificación usando la API gratuita de Nominatim (OpenStreetMap).
// - geocodeAddress: convierte texto de dirección en coordenadas lat/lng
// - reverseGeocode: convierte coordenadas en nombre de dirección legible
// Se restringe la búsqueda a España (countrycodes=es) y se responden en español.
const BASE = 'https://nominatim.openstreetmap.org'
const HEADERS = { 'Accept-Language': 'es', 'User-Agent': 'FaltaUnoApp/1.0 (TFG)' }

export async function geocodeAddress(query) {
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=es`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error('Error de red al buscar la dirección')
  const data = await res.json()
  if (!data.length) return null
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  }
}

export async function reverseGeocode(lat, lng) {
  const url = `${BASE}/reverse?lat=${lat}&lon=${lng}&format=json`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error('Error de red al obtener la dirección')
  const data = await res.json()
  if (data.error) return null
  // Se intentan múltiples campos de la respuesta para encontrar ciudad y calle,
  // ya que Nominatim puede devolver nombres distintos según el tipo de zona
  return {
    displayName: data.display_name,
    city:
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.county ??
      '',
    road:
      data.address?.road ??
      data.address?.pedestrian ??
      data.address?.footway ??
      data.address?.suburb ??
      '',
  }
}
