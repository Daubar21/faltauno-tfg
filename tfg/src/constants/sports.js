import {
  FaBasketballBall,
  FaBicycle,
  FaFutbol,
  FaGolfBall,
  FaMars,
  FaRunning,
  FaSwimmer,
  FaTableTennis,
  FaVenus,
  FaVenusMars,
  FaVolleyballBall,
} from 'react-icons/fa'
import { FiActivity, FiAward, FiTrendingUp } from 'react-icons/fi'
import { GiTennisRacket } from 'react-icons/gi'

// Mapa de nombre de deporte (igual que en la BD) → componente de icono
// Se usa en las tarjetas de eventos y en los paneles de perfil y amigos
export const sportIcons = {
  'Futbol 7':    FaFutbol,
  'Futbol Sala': FaFutbol,
  'Futbol 11':   FaFutbol,
  Padel:         FaTableTennis,
  Tenis:         GiTennisRacket,
  Baloncesto:    FaBasketballBall,
  Running:       FaRunning,
  'Voley Playa': FaVolleyballBall,
  Golf:          FaGolfBall,
  Natacion:      FaSwimmer,
  Ciclismo:      FaBicycle,
}

// Grupos de deportes para el panel de filtros.
// key → valor guardado en user_preferences.selected_sports
// sports → nombres de deportes de la BD que pertenecen a ese grupo
// (Fútbol agrupa Futbol 7, Futbol Sala y Futbol 11 para simplificar el filtro)
export const FILTER_GROUPS = [
  {
    key: 'Futbol',
    label: 'Fútbol',
    icon: FaFutbol,
    sports: ['Futbol 7', 'Futbol Sala', 'Futbol 11'],
  },
  { key: 'Padel',      label: 'Pádel',      icon: FaTableTennis,   sports: ['Padel'] },
  { key: 'Tenis',      label: 'Tenis',      icon: GiTennisRacket,  sports: ['Tenis'] },
  { key: 'Baloncesto', label: 'Baloncesto', icon: FaBasketballBall, sports: ['Baloncesto'] },
  { key: 'Running',    label: 'Running',    icon: FaRunning,       sports: ['Running'] },
  { key: 'Voley',      label: 'Vóley',      icon: FaVolleyballBall, sports: ['Voley Playa'] },
  { key: 'Golf',       label: 'Golf',       icon: FaGolfBall,      sports: ['Golf'] },
  { key: 'Natacion',   label: 'Natación',   icon: FaSwimmer,       sports: ['Natacion'] },
  { key: 'Ciclismo',   label: 'Ciclismo',   icon: FaBicycle,       sports: ['Ciclismo'] },
]

export const levelIcons = {
  Principiante: FiActivity,
  Intermedio:   FiTrendingUp,
  Avanzado:     FiAward,
}

export const genderIcons = {
  Femenino: FaVenus,
  Masculino: FaMars,
  Mixto:    FaVenusMars,
}

export const levelOptions = Object.keys(levelIcons)
export const genderOptions = Object.keys(genderIcons)

export const participantsPool = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
]

export const welcomeImages = [
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
]
