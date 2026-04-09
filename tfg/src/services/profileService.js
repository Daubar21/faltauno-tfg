import { supabase } from '../lib/supabase'

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export function fetchProfile(userId) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

export function updateProfile(userId, fields) {
  return supabase
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
}

export function fetchFavoriteSports(userId) {
  return supabase
    .from('user_favorite_sports')
    .select('sports(name)')
    .eq('user_id', userId)
}

export async function replaceFavoriteSports(userId, sportNames) {
  await supabase.from('user_favorite_sports').delete().eq('user_id', userId)
  if (!sportNames.length) return

  const { data: rows } = await supabase
    .from('sports')
    .select('id, name')
    .in('name', sportNames)

  if (rows?.length) {
    await supabase
      .from('user_favorite_sports')
      .insert(rows.map((s) => ({ user_id: userId, sport_id: s.id })))
  }
}
