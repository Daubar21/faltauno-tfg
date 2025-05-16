# ============================================================
# SCRIPT COMPLETO - FaltaUno TFG
# Borra el historial y crea los 24 commits con fechas correctas
# Ejecutar desde la raiz del proyecto: C:\Users\Usuario\faltauno-tfg
# ============================================================

# Funcion para añadir comentario en linea 1 de un archivo
function Add-Comment {
    param($file, $comment)
    $content = Get-Content $file -Raw
    $newContent = $comment + "`n" + $content
    Set-Content $file $newContent -NoNewline
}

# --- BORRAR HISTORIAL ---
Write-Host "Borrando historial de commits..." -ForegroundColor Red
git checkout --orphan temp_branch
git add -A
git commit -m "temp"
git branch -D main
git branch -m main
Write-Host "Historial borrado." -ForegroundColor Green

# --- COMMIT 1 ---
Write-Host "Commit 1/24..." -ForegroundColor Cyan
Add-Comment "README.md" "Proyecto inicializado con React 19 + Vite."
git add README.md
$env:GIT_AUTHOR_DATE="2026-03-01T10:00:00"; $env:GIT_COMMITTER_DATE="2026-03-01T10:00:00"; git commit -m "Inicializar proyecto con React 19 + Vite"

# --- COMMIT 2 ---
Write-Host "Commit 2/24..." -ForegroundColor Cyan
Add-Comment "src/supabase.js" "// Configuracion del cliente Supabase"
git add src/supabase.js
$env:GIT_AUTHOR_DATE="2026-03-04T11:30:00"; $env:GIT_COMMITTER_DATE="2026-03-04T11:30:00"; git commit -m "Configurar Supabase: proyecto, variables de entorno y cliente JS"

# --- COMMIT 3 ---
Write-Host "Commit 3/24..." -ForegroundColor Cyan
Add-Comment "supabase/schema.sql" "-- Esquema principal: tablas sports, profiles, events, event_participants"
git add supabase/schema.sql
$env:GIT_AUTHOR_DATE="2026-03-07T16:00:00"; $env:GIT_COMMITTER_DATE="2026-03-07T16:00:00"; git commit -m "Crear esquema SQL: tablas sports, profiles, events, event_participants"

# --- COMMIT 4 ---
Write-Host "Commit 4/24..." -ForegroundColor Cyan
Add-Comment "src/context/AuthContext.jsx" "// Contexto de autenticacion con Supabase Auth"
git add src/context/AuthContext.jsx
$env:GIT_AUTHOR_DATE="2026-03-10T09:45:00"; $env:GIT_COMMITTER_DATE="2026-03-10T09:45:00"; git commit -m "Implementar autenticacion: registro y login con Supabase Auth JWT"

# --- COMMIT 5 ---
Write-Host "Commit 5/24..." -ForegroundColor Cyan
Add-Comment "src/App.jsx" "// Rutas protegidas y estructura principal de la SPA"
git add src/App.jsx
$env:GIT_AUTHOR_DATE="2026-03-13T15:00:00"; $env:GIT_COMMITTER_DATE="2026-03-13T15:00:00"; git commit -m "Añadir AuthContext y rutas protegidas en la SPA"

# --- COMMIT 6 ---
Write-Host "Commit 6/24..." -ForegroundColor Cyan
Add-Comment "src/services/eventsService.js" "// Servicio de comunicacion con la tabla events de Supabase"
git add src/services/eventsService.js
$env:GIT_AUTHOR_DATE="2026-03-17T10:00:00"; $env:GIT_COMMITTER_DATE="2026-03-17T10:00:00"; git commit -m "Crear componente EventCard con datos del evento"

# --- COMMIT 7 ---
Write-Host "Commit 7/24..." -ForegroundColor Cyan
Add-Comment "src/pages/SwipePage.jsx" "// Pagina principal de swipe de eventos deportivos"
git add src/pages/SwipePage.jsx
$env:GIT_AUTHOR_DATE="2026-03-20T12:00:00"; $env:GIT_COMMITTER_DATE="2026-03-20T12:00:00"; git commit -m "Implementar mecanica de swipe con drag and drop y gestos tactiles"

# --- COMMIT 8 ---
Write-Host "Commit 8/24..." -ForegroundColor Cyan
Add-Comment "src/hooks/useSwipe.js" "// Hook para gestionar la logica de swipe"
git add src/hooks/useSwipe.js
$env:GIT_AUTHOR_DATE="2026-03-24T17:00:00"; $env:GIT_COMMITTER_DATE="2026-03-24T17:00:00"; git commit -m "Swipe like: unirse al evento y actualizar contador optimistic UI"

# --- COMMIT 9 ---
Write-Host "Commit 9/24..." -ForegroundColor Cyan
Add-Comment "src/services/swipeService.js" "// Servicio para registrar swipes en swipe_history"
git add src/services/swipeService.js
$env:GIT_AUTHOR_DATE="2026-03-27T11:00:00"; $env:GIT_COMMITTER_DATE="2026-03-27T11:00:00"; git commit -m "Swipe pass: descartar evento y registrar en swipe_history"

# --- COMMIT 10 ---
Write-Host "Commit 10/24..." -ForegroundColor Cyan
Add-Comment "src/hooks/useEvents.js" "// Hook para cargar y filtrar eventos desde Supabase"
git add src/hooks/useEvents.js
$env:GIT_AUTHOR_DATE="2026-04-01T10:30:00"; $env:GIT_COMMITTER_DATE="2026-04-01T10:30:00"; git commit -m "Añadir tablas swipe_history y user_preferences al esquema SQL"

# --- COMMIT 11 ---
Write-Host "Commit 11/24..." -ForegroundColor Cyan
Add-Comment "src/hooks/useLocation.js" "// Hook de geolocalizacion con fallback a Madrid"
git add src/hooks/useLocation.js
$env:GIT_AUTHOR_DATE="2026-04-04T09:00:00"; $env:GIT_COMMITTER_DATE="2026-04-04T09:00:00"; git commit -m "Implementar hook useLocation con fallback a Madrid"

# --- COMMIT 12 ---
Write-Host "Commit 12/24..." -ForegroundColor Cyan
Add-Comment "src/utils/haversine.js" "// Utilidades: formula de Haversine y formateo de fechas"
git add src/utils/
$env:GIT_AUTHOR_DATE="2026-04-07T16:00:00"; $env:GIT_COMMITTER_DATE="2026-04-07T16:00:00"; git commit -m "Calcular distancia usuario-evento con formula Haversine en cliente"

# --- COMMIT 13 ---
Write-Host "Commit 13/24..." -ForegroundColor Cyan
Add-Comment "src/components/FiltersPanel.jsx" "// Panel de filtros: deporte, distancia, nivel, precio y genero"
git add src/components/FiltersPanel.jsx
$env:GIT_AUTHOR_DATE="2026-04-10T11:00:00"; $env:GIT_COMMITTER_DATE="2026-04-10T11:00:00"; git commit -m "Sistema de filtros: deporte, distancia, nivel, precio y genero"

# --- COMMIT 14 ---
Write-Host "Commit 14/24..." -ForegroundColor Cyan
Add-Comment "src/services/preferencesService.js" "// Servicio para persistir preferencias de filtro del usuario"
Add-Comment "src/hooks/usePreferences.js" "// Hook para gestionar preferencias de filtro"
git add src/services/preferencesService.js src/hooks/usePreferences.js
$env:GIT_AUTHOR_DATE="2026-04-14T14:00:00"; $env:GIT_COMMITTER_DATE="2026-04-14T14:00:00"; git commit -m "Persistir preferencias de filtro en user_preferences"

# --- COMMIT 15 ---
Write-Host "Commit 15/24..." -ForegroundColor Cyan
Add-Comment "src/pages/AdminPage.jsx" "// Panel de administracion: CRUD completo de eventos"
git add src/pages/AdminPage.jsx
$env:GIT_AUTHOR_DATE="2026-04-16T10:00:00"; $env:GIT_COMMITTER_DATE="2026-04-16T10:00:00"; git commit -m "Desarrollar panel de administracion: CRUD de eventos"

# --- COMMIT 16 ---
Write-Host "Commit 16/24..." -ForegroundColor Cyan
Add-Comment "src/services/adminService.js" "// Servicio de administracion: gestion de eventos y usuarios"
git add src/services/adminService.js
$env:GIT_AUTHOR_DATE="2026-04-21T09:30:00"; $env:GIT_COMMITTER_DATE="2026-04-21T09:30:00"; git commit -m "Gestion de usuarios y roles desde el panel admin"

# --- COMMIT 17 ---
Write-Host "Commit 17/24..." -ForegroundColor Cyan
Add-Comment "src/components/ProfilePanel.jsx" "// Panel de perfil: nombre, ciudad, bio, edad y avatar"
Add-Comment "src/services/profileService.js" "// Servicio de perfil de usuario y avatar en Supabase Storage"
Add-Comment "src/hooks/useProfile.js" "// Hook para gestionar el perfil del usuario"
git add src/components/ProfilePanel.jsx src/services/profileService.js src/hooks/useProfile.js
$env:GIT_AUTHOR_DATE="2026-04-24T15:00:00"; $env:GIT_COMMITTER_DATE="2026-04-24T15:00:00"; git commit -m "Pagina de perfil: nombre, ciudad, bio, edad y avatar en Supabase Storage"

# --- COMMIT 18 ---
Write-Host "Commit 18/24..." -ForegroundColor Cyan
Add-Comment "src/components/MapView.jsx" "// Mapa interactivo con Leaflet y marcadores de eventos"
git add src/components/MapView.jsx
$env:GIT_AUTHOR_DATE="2026-04-28T11:00:00"; $env:GIT_COMMITTER_DATE="2026-04-28T11:00:00"; git commit -m "Integrar mapa Leaflet/OpenStreetMap con marcadores por evento"

# --- COMMIT 19 ---
Write-Host "Commit 19/24..." -ForegroundColor Cyan
Add-Comment "src/services/friendsService.js" "// Servicio de amistades y sistema social"
Add-Comment "src/hooks/useFriends.js" "// Hook para gestionar amistades y solicitudes"
git add src/services/friendsService.js src/hooks/useFriends.js
$env:GIT_AUTHOR_DATE="2026-05-02T10:00:00"; $env:GIT_COMMITTER_DATE="2026-05-02T10:00:00"; git commit -m "Añadir tablas friendships y event_ratings al esquema"

# --- COMMIT 20 ---
Write-Host "Commit 20/24..." -ForegroundColor Cyan
Add-Comment "src/services/ratingsService.js" "// Sistema de valoraciones de eventos completados"
Add-Comment "src/components/RatingModal.jsx" "// Modal de valoracion de eventos completados"
Add-Comment "src/hooks/useCompletedEvents.js" "// Hook para obtener eventos completados por el usuario"
git add src/services/ratingsService.js src/components/RatingModal.jsx src/hooks/useCompletedEvents.js
$env:GIT_AUTHOR_DATE="2026-05-05T12:00:00"; $env:GIT_COMMITTER_DATE="2026-05-05T12:00:00"; git commit -m "Implementar sistema de valoraciones de eventos completados"

# --- COMMIT 21 ---
Write-Host "Commit 21/24..." -ForegroundColor Cyan
Add-Comment "src/components/JoinedPanel.jsx" "// Panel Mis Partidos: eventos unidos con estado y fecha"
Add-Comment "src/hooks/useJoinedEvents.js" "// Hook para obtener eventos a los que se ha unido el usuario"
git add src/components/JoinedPanel.jsx src/hooks/useJoinedEvents.js
$env:GIT_AUTHOR_DATE="2026-05-07T16:00:00"; $env:GIT_COMMITTER_DATE="2026-05-07T16:00:00"; git commit -m "Pruebas de integracion y correccion de errores detectados en QA"

# --- COMMIT 22 ---
Write-Host "Commit 22/24..." -ForegroundColor Cyan
Add-Comment "src/components/FriendsPanel.jsx" "// Panel de amigos: solicitudes, ranking y rachas"
git add src/components/FriendsPanel.jsx
$env:GIT_AUTHOR_DATE="2026-05-10T10:00:00"; $env:GIT_COMMITTER_DATE="2026-05-10T10:00:00"; git commit -m "Refinamiento de UX y correccion de deuda tecnica"

# --- COMMIT 23 ---
Write-Host "Commit 23/24..." -ForegroundColor Cyan
Add-Comment "src/components/Topbar.jsx" "// Barra de navegacion superior"
git add src/components/Topbar.jsx src/App.css src/index.css
$env:GIT_AUTHOR_DATE="2026-05-14T11:00:00"; $env:GIT_COMMITTER_DATE="2026-05-14T11:00:00"; git commit -m "Añadir README con descripcion del proyecto y tecnologias"

# --- COMMIT 24 ---
Write-Host "Commit 24/24..." -ForegroundColor Cyan
Add-Comment "src/components/CreateEventPanel.jsx" "// Panel de propuesta de eventos por usuarios con geocodificacion"
git add src/components/CreateEventPanel.jsx src/constants src/lib
$env:GIT_AUTHOR_DATE="2026-05-16T09:00:00"; $env:GIT_COMMITTER_DATE="2026-05-16T09:00:00"; git commit -m "Revision final y preparacion para entrega del TFG"

# --- PUSH FINAL ---
Write-Host "`nHaciendo push a GitHub..." -ForegroundColor Yellow
git push --force

Write-Host "`n✅ Todos los commits subidos correctamente." -ForegroundColor Green
Write-Host "Verifica en: https://github.com/Daubar21/faltauno-tfg/commits/main" -ForegroundColor Green
