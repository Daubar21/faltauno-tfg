-- Añade nombre de usuario único a la tabla profiles y rellena los usuarios existentes

-- 1. Añadir columna sin restricción UNIQUE todavía (para poder hacer el backfill antes)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Rellenar usuarios existentes con un username basado en su display_name:
--    - se pasa a minúsculas
--    - los caracteres no permitidos se sustituyen por _
--    - se recorta a 30 caracteres
UPDATE profiles
SET username = lower(
  substring(
    regexp_replace(
      COALESCE(display_name, split_part(id::text, '-', 1)),
      '[^a-zA-Z0-9_\-.]', '_', 'g'
    ),
    1, 30
  )
)
WHERE username IS NULL;

-- 3. Resolver duplicados añadiendo _2, _3… a los que colisionen
WITH duplicates AS (
  SELECT
    id,
    username,
    ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) AS rn
  FROM profiles
  WHERE username IS NOT NULL
)
UPDATE profiles p
SET username = d.username || '_' || d.rn
FROM duplicates d
WHERE p.id = d.id AND d.rn > 1;

-- 4. Añadir restricción UNIQUE solo si no existe ya
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_username_key' AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- 5. Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 6. Actualizar el trigger para que los nuevos registros guarden el username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
