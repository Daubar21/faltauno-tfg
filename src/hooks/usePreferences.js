// Hook que gestiona las preferencias de filtrado del usuario.
// Se cargan desde Supabase al iniciar la sesión y se guardan al cerrar el panel.
import { useState } from 'react'
import { fetchPreferences, savePreferences } from '../services/preferencesService'

// Valores por defecto usados cuando el usuario no ha guardado preferencias aún
export const DEFAULT_PREFS = {
  maxDistance: 30,
  maxPrice: 10,
  maxDays: 30,
  selectedSports: [],
  selectedLevels: [],
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)

  async function load(userId) {
    const { data } = await fetchPreferences(userId)
    if (data) {
      setPrefs({
        maxDistance: data.max_distance_km ?? 30,
        maxPrice: Number(data.max_price) || 10,
        maxDays: data.max_days ?? 30,
        selectedSports: data.selected_sports ?? [],
        selectedLevels: data.selected_levels ?? [],
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
