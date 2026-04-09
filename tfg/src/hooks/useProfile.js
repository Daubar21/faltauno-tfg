import { useState } from 'react'
import {
  fetchProfile,
  fetchFavoriteSports,
  updateProfile,
  replaceFavoriteSports,
  uploadAvatar,
} from '../services/profileService'

const INITIAL_PROFILE = {
  displayName: '',
  city: '',
  bio: '',
  avatarUrl: '',
  favoriteSports: [],
}

export function useProfile() {
  const [profile, setProfile] = useState(INITIAL_PROFILE)

  async function load(userId) {
    const [{ data }, { data: favData }] = await Promise.all([
      fetchProfile(userId),
      fetchFavoriteSports(userId),
    ])
    if (data) {
      setProfile({
        displayName: data.display_name ?? '',
        city: data.city ?? '',
        bio: data.bio ?? '',
        avatarUrl: data.avatar_url ?? '',
        favoriteSports: favData?.map((f) => f.sports?.name).filter(Boolean) ?? [],
      })
    }
  }

  // avatarFile es opcional: el File seleccionado por el usuario
  async function save(userId, avatarFile = null) {
    const fields = {
      display_name: profile.displayName,
      city: profile.city,
      bio: profile.bio,
    }

    if (avatarFile) {
      const url = await uploadAvatar(userId, avatarFile)
      fields.avatar_url = url
      // Actualiza también el estado local para reflejo inmediato
      setProfile((prev) => ({ ...prev, avatarUrl: url }))
    }

    await Promise.all([
      updateProfile(userId, fields),
      replaceFavoriteSports(userId, profile.favoriteSports),
    ])
  }

  return { profile, setProfile, load, save }
}
