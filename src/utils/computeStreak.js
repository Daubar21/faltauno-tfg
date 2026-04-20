// Sistema de niveles y racha de participación.
// - getLevel / getPoints: calculan el nivel (Bronce → Platino) y los puntos
//   a partir del número de eventos completados.
// - computeStreak: devuelve las semanas consecutivas con al menos un evento valorado.

// Tabla de niveles: un usuario sube de nivel al completar más eventos
export const LEVELS = [
  { label: 'Bronce',  min: 0,  color: '#cd7f32', bg: '#fdf2e6' },
  { label: 'Plata',   min: 5,  color: '#7d8590', bg: '#f0f1f3' },
  { label: 'Oro',     min: 15, color: '#b8860b', bg: '#fefae0' },
  { label: 'Platino', min: 30, color: '#0891b2', bg: '#ecfeff' },
]

export function getLevel(completedCount) {
  // Recorremos de mayor a menor para devolver el nivel más alto que se cumple
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (completedCount >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

// Cada evento completado vale 10 puntos
export function getPoints(completedCount) {
  return completedCount * 10
}

// Devuelve el timestamp del lunes (00:00:00 local) de la semana que contiene `date`
function weekStart(date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function computeStreak(completedEvents) {
  if (!completedEvents.length) return 0

  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000
  const currentWeek = weekStart(new Date())

  // Obtenemos el conjunto de semanas distintas en que el usuario completó algo
  const weeks = new Set(
    completedEvents.map((ev) => weekStart(new Date(ev.ratedAt || ev.eventDate || ev.date || Date.now())))
  )

  const sorted = [...weeks].sort((a, b) => b - a)

  // La racha solo cuenta si el último evento fue esta semana o la anterior
  if (sorted[0] < currentWeek - ONE_WEEK) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === ONE_WEEK) {
      streak++
    } else {
      break
    }
  }
  return streak
}
