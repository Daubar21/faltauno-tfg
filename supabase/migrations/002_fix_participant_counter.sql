-- ============================================================
-- Migración 002: Corrección del contador de participantes
-- y nuevos eventos de ejemplo
-- ============================================================

-- 1. Recrear sync_event_participants con SECURITY DEFINER
--    para que el trigger pueda hacer UPDATE en events
--    aunque el usuario no sea el creador del evento.
CREATE OR REPLACE FUNCTION sync_event_participants()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM event_participants
  WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status = 'active';

  SELECT total_places INTO v_total
  FROM events
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);

  UPDATE events
  SET
    current_participants = v_count,
    status = CASE
      WHEN status = 'cancelled' THEN 'cancelled'
      WHEN v_count >= v_total   THEN 'full'
      ELSE 'open'
    END
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Nuevos eventos de ejemplo (más variedad de ciudades y deportes)
DO $$
DECLARE
  v_futbol      INTEGER;
  v_futsal      INTEGER;
  v_futbol11    INTEGER;
  v_padel       INTEGER;
  v_tenis       INTEGER;
  v_basket      INTEGER;
  v_running     INTEGER;
  v_voley       INTEGER;
  v_natacion    INTEGER;
  v_ciclismo    INTEGER;
  v_golf        INTEGER;
BEGIN
  SELECT id INTO v_futbol   FROM sports WHERE name = 'Futbol 7';
  SELECT id INTO v_futsal   FROM sports WHERE name = 'Futbol Sala';
  SELECT id INTO v_futbol11 FROM sports WHERE name = 'Futbol 11';
  SELECT id INTO v_padel    FROM sports WHERE name = 'Padel';
  SELECT id INTO v_tenis    FROM sports WHERE name = 'Tenis';
  SELECT id INTO v_basket   FROM sports WHERE name = 'Baloncesto';
  SELECT id INTO v_running  FROM sports WHERE name = 'Running';
  SELECT id INTO v_voley    FROM sports WHERE name = 'Voley Playa';
  SELECT id INTO v_natacion FROM sports WHERE name = 'Natacion';
  SELECT id INTO v_ciclismo FROM sports WHERE name = 'Ciclismo';
  SELECT id INTO v_golf     FROM sports WHERE name = 'Golf';

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng, level, min_age, max_age, gender, total_places, status, directions, image_url) VALUES

  -- ── FÚTBOL 7 ───────────────────────────────────────────────────
  (v_futbol,  'Fútbol 7 Cañillejas Tarde',        CURRENT_DATE + 3,  '20:00', 'Madrid', 'Campo Municipal Cañillejas, C. Alcalá',    40.4380, -3.6100, 'Intermedio',   20, 42, 'Mixto',     14, 'open', 'Hierba artificial. Vestuarios disponibles.',       'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol,  'Fútbol 7 Vallecas Amigos',         CURRENT_DATE + 9,  '19:30', 'Madrid', 'Polideportivo Vallecas, C. Puerto del Milagro', 40.3810, -3.6620, 'Principiante', 18, 50, 'Masculino', 14, 'open', 'Aparcamiento libre en la calle.',                  'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol,  'Fútbol 7 Sanse Fin de Semana',     CURRENT_DATE + 14, '11:00', 'Madrid', 'Polideportivo San Sebastián de los Reyes',   40.5490, -3.6250, 'Intermedio',   20, 45, 'Mixto',     14, 'open', 'Bus L-7 parada Pinares. Pista cubierta.',          'https://images.unsplash.com/photo-1551958219-acbc595d5646'),

  -- ── PÁDEL ──────────────────────────────────────────────────────
  (v_padel,   'Pádel Dobles Alcobendas',          CURRENT_DATE + 4,  '09:30', 'Madrid', 'Club Pádel Alcobendas, Av. de Madrid',      40.5460, -3.6440, 'Principiante', 18, 58, 'Mixto',      4, 'open', 'Bar y vestuarios disponibles.',                    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
  (v_padel,   'Pádel Femenino Pozuelo',           CURRENT_DATE + 10, '10:00', 'Madrid', 'Club de Pádel Pozuelo, C. Arroyo Barrancos', 40.4350, -3.8180, 'Intermedio',   22, 48, 'Femenino',   4, 'open', 'Pistas cubiertas con climatización.',              'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),

  -- ── BALONCESTO ─────────────────────────────────────────────────
  (v_basket,  'Basket Mixto Carabanchel',         CURRENT_DATE + 6,  '19:00', 'Madrid', 'Polideportivo Orcasitas, Av. Pradolongo',   40.3640, -3.7060, 'Principiante', 16, 45, 'Mixto',     10, 'open', 'Pabellón cubierto, aparcamiento gratuito.',        'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
  (v_basket,  'Basket 5x5 Fuencarral',            CURRENT_DATE + 11, '20:30', 'Madrid', 'Polideportivo Fuencarral, C. Orense',       40.4900, -3.6920, 'Intermedio',   20, 40, 'Masculino', 10, 'open', 'Pista de parquet, zapatillas de pista.',           'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
  (v_basket,  'Basket 3x3 Latina Mixto',          CURRENT_DATE + 18, '18:00', 'Madrid', 'Pista al Aire Libre La Latina, Madrid',     40.4060, -3.7160, 'Principiante', 16, 50, 'Mixto',      6, 'open', 'Pista exterior cubierta. Ambiente familiar.',      'https://images.unsplash.com/photo-1546519638-68e109498ffc'),

  -- ── RUNNING ────────────────────────────────────────────────────
  (v_running, 'Running Nocturno Retiro',           CURRENT_DATE + 1,  '21:00', 'Madrid', 'Parque del Retiro, Puerta de Alcalá',       40.4153, -3.6843, 'Intermedio',   18, 50, 'Mixto',     25, 'open', 'Salida desde la fuente de Alcalá. 8 km.',          'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
  (v_running, 'Running 5K Principiantes',          CURRENT_DATE + 7,  '08:30', 'Madrid', 'Parque Juan Carlos I, Madrid',              40.4670, -3.6060, 'Principiante', 16, 65, 'Mixto',     30, 'open', 'Ritmo muy suave. Nadie se queda atrás.',           'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
  (v_running, 'Trail Running Monte Pardo',         CURRENT_DATE + 20, '08:00', 'Madrid', 'Monte de El Pardo, Aparcamiento Sur',       40.5200, -3.7600, 'Avanzado',     22, 48, 'Mixto',     12, 'open', 'Ruta de 18 km. Terreno irregular, bastones opcionales.', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),

  -- ── TENIS ──────────────────────────────────────────────────────
  (v_tenis,   'Tenis Mixto Aluche',               CURRENT_DATE + 5,  '10:30', 'Madrid', 'Club de Tenis Aluche, Madrid',              40.3860, -3.7270, 'Principiante', 16, 65, 'Mixto',      2, 'open', 'Pistas de tierra batida. Monitor opcional.',       'https://images.unsplash.com/photo-1530549387789-4c1017266635'),
  (v_tenis,   'Tenis Competitivo Hortaleza',       CURRENT_DATE + 16, '17:30', 'Madrid', 'Parque Deportivo Hortaleza, Madrid',        40.4720, -3.6400, 'Avanzado',     20, 45, 'Masculino',  2, 'open', 'Nivel alto. Traer propia raqueta y pelotas.',      'https://images.unsplash.com/photo-1530549387789-4c1017266635'),

  -- ── FÚTBOL SALA ────────────────────────────────────────────────
  (v_futsal,  'Futsal Mixto Moratalaz',            CURRENT_DATE + 6,  '20:00', 'Madrid', 'Polideportivo Moratalaz, C. Valdebernardo', 40.4050, -3.6380, 'Principiante', 16, 55, 'Mixto',     10, 'open', 'Pista cubierta. Sin nivel requerido.',             'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futsal,  'Fútbol Sala Torrejón Noche',        CURRENT_DATE + 13, '21:30', 'Madrid', 'Pabellón Torrejón de Ardoz, Av. Constitución', 40.4590, -3.4820, 'Intermedio', 20, 40, 'Masculino', 10, 'open', 'Competición amistosa entre equipos del barrio.',   'https://images.unsplash.com/photo-1551958219-acbc595d5646'),

  -- ── FÚTBOL 11 ──────────────────────────────────────────────────
  (v_futbol11,'Fútbol 11 Alcalá de Henares',      CURRENT_DATE + 12, '10:30', 'Madrid', 'CD Complutense, Alcalá de Henares',         40.4820, -3.3640, 'Intermedio',   20, 42, 'Masculino', 22, 'open', 'Campo de cesped natural. Concentración 15 min antes.', 'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol11,'Fútbol 11 Getafe Amateur',         CURRENT_DATE + 25, '11:00', 'Madrid', 'Ciudad Deportiva Getafe, Av. Alhucemas',    40.3240, -3.7210, 'Principiante', 18, 52, 'Mixto',     22, 'open', 'Ambiente relajado. Árbitro incluido.',             'https://images.unsplash.com/photo-1551958219-acbc595d5646'),

  -- ── VÓLEY PLAYA ────────────────────────────────────────────────
  (v_voley,   'Vóley Playa Mixto Sábado',         CURRENT_DATE + 8,  '17:30', 'Madrid', 'Playa de Madrid, Casa de Campo',            40.4100, -3.7450, 'Principiante', 16, 55, 'Mixto',      8, 'open', 'Arena natural. Buen ambiente, nivel bajo.',        'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),
  (v_voley,   'Vóley Avanzado Liga Indoor',        CURRENT_DATE + 19, '20:00', 'Madrid', 'Pabellón Municipal Chamartín, Madrid',      40.4650, -3.6810, 'Avanzado',     20, 40, 'Femenino',   8, 'open', 'Competición indoor. Ropa y zapatillas de pista.',  'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),

  -- ── NATACIÓN ───────────────────────────────────────────────────
  (v_natacion,'Natación Mixta Majadahonda',        CURRENT_DATE + 5,  '07:30', 'Madrid', 'Piscina Municipal Majadahonda, C. Guadarrama', 40.4730, -3.8720, 'Principiante', 16, 65, 'Mixto',  15, 'open', 'Carril libre. Gorro de silicona obligatorio.',    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),
  (v_natacion,'Natación Competición Leganés',      CURRENT_DATE + 17, '07:00', 'Madrid', 'Piscina Olímpica Leganés, Av. Bruselas',    40.3290, -3.7640, 'Avanzado',     18, 42, 'Masculino', 10, 'open', 'Series técnicas. Mínimo 1500 m por sesión.',      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),

  -- ── CICLISMO ───────────────────────────────────────────────────
  (v_ciclismo,'Ruta Ciclista Guadalix',            CURRENT_DATE + 11, '08:30', 'Madrid', 'Salida: Guadalix de la Sierra',             40.7830, -3.7090, 'Intermedio',   20, 55, 'Mixto',     15, 'open', '45 km por sierra. Bici de carretera recomendada.',  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),
  (v_ciclismo,'Paseo MTB Lozoya',                  CURRENT_DATE + 26, '09:00', 'Madrid', 'Salida: Embalse de Pinilla, Lozoya',        40.9050, -3.8640, 'Principiante', 18, 60, 'Mixto',     12, 'open', '20 km por sendero forestal. Nivel bajo.',           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),

  -- ── GOLF ───────────────────────────────────────────────────────
  (v_golf,    'Golf 9 Hoyos Barrios',              CURRENT_DATE + 9,  '09:00', 'Madrid', 'Club de Golf Los Barrios, Tres Cantos',     40.5900, -3.7050, 'Intermedio',   22, 65, 'Mixto',      4, 'open', 'Campo de 9 hoyos. Alquiler de palos disponible.',  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b'),
  (v_golf,    'Golf Iniciación Alcalá',             CURRENT_DATE + 23, '10:00', 'Madrid', 'Club de Golf Alcalá, Av. Universidad',     40.4820, -3.3640, 'Principiante', 18, 70, 'Mixto',      4, 'open', 'Monitor para principiantes. Palos incluidos.',     'https://images.unsplash.com/photo-1535131749006-b7f58c99034b');

END $$;
