-- ============================================================
-- SEED DEMO — Datos para presentación
-- 1) Eventos llenos en Las Rozas (12-13 junio) → probar lista de espera
-- 2) Historial completado de daubar → mostrar perfil con deportes y valoraciones
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE
  v_daubar_id   UUID;

  -- Sport IDs
  v_futbol7     INTEGER;
  v_futsal      INTEGER;
  v_padel       INTEGER;
  v_tenis       INTEGER;
  v_basket      INTEGER;
  v_running     INTEGER;
  v_voley       INTEGER;
  v_ciclismo    INTEGER;

  -- IDs de eventos pasados (historial daubar)
  e1 UUID; e2 UUID; e3 UUID; e4 UUID; e5 UUID; e6 UUID; e7 UUID; e8 UUID;

BEGIN
  -- Buscar daubar
  SELECT id INTO v_daubar_id FROM profiles WHERE username = 'daubar';
  IF v_daubar_id IS NULL THEN
    RAISE EXCEPTION 'Usuario daubar no encontrado en profiles';
  END IF;

  -- ── Limpieza previa (idempotente: borra datos del seed anterior) ──────────

  -- Borrar ratings de daubar sobre eventos pasados del seed
  DELETE FROM event_ratings
  WHERE user_id = v_daubar_id
    AND event_id IN (
      SELECT id FROM events WHERE created_by IS NULL AND title IN (
        'Fútbol 7 Semanal Majadahonda',
        'Pádel Tarde Pozuelo',
        'Baloncesto 5×5 Madrid',
        'Carrera Popular Boadilla',
        'Tenis Dobles Puerta de Hierro',
        'Vóley Playa Arena Madrid',
        'Fútbol Sala Las Rozas Noche',
        'Ruta MTB Galapagar'
      )
    );

  -- Borrar eventos del seed (pasados + Las Rozas llenos)
  DELETE FROM events WHERE created_by IS NULL AND title IN (
    'Fútbol 7 Semanal Majadahonda',
    'Pádel Tarde Pozuelo',
    'Baloncesto 5×5 Madrid',
    'Carrera Popular Boadilla',
    'Tenis Dobles Puerta de Hierro',
    'Vóley Playa Arena Madrid',
    'Fútbol Sala Las Rozas Noche',
    'Ruta MTB Galapagar',
    'Fútbol 7 Las Rozas — Jueves',
    'Pádel Mixto Las Rozas',
    'Baloncesto 5×5 Las Rozas',
    'Fútbol Sala Las Rozas — Viernes',
    'Running Las Rozas — Viernes',
    'Tenis Dobles Las Rozas'
  );

  -- Resetear estadísticas (se recalculan al final del script)
  UPDATE profiles SET completed_count = 0, current_streak = 0 WHERE id = v_daubar_id;

  -- ── Fin limpieza ──────────────────────────────────────────────────────────

  -- Sport IDs
  SELECT id INTO v_futbol7  FROM sports WHERE name = 'Futbol 7';
  SELECT id INTO v_futsal   FROM sports WHERE name = 'Futbol Sala';
  SELECT id INTO v_padel    FROM sports WHERE name = 'Padel';
  SELECT id INTO v_tenis    FROM sports WHERE name = 'Tenis';
  SELECT id INTO v_basket   FROM sports WHERE name = 'Baloncesto';
  SELECT id INTO v_running  FROM sports WHERE name = 'Running';
  SELECT id INTO v_voley    FROM sports WHERE name = 'Voley Playa';
  SELECT id INTO v_ciclismo FROM sports WHERE name = 'Ciclismo';

  -- ===========================================================
  -- BLOQUE 1: Eventos LLENOS en Las Rozas — 12 y 13 de junio
  -- (current_participants = total_places, status = 'full')
  -- No se insertan en event_participants para no disparar trigger
  -- ===========================================================

  -- Jueves 12
  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES (v_futbol7, 'Fútbol 7 Las Rozas — Jueves', '2026-06-12', '19:00',
    'Las Rozas', 'Campo Municipal Las Rozas, Av. de las Ciudades s/n',
    40.4934, -3.8728, 'Intermedio', 18, 45, 'Masculino', 14, 14, 'full',
    'Hierba artificial. Lleno — únete a la lista de espera.',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75');

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES (v_padel, 'Pádel Mixto Las Rozas', '2026-06-12', '20:00',
    'Las Rozas', 'Club Pádel Las Rozas, C. de la Industria 8',
    40.4912, -3.8701, 'Intermedio', 20, 50, 'Mixto', 4, 4, 'full',
    'Pistas cubiertas. Lleno — únete a la lista de espera.',
    'https://images.unsplash.com/photo-1613870930431-a09c7139eb33?auto=format&fit=crop&w=700&q=75');

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES (v_basket, 'Baloncesto 5×5 Las Rozas', '2026-06-12', '21:00',
    'Las Rozas', 'Polideportivo Municipal Las Rozas, C. del Pinar',
    40.4950, -3.8750, 'Principiante', 16, 45, 'Mixto', 10, 10, 'full',
    'Pabellón cubierto. Lleno — únete a la lista de espera.',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=700&q=75');

  -- Viernes 13
  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES (v_futsal, 'Fútbol Sala Las Rozas — Viernes', '2026-06-13', '19:30',
    'Las Rozas', 'Pabellón Las Matas, Av. de Las Matas 12',
    40.4880, -3.8810, 'Avanzado', 20, 40, 'Masculino', 10, 10, 'full',
    'Nivel alto. Lleno — únete a la lista de espera.',
    'https://images.unsplash.com/photo-1587384474964-3a06ce1ce699?auto=format&fit=crop&w=700&q=75');

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES (v_running, 'Running Las Rozas — Viernes', '2026-06-13', '08:00',
    'Las Rozas', 'Parque del Prado, entrada principal Las Rozas',
    40.4960, -3.8700, 'Intermedio', 18, 55, 'Mixto', 20, 20, 'full',
    'Ruta 8 km por el parque. Lleno — únete a la lista de espera.',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=75');

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES (v_tenis, 'Tenis Dobles Las Rozas', '2026-06-13', '11:00',
    'Las Rozas', 'Club de Tenis Las Rozas, Urb. El Pinar',
    40.4920, -3.8680, 'Intermedio', 20, 55, 'Mixto', 4, 4, 'full',
    'Tierra batida. Lleno — únete a la lista de espera.',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=700&q=75');

  -- ===========================================================
  -- BLOQUE 2: Eventos PASADOS + ratings de daubar
  -- Solo se crean los eventos y las valoraciones.
  -- No se tocan event_participants para no disparar el trigger.
  -- ===========================================================

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_futbol7, 'Fútbol 7 Semanal Majadahonda', '2026-05-24', '19:00',
    'Majadahonda', 'Campo Municipal Majadahonda, C. del Deportista',
    40.4700, -3.8720, 'Intermedio', 18, 45, 'Masculino', 14, 14, 'full', '')
  RETURNING id INTO e1;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_padel, 'Pádel Tarde Pozuelo', '2026-05-17', '20:00',
    'Pozuelo de Alarcón', 'Club Pádel Pozuelo, Av. de Europa 20',
    40.4350, -3.8140, 'Intermedio', 20, 50, 'Mixto', 4, 4, 'full', '')
  RETURNING id INTO e2;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_basket, 'Baloncesto 5×5 Madrid', '2026-05-10', '21:00',
    'Madrid', 'Polideportivo Moscardó, C. de Moscardó',
    40.4010, -3.7010, 'Intermedio', 18, 40, 'Masculino', 10, 10, 'full', '')
  RETURNING id INTO e3;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_running, 'Carrera Popular Boadilla', '2026-05-03', '09:00',
    'Boadilla del Monte', 'Parque de Boadilla, entrada principal',
    40.4070, -3.8760, 'Principiante', 16, 60, 'Mixto', 25, 25, 'full', '')
  RETURNING id INTO e4;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_tenis, 'Tenis Dobles Puerta de Hierro', '2026-04-26', '11:00',
    'Madrid', 'Parque Deportivo Puerta de Hierro',
    40.4550, -3.7420, 'Avanzado', 22, 45, 'Masculino', 4, 4, 'full', '')
  RETURNING id INTO e5;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_voley, 'Vóley Playa Arena Madrid', '2026-04-19', '17:00',
    'Madrid', 'Arena Madrid, C. del Príncipe de Vergara 2',
    40.4320, -3.6780, 'Principiante', 18, 55, 'Mixto', 8, 8, 'full', '')
  RETURNING id INTO e6;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_futsal, 'Fútbol Sala Las Rozas Noche', '2026-04-12', '20:00',
    'Las Rozas', 'Pabellón Las Matas, Av. de Las Matas 12',
    40.4880, -3.8810, 'Intermedio', 18, 40, 'Mixto', 10, 10, 'full', '')
  RETURNING id INTO e7;

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng,
    level, min_age, max_age, gender, total_places, current_participants, status, directions)
  VALUES (v_ciclismo, 'Ruta MTB Galapagar', '2026-04-05', '09:00',
    'Galapagar', 'Embalse de Los Peñascales, aparcamiento',
    40.5750, -4.0000, 'Intermedio', 20, 50, 'Masculino', 15, 15, 'full', '')
  RETURNING id INTO e8;

  -- Valoraciones de daubar con created_at escalonado semana a semana
  -- (computeStreak usa created_at → 8 semanas consecutivas = racha de 8)
  INSERT INTO event_ratings (user_id, event_id, rating, comment, created_at) VALUES
    (v_daubar_id, e1, 5, '¡Partidazo! Gran nivel y muy buen rollo en el equipo.',   '2026-06-04T20:00:00Z'),
    (v_daubar_id, e2, 4, 'Muy buenas pistas, el nivel estaba bien igualado.',        '2026-05-28T21:00:00Z'),
    (v_daubar_id, e3, 5, 'Partido muy emocionante, igualado hasta el final.',        '2026-05-21T22:00:00Z'),
    (v_daubar_id, e4, 4, 'Ambiente genial, ritmo perfecto para todos los niveles.',  '2026-05-14T10:00:00Z'),
    (v_daubar_id, e5, 3, 'Buen partido aunque el nivel era algo desigual.',          '2026-05-07T12:00:00Z'),
    (v_daubar_id, e6, 5, '¡Increíble sesión! La mejor tarde del verano sin duda.',  '2026-04-30T18:00:00Z'),
    (v_daubar_id, e7, 4, 'Gran organización y nivel excelente.',                     '2026-04-23T21:00:00Z'),
    (v_daubar_id, e8, 5, 'Ruta espectacular, volveré seguro el mes que viene.',      '2026-04-16T10:00:00Z');

  -- Sincronizar completed_count y current_streak en el perfil
  -- (la app no usa trigger para esto, lo actualiza manualmente al valorar)
  UPDATE profiles
  SET completed_count = 8,
      current_streak  = 8
  WHERE id = v_daubar_id;

  RAISE NOTICE 'Seed completado para daubar (%) — 8 eventos, racha 8 semanas', v_daubar_id;
END $$;
