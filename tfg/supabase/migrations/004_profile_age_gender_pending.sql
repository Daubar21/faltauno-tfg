-- Migration 004: gender column, pending event status, wider distance range

-- 1. Add gender to profiles (age already exists from schema.sql)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IS NULL OR gender IN ('Masculino', 'Femenino', 'No especificado'));

-- 2. Allow 'pending' as a valid event status.
--    Drop any existing CHECK on events.status (auto-named by Postgres), then recreate it.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'events'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE events DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END
$$;

ALTER TABLE events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('open', 'full', 'cancelled', 'pending'));

-- 3. Widen max_distance_km to allow up to 100 (was 30).
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'user_preferences'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%max_distance_km%'
  LOOP
    EXECUTE 'ALTER TABLE user_preferences DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END
$$;

ALTER TABLE user_preferences
  ADD CONSTRAINT user_preferences_max_distance_km_check
  CHECK (max_distance_km >= 1 AND max_distance_km <= 100);
