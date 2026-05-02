// Servicio de amistades y sistema social
// Servicio de amistades y sistema social
// Servicio social — gestiona amistades entre usuarios y consulta
// los próximos eventos de un amigo para mostrarlos en el panel social.
import { supabase } from '../lib/supabase'

export function searchUsers(query) {
  return supabase
    .from('profiles')
    .select('id, display_name, avatar_url, completed_count, current_streak')
    .ilike('display_name', `%${query}%`)
    .limit(20)
}

export async function getFriendships(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, status, requester_id, addressee_id, created_at')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (error || !data?.length) return { data: [], error }

  const friendIds = [...new Set(
    data.map((f) => f.requester_id === userId ? f.addressee_id : f.requester_id)
  )]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, completed_count, current_streak')
    .in('id', friendIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const enriched = data.map((f) => {
    const friendId = f.requester_id === userId ? f.addressee_id : f.requester_id
    return { ...f, friend: profileMap[friendId] ?? null, isRequester: f.requester_id === userId }
  })

  return { data: enriched, error: null }
}

export function sendFriendRequest(requesterId, addresseeId) {
  return supabase
    .from('friendships')
    .insert({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
}

export function acceptFriendRequest(friendshipId) {
  return supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
}

export function removeFriendship(friendshipId) {
  return supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
}

export async function fetchFriendUpcomingEvents(friendUserId) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('event_participants')
    .select('events(id, title, event_date, sports(name))')
    .eq('user_id', friendUserId)
    .eq('status', 'active')

  if (error) return { data: [], error }

  const upcoming = (data ?? [])
    .filter((p) => p.events && p.events.event_date >= today)
    .map((p) => p.events)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 5)

  return { data: upcoming, error: null }
}
