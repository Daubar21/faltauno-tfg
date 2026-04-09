import { supabase } from '../lib/supabase'

export function fetchEvents() {
  return supabase
    .from('events')
    .select('*, sports(name, base_price)')
    .neq('status', 'cancelled')
}

export function fetchJoinedEvents(userId) {
  return supabase
    .from('event_participants')
    .select('*, events(*, sports(name, base_price))')
    .eq('user_id', userId)
    .eq('status', 'active')
}

export function joinEvent(userId, eventId) {
  return supabase
    .from('event_participants')
    .upsert({ event_id: eventId, user_id: userId, status: 'active' })
}
