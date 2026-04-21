// Servicio de administracion: gestion de eventos y usuarios
// Servicio de administracion: gestion de eventos y usuarios
// Servicio de administración — operaciones exclusivas del panel de admin.
// Incluye estadísticas globales, moderación de eventos y gestión de usuarios.
import { supabase } from '../lib/supabase'

// ── Estadísticas ───────────────────────────────────────────────────────────

export async function fetchAdminStats() {
  const [
    { count: totalEvents },
    { count: totalUsers },
    { data: byStatus },
    { data: bySport },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('status'),
    supabase.from('events').select('sports(name)'),
  ])

  const statusCounts = { open: 0, full: 0, cancelled: 0, pending: 0 }
  byStatus?.forEach((e) => {
    if (e.status in statusCounts) statusCounts[e.status]++
  })

  const sportCounts = {}
  bySport?.forEach((e) => {
    const name = e.sports?.name
    if (name) sportCounts[name] = (sportCounts[name] ?? 0) + 1
  })

  return { totalEvents: totalEvents ?? 0, totalUsers: totalUsers ?? 0, statusCounts, sportCounts }
}

// ── Eventos pendientes de aprobación ──────────────────────────────────────

export function fetchPendingEvents() {
  return supabase
    .from('events')
    .select('*, sports(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
}

export function approveEvent(id) {
  return supabase.from('events').update({ status: 'open' }).eq('id', id)
}

export function rejectEvent(id) {
  return supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
}

// ── Deportes ───────────────────────────────────────────────────────────────

export function fetchSports() {
  return supabase.from('sports').select('id, name, base_price').order('name')
}

// ── Gestión de eventos ─────────────────────────────────────────────────────

export function fetchAllEventsAdmin() {
  return supabase
    .from('events')
    .select('*, sports(name)')
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
}

export function createEventAdmin(userId, fields) {
  return supabase.from('events').insert({ ...fields, created_by: userId, status: 'open' })
}

export function updateEventAdmin(id, fields) {
  return supabase.from('events').update(fields).eq('id', id)
}

export function cancelEventAdmin(id) {
  return supabase.from('events').update({ status: 'cancelled' }).eq('id', id)
}

export function deleteEventAdmin(id) {
  return supabase.from('events').delete().eq('id', id)
}

// ── Gestión de usuarios ────────────────────────────────────────────────────

export function fetchAllUsers() {
  return supabase
    .from('profiles')
    .select('id, display_name, city, role, created_at, avatar_url')
    .order('created_at', { ascending: false })
}

export function setUserRole(userId, role) {
  return supabase.from('profiles').update({ role }).eq('id', userId)
}
