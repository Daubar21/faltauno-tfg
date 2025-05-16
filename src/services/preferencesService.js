// Servicio para persistir preferencias de filtro del usuario
// Servicio de preferencias — guarda y recupera los filtros del usuario en Supabase.
// Al usar upsert, se crea el registro si no existe y se actualiza si ya existe.
import { supabase } from '../lib/supabase'

export function fetchPreferences(userId) {
  return supabase.from('user_preferences').select('*').eq('user_id', userId).single()
}

export function savePreferences(userId, prefs) {
  return supabase.from('user_preferences').upsert({
    user_id: userId,
    max_distance_km: prefs.maxDistance,
    max_price: prefs.maxPrice,
    max_days: prefs.maxDays,
    selected_sports: prefs.selectedSports,
    selected_levels: prefs.selectedLevels,
    notif_reminders: prefs.notifReminders,
    notif_status_updates: prefs.notifStatusUpdates,
    notif_new_events: prefs.notifNewEvents,
    updated_at: new Date().toISOString(),
  })
}
