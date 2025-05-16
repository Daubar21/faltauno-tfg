// Hook para gestionar el perfil del usuario
// Hook que gestiona el perfil del usuario (nombre, ciudad, bio, avatar, etc.).
// Separa la carga y el guardado de datos para mantener SwipePage más limpio.
import { useState } from 'react'
import { fetchProfile, updateProfile, uploadAvatar } from '../services/profileService'

const INITIAL_PROFILE = {
  displayName: '',
  city: '',
  bio: '',
  avatarUrl: '',
  age: '',
  gender: '',
  completedCount: 0,
  currentStreak: 0,
}

export function useProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE)

  async function load(userId) {
    const { data } = await fetchProfile(userId)
    if (data) {
      setProfile({
        displayName: data.display_name ?? '',
        city: data.city ?? '',
        bio: data.bio ?? '',
        avatarUrl: data.avatar_url ?? '',
        age: data.age ?? '',
        gender: data.gender ?? '',
        completedCount: data.completed_count ?? 0,
        currentStreak: data.current_streak ?? 0,
      })
    }
  }

  async function save(userId, avatarFile = null) {
    const fields = {
      display_name: profile.displayName,
      city: profile.city,
      bio: profile.bio,
      avatar_url: profile.avatarUrl || null,
      age: profile.age ? Number(profile.age) : null,
      gender: profile.gender || null,
    }

    if (avatarFile) {
      const url = await uploadAvatar(userId, avatarFile)
      fields.avatar_url = url
      setProfile((prev) => ({ ...prev, avatarUrl: url }))
    }

    await updateProfile(userId, fields)
  }

  return { profile, setProfile, load, save }
}
