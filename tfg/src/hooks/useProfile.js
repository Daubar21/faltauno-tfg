// Hook que gestiona el perfil del usuario (nombre, ciudad, bio, avatar, etc.).
// Separa la carga y el guardado de datos para mantener SwipePage más limpio.
import { useState } from 'react'
import { fetchProfile, updateProfile, uploadAvatar } from '../services/profileService'

const INITIAL_PROFILE = {
  displayName: '',
  username: '',
  city: '',
  bio: '',
  avatarUrl: '',
  age: '',
  gender: '',
  completedCount: 0,
  currentStreak: 0,
  showEventsToFriends: true,
}

export function useProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE)

  async function load(userId) {
    const { data } = await fetchProfile(userId)
    if (data) {
      setProfile({
        displayName: data.display_name ?? '',
        username: data.username ?? '',
        city: data.city ?? '',
        bio: data.bio ?? '',
        avatarUrl: data.avatar_url ?? '',
        age: data.age ?? '',
        gender: data.gender ?? '',
        completedCount: data.completed_count ?? 0,
        currentStreak: data.current_streak ?? 0,
        showEventsToFriends: data.show_events_to_friends ?? true,
      })
    }
  }

  async function save(userId, avatarFile = null) {
    const usernameVal = profile.username || null
    const fields = {
      display_name: usernameVal,
      username: usernameVal,
      city: profile.city,
      bio: profile.bio,
      avatar_url: profile.avatarUrl || null,
      age: profile.age ? Number(profile.age) : null,
      gender: profile.gender || null,
      show_events_to_friends: profile.showEventsToFriends,
    }

    if (avatarFile) {
      const url = await uploadAvatar(userId, avatarFile)
      fields.avatar_url = url
      setProfile((prev) => ({ ...prev, avatarUrl: url }))
    }

    await updateProfile(userId, fields)
    setProfile((prev) => ({ ...prev, displayName: usernameVal ?? prev.displayName }))
  }


  return { profile, setProfile, load, save }
}
