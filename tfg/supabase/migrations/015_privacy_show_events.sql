-- Añade opción de privacidad para que el usuario controle si sus amigos
-- pueden ver a qué eventos está apuntado.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS show_events_to_friends BOOLEAN NOT NULL DEFAULT true;
