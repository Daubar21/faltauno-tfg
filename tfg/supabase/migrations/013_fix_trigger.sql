-- Reparación del trigger handle_new_user.
-- Maneja conflictos de id y de username para no bloquear el registro.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := NEW.raw_user_meta_data->>'username';

  -- Si el username ya está en uso (perfil huérfano de un intento anterior),
  -- no lo asignamos: el usuario podrá cambiarlo desde su perfil.
  IF v_username IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles WHERE username = v_username
  ) THEN
    v_username := NULL;
  END IF;

  INSERT INTO profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    v_username
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
