import { supabase } from '../lib/supabase'

export function fetchPreferences(userId) {
  return supabase.from('user_preferences').select('*').eq('user_id', userId).single()
}

export function savePreferences(userId, prefs) {
  return supabase.from('user_preferences').upsert({
    user_id: userId,
    user_age: prefs.userAge,
    max_distance_km: prefs.maxDistance,
    max_price: prefs.maxPrice,
    selected_sports: prefs.selectedSports,
    selected_levels: prefs.selectedLevels,
    selected_genders: prefs.selectedGenders,
    notif_reminders: prefs.notifReminders,
    notif_status_updates: prefs.notifStatusUpdates,
    notif_new_events: prefs.notifNewEvents,
    updated_at: new Date().toISOString(),
  })
}
