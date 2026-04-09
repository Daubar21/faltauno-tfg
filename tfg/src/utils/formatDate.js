const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function formatEventDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const time = timeStr ? timeStr.substring(0, 5) : ''
  return time ? `${DAYS[d.getDay()]} ${time}` : DAYS[d.getDay()]
}
