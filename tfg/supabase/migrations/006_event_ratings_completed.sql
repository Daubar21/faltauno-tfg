-- Migration 006: Event ratings and completed events tracking

CREATE TABLE IF NOT EXISTS event_ratings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id     UUID        NOT NULL REFERENCES events(id)     ON DELETE CASCADE,
  rating       INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE event_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ratings"
  ON event_ratings FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_event_ratings_user  ON event_ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_event_ratings_event ON event_ratings (event_id);
