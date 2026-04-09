import { useState } from 'react'
import { fetchPreferences, savePreferences } from '../services/preferencesService'

export const DEFAULT_PREFS = {
  userAge: 27,
  maxDistance: 15,
  maxPrice: 10,
  selectedSports: [],
  selectedLevels: [],
  selectedGenders: [],
  notifReminders: true,
  notifStatusUpdates: true,
  notifNewEvents: false,
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)

  async function load(userId) {
    const { data } = await fetchPreferences(userId)
    if (data) {
      setPrefs({
        userAge: data.user_age ?? 27,
        maxDistance: data.max_distance_km ?? 15,
        maxPrice: Number(data.max_price) || 10,
        selectedSports: data.selected_sports ?? [],
        selectedLevels: data.selected_levels ?? [],
        selectedGenders: data.selected_genders ?? [],
        notifReminders: data.notif_reminders ?? true,
        notifStatusUpdates: data.notif_status_updates ?? true,
        notifNewEvents: data.notif_new_events ?? false,
      })
    }
  }

  async function save(userId) {
    await savePreferences(userId, prefs)
  }

  function updatePref(field, value) {
    setPrefs((prev) => ({ ...prev, [field]: value }))
  }

  function reset() {
    setPrefs(DEFAULT_PREFS)
  }

  return { prefs, setPrefs, updatePref, reset, load, save }
}
