// Hook que gestiona la lista de amigos, solicitudes pendientes y búsqueda de usuarios.
// Expone las amistades clasificadas en: aceptadas, recibidas y enviadas.
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  acceptFriendRequest,
  getFriendships,
  removeFriendship,
  searchUsers,
  sendFriendRequest,
} from '../services/friendsService'

export function useFriends(userId) {
  const [friendships, setFriendships] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!userId) return
    setLoading(true)
    try {
      const { data } = await getFriendships(userId)
      setFriendships(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function search(query) {
    if (!query.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      const { data } = await searchUsers(query.trim())
      setSearchResults(data ?? [])
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setSearchResults([])
  }

  async function sendRequest(addresseeId, displayName) {
    const { error } = await sendFriendRequest(userId, addresseeId)
    if (error) {
      toast.error('No se pudo enviar la solicitud. Inténtalo de nuevo.')
      return
    }
    toast.success(displayName ? `Solicitud enviada a ${displayName}` : 'Solicitud de amistad enviada')
    await load()
  }

  async function accept(friendshipId) {
    const { error } = await acceptFriendRequest(friendshipId)
    if (!error) {
      setFriendships((prev) =>
        prev.map((f) => (f.id === friendshipId ? { ...f, status: 'accepted' } : f))
      )
    }
    return !error
  }

  async function remove(friendshipId) {
    const { error } = await removeFriendship(friendshipId)
    if (!error) {
      setFriendships((prev) => prev.filter((f) => f.id !== friendshipId))
    }
    return !error
  }

  const accepted = friendships.filter((f) => f.status === 'accepted')
  const incoming = friendships.filter((f) => f.status === 'pending' && !f.isRequester)
  const outgoing = friendships.filter((f) => f.status === 'pending' && f.isRequester)

  // IDs con los que ya existe alguna relación (para no mostrarlos en resultados de búsqueda)
  const knownIds = new Set(friendships.map((f) => (f.isRequester ? f.addressee_id : f.requester_id)))

  return {
    friendships,
    accepted,
    incoming,
    outgoing,
    knownIds,
    searchResults,
    searching,
    loading,
    load,
    search,
    clearSearch,
    sendRequest,
    accept,
    remove,
  }
}
