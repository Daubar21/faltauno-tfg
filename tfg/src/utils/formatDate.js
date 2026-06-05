// Formatea fechas de eventos en formato legible en español.
// Ejemplo de salida: "Sábado 14/06 18:30" o "Sábado 14/06" si no hay hora.
// Se añade 'T00:00:00' al string de fecha para evitar desfases por zona horaria.
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function formatEventDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const dayName = DAYS[d.getDay()]
  const day   = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const time  = timeStr ? timeStr.substring(0, 5) : ''
  return time
    ? `${dayName} ${day}/${month} ${time}`
    : `${dayName} ${day}/${month}`
}
