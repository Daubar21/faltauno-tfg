# FaltaUno — Especificaciones Completas del Proyecto
## TFG · Desarrollo de Aplicaciones Web · 2º DAWE

---

## 1. DESCRIPCIÓN GENERAL

**FaltaUno** es una aplicación web progresiva (SPA) orientada a la búsqueda y unión a eventos deportivos locales, con una interfaz de swipe de tarjetas inspirada en Tinder. La premisa es sencilla: el usuario ve tarjetas de eventos deportivos cercanos y hace swipe a la derecha para apuntarse o a la izquierda para pasar. El nombre hace referencia a la expresión habitual en el deporte amateur: "falta uno".

### Problema que resuelve
Organizar y encontrar partidos o quedadas deportivas informales (pádel, fútbol, baloncesto, etc.) es tedioso: grupos de WhatsApp desorganizados, aplicaciones complejas o falta de descubrimiento de actividades cercanas. FaltaUno centraliza esto en una experiencia rápida, visual y filtrable.

### Público objetivo
Personas de 16 a 70 años con afición por el deporte amateur que buscan encontrar planes deportivos cercanos de forma ágil.

---

## 2. TECNOLOGÍAS UTILIZADAS

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework principal de UI (componentes funcionales + hooks) |
| Vite | 6 | Bundler / dev server |
| JavaScript (ES2023) | — | Lenguaje principal (sin TypeScript) |
| react-icons | 5 | Iconografía (FaFutbol, FiCalendar, GiTennisRacket, etc.) |
| react-toastify | 10 | Notificaciones toast (éxito, error, info) |
| Leaflet / react-leaflet | — | Mapa interactivo con marcadores de eventos (`MapView`) |
| CSS puro | — | Estilos globales en App.css (sin Tailwind ni CSS modules) |

### Backend / BaaS
| Tecnología | Uso |
|---|---|
| Supabase | Backend completo: Auth, PostgreSQL, Storage, RLS |
| PostgreSQL 15 | Base de datos relacional |
| Supabase Auth | Autenticación por email/password con JWT |
| Supabase Storage | Almacenamiento de avatares de usuario (bucket `avatars`) |
| Supabase JS SDK v2 | Cliente en el frontend (`@supabase/supabase-js`) |
| Nominatim (OpenStreetMap) | Geocodificación gratuita: dirección → lat/lng y viceversa |

### Hosting / Entorno
- Desarrollo local con `npm run dev` (Vite dev server, hot module replacement)
- Variables de entorno: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env`
- Proyecto Supabase: `gislxtpxybrryswbwoub.supabase.co`

---

## 3. ARQUITECTURA GENERAL

La aplicación sigue el patrón **SPA con BaaS**:

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (SPA)                         │
│                                                             │
│  React App (Vite)                                           │
│  ├── Pages        (AuthPage, SwipePage, AdminPage)          │
│  ├── Components   (EventCard, Topbar, Panels, Modals…)      │
│  ├── Hooks        (useEvents, useAuth, useProfile,          │
│  │                 useFriends, useCompletedEvents…)         │
│  ├── Services     (eventsService, friendsService,           │
│  │                 ratingsService, adminService…)           │
│  └── Utils        (mapDbEvent, haversine, geocode,          │
│                    computeStreak, formatDate)               │
│                                                             │
│                    ↕ HTTPS / REST / WS                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (BaaS)                           │
│                                                             │
│  ├── Auth          (JWT, email+password)                     │
│  ├── PostgreSQL    (tablas, triggers, funciones)             │
│  ├── Row Level Security (RLS)                               │
│  └── Storage       (bucket: avatars)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 SERVICIOS EXTERNOS                           │
│  └── Nominatim (nominatim.openstreetmap.org)                │
│      Geocodificación gratuita restringida a España          │
└─────────────────────────────────────────────────────────────┘
```

No existe un servidor backend propio: toda la lógica de negocio está en:
1. Funciones PL/pgSQL en PostgreSQL (triggers, `get_filtered_events`, `calculate_event_price`)
2. RLS policies para seguridad a nivel de fila
3. Hooks de React en el frontend para lógica de UI

---

## 4. ESTRUCTURA DE FICHEROS

```
FaltaUno/tfg/
├── index.html                    # Punto de entrada HTML
├── vite.config.js                # Configuración de Vite (solo plugin react)
├── package.json                  # Dependencias npm
├── .env                          # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
│
├── supabase/
│   ├── schema.sql                # Esquema completo inicial (tablas, RLS, seed)
│   ├── admin_setup.sql           # Configuración de rol admin en profiles
│   ├── create_admin_user.sql     # Script para crear usuario admin manualmente
│   └── migrations/
│       ├── 001_expand_sports_events.sql     # Nuevos deportes + más eventos
│       ├── 002_fix_participant_counter.sql  # Fix trigger current_participants
│       ├── 003_fix_photos_add_events.sql    # Fotos correctas + ~90 eventos
│       ├── 004_social_ratings.sql           # Tablas friendships + event_ratings
│       └── 005_profiles_stats_gender.sql    # Columnas completed_count, current_streak, gender en profiles
│
└── src/
    ├── main.jsx                  # Entry point React (monta AuthProvider + App)
    ├── App.jsx                   # Router lógico: AuthPage / SwipePage / AdminPage
    ├── App.css                   # Todos los estilos globales
    │
    ├── lib/
    │   └── supabase.js           # Singleton del cliente Supabase
    │
    ├── context/
    │   └── AuthContext.jsx       # Contexto global de autenticación + rol admin
    │
    ├── pages/
    │   ├── AuthPage.jsx          # Login / Registro (pantalla de bienvenida)
    │   ├── SwipePage.jsx         # Pantalla principal de swipe con filtros
    │   └── AdminPage.jsx         # Panel de administración (solo admins)
    │
    ├── components/
    │   ├── EventCard.jsx         # Tarjeta de evento con swipe (drag & drop)
    │   ├── Topbar.jsx            # Barra superior con navegación y paneles
    │   ├── FiltersPanel.jsx      # Panel lateral de preferencias/filtros
    │   ├── ProfilePanel.jsx      # Panel de perfil de usuario con estadísticas
    │   ├── JoinedPanel.jsx       # Panel "Mis partidos" (eventos apuntados)
    │   ├── CreateEventPanel.jsx  # Panel para proponer eventos con geocodificación
    │   ├── MapView.jsx           # Vista de mapa Leaflet con marcadores
    │   ├── FriendsPanel.jsx      # Panel social (ranking, amigos, solicitudes, búsqueda)
    │   └── RatingModal.jsx       # Modal de valoración de eventos completados
    │
    ├── hooks/
    │   ├── useEvents.js          # Carga eventos + historial swipe + actualiza contador
    │   ├── useJoinedEvents.js    # Carga y gestiona eventos a los que se ha unido
    │   ├── useCompletedEvents.js # Historial de eventos completados y valorados
    │   ├── useProfile.js         # Carga y guarda perfil de usuario
    │   ├── usePreferences.js     # Gestiona preferencias/filtros del usuario
    │   ├── useSwipe.js           # Estado del índice del deck de swipe
    │   ├── useLocation.js        # Geolocalización del navegador
    │   ├── useFriends.js         # Gestión de amistades, solicitudes y búsqueda
    │   └── useNotifications.js  # Notificaciones push + estados temporales de eventos
    │
    ├── services/
    │   ├── eventsService.js      # fetchEvents, joinEvent, createUserEvent, cancelParticipation
    │   ├── swipeService.js       # fetchSwipeHistory, recordSwipe
    │   ├── profileService.js     # fetchProfile, updateProfile, updateUserStats
    │   ├── preferencesService.js # fetchPreferences, savePreferences
    │   ├── adminService.js       # CRUD eventos, gestión usuarios, stats, moderación
    │   ├── friendsService.js     # CRUD amistades y búsqueda de usuarios
    │   └── ratingsService.js     # submitRating, fetchUserRatings
    │
    ├── utils/
    │   ├── mapDbEvent.js         # Transforma fila DB → objeto de evento para UI
    │   ├── haversine.js          # Fórmula distancia entre coordenadas (km)
    │   ├── formatDate.js         # Formatea fecha+hora de evento en español
    │   ├── geocode.js            # Geocodificación via Nominatim (geocodeAddress, reverseGeocode)
    │   └── computeStreak.js      # Sistema de niveles, puntos y racha semanal
    │
    └── constants/
        ├── sports.js             # Iconos por deporte, grupos filtros, levelIcons, genderIcons
        └── eventImages.js        # URLs de Unsplash por deporte para selector de imagen
```

---

## 5. BASE DE DATOS — ESQUEMA COMPLETO

### 5.1 Tabla: `sports`
Catálogo de deportes disponibles en la plataforma.

| Columna | Tipo | Descripción |
|---|---|---|
| id | SERIAL PK | Identificador autoincremental |
| name | TEXT UNIQUE NOT NULL | Nombre del deporte |
| icon | TEXT NOT NULL | Nombre del icono de react-icons |
| base_price | NUMERIC(4,2) | Precio base para calcular el coste del evento |

**Deportes en producción (11 total):**
- Futbol 7 → base_price: 4.00 €
- Futbol Sala → 3.50 €
- Futbol 11 → 5.00 €
- Padel → 8.00 €
- Tenis → 6.00 €
- Baloncesto → 3.00 €
- Running → 0.00 €
- Voley Playa → 2.00 €
- Natacion → 4.00 €
- Ciclismo → 1.00 €
- Golf → 10.00 €

---

### 5.2 Tabla: `profiles`
Perfil extendido del usuario, vinculado 1:1 con `auth.users` de Supabase.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | FK a auth.users(id), ON DELETE CASCADE |
| display_name | TEXT | Nombre visible del usuario |
| city | TEXT | Ciudad del usuario |
| bio | TEXT | Descripción deportiva personal |
| avatar_url | TEXT | URL de imagen en Supabase Storage |
| age | INTEGER | Edad (CHECK >= 16 AND <= 100) |
| gender | TEXT | Género del usuario: 'Masculino', 'Femenino', 'No especificado' |
| role | TEXT | Rol del usuario: 'user' o 'admin' |
| completed_count | INTEGER | Número de eventos completados y valorados (DEFAULT 0) |
| current_streak | INTEGER | Racha actual en semanas consecutivas con al menos un evento valorado (DEFAULT 0) |
| created_at | TIMESTAMPTZ | Timestamp de creación |
| updated_at | TIMESTAMPTZ | Actualizado automáticamente por trigger |

**Trigger asociado:** `on_auth_user_created` → crea automáticamente un perfil al registrarse un usuario, usando el email como display_name si no hay nombre.

**Nota:** `completed_count` y `current_streak` se actualizan vía `updateUserStats()` cada vez que el usuario valora un evento completado. Se usan para el sistema de puntos y niveles del panel social.

---

### 5.3 Tabla: `user_preferences`
Preferencias de filtros y notificaciones, una fila por usuario.

| Columna | Tipo | Default | Descripción |
|---|---|---|---|
| user_id | UUID PK | — | FK a profiles(id), ON DELETE CASCADE |
| user_age | INTEGER | 27 | Edad del usuario (para filtrar eventos por rango de edad) |
| max_distance_km | INTEGER | 15 | Distancia máxima (1-30 km) |
| max_price | NUMERIC(4,2) | 10.00 | Precio máximo por evento |
| max_days | INTEGER | 30 | Días máximos hasta el evento (0 = solo hoy) |
| selected_sports | TEXT[] | '{}' | Array de claves de grupos de deportes seleccionados |
| selected_levels | TEXT[] | '{}' | Array de niveles (Principiante, Intermedio, Avanzado) |
| selected_genders | TEXT[] | '{}' | Array de géneros (Femenino, Masculino, Mixto) |
| notif_reminders | BOOLEAN | true | Recordatorios de partido |
| notif_status_updates | BOOLEAN | true | Notificaciones de cambios de estado |
| notif_new_events | BOOLEAN | true | Notificaciones de nuevos eventos |
| updated_at | TIMESTAMPTZ | NOW() | Actualizado por trigger |

**Trigger:** `on_profile_created` → crea automáticamente la fila de preferencias al crear un perfil.

---

### 5.4 Tabla: `user_favorite_sports`
Relación many-to-many entre usuarios y sus deportes favoritos.

| Columna | Tipo | Descripción |
|---|---|---|
| user_id | UUID | FK a profiles(id), ON DELETE CASCADE |
| sport_id | INTEGER | FK a sports(id), ON DELETE CASCADE |
| PRIMARY KEY | (user_id, sport_id) | Clave compuesta |

*(Actualmente almacenada en DB pero no utilizada activamente en la UI principal; suplida por `selected_sports` en preferences)*

---

### 5.5 Tabla: `events`
Eventos deportivos publicados en la plataforma. Tabla central.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | uuid_generate_v4() |
| sport_id | INTEGER NOT NULL | FK a sports(id) |
| created_by | UUID | FK a profiles(id), ON DELETE SET NULL (puede ser admin o usuario) |
| title | TEXT NOT NULL | Título del evento |
| event_date | DATE NOT NULL | Fecha del evento |
| event_time | TIME NOT NULL | Hora del evento |
| city | TEXT NOT NULL | Ciudad donde se celebra |
| address | TEXT NOT NULL | Dirección completa |
| lat | NUMERIC(10,7) NOT NULL | Latitud geográfica |
| lng | NUMERIC(10,7) NOT NULL | Longitud geográfica |
| level | TEXT NOT NULL | CHECK IN ('Principiante', 'Intermedio', 'Avanzado') |
| min_age | INTEGER NOT NULL | Edad mínima (CHECK >= 16) |
| max_age | INTEGER NOT NULL | Edad máxima (CHECK <= 100) |
| gender | TEXT NOT NULL | CHECK IN ('Femenino', 'Masculino', 'Mixto') |
| total_places | INTEGER NOT NULL | Plazas totales (CHECK > 0) |
| current_participants | INTEGER NOT NULL | Participantes activos actuales (DEFAULT 0) |
| status | TEXT NOT NULL | CHECK IN ('open', 'full', 'cancelled', **'pending'**), DEFAULT 'open' |
| directions | TEXT | Instrucciones para llegar |
| image_url | TEXT | URL de imagen de cabecera (Unsplash) |
| created_at | TIMESTAMPTZ | Timestamp de creación |
| updated_at | TIMESTAMPTZ | Actualizado por trigger |

**Estado `pending`:** Nuevo estado añadido para eventos propuestos por usuarios no-admin. El evento no se muestra en el deck de swipe hasta que un administrador lo aprueba (cambia a `open`) o lo rechaza (cambia a `cancelled`).

**Constraints adicionales:**
- `max_ge_min_age`: max_age >= min_age
- `participants_le_places`: current_participants <= total_places

**Índices:** sport_id, status, event_date, city, level, gender

---

### 5.6 Tabla: `event_participants`
Relación many-to-many entre usuarios y eventos a los que se han unido.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | uuid_generate_v4() |
| event_id | UUID NOT NULL | FK a events(id), ON DELETE CASCADE |
| user_id | UUID NOT NULL | FK a profiles(id), ON DELETE CASCADE |
| status | TEXT NOT NULL | CHECK IN ('active', 'cancelled'), DEFAULT 'active' |
| joined_at | TIMESTAMPTZ | Timestamp de unión |
| UNIQUE | (event_id, user_id) | Un usuario no puede estar dos veces en el mismo evento |

**Trigger:** `on_participant_change` (AFTER INSERT/UPDATE/DELETE) → ejecuta `sync_event_participants()` que recalcula `current_participants` y actualiza `status` de `events` a 'full' si está lleno.

---

### 5.7 Tabla: `swipe_history`
Registro de todos los swipes realizados por el usuario. Sirve para no volver a mostrar eventos ya vistos.

| Columna | Tipo | Descripción |
|---|---|---|
| user_id | UUID NOT NULL | FK a profiles(id), ON DELETE CASCADE |
| event_id | UUID NOT NULL | FK a events(id), ON DELETE CASCADE |
| direction | TEXT NOT NULL | CHECK IN ('like', 'pass') |
| swiped_at | TIMESTAMPTZ | Timestamp del swipe |
| PRIMARY KEY | (user_id, event_id) | Cada par usuario-evento se registra una vez |

---

### 5.8 Tabla: `friendships` *(nueva)*
Sistema de amistades entre usuarios con flujo de solicitud/aceptación.

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | uuid_generate_v4() |
| requester_id | UUID NOT NULL | FK a profiles(id) — usuario que envía la solicitud |
| addressee_id | UUID NOT NULL | FK a profiles(id) — usuario que recibe la solicitud |
| status | TEXT NOT NULL | CHECK IN ('pending', 'accepted'), DEFAULT 'pending' |
| created_at | TIMESTAMPTZ | Timestamp de creación |
| UNIQUE | (requester_id, addressee_id) | No puede haber duplicados de solicitud |

**Flujo:** solicitud enviada → status='pending' → el destinatario acepta → status='accepted'. Para rechazar o eliminar amistad: DELETE de la fila.

---

### 5.9 Tabla: `event_ratings` *(nueva)*
Valoraciones que los usuarios dejan sobre los eventos que han completado.

| Columna | Tipo | Descripción |
|---|---|---|
| user_id | UUID NOT NULL | FK a profiles(id), ON DELETE CASCADE |
| event_id | UUID NOT NULL | FK a events(id), ON DELETE CASCADE |
| rating | INTEGER NOT NULL | Puntuación de 1 a 5 estrellas |
| comment | TEXT | Comentario opcional |
| created_at | TIMESTAMPTZ | Timestamp de la valoración |
| UNIQUE | (user_id, event_id) | Un usuario solo puede valorar un evento una vez (upsert) |

**Relación con el flujo de completados:** cuando un usuario valora un evento, su participación en `event_participants` pasa a `cancelled` (se retira de "Mis partidos") y la valoración queda guardada en esta tabla. `fetchJoinedEvents` excluye automáticamente los eventos ya valorados.

---

### 5.10 Funciones PL/pgSQL

#### `calculate_event_price(p_sport_id, p_total_places)`
Calcula el precio de un evento según deporte y número de plazas:
```
precio = MIN(10, MAX(0, base_price + MAX(0, 10 - total_places) × 0.35))
```
- Eventos con más plazas son más baratos por persona
- Precio máximo: 10 €
- Running siempre es gratis (base_price = 0)

#### `get_filtered_events(p_user_id, p_user_age, p_max_distance, p_max_price, p_sports, p_levels, p_genders)`
Función de servidor que devuelve eventos filtrados:
- Excluye eventos ya vistos por el usuario (swipe_history)
- Excluye cancelados y pendientes
- Filtra por rango de edad del usuario
- Filtra por precio máximo
- Filtra por deporte, nivel y género (arrays vacíos = sin filtro)
- Solo eventos futuros (event_date >= CURRENT_DATE)
- Calcula `available_spots` y `price` en la consulta

*(Nota: actualmente el frontend usa `fetchEvents()` sin filtros de servidor y aplica los filtros en el cliente. La función `get_filtered_events` existe en el schema pero no está siendo llamada activamente desde el frontend.)*

#### `sync_event_participants()`
Trigger function que sincroniza `current_participants` y actualiza `status` del evento.

#### `update_updated_at()`
Trigger function genérica que actualiza el campo `updated_at` en profiles, user_preferences y events.

#### `handle_new_user()`
Trigger AFTER INSERT on `auth.users` → crea perfil automáticamente.

#### `handle_new_profile()`
Trigger AFTER INSERT on `profiles` → crea fila en `user_preferences` automáticamente.

---

### 5.11 Row Level Security (RLS)

| Tabla | Política | Condición |
|---|---|---|
| profiles | SELECT: público | true |
| profiles | UPDATE: solo propio | auth.uid() = id |
| user_favorite_sports | SELECT/ALL: solo propias | auth.uid() = user_id |
| user_preferences | SELECT/ALL: solo propias | auth.uid() = user_id |
| events | SELECT: autenticados | auth.role() = 'authenticated' |
| events | UPDATE: solo creador | auth.uid() = created_by |
| events | DELETE: solo creador | auth.uid() = created_by |
| events | INSERT: autenticados | auth.uid() = created_by |
| event_participants | SELECT: autenticados | auth.role() = 'authenticated' |
| event_participants | INSERT: solo propio | auth.uid() = user_id |
| event_participants | UPDATE: solo propio | auth.uid() = user_id |
| event_participants | DELETE: solo propio | auth.uid() = user_id |
| swipe_history | SELECT: solo propio | auth.uid() = user_id |
| swipe_history | INSERT: solo propio | auth.uid() = user_id |
| sports | SELECT: todos | true |
| friendships | SELECT/ALL: solo propias | auth.uid() = requester_id OR auth.uid() = addressee_id |
| event_ratings | SELECT/ALL: solo propias | auth.uid() = user_id |

**Nota importante:** El panel de administración utiliza el cliente Supabase con la anon key pero hace operaciones que requieren `created_by = auth.uid()`. Los eventos de seed (sin created_by) son visibles pero no editables desde el frontend de admin por RLS. Las operaciones de admin en el SQL Editor de Supabase bypasan RLS.

---

### 5.12 Storage
- **Bucket:** `avatars` (público)
- Políticas: un usuario solo puede subir/editar/eliminar imágenes en su propia carpeta (`[uid]/avatar`)
- Las imágenes de eventos usan URLs externas de Unsplash (no se almacenan en Supabase)

---

## 6. FLUJO DE AUTENTICACIÓN

1. Usuario accede a la app → `AuthContext` llama a `supabase.auth.onAuthStateChange`
2. Si no hay sesión → renderiza `AuthPage`
3. `AuthPage` ofrece dos modos: Login (`signInWithPassword`) y Registro (`signUp`)
4. Al registrarse se envía opcionalmente el nombre en `raw_user_meta_data`
5. El trigger `on_auth_user_created` crea automáticamente el perfil
6. Al hacer login, `resolveRole()` consulta `profiles.role` para determinar si es admin
7. `AuthContext` expone: `session`, `loading`, `isAdmin`, `signIn`, `signUp`, `signOut`
8. Todo el estado de autenticación se suscribe a `supabase.auth.onAuthStateChange` para actualizarse automáticamente (sin `getSession` duplicado)

**Roles:**
- `user` (default): acceso a la app de swipe
- `admin`: acceso adicional al Panel de Administración y publicación directa de eventos (sin pasar por `pending`)

El campo `role` se añade a la tabla `profiles` mediante script SQL (`admin_setup.sql`).

---

## 7. FLUJO PRINCIPAL: SWIPE DE EVENTOS

### 7.1 Carga de datos
```
SwipePage montado
  → useLocation (solicita geolocalización al navegador)
  → cuando locationStatus ≠ 'requesting':
      → useEvents.load(userId, lat, lng)
          → fetchEvents() → SELECT * FROM events JOIN sports WHERE status IN ('open','full')
          → fetchSwipeHistory(userId) → SELECT event_id FROM swipe_history WHERE user_id = ?
          → mapDbEvent(row, userLat, userLng) → transforma cada fila al objeto de UI
      → useJoinedEvents.load(userId)      (excluye eventos ya valorados)
      → useCompletedEvents.load(userId)   (carga historial de valoraciones)
      → useProfile.load(userId)
      → usePreferences.load(userId)
      → useFriends.load()                 (carga amistades del usuario)
      → fetchPendingEvents() [solo admins] (badge de solicitudes pendientes)
      → requestNotifPermission()          (pide permiso de notificaciones al hacer like)
```

### 7.2 Filtrado en cliente
`filteredEvents` se calcula como un `useMemo` que aplica sobre todos los eventos cargados:
1. Excluye IDs ya swipeados (`swipedIds` Set)
2. Filtra por rango de edad del usuario (si la edad está definida en el perfil)
3. Filtra por distancia (calculada con Haversine en el cliente)
4. Filtra por precio máximo (calculado con `getEventPrice`)
5. Filtra por deportes seleccionados (expandiendo grupos a nombres de sport)
6. Filtra por niveles
7. Filtra por `maxDays` (diferencia de días desde hoy)
8. **Filtra por género:** si el usuario tiene género definido (no vacío ni 'No especificado'), se excluyen eventos de otro género distinto de 'Mixto'

Cuando cambia cualquier filtro activo, el deck se reinicia automáticamente (`swipe.reset()`).

### 7.3 Mecánica de swipe
- `useSwipe` gestiona el índice actual del deck
- `EventCard` implementa drag con Pointer Events API (`onPointerDown/Move/Up`)
- Umbral de decisión: ±120px de desplazamiento horizontal
- Animación de salida: translateX(±460px) + rotate en 240ms
- **Swipe derecha (like)**: registra `recordSwipe(userId, eventId, 'like')` + llama `joinEvent(userId, eventId)` + actualiza contador optimista en UI + añade a JoinedPanel + solicita permiso de notificaciones
- **Swipe izquierda (pass)**: registra `recordSwipe(userId, eventId, 'pass')` únicamente
- Botones de acción bajo la tarjeta también disparan `triggerDecision`

### 7.4 Objeto evento en UI (mapDbEvent)
```javascript
{
  id,            // UUID
  sport,         // nombre del deporte (de sports.name)
  sportBasePrice, // precio base (de sports.base_price)
  title,
  eventDate,     // string 'YYYY-MM-DD'
  eventTime,     // string 'HH:MM' (nuevo campo)
  date,          // string formateado 'Sáb 7 jun · 20:00'
  city,
  address,
  lat, lng,
  distanceKm,    // calculado con Haversine desde posición del usuario
  level,         // 'Principiante' | 'Intermedio' | 'Avanzado'
  minAge, maxAge,
  gender,        // 'Femenino' | 'Masculino' | 'Mixto'
  totalPlaces,
  currentParticipants,
  status,        // 'open' | 'full' | 'cancelled' | 'pending'
  directions,
  image,         // image_url ?? DEFAULT_IMAGE
}
```

**DEFAULT_IMAGE:** `photo-1575361204480-aadea25e6e68` (imagen de futsal indoor, usada como fallback)

### 7.5 Cálculo de precio en frontend
```javascript
getEventPrice(event) {
  const base = event.sportBasePrice ?? 4
  const groupFactor = Math.max(0, 10 - event.totalPlaces) * 0.35
  return Math.round(Math.min(10, Math.max(0, base + groupFactor)) * 10) / 10
}
```
Misma lógica que `calculate_event_price` en PostgreSQL.

---

## 8. COMPONENTES PRINCIPALES

### 8.1 EventCard
- Muestra imagen de cabecera, icono del deporte, título, fecha, ciudad+distancia, nivel, rango de edad, género, precio, barra de ocupación, avatares de participantes
- Drag interactivo con PointerEvents
- Botón de mapa: abre iframe de Google Maps embebido dentro de la tarjeta
- Botón de compartir: usa Navigator Share API o fallback a WhatsApp
- Feedback visual con clases CSS `like-tone` / `pass-tone` según dirección del drag
- Los avatares de participantes se generan determinísticamente desde el `event.id` usando un pool de imágenes de Unsplash

### 8.2 Topbar
- Logo FaltaUno
- Botón de perfil (FiUser)
- Botón de filtros (FiSliders)
- Contador de eventos apuntados (badge sobre FiCalendar)
- Botón "+" proponer evento (FiPlusCircle) — oculto para admins (tienen el panel de admin)
- Botón de mapa (FiMap)
- Botón social (FiUsers) con badge de solicitudes de amistad pendientes
- Botón de panel admin (FiShield) con badge de eventos pendientes y alerta de color (solo si `isAdmin`)
- Botón de cerrar sesión (FiLogOut)

### 8.3 FiltersPanel
Panel lateral flotante con:
- **Deportes:** botones con icono por grupo (Fútbol, Pádel, Tenis, Baloncesto, Running, Vóley, Golf, Natación, Ciclismo)
- **Nivel:** Principiante / Intermedio / Avanzado (multi-selección)
- **Sexo:** Femenino / Masculino / Mixto (multi-selección)
- **¿Cuándo?:** chips de días (Hoy / 3 días / 1 semana / 2 semanas / 1 mes)
- **Edad:** slider (16-60 años)
- **Distancia:** slider (1-30 km)
- **Precio máximo:** slider (0-10 €, paso 0.50 €)
- **Notificaciones:** 3 checkboxes (recordatorios, cambios de estado, nuevos eventos)
- Los cambios se aplican en tiempo real al deck; al cerrar el panel se guardan en Supabase

### 8.4 ProfilePanel
- Avatar con preview y upload a Supabase Storage
- Campos: nombre visible, ciudad, bio deportiva
- **Nuevo:** campos de edad y sexo (para filtrado automático de eventos por género)
- **Estadísticas expandibles:**
  - "Completados": historial de eventos valorados con deporte, título, fecha, estrellas y comentario
  - "Deportes": agrupación de completados por deporte con contadores
- **Racha actual:** número de semanas consecutivas con al menos un evento valorado

### 8.5 JoinedPanel
Panel "Mis partidos" con:
- Filtro temporal (Todos / Hoy / 3 días / 1 semana / 2 semanas / 1 mes)
- Tarjeta por evento con imagen, deporte, estado (abierto/completo/cancelado), fecha, dirección, contador de plazas, mapa embebido, botón "Cómo llegar" (Google Maps) y botón de cancelar participación
- **Nuevo:** botón "Valorar" que aparece cuando el evento ha terminado hace 2+ horas y estaba lleno (timing `ratable`). Abre el `RatingModal`.

### 8.6 CreateEventPanel *(nuevo)*
Panel para que cualquier usuario autenticado proponga eventos:
- **Selector de deporte:** desplegable con todos los deportes de la BD
- **Título y fecha/hora** con validaciones
- **Geocodificación de dirección:** campo de ciudad + dirección + botón de búsqueda que llama a Nominatim (OpenStreetMap). El formulario no se puede enviar sin confirmar la ubicación.
- **Botón "Usar mi ubicación actual":** usa `navigator.geolocation` + `reverseGeocode` para autocompletar ciudad y dirección
- **Configuración de participantes:** nivel, género, edad mín/máx, plazas totales, instrucciones
- **Selector de imagen:** grid de 3 imágenes de Unsplash por deporte (cambia automáticamente al cambiar el deporte)
- **Estado del evento creado:**
  - Si `isAdmin`: se publica directamente con `status='open'`
  - Si usuario normal: se envía con `status='pending'` y queda en espera de aprobación

### 8.7 MapView *(nuevo)*
Vista alternativa al deck de swipe:
- Mapa Leaflet interactivo centrado en las coordenadas del usuario (zoom 13)
- Tiles de OpenStreetMap
- Un marcador por cada evento filtrado con lat/lng válidos
- **Popup por marcador:** título, deporte+nivel, fecha, distancia+precio, plazas libres, botón "¡Me uno!" (solo si hay plazas)
- Unirse desde el mapa ejecuta el mismo flujo que un swipe-like (joinEvent + recordSwipe + actualización optimista)
- Botón flotante "Filtros" para abrir el FiltersPanel sin salir del mapa

### 8.8 FriendsPanel *(nuevo)*
Panel social con 4 pestañas:

1. **Ranking:** clasificación del usuario + sus amigos por puntos (10 pts por evento completado). Muestra medallas para los 3 primeros. Se resalta la posición propia.

2. **Amigos:** lista de amistades aceptadas. Cada fila muestra avatar, nombre, nivel (badge Bronce/Plata/Oro/Platino) y racha semanal (🔥). Botón expandible que carga y lista los próximos 5 partidos del amigo.

3. **Solicitudes:** solicitudes de amistad recibidas (aceptar/rechazar) y enviadas (cancelar). Badge con número de solicitudes recibidas en la pestaña.

4. **Buscar:** input de búsqueda por nombre de usuario (ilike en Supabase). Lista resultados con opción de "Agregar" (enviar solicitud). Filtra usuarios ya conocidos.

### 8.9 RatingModal *(nuevo)*
Modal de valoración que aparece al pulsar "Valorar" en el JoinedPanel:
- Selector de 1 a 5 estrellas (con hover)
- Textarea de comentario opcional
- Botón "Enviar valoración" (deshabilitado hasta seleccionar estrellas)
- **Tras enviar:** pantalla de confirmación con botón "Compartir en WhatsApp" (genera un mensaje preformateado con deporte, estrellas y título del evento)
- El modal cierra al hacer clic fuera de él

---

## 9. PANEL DE ADMINISTRACIÓN

Accesible solo para usuarios con `role = 'admin'`. Se activa desde la Topbar.

### Tabs:
1. **Resumen (Dashboard):**
   - Total eventos, abiertos, completos, cancelados, pendientes, total usuarios
   - Gráfico de barras de eventos por deporte

2. **Solicitudes** *(nueva pestaña):*
   - Lista de eventos con `status='pending'` propuestos por usuarios
   - Muestra: deporte, título, ciudad, fecha, plazas, usuario que lo propuso
   - Acciones: **Aprobar** (cambia a `status='open'`) o **Rechazar** (cambia a `status='cancelled'`)
   - Badge en la Topbar muestra el número de solicitudes pendientes
   - El badge en la pestaña "Solicitudes" dentro del panel también refleja el conteo

3. **Eventos:**
   - Tabla con: deporte, título, fecha, ciudad, nivel, plazas (actual/total), estado
   - Buscador por título, deporte o ciudad
   - Botón "Nuevo evento" → modal con formulario completo (incluye geocodificación y selector de imágenes)
   - Acciones por fila: Editar (modal), Cancelar, Eliminar
   - Formulario de evento: deporte (select), título, fecha, hora, ciudad, dirección, geocodificación via Nominatim, nivel, género, edad mín/máx, plazas totales, instrucciones, selector de imágenes por deporte

4. **Usuarios:**
   - Tabla con: avatar, nombre, ciudad, rol, fecha de registro
   - Botón para promocionar/degradar admin (toggle role user↔admin)

---

## 10. SISTEMA DE VALORACIONES Y COMPLETADOS

### Flujo completo de un evento completado:
1. El usuario se apunta a un evento (swipe like o desde el mapa)
2. El evento aparece en "Mis partidos" (JoinedPanel)
3. `getEventTimingStatus` clasifica el evento según el tiempo:
   - `upcoming` — futuro normal
   - `soon` — empieza en menos de 24 horas (notificación push)
   - `imminent` — empieza en menos de 3 horas
   - `warning_no_quorum` — empieza en menos de 30 min y NO está lleno
   - `past` — empezó hace menos de 2 horas (en curso)
   - `ratable` — empezó hace 2+ horas y estaba lleno → **se muestra botón "Valorar"**
   - `cancelled_no_quorum` — empezó hace 2+ horas y NO estaba lleno → no se realizó
4. El usuario pulsa "Valorar" → se abre `RatingModal`
5. Tras valorar:
   - El evento se retira de JoinedPanel (`joinedHook.removeRated`)
   - Se añade a `completedEvents` con estrellas y comentario
   - Se cancela la participación en la BD (`cancelParticipation`)
   - Se recalcula la racha semanal (`computeStreak`)
   - Se actualizan `completed_count` y `current_streak` en `profiles` (`updateUserStats`)
   - Se oferta compartir en WhatsApp

### Sistema de puntos y niveles:
- **Puntos:** 10 pts por cada evento completado y valorado
- **Niveles:**
  - Bronce: 0+ eventos
  - Plata: 5+ eventos
  - Oro: 15+ eventos
  - Platino: 30+ eventos
- **Racha semanal:** semanas consecutivas (lunes a domingo) en las que el usuario ha valorado al menos un evento. La racha se rompe si no hay actividad la semana anterior a la actual.

---

## 11. SISTEMA SOCIAL (AMISTADES)

### Flujo de amistad:
1. Usuario A busca a Usuario B en FriendsPanel → pestaña "Buscar"
2. A pulsa "Agregar" → `sendFriendRequest(A.id, B.id)` → INSERT en `friendships` con `status='pending'`
3. B ve la solicitud en pestaña "Solicitudes" con badge en Topbar
4. B acepta → `acceptFriendRequest(friendship.id)` → UPDATE status='accepted'
5. A y B aparecen mutuamente en la lista de amigos
6. Cualquiera puede eliminar la amistad (DELETE de la fila)

### Datos visibles de amigos:
- Nombre y avatar
- Nivel (badge de color basado en `completed_count`)
- Racha actual (`current_streak`) con emoji 🔥
- Próximos 5 partidos (cargados bajo demanda al expandir la fila)

### Ranking:
- Incluye al propio usuario + todos sus amigos aceptados
- Ordenado por puntos (completed_count × 10) de mayor a menor
- Top 3 con medallas 🥇🥈🥉; el resto con número de posición
- La fila propia se resalta visualmente

---

## 12. SISTEMA DE NOTIFICACIONES

### Notificaciones push del navegador (`useNotifications`):
- Se activan cuando el usuario hace su primer like (`requestNotifPermission`)
- Una vez concedido el permiso, para cada evento en "Mis partidos":
  - Si faltan ≤24 horas para el inicio, se envía una notificación push
  - Se guarda en `localStorage` para no repetir la notificación el mismo día
- Requiere que el navegador soporte la API `Notification` y el usuario haya concedido permiso

### Notificaciones de preferencias (sin implementar):
- Las columnas `notif_reminders`, `notif_status_updates`, `notif_new_events` en `user_preferences` están preparadas en el schema
- La lógica de envío (push/email) no está implementada (fuera del alcance del TFG)

---

## 13. GEOLOCALIZACIÓN Y GEOCODIFICACIÓN

### Geolocalización del usuario (`useLocation`):
1. Llama a `navigator.geolocation.getCurrentPosition()`
2. Estados: `requesting` → `granted` (con coords reales) o `denied` (con fallback)
3. **Fallback por defecto:** coordenadas de Madrid (40.4168, -3.7038)
4. Las coordenadas se pasan a `useEvents.load()` para calcular distancias
5. La distancia se calcula con la fórmula de **Haversine** (función `haversineKm`)
6. El filtro de distancia es **exclusivamente en cliente**

### Geocodificación de direcciones (`utils/geocode.js`):
Usa la API gratuita de **Nominatim (OpenStreetMap)**:

- **`geocodeAddress(query)`:** convierte texto de dirección en `{lat, lng, displayName}`. Restringe la búsqueda a España (`countrycodes=es`) y responde en español.
- **`reverseGeocode(lat, lng)`:** convierte coordenadas en dirección legible con campos `displayName`, `city` y `road`.

Se usa en `CreateEventPanel` y en el formulario de eventos del `AdminPage`.

---

## 14. DEPORTES Y GRUPOS DE FILTRO

Los deportes en la DB tienen nombres exactos. En el frontend se agrupan para el panel de filtros:

| Clave de grupo | Label UI | Deportes en DB incluidos |
|---|---|---|
| Futbol | Fútbol | Futbol 7, Futbol Sala, Futbol 11 |
| Padel | Pádel | Padel |
| Tenis | Tenis | Tenis |
| Baloncesto | Baloncesto | Baloncesto |
| Running | Running | Running |
| Voley | Vóley | Voley Playa |
| Golf | Golf | Golf |
| Natacion | Natación | Natacion |
| Ciclismo | Ciclismo | Ciclismo |

Los iconos se mapean en `src/constants/sports.js`:
- Fútbol → `FaFutbol`
- Pádel → `FaTableTennis` (icono de ping pong, aproximación visual)
- Tenis → `GiTennisRacket`
- Baloncesto → `FaBasketballBall`
- Running → `FaRunning`
- Vóley → `FaVolleyballBall`
- Golf → `FaGolfBall`
- Natación → `FaSwimmer`
- Ciclismo → `FaBicycle`

---

## 15. HISTORIAL DE MIGRACIONES

| Archivo | Descripción |
|---|---|
| `schema.sql` | Esquema completo inicial: tablas, triggers, funciones, RLS, Storage, seed de 16 eventos |
| `001_expand_sports_events.sql` | Añade deportes (Futsal, Futbol11, Tenis, Natacion, Ciclismo, Golf), columna `max_days` a `user_preferences`, ~40 eventos adicionales |
| `002_fix_participant_counter.sql` | Fix al trigger `sync_event_participants` para manejar correctamente el conteo |
| `003_fix_photos_add_events.sql` | Elimina todos los eventos existentes (evita duplicados), inserta ~90 eventos con imágenes correctas por deporte y en varias ciudades españolas |
| `004_social_ratings.sql` | Crea las tablas `friendships` y `event_ratings` con sus políticas RLS. Añade estado `'pending'` al CHECK de events.status |
| `005_profiles_stats_gender.sql` | Añade columnas `completed_count`, `current_streak` y `gender` a la tabla `profiles` |

---

## 16. IMÁGENES DE EVENTOS

Todas las imágenes son de **Unsplash** (libre de derechos para uso educativo/demo).

### URLs por deporte (tras migración 003):
| Deporte | Imágenes asignadas (IDs Unsplash) |
|---|---|
| Fútbol 7/Sala/11 | `1551958219-acbc595d5646` · `1574629810360-7efbbe195018` · `1489944440615-453fc2b6a9a9` |
| Fútbol Sala (específicas) | `1575361204480-aadea25e6e68` · `1607453998774-d533f65dac99` |
| Pádel | `1594734415741-d02aabb76d70` · `1611251486360-b0b2a46fe1ae` · `1579952363873-27f3bade9f55` |
| Tenis | `1530549387789-4c1017266635` · `1554068865-24cecd4e34b8` · `1622279457486-62dcc4a431d6` |
| Baloncesto | `1546519638-68e109498ffc` · `1504450758481-7338eba7524a` · `1519861531473-9200262188bf` |
| Running | `1476480862126-209bfaa8edc8` · `1502904550040-7534597429ae` · `1571008887538-b36bb32f4571` |
| Vóley Playa | `1612872087720-bb876e2e67d1` · `1591117207239-788bf8de6c3b` · `1560272564-c83b66b1ad12` |
| Natación | `1571019613454-1cb2f99b2d8b` · `1560090995-01632a28895b` · `1519315901367-f34ff9154487` |
| Ciclismo | `1558618666-fcd25c85cd64` · `1534155571944-bdc4afaa42df` · `1517649763962-0c623066013b` |
| Golf | `1535131749006-b7f58c99034b` · `1599507593548-0187ac4043f4` · `1592919505780-303950717480` |

El archivo `src/constants/eventImages.js` también mantiene un conjunto de imágenes alternativas (3 por deporte) usado exclusivamente en el selector de imagen de `CreateEventPanel`.

Formato URL: `https://images.unsplash.com/photo-{ID}?auto=format&fit=crop&w=800&q=80`

---

## 17. DATOS DE EJEMPLO (SEED)

Tras ejecutar la migración 003, la BD contiene ~90 eventos distribuidos:
- **Madrid:** ~55 eventos (principal ciudad)
- **Barcelona:** ~18 eventos
- **Valencia:** ~8 eventos
- **Sevilla:** ~5 eventos
- **Málaga:** ~2 eventos
- **Bilbao:** ~3 eventos

Distribución por deporte: 8 Fútbol 7 + 6 Futsal + 5 Fútbol 11 + 9 Pádel + 7 Tenis + 8 Baloncesto + 8 Running + 7 Vóley Playa + 7 Natación + 7 Ciclismo + 5 Golf

---

## 18. HOOKS — DESCRIPCIÓN DETALLADA

### `useEvents`
- Estado: `events[]`, `swipedIds` (Set), `loading`
- `load(userId, lat, lng)`: carga eventos y swipe history en paralelo, mapea con `mapDbEvent`
- `markSwiped(eventId)`: añade ID al Set de swipeados (filtro optimista)
- `updateEventCount(eventId, delta)`: actualiza `currentParticipants` localmente sin refetch

### `useJoinedEvents`
- Carga eventos a los que el usuario se ha unido vía `event_participants`
- `fetchJoinedEvents` excluye automáticamente los eventos que ya tienen valoración en `event_ratings`
- `add(event)`: añade optimistamente al estado local
- `cancel(userId, eventId)`: llama `cancelParticipation` y actualiza estado
- `removeRated(eventId)`: retira un evento del panel tras valorarlo

### `useCompletedEvents` *(nuevo)*
- `load(userId)`: obtiene valoraciones del usuario via `fetchUserRatings`, mapea cada evento con `mapDbEvent`
- `add(event, rating, comment)`: añade optimistamente una nueva entrada al historial
- Proporciona `completedEvents[]` con `rating`, `comment` y `ratedAt` adicionales

### `useProfile`
- `load(userId)`: obtiene datos de `profiles` (incluye `completed_count`, `current_streak`, `gender`)
- `save(userId, avatarFile)`: si hay avatarFile, sube a Storage y actualiza `avatar_url`; luego hace upsert en `profiles` (incluye campos de edad y género)
- `setProfile(fn)`: actualización optimista del estado local del perfil

### `usePreferences`
- `load(userId)`: lee `user_preferences` y mapea nombres DB → camelCase UI
- `save(userId)`: escribe preferencias de vuelta a la DB
- `updatePref(field, value)`: actualización local inmediata (para sliders en tiempo real)
- `reset()`: vuelve a `DEFAULT_PREFS`

### `useSwipe`
- Estado: índice entero del deck
- `advance()`: incrementa índice
- `reset()`: vuelve a 0

### `useLocation`
- Estado: `coords` (`{lat, lng}`), `status` ('requesting' | 'granted' | 'denied')
- Usa `navigator.geolocation.getCurrentPosition`
- Fallback: Madrid (40.4168, -3.7038)

### `useFriends(userId)` *(nuevo)*
- `load()`: obtiene todas las amistades del usuario (aceptadas + pendientes) y enriquece con datos de perfil del amigo
- `search(query)`: búsqueda de usuarios por nombre (ilike)
- `sendRequest(addresseeId)`: envía solicitud + recarga lista
- `accept(friendshipId)`: acepta solicitud, actualiza estado local
- `remove(friendshipId)`: elimina o rechaza amistad, actualiza estado local
- Proporciona `accepted[]`, `incoming[]`, `outgoing[]`, `knownIds` (Set), `searchResults[]`, `searching`

### `useNotifications` *(nuevo)*
- `useNotifications(joinedEvents, enabled)`: efecto que lanza notificaciones push del navegador para eventos que empiezan en menos de 24 horas
- `getEventTimingStatus(event)`: clasifica el evento en uno de 7 estados temporales
- `requestNotifPermission()`: solicita permiso de notificaciones al navegador

---

## 19. SERVICIOS — DESCRIPCIÓN DETALLADA

### `eventsService.js`
- `fetchEvents()`: SELECT all events + sports JOIN, solo estados 'open' y 'full'
- `fetchJoinedEvents(userId)`: SELECT event_participants con evento y sport, solo activos + excluye ya valorados
- `joinEvent(userId, eventId)`: UPSERT en event_participants con status='active'
- `cancelParticipation(userId, eventId)`: UPDATE status='cancelled'
- `createUserEvent(eventData)`: resuelve sport_id por nombre, INSERT evento con status='pending' o 'open'

### `swipeService.js`
- `fetchSwipeHistory(userId)`: SELECT event_id from swipe_history
- `recordSwipe(userId, eventId, direction)`: INSERT into swipe_history (fire-and-forget)

### `profileService.js`
- `fetchProfile(userId)`: SELECT from profiles
- `updateProfile(userId, fields)`: UPDATE profiles
- `uploadAvatar(userId, file)`: upload al bucket 'avatars' + retorna publicUrl
- `updateUserStats(userId, completedCount, currentStreak)`: UPDATE completed_count y current_streak en profiles
- `fetchFavoriteSports(userId)`: SELECT deportes favoritos
- `replaceFavoriteSports(userId, sportNames)`: DELETE + INSERT deportes favoritos

### `preferencesService.js`
- `fetchPreferences(userId)`: SELECT from user_preferences
- `savePreferences(userId, prefs)`: UPSERT con mapeado camelCase → snake_case

### `adminService.js`
- `fetchAdminStats()`: múltiples queries en paralelo para dashboard (incluye conteo de `pending`)
- `fetchPendingEvents()`: SELECT eventos con status='pending', ordenados por created_at ASC
- `approveEvent(id)`: UPDATE status='open'
- `rejectEvent(id)`: UPDATE status='cancelled'
- `fetchSports()`: lista de deportes para selector
- `fetchAllEventsAdmin()`: todos los eventos con deporte (ordenados por fecha y hora)
- `createEventAdmin(userId, fields)`: INSERT event con created_by y status='open'
- `updateEventAdmin(id, fields)`: UPDATE event
- `cancelEventAdmin(id)`: UPDATE status='cancelled'
- `deleteEventAdmin(id)`: DELETE event
- `fetchAllUsers()`: SELECT profiles con rol
- `setUserRole(userId, role)`: UPDATE role en profiles

### `friendsService.js` *(nuevo)*
- `searchUsers(query)`: SELECT profiles ilike display_name (incluye completed_count, current_streak)
- `getFriendships(userId)`: SELECT friendships + enriquece con datos de perfil del amigo
- `sendFriendRequest(requesterId, addresseeId)`: INSERT en friendships
- `acceptFriendRequest(friendshipId)`: UPDATE status='accepted'
- `removeFriendship(friendshipId)`: DELETE from friendships
- `fetchFriendUpcomingEvents(friendUserId)`: SELECT próximos eventos activos de un amigo (top 5)

### `ratingsService.js` *(nuevo)*
- `submitRating(userId, eventId, rating, comment)`: UPSERT en event_ratings (onConflict: user_id+event_id)
- `fetchUserRatings(userId)`: SELECT valoraciones del usuario con eventos y sports anidados

---

## 20. CONFIGURACIÓN DE VITE

`vite.config.js` mínimo:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

El cliente Supabase se inicializa con variables de entorno:
```javascript
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(url, key, {
  auth: { lock: async (_name, _acquireTimeout, fn) => fn() }
})
```
*(El override de `lock` es necesario para funcionar correctamente en entornos sin localStorage aislado.)*

---

## 21. CONSIDERACIONES DE DISEÑO Y UX

1. **Mobile-first:** diseñado para móvil aunque funciona en escritorio. Las tarjetas de swipe están optimizadas para gestos táctiles.

2. **Optimistic UI:** al hacer swipe like, el contador de participantes se incrementa inmediatamente en la UI sin esperar confirmación del servidor.

3. **Estado sin persistencia de sesión de deck:** al recargar la página, el swipe_history se recarga de DB, por lo que no se vuelven a mostrar eventos ya vistos.

4. **Un solo panel visible a la vez:** Filtros, Perfil, Mis Partidos, Crear Evento y Social son mutuamente excluyentes. El mapa se alterna con el deck principal (no es un panel lateral).

5. **Precio calculado, no almacenado:** el precio se calcula en tiempo real tanto en el frontend como en la función SQL, nunca se almacena en la tabla `events`.

6. **Filtrado de género desde el perfil:** si el usuario declara su género, los eventos de otro género (que no sean Mixto) se filtran automáticamente. Se puede desactivar dejando el campo vacío o seleccionando "No especificado".

7. **Propuesta de eventos moderada:** los usuarios no-admin no pueden publicar eventos directamente; sus propuestas quedan en `pending` hasta aprobación admin. Esto evita spam o eventos inapropiados.

8. **Geocodificación obligatoria para crear eventos:** no se puede enviar el formulario sin haber confirmado la ubicación (lat/lng reales), evitando eventos sin coordenadas válidas.

9. **Sistema social ligero:** el ranking es local al grupo de amigos de cada usuario, no global, para mantener la privacidad y hacer la competición más relevante.

---

## 22. LIMITACIONES Y DEUDA TÉCNICA CONOCIDA

1. El filtro de distancia se aplica en el **cliente**, no en el servidor. Esto significa que se cargan todos los eventos de la DB aunque muchos sean filtrados. Para escalar, debería pasarse a `get_filtered_events` con PostGIS.

2. Los eventos de seed tienen `created_by = NULL` porque los inserta directamente el SQL, no un usuario autenticado. Esto hace que las políticas RLS de UPDATE/DELETE no apliquen sobre ellos desde el frontend.

3. No hay paginación de eventos: se cargan todos en una sola query al inicio.

4. `useLocation` no actualiza las coordenadas si el usuario se mueve.

5. Las notificaciones push solo funcionan si el usuario ha concedido permiso manualmente (tras el primer like). No hay fallback por email.

6. No hay validación de formularios robusta en el panel admin (solo campos requeridos HTML5), a excepción del formulario de creación de eventos en `CreateEventPanel`.

7. `getEventTimingStatus` evalúa el timing en el momento de renderizar, no en tiempo real (no hay intervalo de actualización). Un evento puede necesitar un reload para actualizar su badge temporal.

8. El ranking social incluye `completed_count` y `current_streak` de la tabla `profiles`, que se actualiza solo cuando el usuario usa la app y valora un evento. No hay proceso en background que actualice estos campos.

---

## 23. COMANDOS DE DESARROLLO

```bash
# Instalar dependencias
cd FaltaUno/tfg && npm install

# Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

**Variables de entorno necesarias (`.env`):**
```
VITE_SUPABASE_URL=https://gislxtpxybrryswbwoub.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

*Documento actualizado el 2026-05-13. Revisión principal desde la versión de 2026-05-06: sistema social (amistades + ranking), sistema de valoraciones y niveles, notificaciones push del navegador, panel de moderación de eventos propuestos, geocodificación via Nominatim, filtro de género por perfil, nuevas columnas en `profiles` y nuevas tablas `friendships` y `event_ratings`.*
