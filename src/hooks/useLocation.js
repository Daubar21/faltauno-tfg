// Hook de geolocalizacion con fallback a Madrid
// Hook de geolocalizacion con fallback a Madrid
// Hook que obtiene la ubicación GPS del usuario al montar el componente.
// Mientras espera la respuesta del navegador, status es 'requesting' y se
// muestran coordenadas de Madrid como valor inicial.
// Si el usuario deniega el permiso, status pasa a 'denied' y se mantiene Madrid.
import { useEffect, useState } from 'react'
import { MADRID_LAT, MADRID_LNG } from '../utils/haversine'

export function useLocation() {
  const [coords, setCoords] = useState({ lat: MADRID_LAT, lng: MADRID_LNG })
  const [status, setStatus] = useState(
    typeof navigator !== 'undefined' && !navigator.geolocation ? 'denied' : 'requesting'
  )

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (status === 'denied') return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      () => setStatus('denied'),
      // timeout: tiempo máximo de espera; maximumAge: acepta posición cacheada de hasta 5 min
      { timeout: 6000, maximumAge: 300000 }
    )
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps */

  return { coords, status }
}
