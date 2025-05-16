-- ============================================================
-- Migración 001: Nuevos deportes, columna max_days y más eventos
-- Ejecutar contra la base de datos Supabase existente
-- ============================================================

-- 1. Añadir columna max_days a user_preferences (si no existe)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS max_days INTEGER DEFAULT 30;

-- 2. Nuevos deportes (se ignoran si ya existen)
INSERT INTO sports (name, icon, base_price) VALUES
  ('Futbol Sala', 'FaFutbol',       3.50),
  ('Futbol 11',   'FaFutbol',       5.00),
  ('Tenis',       'GiTennisRacket', 6.00),
  ('Natacion',    'FaSwimmer',      4.00),
  ('Ciclismo',    'FaBicycle',      1.00),
  ('Golf',        'FaGolfBall',    10.00)
ON CONFLICT (name) DO NOTHING;

-- 3. Insertar nuevos eventos de muestra
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

  -- ── FÚTBOL 7 ───────────────────────────────────────────────────────────────
  (v_futbol, 'Fútbol 7 Tarde Relajado',         CURRENT_DATE + 2,  '19:00', 'Madrid', 'Campo Municipal Vicálvaro, C. Arroyo del Osea',  40.3970, -3.6100, 'Principiante', 18, 50, 'Mixto',     14, 'open', 'Vestuarios disponibles. Hierba artificial.',             'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol, 'Partido Fútbol 7 Amigos',          CURRENT_DATE + 5,  '20:00', 'Madrid', 'Ciudad Deportiva La Almudena, Madrid',            40.4050, -3.6350, 'Intermedio',   20, 45, 'Masculino', 14, 'open', 'Aparcamiento gratuito junto al campo.',                  'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol, 'Fútbol 7 Mixto Barrio',            CURRENT_DATE + 18, '11:00', 'Madrid', 'C. de Francos Rodríguez 40, Tetuán',             40.4580, -3.7100, 'Principiante', 16, 55, 'Mixto',     14, 'open', 'Instalación cubierta, acceso libre.',                    'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol, 'Fútbol 7 Competición Sabado',      CURRENT_DATE + 23, '17:30', 'Madrid', 'C. Silvano 77, Hortaleza',                       40.4650, -3.6450, 'Avanzado',     22, 40, 'Masculino', 14, 'open', 'Liga de barrio, puntos en juego.',                       'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol, 'Fútbol 7 Noche Viernes',           CURRENT_DATE + 26, '22:00', 'Madrid', 'C. de Bravo Murillo 200, Madrid',                40.4530, -3.7020, 'Intermedio',   20, 38, 'Masculino', 14, 'open', 'Iluminación LED. Pista cubierta.',                       'https://images.unsplash.com/photo-1551958219-acbc595d5646'),

  -- ── FÚTBOL SALA ────────────────────────────────────────────────────────────
  (v_futsal,  'Fútbol Sala Mixto Lunes',          CURRENT_DATE + 3,  '21:00', 'Madrid', 'Polideportivo La Elipa, Av. de la Paz',          40.4280, -3.6420, 'Intermedio',   18, 45, 'Mixto',      10, 'open', 'Pista cubierta climatizada. Vestuarios incluidos.',      'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futsal,  'Futsal Principiantes Tarde',       CURRENT_DATE + 8,  '19:30', 'Madrid', 'Centro Deportivo Moscardó, Arganzuela',          40.4010, -3.7010, 'Principiante', 16, 60, 'Mixto',      10, 'open', 'Entramos en grupo. Nadie se queda fuera.',               'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futsal,  'Fútbol Sala Liga Avanzado',        CURRENT_DATE + 20, '20:30', 'Madrid', 'Pabellón Municipal Vallecas, Madrid',            40.3800, -3.6640, 'Avanzado',     20, 38, 'Masculino',  10, 'open', 'Competición oficial. Traer equipación.',                 'https://images.unsplash.com/photo-1551958219-acbc595d5646'),

  -- ── FÚTBOL 11 ──────────────────────────────────────────────────────────────
  (v_futbol11,'Partido Fútbol 11 Domingo',        CURRENT_DATE + 6,  '10:00', 'Madrid', 'Ciudad Universitaria, Av. Complutense',          40.4440, -3.7290, 'Intermedio',   18, 40, 'Masculino',  22, 'open', 'Cesped natural. Concentración 30 min antes.',            'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
  (v_futbol11,'Fútbol 11 Amateur Sábado',         CURRENT_DATE + 15, '11:00', 'Madrid', 'Campo de Carabanchel, Av. de Oporto',            40.3850, -3.7420, 'Principiante', 18, 55, 'Mixto',      22, 'open', 'Buen ambiente, sin presión. Árbitro incluido.',          'https://images.unsplash.com/photo-1551958219-acbc595d5646'),

  -- ── PÁDEL ──────────────────────────────────────────────────────────────────
  (v_padel,  'Pádel Matutino Femenino',           CURRENT_DATE + 2,  '08:30', 'Madrid', 'Club de Pádel Arturo Soria, Madrid',             40.4600, -3.6720, 'Principiante', 18, 55, 'Femenino',    4, 'open', 'Monitor disponible para principiantes.',                 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
  (v_padel,  'Pádel Mix Casual Tarde',            CURRENT_DATE + 17, '12:00', 'Madrid', 'Club Top Pádel 20, Av. de Burgos',               40.4850, -3.6650, 'Intermedio',   20, 50, 'Mixto',        4, 'open', 'Pistas cubiertas con luz. Duchas incluidas.',            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
  (v_padel,  'Pádel Avanzado Noche',              CURRENT_DATE + 22, '19:00', 'Madrid', 'Pádel Indoor Moncloa, Madrid',                   40.4360, -3.7180, 'Avanzado',     25, 45, 'Masculino',    4, 'open', 'Partido de alta competencia. Traer raqueta propia.',     'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
  (v_padel,  'Pádel Dobles Mixtos',               CURRENT_DATE + 27, '10:30', 'Madrid', 'Instalación WPT Pozuelo, Madrid',                40.4350, -3.8190, 'Intermedio',   22, 48, 'Mixto',        4, 'open', 'Aparcamiento amplio. Bar en el club.',                   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),

  -- ── TENIS ──────────────────────────────────────────────────────────────────
  (v_tenis,  'Tenis Principiantes Mañana',        CURRENT_DATE + 4,  '10:00', 'Madrid', 'Club de Tenis El Olivar, Moratalaz',             40.4050, -3.6380, 'Principiante', 16, 65, 'Mixto',        2, 'open', 'Profesor disponible. Raquetas prestadas si necesitas.',  'https://images.unsplash.com/photo-1530549387789-4c1017266635'),
  (v_tenis,  'Tenis Femenino Intermedio',         CURRENT_DATE + 11, '12:00', 'Madrid', 'Real Club de Tenis La Moraleja',                 40.4900, -3.6380, 'Intermedio',   18, 50, 'Femenino',     2, 'open', 'Pistas de tierra batida. Reservar con antelación.',      'https://images.unsplash.com/photo-1530549387789-4c1017266635'),
  (v_tenis,  'Tenis Avanzado Tarde',              CURRENT_DATE + 19, '18:00', 'Madrid', 'Parque Deportivo Puerta de Hierro, Madrid',      40.4550, -3.7420, 'Avanzado',     22, 45, 'Masculino',    2, 'open', 'Pistas de hierba. Competición amistosa.',                'https://images.unsplash.com/photo-1530549387789-4c1017266635'),
  (v_tenis,  'Tenis Dobles Dominguero',           CURRENT_DATE + 25, '09:00', 'Madrid', 'Club Deportivo Chamartín, Madrid',               40.4720, -3.6780, 'Principiante', 20, 60, 'Mixto',        4, 'open', 'Ambiente muy tranquilo. Perfecto para recomenzar.',      'https://images.unsplash.com/photo-1530549387789-4c1017266635'),

  -- ── BALONCESTO ─────────────────────────────────────────────────────────────
  (v_basket,  'Basket 3x3 Femenino',              CURRENT_DATE + 5,  '19:00', 'Madrid', 'Polideportivo Moscardó, Arganzuela',             40.4010, -3.7010, 'Intermedio',   16, 40, 'Femenino',     6, 'open', 'Pista interior, ambiente genial.',                       'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
  (v_basket,  'Basket Callejero Domingo',         CURRENT_DATE + 16, '10:00', 'Madrid', 'Cancha del Retiro, Parque del Buen Retiro',      40.4153, -3.6843, 'Principiante', 16, 45, 'Mixto',       10, 'open', 'Pista al aire libre. Ambiente muy familiar.',            'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
  (v_basket,  'Basket 5x5 Liga Barrio',           CURRENT_DATE + 21, '20:00', 'Madrid', 'Polideportivo Hortaleza, C. Silvano',            40.4720, -3.6400, 'Avanzado',     20, 40, 'Masculino',   10, 'open', 'Punto de clasificación para la liga local.',             'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
  (v_basket,  'Basket Mixto Tarde Relajado',      CURRENT_DATE + 28, '17:30', 'Madrid', 'IES Moratalaz, C. Valdebernardo',               40.4050, -3.6380, 'Principiante', 16, 55, 'Mixto',       10, 'open', 'Sin nivel requerido. Ven a pasarlo bien.',               'https://images.unsplash.com/photo-1546519638-68e109498ffc'),

  -- ── RUNNING ────────────────────────────────────────────────────────────────
  (v_running, 'Running Femenino Amanecer',        CURRENT_DATE + 3,  '07:30', 'Madrid', 'Parque del Buen Retiro, Entrada Ibiza',          40.4153, -3.6843, 'Principiante', 16, 60, 'Femenino',    20, 'open', 'Quedada junto a la fuente de Ibiza. Ritmo suave.',       'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
  (v_running, 'Running Técnico Intermedios',      CURRENT_DATE + 12, '08:00', 'Madrid', 'Estadio de Atletismo Vallehermoso, Madrid',      40.4380, -3.7200, 'Intermedio',   18, 55, 'Masculino',   15, 'open', 'Sesión con trabajo de cadencia y zancada.',              'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
  (v_running, 'Ruta Nocturna Casa de Campo',      CURRENT_DATE + 21, '21:00', 'Madrid', 'Casa de Campo, Aparcamiento Principal',          40.4100, -3.7450, 'Avanzado',     20, 45, 'Mixto',       20, 'open', 'Llevar linterna frontal. 12 km aproximados.',           'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
  (v_running, 'Carrera Solidaria Popular',        CURRENT_DATE + 29, '09:00', 'Madrid', 'Paseo del Prado, frente al Museo',               40.4130, -3.6920, 'Principiante', 16, 70, 'Mixto',       50, 'open', 'Carrera popular. Inscripción gratuita en el acto.',      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),

  -- ── VÓLEY PLAYA ────────────────────────────────────────────────────────────
  (v_voley,   'Vóley Playa Femenino Tarde',       CURRENT_DATE + 7,  '12:00', 'Madrid', 'Polideportivo Mar de Cristal, Madrid',           40.4750, -3.6200, 'Intermedio',   18, 45, 'Femenino',     8, 'open', 'Arena sintética de calidad, vestuarios modernos.',       'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),
  (v_voley,   'Vóley Playa Mixto Principiantes',  CURRENT_DATE + 23, '17:00', 'Madrid', 'Arena Madrid, C. del Príncipe de Vergara',       40.4320, -3.6780, 'Principiante', 16, 55, 'Mixto',        8, 'open', 'Aprendemos juntos. Monitor de iniciación presente.',     'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),
  (v_voley,   'Torneo Vóley Equipos 4v4',         CURRENT_DATE + 29, '10:00', 'Madrid', 'Playa de Madrid, Casa de Campo',                 40.4100, -3.7450, 'Avanzado',     20, 45, 'Mixto',       16, 'open', 'Formato torneo 4v4. Traer equipo formado.',             'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),

  -- ── NATACIÓN ───────────────────────────────────────────────────────────────
  (v_natacion,'Natación Principiantes Mañana',    CURRENT_DATE + 2,  '07:00', 'Madrid', 'Piscina Municipal La Latina, Madrid',            40.4050, -3.7150, 'Principiante', 16, 65, 'Mixto',       15, 'open', 'Carril lento disponible. Traer gorro y gafas.',         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),
  (v_natacion,'Natación Femenino Intermedias',    CURRENT_DATE + 9,  '07:30', 'Madrid', 'Piscina Olímpica Vallehermoso, Madrid',          40.4380, -3.7200, 'Intermedio',   18, 55, 'Femenino',    12, 'open', 'Carril exclusivo. Mínimo 1 km por sesión.',             'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),
  (v_natacion,'Natación Avanzado Competición',    CURRENT_DATE + 16, '07:00', 'Madrid', 'Piscina Municipal Chamartín, Madrid',            40.4650, -3.6810, 'Avanzado',     18, 45, 'Masculino',   10, 'open', 'Entrenamiento técnico. 2 km mínimo de experiencia.',    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),
  (v_natacion,'Natación Familiar Fin de Semana',  CURRENT_DATE + 24, '10:00', 'Madrid', 'Piscina del Canal, Av. de Filipinas',            40.4450, -3.7110, 'Principiante', 16, 70, 'Mixto',       20, 'open', 'Piscina exterior en verano. Zona de baño libre.',       'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'),

  -- ── CICLISMO ───────────────────────────────────────────────────────────────
  (v_ciclismo,'Ruta Ciclista Principiantes',      CURRENT_DATE + 4,  '08:00', 'Madrid', 'Casa de Campo, Aparcamiento Los Pinos',          40.4100, -3.7450, 'Principiante', 16, 65, 'Mixto',       20, 'open', 'Ruta de 25 km por carril bici. Ritmo suave.',           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),
  (v_ciclismo,'Ruta MTB Intermedia',              CURRENT_DATE + 13, '09:00', 'Madrid', 'Bosque del Monte de El Pardo, Madrid',           40.5050, -3.7500, 'Intermedio',   20, 50, 'Masculino',   15, 'open', 'MTB por senderos. Bicicleta de montaña obligatoria.',   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),
  (v_ciclismo,'Ruta Cicloturista Avanzada',       CURRENT_DATE + 22, '07:30', 'Madrid', 'Salida: Puerto de Navacerrada, Madrid',          40.7800, -4.0100, 'Avanzado',     22, 45, 'Mixto',       12, 'open', '80 km con 1200 m de desnivel. Imprescindible bici road.','https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),
  (v_ciclismo,'Paseo Ciclista Familiar',          CURRENT_DATE + 28, '10:00', 'Madrid', 'Parque Juan Carlos I, Madrid',                   40.4670, -3.6060, 'Principiante', 16, 70, 'Femenino',    18, 'open', 'Carril bici del parque. 15 km tranquilos.',             'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'),

  -- ── GOLF ───────────────────────────────────────────────────────────────────
  (v_golf,   'Golf Iniciación Mañana',            CURRENT_DATE + 6,  '09:00', 'Madrid', 'Club de Golf La Herrería, El Escorial',          40.5900, -4.1400, 'Principiante', 18, 70, 'Mixto',        4, 'open', 'Incluye alquiler de palos y bola. Instructor presente.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b'),
  (v_golf,   'Golf Intermedio 9 Hoyos',           CURRENT_DATE + 17, '10:00', 'Madrid', 'Real Club de Golf de La Moraleja, Madrid',       40.4900, -3.6380, 'Intermedio',   25, 65, 'Masculino',    4, 'open', 'Campo de 18 hoyos. Jugamos los primeros 9.',            'https://images.unsplash.com/photo-1535131749006-b7f58c99034b'),
  (v_golf,   'Torneo Golf Friendly',              CURRENT_DATE + 27, '09:30', 'Madrid', 'Club de Golf Retamares, Alcorcón',               40.3600, -3.8250, 'Avanzado',     25, 65, 'Mixto',        8, 'open', 'Torneo Stableford. Hándicap máximo 28.',                'https://images.unsplash.com/photo-1535131749006-b7f58c99034b');

END $$;
