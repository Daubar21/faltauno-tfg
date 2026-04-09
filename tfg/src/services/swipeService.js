import { supabase } from '../lib/supabase'

export function fetchSwipeHistory(userId) {
  return supabase.from('swipe_history').select('event_id').eq('user_id', userId)
}

export function recordSwipe(userId, eventId, direction) {
  return supabase
    .from('swipe_history')
    .upsert({ user_id: userId, event_id: eventId, direction })
}
