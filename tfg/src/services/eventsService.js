// Servicio de eventos — todas las operaciones con la tabla events y event_participants.
// Separa la lógica de acceso a Supabase de los componentes React.
import { supabase } from '../lib/supabase'

export function fetchEvents() {
  const today = new Date().toISOString().split('T')[0]
  return supabase
    .from('events')
    .select('*, sports(name, base_price)')
    .in('status', ['open', 'full'])
    .gte('event_date', today)
    .order('event_date', { ascending: true })
}

export async function fetchJoinedEvents(userId) {
  const [participantsResult, ratingsResult] = await Promise.all([
    supabase
      .from('event_participants')
      .select('*, events(*, sports(name, base_price))')
      .eq('user_id', userId)
      .eq('status', 'active'),
    supabase
      .from('event_ratings')
      .select('event_id')
      .eq('user_id', userId),
  ])
  const ratedIds = new Set((ratingsResult.data ?? []).map((r) => r.event_id))
  const data = (participantsResult.data ?? []).filter((p) => !ratedIds.has(p.events?.id))
  return { data, error: participantsResult.error }
}

export async function joinEvent(userId, eventId) {
  const { error } = await supabase
    .from('event_participants')
    .upsert(
      { event_id: eventId, user_id: userId, status: 'active' },
      { onConflict: 'event_id,user_id' }
    )
  if (error) throw error
}

export function cancelParticipation(userId, eventId) {
  return supabase
    .from('event_participants')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('event_id', eventId)
}

export async function joinWaitlist(userId, eventId) {
  const { data, error } = await supabase
    .from('event_waitlist')
    .insert({ event_id: eventId, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function leaveWaitlist(userId, eventId) {
  const { error } = await supabase
    .from('event_waitlist')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)
  if (error) throw error
}

export async function fetchWaitlistEvents(userId) {
  return supabase
    .from('event_waitlist')
    .select('id, created_at, events(*, sports(name, base_price))')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
}

export async function promoteFromWaitlist(eventId) {
  const { data: entries } = await supabase
    .from('event_waitlist')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (!entries?.length) return false

  const entry = entries[0]
  await supabase
    .from('event_participants')
    .upsert(
      { event_id: eventId, user_id: entry.user_id, status: 'active' },
      { onConflict: 'event_id,user_id' }
    )
  await supabase
    .from('event_waitlist')
    .delete()
    .eq('id', entry.id)

  return true
}

export async function createUserEvent(eventData) {
  const { data: sportRow, error: sportErr } = await supabase
    .from('sports')
    .select('id')
    .eq('name', eventData.sportName)
    .single()
  if (sportErr || !sportRow) throw new Error(`Deporte no encontrado: ${eventData.sportName}`)

  const { data, error } = await supabase
    .from('events')
    .insert({
      sport_id: sportRow.id,
      created_by: eventData.createdBy ?? null,
      title: eventData.title,
      event_date: eventData.eventDate,
      event_time: eventData.eventTime || null,
      city: eventData.city,
      address: eventData.address,
      lat: Number(eventData.lat),
      lng: Number(eventData.lng),
      level: eventData.level,
      gender: eventData.gender,
      min_age: Number(eventData.minAge),
      max_age: Number(eventData.maxAge),
      total_places: Number(eventData.totalPlaces),
      current_participants: 0,
      status: eventData.status ?? 'pending',
      directions: eventData.directions || null,
      image_url: eventData.imageUrl || null,
    })
    .select('*, sports(name, base_price)')
    .single()
  if (error) throw error
  return data
}
