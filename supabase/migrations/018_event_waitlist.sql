-- Lista de espera para eventos completos.
-- Un usuario puede estar en lista de espera de un evento lleno.
-- Cuando alguien cancela su participación, el primero de la lista pasa automáticamente.

CREATE TABLE IF NOT EXISTS event_waitlist (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES events(id)   ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- El usuario puede gestionar sus propias entradas
CREATE POLICY "waitlist_own" ON event_waitlist
  FOR ALL USING (auth.uid() = user_id);

-- Cualquier usuario autenticado puede leer la lista (para calcular posición)
CREATE POLICY "waitlist_read" ON event_waitlist
  FOR SELECT USING (auth.role() = 'authenticated');
