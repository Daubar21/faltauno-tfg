// Sistema de valoraciones de eventos completados
// Servicio de valoraciones — guarda y recupera las puntuaciones que los usuarios
// dejan en los eventos que han completado. Usa upsert para evitar duplicados.
import { supabase } from '../lib/supabase'

export async function submitRating(userId, eventId, rating, comment) {
  const { error } = await supabase
    .from('event_ratings')
    .upsert(
      { user_id: userId, event_id: eventId, rating, comment: comment || null },
      { onConflict: 'user_id,event_id' }
    )
  if (error) throw error
}

export function fetchUserRatings(userId) {
  return supabase
    .from('event_ratings')
    .select('*, events(*, sports(name, base_price))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}
