-- Esquema principal: tablas sports, profiles, events, event_participants
-- Esquema principal: tablas sports, profiles, events, event_participants
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
  ('Futbol 7',    'FaFutbol',         4.00),
  ('Padel',       'FaTableTennis',    8.00),
  ('Baloncesto',  'FaBasketball',     3.00),
  ('Running',     'FaRunning',        0.00),
  ('Voley Playa', 'FaVolleyball',     2.00),
  ('Futbol Sala', 'FaFutbol',         3.50),
  ('Futbol 11',   'FaFutbol',         5.00),
  ('Tenis',       'GiTennisRacket',   6.00),
  ('Natacion',    'FaSwimmer',        4.00),
  ('Ciclismo',    'FaBicycle',        1.00),
  ('Golf',        'FaGolfBall',      10.00);


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
  max_days             INTEGER DEFAULT 30,
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
-- ~70 eventos repartidos por toda España (ver migration 009)
-- ============================================================
DO $$
DECLARE
  v_futbol7   INTEGER;
  v_futsal    INTEGER;
  v_futbol11  INTEGER;
  v_padel     INTEGER;
  v_tenis     INTEGER;
  v_basket    INTEGER;
  v_running   INTEGER;
  v_voley     INTEGER;
  v_natacion  INTEGER;
  v_ciclismo  INTEGER;
  v_golf      INTEGER;
BEGIN
  SELECT id INTO v_futbol7   FROM sports WHERE name = 'Futbol 7';
  SELECT id INTO v_futsal    FROM sports WHERE name = 'Futbol Sala';
  SELECT id INTO v_futbol11  FROM sports WHERE name = 'Futbol 11';
  SELECT id INTO v_padel     FROM sports WHERE name = 'Padel';
  SELECT id INTO v_tenis     FROM sports WHERE name = 'Tenis';
  SELECT id INTO v_basket    FROM sports WHERE name = 'Baloncesto';
  SELECT id INTO v_running   FROM sports WHERE name = 'Running';
  SELECT id INTO v_voley     FROM sports WHERE name = 'Voley Playa';
  SELECT id INTO v_natacion  FROM sports WHERE name = 'Natacion';
  SELECT id INTO v_ciclismo  FROM sports WHERE name = 'Ciclismo';
  SELECT id INTO v_golf      FROM sports WHERE name = 'Golf';

  INSERT INTO events
    (sport_id, title, event_date, event_time, city, address, lat, lng,
     level, min_age, max_age, gender, total_places, current_participants, status, directions, image_url)
  VALUES

  -- ── FÚTBOL 7 ────────────────────────────────────────────────────────────────
  (v_futbol7,
   'Fútbol 7 Aficionados Tarde',
   CURRENT_DATE + 3, '18:30', 'Madrid', 'Campo Municipal Vicálvaro, Av. de Arcentales',
   40.3970, -3.6100, 'Principiante', 18, 55, 'Mixto', 14, 0, 'open',
   'Hierba artificial, vestuarios disponibles. Buen ambiente sin presión.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7,
   'Partido 7v7 Nivel Medio',
   CURRENT_DATE + 8, '20:30', 'Madrid', 'Ciudad Deportiva La Almudena, Av. de Entrevías',
   40.4050, -3.6350, 'Intermedio', 20, 40, 'Masculino', 14, 0, 'open',
   'Aparcamiento gratuito junto al campo. Traer equipación oscura.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  (v_futbol7,
   'Fútbol 7 Competitivo Noche',
   CURRENT_DATE + 15, '21:00', 'Madrid', 'C. de Bravo Murillo 200, Tetuán',
   40.4530, -3.7020, 'Avanzado', 20, 38, 'Masculino', 14, 0, 'open',
   'Iluminación LED, pista cubierta. Nivel exigente, se juega en serio.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  -- ── FÚTBOL SALA ─────────────────────────────────────────────────────────────
  (v_futsal,
   'Futsal Mixto Principiantes',
   CURRENT_DATE + 5, '19:00', 'Madrid', 'Centro Deportivo Moscardó, C. de Moscardó',
   40.4010, -3.7010, 'Principiante', 16, 60, 'Mixto', 10, 0, 'open',
   'Pista cubierta climatizada. Nadie se queda fuera, ritmo tranquilo.',
   'https://images.unsplash.com/photo-1587384474964-3a06ce1ce699?auto=format&fit=crop&w=700&q=75'),

  (v_futsal,
   'Fútbol Sala Mixto Lunes',
   CURRENT_DATE + 10, '21:00', 'Madrid', 'Polideportivo La Elipa, Av. de la Paz',
   40.4280, -3.6420, 'Intermedio', 18, 45, 'Mixto', 10, 0, 'open',
   'Pista interior con vestuarios. Se juega todas las semanas.',
   'https://images.unsplash.com/photo-1630420598913-44208d36f9af?auto=format&fit=crop&w=700&q=75'),

  (v_futsal,
   'Futsal Liga Avanzado',
   CURRENT_DATE + 19, '20:30', 'Madrid', 'Pabellón Municipal Vallecas, Av. de la Albufera',
   40.3800, -3.6640, 'Avanzado', 20, 38, 'Masculino', 10, 0, 'open',
   'Competición oficial. Traer equipación y zapatillas de sala.',
   'https://images.unsplash.com/photo-1676444920926-c8a084ec4003?auto=format&fit=crop&w=700&q=75'),

  -- ── FÚTBOL 11 ───────────────────────────────────────────────────────────────
  (v_futbol11,
   'Fútbol 11 Amateur Domingo',
   CURRENT_DATE + 7, '10:00', 'Madrid', 'Ciudad Universitaria, Av. Complutense s/n',
   40.4440, -3.7290, 'Principiante', 18, 55, 'Mixto', 22, 0, 'open',
   'Césped natural. Buen rollo, sin presión. Concentración 30 min antes.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11,
   'Partido Fútbol 11 Sábado',
   CURRENT_DATE + 14, '11:00', 'Madrid', 'Campo de Carabanchel, Av. de Oporto 60',
   40.3850, -3.7420, 'Intermedio', 20, 45, 'Masculino', 22, 0, 'open',
   'Árbitro incluido. Traer equipación de color claro u oscuro según equipo.',
   'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=700&q=75'),

  (v_futbol11,
   'Fútbol 11 Competición',
   CURRENT_DATE + 21, '10:30', 'Madrid', 'Campo San Blas, C. de Arcos de Jalón',
   40.4200, -3.6200, 'Avanzado', 22, 40, 'Masculino', 22, 0, 'open',
   'Liga local. Imprescindible ser constante y comprometido con el equipo.',
   'https://plus.unsplash.com/premium_photo-1661826732309-af9cab19a951?auto=format&fit=crop&w=700&q=75'),

  -- ── PÁDEL ───────────────────────────────────────────────────────────────────
  (v_padel,
   'Pádel Iniciación Mañana',
   CURRENT_DATE + 2, '10:00', 'Madrid', 'Club Top Pádel 20, Av. de Burgos',
   40.4850, -3.6650, 'Principiante', 16, 60, 'Mixto', 4, 0, 'open',
   'Monitor disponible. Raquetas prestadas si lo necesitas. Duchas incluidas.',
   'https://images.unsplash.com/photo-1613870930431-a09c7139eb33?auto=format&fit=crop&w=700&q=75'),

  (v_padel,
   'Pádel Femenino Tarde',
   CURRENT_DATE + 9, '19:00', 'Madrid', 'Club de Pádel Arturo Soria, C. de Arturo Soria',
   40.4600, -3.6720, 'Intermedio', 22, 50, 'Femenino', 4, 0, 'open',
   'Pistas cubiertas con luz artificial. Club con bar y vestuarios.',
   'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?auto=format&fit=crop&w=700&q=75'),

  (v_padel,
   'Pádel Avanzado Competición',
   CURRENT_DATE + 16, '20:00', 'Madrid', 'Pádel Indoor Moncloa, C. del Pintor Murillo',
   40.4360, -3.7180, 'Avanzado', 25, 45, 'Masculino', 4, 0, 'open',
   'Nivel alto exigido. Traer raqueta propia. Partido muy competitivo.',
   'https://images.unsplash.com/photo-1646649853703-7645147474ba?auto=format&fit=crop&w=700&q=75'),

  -- ── TENIS ───────────────────────────────────────────────────────────────────
  (v_tenis,
   'Tenis para Principiantes',
   CURRENT_DATE + 4, '10:00', 'Madrid', 'Club de Tenis El Olivar, C. de Valdebernardo',
   40.4050, -3.6380, 'Principiante', 16, 65, 'Mixto', 2, 0, 'open',
   'Profesor disponible. Raquetas prestadas si lo necesitas. Ideal para empezar.',
   'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=700&q=75'),

  (v_tenis,
   'Tenis Dobles Femenino',
   CURRENT_DATE + 12, '11:00', 'Madrid', 'Real Club de Tenis La Moraleja, Av. de Europa',
   40.4900, -3.6380, 'Intermedio', 20, 50, 'Femenino', 4, 0, 'open',
   'Pistas de tierra batida. Ambiente relajado. Se juega a dobles.',
   'https://images.unsplash.com/flagged/photo-1576972405668-2d020a01cbfa?auto=format&fit=crop&w=700&q=75'),

  (v_tenis,
   'Tenis Avanzado Tarde',
   CURRENT_DATE + 20, '18:00', 'Madrid', 'Parque Deportivo Puerta de Hierro',
   40.4550, -3.7420, 'Avanzado', 22, 45, 'Masculino', 2, 0, 'open',
   'Pistas de hierba. Competición amistosa con jugadores de nivel alto.',
   'https://images.unsplash.com/photo-1516742720271-6ae39cbc5bd1?auto=format&fit=crop&w=700&q=75'),

  -- ── BALONCESTO ──────────────────────────────────────────────────────────────
  (v_basket,
   'Basket 3x3 Fin de Semana',
   CURRENT_DATE + 3, '11:00', 'Madrid', 'Parque del Retiro, Pista exterior entrada Alcalá',
   40.4153, -3.6843, 'Principiante', 16, 40, 'Mixto', 6, 0, 'open',
   'Pista al aire libre. Ambiente muy familiar, todos los niveles bienvenidos.',
   'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=700&q=75'),

  (v_basket,
   'Baloncesto 5x5 Femenino',
   CURRENT_DATE + 9, '19:00', 'Madrid', 'Polideportivo Moscardó, C. de Moscardó',
   40.4010, -3.7010, 'Intermedio', 18, 40, 'Femenino', 10, 0, 'open',
   'Pista cubierta climatizada. Buen nivel y gran ambiente.',
   'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&w=700&q=75'),

  (v_basket,
   'Basket Liga Avanzado',
   CURRENT_DATE + 16, '20:00', 'Madrid', 'Polideportivo Hortaleza, C. de Silvano',
   40.4720, -3.6400, 'Avanzado', 20, 40, 'Masculino', 10, 0, 'open',
   'Punto de clasificación para la liga local. Traer zapatillas de pista.',
   'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=700&q=75'),

  -- ── RUNNING ─────────────────────────────────────────────────────────────────
  (v_running,
   'Running Matutino Retiro',
   CURRENT_DATE + 2, '08:00', 'Madrid', 'Parque del Retiro, entrada Alcalá',
   40.4153, -3.6843, 'Principiante', 16, 60, 'Mixto', 20, 0, 'open',
   'Quedada en la fuente de la entrada Alcalá. Ritmo suave, todos bienvenidos.',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=75'),

  (v_running,
   'Carrera 10K Popular',
   CURRENT_DATE + 9, '08:30', 'Madrid', 'Paseo de la Castellana frente al Bernabéu',
   40.4530, -3.6920, 'Intermedio', 18, 55, 'Mixto', 30, 0, 'open',
   'Salida puntual. Ritmo objetivo 5:30 min/km. Llevar hidratación.',
   'https://images.unsplash.com/photo-1590333748338-d629e4564ad9?auto=format&fit=crop&w=700&q=75'),

  (v_running,
   'Ruta Nocturna Casa de Campo',
   CURRENT_DATE + 17, '21:00', 'Madrid', 'Casa de Campo, Aparcamiento Los Pinos',
   40.4100, -3.7450, 'Avanzado', 20, 45, 'Masculino', 15, 0, 'open',
   'Ruta de 12 km. Llevar linterna frontal obligatoria. Ritmo rápido.',
   'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=700&q=75'),

  -- ── VÓLEY PLAYA ─────────────────────────────────────────────────────────────
  (v_voley,
   'Vóley Playa Recreativo',
   CURRENT_DATE + 5, '17:00', 'Madrid', 'Arena Madrid, C. del Príncipe de Vergara 2',
   40.4320, -3.6780, 'Principiante', 18, 55, 'Mixto', 8, 0, 'open',
   'Arena sintética de calidad. Trae tu botella de agua. Monitor disponible.',
   'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=700&q=75'),

  (v_voley,
   'Vóley Playa Femenino Tarde',
   CURRENT_DATE + 11, '18:00', 'Madrid', 'Polideportivo Mar de Cristal, C. de Mateo Inurria',
   40.4750, -3.6200, 'Intermedio', 20, 45, 'Femenino', 8, 0, 'open',
   'Arena sintética premium. Vestuarios modernos. Ambiente muy chulo.',
   'https://plus.unsplash.com/premium_photo-1708696216326-0317bac37b82?auto=format&fit=crop&w=700&q=75'),

  (v_voley,
   'Torneo Vóley 4v4',
   CURRENT_DATE + 22, '16:00', 'Madrid', 'Playa de Madrid, Casa de Campo',
   40.4100, -3.7450, 'Avanzado', 20, 45, 'Mixto', 16, 0, 'open',
   'Formato torneo. Traer equipo de 4. Árbitro incluido. ¡A competir!',
   'https://images.unsplash.com/photo-1553005746-9245ba190489?auto=format&fit=crop&w=700&q=75'),

  -- ── NATACIÓN ────────────────────────────────────────────────────────────────
  (v_natacion,
   'Natación Principiantes Mañana',
   CURRENT_DATE + 2, '07:00', 'Madrid', 'Piscina Municipal La Latina, C. de la Paloma',
   40.4050, -3.7150, 'Principiante', 16, 65, 'Mixto', 15, 0, 'open',
   'Carril lento disponible. Traer gorro y gafas. Ambiente muy acogedor.',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=700&q=75'),

  (v_natacion,
   'Natación Femenino Intermedias',
   CURRENT_DATE + 10, '07:30', 'Madrid', 'Piscina Olímpica Vallehermoso, C. de Martín de los Heros',
   40.4380, -3.7200, 'Intermedio', 18, 55, 'Femenino', 12, 0, 'open',
   'Carril exclusivo para el grupo. Mínimo 1 km por sesión esperado.',
   'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=700&q=75'),

  (v_natacion,
   'Entrenamiento Natación Avanzado',
   CURRENT_DATE + 18, '07:00', 'Madrid', 'Piscina Municipal Chamartín, C. de Bolivia',
   40.4650, -3.6810, 'Avanzado', 18, 45, 'Masculino', 10, 0, 'open',
   'Entrenamiento técnico con series. Mínimo 2 km de fondo por sesión.',
   'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=700&q=75'),

  -- ── CICLISMO ────────────────────────────────────────────────────────────────
  (v_ciclismo,
   'Ruta Ciclista Principiantes',
   CURRENT_DATE + 4, '08:00', 'Madrid', 'Casa de Campo, Aparcamiento Los Pinos',
   40.4100, -3.7450, 'Principiante', 16, 65, 'Mixto', 20, 0, 'open',
   'Ruta de 25 km por carril bici. Ritmo suave, nadie se queda atrás.',
   'https://images.unsplash.com/photo-1681295692638-97ace05f56b4?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo,
   'Ruta MTB Intermedia',
   CURRENT_DATE + 13, '09:00', 'Madrid', 'Bosque de El Pardo, entrada principal',
   40.5050, -3.7500, 'Intermedio', 20, 50, 'Masculino', 15, 0, 'open',
   'MTB por senderos del Pardo. Bicicleta de montaña obligatoria.',
   'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=700&q=75'),

  (v_ciclismo,
   'Ruta Cicloturista de Montaña',
   CURRENT_DATE + 22, '07:30', 'Madrid', 'Salida: Puerto de Navacerrada',
   40.7800, -4.0100, 'Avanzado', 22, 50, 'Mixto', 12, 0, 'open',
   '80 km con 1.200 m de desnivel. Bicicleta de carretera imprescindible.',
   'https://images.unsplash.com/photo-1631276893368-554b60393efb?auto=format&fit=crop&w=700&q=75'),

  -- ── GOLF ────────────────────────────────────────────────────────────────────
  (v_golf,
   'Golf Iniciación con Monitor',
   CURRENT_DATE + 6, '09:00', 'Madrid', 'Club de Golf La Herrería, El Escorial',
   40.5900, -4.1400, 'Principiante', 18, 70, 'Mixto', 4, 0, 'open',
   'Incluye alquiler de palos y bola. Instructor presente todo el tiempo.',
   'https://plus.unsplash.com/premium_photo-1679710943658-1565004c00ac?auto=format&fit=crop&w=700&q=75'),

  (v_golf,
   'Golf Intermedio 9 Hoyos',
   CURRENT_DATE + 15, '10:00', 'Madrid', 'Real Club de Golf La Moraleja, Alcobendas',
   40.4900, -3.6380, 'Intermedio', 25, 65, 'Masculino', 4, 0, 'open',
   'Campo de 18 hoyos, jugamos los primeros 9. Hándicap mínimo 36.',
   'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=700&q=75'),

  (v_golf,
   'Torneo Golf Friendly Stableford',
   CURRENT_DATE + 26, '09:30', 'Madrid', 'Club de Golf Retamares, Alcorcón',
   40.3600, -3.8250, 'Avanzado', 25, 65, 'Mixto', 8, 0, 'open',
   'Torneo Stableford. Hándicap máximo 28. Premiamos los 3 primeros.',
   'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=700&q=75');

END $$;
