// Notificaciones push y lógica de estado temporal de eventos.
// - useNotifications: lanza una notificación del navegador cuando un evento
//   empieza en menos de 24 horas (solo una vez por evento y día).
// - getEventTimingStatus: clasifica un evento según su proximidad temporal
//   para mostrar badges ("¡Ahora!", "¡Pronto!", "Terminado!", etc.).
import { useEffect } from 'react'

// Construye el objeto Date del inicio del evento a partir de eventDate y eventTime
function parseEventDt(event) {
  if (!event.eventDate) return null
  const time = event.eventTime ? event.eventTime.slice(0, 5) : '00:00'
  return new Date(`${event.eventDate}T${time}:00`)
}

export function useNotifications(joinedEvents, enabled = true) {
  useEffect(() => {
    if (!enabled || !joinedEvents.length) return
    const now = new Date()
    joinedEvents.forEach((event) => {
      const dt = parseEventDt(event)
      if (!dt) return
      const hoursUntil = (dt - now) / (1000 * 60 * 60)
      if (hoursUntil <= 0 || hoursUntil > 24) return
      // Guardamos en localStorage que ya enviamos la notificación hoy para no repetirla
      const key = `notif_${event.id}_${now.toDateString()}`
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, '1')
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`¡${event.sport} muy pronto!`, {
          body: `Tu evento "${event.title}" empieza en menos de 24 horas.`,
          icon: '/favicon.ico',
        })
      }
    })
  }, [joinedEvents, enabled])
}

// Devuelve uno de los siguientes estados según el tiempo hasta el evento:
//   'upcoming'            — evento en el futuro (estado por defecto)
//   'soon'                — empieza en menos de 24 h
//   'imminent'            — empieza en menos de 3 h (y el evento está lleno)
//   'warning_no_quorum'   — empieza en menos de 30 min pero NO está lleno (puede cancelarse)
//   'past'                — empezó hace menos de 2 h (en curso)
//   'ratable'             — empezó hace 2+ h y estaba lleno → pedir valoración
//   'cancelled_no_quorum' — empezó hace 2+ h y NO estaba lleno → no se realizó
export function getEventTimingStatus(event) {
  const dt = parseEventDt(event)
  if (!dt) return 'upcoming'
  const now = new Date()
  const diffMs  = dt - now
  const diffMin = diffMs / (1000 * 60)
  const diffH   = diffMs / (1000 * 60 * 60)

  if (diffMs < 0) {
    const hoursPast = -diffH
    if (hoursPast >= 2) {
      return event.status === 'full' ? 'ratable' : 'cancelled_no_quorum'
    }
    return 'past'
  }

  if (diffMin <= 30 && event.status !== 'full') return 'warning_no_quorum'
  if (diffH <= 3)  return 'imminent'
  if (diffH <= 24) return 'soon'
  return 'upcoming'
}

export function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
