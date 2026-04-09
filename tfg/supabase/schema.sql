-- ============================================================
-- FaltaUno - Schema completo de Supabase
-- TFG - DAWE 2º
-- ============================================================


-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLA: sports
-- Referencia de deportes disponibles en la plataforma
-- ============================================================
CREATE TABLE sports (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  icon        TEXT NOT NULL,          -- nombre del icono (ej: 'FaFutbol')
  base_price  NUMERIC(4,2) NOT NULL DEFAULT 0
);

INSERT INTO sports (name, icon, base_price) VALUES
  ('Futbol 7',    'FaFutbol',       4.00),
  ('Padel',       'FaTableTennis',  8.00),
  ('Baloncesto',  'FaBasketball',   3.00),
  ('Running',     'FaRunning',      0.00),
  ('Voley Playa', 'FaVolleyball',   2.00);


-- ============================================================
-- TABLA: profiles
-- Perfil extendido del usuario, vinculado a auth.users
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  city          TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  age           INTEGER CHECK (age >= 16 AND age <= 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para crear profile automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- TABLA: user_favorite_sports
-- Relación many-to-many: usuario ↔ deportes favoritos
-- ============================================================
CREATE TABLE user_favorite_sports (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sport_id  INTEGER REFERENCES sports(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, sport_id)
);


-- ============================================================
-- TABLA: user_preferences
-- Preferencias de filtros y notificaciones por usuario
-- ============================================================
CREATE TABLE user_preferences (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- filtros de búsqueda
  user_age             INTEGER DEFAULT 27 CHECK (user_age >= 16 AND user_age <= 100),
  max_distance_km      INTEGER DEFAULT 15 CHECK (max_distance_km >= 1 AND max_distance_km <= 30),
  max_price            NUMERIC(4,2) DEFAULT 10.00,
  selected_sports      TEXT[] DEFAULT '{}',
  selected_levels      TEXT[] DEFAULT '{}',
  selected_genders     TEXT[] DEFAULT '{}',
  -- preferencias de notificaciones
  notif_reminders      BOOLEAN DEFAULT TRUE,
  notif_status_updates BOOLEAN DEFAULT TRUE,
  notif_new_events     BOOLEAN DEFAULT TRUE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para crear preferencias automáticamente al crear perfil
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();


-- ============================================================
-- TABLA: events
-- Eventos deportivos publicados en la plataforma
-- ============================================================
CREATE TABLE events (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id             INTEGER NOT NULL REFERENCES sports(id),
  created_by           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title                TEXT NOT NULL,
  event_date           DATE NOT NULL,
  event_time           TIME NOT NULL,
  city                 TEXT NOT NULL,
  address              TEXT NOT NULL,
  lat                  NUMERIC(10, 7) NOT NULL,
  lng                  NUMERIC(10, 7) NOT NULL,
  level                TEXT NOT NULL CHECK (level IN ('Principiante', 'Intermedio', 'Avanzado')),
  min_age              INTEGER NOT NULL DEFAULT 16 CHECK (min_age >= 16),
  max_age              INTEGER NOT NULL DEFAULT 60 CHECK (max_age <= 100),
  gender               TEXT NOT NULL CHECK (gender IN ('Femenino', 'Masculino', 'Mixto')),
  total_places         INTEGER NOT NULL CHECK (total_places > 0),
  current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
  status               TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled')),
  directions           TEXT,
  image_url            TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT max_ge_min_age CHECK (max_age >= min_age),
  CONSTRAINT participants_le_places CHECK (current_participants <= total_places)
);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices para búsquedas frecuentes
CREATE INDEX idx_events_sport_id ON events(sport_id);
CREATE INDEX idx_events_status   ON events(status);
CREATE INDEX idx_events_date     ON events(event_date);
CREATE INDEX idx_events_city     ON events(city);
CREATE INDEX idx_events_level    ON events(level);
CREATE INDEX idx_events_gender   ON events(gender);


-- ============================================================
-- TABLA: event_participants
-- Relación many-to-many: usuario ↔ eventos a los que se ha unido
-- ============================================================
CREATE TABLE event_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user  ON event_participants(user_id);

-- Trigger para actualizar current_participants y status del evento
CREATE OR REPLACE FUNCTION sync_event_participants()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_total INTEGER;
BEGIN
  -- Calcular participantes activos
  SELECT COUNT(*) INTO v_count
  FROM event_participants
  WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND status = 'active';

  SELECT total_places INTO v_total
  FROM events
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);

  -- Actualizar contador y estado
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_participant_change
  AFTER INSERT OR UPDATE OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION sync_event_participants();


-- ============================================================
-- TABLA: swipe_history
-- Registro de swipes del usuario (izquierda = pasar, derecha = unirse)
-- Sirve para no volver a mostrar eventos ya vistos
-- ============================================================
CREATE TABLE swipe_history (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  direction  TEXT NOT NULL CHECK (direction IN ('like', 'pass')),
  swiped_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);

CREATE INDEX idx_swipe_history_user ON swipe_history(user_id);


-- ============================================================
-- FUNCIÓN: calcular precio de evento
-- Replica la lógica del frontend para consistencia
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_event_price(p_sport_id INTEGER, p_total_places INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  v_base        NUMERIC;
  v_group_factor NUMERIC;
BEGIN
  SELECT base_price INTO v_base FROM sports WHERE id = p_sport_id;
  v_group_factor := GREATEST(0, 10 - p_total_places) * 0.35;
  RETURN LEAST(10, GREATEST(0, v_base + v_group_factor));
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- FUNCIÓN: obtener eventos filtrados para el deck de swipe
-- Excluye eventos ya vistos por el usuario y aplica filtros
-- ============================================================
CREATE OR REPLACE FUNCTION get_filtered_events(
  p_user_id        UUID,
  p_user_age       INTEGER DEFAULT 27,
  p_max_distance   NUMERIC DEFAULT 15,
  p_max_price      NUMERIC DEFAULT 10,
  p_sports         TEXT[]  DEFAULT '{}',
  p_levels         TEXT[]  DEFAULT '{}',
  p_genders        TEXT[]  DEFAULT '{}'
)
RETURNS TABLE (
  id                   UUID,
  sport_name           TEXT,
  sport_icon           TEXT,
  title                TEXT,
  event_date           DATE,
  event_time           TIME,
  city                 TEXT,
  address              TEXT,
  lat                  NUMERIC,
  lng                  NUMERIC,
  level                TEXT,
  min_age              INTEGER,
  max_age              INTEGER,
  gender               TEXT,
  total_places         INTEGER,
  current_participants INTEGER,
  available_spots      INTEGER,
  status               TEXT,
  directions           TEXT,
  image_url            TEXT,
  price                NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    s.name        AS sport_name,
    s.icon        AS sport_icon,
    e.title,
    e.event_date,
    e.event_time,
    e.city,
    e.address,
    e.lat,
    e.lng,
    e.level,
    e.min_age,
    e.max_age,
    e.gender,
    e.total_places,
    e.current_participants,
    (e.total_places - e.current_participants) AS available_spots,
    e.status,
    e.directions,
    e.image_url,
    calculate_event_price(e.sport_id, e.total_places) AS price
  FROM events e
  JOIN sports s ON s.id = e.sport_id
  WHERE
    -- excluir eventos ya vistos
    NOT EXISTS (
      SELECT 1 FROM swipe_history sh
      WHERE sh.user_id = p_user_id AND sh.event_id = e.id
    )
    -- excluir eventos cancelados o llenos
    AND e.status IN ('open', 'full')
    -- filtro de edad del usuario
    AND p_user_age BETWEEN e.min_age AND e.max_age
    -- filtro de precio
    AND calculate_event_price(e.sport_id, e.total_places) <= p_max_price
    -- filtro de deporte (vacío = todos)
    AND (array_length(p_sports, 1) IS NULL OR s.name = ANY(p_sports))
    -- filtro de nivel (vacío = todos)
    AND (array_length(p_levels, 1) IS NULL OR e.level = ANY(p_levels))
    -- filtro de género (vacío = todos)
    AND (array_length(p_genders, 1) IS NULL OR e.gender = ANY(p_genders))
    -- solo eventos futuros
    AND e.event_date >= CURRENT_DATE
  ORDER BY e.event_date, e.event_time;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfil público visible por todos"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Usuario solo edita su perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- user_favorite_sports
ALTER TABLE user_favorite_sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver favoritos propios"
  ON user_favorite_sports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gestionar favoritos propios"
  ON user_favorite_sports FOR ALL USING (auth.uid() = user_id);


-- user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver preferencias propias"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gestionar preferencias propias"
  ON user_preferences FOR ALL USING (auth.uid() = user_id);


-- events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos visibles por todos los autenticados"
  ON events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Solo el creador puede editar su evento"
  ON events FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Solo el creador puede eliminar su evento"
  ON events FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Usuarios autenticados pueden crear eventos"
  ON events FOR INSERT WITH CHECK (auth.uid() = created_by);


-- event_participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver participantes de cualquier evento"
  ON event_participants FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Unirse a evento"
  ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cancelar propia participacion"
  ON event_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Salir de evento"
  ON event_participants FOR DELETE USING (auth.uid() = user_id);


-- swipe_history
ALTER TABLE swipe_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver historial propio"
  ON swipe_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Registrar swipe propio"
  ON swipe_history FOR INSERT WITH CHECK (auth.uid() = user_id);


-- sports (solo lectura para todos)
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deportes visibles por todos"
  ON sports FOR SELECT USING (true);


-- ============================================================
-- STORAGE BUCKET: avatars
-- Para almacenar imágenes de perfil de usuarios
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatars públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuario sube su propio avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuario actualiza su propio avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuario elimina su propio avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- DATOS DE EJEMPLO (seed)
-- 16 eventos equivalentes al mock del frontend
-- ============================================================
DO $$
DECLARE
  v_futbol     INTEGER;
  v_padel      INTEGER;
  v_basket     INTEGER;
  v_running    INTEGER;
  v_voley      INTEGER;
BEGIN
  SELECT id INTO v_futbol  FROM sports WHERE name = 'Futbol 7';
  SELECT id INTO v_padel   FROM sports WHERE name = 'Padel';
  SELECT id INTO v_basket  FROM sports WHERE name = 'Baloncesto';
  SELECT id INTO v_running FROM sports WHERE name = 'Running';
  SELECT id INTO v_voley   FROM sports WHERE name = 'Voley Playa';

  INSERT INTO events (sport_id, title, event_date, event_time, city, address, lat, lng, level, min_age, max_age, gender, total_places, status, directions, image_url) VALUES
    (v_futbol,  'Partido 7v7 Tarde',            CURRENT_DATE + 4,  '20:30', 'Madrid', 'C. de Alcalá 123, Madrid',           40.4168, -3.7038, 'Intermedio',    18, 40, 'Mixto',     14, 'open',      'Vestuarios disponibles en el pabellón principal.',      'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
    (v_padel,   'Pádel Mix Nivel Medio',         CURRENT_DATE + 1,  '10:00', 'Madrid', 'Av. de la Paz 45, Madrid',           40.4200, -3.6850, 'Intermedio',    20, 45, 'Mixto',      4, 'open',      'Pistas cubiertas, aparcamiento gratuito.',               'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
    (v_basket,  'Baloncesto 3x3 Fin de Semana',  CURRENT_DATE + 3,  '11:00', 'Madrid', 'Parque del Retiro, Madrid',          40.4153, -3.6843, 'Principiante',  16, 35, 'Mixto',      6, 'open',      'Pista al aire libre junto a la entrada principal.',     'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
    (v_running, 'Running Matutino Parque',        CURRENT_DATE + 2,  '08:00', 'Madrid', 'Parque de El Retiro, Madrid',        40.4153, -3.6843, 'Principiante',  16, 60, 'Mixto',     20, 'open',      'Quedada en la fuente de la entrada Alcalá.',            'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
    (v_voley,   'Vóley Playa Recreativo',         CURRENT_DATE + 5,  '17:00', 'Madrid', 'C. del Príncipe de Vergara 2',       40.4320, -3.6780, 'Principiante',  18, 50, 'Mixto',      8, 'open',      'Arena sintética, trae tu propia botella de agua.',      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),
    (v_futbol,  'Fútbol Competitivo Noche',       CURRENT_DATE + 7,  '21:00', 'Madrid', 'C. de Goya 45, Madrid',             40.4250, -3.6780, 'Avanzado',      22, 35, 'Masculino', 14, 'open',      'Traer equipación oscura. Iluminación artificial.',      'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
    (v_padel,   'Pádel Femenino Tarde',           CURRENT_DATE + 6,  '19:00', 'Madrid', 'Av. de Brasil 12, Madrid',          40.4580, -3.6920, 'Avanzado',      25, 45, 'Femenino',   4, 'open',      'Club con bar y vestuarios. Raquetas disponibles.',      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
    (v_basket,  'Basket Avanzado Liga',           CURRENT_DATE + 8,  '20:00', 'Madrid', 'Polideportivo Hortaleza, Madrid',   40.4720, -3.6400, 'Avanzado',      20, 40, 'Masculino', 10, 'open',      'Pabellón cerrado, traer zapatillas de pista.',          'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
    (v_running, 'Trail Running Principiantes',    CURRENT_DATE + 9,  '09:00', 'Madrid', 'Casa de Campo, Madrid',             40.4100, -3.7500, 'Principiante',  18, 55, 'Femenino',  15, 'open',      'Salida desde el aparcamiento principal de Casa de Campo.','https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
    (v_voley,   'Vóley Intermedio Noche',         CURRENT_DATE + 10, '20:30', 'Madrid', 'Polideportivo La Elipa, Madrid',   40.4280, -3.6420, 'Intermedio',    20, 40, 'Mixto',      8, 'open',      'Pista cubierta climatizada.',                           'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),
    (v_futbol,  'Fútbol Sala Mixto',              CURRENT_DATE + 11, '18:30', 'Madrid', 'C. de Alcalá 500, Madrid',          40.4050, -3.6300, 'Intermedio',    18, 45, 'Mixto',     10, 'open',      'Pista de futbol sala cubierta, vestuarios incluidos.',  'https://images.unsplash.com/photo-1551958219-acbc595d5646'),
    (v_padel,   'Pádel Principiantes Mañana',     CURRENT_DATE + 12, '10:30', 'Madrid', 'C. de Serrano 100, Madrid',         40.4350, -3.6880, 'Principiante',  16, 60, 'Mixto',      4, 'open',      'Monitor disponible para principiantes.',                'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'),
    (v_basket,  'Basket 5x5 Juvenil',             CURRENT_DATE + 13, '17:00', 'Madrid', 'IES Ramiro de Maeztu, Madrid',      40.4460, -3.6930, 'Principiante',  16, 25, 'Mixto',     10, 'open',      'Patio del instituto, acceso por la puerta lateral.',    'https://images.unsplash.com/photo-1546519638-68e109498ffc'),
    (v_running, 'Carrera 10K Popular',            CURRENT_DATE + 14, '08:30', 'Madrid', 'Paseo de la Castellana, Madrid',    40.4530, -3.6920, 'Intermedio',    18, 55, 'Mixto',     30, 'open',      'Salida frente al Palacio de los Deportes.',             'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'),
    (v_voley,   'Torneo Vóley Playa Verano',      CURRENT_DATE + 15, '16:00', 'Madrid', 'Playa de Madrid, Casa de Campo',    40.4100, -3.7450, 'Avanzado',      18, 45, 'Mixto',     16, 'open',      'Torneo con árbitro. Trae tu equipo de 4.',             'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1'),
    (v_futbol,  'Fútbol 7 Aficionados',           CURRENT_DATE + 16, '19:00', 'Madrid', 'Ciudad Deportiva Real Madrid',      40.4600, -3.7100, 'Principiante',  20, 50, 'Masculino', 14, 'open',      'Aparcar en zona azul, pistas de hierba artificial.',   'https://images.unsplash.com/photo-1551958219-acbc595d5646');
END $$;
